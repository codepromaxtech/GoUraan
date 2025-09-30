import { UsersService } from './users.service';
import { UserRole, UserStatus } from '@prisma/client';
export declare class UserType {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    role: UserRole;
    status: UserStatus;
    emailVerified: boolean;
    phoneVerified: boolean;
    loyaltyPoints: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class UserStatsType {
    totalBookings: number;
    completedBookings: number;
    totalSpent: number;
    loyaltyPoints: number;
    walletBalance: number;
    walletCurrency: string;
}
export declare class UpdateUserInput {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
}
export declare class UpdateUserPreferencesInput {
    language?: string;
    currency?: string;
    timezone?: string;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    pushNotifications?: boolean;
    marketingEmails?: boolean;
    seatPreference?: string;
    mealPreference?: string;
    specialAssistance?: string[];
}
export declare class UsersResolver {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(user: any): Promise<UserType>;
    updateProfile(user: any, input: UpdateUserInput): Promise<UserType>;
    updatePreferences(user: any, input: UpdateUserPreferencesInput): Promise<string>;
    userStats(user: any): Promise<UserStatsType>;
    deactivateAccount(user: any): Promise<UserType>;
    user(id: string): Promise<UserType>;
    updateUserStatus(id: string, status: UserStatus): Promise<UserType>;
}
