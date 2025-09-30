import { ConfigService } from '@nestjs/config';
export declare class SmsService {
    private configService;
    private readonly logger;
    private readonly provider;
    private readonly twilioConfig;
    private readonly sslWirelessConfig;
    constructor(configService: ConfigService);
    sendSms(data: {
        to: string;
        message: string;
        templateData?: any;
    }): Promise<{
        success: boolean;
        messageId: any;
        status: any;
        provider: string;
    }>;
    private sendViaTwilio;
    private sendViaSSLWireless;
    sendBookingConfirmationSms(data: {
        to: string;
        userName: string;
        bookingReference: string;
        bookingType: string;
        amount: number;
        currency: string;
    }): Promise<{
        success: boolean;
        messageId: any;
        status: any;
        provider: string;
    }>;
    sendPaymentSuccessSms(data: {
        to: string;
        userName: string;
        bookingReference: string;
        amount: number;
        currency: string;
    }): Promise<{
        success: boolean;
        messageId: any;
        status: any;
        provider: string;
    }>;
    sendFlightReminderSms(data: {
        to: string;
        userName: string;
        flightNumber: string;
        departureTime: string;
        departureAirport: string;
    }): Promise<{
        success: boolean;
        messageId: any;
        status: any;
        provider: string;
    }>;
    sendOtpSms(data: {
        to: string;
        otp: string;
        purpose: 'verification' | 'login' | 'password_reset';
    }): Promise<{
        success: boolean;
        messageId: any;
        status: any;
        provider: string;
    }>;
    sendDocumentReminderSms(data: {
        to: string;
        userName: string;
        bookingReference: string;
        documentsNeeded: string[];
        deadline: string;
    }): Promise<{
        success: boolean;
        messageId: any;
        status: any;
        provider: string;
    }>;
    sendPromotionalSms(data: {
        to: string[];
        message: string;
        campaignId?: string;
    }): Promise<any[]>;
    sendBulkSms(messages: Array<{
        to: string;
        message: string;
        templateData?: any;
    }>): Promise<any[]>;
    sendLocalizedSms(data: {
        to: string;
        templateKey: string;
        language: 'en' | 'bn' | 'ar';
        variables: Record<string, string>;
    }): Promise<{
        success: boolean;
        messageId: any;
        status: any;
        provider: string;
    }>;
    formatPhoneNumber(phoneNumber: string, countryCode?: string): string;
    validatePhoneNumber(phoneNumber: string): boolean;
}
