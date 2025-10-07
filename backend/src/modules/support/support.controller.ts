import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  Request,
  BadRequestException,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { SupportService } from './support.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';
import { SupportTicketEntity } from './entities/support-ticket.entity';
import { SupportTicketStatus, SupportTicketPriority, SupportTicketCategory, UserRole } from '@prisma/client';
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';

@ApiTags('support')
@Controller('support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  @ApiOperation({ summary: 'Create a new support ticket' })
  @ApiResponse({
    status: 201,
    description: 'Support ticket created successfully',
    type: SupportTicketEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Related resource not found' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'attachments', maxCount: 5 },
    ])
  )
  @ApiConsumes('multipart/form-data')
  async createTicket(
    @Request() req,
    @Body() createSupportTicketDto: CreateSupportTicketDto,
    @UploadedFiles() files: { attachments?: Express.Multer.File[] },
  ): Promise<SupportTicketEntity> {
    // In a real application, you would upload the files to a storage service
    // and save the URLs in the database
    const attachmentUrls = files?.attachments?.map(file => 
      `/uploads/support/${file.filename}`
    ) || [];

    return this.supportService.createTicket(
      req.user.id,
      { ...createSupportTicketDto, attachments: attachmentUrls }
    );
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Get all support tickets with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'List of support tickets', type: [SupportTicketEntity] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: SupportTicketStatus })
  @ApiQuery({ name: 'priority', required: false, enum: SupportTicketPriority })
  @ApiQuery({ name: 'category', required: false, enum: SupportTicketCategory })
  @ApiQuery({ name: 'assignedToId', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAllTickets(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('userId') userId?: string,
    @Query('status') status?: SupportTicketStatus,
    @Query('priority') priority?: SupportTicketPriority,
    @Query('category') category?: SupportTicketCategory,
    @Query('assignedToId') assignedToId?: string,
    @Query('search') search?: string,
  ): Promise<PaginatedResult<SupportTicketEntity>> {
    // Regular users can only see their own tickets
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPPORT_AGENT) {
      userId = req.user.id;
    }

    return this.supportService.findAllTickets(
      page,
      limit,
      userId,
      status,
      priority,
      category,
      assignedToId,
      search,
    );
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get a support ticket by ID' })
  @ApiParam({ name: 'id', description: 'Support ticket ID' })
  @ApiResponse({ status: 200, description: 'Support ticket found', type: SupportTicketEntity })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Support ticket not found' })
  async findTicketById(
    @Request() req,
    @Param('id') id: string,
  ): Promise<SupportTicketEntity> {
    // Regular users can only view their own tickets
    const userId = req.user.role === UserRole.ADMIN || req.user.role === UserRole.SUPPORT_AGENT 
      ? undefined 
      : req.user.id;
      
    return this.supportService.findTicketById(id, userId);
  }

  @Put('tickets/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_AGENT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a support ticket (Admin/Support Agent only)' })
  @ApiParam({ name: 'id', description: 'Support ticket ID' })
  @ApiResponse({ status: 200, description: 'Support ticket updated', type: SupportTicketEntity })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Support ticket not found' })
  async updateTicket(
    @Request() req,
    @Param('id') id: string,
    @Body() updateSupportTicketDto: UpdateSupportTicketDto,
  ): Promise<SupportTicketEntity> {
    const isAdmin = req.user.role === UserRole.ADMIN;
    return this.supportService.updateTicket(
      id, 
      updateSupportTicketDto, 
      req.user.id,
      isAdmin
    );
  }

  @Post('tickets/:id/messages')
  @ApiOperation({ summary: 'Add a message to a support ticket' })
  @ApiParam({ name: 'id', description: 'Support ticket ID' })
  @ApiResponse({ status: 201, description: 'Message added', type: SupportTicketEntity })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Support ticket not found' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'attachments', maxCount: 5 },
    ])
  )
  @ApiConsumes('multipart/form-data')
  async addMessage(
    @Request() req,
    @Param('id') ticketId: string,
    @Body('message') message: string,
    @UploadedFiles() files: { attachments?: Express.Multer.File[] },
  ): Promise<SupportTicketEntity> {
    if (!message?.trim()) {
      throw new BadRequestException('Message cannot be empty');
    }

    // In a real application, you would upload the files to a storage service
    // and save the URLs in the database
    const attachmentUrls = files?.attachments?.map(file => 
      `/uploads/support/messages/${file.filename}`
    ) || [];

    return this.supportService.addMessage(
      ticketId,
      req.user.id,
      message,
      attachmentUrls
    );
  }

  @Post('tickets/:id/close')
  @ApiOperation({ summary: 'Close a support ticket' })
  @ApiParam({ name: 'id', description: 'Support ticket ID' })
  @ApiResponse({ status: 200, description: 'Support ticket closed', type: SupportTicketEntity })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Support ticket not found' })
  async closeTicket(
    @Request() req,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ): Promise<SupportTicketEntity> {
    return this.supportService.closeTicket(id, req.user.id, reason);
  }

  @Post('tickets/:id/rate')
  @ApiOperation({ summary: 'Rate a closed support ticket' })
  @ApiParam({ name: 'id', description: 'Support ticket ID' })
  @ApiResponse({ status: 200, description: 'Support ticket rated', type: SupportTicketEntity })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Support ticket not found' })
  async rateTicket(
    @Request() req,
    @Param('id') id: string,
    @Body('rating') rating: number,
    @Body('feedback') feedback?: string,
  ): Promise<SupportTicketEntity> {
    if (rating === undefined || rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be a number between 1 and 5');
    }

    return this.supportService.rateTicket(id, req.user.id, rating, feedback);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get support ticket statistics' })
  @ApiResponse({
    status: 200,
    description: 'Support ticket statistics',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 100 },
        open: { type: 'number', example: 25 },
        inProgress: { type: 'number', example: 15 },
        closed: { type: 'number', example: 60 },
        highPriority: { type: 'number', example: 10 },
        avgRating: { type: 'number', example: 4.5 },
        avgResponseTime: { type: 'number', example: 30 },
      },
    },
  })
  async getTicketStats(
    @Request() req,
  ) {
    // Regular users can only see their own stats
    const userId = req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPPORT_AGENT
      ? req.user.id
      : undefined;
      
    return this.supportService.getTicketStats(userId);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get available support ticket categories' })
  @ApiResponse({
    status: 200,
    description: 'List of available categories',
    schema: {
      type: 'array',
      items: {
        type: 'string',
        enum: Object.values(SupportTicketCategory),
      },
    },
  })
  getCategories() {
    return Object.values(SupportTicketCategory);
  }

  @Get('priorities')
  @ApiOperation({ summary: 'Get available support ticket priorities' })
  @ApiResponse({
    status: 200,
    description: 'List of available priorities',
    schema: {
      type: 'array',
      items: {
        type: 'string',
        enum: Object.values(SupportTicketPriority),
      },
    },
  })
  getPriorities() {
    return Object.values(SupportTicketPriority);
  }
}
