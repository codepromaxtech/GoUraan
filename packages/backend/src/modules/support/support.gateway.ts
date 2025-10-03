import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsJwtGuard } from '@/common/guards/ws-jwt.guard';
import { SupportService } from './support.service';

@WebSocketGateway({
  namespace: 'support',
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
})
export class SupportGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(SupportGateway.name);
  private readonly activeConnections = new Map<string, string>(); // userId -> socketId
  private readonly userRooms = new Map<string, Set<string>>(); // userId -> Set<roomIds>

  constructor(
    private readonly supportService: SupportService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Support WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.getTokenFromSocket(client);
      if (!token) {
        client.disconnect(true);
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const userId = payload.sub;
      this.activeConnections.set(userId, client.id);
      
      // Join user to their personal room
      client.join(`user_${userId}`);
      
      // If user is an agent, join the support agents room
      if (payload.roles?.includes('SUPPORT_AGENT') || payload.roles?.includes('ADMIN')) {
        client.join('support_agents');
      }

      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
    } catch (error) {
      this.logger.error('WebSocket connection error:', error);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    // Find and remove the disconnected client
    for (const [userId, socketId] of this.activeConnections.entries()) {
      if (socketId === client.id) {
        this.activeConnections.delete(userId);
        this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
        break;
      }
    }
  }

  private getTokenFromSocket(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }
    return null;
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinTicketRoom')
  async handleJoinTicketRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string },
  ) {
    const roomName = `ticket_${data.ticketId}`;
    client.join(roomName);
    
    // Track which rooms the user is in
    const userId = this.getUserIdFromSocket(client);
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId).add(roomName);
    
    this.logger.log(`User ${userId} joined room ${roomName}`);
    return { success: true, room: roomName };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leaveTicketRoom')
  async handleLeaveTicketRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string },
  ) {
    const roomName = `ticket_${data.ticketId}`;
    client.leave(roomName);
    
    // Update room tracking
    const userId = this.getUserIdFromSocket(client);
    if (this.userRooms.has(userId)) {
      this.userRooms.get(userId).delete(roomName);
    }
    
    this.logger.log(`User ${userId} left room ${roomName}`);
    return { success: true };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string; message: string; },
  ) {
    try {
      const userId = this.getUserIdFromSocket(client);
      const roomName = `ticket_${data.ticketId}`;
      
      // Save message to database
      const message = await this.supportService.addMessageToTicket(
        data.ticketId,
        userId,
        data.message,
        [], // attachments would be handled separately
      );
      
      // Broadcast to all clients in the room
      this.server.to(roomName).emit('newMessage', {
        ...message,
        isCurrentUser: false,
      });
      
      // Notify support agents if the sender is a customer
      const isAgent = this.isUserAgent(client);
      if (!isAgent) {
        this.server.to('support_agents').emit('ticketUpdated', {
          ticketId: data.ticketId,
          hasNewMessage: true,
          lastMessage: {
            content: data.message,
            timestamp: new Date(),
            senderId: userId,
          },
        });
      }
      
      return { success: true, message };
    } catch (error) {
      this.logger.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper methods
  private getUserIdFromSocket(client: Socket): string {
    const token = this.getTokenFromSocket(client);
    if (!token) return null;
    
    const payload = this.jwtService.decode(token);
    return payload?.sub;
  }
  
  private isUserAgent(client: Socket): boolean {
    const token = this.getTokenFromSocket(client);
    if (!token) return false;
    
    const payload = this.jwtService.decode(token);
    return payload?.roles?.includes('SUPPORT_AGENT') || payload?.roles?.includes('ADMIN');
  }
  
  // Method to notify specific user
  public notifyUser(userId: string, event: string, data: any) {
    const socketId = this.activeConnections.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }
  
  // Method to notify all agents
  public notifyAgents(event: string, data: any) {
    this.server.to('support_agents').emit(event, data);
  }
}
