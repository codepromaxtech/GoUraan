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
  BadRequestException,
  UseGuards,
  Req
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { HotelEntity } from './entities/hotel.entity';
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('hotels')
@Controller('hotels')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new hotel' })
  @ApiResponse({ status: 201, description: 'Hotel created successfully', type: HotelEntity })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Hotel with the same name already exists' })
  async create(@Body() createHotelDto: CreateHotelDto): Promise<HotelEntity> {
    return this.hotelsService.create(createHotelDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all hotels with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'List of hotels', type: [HotelEntity] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'minRating', required: false, type: Number })
  @ApiQuery({ name: 'maxRating', required: false, type: Number })
  @ApiQuery({ name: 'amenities', required: false, type: [String] })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'countryCode', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('search') search?: string,
    @Query('minRating', new DefaultValuePipe(0), ParseIntPipe) minRating?: number,
    @Query('maxRating', new DefaultValuePipe(5), ParseIntPipe) maxRating?: number,
    @Query('amenities') amenities?: string,
    @Query('city') city?: string,
    @Query('countryCode') countryCode?: string,
    @Query('isActive') isActive?: string,
  ): Promise<PaginatedResult<HotelEntity>> {
    // Parse comma-separated amenities string to array
    const amenitiesArray = amenities ? amenities.split(',') : undefined;
    
    // Parse isActive string to boolean
    let isActiveBool: boolean | undefined;
    if (isActive !== undefined) {
      isActiveBool = isActive === 'true';
    }

    // Validate rating range
    if (minRating < 0 || minRating > 5 || maxRating < 0 || maxRating > 5) {
      throw new BadRequestException('Rating must be between 0 and 5');
    }

    return this.hotelsService.findAll(
      page,
      limit,
      search,
      minRating,
      maxRating,
      amenitiesArray,
      city,
      countryCode,
      isActiveBool
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a hotel by ID' })
  @ApiResponse({ status: 200, description: 'Hotel found', type: HotelEntity })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  async findOne(@Param('id') id: string): Promise<HotelEntity> {
    return this.hotelsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update a hotel' })
  @ApiResponse({ status: 200, description: 'Hotel updated successfully', type: HotelEntity })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  @ApiResponse({ status: 409, description: 'Hotel with the same name already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateHotelDto: UpdateHotelDto,
  ): Promise<HotelEntity> {
    return this.hotelsService.update(id, updateHotelDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a hotel' })
  @ApiResponse({ status: 200, description: 'Hotel deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete hotel with existing rooms or bookings' })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.hotelsService.remove(id);
  }

  @Put(':id/toggle-status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Toggle hotel active status' })
  @ApiResponse({ status: 200, description: 'Hotel status toggled successfully', type: HotelEntity })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  async toggleStatus(
    @Param('id') id: string,
  ): Promise<HotelEntity> {
    return this.hotelsService.toggleStatus(id);
  }
}
