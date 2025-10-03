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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomEntity } from './entities/room.entity';
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { UserRole, RoomType, RoomStatus } from '@prisma/client';

@ApiTags('rooms')
@Controller('rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new room' })
  @ApiResponse({
    status: 201,
    description: 'Room created successfully',
    type: RoomEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  @ApiResponse({ status: 409, description: 'Room number already exists in the hotel' })
  async create(@Body() createRoomDto: CreateRoomDto): Promise<RoomEntity> {
    return this.roomsService.create(createRoomDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rooms with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'List of rooms', type: [RoomEntity] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'hotelId', required: false })
  @ApiQuery({ name: 'type', required: false, enum: RoomType })
  @ApiQuery({ name: 'status', required: false, enum: RoomStatus })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'minAdults', required: false, type: Number })
  @ApiQuery({ name: 'minChildren', required: false, type: Number })
  @ApiQuery({ name: 'amenities', required: false, type: String })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('hotelId') hotelId?: string,
    @Query('type') type?: RoomType,
    @Query('status') status?: RoomStatus,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('minAdults') minAdults?: number,
    @Query('minChildren') minChildren?: number,
    @Query('amenities') amenities?: string,
    @Query('search') search?: string,
  ): Promise<PaginatedResult<RoomEntity>> {
    // Parse comma-separated amenities string to array
    const amenitiesArray = amenities ? amenities.split(',') : undefined;

    // Convert string query params to numbers
    const minPriceNum = minPrice ? Number(minPrice) : undefined;
    const maxPriceNum = maxPrice ? Number(maxPrice) : undefined;
    const minAdultsNum = minAdults ? Number(minAdults) : undefined;
    const minChildrenNum = minChildren ? Number(minChildren) : undefined;

    // Validate numeric inputs
    if (minPriceNum !== undefined && isNaN(minPriceNum)) {
      throw new BadRequestException('minPrice must be a number');
    }
    if (maxPriceNum !== undefined && isNaN(maxPriceNum)) {
      throw new BadRequestException('maxPrice must be a number');
    }
    if (minAdultsNum !== undefined && isNaN(minAdultsNum)) {
      throw new BadRequestException('minAdults must be a number');
    }
    if (minChildrenNum !== undefined && isNaN(minChildrenNum)) {
      throw new BadRequestException('minChildren must be a number');
    }

    return this.roomsService.findAll(
      page,
      limit,
      hotelId,
      type,
      status,
      minPriceNum,
      maxPriceNum,
      minAdultsNum,
      minChildrenNum,
      amenitiesArray,
      search
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a room by ID' })
  @ApiResponse({ status: 200, description: 'Room found', type: RoomEntity })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async findOne(@Param('id') id: string): Promise<RoomEntity> {
    return this.roomsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update a room' })
  @ApiResponse({ status: 200, description: 'Room updated', type: RoomEntity })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 409, description: 'Room number already exists in the hotel' })
  async update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ): Promise<RoomEntity> {
    return this.roomsService.update(id, updateRoomDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a room' })
  @ApiResponse({ status: 200, description: 'Room deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete room with existing bookings' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.roomsService.remove(id);
  }

  @Put(':id/status/:status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update room status' })
  @ApiResponse({ status: 200, description: 'Room status updated', type: RoomEntity })
  @ApiResponse({ status: 400, description: 'Invalid status' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async updateStatus(
    @Param('id') id: string,
    @Param('status') status: RoomStatus,
  ): Promise<RoomEntity> {
    // Validate status
    if (!Object.values(RoomStatus).includes(status)) {
      throw new BadRequestException('Invalid room status');
    }
    
    return this.roomsService.updateStatus(id, status);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Check room availability for given dates' })
  @ApiResponse({
    status: 200,
    description: 'Availability check result',
    schema: {
      type: 'object',
      properties: {
        available: { type: 'boolean' },
        message: { type: 'string', nullable: true },
      },
    },
  })
  @ApiQuery({ name: 'checkIn', required: true, description: 'Check-in date (ISO string)' })
  @ApiQuery({ name: 'checkOut', required: true, description: 'Check-out date (ISO string)' })
  async checkAvailability(
    @Param('id') id: string,
    @Query('checkIn') checkInStr: string,
    @Query('checkOut') checkOutStr: string,
  ) {
    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);

    // Validate dates
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      throw new BadRequestException('Invalid date format. Please use ISO 8601 format.');
    }

    if (checkIn >= checkOut) {
      throw new BadRequestException('Check-out date must be after check-in date');
    }

    return this.roomsService.checkAvailability(id, checkIn, checkOut);
  }
}
