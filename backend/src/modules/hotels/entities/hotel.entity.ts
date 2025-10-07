import { ApiProperty } from '@nestjs/swagger';

export class HotelEntity {
  @ApiProperty({ description: 'Unique identifier for the hotel' })
  id: string;

  @ApiProperty({ description: 'Name of the hotel' })
  name: string;

  @ApiProperty({ description: 'Description of the hotel' })
  description: string;

  @ApiProperty({ description: 'Star rating of the hotel (1-5)' })
  starRating: number;

  @ApiProperty({ description: 'Address line 1' })
  addressLine1: string;

  @ApiProperty({ description: 'Address line 2', required: false })
  addressLine2?: string;

  @ApiProperty({ description: 'City where the hotel is located' })
  city: string;

  @ApiProperty({ description: 'State/Province/Region' })
  state: string;

  @ApiProperty({ description: 'Postal/ZIP code' })
  postalCode: string;

  @ApiProperty({ description: 'Country code (ISO 3166-1 alpha-2)' })
  countryCode: string;

  @ApiProperty({ description: 'Latitude coordinate' })
  latitude: number;

  @ApiProperty({ description: 'Longitude coordinate' })
  longitude: number;

  @ApiProperty({ description: 'Phone number with country code' })
  phoneNumber: string;

  @ApiProperty({ description: 'Email address for reservations' })
  email: string;

  @ApiProperty({ description: 'Hotel website URL', required: false })
  website?: string;

  @ApiProperty({ description: 'Check-in time in HH:MM format' })
  checkInTime: string;

  @ApiProperty({ description: 'Check-out time in HH:MM format' })
  checkOutTime: string;

  @ApiProperty({ description: 'List of amenities available at the hotel' })
  amenities: string[];

  @ApiProperty({ description: 'List of image URLs for the hotel' })
  images: string[];

  @ApiProperty({ description: 'Whether the hotel is currently active' })
  isActive: boolean;

  @ApiProperty({ description: 'Date when the hotel was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the hotel was last updated' })
  updatedAt: Date;

  constructor(partial: Partial<HotelEntity>) {
    Object.assign(this, partial);
  }
}
