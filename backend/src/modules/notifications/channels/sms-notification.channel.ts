import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { BaseNotificationService } from '../services/base-notification.service';
import { NotificationData } from '../interfaces/notification.interface';

@Injectable()
export class SmsNotificationChannel extends BaseNotificationService {
  protected readonly supportedTypes: NotificationType[] = [
    'BOOKING_CONFIRMED',
    'BOOKING_CANCELLED',
    'PAYMENT_RECEIVED',
    'PAYMENT_FAILED',
    'REMINDER',
    'ACCOUNT_VERIFIED',
    'PASSWORD_CHANGED',
    'OTP_VERIFICATION'
  ] as const;

  protected async handleSend(notification: NotificationData): Promise<void> {
    const { recipient, type, message, data } = notification;
    
    if (!recipient.phone) {
      throw new Error('Recipient phone number not available');
    }
    
    // Format message based on notification type
    const formattedMessage = this.formatMessage(type, message, data);
    
    // In a real implementation, you would use your SMS service here
    console.log(`[SMS] Sending to ${recipient.phone}: ${formattedMessage}`);
    
    // Simulate SMS sending with a small delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private formatMessage(
    type: NotificationType,
    message: string,
    data?: Record<string, any>
  ): string {
    // Format the message based on the notification type
    // and include any relevant data from the data object
    switch (type) {
      case 'BOOKING_CONFIRMED':
        return `✅ Booking Confirmed: ${message}`;
      case 'BOOKING_CANCELLED':
        return `❌ Booking Cancelled: ${message}`;
      case 'PAYMENT_RECEIVED':
        return `💳 Payment Received: ${message}`;
      case 'PAYMENT_FAILED':
        return `⚠️ Payment Failed: ${message}`;
      case 'REMINDER':
        return `🔔 Reminder: ${message}`;
      case 'ACCOUNT_VERIFIED':
        return `✅ Account Verified: ${message}`;
      case 'PASSWORD_CHANGED':
        return `🔑 Password Changed: ${message}`;
      default:
        return message;
    }
  }
}
