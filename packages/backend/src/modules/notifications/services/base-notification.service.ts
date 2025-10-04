import { Injectable, Logger } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { NotificationChannel } from '../interfaces/notification.interface';

@Injectable()
export abstract class BaseNotificationService implements NotificationChannel {
  protected readonly logger = new Logger(this.constructor.name);
  protected abstract readonly supportedTypes: NotificationType[];

  async send(notification: any): Promise<boolean> {
    try {
      if (!this.supports(notification.type)) {
        this.logger.warn(`Notification type ${notification.type} not supported by ${this.constructor.name}`);
        return false;
      }
      
      await this.handleSend(notification);
      return true;
    } catch (error) {
      this.logger.error(`Error sending notification: ${error.message}`, error.stack);
      return false;
    }
  }

  supports(type: NotificationType): boolean {
    return this.supportedTypes.includes(type);
  }

  protected abstract handleSend(notification: any): Promise<void>;
}
