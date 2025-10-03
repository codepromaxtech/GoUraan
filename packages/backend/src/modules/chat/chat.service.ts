import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Prisma, ChatMessage, SupportTicket } from '@prisma/client';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private prisma: PrismaService) {}

  async createMessage(data: {
    content: string;
    senderId: string;
    ticketId?: string;
    recipientId?: string;
  }) {
    const { content, senderId, ticketId, recipientId } = data;

    return this.prisma.chatMessage.create({
      data: {
        content,
        sender: { connect: { id: senderId } },
        ticket: ticketId ? { connect: { id: ticketId } } : undefined,
        recipient: recipientId ? { connect: { id: recipientId } } : undefined,
        read: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getMessagesByTicket(ticketId: string, userId: string) {
    // Verify user has access to this ticket
    const hasAccess = await this.prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        OR: [
          { userId },
          { assignedTo: userId },
        ],
      },
    });

    if (!hasAccess) {
      throw new Error('Access denied to this ticket');
    }

    // Mark messages as read
    await this.prisma.chatMessage.updateMany({
      where: {
        ticketId,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });

    // Return messages
    return this.prisma.chatMessage.findMany({
      where: { ticketId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getDirectMessages(userId: string, otherUserId: string) {
    return this.prisma.chatMessage.findMany({
      where: {
        OR: [
          {
            senderId: userId,
            recipientId: otherUserId,
          },
          {
            senderId: otherUserId,
            recipientId: userId,
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.chatMessage.count({
      where: {
        OR: [
          { recipientId: userId, read: false },
          {
            ticket: {
              OR: [
                { userId, assignedTo: { not: null } },
                { assignedTo: userId },
              ],
            },
            read: false,
            senderId: { not: userId },
          },
        ],
      },
    });
  }

  async markMessagesAsRead(messageIds: string[], userId: string) {
    return this.prisma.chatMessage.updateMany({
      where: {
        id: { in: messageIds },
        recipientId: userId,
        read: false,
      },
      data: { read: true },
    });
  }

  async getTicket(ticketId: string): Promise<SupportTicket | null> {
    return this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
  }

  async getConversationHistory(userId: string, limit = 20, cursor?: string) {
    const where: Prisma.ChatMessageWhereInput = {
      OR: [
        { senderId: userId },
        { recipientId: userId },
        {
          ticket: {
            OR: [
              { userId },
              { assignedTo: userId },
            ],
          },
        },
      ],
    };

    if (cursor) {
      where.createdAt = { lt: new Date(cursor) };
    }

    const messages = await this.prisma.chatMessage.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        ticket: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // Get one extra to determine if there are more
    });

    let nextCursor: string | undefined;
    if (messages.length > limit) {
      const nextItem = messages.pop();
      nextCursor = nextItem?.createdAt.toISOString();
    }

    return {
      messages: messages.reverse(), // Return in chronological order
      nextCursor,
    };
  }
}
