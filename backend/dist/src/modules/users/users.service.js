"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let UsersService = UsersService_1 = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatar: true,
                role: true,
                status: true,
                emailVerified: true,
                phoneVerified: true,
                loyaltyPoints: true,
                createdAt: true,
                updatedAt: true,
                preferences: true,
                wallet: {
                    select: {
                        id: true,
                        balance: true,
                        currency: true,
                        isActive: true,
                    },
                },
                agentProfile: {
                    select: {
                        id: true,
                        companyName: true,
                        commissionRate: true,
                        totalSales: true,
                        totalCommission: true,
                        isVerified: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                status: true,
                emailVerified: true,
                phoneVerified: true,
                loyaltyPoints: true,
                createdAt: true,
            },
        });
    }
    async updateProfile(userId, updateUserDto) {
        const { email, phone, ...updateData } = updateUserDto;
        if (email) {
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    email,
                    NOT: { id: userId },
                },
            });
            if (existingUser) {
                throw new common_1.BadRequestException('Email is already taken');
            }
        }
        if (phone) {
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    phone,
                    NOT: { id: userId },
                },
            });
            if (existingUser) {
                throw new common_1.BadRequestException('Phone number is already taken');
            }
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...updateData,
                email,
                phone,
                ...(email && { emailVerified: false }),
                ...(phone && { phoneVerified: false }),
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatar: true,
                role: true,
                status: true,
                emailVerified: true,
                phoneVerified: true,
                loyaltyPoints: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        this.logger.log(`User profile updated: ${updatedUser.email}`);
        return updatedUser;
    }
    async updatePreferences(userId, updatePreferencesDto) {
        const preferences = await this.prisma.userPreferences.upsert({
            where: { userId },
            update: updatePreferencesDto,
            create: {
                userId,
                ...updatePreferencesDto,
            },
        });
        this.logger.log(`User preferences updated for user: ${userId}`);
        return preferences;
    }
    async getBookingHistory(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [bookings, total] = await Promise.all([
            this.prisma.booking.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    type: true,
                    status: true,
                    reference: true,
                    totalAmount: true,
                    currency: true,
                    paymentStatus: true,
                    createdAt: true,
                    updatedAt: true,
                    confirmedAt: true,
                    bookingData: true,
                },
            }),
            this.prisma.booking.count({
                where: { userId },
            }),
        ]);
        return {
            bookings,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getWalletTransactions(userId, page = 1, limit = 10) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
            include: {
                transactions: {
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        const totalTransactions = await this.prisma.walletTransaction.count({
            where: { walletId: wallet.id },
        });
        return {
            wallet: {
                id: wallet.id,
                balance: wallet.balance,
                currency: wallet.currency,
                isActive: wallet.isActive,
            },
            transactions: wallet.transactions,
            pagination: {
                total: totalTransactions,
                page,
                limit,
                totalPages: Math.ceil(totalTransactions / limit),
            },
        };
    }
    async getLoyaltyTransactions(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [transactions, total] = await Promise.all([
            this.prisma.loyaltyTransaction.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.loyaltyTransaction.count({
                where: { userId },
            }),
        ]);
        return {
            transactions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getUserStats(userId) {
        const [totalBookings, completedBookings, totalSpent, loyaltyPoints, walletBalance,] = await Promise.all([
            this.prisma.booking.count({
                where: { userId },
            }),
            this.prisma.booking.count({
                where: {
                    userId,
                    status: 'COMPLETED',
                },
            }),
            this.prisma.booking.aggregate({
                where: {
                    userId,
                    paymentStatus: 'PAID',
                },
                _sum: {
                    totalAmount: true,
                },
            }),
            this.prisma.user.findUnique({
                where: { id: userId },
                select: { loyaltyPoints: true },
            }),
            this.prisma.wallet.findUnique({
                where: { userId },
                select: { balance: true, currency: true },
            }),
        ]);
        return {
            totalBookings,
            completedBookings,
            totalSpent: totalSpent._sum.totalAmount || 0,
            loyaltyPoints: loyaltyPoints?.loyaltyPoints || 0,
            walletBalance: walletBalance?.balance || 0,
            walletCurrency: walletBalance?.currency || 'USD',
        };
    }
    async deactivateAccount(userId) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                status: client_1.UserStatus.INACTIVE,
            },
            select: {
                id: true,
                email: true,
                status: true,
            },
        });
        await this.prisma.userSession.updateMany({
            where: { userId },
            data: { isActive: false },
        });
        this.logger.log(`User account deactivated: ${user.email}`);
        return user;
    }
    async reactivateAccount(userId) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                status: client_1.UserStatus.ACTIVE,
            },
            select: {
                id: true,
                email: true,
                status: true,
            },
        });
        this.logger.log(`User account reactivated: ${user.email}`);
        return user;
    }
    async getAllUsers(page = 1, limit = 10, filters) {
        const skip = (page - 1) * limit;
        const where = {};
        if (filters?.role) {
            where.role = filters.role;
        }
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.search) {
            where.OR = [
                { firstName: { contains: filters.search, mode: 'insensitive' } },
                { lastName: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    role: true,
                    status: true,
                    emailVerified: true,
                    phoneVerified: true,
                    loyaltyPoints: true,
                    createdAt: true,
                    lastLoginAt: true,
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async updateUserStatus(userId, status) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { status },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                status: true,
            },
        });
        this.logger.log(`User status updated: ${user.email} -> ${status}`);
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map