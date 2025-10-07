import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { BookingStatus, PaymentStatus } from '@prisma/client';

export class UpdateBookingDto {
  @ApiProperty({
    example: BookingStatus.CONFIRMED,
    description: 'Booking status',
    enum: BookingStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiProperty({
    example: PaymentStatus.PAID,
    description: 'Payment status',
    enum: PaymentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiProperty({
    example: 1600.00,
    description: 'Updated total amount',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @ApiProperty({
    example: {
      flights: [
        {
          flightNumber: 'EK124',
          departure: 'DAC',
          arrival: 'DXB',
          departureTime: '2024-01-16T10:00:00Z',
          arrivalTime: '2024-01-16T14:00:00Z'
        }
      ]
    },
    description: 'Updated booking data',
    required: false,
  })
  @IsOptional()
  @IsObject()
  bookingData?: any;

  @ApiProperty({
    example: 'Updated special requirements',
    description: 'Updated notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
