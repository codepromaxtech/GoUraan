import { BookingStatus, PaymentStatus } from '@prisma/client';
export declare class UpdateBookingDto {
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
    totalAmount?: number;
    bookingData?: any;
    notes?: string;
}
