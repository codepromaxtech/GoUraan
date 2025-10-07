import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const firebaseConfig = this.configService.get('firebase');
      
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: firebaseConfig.projectId,
            clientEmail: firebaseConfig.clientEmail,
            privateKey: firebaseConfig.privateKey.replace(/\\n/g, '\n'),
          }),
        });
      }

      this.logger.log('Firebase Admin initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin', error);
    }
  }

  async sendPushNotification(data: {
    tokens: string[];
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
    clickAction?: string;
  }) {
    try {
      const message: admin.messaging.MulticastMessage = {
        tokens: data.tokens.filter(token => token && token.length > 0),
        notification: {
          title: data.title,
          body: data.body,
          imageUrl: data.imageUrl,
        },
        data: data.data || {},
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#1E40AF', // Brand blue color
            sound: 'default',
            clickAction: data.clickAction,
          },
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              category: data.data?.type || 'general',
            },
          },
          fcmOptions: {
            imageUrl: data.imageUrl,
          },
        },
        webpush: {
          notification: {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            image: data.imageUrl,
            requireInteraction: true,
            actions: [
              {
                action: 'view',
                title: 'View Details',
              },
              {
                action: 'dismiss',
                title: 'Dismiss',
              },
            ],
          },
          fcmOptions: {
            link: data.clickAction || '/',
          },
        },
      };

      const response = await admin.messaging().sendMulticast(message);

      this.logger.log(`Push notification sent: ${response.successCount}/${data.tokens.length} successful`);

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      };
    } catch (error) {
      this.logger.error('Failed to send push notification', error);
      throw error;
    }
  }

  async sendToTopic(data: {
    topic: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
  }) {
    try {
      const message: admin.messaging.Message = {
        topic: data.topic,
        notification: {
          title: data.title,
          body: data.body,
          imageUrl: data.imageUrl,
        },
        data: data.data || {},
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#1E40AF',
            sound: 'default',
          },
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);

      this.logger.log(`Topic notification sent: ${response}`);
      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      this.logger.error('Failed to send topic notification', error);
      throw error;
    }
  }

  async subscribeToTopic(tokens: string[], topic: string) {
    try {
      const response = await admin.messaging().subscribeToTopic(tokens, topic);
      
      this.logger.log(`Subscribed ${response.successCount} tokens to topic: ${topic}`);
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      this.logger.error('Failed to subscribe to topic', error);
      throw error;
    }
  }

  async unsubscribeFromTopic(tokens: string[], topic: string) {
    try {
      const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
      
      this.logger.log(`Unsubscribed ${response.successCount} tokens from topic: ${topic}`);
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      this.logger.error('Failed to unsubscribe from topic', error);
      throw error;
    }
  }

  // Predefined notification types
  async sendBookingConfirmation(data: {
    tokens: string[];
    userName: string;
    bookingReference: string;
    bookingType: string;
  }) {
    return await this.sendPushNotification({
      tokens: data.tokens,
      title: 'Booking Confirmed! ✈️',
      body: `Hi ${data.userName}! Your ${data.bookingType} booking ${data.bookingReference} has been confirmed.`,
      data: {
        type: 'booking_confirmation',
        bookingReference: data.bookingReference,
        bookingType: data.bookingType,
      },
      clickAction: '/dashboard/bookings',
    });
  }

  async sendPaymentSuccess(data: {
    tokens: string[];
    userName: string;
    bookingReference: string;
    amount: number;
    currency: string;
  }) {
    return await this.sendPushNotification({
      tokens: data.tokens,
      title: 'Payment Successful! 💳',
      body: `Payment of ${data.currency} ${data.amount} for booking ${data.bookingReference} was successful.`,
      data: {
        type: 'payment_success',
        bookingReference: data.bookingReference,
        amount: data.amount.toString(),
        currency: data.currency,
      },
      clickAction: '/dashboard/bookings',
    });
  }

  async sendFlightReminder(data: {
    tokens: string[];
    userName: string;
    flightNumber: string;
    departureTime: string;
    hoursUntilFlight: number;
  }) {
    return await this.sendPushNotification({
      tokens: data.tokens,
      title: `Flight Reminder - ${data.flightNumber} ✈️`,
      body: `Your flight departs in ${data.hoursUntilFlight} hours at ${data.departureTime}. Don't forget to check-in!`,
      data: {
        type: 'flight_reminder',
        flightNumber: data.flightNumber,
        departureTime: data.departureTime,
      },
      clickAction: '/dashboard/bookings',
    });
  }

  async sendDocumentReminder(data: {
    tokens: string[];
    userName: string;
    bookingReference: string;
    documentsNeeded: string[];
  }) {
    const docsText = data.documentsNeeded.join(', ');
    
    return await this.sendPushNotification({
      tokens: data.tokens,
      title: 'Documents Required 📄',
      body: `Please upload ${docsText} for booking ${data.bookingReference}.`,
      data: {
        type: 'document_reminder',
        bookingReference: data.bookingReference,
        documentsNeeded: JSON.stringify(data.documentsNeeded),
      },
      clickAction: '/dashboard/documents',
    });
  }

  async sendPromotionalNotification(data: {
    tokens: string[];
    title: string;
    message: string;
    imageUrl?: string;
    ctaUrl?: string;
    campaignId?: string;
  }) {
    return await this.sendPushNotification({
      tokens: data.tokens,
      title: data.title,
      body: data.message,
      imageUrl: data.imageUrl,
      data: {
        type: 'promotional',
        campaignId: data.campaignId || '',
      },
      clickAction: data.ctaUrl || '/packages',
    });
  }

  async sendSystemAlert(data: {
    tokens: string[];
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
  }) {
    const icons = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '🚨',
    };

    return await this.sendPushNotification({
      tokens: data.tokens,
      title: `${icons[data.severity]} ${data.title}`,
      body: data.message,
      data: {
        type: 'system_alert',
        severity: data.severity,
      },
      clickAction: '/dashboard',
    });
  }

  // Bulk operations
  async sendBulkNotifications(notifications: Array<{
    tokens: string[];
    title: string;
    body: string;
    data?: Record<string, string>;
  }>) {
    const results = [];
    
    for (const notification of notifications) {
      try {
        const result = await this.sendPushNotification(notification);
        results.push({ success: true, result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    return results;
  }

  // Topic-based notifications for segments
  async sendToAllUsers(data: {
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
  }) {
    return await this.sendToTopic({
      topic: 'all_users',
      title: data.title,
      body: data.body,
      data: data.data,
      imageUrl: data.imageUrl,
    });
  }

  async sendToPremiumUsers(data: {
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
  }) {
    return await this.sendToTopic({
      topic: 'premium_users',
      title: data.title,
      body: data.body,
      data: data.data,
      imageUrl: data.imageUrl,
    });
  }

  async sendToHajjCustomers(data: {
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
  }) {
    return await this.sendToTopic({
      topic: 'hajj_customers',
      title: data.title,
      body: data.body,
      data: data.data,
      imageUrl: data.imageUrl,
    });
  }

  // Token management
  async validateTokens(tokens: string[]): Promise<string[]> {
    const validTokens = [];
    
    for (const token of tokens) {
      try {
        // Send a test message to validate token
        await admin.messaging().send({
          token,
          data: { test: 'true' },
        }, true); // Dry run
        
        validTokens.push(token);
      } catch (error) {
        this.logger.warn(`Invalid FCM token: ${token}`);
      }
    }

    return validTokens;
  }
}
