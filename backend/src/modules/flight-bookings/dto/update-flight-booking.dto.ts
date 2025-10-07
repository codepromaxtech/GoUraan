import { PartialType, OmitType } from '@nestjs/swagger';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseFlightBookingDto } from './base-flight-booking.dto';
import { FlightSegmentDto } from './flight-segment.dto';
import { FlightPassengerDto } from './flight-passenger.dto';

export class UpdateFlightBookingDto extends PartialType(
  OmitType(BaseFlightBookingDto, ['bookingReference', 'pnr', 'bookingType'] as const)
) {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlightSegmentDto)
  flightSegments?: FlightSegmentDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlightPassengerDto)
  passengers?: FlightPassengerDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlightSegmentDto)
  returnSegments?: FlightSegmentDto[];

  @IsOptional()
  cancellationReason?: string;

  @IsOptional()
  refundAmount?: number;

  @IsOptional()
  refundCurrency?: string;

  @IsOptional()
  refundReason?: string;

  @IsOptional()
  isVoid?: boolean;

  @IsOptional()
  voidReason?: string;

  @IsOptional()
  isNoShow?: boolean;

  @IsOptional()
  noShowFee?: number;

  @IsOptional()
  isGroupBooking?: boolean;

  @IsOptional()
  groupName?: string;

  @IsOptional()
  groupContactName?: string;

  @IsOptional()
  groupContactEmail?: string;

  @IsOptional()
  groupContactPhone?: string;

  @IsOptional()
  groupNote?: string;
}
