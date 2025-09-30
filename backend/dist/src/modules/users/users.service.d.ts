import { PrismaService } from '@/common/prisma/prisma.service';
import { UpdateUserDto, UpdateUserPreferencesDto } from './dto';
import { UserStatus } from '@prisma/client';
export declare class UsersService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        avatar: string;
        status: import(".prisma/client").$Enums.UserStatus;
        emailVerified: boolean;
        phoneVerified: boolean;
        loyaltyPoints: number;
        createdAt: Date;
        updatedAt: Date;
        preferences: {
            id: string;
            userId: string;
            language: import(".prisma/client").$Enums.Language;
            currency: import(".prisma/client").$Enums.Currency;
            timezone: string;
            emailNotifications: boolean;
            smsNotifications: boolean;
            pushNotifications: boolean;
            marketingEmails: boolean;
            seatPreference: import(".prisma/client").$Enums.SeatPreference | null;
            mealPreference: string | null;
            specialAssistance: string[];
            createdAt: Date;
            updatedAt: Date;
        };
        wallet: {
            id: string;
            isActive: boolean;
            currency: import(".prisma/client").$Enums.Currency;
            balance: number;
        };
        agentProfile: {
            id: string;
            companyName: string;
            commissionRate: number;
            totalSales: number;
            totalCommission: number;
            isVerified: boolean;
        };
    }>;
    findByEmail(email: string): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
        emailVerified: boolean;
        phoneVerified: boolean;
        loyaltyPoints: number;
        createdAt: Date;
    }>;
    updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        avatar: string;
        status: import(".prisma/client").$Enums.UserStatus;
        emailVerified: boolean;
        phoneVerified: boolean;
        loyaltyPoints: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updatePreferences(userId: string, updatePreferencesDto: UpdateUserPreferencesDto): Promise<{
        id: string;
        userId: string;
        language: import(".prisma/client").$Enums.Language;
        currency: import(".prisma/client").$Enums.Currency;
        timezone: string;
        emailNotifications: boolean;
        smsNotifications: boolean;
        pushNotifications: boolean;
        marketingEmails: boolean;
        seatPreference: import(".prisma/client").$Enums.SeatPreference | null;
        mealPreference: string | null;
        specialAssistance: string[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    getBookingHistory(userId: string, page?: number, limit?: number): Promise<{
        bookings: {
            type: import(".prisma/client").$Enums.BookingType;
            id: string;
            status: import(".prisma/client").$Enums.BookingStatus;
            createdAt: Date;
            updatedAt: Date;
            currency: import(".prisma/client").$Enums.Currency;
            reference: string;
            totalAmount: number;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            bookingData: import(".prisma/client").Prisma.JsonValue;
            confirmedAt: Date;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getWalletTransactions(userId: string, page?: number, limit?: number): Promise<{
        wallet: {
            id: string;
            balance: number;
            currency: import(".prisma/client").$Enums.Currency;
            isActive: boolean;
        };
        transactions: {
            id: string;
            walletId: string;
            type: import(".prisma/client").$Enums.WalletTransactionType;
            amount: number;
            currency: import(".prisma/client").$Enums.Currency;
            description: string;
            reference: string | null;
            metadata: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getLoyaltyTransactions(userId: string, page?: number, limit?: number): Promise<{
        transactions: {
            id: string;
            userId: string;
            points: number;
            type: import(".prisma/client").$Enums.LoyaltyTransactionType;
            description: string;
            reference: string | null;
            expiresAt: Date | null;
            createdAt: Date;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getUserStats(userId: string): Promise<{
        totalBookings: number;
        completedBookings: number;
        totalSpent: number;
        loyaltyPoints: number;
        walletBalance: number;
        walletCurrency: import(".prisma/client").$Enums.Currency;
    }>;
    deactivateAccount(userId: string): Promise<{
        email: string;
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
    }>;
    reactivateAccount(userId: string): Promise<{
        email: string;
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
    }>;
    getAllUsers(page?: number, limit?: number, filters?: any): Promise<{
        users: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            status: import(".prisma/client").$Enums.UserStatus;
            emailVerified: boolean;
            phoneVerified: boolean;
            loyaltyPoints: number;
            createdAt: Date;
            lastLoginAt: Date;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    updateUserStatus(userId: string, status: UserStatus): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
    }>;
}
