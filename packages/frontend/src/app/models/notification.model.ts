import { User } from './user.model';

export type NotificationType = 
  | 'booking_confirmation'
  | 'payment_received'
  | 'booking_updated'
  | 'support_ticket_update'
  | 'promotional';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: User;
}
