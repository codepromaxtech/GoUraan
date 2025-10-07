import { User } from './user.model';

export type TicketStatus = 
  | 'open'
  | 'in_progress'
  | 'waiting_customer'
  | 'resolved'
  | 'closed';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketCategory = 
  | 'booking'
  | 'payment'
  | 'cancellation'
  | 'refund'
  | 'account'
  | 'technical'
  | 'other';

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  userId: string;
  assignedToId?: string;
  resolvedAt?: Date;
  closedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: User;
  assignedTo?: User;
  messages?: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  content: string;
  isInternalNote: boolean;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  sender?: User;
  ticket?: SupportTicket;
}
