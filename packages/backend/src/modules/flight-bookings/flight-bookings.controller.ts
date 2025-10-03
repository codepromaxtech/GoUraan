import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FlightBookingsService } from './flight-bookings.service';
import { CreateFlightBookingDto } from './dto/create-flight-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Flight Bookings')
@Controller('flight-bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FlightBookingsController {
  constructor(private readonly flightBookingsService: FlightBookingsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF_OPERATIONS)
  @ApiOperation({ summary: 'Create a new flight booking' })
  @ApiResponse({ status: 201, description: 'The flight booking has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  create(@Body() createFlightBookingDto: CreateFlightBookingDto) {
    return this.flightBookingsService.create(createFlightBookingDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF_OPERATIONS, UserRole.STAFF_FINANCE)
  @ApiOperation({ summary: 'Get all flight bookings with optional filters' })
  @ApiResponse({ status: 200, description: 'Return all flight bookings.' })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const where: any = {};
    
    if (status) where.status = status;
    
    if (startDate || endDate) {
      where.bookingDate = {};
      if (startDate) where.bookingDate.gte = new Date(startDate);
      if (endDate) where.bookingDate.lte = new Date(endDate);
    }

    return this.flightBookingsService.findAll({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      where,
      orderBy: { bookingDate: 'desc' },
    });
  }

  @Get('report')
  @Roles(UserRole.ADMIN, UserRole.STAFF_FINANCE)
  @ApiOperation({ summary: 'Generate flight booking report' })
  @ApiResponse({ status: 200, description: 'Return flight booking report.' })
  getReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('issuedBy') issuedBy?: string,
  ) {
    return this.flightBookingsService.getBookingReport({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status,
      issuedBy,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF_OPERATIONS, UserRole.STAFF_FINANCE)
  @ApiOperation({ summary: 'Get a flight booking by ID' })
  @ApiResponse({ status: 200, description: 'Return the flight booking.' })
  @ApiResponse({ status: 404, description: 'Flight booking not found.' })
  findOne(@Param('id') id: string) {
    return this.flightBookingsService.findOne(id);
  }

  @Get('pnr/:pnr')
  @ApiOperation({ summary: 'Get a flight booking by PNR' })
  @ApiResponse({ status: 200, description: 'Return the flight booking.' })
  @ApiResponse({ status: 404, description: 'Flight booking not found.' })
  findByPnr(@Param('pnr') pnr: string) {
    return this.flightBookingsService.findByPnr(pnr);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF_OPERATIONS)
  @ApiOperation({ summary: 'Update a flight booking' })
  @ApiResponse({ status: 200, description: 'The flight booking has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Flight booking not found.' })
  update(
    @Param('id') id: string,
    @Body() updateFlightBookingDto: Partial<CreateFlightBookingDto>,
  ) {
    return this.flightBookingsService.update(id, updateFlightBookingDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a flight booking' })
  @ApiResponse({ status: 200, description: 'The flight booking has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Flight booking not found.' })
  remove(@Param('id') id: string) {
    return this.flightBookingsService.remove(id);
  }

  @Post(':bookingId/passengers/:passengerId/tickets')
  @Roles(UserRole.ADMIN, UserRole.STAFF_OPERATIONS)
  @ApiOperation({ summary: 'Generate a ticket for a passenger' })
  @ApiResponse({ status: 201, description: 'The ticket has been successfully generated.' })
  @ApiResponse({ status: 400, description: 'Bad request or ticket already exists.' })
  @ApiResponse({ status: 404, description: 'Booking or passenger not found.' })
  generateTicket(
    @Param('bookingId') bookingId: string,
    @Param('passengerId') passengerId: string,
    @Body('ticketNumber') ticketNumber: string,
  ) {
    if (!ticketNumber) {
      throw new Error('Ticket number is required');
    }
    return this.flightBookingsService.generateTicket(bookingId, passengerId, ticketNumber);
  }
}
