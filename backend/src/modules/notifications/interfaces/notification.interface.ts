import { NotificationType, NotificationStatus, NotificationChannel as PrismaNotificationChannel } from '@prisma/client';

export interface UserRecipient {
  id: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  preferredLanguage?: string;
  notificationPreferences?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
}

export interface NotificationData {
  recipient: UserRecipient;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  metadata?: Record<string, any>;
  status?: NotificationStatus;
  channel?: PrismaNotificationChannel;
}

export interface NotificationChannel {
  send(notification: NotificationData): Promise<boolean>;
  supports(type: NotificationType): boolean;
}

export interface NotificationTemplate {
  subject: string;
  template: string;
  data: Record<string, any>;
}

export interface NotificationResult {
  success: boolean;
  message?: string;
  error?: Error;
  notificationId?: string;
}
