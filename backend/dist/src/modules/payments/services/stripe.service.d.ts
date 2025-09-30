import { ConfigService } from '@nestjs/config';
export declare class StripeService {
    private configService;
    private readonly logger;
    private stripe;
    constructor(configService: ConfigService);
    processPayment(data: {
        amount: number;
        currency: string;
        paymentMethodId: string;
        metadata?: any;
    }): Promise<{
        success: boolean;
        transactionId: string;
        status: "succeeded";
        amount: number;
        currency: string;
        requiresAction?: undefined;
        clientSecret?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        requiresAction: boolean;
        clientSecret: string;
        status: "requires_action";
        transactionId?: undefined;
        amount?: undefined;
        currency?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        status: "canceled" | "processing" | "requires_capture" | "requires_confirmation" | "requires_payment_method";
        transactionId?: undefined;
        amount?: undefined;
        currency?: undefined;
        requiresAction?: undefined;
        clientSecret?: undefined;
    } | {
        success: boolean;
        error: any;
        transactionId?: undefined;
        status?: undefined;
        amount?: undefined;
        currency?: undefined;
        requiresAction?: undefined;
        clientSecret?: undefined;
    }>;
    refundPayment(data: {
        transactionId: string;
        amount?: number;
        reason?: string;
    }): Promise<{
        success: boolean;
        refundId: string;
        status: string;
        amount: number;
        currency: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        refundId?: undefined;
        status?: undefined;
        amount?: undefined;
        currency?: undefined;
    }>;
    createPaymentIntent(data: {
        amount: number;
        currency: string;
        customerId?: string;
        metadata?: any;
    }): Promise<{
        success: boolean;
        clientSecret: string;
        paymentIntentId: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        clientSecret?: undefined;
        paymentIntentId?: undefined;
    }>;
    createCustomer(data: {
        email: string;
        name: string;
        phone?: string;
        metadata?: any;
    }): Promise<{
        success: boolean;
        customerId: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        customerId?: undefined;
    }>;
    handleWebhook(payload: any, signature: string): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    private handlePaymentSucceeded;
    private handlePaymentFailed;
    private handleChargeDispute;
}
