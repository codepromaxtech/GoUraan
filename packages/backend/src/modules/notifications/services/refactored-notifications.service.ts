import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { NotificationType, NotificationStatus, NotificationChannel as PrismaNotificationChannel } from '@prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { NotificationData, NotificationChannel } from '../interfaces/notification.interface';
import { NotificationFactory } from './notification-factory.service';

@Injectable()
export class RefactoredNotificationsService {
  private readonly logger = new Logger(RefactoredNotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationFactory: NotificationFactory,
  ) {}

  async sendNotification(data: NotificationData): Promise<boolean> {
    const { userId, type, title, message, data: notificationData, metadata } = data;
    
    try {
      // Create notification record
      const notification = await this.prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          status: 'PENDING',
          data: notificationData,
          metadata,
        },
      });

      // Process notification asynchronously
      this.processNotification(notification.id);
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`, error.stack);
      return false;
    }
  }

  private async processNotification(notificationId: string): Promise<void> {
    try {
      const notification = await this.prisma.notification.findUnique({
        where: { id: notificationId },
        include: { user: true },
      });

      if (!notification) {
        this.logger.warn(`Notification ${notificationId} not found`);
        return;
      }

      // Get appropriate channels for this notification type
      const channels = this.notificationFactory.getChannelsForType(notification.type as NotificationType);
      
      if (channels.length === 0) {
        this.logger.warn(`No channels found for notification type: ${notification.type}`);
        await this.updateNotificationStatus(notificationId, 'FAILED');
        return;
      }

      // Send notification through all available channels
      const results = await Promise.allSettled(
        channels.map(channel => 
          channel.send({
            ...notification,
            data: notification.data as Record<string, any>,
            metadata: notification.metadata as Record<string, any>,
          })
        )
      );

      // Update notification status based on results
      const allSuccessful = results.every(result => result.status === 'fulfilled' && result.value === true);
      const status = allSuccessful ? 'SENT' : 'PARTIALLY_SENT';
      
      await this.updateNotificationStatus(notificationId, status, {
        results: results.map((result, index) => ({
          channel: channels[index].constructor.name,
          success: result.status === 'fulfilled' && result.value === true,
          error: result.status === 'rejected' ? result.reason?.message : null,
        })),
      });

    } catch (error) {
      this.logger.error(`Error processing notification ${notificationId}: ${error.message}`, error.stack);
      await this.updateNotificationStatus(notificationId, 'FAILED', { error: error.message });
    }
  }

  private async updateNotificationStatus(
    notificationId: string, 
    status: NotificationStatus,
    metadata: any = {},
  ): Promise<void> {
    try {
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { 
          status,
          metadata: { ...metadata, updatedAt: new Date() },
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to update notification ${notificationId} status to ${status}: ${error.message}`,
        error.stack,
      );
    }
  }

  // Additional helper methods can be added here
  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      data: notifications,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
