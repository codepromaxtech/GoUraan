import { ApiProperty, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { BaseFlightBookingDto } from './base-flight-booking.dto';
import { FlightSegmentDto } from './flight-segment.dto';
import { FlightPassengerDto } from './flight-passenger.dto';

export class FlightBookingResponseDto extends BaseFlightBookingDto {
  @ApiProperty({ description: 'Unique identifier for the flight booking' })
  id: string;

  @ApiProperty({ type: [FlightSegmentDto], description: 'Flight segments for this booking' })
  flightSegments: FlightSegmentDto[];

  @ApiProperty({ type: [FlightPassengerDto], description: 'Passengers for this booking' })
  passengers: FlightPassengerDto[];

  @ApiProperty({ description: 'Date and time when the booking was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date and time when the booking was last updated' })
  updatedAt: Date;

  @ApiProperty({ description: 'Date and time when the booking was cancelled', required: false })
  cancelledAt?: Date;

  @ApiProperty({ description: 'Reason for cancellation', required: false })
  cancellationReason?: string;

  @ApiProperty({ description: 'Date and time when the booking was confirmed', required: false })
  confirmedAt?: Date;

  @ApiProperty({ description: 'Payment method used for this booking', required: false })
  paymentMethod?: string;

  @ApiProperty({ description: 'Payment transaction ID', required: false })
  paymentTransactionId?: string;

  @ApiProperty({ description: 'Agency or user who made the booking', required: false })
  bookedBy?: string;

  @ApiProperty({ description: 'Contact email for the booking' })
  contactEmail: string;

  @ApiProperty({ description: 'Contact phone number for the booking' })
  contactPhone: string;

  @ApiProperty({ description: 'Frequent flyer number', required: false })
  frequentFlyerNumber?: string;

  @ApiProperty({ description: 'Seat selection preference', required: false })
  seatPreference?: string;

  @ApiProperty({ description: 'Meal preference', required: false })
  mealPreference?: string;

  @ApiProperty({ description: 'Special assistance required', required: false })
  specialAssistance?: string;

  @ApiProperty({ description: 'Is this a round trip?', required: false })
  isRoundTrip?: boolean = false;

  @ApiProperty({ description: 'Return flight segments for round trips', type: [FlightSegmentDto], required: false })
  returnSegments?: FlightSegmentDto[];

  @ApiProperty({ description: 'Total travel time in minutes', required: false })
  totalTravelTime?: number;

  @ApiProperty({ description: 'Number of stops', required: false })
  numberOfStops?: number;

  @ApiProperty({ description: 'Is this a direct flight?', required: false })
  isDirect?: boolean = false;

  @ApiProperty({ description: 'Airline booking reference', required: false })
  airlineBookingReference?: string;

  @ApiProperty({ description: 'E-ticket number', required: false })
  eticketNumber?: string;

  @ApiProperty({ description: 'Booking source (website, mobile, agency, etc.)', required: false })
  bookingSource?: string;

  @ApiProperty({ description: 'IP address used for booking', required: false })
  ipAddress?: string;

  @ApiProperty({ description: 'User agent from the booking request', required: false })
  userAgent?: string;
}
