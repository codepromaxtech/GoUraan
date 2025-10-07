import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export enum FlightBookingSortField {
  BOOKING_DATE = 'bookingDate',
  DEPARTURE_DATE = 'departureDate',
  TOTAL_FARE = 'totalFare',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt'
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

export class SearchFlightBookingsDto {
  @ApiPropertyOptional({ description: 'Search by booking reference or PNR' })
  @IsString()
  @IsOptional()
  searchTerm?: string;

  @ApiPropertyOptional({ description: 'Filter by passenger name' })
  @IsString()
  @IsOptional()
  passengerName?: string;

  @ApiPropertyOptional({ description: 'Filter by booking status' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by departure airport' })
  @IsString()
  @IsOptional()
  departureAirport?: string;

  @ApiPropertyOptional({ description: 'Filter by arrival airport' })
  @IsString()
  @IsOptional()
  arrivalAirport?: string;

  @ApiPropertyOptional({ description: 'Filter by departure date (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  departureDate?: string;

  @ApiPropertyOptional({ description: 'Filter by return date (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  returnDate?: string;

  @ApiPropertyOptional({ description: 'Filter by booking date range (start)' })
  @IsDateString()
  @IsOptional()
  bookingDateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by booking date range (end)' })
  @IsDateString()
  @IsOptional()
  bookingDateTo?: string;

  @ApiPropertyOptional({ description: 'Filter by airline' })
  @IsString()
  @IsOptional()
  airline?: string;

  @ApiPropertyOptional({ description: 'Filter by flight number' })
  @IsString()
  @IsOptional()
  flightNumber?: string;

  @ApiPropertyOptional({ description: 'Filter by cabin class' })
  @IsString()
  @IsOptional()
  cabinClass?: string;

  @ApiPropertyOptional({ description: 'Filter by payment status' })
  @IsString()
  @IsOptional()
  paymentStatus?: string;

  @ApiPropertyOptional({ description: 'Filter by booking type' })
  @IsString()
  @IsOptional()
  bookingType?: string;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ 
    description: 'Include cancelled bookings',
    default: false 
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeCancelled?: boolean = false;

  @ApiPropertyOptional({
    enum: FlightBookingSortField,
    default: FlightBookingSortField.BOOKING_DATE
  })
  @IsEnum(FlightBookingSortField)
  @IsOptional()
  sortBy?: FlightBookingSortField = FlightBookingSortField.BOOKING_DATE;

  @ApiPropertyOptional({
    enum: SortOrder,
    default: SortOrder.DESC
  })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    minimum: 1,
    default: 1
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10) || 1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    const limit = parseInt(value, 10) || 10;
    return limit > 100 ? 100 : limit;
  })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Include related entities (comma-separated, e.g., "passengers,segments")',
    required: false
  })
  @IsString()
  @IsOptional()
  include?: string;
}
