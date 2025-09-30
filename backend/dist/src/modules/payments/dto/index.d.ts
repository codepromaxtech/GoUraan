export declare class CreatePaymentDto {
    bookingId: string;
    gateway: string;
    method: string;
    amount: number;
    currency: string;
    paymentMethod?: string;
}
export declare class ProcessPaymentDto {
    amount: number;
    currency: string;
    paymentMethodId?: string;
    orderId?: string;
    transactionId?: string;
    checkoutId?: string;
}
export declare class RefundPaymentDto {
    amount?: number;
    reason?: string;
}
