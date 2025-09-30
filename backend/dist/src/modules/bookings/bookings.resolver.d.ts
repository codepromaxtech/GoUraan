import { BookingsService } from './bookings.service';
import { BookingType as PrismaBookingType, BookingStatus, PaymentStatus } from '@prisma/client';
export declare class BookingGQLType {
    id: string;
    userId: string;
    type: PrismaBookingType;
    status: BookingStatus;
    reference: string;
    totalAmount: number;
    currency: string;
    paymentStatus: PaymentStatus;
    bookingData: any;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
    confirmedAt?: Date;
    cancelledAt?: Date;
}
export declare class BookingStatsType {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
}
export declare class CreateBookingInput {
    type: PrismaBookingType;
    totalAmount: number;
    currency?: string;
    bookingData: any;
    notes?: string;
}
export declare class UpdateBookingInput {
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
    totalAmount?: number;
    bookingData?: any;
    notes?: string;
}
export declare class BookingsResolver {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    createBooking(user: any, input: CreateBookingInput): Promise<BookingGQLType>;
    myBookings(user: any, page: number, limit: number): Promise<({
        payments: {
            id: string;
            bookingId: string;
            userId: string;
            amount: number;
            currency: import(".prisma/client").$Enums.Currency;
            method: import(".prisma/client").$Enums.PaymentMethod;
            gateway: import(".prisma/client").$Enums.PaymentGateway;
            status: import(".prisma/client").$Enums.PaymentStatus;
            gatewayTransactionId: string | null;
            gatewayResponse: import(".prisma/client").Prisma.JsonValue | null;
            refundAmount: number | null;
            refundedAt: Date | null;
            refundReason: string | null;
            metadata: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            processedAt: Date | null;
        }[];
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
    })[]>;
    booking(user: any, id: string): Promise<BookingGQLType>;
    bookingByReference(user: any, reference: string): Promise<BookingGQLType>;
    updateBooking(user: any, id: string, input: UpdateBookingInput): Promise<BookingGQLType>;
    confirmBooking(user: any, id: string): Promise<BookingGQLType>;
    cancelBooking(user: any, id: string, reason?: string): Promise<BookingGQLType>;
    myBookingStats(user: any): Promise<BookingStatsType>;
    allBookings(page: number, limit: number): Promise<({
        user: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            id: string;
        };
        payments: {
            id: string;
            bookingId: string;
            userId: string;
            amount: number;
            currency: import(".prisma/client").$Enums.Currency;
            method: import(".prisma/client").$Enums.PaymentMethod;
            gateway: import(".prisma/client").$Enums.PaymentGateway;
            status: import(".prisma/client").$Enums.PaymentStatus;
            gatewayTransactionId: string | null;
            gatewayResponse: import(".prisma/client").Prisma.JsonValue | null;
            refundAmount: number | null;
            refundedAt: Date | null;
            refundReason: string | null;
            metadata: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            processedAt: Date | null;
        }[];
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
    })[]>;
    bookingStats(): Promise<BookingStatsType>;
}
