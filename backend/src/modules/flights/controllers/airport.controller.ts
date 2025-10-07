import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AirportService } from '../services/airport.service';
import { CreateAirportDto, AirportType } from '../dto/create-airport.dto';
import { UpdateAirportDto } from '../dto/update-airport.dto';
import { Airport } from '../entities/airport.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../users/enums/user-role.enum';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

@ApiTags('airports')
@Controller('airports')
export class AirportController {
  constructor(private readonly airportService: AirportService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AIRLINE_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new airport' })
  @ApiResponse({ status: 201, description: 'The airport has been successfully created.', type: Airport })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createAirportDto: CreateAirportDto): Promise<Airport> {
    return this.airportService.create(createAirportDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all airports with optional filtering' })
  @ApiResponse({ status: 200, description: 'Return a list of airports.', type: [Airport] })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for airport name, city, or code' })
  @ApiQuery({ name: 'type', required: false, enum: AirportType, description: 'Filter by airport type' })
  @ApiQuery({ name: 'country', required: false, type: String, description: 'Filter by country' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('type') type?: AirportType,
    @Query('country') country?: string,
  ): Promise<PaginatedResult<Airport>> {
    return this.airportService.findAll(
      Number(page),
      Number(limit),
      search,
      type,
      country,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Search airports by query' })
  @ApiResponse({ status: 200, description: 'Return a list of matching airports.', type: [Airport] })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search query (min 2 characters)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of results (default: 10)' })
  search(
    @Query('q') query: string,
    @Query('limit') limit = 10,
  ): Promise<Airport[]> {
    if (!query || query.length < 2) {
      return Promise.resolve([]);
    }
    return this.airportService.searchAirports(query, Number(limit));
  }

  @Get('hubs')
  @ApiOperation({ summary: 'Get all hub airports' })
  @ApiResponse({ status: 200, description: 'Return a list of hub airports.', type: [Airport] })
  findHubs(): Promise<Airport[]> {
    return this.airportService.findHubs();
  }

  @Get('by-iata/:iataCode')
  @ApiOperation({ summary: 'Get an airport by IATA code' })
  @ApiResponse({ status: 200, description: 'Return the airport with the specified IATA code.', type: Airport })
  @ApiResponse({ status: 404, description: 'Airport not found.' })
  findByIataCode(@Param('iataCode') iataCode: string): Promise<Airport> {
    return this.airportService.findByIataCode(iataCode);
  }

  @Get('by-icao/:icaoCode')
  @ApiOperation({ summary: 'Get an airport by ICAO code' })
  @ApiResponse({ status: 200, description: 'Return the airport with the specified ICAO code.', type: Airport })
  @ApiResponse({ status: 404, description: 'Airport not found.' })
  findByIcaoCode(@Param('icaoCode') icaoCode: string): Promise<Airport> {
    return this.airportService.findByIcaoCode(icaoCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an airport by ID' })
  @ApiResponse({ status: 200, description: 'Return the airport with the specified ID.', type: Airport })
  @ApiResponse({ status: 404, description: 'Airport not found.' })
  findOne(@Param('id') id: string): Promise<Airport> {
    return this.airportService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AIRLINE_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an airport' })
  @ApiResponse({ status: 200, description: 'The airport has been successfully updated.', type: Airport })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Airport not found.' })
  update(
    @Param('id') id: string,
    @Body() updateAirportDto: UpdateAirportDto,
  ): Promise<Airport> {
    return this.airportService.update(id, updateAirportDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AIRLINE_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an airport' })
  @ApiResponse({ status: 200, description: 'The airport has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Airport not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.airportService.remove(id);
  }
}
