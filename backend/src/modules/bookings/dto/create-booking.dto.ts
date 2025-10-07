import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { BookingType, Currency } from '@prisma/client';

export class CreateBookingDto {
  @ApiProperty({
    example: BookingType.FLIGHT,
    description: 'Type of booking',
    enum: BookingType,
  })
  @IsEnum(BookingType)
  type: BookingType;

  @ApiProperty({
    example: 1500.00,
    description: 'Total booking amount',
  })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({
    example: Currency.USD,
    description: 'Currency of the booking',
    enum: Currency,
    default: Currency.USD,
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiProperty({
    example: {
      flights: [
        {
          flightNumber: 'EK123',
          departure: 'DAC',
          arrival: 'DXB',
          departureTime: '2024-01-15T10:00:00Z',
          arrivalTime: '2024-01-15T14:00:00Z'
        }
      ],
      passengers: [
        {
          firstName: 'John',
          lastName: 'Doe',
          type: 'ADULT',
          passportNumber: 'AB123456'
        }
      ]
    },
    description: 'Booking specific data (varies by booking type)',
  })
  @IsObject()
  bookingData: any;

  @ApiProperty({
    example: 'Special dietary requirements',
    description: 'Additional notes for the booking',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
