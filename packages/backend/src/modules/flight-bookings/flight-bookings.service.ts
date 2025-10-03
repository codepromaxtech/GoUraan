import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ConflictException, 
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateFlightBookingDto, 
  FlightBookingResponseDto,
  UpdateFlightBookingDto,
  SearchFlightBookingsDto,
  FlightBookingSortField,
  SortOrder
} from './dto';
import { Prisma, FlightBooking as PrismaFlightBooking } from '@prisma/client';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

interface FlightBookingWithRelations extends PrismaFlightBooking {
  flightSegments: any[];
  passengers: any[];
  tickets: any[];
  documents: any[];
}

@Injectable()
export class FlightBookingsService {
  private readonly logger = new Logger(FlightBookingsService.name);
  
  constructor(private prisma: PrismaService) {}
  
  /**
   * Map Prisma FlightBooking model to FlightBookingResponseDto
   */
  private mapToResponseDto(booking: any): FlightBookingResponseDto {
    // Separate departure and return segments
    const departureSegments = booking.flightSegments
      .filter((segment: any) => !segment.isReturn)
      .sort((a: any, b: any) => a.departureTime.getTime() - b.departureTime.getTime());
      
    const returnSegments = booking.flightSegments
      .filter((segment: any) => segment.isReturn)
      .sort((a: any, b: any) => a.departureTime.getTime() - b.departureTime.getTime());

    // Calculate total travel time for the first departure segment
    const firstSegment = departureSegments[0];
    const lastSegment = returnSegments.length > 0 ? returnSegments[returnSegments.length - 1] : departureSegments[departureSegments.length - 1];
    
    const totalTravelTime = lastSegment ? 
      (new Date(lastSegment.arrivalTime).getTime() - new Date(firstSegment.departureTime).getTime()) / (1000 * 60) : 0;

    return {
      id: booking.id,
      bookingReference: booking.bookingReference,
      pnr: booking.pnr,
      status: booking.status,
      bookingType: booking.bookingType,
      totalFare: Number(booking.totalFare),
      currency: booking.currency,
      tax: booking.tax ? Number(booking.tax) : undefined,
      discount: booking.discount ? Number(booking.discount) : 0,
      paymentStatus: booking.paymentStatus,
      notes: booking.notes,
      specialRequests: booking.specialRequests,
      isRefundable: booking.isRefundable,
      cancellationPolicy: booking.cancellationPolicy,
      baggageInfo: booking.baggageInfo,
      flightSegments: departureSegments,
      passengers: booking.passengers || [],
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      cancelledAt: booking.cancelledAt || undefined,
      cancellationReason: booking.cancellationReason,
      confirmedAt: booking.confirmedAt || undefined,
      paymentMethod: booking.paymentMethod,
      paymentTransactionId: booking.paymentTransactionId,
      bookedBy: booking.bookedBy,
      contactEmail: booking.contactEmail,
      contactPhone: booking.contactPhone,
      frequentFlyerNumber: booking.frequentFlyerNumber,
      seatPreference: booking.seatPreference,
      mealPreference: booking.mealPreference,
      specialAssistance: booking.specialAssistance,
      isRoundTrip: returnSegments.length > 0,
      returnSegments: returnSegments.length > 0 ? returnSegments : undefined,
      totalTravelTime: Math.round(totalTravelTime),
      numberOfStops: Math.max(0, departureSegments.length - 1),
      isDirect: departureSegments.length === 1 && (returnSegments.length === 0 || returnSegments.length === 1),
      airlineBookingReference: booking.airlineBookingReference,
      eticketNumber: booking.eticketNumber,
      bookingSource: booking.bookingSource,
      agencyReference: booking.agencyReference,
      documents: booking.documents || []
    };
  }

