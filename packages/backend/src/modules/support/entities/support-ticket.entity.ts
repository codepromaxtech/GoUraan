import { ApiProperty } from '@nestjs/swagger';

export class SupportTicketEntity {
  @ApiProperty({ description: 'Unique identifier for the support ticket' })
  id: string;

  @ApiProperty({ description: 'Title of the support ticket' })
  title: string;

  @ApiProperty({ description: 'Detailed description of the issue' })
  description: string;

  @ApiProperty({ 
    description: 'Current status of the ticket',
    enum: ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER_RESPONSE', 'WAITING_SUPPORT_RESPONSE', 'RESOLVED', 'CLOSED', 'REOPENED']
  })
  status: string;

  @ApiProperty({ 
    description: 'Priority level of the ticket (1-5, where 1 is highest)',
    minimum: 1,
    maximum: 5
  })
  priority: number;

  @ApiProperty({ 
    description: 'Category of the support ticket',
    example: 'GENERAL'
  })
  category: string;

  @ApiProperty({ description: 'ID of the user who created the ticket' })
  userId: string;

  @ApiProperty({ 
    description: 'ID of the user assigned to the ticket',
    nullable: true
  })
  assignedTo: string | null;

  @ApiProperty({ description: 'When the ticket was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the ticket was last updated' })
  updatedAt: Date;

  @ApiProperty({ 
    description: 'When the ticket was closed',
    nullable: true
  })
  closedAt: Date | null;

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
