import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ConflictException, 
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { HotelEntity } from './entities/hotel.entity';
import { Prisma } from '@prisma/client';
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class HotelsService {
  private readonly logger = new Logger(HotelsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new hotel
   */
  async create(createHotelDto: CreateHotelDto): Promise<HotelEntity> {
    try {
      const hotel = await this.prisma.hotel.create({
        data: {
          ...createHotelDto,
          amenities: createHotelDto.amenities || [],
          images: createHotelDto.images || [],
        },
      });

      this.logger.log(`Hotel created: ${hotel.id}`);
      return new HotelEntity(hotel);
    } catch (error) {
      this.logger.error(`Error creating hotel: ${error.message}`, error.stack);
      
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A hotel with the same name already exists');
        }
      }
      
      throw new InternalServerErrorException('Failed to create hotel');
    }
  }

  /**
   * Find all hotels with pagination and filtering
   */
  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    minRating?: number,
    maxRating?: number,
    amenities?: string[],
    city?: string,
    countryCode?: string,
    isActive?: boolean
  ): Promise<PaginatedResult<HotelEntity>> {
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // Limit page size to 100

    const where: Prisma.HotelWhereInput = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minRating !== undefined || maxRating !== undefined) {
      where.starRating = {};
      if (minRating !== undefined) where.starRating.gte = minRating;
      if (maxRating !== undefined) where.starRating.lte = maxRating;
    }

    if (amenities && amenities.length > 0) {
      where.amenities = {
        hasEvery: amenities,
      };
    }

    if (city) {
      where.city = { equals: city, mode: 'insensitive' };
    }

    if (countryCode) {
      where.countryCode = { equals: countryCode.toUpperCase() };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    try {
      const [total, items] = await Promise.all([
        this.prisma.hotel.count({ where }),
        this.prisma.hotel.findMany({
          skip,
          take,
          where,
          orderBy: { name: 'asc' },
        }),
      ]);

      return {
        data: items.map(hotel => new HotelEntity(hotel)),
        meta: {
          total,
          page,
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      };
    } catch (error) {
      this.logger.error(`Error finding hotels: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve hotels');
    }
  }

  /**
   * Find a hotel by ID
   */
  async findOne(id: string): Promise<HotelEntity> {
    try {
      const hotel = await this.prisma.hotel.findUnique({
        where: { id },
      });

      if (!hotel) {
        throw new NotFoundException(`Hotel with ID ${id} not found`);
      }

      return new HotelEntity(hotel);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error finding hotel ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve hotel');
    }
  }

  /**
   * Update a hotel
   */
  async update(id: string, updateHotelDto: UpdateHotelDto): Promise<HotelEntity> {
    try {
      // Check if hotel exists
      await this.findOne(id);

      const updatedHotel = await this.prisma.hotel.update({
        where: { id },
        data: {
          ...updateHotelDto,
          // Handle array updates properly
          ...(updateHotelDto.amenities !== undefined && { 
            amenities: updateHotelDto.amenities 
          }),
          ...(updateHotelDto.images !== undefined && { 
            images: updateHotelDto.images 
          }),
        },
      });

      this.logger.log(`Hotel updated: ${id}`);
      return new HotelEntity(updatedHotel);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error updating hotel ${id}: ${error.message}`, error.stack);
      
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A hotel with the same name already exists');
        }
      }
      
      throw new InternalServerErrorException('Failed to update hotel');
    }
  }

  /**
   * Remove a hotel
   */
  async remove(id: string): Promise<void> {
    try {
      // Check if hotel exists
      await this.findOne(id);

      // Check if there are any rooms or bookings associated with this hotel
      const roomsCount = await this.prisma.room.count({
        where: { hotelId: id },
      });

      if (roomsCount > 0) {
        throw new BadRequestException('Cannot delete hotel with existing rooms');
      }

      const bookingsCount = await this.prisma.booking.count({
        where: { 
          type: 'HOTEL',
          bookingData: {
            path: ['hotel', 'id'],
            equals: id,
          },
        },
      });

      if (bookingsCount > 0) {
        throw new BadRequestException('Cannot delete hotel with existing bookings');
      }

      await this.prisma.hotel.delete({
        where: { id },
      });

      this.logger.log(`Hotel deleted: ${id}`);
    } catch (error) {
      if (
        error instanceof NotFoundException || 
        error instanceof BadRequestException
      ) {
        throw error;
      }
      
      this.logger.error(`Error deleting hotel ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to delete hotel');
    }
  }

  /**
   * Toggle hotel active status
   */
  async toggleStatus(id: string): Promise<HotelEntity> {
    try {
      const hotel = await this.findOne(id);
      
      const updatedHotel = await this.prisma.hotel.update({
        where: { id },
        data: { 
          isActive: !hotel.isActive,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Hotel ${id} status toggled to ${updatedHotel.isActive ? 'active' : 'inactive'}`);
      return new HotelEntity(updatedHotel);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error toggling status for hotel ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to toggle hotel status');
    }
  }
}
