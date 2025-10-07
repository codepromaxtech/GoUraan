import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsDateString, IsNumber, IsArray, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { FlightSegmentDto } from './flight-segment.dto';
import { FlightPassengerDto } from './flight-passenger.dto';

export class BaseFlightBookingDto {
  @ApiProperty({ description: 'Booking reference number' })
  @IsString()
  @IsNotEmpty()
  bookingReference: string;

  @ApiProperty({ description: 'PNR (Passenger Name Record)' })
  @IsString()
  @IsNotEmpty()
  pnr: string;

  @ApiProperty({ description: 'Booking status', enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] })
  @IsString()
  @IsOptional()
  status?: string = 'PENDING';

  @ApiProperty({ description: 'Type of booking', enum: ['ONE_WAY', 'ROUND_TRIP', 'MULTI_CITY'] })
  @IsString()
  @IsNotEmpty()
  bookingType: string;

  @ApiProperty({ description: 'Total fare amount' })
  @IsNumber()
  @IsNotEmpty()
  totalFare: number;

  @ApiProperty({ description: 'Currency code', example: 'USD' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ description: 'Tax amount' })
  @IsNumber()
  @IsOptional()
  tax?: number;

  @ApiProperty({ description: 'Discount amount', required: false })
  @IsNumber()
  @IsOptional()
  discount?: number = 0;

  @ApiProperty({ description: 'Payment status', enum: ['PENDING', 'PAID', 'PARTIALLY_PAID', 'REFUNDED'] })
  @IsString()
  @IsOptional()
  paymentStatus?: string = 'PENDING';

  @ApiProperty({ description: 'Booking notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Special requests', required: false })
  @IsString()
  @IsOptional()
  specialRequests?: string;

  @ApiProperty({ description: 'Is the booking refundable?', required: false })
  @IsBoolean()
  @IsOptional()
  isRefundable?: boolean = false;

  @ApiProperty({ description: 'Cancellation policy', required: false })
  @IsString()
  @IsOptional()
  cancellationPolicy?: string;

  @ApiProperty({ description: 'Baggage allowance information', required: false })
  @IsString()
  @IsOptional()
  baggageInfo?: string;
}
