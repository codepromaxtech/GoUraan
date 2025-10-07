import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus, PaymentMethod, Currency } from '@prisma/client';

export class PaymentEntity {
  @ApiProperty({ description: 'Unique identifier for the payment' })
  id: string;

  @ApiProperty({ description: 'ID of the booking this payment is for' })
  bookingId: string;

  @ApiProperty({ description: 'ID of the user making the payment' })
  userId: string;

  @ApiProperty({ 
    enum: PaymentStatus,
    description: 'Current status of the payment' 
  })
  status: PaymentStatus;

  @ApiProperty({ 
    enum: PaymentMethod,
    description: 'Method used for payment' 
  })
  method: PaymentMethod;

  @ApiProperty({ description: 'Amount of the payment' })
  amount: number;

  @ApiProperty({ 
    enum: Currency,
    description: 'Currency code (e.g., USD, EUR)' 
  })
  currency: Currency;

  @ApiProperty({ description: 'Transaction ID from the payment gateway', required: false })
  transactionId?: string;

  @ApiProperty({ description: 'Payment gateway response data', type: 'object', required: false })
  gatewayResponse?: Record<string, any>;

  @ApiProperty({ description: 'Date when the payment was processed' })
  processedAt: Date;

  @ApiProperty({ description: 'Date when the payment was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the payment was last updated' })
  updatedAt: Date;

  constructor(partial: Partial<PaymentEntity>) {
    Object.assign(this, partial);
  }
}
