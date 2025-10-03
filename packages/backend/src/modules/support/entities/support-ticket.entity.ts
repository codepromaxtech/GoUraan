import { ApiProperty } from '@nestjs/swagger';
import { SupportTicketStatus, SupportTicketPriority, SupportTicketCategory } from '@prisma/client';

export class SupportTicketEntity {
  @ApiProperty({ description: 'Unique identifier for the support ticket' })
  id: string;

  @ApiProperty({ description: 'ID of the user who created the ticket' })
  userId: string;

  @ApiProperty({ 
    enum: SupportTicketStatus,
    description: 'Current status of the ticket' 
  })
  status: SupportTicketStatus;

  @ApiProperty({ 
    enum: SupportTicketPriority,
    description: 'Priority level of the ticket' 
  })
  priority: SupportTicketPriority;

  @ApiProperty({ 
    enum: SupportTicketCategory,
    description: 'Category of the support ticket' 
  })
  category: SupportTicketCategory;

  @ApiProperty({ description: 'Subject/title of the support ticket' })
  subject: string;

  @ApiProperty({ description: 'Detailed description of the issue' })
  description: string;

  @ApiProperty({ 
    description: 'ID of the assigned support agent',
    required: false 
  })
  assignedToId?: string;

  @ApiProperty({ 
    description: 'Date when the ticket was closed',
    required: false 
  })
  closedAt?: Date;

  @ApiProperty({ 
    description: 'ID of the user who closed the ticket',
    required: false 
  })
  closedById?: string;

  @ApiProperty({ 
    description: 'Reason for closing the ticket',
    required: false 
  })
  closeReason?: string;

  @ApiProperty({ 
    description: 'Rating given by the user (1-5)',
    required: false,
    minimum: 1,
    maximum: 5
  })
  rating?: number;

  @ApiProperty({ 
    description: 'Feedback provided by the user',
    required: false 
  })
  feedback?: string;

  @ApiProperty({ 
    description: 'Tags for categorizing the ticket',
    type: [String],
    default: []
  })
  tags: string[] = [];

  @ApiProperty({ description: 'Date when the ticket was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the ticket was last updated' })
  updatedAt: Date;

  constructor(partial: Partial<SupportTicketEntity>) {
    Object.assign(this, {
      tags: [],
      ...partial
    });
  }
}
