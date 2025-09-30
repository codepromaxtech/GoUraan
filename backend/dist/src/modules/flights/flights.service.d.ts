import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma/prisma.service';
import { AmadeusService } from './services/amadeus.service';
import { SabreService } from './services/sabre.service';
import { FlightSearchDto, FlightBookingDto } from './dto';
export declare class FlightsService {
    private prisma;
    private configService;
    private amadeusService;
    private sabreService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService, amadeusService: AmadeusService, sabreService: SabreService);
    searchFlights(searchDto: FlightSearchDto): Promise<{
        flights: any[];
        searchId: string;
        totalResults: number;
        providers: string[];
    }>;
    getFlightDetails(flightId: string, provider: string): Promise<any>;
    bookFlight(userId: string, bookingDto: FlightBookingDto): Promise<{
        id: string;
        userId: string;
        type: import(".prisma/client").$Enums.BookingType;
        status: import(".prisma/client").$Enums.BookingStatus;
        reference: string;
        totalAmount: number;
        currency: import(".prisma/client").$Enums.Currency;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        bookingData: import(".prisma/client").Prisma.JsonValue;
        metadata: import(".prisma/client").Prisma.JsonValue | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date | null;
        confirmedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    confirmFlightBooking(bookingId: string): Promise<any>;
    cancelFlightBooking(bookingId: string, reason?: string): Promise<any>;
    getFlightStatus(pnr: string, provider: string): Promise<{
        pnr: string;
        status: any;
        departure: any;
        arrival: any;
        aircraft: any;
    }>;
    private addMarkup;
    private calculateTotalPrice;
    private generateSearchId;
    private generateBookingReference;
    private generateETicket;
    getFlightBookings(page?: number, limit?: number, filters?: any): Promise<{
        bookings: ({
            user: {
                email: string;
                firstName: string;
                lastName: string;
                id: string;
            };
        } & {
            id: string;
            userId: string;
            type: import(".prisma/client").$Enums.BookingType;
            status: import(".prisma/client").$Enums.BookingStatus;
            reference: string;
            totalAmount: number;
            currency: import(".prisma/client").$Enums.Currency;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            bookingData: import(".prisma/client").Prisma.JsonValue;
            metadata: import(".prisma/client").Prisma.JsonValue | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            expiresAt: Date | null;
            confirmedAt: Date | null;
            cancelledAt: Date | null;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
