import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, IsOptional, IsObject, IsNotEmpty, IsUUID } from 'class-validator';
import { PaymentMethod, Currency } from '@prisma/client';

export class ProcessPaymentDto {
  @ApiProperty({ description: 'ID of the booking to pay for' })
  @IsUUID()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({ 
    enum: PaymentMethod,
    description: 'Payment method to use' 
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method: PaymentMethod;

  @ApiProperty({ 
    description: 'Payment amount',
    minimum: 0.01
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ 
    enum: Currency,
    description: 'Currency code (e.g., USD, EUR)' 
  })
  @IsEnum(Currency)
  @IsNotEmpty()
  currency: Currency;

  @ApiProperty({ 
    description: 'Payment method details (e.g., card details, wallet ID, etc.)',
    type: 'object',
    required: false
  })
  @IsObject()
  @IsOptional()
  paymentDetails?: Record<string, any>;

  @ApiProperty({ 
    description: 'Save payment method for future use',
    default: false 
  })
  @IsOptional()
  savePaymentMethod?: boolean = false;
}
