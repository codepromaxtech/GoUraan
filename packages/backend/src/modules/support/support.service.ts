import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  InternalServerErrorException,
  Logger,
  Inject,
  forwardRef
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { SupportTicketEntity } from './entities/support-ticket.entity';
import { 
  UserRole,
  Prisma,
  User,
  SupportTicket as PrismaSupportTicket,
  SupportTicketMessage as PrismaSupportTicketMessage,
  SupportTicketStatus
} from '@prisma/client';
import { EmailService } from '@/modules/email/email.service';
import { ConfigService } from '@nestjs/config';
import { SupportGateway } from './support.gateway';

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SupportMessage extends Omit<PrismaSupportTicketMessage, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
  sender?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'avatar'>;
}

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => SupportGateway))
    private readonly supportGateway: SupportGateway,
    private readonly configService: ConfigService
  ) {}

  /**
   * Validate that a booking exists and belongs to the user
   */
  private async validateBookingExists(bookingId: string, userId: string): Promise<void> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId, userId },
    });
    
    if (!booking) {
      throw new NotFoundException('Booking not found or does not belong to user');
    }
  }

  /**
   * Notify user about ticket updates via email
   */
  async notifyUserByEmail(
    ticketId: string,
    notificationType: 'status_change' | 'agent_response' | 'ticket_created',
    additionalContext: Record<string, any> = {}
  ): Promise<void> {
    if (!this.emailService) {
      this.logger.warn('Email service not available, skipping email notification');
      return;
    }

    try {
      const ticket = await this.prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: { 
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          },
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
      });

      if (!ticket || !ticket.user) {
        this.logger.warn(`Ticket ${ticketId} or user not found`);
        return;
      }

      const templateData = {
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        userName: `${user.firstName} ${user.lastName}`.trim(),
        ticketStatus: ticket.status,
      };

      let subject: string;
      let template: string;

      switch (notificationType) {
        case 'status_change':
          subject = `Your support ticket #${ticket.id} status has been updated`;
          template = 'ticket-status-update';
          break;
        case 'agent_response':
          subject = `New response on your support ticket #${ticket.id}`;
          template = 'ticket-agent-response';
          break;
        case 'ticket_created':
          subject = `Your support ticket #${ticket.id} has been received`;
          template = 'ticket-created';
          break;
        default:
          this.logger.warn(`Unknown notification type: ${notificationType}`);
          return;
      }

      await this.emailService.sendEmail({
        to: user.email,
        subject,
        template,
        context: templateData,
      });

      this.logger.log(`Sent ${notificationType} email for ticket ${ticket.id} to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send ${notificationType} email for ticket ${ticketId}:`, error);
    }
  }

  /**
   * Create a new support ticket
   */
  async createTicket(
    createSupportTicketDto: CreateSupportTicketDto,
    userId: string,
    attachments: string[] = [],
    metadata: Record<string, any> = {}
  ): Promise<SupportTicketEntity> {
    try {
      // Find the user creating the ticket
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Create the ticket
      const ticket = await this.prisma.supportTicket.create({
        data: {
          title: createSupportTicketDto.title,
          description: createSupportTicketDto.description,
          status: 'OPEN',
          priority: createSupportTicketDto.priority || 'MEDIUM',
          category: createSupportTicketDto.category || 'GENERAL',
          userId: user.id,
          metadata: {
            ...metadata,
            attachments,
            ipAddress: metadata.ipAddress || 'unknown',
            userAgent: metadata.userAgent || 'unknown'
          }
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          }
        }
      });

      // Notify support team
      await this.notifySupportTeam(ticket);

      return ticket;
    } catch (error) {
      this.logger.error(`Error creating support ticket: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create support ticket');
    }
  }

  /**
   * Get a ticket by ID
   */
  async getTicketById(id: string, userId: string): Promise<SupportTicketEntity> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Check if user has access to this ticket
    if (ticket.userId !== userId && ticket.assignedToId !== userId) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  /**
   * Get all tickets for a user
   */
  async getUserTickets(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<PaginatedResult<SupportTicketEntity>> {
    const where: any = {
      OR: [
        { userId },
        { assignedToId: userId }
      ]
    };

    if (status) {
      where.status = status;
    }

    const [total, data] = await Promise.all([
      this.prisma.supportTicket.count({ where }),
      this.prisma.supportTicket.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          }
        }
      })
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Add a message to a ticket
   */
  async addMessage(
    ticketId: string,
    userId: string,
    content: string,
    isInternal: boolean = false
  ): Promise<SupportMessage> {
    const ticket = await this.getTicketById(ticketId, userId);

    const message = await this.prisma.supportTicketMessage.create({
      data: {
        content,
        isInternal,
        ticketId: ticket.id,
        senderId: userId
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    // Update ticket status based on who sent the message
    const newStatus = isInternal ? 'WAITING_CUSTOMER_RESPONSE' : 'WAITING_SUPPORT_RESPONSE';
    
    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: newStatus }
    });

    // Notify relevant parties
    if (isInternal) {
      await this.notifyUser(ticket, 'agent_response', { messageId: message.id });
    } else {
      await this.notifySupportTeam(ticket, 'customer_response', { messageId: message.id });
    }

    return {
      ...message,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString()
    };
  }

  /**
   * Close a ticket
   */
  async closeTicket(ticketId: string, userId: string): Promise<SupportTicketEntity> {
    const ticket = await this.getTicketById(ticketId, userId);

    if (ticket.status === 'CLOSED') {
      throw new BadRequestException('Ticket is already closed');
    }

    const updatedTicket = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'CLOSED', closedAt: new Date() },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    // Notify user that their ticket has been closed
    await this.notifyUser(ticket, 'ticket_closed');

    return updatedTicket;
  }

  /**
   * Private helper methods
   */
  private async notifySupportTeam(
    ticket: any,
    eventType: string = 'ticket_created',
    data: any = {}
  ): Promise<void> {
    try {
      if (!this.emailService) {
        this.logger.warn('Email service not available, skipping support team notification');
        return;
      }

      // Get all admin and support agent emails
      const supportTeam = await this.prisma.user.findMany({
        where: {
          role: {
            in: [UserRole.ADMIN, UserRole.SUPPORT_AGENT]
          },
          status: 'ACTIVE'
        },
        select: {
          email: true,
          firstName: true,
          lastName: true
        }
      });

      // Notify via WebSocket
      this.supportGateway.notifyAgents({
        event: eventType,
        data: {
          ticketId: ticket.id,
          title: ticket.title,
          status: ticket.status,
          priority: ticket.priority,
          ...data
        },
        recipients: agents.map(agent => agent.id)
      });

      // Send email notifications
      if (this.emailService) {
        const emailPromises = agents.map(agent =>
          this.emailService.sendEmail({
            to: agent.email,
            subject: `New Support Ticket: ${ticket.title}`,
            template: 'support-ticket-notification',
            context: {
              agentName: `${agent.firstName} ${agent.lastName}`,
              ticketTitle: ticket.title,
              ticketId: ticket.id,
              priority: ticket.priority,
              status: ticket.status,
              dashboardUrl: `${this.configService.get('FRONTEND_URL')}/support/tickets/${ticket.id}`
            }
          })
        );

        await Promise.all(emailPromises);
      }
    } catch (error) {
      this.logger.error(`Error notifying support team: ${error.message}`, error.stack);
    }
  }

  private async notifyUser(
    ticket: SupportTicketEntity,
    eventType: string,
    data: any = {}
  ): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: ticket.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      });

      if (!user) {
        return;
      }

      // Notify via WebSocket
      this.supportGateway.notifyUser(user.id, {
        event: eventType,
        data: {
          ticketId: ticket.id,
          title: ticket.title,
          status: ticket.status,
          ...data
        }
      });

      // Send email notification
      if (this.emailService) {
        await this.emailService.sendEmail({
          to: user.email,
          subject: `Update on your support ticket: ${ticket.title}`,
          template: 'support-ticket-update',
          context: {
            userName: `${user.firstName} ${user.lastName}`,
            ticketTitle: ticket.title,
            ticketId: ticket.id,
            status: ticket.status,
            dashboardUrl: `${this.configService.get('FRONTEND_URL')}/support/tickets/${ticket.id}`,
            ...data
          }
        });
      }
    } catch (error) {
      this.logger.error(`Error notifying user: ${error.message}`, error.stack);
    }
  }
}
