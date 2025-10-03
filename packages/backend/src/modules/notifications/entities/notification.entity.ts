import { ApiProperty } from '@nestjs/swagger';
import { NotificationType, NotificationStatus } from '@prisma/client';

export class NotificationEntity {
  @ApiProperty({ description: 'Unique identifier for the notification' })
  id: string;

  @ApiProperty({ description: 'ID of the user who will receive the notification' })
  userId: string;

  @ApiProperty({ 
    enum: NotificationType,
    description: 'Type of notification (e.g., BOOKING_CONFIRMATION, PAYMENT_RECEIVED)' 
  })
  type: NotificationType;

  @ApiProperty({ 
    enum: NotificationStatus,
    description: 'Current status of the notification' 
  })
  status: NotificationStatus;

  @ApiProperty({ description: 'Notification title' })
  title: string;

  @ApiProperty({ description: 'Notification message' })
  message: string;

  @ApiProperty({ 
    description: 'Additional data related to the notification',
    type: 'object',
    required: false
  })
  data?: Record<string, any>;

  @ApiProperty({ 
    description: 'Whether the notification has been read by the user',
    default: false 
  })
  isRead: boolean = false;

  @ApiProperty({ 
    description: 'Date when the notification was read by the user',
    required: false 
  })
  readAt?: Date;

  @ApiProperty({ description: 'Date when the notification was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the notification was last updated' })
  updatedAt: Date;

  constructor(partial: Partial<NotificationEntity>) {
    Object.assign(this, {
      isRead: false,
      ...partial
    });
  }
}
