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
  SupportTicketMessage as PrismaSupportTicketMessage
} from '@prisma/client';
import { EmailService } from '@/modules/email/email.service';
import { ConfigService } from '@nestjs/config';
import { SupportGateway } from './support.gateway';

type SupportTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER_RESPONSE' | 
  'WAITING_SUPPORT_RESPONSE' | 'RESOLVED' | 'CLOSED' | 'REOPENED';

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
    private prisma: PrismaService,
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
          } 
        },
      });

      if (!ticket || !ticket.user?.email) {
        this.logger.warn(`No user email found for ticket ${ticketId}, skipping email`);
        return;
      }

      const emailData = {
        to: ticket.user.email,
        subject: this.getEmailSubject(template, context),
        template,
        context: {
          ...context,
          userName: context.userName || ticket.user.firstName || 'there',
          ticketId: context.ticketId || ticketId,
          ticketTitle: context.ticketTitle || ticket.title,
          ticketStatus: context.ticketStatus || this.getStatusLabel(ticket.status as SupportTicketStatus),
          ticketPriority: context.ticketPriority || this.getPriorityLabel(ticket.priority),
          ticketCategory: context.ticketCategory || ticket.category,
          supportEmail: this.configService?.get<string>('SUPPORT_EMAIL') || 'support@example.com',
          supportPhone: this.configService?.get<string>('SUPPORT_PHONE') || '+1 (555) 123-4567',
          companyName: this.configService?.get<string>('COMPANY_NAME') || 'Our Company',
        },
      };

      await this.emailService.sendEmail(emailData);
    } catch (error) {
      this.logger.error(`Failed to send email notification for ticket ${ticketId}: ${error.message}`, error.stack);
    }
  }

  /**
   * Get email subject based on template and context
   */
  private getEmailSubject(template: string, context: any): string {
    const ticketId = context.ticketId || '';
    const ticketTitle = context.ticketTitle || 'Your support ticket';
    
    switch (template) {
      case 'ticket_created':
        return `Support Ticket #${ticketId}: ${ticketTitle}`;
      case 'ticket_updated':
        return `Update on Ticket #${ticketId}: ${ticketTitle}`;
      case 'ticket_closed':
        return `Ticket #${ticketId} has been closed: ${ticketTitle}`;
      case 'ticket_assigned':
        return `You have been assigned to Ticket #${ticketId}: ${ticketTitle}`;
      case 'new_message':
        return `New message on Ticket #${ticketId}: ${ticketTitle}`;
      default:
        return `Update on your support ticket #${ticketId}`;
    }
  }

  /**
   * Get human-readable status label
   */
  private getStatusLabel(status: SupportTicketStatus): string {
    const statusLabels: Record<SupportTicketStatus, string> = {
      'OPEN': 'Open',
      'IN_PROGRESS': 'In Progress',
      'WAITING_CUSTOMER_RESPONSE': 'Waiting for your response',
      'WAITING_SUPPORT_RESPONSE': 'Waiting for support response',
      'RESOLVED': 'Resolved',
      'CLOSED': 'Closed',
      'REOPENED': 'Reopened',
    };
    return statusLabels[status] || status;
  }

  /**
   * Get human-readable priority label
   */
  private getPriorityLabel(priority: number): string {
    const priorityLabels: Record<number, string> = {
      1: 'Critical',
      2: 'High',
      3: 'Medium',
      4: 'Low',
      5: 'Lowest',
    };
    return priorityLabels[priority] || `Priority ${priority}`;
  }

  /**
   * Create a new support ticket
   */
  async createTicket(
    userId: string, 
    createSupportTicketDto: CreateSupportTicketDto
  ): Promise<SupportTicketEntity> {
    try {
      // If booking or payment ID is provided, validate they exist
      if (createSupportTicketDto.bookingId) {
        await this.validateBookingExists(createSupportTicketDto.bookingId, userId);
      }
      
      if (createSupportTicketDto.paymentId) {
        await this.validatePaymentExists(createSupportTicketDto.paymentId, userId);
      }
      
      // Create the ticket
      const ticket = await this.prisma.supportTicket.create({
        data: {
          title: createSupportTicketDto.title,
          description: createSupportTicketDto.description,
          status: 'OPEN',
          priority: createSupportTicketDto.priority || 3,
          category: createSupportTicketDto.category || 'GENERAL',
          userId: userId,
          assignedTo: null,
          tags: createSupportTicketDto.tags || [],
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
      });

      // Map to SupportTicketEntity
      const ticketEntity: SupportTicketEntity = {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status as SupportTicketStatus,
        priority: ticket.priority,
        category: ticket.category,
        userId: ticket.userId,
        assignedTo: ticket.assignedTo,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        closedAt: ticket.closedAt,
      };

      // Send email notification if email service is available
      if (this.emailService) {
        try {
          await this.notifyUserByEmail(ticket.id, 'ticket_created', {
            userName: ticket.user?.firstName || 'there',
            ticketId: ticket.id,
            ticketTitle: ticket.title,
            ticketStatus: ticket.status,
            ticketPriority: ticket.priority,
            ticketCategory: ticket.category,
            ticketDescription: ticket.description,
            ticketCreatedAt: ticket.createdAt.toISOString(),
            supportEmail: this.configService?.get<string>('SUPPORT_EMAIL') || 'support@example.com',
            supportPhone: this.configService?.get<string>('SUPPORT_PHONE') || '+1 (555) 123-4567',
            companyName: this.configService?.get<string>('COMPANY_NAME') || 'Our Company',
          });
        } catch (emailError) {
          this.logger.error('Failed to send notification email', emailError);
        }
      }

      return ticketEntity;
    } catch (error) {
      this.logger.error(`Error creating support ticket: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create support ticket');
  }
  /**
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!ticket) {
        throw new NotFoundException(`Support ticket with ID ${id} not found`);
      }

      // Only the ticket owner, assigned agent, or admin can view the ticket
      if (userId && ticket.userId !== userId && 
          ticket.assignedToId !== userId && 
          !(await this.isAdmin(userId))) {
        throw new BadRequestException('You are not authorized to view this ticket');
      }

      return new SupportTicketEntity(ticket);
    } catch (error) {
      this.handleError(error, `Failed to retrieve support ticket ${id}`);
    }
  }

  /**
   * Update a support ticket
   */
  async updateTicket(
    id: string, 
    updateSupportTicketDto: UpdateSupportTicketDto,
    userId: string,
    isAdmin: boolean = false
  ): Promise<SupportTicketEntity> {
    try {
      const ticket = await this.prisma.supportTicket.findUnique({
        where: { id },
      });

      if (!ticket) {
        throw new NotFoundException(`Support ticket with ID ${id} not found`);
      }

      // Check permissions
      if (!isAdmin && ticket.userId !== userId) {
        throw new BadRequestException('You are not authorized to update this ticket');
      }

      // If assigning to an agent, verify the agent exists
      if (updateSupportTicketDto.assignedToId) {
        await this.validateUserIsAgent(updateSupportTicketDto.assignedToId);
      }

      const updatedTicket = await this.prisma.supportTicket.update({
        where: { id },
        data: {
          ...updateSupportTicketDto,
          // Only allow status changes from admins/agents
          ...(isAdmin && updateSupportTicketDto.status && {
            status: updateSupportTicketDto.status,
            ...(updateSupportTicketDto.status === 'CLOSED' && {
              closedAt: new Date(),
              closedById: userId,
            }),
          }),
        },
      });

      this.logger.log(`Support ticket updated: ${id}`);
      return new SupportTicketEntity(updatedTicket);
    } catch (error) {
      this.handleError(error, `Failed to update support ticket ${id}`);
    }
  }

  /**
   * Add a message to a support ticket
   */
  async addMessage(
    ticketId: string,
    userId: string,
    message: string,
    attachments: string[] = []
  ): Promise<SupportTicketEntity> {
    if (!message?.trim()) {
      throw new BadRequestException('Message cannot be empty');
    }

    try {
      const ticket = await this.prisma.supportTicket.findUnique({
        where: { id: ticketId },
      });

      if (!ticket) {
        throw new NotFoundException(`Support ticket with ID ${ticketId} not found`);
      }

      // Check if user is the ticket owner, assigned agent, or admin
      const isAdmin = await this.isAdmin(userId);
      if (ticket.userId !== userId && ticket.assignedToId !== userId && !isAdmin) {
        throw new BadRequestException('You are not authorized to add messages to this ticket');
      }

      // If this is the first response from support, update the ticket status
      const isFirstResponse = ticket.status === 'OPEN' && ticket.userId !== userId;
      
      await this.prisma.supportTicketMessage.create({
        data: {
          ticketId,
          userId,
          message,
          attachments,
        },
      });

      // Update the ticket status if needed
      if (isFirstResponse) {
        await this.prisma.supportTicket.update({
          where: { id: ticketId },
          data: { status: 'IN_PROGRESS' },
        });
      }

      // Notify the other party about the new message
      await this.notifyNewMessage(ticketId, userId, message);

      return this.findTicketById(ticketId);
    } catch (error) {
      this.handleError(error, `Failed to add message to ticket ${ticketId}`);
    }
  }

  /**
   * Close a support ticket
   */
  async closeTicket(
    id: string, 
    userId: string, 
    reason?: string
  ): Promise<SupportTicketEntity> {
    try {
      const ticket = await this.prisma.supportTicket.findUnique({
        where: { id },
      });

      if (!ticket) {
        throw new NotFoundException(`Support ticket with ID ${id} not found`);
      }

      // Only the ticket owner, assigned agent, or admin can close the ticket
      const isAdmin = await this.isAdmin(userId);
      if (ticket.userId !== userId && ticket.assignedToId !== userId && !isAdmin) {
        throw new BadRequestException('You are not authorized to close this ticket');
      }

      const updatedTicket = await this.prisma.supportTicket.update({
        where: { id },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
          closedById: userId,
          closeReason: reason,
        },
      });

      this.logger.log(`Support ticket closed: ${id}`);
      return new SupportTicketEntity(updatedTicket);
    } catch (error) {
      this.handleError(error, `Failed to close support ticket ${id}`);
    }
  }

  /**
   * Rate a closed support ticket
   */
  async rateTicket(
    id: string, 
    userId: string, 
    rating: number, 
    feedback?: string
  ): Promise<SupportTicketEntity> {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    try {
      const ticket = await this.prisma.supportTicket.findUnique({
        where: { id },
      });

      if (!ticket) {
        throw new NotFoundException(`Support ticket with ID ${id} not found`);
      }

      // Only the ticket owner can rate the ticket
      if (ticket.userId !== userId) {
        throw new BadRequestException('Only the ticket owner can rate this ticket');
      }

      // Only closed tickets can be rated
      if (ticket.status !== 'CLOSED') {
        throw new BadRequestException('Only closed tickets can be rated');
      }

      // Check if already rated
      if (ticket.rating) {
        throw new BadRequestException('This ticket has already been rated');
      }

      const updatedTicket = await this.prisma.supportTicket.update({
        where: { id },
        data: {
          rating,
          feedback,
        },
      });

      this.logger.log(`Support ticket rated: ${id} (${rating} stars)`);
      return new SupportTicketEntity(updatedTicket);
    } catch (error) {
      this.handleError(error, `Failed to rate support ticket ${id}`);
    }
  }

  /**
   * Get ticket statistics
   */
  async getTicketStats(userId?: string) {
    try {
      const where = userId ? { userId } : {};
      
      const [
        total,
        open,
        inProgress,
        closed,
        highPriority,
        avgRating,
        avgResponseTime,
      ] = await Promise.all([
        // Total tickets
        this.prisma.supportTicket.count({ where }),
        
        // Open tickets
        this.prisma.supportTicket.count({ 
          where: { ...where, status: 'OPEN' } 
        }),
        
        // In progress tickets
        this.prisma.supportTicket.count({ 
          where: { ...where, status: 'IN_PROGRESS' } 
        }),
        
        // Closed tickets
        this.prisma.supportTicket.count({ 
          where: { ...where, status: 'CLOSED' } 
        }),
        
        // High priority tickets
        this.prisma.supportTicket.count({ 
          where: { 
            ...where, 
            priority: 'HIGH',
            status: { not: 'CLOSED' } 
          } 
        }),
        
        // Average rating (only for closed tickets with ratings)
        this.prisma.supportTicket.aggregate({
          where: { 
            ...where, 
            status: 'CLOSED',
            rating: { not: null } 
          },
          _avg: { rating: true },
        }),
        
        // TODO: Calculate average response time
        // This would require tracking when tickets are first responded to
        Promise.resolve(0),
      ]);

      return {
        total,
        open,
        inProgress,
        closed,
        highPriority,
        avgRating: avgRating._avg.rating || 0,
        avgResponseTime, // In minutes
      };
    } catch (error) {
      this.handleError(error, 'Failed to retrieve ticket statistics');
    }
  }

  /**
   * Validate that a booking exists and belongs to the user
   */
  private async validateBookingExists(bookingId: string, userId: string): Promise<void> {
    // Implementation of validateBookingExists
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId, userId },
    });
    
    if (!booking) {
      throw new NotFoundException('Booking not found or does not belong to user');
      }

      if (booking.userId !== userId) {
        throw new BadRequestException('You do not have permission to create a ticket for this booking');
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to validate booking');
    }
  }

  /**
   * Validate that a payment exists and belongs to the user
   */
  private async validatePaymentExists(paymentId: string, userId: string): Promise<void> {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new NotFoundException(`Payment with ID ${paymentId} not found`);
      }

      if (payment.userId !== userId) {
        throw new BadRequestException('You do not have permission to create a ticket for this payment');
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to validate payment');
    }
  }

  /**
   * Check if a user is an admin
   */
  private async isAdmin(userId: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      // Only ADMIN is considered an admin in the current schema
      return user?.role === UserRole.ADMIN;
    } catch (error) {
      this.logger.error(`Failed to check admin status for user ${userId}: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Validate that a user is a support agent or admin
   */
  private async validateUserIsAgent(userId: string): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { 
          role: true,
          isActive: true,
        },
      });

      if (!user) {
        throw new BadRequestException(`User with ID ${userId} not found`);
      }

      if (!user.isActive) {
        throw new BadRequestException('This user account is not active');
      }

      if (user.role !== UserRole.ADMIN && user.role !== UserRole.AGENT) {
        throw new BadRequestException('The specified user is not an agent or admin');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to validate support agent');
    }
  }

  /**
   * Notify the support team about a new ticket
   */
  private async notifySupportTeam(ticketId: string): Promise<void> {
    try {
      // In a real application, this would send a notification to the support team
      // For example, via email, Slack, or a dedicated support dashboard
      this.logger.log(`Notifying support team about new ticket: ${ticketId}`);
      
      // This is a placeholder for actual notification logic
      // await this.notificationService.create({
      //   type: 'NEW_SUPPORT_TICKET',
      //   title: 'New Support Ticket Created',
      //   message: `A new support ticket #${ticketId} has been created.`,
      //   data: { ticketId },
      //   // This would be the support team's notification channel or user IDs
      //   recipients: ['support-team']
      // });
    } catch (error) {
      // Don't fail the ticket creation if notification fails
      this.logger.error(`Failed to notify support team about ticket ${ticketId}: ${error.message}`, error.stack);
    }
  }

  /**
   * Notify about a new message in a support ticket
   */
  private async notifyNewMessage(
    ticketId: string, 
    senderId: string,
    message: string
  ): Promise<void> {
    try {
      const ticket = await this.prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
          user: { select: { id: true, email: true } },
          assignedTo: { select: { id: true, email: true } },
        },
      });

      if (!ticket) return;

      // Determine who to notify
      let recipientId: string | null = null;
      
      if (senderId === ticket.userId && ticket.assignedToId) {
        // If the ticket owner sent a message, notify the assigned agent
        recipientId = ticket.assignedToId;
      } else if (senderId !== ticket.userId) {
        // If an agent/admin sent a message, notify the ticket owner
        recipientId = ticket.userId;
      }

      if (recipientId) {
        // In a real application, this would send a notification to the recipient
        this.logger.log(`Notifying user ${recipientId} about new message in ticket ${ticketId}`);
        
        // This is a placeholder for actual notification logic
        // await this.notificationService.create({
        //   type: 'NEW_SUPPORT_MESSAGE',
        //   title: `New Message in Ticket #${ticketId}`,
        //   message: message.length > 100 ? `${message.substring(0, 100)}...` : message,
        //   data: { ticketId },
        //   recipients: [recipientId]
        // });
      }
    } catch (error) {
      // Don't fail the message creation if notification fails
      this.logger.error(
        `Failed to notify about new message in ticket ${ticketId}: ${error.message}`, 
        error.stack
      );
    }
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: any, defaultMessage: string): never {
    this.logger.error(`${defaultMessage}: ${error.message}`, error.stack);
    
    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }
    
    throw new InternalServerErrorException(defaultMessage);
  }

  /**
   * Add a message to a support ticket with WebSocket notifications
   */
  async addMessageToTicket(
    ticketId: string,
    userId: string,
    content: string,
    attachments: string[] = [],
    isInternalNote: boolean = false
  ): Promise<SupportMessage> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { user: true, assignedTo: true }
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    // Check if user has access to this ticket
    if (ticket.userId !== userId && ticket.assignedToId !== userId) {
      const isAgent = await this.isAdmin(userId) || await this.prisma.user.findFirst({
        where: { 
          id: userId,
          roles: { has: UserRole.SUPPORT_AGENT }
        }
      });
      
      if (!isAgent) {
        throw new BadRequestException('You do not have permission to add messages to this ticket');
      }
    }

    const message = await this.prisma.message.create({
      data: {
        content,
        ticketId,
        senderId: userId,
        isInternalNote,
        attachments: { set: attachments },
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Update ticket's updatedAt timestamp
    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    });

    // Notify other users in the ticket
    await this.notifyNewMessage(ticketId, userId, content);

    // If this is a customer message and ticket is not assigned, try to auto-assign
    if (!isInternalNote && !ticket.assignedToId) {
      await this.autoAssignTicket(ticketId);
    }

    return {
      ...message,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
    };
  }

  /**
   * Get messages for a specific ticket
   */
  async getTicketMessages(
    ticketId: string,
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ messages: SupportMessage[]; total: number }> {
    // Verify user has access to this ticket
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { userId: true, assignedToId: true },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    if (ticket.userId !== userId && ticket.assignedToId !== userId) {
      const isAgent = await this.isAdmin(userId) || await this.prisma.user.findFirst({
        where: { 
          id: userId,
          roles: { has: UserRole.SUPPORT_AGENT }
        }
      });
      
      if (!isAgent) {
        throw new BadRequestException('You do not have permission to view this ticket');
      }
    }

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { 
          ticketId,
          isInternalNote: false,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.message.count({
        where: { 
          ticketId,
          status: 'ACTIVE',
          assignedTickets: {
            none: {
              status: {
                in: ['OPEN', 'IN_PROGRESS']
              }
            }
          }
        },
        orderBy: {
          assignedTickets: {
            _count: 'asc'
          }
        },
        take: 1
      });

      if (availableAgents.length > 0) {
        await this.prisma.supportTicket.update({
          where: { id: ticketId },
          data: {
            assignedTo: availableAgents[0].id,
            status: 'IN_PROGRESS'
          }
        });
      }
    } catch (error) {
      this.logger.error(`Failed to auto-assign ticket ${ticketId}: ${error.message}`, error.stack);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  /**
   * Create a support ticket from an incoming email
   */
  async createTicketFromEmail(
    fromEmail: string,
    subject: string,
    content: string,
    attachments: string[] = [],
    metadata: Record<string, any> = {}
  ): Promise<SupportTicketEntity> {
    // Find or create user by email
    let user = await this.prisma.user.findUnique({
      where: { email: fromEmail },
    });

    // If user doesn't exist, create a guest user
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: fromEmail,
          isActive: false, // Mark as guest user
          roles: ['CUSTOMER'],
          // Extract name from email if possible
          firstName: fromEmail.split('@')[0],
          // Generate a random password (user will need to reset it)
          password: require('crypto').randomBytes(16).toString('hex'),
        },
      });
    }

    // Create the ticket
    const ticket = await this.prisma.supportTicket.create({
      data: {
        subject: subject || 'Support Request from Email',
        description: content,
        userId: user.id,
        status: SupportTicketStatus.OPEN,
        priority: SupportTicketPriority.NORMAL,
        category: SupportTicketCategory.GENERAL,
        source: 'EMAIL',
        metadata: metadata,
        attachments: { set: attachments },
      },
    });

    // Auto-assign the ticket if possible
    await this.autoAssignTicket(ticket.id);

    // Send confirmation email to the user
    await this.sendEmailResponse(ticket.id, {
      subject: `[Ticket #${ticket.id}] We've received your request`,
      message: `Thank you for contacting GoUraan support. Your ticket has been created and our team will get back to you soon.\n\nTicket ID: ${ticket.id}\nSubject: ${ticket.subject}`,
      isInternalNote: false,
    });

    return ticket;
  }

  /**
   * Automatically assign a ticket to an available support agent
   */
  private async autoAssignTicket(ticketId: string): Promise<void> {
    try {
      // Find an available support agent (AGENT role in this case)
      const availableAgent = await this.prisma.user.findFirst({
        where: {
          role: 'AGENT',
          status: 'ACTIVE',
        },
        orderBy: {
          assignedTickets: {
            _count: 'asc',
          },
        },
      });

      if (availableAgent) {
        await this.prisma.supportTicket.update({
          where: { id: ticketId },
          data: {
            assignedTo: {
              connect: { id: availableAgent.id },
            },
          },
        });

        this.logger.log(`Assigned ticket ${ticketId} to agent ${availableAgent.email}`);
      }
    } catch (error) {
      this.logger.error(`Failed to auto-assign ticket ${ticketId}:`, error);
      // Don't throw error to prevent ticket creation from failing
    }
  }

  /**
   * Send an email response to a ticket
   */
  async sendEmailResponse(
    ticketId: string,
    options: {
      subject: string;
      message: string;
      isInternalNote: boolean;
      attachments?: Array<{ filename: string; path: string }>;
    },
    userId?: string
  ): Promise<void> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { user: true },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    // If user ID is provided, verify they have permission
    if (userId) {
      const hasPermission = await this.prisma.supportTicket.findFirst({
        where: {
          id: ticketId,
          OR: [
            { userId },
            { assignedToId: userId },
            { assignedTo: { roles: { has: UserRole.SUPPORT_AGENT } } },
          ],
        },
      });

      if (!hasPermission) {
        throw new BadRequestException('You do not have permission to respond to this ticket');
      }
    }

    // Send the email
    await this.emailService.sendEmail(
      ticket.user.email,
      options.subject,
      'support-response',
      {
        ticketId: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
        message: options.message,
        currentYear: new Date().getFullYear(),
        ticketUrl: `${this.configService.get('FRONTEND_URL')}/support/tickets/${ticket.id}`,
      }
    });

    // Add the message to the ticket
    await this.addMessageToTicket(
      ticketId,
      userId || 'system',
      options.message,
      options.attachments?.map(a => a.filename) || [],
      options.isInternalNote
    );
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
      // Get ticket with user and assigned user details in a single query
      const ticket = await this.prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: { 
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!ticket) {
        this.logger.warn(`Ticket ${ticketId} not found for email notification`);
        return;
      }

      const user = ticket.user;
      if (!user) {
        this.logger.warn(`User not found for ticket ${ticketId}`);
        return;
      }

      // Ensure we have the user's email
      if (!user.email) {
        this.logger.warn(`No email found for user ${user.id}`);
        return;
      }

      // Get frontend URL with fallback
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      
      // Prepare common context
      const context: Record<string, any> = {
        ticketId: ticket.id,
        subject: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        customerName: user.firstName || 'Customer',
        currentYear: new Date().getFullYear(),
        ticketUrl: `${frontendUrl}/support/tickets/${ticket.id}`,
        ...additionalContext,
      };

      let templateName: string;
      let subject: string;

      // Handle different notification types
      switch (notificationType) {
        case 'status_change':
          templateName = 'ticket-status-update';
          subject = `[Ticket #${ticket.id}] Status updated to ${ticket.status}`;
          context.previousStatus = additionalContext.previousStatus || 'UNKNOWN';
          break;

        case 'agent_response':
          templateName = 'support-response';
          subject = `[Ticket #${ticket.id}] New response from support`;
          
          // Use the assigned user's name if available
          if (ticket.assignedTo) {
            context.agentName = ticket.assignedTo.firstName || 'Our Support Team';
          } else {
            context.agentName = 'Our Support Team';
          }
          break;

        case 'ticket_created':
          templateName = 'new-ticket';
          subject = `[Ticket #${ticket.id}] We've received your request`;
          break;

        default:
          this.logger.warn(`Unknown notification type: ${notificationType}`);
          return;
      }

      // Send the email
      await this.emailService.sendEmail(
        user.email,
        subject,
        templateName,
        context
      );
      
      this.logger.log(`Successfully sent ${notificationType} email for ticket ${ticketId} to ${user.email}`);
      
    } catch (error: any) {
      this.logger.error(
        `Failed to send ${notificationType} email for ticket ${ticketId}: ${error?.message || 'Unknown error'}`,
        error?.stack
      );
      throw new InternalServerErrorException('Failed to send email notification');
    }
  }
}