  /**
   * Create a new flight booking
   */
  async create(createFlightBookingDto: CreateFlightBookingDto): Promise<FlightBookingResponseDto> {
    const { flightSegments, passengers, returnSegments, ...bookingData } = createFlightBookingDto;

    try {
      return await this.prisma.$transaction(async (prisma) => {
        // Check if PNR already exists
        const existingBooking = await prisma.flightBooking.findUnique({
          where: { pnr: bookingData.pnr },
        });

        if (existingBooking) {
          throw new ConflictException(`A booking with PNR ${bookingData.pnr} already exists`);
        }

        // Process departure segments
        const processedSegments = flightSegments.map(segment => ({
          ...segment,
          departureTime: new Date(segment.departureTime),
          arrivalTime: new Date(segment.arrivalTime),
        }));

        // Process return segments if they exist
        const processedReturnSegments = returnSegments?.map(segment => ({
          ...segment,
          departureTime: new Date(segment.departureTime),
          arrivalTime: new Date(segment.arrivalTime),
          isReturn: true,
        })) || [];

        // Process passengers
        const processedPassengers = passengers.map(passenger => ({
          ...passenger,
          dateOfBirth: new Date(passenger.dateOfBirth),
        }));

        // Create the flight booking with all related data
        const booking = await prisma.flightBooking.create({
          data: {
            ...bookingData,
            bookingDate: bookingData.bookingDate ? new Date(bookingData.bookingDate) : new Date(),
            issueDate: bookingData.issueDate ? new Date(bookingData.issueDate) : new Date(),
            flightSegments: {
              create: [...processedSegments, ...processedReturnSegments],
            },
            passengers: {
              create: processedPassengers,
            },
          },
          include: {
            flightSegments: true,
            passengers: true,
            tickets: true,
            documents: true,
          },
        });

        return this.mapToResponseDto(booking);
      });
    } catch (error) {
      this.logger.error(`Error creating flight booking: ${error.message}`, error.stack);
      
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A booking with this reference already exists');
        }
      }
      
