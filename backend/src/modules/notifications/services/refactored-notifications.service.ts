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
    const { recipient, type, title, message, data: notificationData, metadata } = data;
    
    try {
      // Create notification record with metadata merged into data
      const notification = await this.prisma.notification.create({
        data: {
          userId: recipient.id,
          type,
          title,
          message,
          status: data.status || 'PENDING',
          channel: data.channel || 'EMAIL', // Default to EMAIL if no channel specified
          data: {
            ...(notificationData || {}),
            ...(metadata || {}),  // Merge metadata into data
            recipient: {
              email: recipient.email,
              phone: recipient.phone,
              firstName: recipient.firstName,
              lastName: recipient.lastName,
              preferredLanguage: recipient.preferredLanguage
            }
          },
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
        include: { 
          user: {
            include: {
              preferences: true
            }
          } 
        },
      });

      if (!notification) {
        this.logger.warn(`Notification ${notificationId} not found`);
        return;
      }
      
      // Extract metadata safely
      const notificationMetadata = notification['metadata'] || {};

      // Get the appropriate channel(s) based on notification type and user preferences
      const channels = this.notificationFactory.getChannelsForType(notification.type as NotificationType);
      
      if (channels.length === 0) {
        this.logger.warn(`No channels available for notification type: ${notification.type}`);
        await this.updateNotificationStatus(notificationId, NotificationStatus.FAILED, { error: 'No channels available' });
        return;
      }

      // Prepare notification data with recipient
      // Get user preferences with safe defaults
      const defaultPreferences = {
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true
      };

      const userPreferences = notification.user?.preferences || defaultPreferences;

      const notificationData: NotificationData = {
        recipient: {
          id: notification.userId,
          email: notification.user?.email,
          phone: notification.user?.phone,
          firstName: notification.user?.firstName,
          lastName: notification.user?.lastName,
          notificationPreferences: {
            email: userPreferences.emailNotifications,
            sms: userPreferences.smsNotifications,
            push: userPreferences.pushNotifications
          }
        },
        type: notification.type as NotificationType,
        title: notification.title,
        message: notification.message,
        data: notification.data as Record<string, any>,
        metadata: notificationMetadata
      };

      // Send notification through all available channels
      const results = await Promise.allSettled(
        channels.map(channel => channel.send(notificationData))
      );

      // Update notification status based on results
      const allSuccessful = results.every(result => result.status === 'fulfilled' && result.value === true);
      const status = allSuccessful ? NotificationStatus.SENT : NotificationStatus.FAILED;
      
      // Prepare results for logging
      const channelResults = results.map((result, index) => ({
        channel: channels[index].constructor.name,
        success: result.status === 'fulfilled' && result.value === true,
        error: result.status === 'rejected' ? (result.reason as Error)?.message : null
      }));
      
      await this.updateNotificationStatus(notificationId, status, { results: channelResults });
    } catch (error) {
      this.logger.error(`Error processing notification ${notificationId}: ${error.message}`, error.stack);
      await this.updateNotificationStatus(notificationId, NotificationStatus.FAILED, { error: error.message });
    }
  }

  private async updateNotificationStatus(
    notificationId: string, 
    status: NotificationStatus,
    metadata: any = {}
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      // Only include metadata if it's not empty
      if (Object.keys(metadata).length > 0) {
        updateData.metadata = metadata;
      }

      // Update timestamps based on status
      if (status === NotificationStatus.SENT) {
        updateData.sentAt = new Date();
      } else if (status === NotificationStatus.DELIVERED) {
        updateData.deliveredAt = new Date();
      } else if (status === NotificationStatus.FAILED) {
        updateData.failedAt = new Date();
        updateData.error = metadata.error || 'Unknown error';
      } else if (status === NotificationStatus.READ) {
        updateData.readAt = new Date();
      }

      await this.prisma.notification.update({
        where: { id: notificationId },
        data: updateData,
      });
    } catch (error) {
      this.logger.error(`Failed to update notification status: ${error.message}`, error.stack);
      throw error;
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
