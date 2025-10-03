import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsBoolean } from 'class-validator';

export enum AirportType {
  INTERNATIONAL = 'international',
  DOMESTIC = 'domestic',
  MILITARY = 'military',
  PRIVATE = 'private',
}

export class CreateAirportDto {
  @IsString()
  @IsNotEmpty()
  iataCode: string;

  @IsString()
  @IsOptional()
  icaoCode?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsNumber()
  @IsOptional()
  altitude?: number;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsEnum(AirportType)
  @IsOptional()
  type?: AirportType = AirportType.INTERNATIONAL;

  @IsBoolean()
  @IsOptional()
  isHub?: boolean = false;

  @IsOptional()
  runways?: Array<{
    length: number;
    width: number;
    surface: string;
    lighted: boolean;
    ident1: string;
    ident2: string;
  }>;

  @IsOptional()
  contactInfo?: {
    phone: string;
    email: string;
    website: string;
    address: string;
  };
}
