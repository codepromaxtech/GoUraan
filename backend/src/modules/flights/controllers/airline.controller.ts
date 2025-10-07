import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AirlineService } from '../services/airline.service';
import { CreateAirlineDto } from '../dto/create-airline.dto';
import { UpdateAirlineDto } from '../dto/update-airline.dto';
import { Airline } from '../entities/airline.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../users/enums/user-role.enum';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

@ApiTags('airlines')
@Controller('airlines')
export class AirlineController {
  constructor(private readonly airlineService: AirlineService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AIRLINE_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new airline' })
  @ApiResponse({ status: 201, description: 'The airline has been successfully created.', type: Airline })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createAirlineDto: CreateAirlineDto): Promise<Airline> {
    return this.airlineService.create(createAirlineDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all airlines' })
  @ApiResponse({ status: 200, description: 'Return a list of airlines.', type: [Airline] })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ): Promise<PaginatedResult<Airline>> {
    return this.airlineService.findAll(page, limit, search);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search airlines by query' })
  @ApiResponse({ status: 200, description: 'Return a list of matching airlines.', type: [Airline] })
  search(@Query('q') query: string): Promise<Airline[]> {
    if (!query || query.length < 2) {
      return Promise.resolve([]);
    }
    return this.airlineService.searchAirlines(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an airline by ID' })
  @ApiResponse({ status: 200, description: 'Return the airline with the specified ID.', type: Airline })
  @ApiResponse({ status: 404, description: 'Airline not found.' })
  findOne(@Param('id') id: string): Promise<Airline> {
    return this.airlineService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AIRLINE_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an airline' })
  @ApiResponse({ status: 200, description: 'The airline has been successfully updated.', type: Airline })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Airline not found.' })
  update(
    @Param('id') id: string,
    @Body() updateAirlineDto: UpdateAirlineDto,
  ): Promise<Airline> {
    return this.airlineService.update(id, updateAirlineDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AIRLINE_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an airline' })
  @ApiResponse({ status: 200, description: 'The airline has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Airline not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.airlineService.remove(id);
  }
}
