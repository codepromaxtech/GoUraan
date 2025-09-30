export class CreatePaymentDto {
  bookingId: string;
  gateway: string;
  method: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
}

export class ProcessPaymentDto {
  amount: number;
  currency: string;
  paymentMethodId?: string;
  orderId?: string;
  transactionId?: string;
  checkoutId?: string;
}

export class RefundPaymentDto {
  amount?: number;
  reason?: string;
}
