import { Language, Currency, SeatPreference } from '@prisma/client';
export declare class UpdateUserPreferencesDto {
    language?: Language;
    currency?: Currency;
    timezone?: string;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    pushNotifications?: boolean;
    marketingEmails?: boolean;
    seatPreference?: SeatPreference;
    mealPreference?: string;
    specialAssistance?: string[];
}
