import { ApiProperty } from '@nestjs/swagger';
import { 
  IsEnum, 
  IsInt, 
  Min, 
  Max, 
  IsString, 
  IsOptional, 
  IsUUID, 
  IsNotEmpty,
  MaxLength,
  IsBoolean
} from 'class-validator';
import { ReviewType } from '@prisma/client';

export class CreateReviewDto {
  @ApiProperty({ 
    enum: ReviewType,
    description: 'Type of the review (HOTEL, FLIGHT, etc.)' 
  })
  @IsEnum(ReviewType)
  @IsNotEmpty()
  type: ReviewType;

  @ApiProperty({ 
    description: 'ID of the item being reviewed (hotel, flight, etc.)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ 
    description: 'Rating from 1 to 5',
    minimum: 1,
    maximum: 5,
    example: 5
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @ApiProperty({ 
    description: 'Review title',
    maxLength: 200,
    required: false,
    example: 'Amazing experience!'
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @ApiProperty({ 
    description: 'Detailed review content',
    required: false,
    example: 'The service was excellent and the staff was very friendly.'
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Whether the review should be anonymous',
    default: false,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean = false;
}
