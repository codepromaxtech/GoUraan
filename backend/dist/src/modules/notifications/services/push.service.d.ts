import { ConfigService } from '@nestjs/config';
export declare class PushService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    private initializeFirebase;
    sendPushNotification(data: {
        tokens: string[];
        title: string;
        body: string;
        data?: Record<string, string>;
        imageUrl?: string;
        clickAction?: string;
    }): Promise<{
        success: boolean;
        successCount: number;
        failureCount: number;
        responses: import("firebase-admin/lib/messaging/messaging-api").SendResponse[];
    }>;
    sendToTopic(data: {
        topic: string;
        title: string;
        body: string;
        data?: Record<string, string>;
        imageUrl?: string;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
    subscribeToTopic(tokens: string[], topic: string): Promise<{
        success: boolean;
        successCount: number;
        failureCount: number;
    }>;
    unsubscribeFromTopic(tokens: string[], topic: string): Promise<{
        success: boolean;
        successCount: number;
        failureCount: number;
    }>;
    sendBookingConfirmation(data: {
        tokens: string[];
        userName: string;
        bookingReference: string;
        bookingType: string;
    }): Promise<{
        success: boolean;
        successCount: number;
        failureCount: number;
        responses: import("firebase-admin/lib/messaging/messaging-api").SendResponse[];
    }>;
    sendPaymentSuccess(data: {
        tokens: string[];
        userName: string;
        bookingReference: string;
        amount: number;
        currency: string;
    }): Promise<{
        success: boolean;
        successCount: number;
        failureCount: number;
        responses: import("firebase-admin/lib/messaging/messaging-api").SendResponse[];
    }>;
    sendFlightReminder(data: {
        tokens: string[];
        userName: string;
        flightNumber: string;
        departureTime: string;
        hoursUntilFlight: number;
    }): Promise<{
        success: boolean;
        successCount: number;
        failureCount: number;
        responses: import("firebase-admin/lib/messaging/messaging-api").SendResponse[];
    }>;
    sendDocumentReminder(data: {
        tokens: string[];
        userName: string;
        bookingReference: string;
        documentsNeeded: string[];
    }): Promise<{
        success: boolean;
        successCount: number;
        failureCount: number;
        responses: import("firebase-admin/lib/messaging/messaging-api").SendResponse[];
    }>;
    sendPromotionalNotification(data: {
        tokens: string[];
        title: string;
        message: string;
        imageUrl?: string;
        ctaUrl?: string;
        campaignId?: string;
    }): Promise<{
        success: boolean;
        successCount: number;
        failureCount: number;
        responses: import("firebase-admin/lib/messaging/messaging-api").SendResponse[];
    }>;
    sendSystemAlert(data: {
        tokens: string[];
        title: string;
        message: string;
        severity: 'info' | 'warning' | 'error';
    }): Promise<{
        success: boolean;
        successCount: number;
        failureCount: number;
        responses: import("firebase-admin/lib/messaging/messaging-api").SendResponse[];
    }>;
    sendBulkNotifications(notifications: Array<{
        tokens: string[];
        title: string;
        body: string;
        data?: Record<string, string>;
    }>): Promise<any[]>;
    sendToAllUsers(data: {
        title: string;
        body: string;
        data?: Record<string, string>;
        imageUrl?: string;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
    sendToPremiumUsers(data: {
        title: string;
        body: string;
        data?: Record<string, string>;
        imageUrl?: string;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
    sendToHajjCustomers(data: {
        title: string;
        body: string;
        data?: Record<string, string>;
        imageUrl?: string;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
    validateTokens(tokens: string[]): Promise<string[]>;
}
