import { PrismaService } from '@/common/prisma/prisma.service';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { PushService } from './services/push.service';
import { WhatsappService } from './services/whatsapp.service';
import { NotificationType, NotificationChannel } from '@prisma/client';
export declare class NotificationsService {
    private prisma;
    private emailService;
    private smsService;
    private pushService;
    private whatsappService;
    private readonly logger;
    constructor(prisma: PrismaService, emailService: EmailService, smsService: SmsService, pushService: PushService, whatsappService: WhatsappService);
    sendNotification(data: {
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        channels: NotificationChannel[];
        templateData?: any;
        priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
        scheduledAt?: Date;
    }): Promise<{
        id: string;
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        data: import(".prisma/client").Prisma.JsonValue | null;
        isRead: boolean;
        readAt: Date | null;
        createdAt: Date;
    }>;
    processNotification(notificationId: string): Promise<void>;
    private sendEmail;
    private sendSms;
    private sendPush;
    private sendWhatsapp;
    private getEnabledChannels;
    private getEmailTemplate;
    private getWhatsappTemplate;
    sendBulkNotification(data: {
        userIds: string[];
        type: NotificationType;
        title: string;
        message: string;
        channels: NotificationChannel[];
        templateData?: any;
    }): Promise<any[]>;
    sendSegmentedNotification(data: {
        segment: 'ALL_USERS' | 'PREMIUM_USERS' | 'HAJJ_CUSTOMERS' | 'INACTIVE_USERS';
        type: NotificationType;
        title: string;
        message: string;
        channels: NotificationChannel[];
        templateData?: any;
    }): Promise<any[]>;
    private getUsersBySegment;
    getUserNotifications(userId: string, page?: number, limit?: number): Promise<{
        notifications: {
            id: string;
            userId: string;
            type: import(".prisma/client").$Enums.NotificationType;
            title: string;
            message: string;
            data: import(".prisma/client").Prisma.JsonValue | null;
            isRead: boolean;
            readAt: Date | null;
            createdAt: Date;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    markAsRead(notificationId: string, userId: string): Promise<{
        id: string;
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        data: import(".prisma/client").Prisma.JsonValue | null;
        isRead: boolean;
        readAt: Date | null;
        createdAt: Date;
    }>;
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getNotificationStats(userId?: string): Promise<{
        total: number;
        unread: number;
        sent: number;
        failed: number;
        successRate: number;
        byType: Record<string, number>;
    }>;
}
