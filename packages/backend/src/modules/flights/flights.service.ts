// @ts-nocheck
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma/prisma.service';
import { AmadeusService } from './services/amadeus.service';
import { SabreService } from './services/sabre.service';
import { FlightSearchDto, FlightBookingDto } from './dto';

@Injectable()
export class FlightsService {
  private readonly logger = new Logger(FlightsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private amadeusService: AmadeusService,
    private sabreService: SabreService,
  ) {}

  async searchFlights(searchDto: FlightSearchDto) {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      passengers,
      cabinClass,
      tripType,
    } = searchDto;

    try {
      // Search flights using multiple providers
      const [amadeusResults, sabreResults] = await Promise.allSettled([
        this.amadeusService.searchFlights({
          origin,
          destination,
          departureDate,
          returnDate,
          passengers,
          cabinClass,
          tripType,
        }),
        this.sabreService.searchFlights({
          origin,
          destination,
          departureDate,
          returnDate,
          passengers,
          cabinClass,
          tripType,
        }),
      ]);

      // Combine and deduplicate results
      const flights = [];

      if (amadeusResults.status === 'fulfilled') {
        flights.push(...amadeusResults.value.flights);
      }

      if (sabreResults.status === 'fulfilled') {
        flights.push(...sabreResults.value.flights);
      }

      // Sort by price
      flights.sort((a, b) => a.price - b.price);

      // Add markup for profit
      const flightsWithMarkup = flights.map(flight => ({
        ...flight,
        originalPrice: flight.price,
        price: this.addMarkup(flight.price, 'FLIGHT'),
      }));

      return {
        flights: flightsWithMarkup,
        searchId: this.generateSearchId(),
        totalResults: flights.length,
        providers: ['Amadeus', 'Sabre'],
      };
    } catch (error) {
      this.logger.error('Flight search failed', error);
      throw new BadRequestException('Flight search failed');
    }
  }

  async getFlightDetails(flightId: string, provider: string) {
    try {
      switch (provider.toLowerCase()) {
        case 'amadeus':
          return await this.amadeusService.getFlightDetails(flightId);
        case 'sabre':
          return await this.sabreService.getFlightDetails(flightId);
        default:
          throw new BadRequestException('Unsupported flight provider');
      }
    } catch (error) {
      this.logger.error('Failed to get flight details', error);
      throw new BadRequestException('Failed to get flight details');
    }
  }

  async bookFlight(userId: string, bookingDto: FlightBookingDto) {
    const {
      flightId,
      provider,
      passengers,
      contactInfo,
      paymentInfo,
    } = bookingDto;

    try {
      // Get flight details
      const flightDetails = await this.getFlightDetails(flightId, provider);

      // Calculate total price
      const totalPrice = this.calculateTotalPrice(flightDetails, passengers);

      // Create booking record
      const booking = await this.prisma.booking.create({
        data: {
          userId,
          type: 'FLIGHT',
          reference: this.generateBookingReference('FL'),
          totalAmount: totalPrice,
          currency: flightDetails.currency,
          bookingData: {
            flight: flightDetails,
            passengers,
            contactInfo,
            provider,
          },
          status: 'PENDING',
          paymentStatus: 'PENDING',
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        },
      });

      // Reserve seats with provider
      let reservationResult;
      switch (provider.toLowerCase()) {
        case 'amadeus':
          reservationResult = await this.amadeusService.reserveFlight({
            flightId,
            passengers,
            contactInfo,
            bookingReference: booking.reference,
          });
          break;
        case 'sabre':
          reservationResult = await this.sabreService.reserveFlight({
            flightId,
            passengers,
            contactInfo,
            bookingReference: booking.reference,
          });
          break;
        default:
          throw new BadRequestException('Unsupported flight provider');
      }

      // Update booking with reservation details
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: {
          bookingData: {
            ...booking.bookingData,
            reservation: reservationResult,
          },
        },
      });

      this.logger.log(`Flight booking created: ${booking.reference}`);
      return booking;
    } catch (error) {
      this.logger.error('Flight booking failed', error);
      throw new BadRequestException('Flight booking failed');
    }
  }

  async confirmFlightBooking(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    const { provider, reservation } = booking.bookingData as any;

    try {
      let confirmationResult;
      switch (provider.toLowerCase()) {
        case 'amadeus':
          confirmationResult = await this.amadeusService.confirmBooking(
            reservation.pnr
          );
          break;
        case 'sabre':
          confirmationResult = await this.sabreService.confirmBooking(
            reservation.pnr
          );
          break;
        default:
          throw new BadRequestException('Unsupported flight provider');
      }

      // Update booking with confirmation
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date(),
          bookingData: {
            ...booking.bookingData,
            confirmation: confirmationResult,
          },
        },
      });

      // Generate e-ticket
      await this.generateETicket(bookingId);

      this.logger.log(`Flight booking confirmed: ${booking.reference}`);
      return confirmationResult;
    } catch (error) {
      this.logger.error('Flight booking confirmation failed', error);
      throw new BadRequestException('Flight booking confirmation failed');
    }
  }

  async cancelFlightBooking(bookingId: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    const { provider, reservation } = booking.bookingData as any;

    try {
      let cancellationResult;
      switch (provider.toLowerCase()) {
        case 'amadeus':
          cancellationResult = await this.amadeusService.cancelBooking(
            reservation.pnr,
            reason
          );
          break;
        case 'sabre':
          cancellationResult = await this.sabreService.cancelBooking(
            reservation.pnr,
            reason
          );
          break;
        default:
          throw new BadRequestException('Unsupported flight provider');
      }

      // Update booking status
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          notes: reason,
          bookingData: {
            ...booking.bookingData,
            cancellation: cancellationResult,
          },
        },
      });

      this.logger.log(`Flight booking cancelled: ${booking.reference}`);
      return cancellationResult;
    } catch (error) {
      this.logger.error('Flight booking cancellation failed', error);
      throw new BadRequestException('Flight booking cancellation failed');
    }
  }

  async getFlightStatus(pnr: string, provider: string) {
    try {
      switch (provider.toLowerCase()) {
        case 'amadeus':
          return await this.amadeusService.getFlightStatus(pnr);
        case 'sabre':
          return await this.sabreService.getFlightStatus(pnr);
        default:
          throw new BadRequestException('Unsupported flight provider');
      }
    } catch (error) {
      this.logger.error('Failed to get flight status', error);
      throw new BadRequestException('Failed to get flight status');
    }
  }

  private addMarkup(price: number, type: string): number {
    // Add markup based on booking type and price range
    let markupPercentage = 0.05; // 5% default

    if (type === 'FLIGHT') {
      if (price < 200) markupPercentage = 0.08; // 8% for low-cost flights
      else if (price > 1000) markupPercentage = 0.03; // 3% for expensive flights
    }

    return Math.round(price * (1 + markupPercentage));
  }

  private calculateTotalPrice(flight: any, passengers: any[]): number {
    const basePrice = flight.price;
    const passengerCount = passengers.length;
    const taxes = flight.taxes || 0;
    const fees = flight.fees || 0;

    return (basePrice * passengerCount) + taxes + fees;
  }

  private generateSearchId(): string {
    return `SEARCH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateBookingReference(prefix: string): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  private async generateETicket(bookingId: string) {
    // Implementation for e-ticket generation
    // This would typically involve creating a PDF with flight details
    this.logger.log(`E-ticket generation requested for booking: ${bookingId}`);
  }

  // Admin functions
  async getFlightBookings(page = 1, limit = 10, filters?: any) {
    const skip = (page - 1) * limit;
    const where: any = { type: 'FLIGHT' };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
