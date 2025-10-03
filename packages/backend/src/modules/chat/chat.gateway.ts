import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  MessageBody, 
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { WsJwtGuard } from '@/common/guards/ws-jwt.guard';
import { UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: 'chat',
})
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track connected users
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake
      const token = this.getTokenFromSocket(client);
      if (!token) {
        client.disconnect();
        return;
      }

      // Verify token and get user
      const payload = this.jwtService.verify(token);
      if (!payload?.sub) {
        client.disconnect();
        return;
      }

      // Store user connection
      this.connectedUsers.set(payload.sub, client.id);
      client.join(`user_${payload.sub}`);
      
      // Notify user is online
      this.server.emit('userStatus', {
        userId: payload.sub,
        isOnline: true,
      });

      // Load unread messages
      const unreadCount = await this.chatService.getUnreadCount(payload.sub);
      if (unreadCount > 0) {
        client.emit('unreadMessages', { count: unreadCount });
      }

    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Remove user from connected users
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        // Notify user is offline
        this.server.emit('userStatus', {
          userId,
          isOnline: false,
        });
        break;
      }
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { content: string; ticketId?: string; recipientId?: string },
  ) {
    try {
      const userId = this.getUserIdFromSocket(client);
      if (!userId) return { error: 'Unauthorized' };

      const { content, ticketId, recipientId } = data;
      
      if (!content?.trim()) {
        return { error: 'Message content is required' };
      }

      // Save message to database
      const message = await this.chatService.createMessage({
        content: content.trim(),
        senderId: userId,
        ticketId,
        recipientId,
      });

      // Determine the room to emit to
      const room = ticketId ? `ticket_${ticketId}` : `user_${recipientId}`;
      
      // Emit to the specific room (ticket or direct message)
      this.server.to(room).emit('newMessage', message);
      
      // If it's a direct message, also emit to the sender
      if (recipientId) {
        const senderRoom = `user_${userId}`;
        this.server.to(senderRoom).emit('newMessage', message);
      }

      return { success: true, message };
      const message = await this.chatService.createMessage({
        content,
        senderId: userId,
        ticketId,
        recipientId,
      });

      // Determine recipients
      const recipients = new Set<string>();
      
      if (ticketId) {
        // If it's a support ticket, notify assigned agents
        const ticket = await this.chatService.getTicket(ticketId);
        if (ticket) {
          if (ticket.assignedTo) recipients.add(ticket.assignedTo);
          if (ticket.userId !== userId) recipients.add(ticket.userId);
        }
      } else if (recipientId) {
        // Direct message
        recipients.add(recipientId);
      }

      // Send message to recipients
      recipients.forEach(recipientId => {
        const recipientSocketId = this.connectedUsers.get(recipientId);
        if (recipientSocketId) {
          this.server.to(recipientSocketId).emit('newMessage', message);
        }
      });

      return { success: true, message };
    } catch (error) {
      console.error('Error handling message:', error);
      return { error: 'Failed to send message' };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { isTyping: boolean; ticketId?: string; recipientId?: string },
  ) {
    const userId = this.getUserIdFromSocket(client);
    if (!userId) return;

    const { isTyping, ticketId, recipientId } = data;
    const recipients = new Set<string>();

    if (ticketId) {
      // Notify support agents about typing in ticket
      this.server.emit('userTyping', { 
        userId, 
        isTyping, 
        ticketId 
      });
    } else if (recipientId) {
      // Notify specific user in direct message
      const recipientSocketId = this.connectedUsers.get(recipientId);
      if (recipientSocketId) {
        this.server.to(recipientSocketId).emit('userTyping', { 
          userId, 
          isTyping,
          isDirectMessage: true
        });
      }
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageIds: string[] },
  ) {
    const userId = this.getUserIdFromSocket(client);
    if (!userId) return { error: 'Unauthorized' };

    await this.chatService.markMessagesAsRead(data.messageIds, userId);
    return { success: true };
  }

  private getTokenFromSocket(client: Socket): string | null {
    const token = client.handshake.auth?.token || 
                 client.handshake.headers.authorization?.split(' ')[1];
    return token || null;
  }

  private getUserIdFromSocket(client: Socket): string | null {
    try {
      const token = this.getTokenFromSocket(client);
      if (!token) return null;
      const payload = this.jwtService.verify(token);
      return payload?.sub || null;
    } catch (error) {
      return null;
    }
  }
}
