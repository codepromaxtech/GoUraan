import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNumber, 
  IsArray, 
  IsBoolean, 
  IsEmail, 
  IsPhoneNumber, 
  IsUrl, 
  IsOptional, 
  IsNotEmpty,
  Min, 
  Max, 
  IsLatitude, 
  IsLongitude,
  Matches,
  Length
} from 'class-validator';

export class CreateHotelDto {
  @ApiProperty({ description: 'Name of the hotel' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description of the hotel' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Star rating of the hotel (1-5)' })
  @IsNumber()
  @Min(1)
  @Max(5)
  starRating: number;

  @ApiProperty({ description: 'Address line 1' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiProperty({ description: 'Address line 2', required: false })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ description: 'City where the hotel is located' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'State/Province/Region' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Postal/ZIP code' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({ description: 'Country code (ISO 3166-1 alpha-2)' })
  @IsString()
  @Length(2, 2)
  countryCode: string;

  @ApiProperty({ description: 'Latitude coordinate' })
  @IsLatitude()
  latitude: number;

  @ApiProperty({ description: 'Longitude coordinate' })
  @IsLongitude()
  longitude: number;

  @ApiProperty({ description: 'Phone number with country code' })
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({ description: 'Email address for reservations' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Hotel website URL', required: false })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({ description: 'Check-in time in HH:MM format' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Check-in time must be in HH:MM format',
  })
  checkInTime: string;

  @ApiProperty({ description: 'Check-out time in HH:MM format' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Check-out time must be in HH:MM format',
  })
  checkOutTime: string;

  @ApiProperty({ description: 'List of amenities available at the hotel' })
  @IsArray()
  @IsString({ each: true })
  amenities: string[];

  @ApiProperty({ description: 'List of image URLs for the hotel' })
  @IsArray()
  @IsUrl({}, { each: true })
  images: string[];

  @ApiProperty({ 
    description: 'Whether the hotel is currently active', 
    default: true 
  })
  @IsBoolean()
  @IsOptional()
  isActive: boolean = true;
}
