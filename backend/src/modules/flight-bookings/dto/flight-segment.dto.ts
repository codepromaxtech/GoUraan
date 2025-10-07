import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class FlightSegmentDto {
  @ApiProperty({ description: 'Flight number' })
  @IsString()
  @IsNotEmpty()
  flightNumber: string;

  @ApiProperty({ description: 'Airline code' })
  @IsString()
  @IsNotEmpty()
  airline: string;

  @ApiProperty({ description: 'Departure airport code' })
  @IsString()
  @IsNotEmpty()
  departureAirport: string;

  @ApiProperty({ description: 'Arrival airport code' })
  @IsString()
  @IsNotEmpty()
  arrivalAirport: string;

  @ApiProperty({ description: 'Departure date and time', example: '2023-12-25T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  departureTime: Date;

  @ApiProperty({ description: 'Arrival date and time', example: '2023-12-25T12:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  arrivalTime: Date;

  @ApiProperty({ description: 'Cabin class', example: 'ECONOMY' })
  @IsString()
  @IsNotEmpty()
  cabinClass: string;

  @ApiProperty({ description: 'Baggage allowance', example: '20kg' })
  @IsString()
  @IsOptional()
  baggageAllowance?: string;

  @ApiProperty({ description: 'Operating airline', required: false })
  @IsString()
  @IsOptional()
  operatingAirline?: string;

  @ApiProperty({ description: 'Flight duration in minutes', required: false })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiProperty({ description: 'Aircraft type', required: false })
  @IsString()
  @IsOptional()
  aircraftType?: string;

  @ApiProperty({ description: 'Meal service available', required: false })
  @IsString()
  @IsOptional()
  mealService?: string;

  @ApiProperty({ description: 'Is this a codeshare flight?', required: false })
  @IsOptional()
  isCodeShare?: boolean;

  @ApiProperty({ description: 'The marketing airline if different', required: false })
  @IsString()
  @IsOptional()
  marketingAirline?: string;
}
