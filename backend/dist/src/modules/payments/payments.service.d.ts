import { PrismaService } from '@/common/prisma/prisma.service';
import { CreatePaymentDto, ProcessPaymentDto, RefundPaymentDto } from './dto';
import { StripeService } from './services/stripe.service';
import { PaypalService } from './services/paypal.service';
import { SslcommerzService } from './services/sslcommerz.service';
import { HyperpayService } from './services/hyperpay.service';
import { BookingsService } from '../bookings/bookings.service';
export declare class PaymentsService {
    private prisma;
    private bookingsService;
    private stripeService;
    private paypalService;
    private sslcommerzService;
    private hyperpayService;
    private readonly logger;
    constructor(prisma: PrismaService, bookingsService: BookingsService, stripeService: StripeService, paypalService: PaypalService, sslcommerzService: SslcommerzService, hyperpayService: HyperpayService);
    createPayment(userId: string, createPaymentDto: CreatePaymentDto): Promise<{
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
    }>;
    processPayment(paymentId: string, processPaymentDto: ProcessPaymentDto): Promise<{
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
    }>;
    refundPayment(paymentId: string, refundPaymentDto: RefundPaymentDto): Promise<{
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
    }>;
    getPaymentsByBooking(bookingId: string): Promise<{
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
    }[]>;
    getPaymentsByUser(userId: string, page?: number, limit?: number): Promise<{
        payments: ({
            booking: {
                type: import(".prisma/client").$Enums.BookingType;
                reference: string;
                totalAmount: number;
            };
        } & {
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
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPaymentStats(userId?: string): Promise<{
        totalPayments: number;
        successfulPayments: number;
        failedPayments: number;
        refundedPayments: number;
        totalAmount: number;
        totalRefunded: number;
        successRate: number;
    }>;
    handleStripeWebhook(payload: any, signature: string): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    handlePaypalWebhook(payload: any): Promise<any>;
    handleSslcommerzWebhook(payload: any): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    handleHyperpayWebhook(payload: any): Promise<any>;
}
