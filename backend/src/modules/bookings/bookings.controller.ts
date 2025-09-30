import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, BookingType, BookingStatus, PaymentStatus } from '@prisma/client';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createBooking(
    @CurrentUser() user: any,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.createBooking(user.id, createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user bookings' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'type', required: false, enum: BookingType })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  @ApiQuery({ name: 'paymentStatus', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, example: '2024-01-01' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, example: '2024-12-31' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserBookings(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('type') type?: BookingType,
    @Query('status') status?: BookingStatus,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.bookingsService.getUserBookings(user.id, page, limit, {
      type,
      status,
      paymentStatus,
      dateFrom,
      dateTo,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user booking statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserBookingStats(@CurrentUser() user: any) {
    return this.bookingsService.getBookingStats(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getBookingById(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.bookingsService.findById(id, user.id);
  }

  @Get('reference/:reference')
  @ApiOperation({ summary: 'Get booking by reference' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getBookingByReference(
    @CurrentUser() user: any,
    @Param('reference') reference: string,
  ) {
    return this.bookingsService.findByReference(reference, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update booking' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async updateBooking(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingsService.updateBooking(id, updateBookingDto, user.id);
  }

  @Put(':id/confirm')
  @ApiOperation({ summary: 'Confirm booking' })
  @ApiResponse({ status: 200, description: 'Booking confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - cannot confirm booking' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async confirmBooking(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.bookingsService.confirmBooking(id, user.id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - cannot cancel booking' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async cancelBooking(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.bookingsService.cancelBooking(id, reason, user.id);
  }

  // Admin routes
  @Get('admin/all')
  @Roles(UserRole.ADMIN, UserRole.STAFF_OPERATIONS, UserRole.STAFF_SUPPORT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all bookings (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'type', required: false, enum: BookingType })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  @ApiQuery({ name: 'paymentStatus', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllBookings(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('type') type?: BookingType,
    @Query('status') status?: BookingStatus,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('userId') userId?: string,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.bookingsService.getAllBookings(page, limit, {
      type,
      status,
      paymentStatus,
      userId,
      search,
      dateFrom,
      dateTo,
    });
  }

  @Get('admin/stats')
  @Roles(UserRole.ADMIN, UserRole.STAFF_OPERATIONS)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get booking statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getBookingStats() {
    return this.bookingsService.getBookingStats();
  }

  @Get('admin/:id')
  @Roles(UserRole.ADMIN, UserRole.STAFF_OPERATIONS, UserRole.STAFF_SUPPORT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get any booking by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getAnyBookingById(@Param('id') id: string) {
    return this.bookingsService.findById(id);
  }

  @Put('admin/:id')
  @Roles(UserRole.ADMIN, UserRole.STAFF_OPERATIONS)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update any booking (Admin only)' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async updateAnyBooking(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingsService.updateBooking(id, updateBookingDto);
  }

  @Put('admin/:id/complete')
  @Roles(UserRole.ADMIN, UserRole.STAFF_OPERATIONS)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Complete booking (Admin only)' })
  @ApiResponse({ status: 200, description: 'Booking completed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async completeBooking(@Param('id') id: string) {
    return this.bookingsService.completeBooking(id);
  }
}
