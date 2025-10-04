import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { BaseNotificationService } from '../services/base-notification.service';
import { NotificationData } from '../interfaces/notification.interface';

@Injectable()
export class SmsNotificationChannel extends BaseNotificationService {
  protected readonly supportedTypes: NotificationType[] = [
    'BOOKING_CONFIRMATION',
    'PAYMENT_SUCCESS',
    'FLIGHT_REMINDER',
    'OTP_VERIFICATION',
    'DOCUMENT_REMINDER',
  ];

  protected async handleSend(notification: NotificationData): Promise<void> {
    const { user, type, message } = notification;
    
    if (!user.phone) {
      throw new Error('User phone number not available');
    }
    
    // Format message based on notification type
    const formattedMessage = this.formatMessage(type, message, notification.data);
    
    // In a real implementation, you would use your SMS service here
    console.log(`Sending SMS to ${user.phone}: ${formattedMessage}`);
    
    // Simulate SMS sending
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private formatMessage(type: NotificationType, message: string, data?: any): string {
    // Add custom formatting based on notification type
    switch (type) {
      case 'BOOKING_CONFIRMATION':
        return `Booking Confirmed! ${message}. Ref: ${data?.bookingReference || ''}`;
      case 'PAYMENT_SUCCESS':
        return `Payment Successful! ${message}. Amount: ${data?.amount || ''} ${data?.currency || ''}`;
      case 'FLIGHT_REMINDER':
        return `Flight Reminder: ${message}. Flight: ${data?.flightNumber || ''} at ${data?.departureTime || ''}`;
      case 'OTP_VERIFICATION':
        return `Your verification code is: ${data?.otp}. Valid for 10 minutes.`;
      default:
        return message;
    }
  }
}
