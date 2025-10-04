import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsArray, 
  IsOptional, 
  IsNotEmpty, 
  MinLength, 
  MaxLength, 
  IsInt, 
  Min, 
  Max 
} from 'class-validator';

export class CreateSupportTicketDto {
  @ApiProperty({ 
    description: 'Title of the support ticket',
    example: 'I need help with my booking'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({ 
    description: 'Detailed description of the issue',
    example: 'I am unable to access my booking details.'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @ApiProperty({ 
    description: 'Priority level of the ticket (1-5, where 1 is highest)',
    default: 3,
    minimum: 1,
    maximum: 5
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  priority?: number = 3;

  @ApiProperty({
    description: 'Category of the support ticket',
    example: 'BOOKING',
    required: false,
    default: 'GENERAL'
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  category?: string = 'GENERAL';

  @ApiProperty({ 
    description: 'ID of the related booking (if applicable)',
    required: false
  })
  @IsString()
  @IsOptional()
  bookingId?: string;

  @ApiProperty({ 
    description: 'ID of the related payment (if applicable)',
    required: false
  })
  @IsString()
  @IsOptional()
  paymentId?: string;

  @ApiProperty({
    description: 'Tags to categorize the ticket',
    type: [String],
    required: false,
    example: ['billing', 'urgent']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Attachments (URLs to uploaded files)',
    type: [String],
    required: false,
    example: ['https://example.com/receipt.pdf']
  })
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[] = [];
}
