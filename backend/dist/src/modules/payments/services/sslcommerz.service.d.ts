import { ConfigService } from '@nestjs/config';
export declare class SslcommerzService {
    private configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly storeId;
    private readonly storePassword;
    constructor(configService: ConfigService);
    initiatePayment(data: {
        amount: number;
        currency: string;
        orderId: string;
        customerName: string;
        customerEmail: string;
        customerPhone?: string;
        productName: string;
        productCategory: string;
        successUrl: string;
        failUrl: string;
        cancelUrl: string;
        ipnUrl: string;
    }): Promise<{
        success: boolean;
        sessionKey: any;
        gatewayUrl: any;
        transactionId: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        sessionKey?: undefined;
        gatewayUrl?: undefined;
        transactionId?: undefined;
    }>;
    processPayment(data: {
        amount: number;
        currency: string;
        transactionId: string;
    }): Promise<{
        success: boolean;
        transactionId: any;
        status: any;
        amount: number;
        currency: any;
        bankTransactionId: any;
        cardType: any;
        cardNo: any;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        status: any;
        transactionId?: undefined;
        amount?: undefined;
        currency?: undefined;
        bankTransactionId?: undefined;
        cardType?: undefined;
        cardNo?: undefined;
    } | {
        success: boolean;
        error: any;
        transactionId?: undefined;
        status?: undefined;
        amount?: undefined;
        currency?: undefined;
        bankTransactionId?: undefined;
        cardType?: undefined;
        cardNo?: undefined;
    }>;
    refundPayment(data: {
        transactionId: string;
        amount: number;
        reason?: string;
    }): Promise<{
        success: boolean;
        refundId: any;
        status: any;
        amount: number;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        refundId?: undefined;
        status?: undefined;
        amount?: undefined;
    }>;
    handleWebhook(payload: any): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    private verifyWebhookSignature;
    private handlePaymentSuccess;
    private handlePaymentFailure;
    private handlePaymentCancellation;
}
