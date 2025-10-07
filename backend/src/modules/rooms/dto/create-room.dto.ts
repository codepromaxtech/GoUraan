import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNumber, 
  IsArray, 
  IsEnum, 
  IsOptional, 
  Min, 
  Max, 
  IsNotEmpty,
  IsUUID
} from 'class-validator';
import { RoomType, RoomStatus } from '@prisma/client';

export class CreateRoomDto {
  @ApiProperty({ description: 'ID of the hotel this room belongs to' })
  @IsUUID()
  @IsNotEmpty()
  hotelId: string;

  @ApiProperty({ description: 'Room number or identifier' })
  @IsString()
  @IsNotEmpty()
  roomNumber: string;

  @ApiProperty({ 
    enum: RoomType, 
    description: 'Type of the room (e.g., SINGLE, DOUBLE, SUITE)' 
  })
  @IsEnum(RoomType)
  type: RoomType;

  @ApiProperty({ 
    enum: RoomStatus, 
    description: 'Current status of the room',
    default: 'AVAILABLE'
  })
  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatus = 'AVAILABLE';

  @ApiProperty({ 
    description: 'Maximum number of adults the room can accommodate',
    minimum: 1,
    maximum: 10
  })
  @IsNumber()
  @Min(1)
  @Max(10)
  maxAdults: number;

  @ApiProperty({ 
    description: 'Maximum number of children the room can accommodate',
    minimum: 0,
    maximum: 10,
    default: 0
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  maxChildren?: number = 0;

  @ApiProperty({ 
    description: 'Base price per night',
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiProperty({ 
    description: 'List of amenities available in the room',
    type: [String],
    default: []
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[] = [];

  @ApiProperty({ 
    description: 'List of image URLs for the room',
    type: [String],
    default: []
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[] = [];

  @ApiProperty({ 
    description: 'Floor number where the room is located',
    required: false 
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  floorNumber?: number;

  @ApiProperty({ 
    description: 'View from the room (e.g., sea view, city view, garden view)',
    required: false 
  })
  @IsString()
  @IsOptional()
  view?: string;

  @ApiProperty({ 
    description: 'Size of the room in square meters',
    minimum: 10,
    required: false 
  })
  @IsNumber()
  @Min(10)
  @IsOptional()
  size?: number;

  @ApiProperty({ 
    description: 'Bed configuration (e.g., 1 King, 2 Queens, etc.)',
    example: '1 King Bed'
  })
  @IsString()
  @IsNotEmpty()
  bedConfiguration: string;
}
