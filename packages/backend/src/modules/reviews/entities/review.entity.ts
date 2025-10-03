import { ApiProperty } from '@nestjs/swagger';
import { ReviewType } from '@prisma/client';

export class ReviewEntity {
  @ApiProperty({ description: 'Unique identifier for the review' })
  id: string;

  @ApiProperty({ description: 'ID of the user who created the review' })
  userId: string;

  @ApiProperty({ 
    enum: ReviewType,
    description: 'Type of the review (HOTEL, FLIGHT, etc.)' 
  })
  type: ReviewType;

  @ApiProperty({ description: 'ID of the item being reviewed (hotel, flight, etc.)' })
  itemId: string;

  @ApiProperty({ 
    description: 'Rating from 1 to 5',
    minimum: 1,
    maximum: 5
  })
  rating: number;

  @ApiProperty({ 
    description: 'Review title',
    required: false
  })
  title?: string;

  @ApiProperty({ 
    description: 'Detailed review content',
    required: false
  })
  content?: string;

  @ApiProperty({ 
    description: 'Whether the review is approved',
    default: false
  })
  isApproved: boolean = false;

  @ApiProperty({ 
    description: 'Whether the review is featured',
    default: false
  })
  isFeatured: boolean = false;

  @ApiProperty({ 
    description: 'Response from the business owner',
    required: false
  })
  ownerResponse?: string;

  @ApiProperty({ 
    description: 'Date when the owner responded',
    required: false
  })
  ownerResponseDate?: Date;

  @ApiProperty({ description: 'Date when the review was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the review was last updated' })
  updatedAt: Date;

  constructor(partial: Partial<ReviewEntity>) {
    Object.assign(this, {
      isApproved: false,
      isFeatured: false,
      ...partial
    });
  }
}