      throw new InternalServerErrorException('Failed to create flight booking');
    }
  }

  /**
   * Find all flight bookings with pagination and filtering
   */
  async findAll(
    searchParams: SearchFlightBookingsDto
  ): Promise<PaginatedResult<FlightBookingResponseDto>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'bookingDate',
      sortOrder = 'desc',
      searchTerm,
      status,
      departureAirport,
      arrivalAirport,
      departureDate,
      bookingDateFrom,
      bookingDateTo,
      includeCancelled = false,
    } = searchParams;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // Limit page size to 100

    // Build the where clause
    const where: Prisma.FlightBookingWhereInput = {};
    
    if (searchTerm) {
      where.OR = [
        { bookingReference: { contains: searchTerm, mode: 'insensitive' } },
        { pnr: { contains: searchTerm, mode: 'insensitive' } },
        { contactEmail: { contains: searchTerm, mode: 'insensitive' } },
        { contactPhone: { contains: searchTerm, mode: 'insensitive' } },
        {
          passengers: {
            some: {
              OR: [
                { firstName: { contains: searchTerm, mode: 'insensitive' } },
                { lastName: { contains: searchTerm, mode: 'insensitive' } },
                { passportNumber: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    } else if (!includeCancelled) {
      where.status = { not: 'CANCELLED' };
    }

    if (departureAirport) {
      where.flightSegments = {
        some: {
          departureAirport: { equals: departureAirport, mode: 'insensitive' },
          isReturn: false,
        },
      };
    }

    if (arrivalAirport) {
      where.flightSegments = {
        ...where.flightSegments,
        some: {
          ...(where.flightSegments as any)?.some,
          arrivalAirport: { equals: arrivalAirport, mode: 'insensitive' },
          isReturn: false,
        },
      };
    }

    if (departureDate) {
      const startDate = new Date(departureDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(departureDate);
      endDate.setHours(23, 59, 59, 999);
      
      where.flightSegments = {
        ...where.flightSegments,
        some: {
          ...(where.flightSegments as any)?.some,
          departureTime: {
            gte: startDate,
            lte: endDate,
          },
          isReturn: false,
        },
      };
    }

    if (bookingDateFrom || bookingDateTo) {
      where.bookingDate = {};
      
      if (bookingDateFrom) {
        const fromDate = new Date(bookingDateFrom);
        fromDate.setHours(0, 0, 0, 0);
        where.bookingDate.gte = fromDate;
      }
      
      if (bookingDateTo) {
        const toDate = new Date(bookingDateTo);
        toDate.setHours(23, 59, 59, 999);
        where.bookingDate.lte = toDate;
      }
    }

    // Build orderBy
    const orderBy: Prisma.FlightBookingOrderByWithRelationInput = {};
    orderBy[sortBy as keyof Prisma.FlightBookingOrderByWithRelationInput] = sortOrder.toLowerCase() as 'asc' | 'desc';

    try {
      const [total, items] = await Promise.all([
        this.prisma.flightBooking.count({ where }),
        this.prisma.flightBooking.findMany({
          skip,
          take,
          where,
          orderBy,
          include: {
            flightSegments: true,
            passengers: true,
            tickets: true,
          },
        }),
      ]);

      return {
        data: items.map(booking => this.mapToResponseDto(booking)),
        meta: {
          total,
          page,
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      };
    } catch (error) {
      this.logger.error(`Error finding flight bookings: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve flight bookings');
    }
  }

  /**
   * Find a flight booking by ID
   */
  async findOne(id: string): Promise<FlightBookingResponseDto> {
    try {
      const booking = await this.prisma.flightBooking.findUnique({
        where: { id },
        include: {
          flightSegments: true,
          passengers: true,
          tickets: true,
          documents: true,
        },
      });

      if (!booking) {
        throw new NotFoundException(`Flight booking with ID ${id} not found`);
      }

      return this.mapToResponseDto(booking);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding flight booking ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve flight booking');
    }
  }

  /**
   * Find a flight booking by booking reference
   */
  async findByReference(bookingReference: string): Promise<FlightBookingResponseDto> {
    try {
      const booking = await this.prisma.flightBooking.findUnique({
        where: { bookingReference },
        include: {
          flightSegments: true,
          passengers: true,
          tickets: true,
          documents: true,
        },
      });

      if (!booking) {
        throw new NotFoundException(`Flight booking with reference ${bookingReference} not found`);
      }

      return this.mapToResponseDto(booking);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error finding flight booking with reference ${bookingReference}: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Failed to retrieve flight booking');
    }
  }

  /**
   * Find a flight booking by PNR (Passenger Name Record)
   */
  async findByPnr(pnr: string): Promise<FlightBookingResponseDto> {
    try {
      const booking = await this.prisma.flightBooking.findUnique({
        where: { pnr },
        include: {
          flightSegments: {
            orderBy: {
              departureTime: 'asc',
            },
          },
          passengers: true,
          tickets: true,
          documents: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!booking) {
        throw new NotFoundException(`Flight booking with PNR ${pnr} not found`);
      }

      return this.mapToResponseDto(booking);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding flight booking with PNR ${pnr}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve flight booking');
    }
  }

  /**
   * Update a flight booking
   */
  async update(id: string, updateData: UpdateFlightBookingDto): Promise<FlightBookingResponseDto> {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        // Check if booking exists and get current data
        const existingBooking = await prisma.flightBooking.findUnique({
          where: { id },
          include: {
            flightSegments: true,
            passengers: true,
            tickets: true,
            documents: true,
          },
        });

        if (!existingBooking) {
          throw new NotFoundException(`Flight booking with ID ${id} not found`);
        }

        // Prevent updating certain fields directly
        const { bookingReference, pnr, id: _, ...safeUpdateData } = updateData;

        // Update the booking
        const updatedBooking = await prisma.flightBooking.update({
          where: { id },
          data: safeUpdateData,
          include: {
            flightSegments: true,
            passengers: true,
            tickets: true,
            documents: true,
          },
        });

        return this.mapToResponseDto(updatedBooking);
      });
    } catch (error) {
      this.logger.error(`Error updating flight booking ${id}: ${error.message}`, error.stack);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A booking with this reference already exists');
        }
      }
      
      throw new InternalServerErrorException('Failed to update flight booking');
    }
  }

  /**
   * Cancel a flight booking
   */
  async cancel(id: string, reason?: string): Promise<FlightBookingResponseDto> {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        // Check if booking exists and get current data
        const existingBooking = await prisma.flightBooking.findUnique({
          where: { id },
          include: {
            flightSegments: true,
            passengers: true,
            tickets: true,
            documents: true,
          },
        });

        if (!existingBooking) {
          throw new NotFoundException(`Flight booking with ID ${id} not found`);
        }

        if (existingBooking.status === 'CANCELLED') {
          throw new BadRequestException('Booking is already cancelled');
        }

        // Update the booking status to CANCELLED
        const cancelledBooking = await prisma.flightBooking.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            cancellationReason: reason || 'Cancelled by user',
            // Also cancel all associated tickets
            tickets: {
              updateMany: {
                where: { status: { not: 'CANCELLED' } },
                data: { status: 'CANCELLED', updatedAt: new Date() },
              },
            },
          },
          include: {
            flightSegments: true,
            passengers: true,
            tickets: true,
            documents: true,
          },
        });

        return this.mapToResponseDto(cancelledBooking);
      });
    } catch (error) {
      this.logger.error(`Error cancelling flight booking ${id}: ${error.message}`, error.stack);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to cancel flight booking');
    }
  }

  /**
   * Delete a flight booking
   * Note: This is a hard delete. Use cancel() for soft delete functionality.
   */
  async remove(id: string): Promise<void> {
    try {
      await this.prisma.$transaction(async (prisma) => {
        // Check if booking exists
        const booking = await prisma.flightBooking.findUnique({
          where: { id },
          include: {
            tickets: {
              select: { id: true },
            },
          },
        });

        if (!booking) {
          throw new NotFoundException(`Flight booking with ID ${id} not found`);
        }

        // Delete related records in the correct order to avoid foreign key constraints
        if (booking.tickets.length > 0) {
          await prisma.ticket.deleteMany({
            where: { bookingId: id },
          });
        }

        // Delete the booking
        await prisma.flightBooking.delete({
          where: { id },
        });
      });
      
      this.logger.log(`Successfully deleted flight booking ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting flight booking ${id}: ${error.message}`, error.stack);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException('Cannot delete booking with associated records. Cancel it first.');
        }
      }
      
      throw new InternalServerErrorException('Failed to delete flight booking');
    }
  }

  /**
   * Generate a ticket for a passenger in a booking
   */
  async generateTicket(bookingId: string, passengerId: string, ticketNumber: string) {
    // Check if booking and passenger exist
    const booking = await this.findOne(bookingId);
    const passenger = booking.passengers.find(p => p.id === passengerId);
    
    if (!passenger) {
      throw new NotFoundException(`Passenger with ID ${passengerId} not found in booking ${bookingId}`);
    }

    // Check if ticket already exists for this passenger
    const existingTicket = await this.prisma.ticket.findFirst({
      where: {
        bookingId,
        passengerId,
      },
    });

    if (existingTicket) {
      throw new BadRequestException('Ticket already exists for this passenger');
    }

    // Create the ticket
    return this.prisma.ticket.create({
      data: {
        bookingId,
        passengerId,
        ticketNumber,
        status: 'ISSUED',
      },
    });
  }

  /**
   * Generate a booking report with summary statistics
   */
  async getBookingReport(params: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    issuedBy?: string;
  }) {
    const { startDate, endDate, status, issuedBy } = params;
    
    const where: Prisma.FlightBookingWhereInput = {};
    
    if (startDate || endDate) {
      where.bookingDate = {};
      if (startDate) where.bookingDate.gte = new Date(startDate);
      if (endDate) where.bookingDate.lte = new Date(endDate);
    }
    
    if (status) where.status = status;
    if (issuedBy) where.issuedBy = issuedBy;

    const bookings = await this.prisma.flightBooking.findMany({
      where,
      include: {
        flightSegments: true,
        passengers: true,
        tickets: true,
      },
    });

    // Calculate summary statistics
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.totalFare), 0);
    const totalProfit = bookings.reduce((sum, booking) => sum + Number(booking.profit), 0);
    const totalPassengers = bookings.reduce((sum, booking) => sum + booking.passengers.length, 0);

    return {
      summary: {
        totalBookings,
        totalRevenue,
        totalProfit,
        totalPassengers,
        averageRevenuePerBooking: totalBookings > 0 ? totalRevenue / totalBookings : 0,
      },
      bookings,
    };
  }
}
