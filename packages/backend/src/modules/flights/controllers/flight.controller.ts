import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FlightService } from '../services/flight.service';
import { CreateFlightDto } from '../dto/create-flight.dto';
import { UpdateFlightDto } from '../dto/update-flight.dto';
import { SearchFlightsDto } from '../dto/search-flights.dto';
import { Flight } from '../entities/flight.entity';
import { FlightSeat } from '../entities/flight-seat.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../users/enums/user-role.enum';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

@ApiTags('flights')
@Controller('flights')
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AIRLINE_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new flight' })
  @ApiResponse({ status: 201, description: 'The flight has been successfully created.', type: Flight })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createFlightDto: CreateFlightDto): Promise<Flight> {
    return this.flightService.create(createFlightDto);
  }

  @Get()
  @ApiOperation({ summary: 'Search and filter flights' })
  @ApiResponse({ status: 200, description: 'Return a list of flights.', type: [Flight] })
  async findAll(@Query() searchParams: SearchFlightsDto): Promise<PaginatedResult<Flight>> {
    return this.flightService.findAll(searchParams);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a flight by ID' })
  @ApiResponse({ status: 200, description: 'Return the flight with the specified ID.', type: Flight })
  @ApiResponse({ status: 404, description: 'Flight not found.' })
  findOne(@Param('id') id: string): Promise<Flight> {
    return this.flightService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AIRLINE_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a flight' })
  @ApiResponse({ status: 200, description: 'The flight has been successfully updated.', type: Flight })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Flight not found.' })
  update(
    @Param('id') id: string,
    @Body() updateFlightDto: UpdateFlightDto,
  ): Promise<Flight> {
    return this.flightService.update(id, updateFlightDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AIRLINE_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a flight' })
  @ApiResponse({ status: 200, description: 'The flight has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Flight not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.flightService.remove(id);
  }

  @Get(':id/seats')
  @ApiOperation({ summary: 'Get available seats for a flight' })
  @ApiResponse({ status: 200, description: 'Return a list of available seats.', type: [FlightSeat] })
  @ApiResponse({ status: 404, description: 'Flight not found.' })
  getAvailableSeats(@Param('id') id: string): Promise<FlightSeat[]> {
    return this.flightService.getAvailableSeats(id);
  }

  @Post(':id/seats/:seatId/hold')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hold a specific seat' })
  @ApiResponse({ status: 200, description: 'The seat has been held.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Seat or flight not found.' })
  async holdSeat(
    @Param('id') flightId: string,
    @Param('seatId') seatId: string,
    @Body('userId') userId: string,
  ): Promise<FlightSeat> {
    return this.flightService.updateSeatStatus(flightId, seatId, 'reserved', userId);
  }

  @Post(':id/seats/:seatId/release')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Release a held seat' })
  @ApiResponse({ status: 200, description: 'The seat has been released.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Seat or flight not found.' })
  async releaseSeat(
    @Param('id') flightId: string,
    @Param('seatId') seatId: string,
  ): Promise<FlightSeat> {
    return this.flightService.updateSeatStatus(flightId, seatId, 'available');
  }
}
