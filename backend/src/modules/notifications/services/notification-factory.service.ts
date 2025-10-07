import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { NotificationChannel } from '../interfaces/notification.interface';

@Injectable()
export class NotificationFactory {
  private channels: Map<string, NotificationChannel> = new Map();

  registerChannel(name: string, channel: NotificationChannel) {
    this.channels.set(name, channel);
  }

  getChannel(name: string): NotificationChannel | undefined {
    return this.channels.get(name);
  }

  getChannelsForType(type: NotificationType): NotificationChannel[] {
    return Array.from(this.channels.values()).filter(channel => 
      channel.supports(type)
    );
  }

  getAllChannels(): NotificationChannel[] {
    return Array.from(this.channels.values());
  }
}
