import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsResolver } from './notifications.resolver';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { PushService } from './services/push.service';
import { WhatsappService } from './services/whatsapp.service';

@Module({
  providers: [
    NotificationsService,
    NotificationsResolver,
    EmailService,
    SmsService,
    PushService,
    WhatsappService,
  ],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
