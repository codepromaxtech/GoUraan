import { NotificationType } from '@prisma/client';

export interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  metadata?: Record<string, any>;
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
