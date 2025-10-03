import { ApiProperty } from '@nestjs/swagger';
import { RoomType, RoomStatus } from '@prisma/client';

export class RoomEntity {
  @ApiProperty({ description: 'Unique identifier for the room' })
  id: string;

  @ApiProperty({ description: 'ID of the hotel this room belongs to' })
  hotelId: string;

  @ApiProperty({ description: 'Room number or identifier' })
  roomNumber: string;

  @ApiProperty({ 
    enum: RoomType, 
    description: 'Type of the room (e.g., SINGLE, DOUBLE, SUITE)' 
  })
  type: RoomType;

  @ApiProperty({ 
    enum: RoomStatus, 
    description: 'Current status of the room' 
  })
  status: RoomStatus;

  @ApiProperty({ description: 'Maximum number of adults the room can accommodate' })
  maxAdults: number;

  @ApiProperty({ description: 'Maximum number of children the room can accommodate' })
  maxChildren: number;

  @ApiProperty({ description: 'Base price per night' })
  basePrice: number;

  @ApiProperty({ description: 'List of amenities available in the room' })
  amenities: string[];

  @ApiProperty({ description: 'List of image URLs for the room' })
  images: string[];

  @ApiProperty({ description: 'Floor number where the room is located', required: false })
  floorNumber?: number;

  @ApiProperty({ description: 'View from the room (e.g., sea view, city view, garden view)', required: false })
  view?: string;

  @ApiProperty({ description: 'Size of the room in square meters', required: false })
  size?: number;

  @ApiProperty({ description: 'Bed configuration (e.g., 1 King, 2 Queens, etc.)' })
  bedConfiguration: string;

  @ApiProperty({ description: 'Date when the room was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the room was last updated' })
  updatedAt: Date;

  constructor(partial: Partial<RoomEntity>) {
    Object.assign(this, partial);
  }
}
