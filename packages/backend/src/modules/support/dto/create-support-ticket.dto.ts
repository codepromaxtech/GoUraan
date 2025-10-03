import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsEnum, 
  IsArray, 
  IsOptional, 
  IsNotEmpty, 
  MinLength, 
  MaxLength, 
  IsInt, 
  Min, 
  Max 
} from 'class-validator';
import { 
  SupportTicketPriority, 
  SupportTicketCategory 
} from '@prisma/client';

export class CreateSupportTicketDto {
  @ApiProperty({ 
    enum: SupportTicketPriority,
    description: 'Priority level of the ticket',
    default: 'MEDIUM'
  })
  @IsEnum(SupportTicketPriority)
  @IsOptional()
  priority?: SupportTicketPriority = 'MEDIUM';

  @ApiProperty({ 
    enum: SupportTicketCategory,
    description: 'Category of the support ticket',
    required: true
  })
  @IsEnum(SupportTicketCategory)
  @IsNotEmpty()
  category: SupportTicketCategory;

  @ApiProperty({ 
    description: 'Subject/title of the support ticket',
    minLength: 5,
    maxLength: 200,
    example: 'Issue with my recent booking'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  subject: string;

  @ApiProperty({ 
    description: 'Detailed description of the issue',
    minLength: 20,
    example: 'I am having trouble accessing my booking details...'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  description: string;

  @ApiProperty({
    description: 'Tags for categorizing the ticket',
    type: [String],
    required: false,
    example: ['booking', 'payment']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[] = [];

  @ApiProperty({
    description: 'ID of the booking this ticket is related to',
    required: false
  })
  @IsString()
  @IsOptional()
  bookingId?: string;

  @ApiProperty({
    description: 'ID of the payment this ticket is related to',
    required: false
  })
  @IsString()
  @IsOptional()
  paymentId?: string;

  @ApiProperty({
    description: 'Attachments (URLs to uploaded files)',
    type: [String],
    required: false,
    example: ['https://example.com/receipt.pdf']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[] = [];
}
