"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const email_service_1 = require("./services/email.service");
const sms_service_1 = require("./services/sms.service");
const push_service_1 = require("./services/push.service");
const whatsapp_service_1 = require("./services/whatsapp.service");
const client_1 = require("@prisma/client");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(prisma, emailService, smsService, pushService, whatsappService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.smsService = smsService;
        this.pushService = pushService;
        this.whatsappService = whatsappService;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async sendNotification(data) {
        try {
            const notification = await this.prisma.notification.create({
                data: {
                    userId: data.userId,
                    type: data.type,
                    title: data.title,
                    message: data.message,
                    channels: data.channels,
                    priority: data.priority || 'MEDIUM',
                    status: data.scheduledAt ? client_1.NotificationStatus.SCHEDULED : client_1.NotificationStatus.PENDING,
                    scheduledAt: data.scheduledAt,
                    templateData: data.templateData,
                },
            });
            if (!data.scheduledAt) {
                await this.processNotification(notification.id);
            }
            return notification;
        }
        catch (error) {
            this.logger.error('Failed to create notification', error);
            throw error;
        }
    }
    async processNotification(notificationId) {
        const notification = await this.prisma.notification.findUnique({
            where: { id: notificationId },
            include: {
                user: {
                    include: {
                        preferences: true,
                    },
                },
            },
        });
        if (!notification) {
            this.logger.warn(`Notification not found: ${notificationId}`);
            return;
        }
        const userPrefs = notification.user.preferences;
        const enabledChannels = this.getEnabledChannels(notification.channels, userPrefs);
        if (enabledChannels.length === 0) {
            await this.prisma.notification.update({
                where: { id: notificationId },
                data: {
                    status: client_1.NotificationStatus.SKIPPED,
                    sentAt: new Date(),
                    deliveryStatus: { reason: 'User preferences disabled all channels' },
                },
            });
            return;
        }
        await this.prisma.notification.update({
            where: { id: notificationId },
            data: { status: client_1.NotificationStatus.SENDING },
        });
        const results = [];
        for (const channel of enabledChannels) {
            try {
                let result;
                switch (channel) {
                    case client_1.NotificationChannel.EMAIL:
                        result = await this.sendEmail(notification);
                        break;
                    case client_1.NotificationChannel.SMS:
                        result = await this.sendSms(notification);
                        break;
                    case client_1.NotificationChannel.PUSH:
                        result = await this.sendPush(notification);
                        break;
                    case client_1.NotificationChannel.WHATSAPP:
                        result = await this.sendWhatsapp(notification);
                        break;
                }
                results.push({ channel, success: true, result });
            }
            catch (error) {
                this.logger.error(`Failed to send ${channel} notification`, error);
                results.push({ channel, success: false, error: error.message });
            }
        }
        const allSuccessful = results.every(r => r.success);
        const anySuccessful = results.some(r => r.success);
        await this.prisma.notification.update({
            where: { id: notificationId },
            data: {
                status: allSuccessful
                    ? client_1.NotificationStatus.SENT
                    : anySuccessful
                        ? client_1.NotificationStatus.PARTIAL
                        : client_1.NotificationStatus.FAILED,
                sentAt: new Date(),
                deliveryStatus: { results },
            },
        });
        this.logger.log(`Notification processed: ${notificationId} - ${allSuccessful ? 'SUCCESS' : 'PARTIAL/FAILED'}`);
    }
    async sendEmail(notification) {
        const templateName = this.getEmailTemplate(notification.type);
        return await this.emailService.sendEmail({
            to: notification.user.email,
            subject: notification.title,
            template: templateName,
            data: {
                userName: `${notification.user.firstName} ${notification.user.lastName}`,
                title: notification.title,
                message: notification.message,
                ...notification.templateData,
            },
        });
    }
    async sendSms(notification) {
        if (!notification.user.phone) {
            throw new Error('User phone number not available');
        }
        return await this.smsService.sendSms({
            to: notification.user.phone,
            message: `${notification.title}\n\n${notification.message}`,
            templateData: notification.templateData,
        });
    }
    async sendPush(notification) {
        const devices = await this.prisma.userDevice.findMany({
            where: {
                userId: notification.userId,
                isActive: true,
            },
        });
        if (devices.length === 0) {
            throw new Error('No active devices found for user');
        }
        const tokens = devices.map(d => d.pushToken).filter(Boolean);
        return await this.pushService.sendPushNotification({
            tokens,
            title: notification.title,
            body: notification.message,
            data: {
                type: notification.type,
                notificationId: notification.id,
                ...notification.templateData,
            },
        });
    }
    async sendWhatsapp(notification) {
        if (!notification.user.phone) {
            throw new Error('User phone number not available');
        }
        return await this.whatsappService.sendMessage({
            to: notification.user.phone,
            message: notification.message,
            templateName: this.getWhatsappTemplate(notification.type),
            templateData: notification.templateData,
        });
    }
    getEnabledChannels(requestedChannels, userPrefs) {
        if (!userPrefs)
            return requestedChannels;
        return requestedChannels.filter(channel => {
            switch (channel) {
                case client_1.NotificationChannel.EMAIL:
                    return userPrefs.emailNotifications;
                case client_1.NotificationChannel.SMS:
                    return userPrefs.smsNotifications;
                case client_1.NotificationChannel.PUSH:
                    return userPrefs.pushNotifications;
                case client_1.NotificationChannel.WHATSAPP:
                    return userPrefs.whatsappNotifications || false;
                default:
                    return true;
            }
        });
    }
    getEmailTemplate(type) {
        const templateMap = {
            [client_1.NotificationType.BOOKING_CONFIRMED]: 'booking-confirmation',
            [client_1.NotificationType.BOOKING_CANCELLED]: 'booking-cancelled',
            [client_1.NotificationType.PAYMENT_RECEIVED]: 'payment-success',
            [client_1.NotificationType.PAYMENT_FAILED]: 'payment-failed',
            [client_1.NotificationType.REMINDER]: 'flight-reminder',
            [client_1.NotificationType.PROMOTION]: 'promotional',
            [client_1.NotificationType.SYSTEM]: 'system-alert',
        };
        return templateMap[type] || 'default';
    }
    getWhatsappTemplate(type) {
        const templateMap = {
            [client_1.NotificationType.BOOKING_CONFIRMED]: 'booking_confirmation',
            [client_1.NotificationType.REMINDER]: 'flight_reminder',
            [client_1.NotificationType.PAYMENT_RECEIVED]: 'payment_success',
        };
        return templateMap[type] || 'general_notification';
    }
    async sendBulkNotification(data) {
        const notifications = [];
        for (const userId of data.userIds) {
            const notification = await this.sendNotification({
                userId,
                type: data.type,
                title: data.title,
                message: data.message,
                channels: data.channels,
                templateData: data.templateData,
            });
            notifications.push(notification);
        }
        return notifications;
    }
    async sendSegmentedNotification(data) {
        const users = await this.getUsersBySegment(data.segment);
        const userIds = users.map(u => u.id);
        return await this.sendBulkNotification({
            userIds,
            type: data.type,
            title: data.title,
            message: data.message,
            channels: data.channels,
            templateData: data.templateData,
        });
    }
    async getUsersBySegment(segment) {
        switch (segment) {
            case 'ALL_USERS':
                return await this.prisma.user.findMany({
                    where: { status: 'ACTIVE' },
                    select: { id: true },
                });
            case 'PREMIUM_USERS':
                return await this.prisma.user.findMany({
                    where: {
                        status: 'ACTIVE',
                        loyaltyPoints: { gte: 5000 },
                    },
                    select: { id: true },
                });
            case 'HAJJ_CUSTOMERS':
                return await this.prisma.user.findMany({
                    where: {
                        status: 'ACTIVE',
                        bookings: {
                            some: {
                                type: { in: ['HAJJ', 'UMRAH'] },
                            },
                        },
                    },
                    select: { id: true },
                });
            case 'INACTIVE_USERS':
                return await this.prisma.user.findMany({
                    where: {
                        status: 'ACTIVE',
                        lastLoginAt: {
                            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        },
                    },
                    select: { id: true },
                });
            default:
                return [];
        }
    }
    async getUserNotifications(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where: { userId } }),
        ]);
        return {
            notifications,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async markAsRead(notificationId, userId) {
        return await this.prisma.notification.update({
            where: {
                id: notificationId,
                userId,
            },
            data: {
                readAt: new Date(),
            },
        });
    }
    async markAllAsRead(userId) {
        return await this.prisma.notification.updateMany({
            where: {
                userId,
                readAt: null,
            },
            data: {
                readAt: new Date(),
            },
        });
    }
    async getNotificationStats(userId) {
        const where = userId ? { userId } : {};
        const [total, unread, sent, failed, byType,] = await Promise.all([
            this.prisma.notification.count({ where }),
            this.prisma.notification.count({
                where: { ...where, readAt: null }
            }),
            this.prisma.notification.count({
                where: { ...where, status: client_1.NotificationStatus.SENT }
            }),
            this.prisma.notification.count({
                where: { ...where, status: client_1.NotificationStatus.FAILED }
            }),
            this.prisma.notification.groupBy({
                by: ['type'],
                where,
                _count: { type: true },
            }),
        ]);
        return {
            total,
            unread,
            sent,
            failed,
            successRate: total > 0 ? (sent / total) * 100 : 0,
            byType: byType.reduce((acc, item) => {
                acc[item.type] = item._count.type;
                return acc;
            }, {}),
        };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        sms_service_1.SmsService,
        push_service_1.PushService,
        whatsapp_service_1.WhatsappService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map