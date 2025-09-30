// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { PushService } from './services/push.service';
import { WhatsappService } from './services/whatsapp.service';
import { NotificationType, NotificationStatus, NotificationChannel } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private smsService: SmsService,
    private pushService: PushService,
    private whatsappService: WhatsappService,
  ) {}

  async sendNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    channels: NotificationChannel[];
    templateData?: any;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    scheduledAt?: Date;
  }) {
    try {
      // Create notification record
      const notification = await this.prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          channels: data.channels,
          priority: data.priority || 'MEDIUM',
          status: data.scheduledAt ? NotificationStatus.SCHEDULED : NotificationStatus.PENDING,
          scheduledAt: data.scheduledAt,
          templateData: data.templateData,
        },
      });

      // If not scheduled, send immediately
      if (!data.scheduledAt) {
        await this.processNotification(notification.id);
      }

      return notification;
    } catch (error) {
      this.logger.error('Failed to create notification', error);
      throw error;
    }
  }

  async processNotification(notificationId: string) {
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

    // Check user preferences
    const userPrefs = notification.user.preferences;
    const enabledChannels = this.getEnabledChannels(notification.channels, userPrefs);

    if (enabledChannels.length === 0) {
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { 
          status: NotificationStatus.SKIPPED,
          sentAt: new Date(),
          deliveryStatus: { reason: 'User preferences disabled all channels' },
        },
      });
      return;
    }

    // Update status to sending
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { status: NotificationStatus.SENDING },
    });

    const results = [];

    // Send through each enabled channel
    for (const channel of enabledChannels) {
      try {
        let result;
        switch (channel) {
          case NotificationChannel.EMAIL:
            result = await this.sendEmail(notification);
            break;
          case NotificationChannel.SMS:
            result = await this.sendSms(notification);
            break;
          case NotificationChannel.PUSH:
            result = await this.sendPush(notification);
            break;
          case NotificationChannel.WHATSAPP:
            result = await this.sendWhatsapp(notification);
            break;
        }
        results.push({ channel, success: true, result });
      } catch (error) {
        this.logger.error(`Failed to send ${channel} notification`, error);
        results.push({ channel, success: false, error: error.message });
      }
    }

    // Update notification status
    const allSuccessful = results.every(r => r.success);
    const anySuccessful = results.some(r => r.success);

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: allSuccessful 
          ? NotificationStatus.SENT 
          : anySuccessful 
          ? NotificationStatus.PARTIAL 
          : NotificationStatus.FAILED,
        sentAt: new Date(),
        deliveryStatus: { results },
      },
    });

    this.logger.log(`Notification processed: ${notificationId} - ${allSuccessful ? 'SUCCESS' : 'PARTIAL/FAILED'}`);
  }

  private async sendEmail(notification: any) {
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

  private async sendSms(notification: any) {
    if (!notification.user.phone) {
      throw new Error('User phone number not available');
    }

    return await this.smsService.sendSms({
      to: notification.user.phone,
      message: `${notification.title}\n\n${notification.message}`,
      templateData: notification.templateData,
    });
  }

  private async sendPush(notification: any) {
    // Get user's device tokens
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

  private async sendWhatsapp(notification: any) {
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

  private getEnabledChannels(requestedChannels: NotificationChannel[], userPrefs: any): NotificationChannel[] {
    if (!userPrefs) return requestedChannels;

    return requestedChannels.filter(channel => {
      switch (channel) {
        case NotificationChannel.EMAIL:
          return userPrefs.emailNotifications;
        case NotificationChannel.SMS:
          return userPrefs.smsNotifications;
        case NotificationChannel.PUSH:
          return userPrefs.pushNotifications;
        case NotificationChannel.WHATSAPP:
          return userPrefs.whatsappNotifications || false;
        default:
          return true;
      }
    });
  }

  private getEmailTemplate(type: NotificationType): string {
    const templateMap = {
      [NotificationType.BOOKING_CONFIRMED]: 'booking-confirmation',
      [NotificationType.BOOKING_CANCELLED]: 'booking-cancelled',
      [NotificationType.PAYMENT_RECEIVED]: 'payment-success',
      [NotificationType.PAYMENT_FAILED]: 'payment-failed',
      [NotificationType.REMINDER]: 'flight-reminder',
      [NotificationType.PROMOTION]: 'promotional',
      [NotificationType.SYSTEM]: 'system-alert',
    };
    return templateMap[type] || 'default';
  }

  private getWhatsappTemplate(type: NotificationType): string {
    const templateMap = {
      [NotificationType.BOOKING_CONFIRMED]: 'booking_confirmation',
      [NotificationType.REMINDER]: 'flight_reminder',
      [NotificationType.PAYMENT_RECEIVED]: 'payment_success',
    };
    return templateMap[type] || 'general_notification';
  }

  // Bulk notification methods
  async sendBulkNotification(data: {
    userIds: string[];
    type: NotificationType;
    title: string;
    message: string;
    channels: NotificationChannel[];
    templateData?: any;
  }) {
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

  async sendSegmentedNotification(data: {
    segment: 'ALL_USERS' | 'PREMIUM_USERS' | 'HAJJ_CUSTOMERS' | 'INACTIVE_USERS';
    type: NotificationType;
    title: string;
    message: string;
    channels: NotificationChannel[];
    templateData?: any;
  }) {
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

  private async getUsersBySegment(segment: string) {
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
              lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            },
          },
          select: { id: true },
        });
      default:
        return [];
    }
  }

  // Notification management
  async getUserNotifications(userId: string, page = 1, limit = 20) {
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

  async markAsRead(notificationId: string, userId: string) {
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

  async markAllAsRead(userId: string) {
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

  async getNotificationStats(userId?: string) {
    const where = userId ? { userId } : {};

    const [
      total,
      unread,
      sent,
      failed,
      byType,
    ] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ 
        where: { ...where, readAt: null } 
      }),
      this.prisma.notification.count({ 
        where: { ...where, status: NotificationStatus.SENT } 
      }),
      this.prisma.notification.count({ 
        where: { ...where, status: NotificationStatus.FAILED } 
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
      }, {} as Record<string, number>),
    };
  }
}
