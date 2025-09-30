import { BookingType, Currency } from '@prisma/client';
export declare class CreateBookingDto {
    type: BookingType;
    totalAmount: number;
    currency?: Currency;
    bookingData: any;
    notes?: string;
}
