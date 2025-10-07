import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ConflictException, 
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomEntity } from './entities/room.entity';
import { Prisma, RoomType, RoomStatus } from '@prisma/client';
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new room
   */
  async create(createRoomDto: CreateRoomDto): Promise<RoomEntity> {
    try {
      // Check if hotel exists
      const hotel = await this.prisma.hotel.findUnique({
        where: { id: createRoomDto.hotelId },
      });

      if (!hotel) {
        throw new NotFoundException(`Hotel with ID ${createRoomDto.hotelId} not found`);
      }

      // Check if room number is already taken in the same hotel
      const existingRoom = await this.prisma.room.findFirst({
        where: {
          hotelId: createRoomDto.hotelId,
          roomNumber: createRoomDto.roomNumber,
        },
      });

      if (existingRoom) {
        throw new ConflictException(
          `Room with number ${createRoomDto.roomNumber} already exists in this hotel`
        );
      }

      const room = await this.prisma.room.create({
        data: {
          ...createRoomDto,
          amenities: createRoomDto.amenities || [],
          images: createRoomDto.images || [],
        },
      });

      this.logger.log(`Room created: ${room.id}`);
      return new RoomEntity(room);
    } catch (error) {
      this.logger.error(`Error creating room: ${error.message}`, error.stack);
      
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A room with this number already exists in the hotel');
        }
      }
      
      throw new InternalServerErrorException('Failed to create room');
    }
  }

  /**
   * Find all rooms with pagination and filtering
   */
  async findAll(
    page = 1,
    limit = 10,
    hotelId?: string,
    type?: RoomType,
    status?: RoomStatus,
    minPrice?: number,
    maxPrice?: number,
    minAdults?: number,
    minChildren?: number,
    amenities?: string[],
    search?: string
  ): Promise<PaginatedResult<RoomEntity>> {
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // Limit page size to 100

    const where: Prisma.RoomWhereInput = {};
    
    if (hotelId) {
      where.hotelId = hotelId;
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) where.basePrice.gte = minPrice;
      if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
    }

    if (minAdults !== undefined) {
      where.maxAdults = { gte: minAdults };
    }

    if (minChildren !== undefined) {
      where.maxChildren = { gte: minChildren };
    }

    if (amenities && amenities.length > 0) {
      where.amenities = {
        hasEvery: amenities,
      };
    }

    if (search) {
      where.OR = [
        { roomNumber: { contains: search, mode: 'insensitive' } },
        { bedConfiguration: { contains: search, mode: 'insensitive' } },
        { view: { contains: search, mode: 'insensitive' } },
      ];
    }

    try {
      const [total, items] = await Promise.all([
        this.prisma.room.count({ where }),
        this.prisma.room.findMany({
          skip,
          take,
          where,
          orderBy: { roomNumber: 'asc' },
          include: {
            hotel: {
              select: {
                id: true,
                name: true,
                starRating: true,
              },
            },
          },
        }),
      ]);

      return {
        data: items.map(room => new RoomEntity(room)),
        meta: {
          total,
          page,
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      };
    } catch (error) {
      this.logger.error(`Error finding rooms: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve rooms');
    }
  }

  /**
   * Find a room by ID
   */
  async findOne(id: string): Promise<RoomEntity> {
    try {
      const room = await this.prisma.room.findUnique({
        where: { id },
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              starRating: true,
              addressLine1: true,
              city: true,
              countryCode: true,
            },
          },
        },
      });

      if (!room) {
        throw new NotFoundException(`Room with ID ${id} not found`);
      }

      return new RoomEntity(room);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error finding room ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve room');
    }
  }

  /**
   * Update a room
   */
  async update(id: string, updateRoomDto: UpdateRoomDto): Promise<RoomEntity> {
    try {
      // Check if room exists
      await this.findOne(id);

      // If room number is being updated, check for conflicts
      if (updateRoomDto.roomNumber) {
        const existingRoom = await this.prisma.room.findFirst({
          where: {
            id: { not: id },
            hotelId: updateRoomDto.hotelId,
            roomNumber: updateRoomDto.roomNumber,
          },
        });

        if (existingRoom) {
          throw new ConflictException(
            `Room with number ${updateRoomDto.roomNumber} already exists in this hotel`
          );
        }
      }

      const updatedRoom = await this.prisma.room.update({
        where: { id },
        data: {
          ...updateRoomDto,
          // Handle array updates properly
          ...(updateRoomDto.amenities !== undefined && { 
            amenities: updateRoomDto.amenities 
          }),
          ...(updateRoomDto.images !== undefined && { 
            images: updateRoomDto.images 
          }),
        },
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(`Room updated: ${id}`);
      return new RoomEntity(updatedRoom);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      
      this.logger.error(`Error updating room ${id}: ${error.message}`, error.stack);
      
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A room with this number already exists in the hotel');
        }
      }
      
      throw new InternalServerErrorException('Failed to update room');
    }
  }

  /**
   * Remove a room
   */
  async remove(id: string): Promise<void> {
    try {
      // Check if room exists
      await this.findOne(id);

      // Check for existing bookings
      const bookingsCount = await this.prisma.booking.count({
        where: { 
          type: 'HOTEL',
          bookingData: {
            path: ['room', 'id'],
            equals: id,
          },
        },
      });

      if (bookingsCount > 0) {
        throw new BadRequestException('Cannot delete room with existing bookings');
      }

      await this.prisma.room.delete({
        where: { id },
      });

      this.logger.log(`Room deleted: ${id}`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      
      this.logger.error(`Error deleting room ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to delete room');
    }
  }

  /**
   * Update room status
   */
  async updateStatus(id: string, status: RoomStatus): Promise<RoomEntity> {
    try {
      const room = await this.findOne(id);
      
      const updatedRoom = await this.prisma.room.update({
        where: { id },
        data: { 
          status,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Room ${id} status updated to ${status}`);
      return new RoomEntity(updatedRoom);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(
        `Error updating status for room ${id}: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Failed to update room status');
    }
  }

  /**
   * Check room availability for given dates
   */
  async checkAvailability(
    roomId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<{ available: boolean; message?: string }> {
    try {
      const room = await this.findOne(roomId);
      
      if (room.status !== 'AVAILABLE') {
        return { 
          available: false, 
          message: `Room is currently ${room.status.toLowerCase()}` 
        };
      }

      // Check for overlapping bookings
      const overlappingBooking = await this.prisma.booking.findFirst({
        where: {
          type: 'HOTEL',
          status: { not: 'CANCELLED' },
          bookingData: {
            path: ['room', 'id'],
            equals: roomId,
          },
          OR: [
            // Existing booking starts during the requested stay
            {
              'checkIn': { gte: checkIn, lt: checkOut },
            },
            // Existing booking ends during the requested stay
            {
              'checkOut': { gt: checkIn, lte: checkOut },
            },
            // Existing booking completely contains the requested stay
            {
              'checkIn': { lte: checkIn },
              'checkOut': { gte: checkOut },
            },
          ],
        },
      });

      if (overlappingBooking) {
        return { 
          available: false, 
          message: 'Room is already booked for the selected dates' 
        };
      }

      return { available: true };
    } catch (error) {
      this.logger.error(
        `Error checking availability for room ${roomId}: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Failed to check room availability');
    }
  }
}
