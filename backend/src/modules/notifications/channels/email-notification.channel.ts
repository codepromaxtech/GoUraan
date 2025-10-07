import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { BaseNotificationService } from '../services/base-notification.service';
import { NotificationData } from '../interfaces/notification.interface';

@Injectable()
export class EmailNotificationChannel extends BaseNotificationService {
  protected readonly supportedTypes: NotificationType[] = [
    'BOOKING_CONFIRMATION',
    'PAYMENT_SUCCESS',
    'FLIGHT_REMINDER',
    'PASSWORD_RESET',
    'WELCOME_EMAIL',
    'DOCUMENT_REQUEST',
  ];

  protected async handleSend(notification: NotificationData): Promise<void> {
    const { user, type, title, message, data, metadata } = notification;
    
    // Map notification type to email template
    const template = this.getTemplateForType(type);
    
    // In a real implementation, you would use your email service here
    console.log(`Sending email to ${user.email} with template ${template}`);
    console.log(`Subject: ${title}`);
    console.log(`Message: ${message}`);
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private getTemplateForType(type: NotificationType): string {
    const templateMap: Record<string, string> = {
      'BOOKING_CONFIRMATION': 'booking-confirmation',
      'PAYMENT_SUCCESS': 'payment-success',
      'FLIGHT_REMINDER': 'flight-reminder',
      'PASSWORD_RESET': 'password-reset',
      'WELCOME_EMAIL': 'welcome-email',
      'DOCUMENT_REQUEST': 'document-request',
    };

    return templateMap[type] || 'default';
  }
}
