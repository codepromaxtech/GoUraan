import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SupportService, SupportMessage } from '../support.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('support')
@ApiBearerAuth()
@Controller('support/tickets/:ticketId/messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagesController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  @Roles(UserRole.CUSTOMER, UserRole.SUPPORT_AGENT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Add a message to a support ticket' })
  @ApiResponse({ status: 201, description: 'Message added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async addMessage(
    @Param('ticketId') ticketId: string,
    @Body('content') content: string,
    @Body('isInternalNote') isInternalNote: boolean = false,
    @Req() req: any,
  ): Promise<SupportMessage> {
    if (!content) {
      throw new BadRequestException('Message content is required');
    }

    return this.supportService.addMessageToTicket(
      ticketId,
      req.user.id,
      content,
      [], // Attachments would be handled separately via file upload
      isInternalNote,
    );
  }

  @Get()
  @Roles(UserRole.CUSTOMER, UserRole.SUPPORT_AGENT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get messages for a support ticket' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getMessages(
    @Param('ticketId') ticketId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Req() req: any,
  ) {
    return this.supportService.getTicketMessages(
      ticketId,
      req.user.id,
      Number(page),
      Number(limit),
    );
  }

  @Post('email')
  @Roles(UserRole.SUPPORT_AGENT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Send an email response for a support ticket' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async sendEmailResponse(
    @Param('ticketId') ticketId: string,
    @Body('subject') subject: string,
    @Body('message') message: string,
    @Body('isInternalNote') isInternalNote: boolean = false,
    @Req() req: any,
  ) {
    if (!subject || !message) {
      throw new BadRequestException('Subject and message are required');
    }

    await this.supportService.sendEmailResponse(
      ticketId,
      {
        subject,
        message,
        isInternalNote,
      },
      req.user.id,
    );

    return { success: true, message: 'Email sent successfully' };
  }
}
