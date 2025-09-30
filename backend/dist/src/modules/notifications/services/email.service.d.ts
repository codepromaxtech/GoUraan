import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private readonly logger;
    private transporter;
    private templates;
    constructor(configService: ConfigService);
    private initializeTransporter;
    private loadTemplates;
    sendEmail(data: {
        to: string | string[];
        subject: string;
        template?: string;
        html?: string;
        text?: string;
        data?: any;
        attachments?: any[];
    }): Promise<{
        success: boolean;
        messageId: any;
        response: any;
    }>;
    sendBookingConfirmation(data: {
        to: string;
        userName: string;
        bookingReference: string;
        bookingType: string;
        totalAmount: number;
        currency: string;
        bookingDetails: any;
    }): Promise<{
        success: boolean;
        messageId: any;
        response: any;
    }>;
    sendPaymentSuccess(data: {
        to: string;
        userName: string;
        bookingReference: string;
        amount: number;
        currency: string;
        paymentMethod: string;
        transactionId: string;
    }): Promise<{
        success: boolean;
        messageId: any;
        response: any;
    }>;
    sendFlightReminder(data: {
        to: string;
        userName: string;
        flightDetails: {
            flightNumber: string;
            departure: {
                airport: string;
                city: string;
                time: string;
            };
            arrival: {
                airport: string;
                city: string;
                time: string;
            };
        };
        bookingReference: string;
        checkInUrl?: string;
    }): Promise<{
        success: boolean;
        messageId: any;
        response: any;
    }>;
    sendPasswordReset(data: {
        to: string;
        userName: string;
        resetToken: string;
        resetUrl: string;
    }): Promise<{
        success: boolean;
        messageId: any;
        response: any;
    }>;
    sendWelcomeEmail(data: {
        to: string;
        userName: string;
        verificationUrl?: string;
    }): Promise<{
        success: boolean;
        messageId: any;
        response: any;
    }>;
    sendPromotionalEmail(data: {
        to: string[];
        subject: string;
        content: string;
        ctaText?: string;
        ctaUrl?: string;
        imageUrl?: string;
    }): Promise<{
        success: boolean;
        messageId: any;
        response: any;
    }>;
    sendDocumentRequest(data: {
        to: string;
        userName: string;
        bookingReference: string;
        requiredDocuments: string[];
        uploadUrl: string;
        deadline: string;
    }): Promise<{
        success: boolean;
        messageId: any;
        response: any;
    }>;
    private htmlToText;
    sendBulkEmail(emails: Array<{
        to: string;
        subject: string;
        template?: string;
        html?: string;
        data?: any;
    }>): Promise<any[]>;
    sendNewsletterToSegment(data: {
        segment: string[];
        subject: string;
        content: string;
        ctaText?: string;
        ctaUrl?: string;
    }): Promise<any[]>;
}
