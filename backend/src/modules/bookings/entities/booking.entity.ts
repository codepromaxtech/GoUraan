import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus, BookingType, PaymentStatus } from '@prisma/client';

export class BookingEntity {
  @ApiProperty({ description: 'Unique identifier for the booking' })
  id: string;

  @ApiProperty({ description: 'ID of the user who made the booking' })
  userId: string;

  @ApiProperty({ 
    enum: BookingType, 
    description: 'Type of booking (FLIGHT, HOTEL, PACKAGE, etc.)' 
  })
  type: BookingType;

  @ApiProperty({ 
    enum: BookingStatus,
    description: 'Current status of the booking' 
  })
  status: BookingStatus;

  @ApiProperty({ 
    enum: PaymentStatus,
    description: 'Payment status of the booking' 
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({ description: 'Total amount for the booking' })
  totalAmount: number;

  @ApiProperty({ description: 'Currency code (e.g., USD, EUR)' })
  currency: string;

  @ApiProperty({ description: 'Payment method used for the booking' })
  paymentMethod: string;

  @ApiProperty({ description: 'ID of the payment transaction', required: false })
  paymentId?: string;

  @ApiProperty({ description: 'Check-in date for hotel bookings', required: false })
  checkIn?: Date;

  @ApiProperty({ description: 'Check-out date for hotel bookings', required: false })
  checkOut?: Date;

  @ApiProperty({ 
    description: 'Additional booking details specific to the booking type',
    type: 'object',
    required: false 
  })
  bookingData?: Record<string, any>;

  @ApiProperty({ description: 'Cancellation reason if booking was cancelled', required: false })
  cancellationReason?: string;

  @ApiProperty({ description: 'Date when the booking was cancelled', required: false })
  cancelledAt?: Date;

  @ApiProperty({ description: 'Date when the booking was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the booking was last updated' })
  updatedAt: Date;

  constructor(partial: Partial<BookingEntity>) {
    Object.assign(this, partial);
  }
}
