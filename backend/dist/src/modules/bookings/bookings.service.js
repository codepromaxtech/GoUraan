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
var BookingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let BookingsService = BookingsService_1 = class BookingsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(BookingsService_1.name);
    }
    async createBooking(userId, createBookingDto) {
        const { type, bookingData, totalAmount, currency } = createBookingDto;
        const reference = this.generateBookingReference(type);
        try {
            const booking = await this.prisma.booking.create({
                data: {
                    userId,
                    type,
                    reference,
                    totalAmount,
                    currency,
                    bookingData,
                    status: client_1.BookingStatus.PENDING,
                    paymentStatus: client_1.PaymentStatus.PENDING,
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                        },
                    },
                },
            });
            this.logger.log(`New booking created: ${booking.reference} for user: ${userId}`);
            return booking;
        }
        catch (error) {
            this.logger.error('Failed to create booking', error);
            throw new common_1.BadRequestException('Failed to create booking');
        }
    }
    async findById(id, userId) {
        const where = { id };
        if (userId) {
            where.userId = userId;
        }
        const booking = await this.prisma.booking.findUnique({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
                payments: {
                    orderBy: { createdAt: 'desc' },
                },
                documents: true,
                reviews: true,
            },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        return booking;
    }
    async findByReference(reference, userId) {
        const where = { reference };
        if (userId) {
            where.userId = userId;
        }
        const booking = await this.prisma.booking.findUnique({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
                payments: {
                    orderBy: { createdAt: 'desc' },
                },
                documents: true,
            },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        return booking;
    }
    async getUserBookings(userId, page = 1, limit = 10, filters) {
        const skip = (page - 1) * limit;
        const where = { userId };
        if (filters?.type) {
            where.type = filters.type;
        }
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.paymentStatus) {
            where.paymentStatus = filters.paymentStatus;
        }
        if (filters?.dateFrom || filters?.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) {
                where.createdAt.gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                where.createdAt.lte = new Date(filters.dateTo);
            }
        }
        const [bookings, total] = await Promise.all([
            this.prisma.booking.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    payments: {
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                    },
                },
            }),
            this.prisma.booking.count({ where }),
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
    async updateBooking(id, updateBookingDto, userId) {
        const where = { id };
        if (userId) {
            where.userId = userId;
        }
        const existingBooking = await this.prisma.booking.findUnique({ where });
        if (!existingBooking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (existingBooking.status === client_1.BookingStatus.CANCELLED ||
            existingBooking.status === client_1.BookingStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot update completed or cancelled booking');
        }
        const updatedBooking = await this.prisma.booking.update({
            where,
            data: updateBookingDto,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                payments: true,
            },
        });
        this.logger.log(`Booking updated: ${updatedBooking.reference}`);
        return updatedBooking;
    }
    async confirmBooking(id, userId) {
        const where = { id };
        if (userId) {
            where.userId = userId;
        }
        const booking = await this.prisma.booking.findUnique({ where });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.status !== client_1.BookingStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending bookings can be confirmed');
        }
        if (booking.paymentStatus !== client_1.PaymentStatus.PAID) {
            throw new common_1.BadRequestException('Payment must be completed before confirmation');
        }
        const confirmedBooking = await this.prisma.booking.update({
            where,
            data: {
                status: client_1.BookingStatus.CONFIRMED,
                confirmedAt: new Date(),
                expiresAt: null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        await this.awardLoyaltyPoints(booking.userId, booking.totalAmount, booking.reference);
        this.logger.log(`Booking confirmed: ${confirmedBooking.reference}`);
        return confirmedBooking;
    }
    async cancelBooking(id, reason, userId) {
        const where = { id };
        if (userId) {
            where.userId = userId;
        }
        const booking = await this.prisma.booking.findUnique({ where });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.status === client_1.BookingStatus.CANCELLED) {
            throw new common_1.BadRequestException('Booking is already cancelled');
        }
        if (booking.status === client_1.BookingStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot cancel completed booking');
        }
        const cancelledBooking = await this.prisma.booking.update({
            where,
            data: {
                status: client_1.BookingStatus.CANCELLED,
                cancelledAt: new Date(),
                notes: reason,
            },
        });
        this.logger.log(`Booking cancelled: ${cancelledBooking.reference}`);
        return cancelledBooking;
    }
    async completeBooking(id) {
        const booking = await this.prisma.booking.findUnique({
            where: { id },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.status !== client_1.BookingStatus.CONFIRMED) {
            throw new common_1.BadRequestException('Only confirmed bookings can be completed');
        }
        const completedBooking = await this.prisma.booking.update({
            where: { id },
            data: {
                status: client_1.BookingStatus.COMPLETED,
            },
        });
        this.logger.log(`Booking completed: ${completedBooking.reference}`);
        return completedBooking;
    }
    async getBookingStats(userId) {
        const where = userId ? { userId } : {};
        const [totalBookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, totalRevenue,] = await Promise.all([
            this.prisma.booking.count({ where }),
            this.prisma.booking.count({ where: { ...where, status: client_1.BookingStatus.PENDING } }),
            this.prisma.booking.count({ where: { ...where, status: client_1.BookingStatus.CONFIRMED } }),
            this.prisma.booking.count({ where: { ...where, status: client_1.BookingStatus.COMPLETED } }),
            this.prisma.booking.count({ where: { ...where, status: client_1.BookingStatus.CANCELLED } }),
            this.prisma.booking.aggregate({
                where: { ...where, paymentStatus: client_1.PaymentStatus.PAID },
                _sum: { totalAmount: true },
            }),
        ]);
        return {
            totalBookings,
            pendingBookings,
            confirmedBookings,
            completedBookings,
            cancelledBookings,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
        };
    }
    async getAllBookings(page = 1, limit = 10, filters) {
        const skip = (page - 1) * limit;
        const where = {};
        if (filters?.type) {
            where.type = filters.type;
        }
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.paymentStatus) {
            where.paymentStatus = filters.paymentStatus;
        }
        if (filters?.userId) {
            where.userId = filters.userId;
        }
        if (filters?.search) {
            where.OR = [
                { reference: { contains: filters.search, mode: 'insensitive' } },
                { user: { email: { contains: filters.search, mode: 'insensitive' } } },
                { user: { firstName: { contains: filters.search, mode: 'insensitive' } } },
                { user: { lastName: { contains: filters.search, mode: 'insensitive' } } },
            ];
        }
        if (filters?.dateFrom || filters?.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) {
                where.createdAt.gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                where.createdAt.lte = new Date(filters.dateTo);
            }
        }
        const [bookings, total] = await Promise.all([
            this.prisma.booking.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                        },
                    },
                    payments: {
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                    },
                },
            }),
            this.prisma.booking.count({ where }),
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
    async cleanupExpiredBookings() {
        const expiredBookings = await this.prisma.booking.updateMany({
            where: {
                status: client_1.BookingStatus.PENDING,
                paymentStatus: client_1.PaymentStatus.PENDING,
                expiresAt: {
                    lt: new Date(),
                },
            },
            data: {
                status: client_1.BookingStatus.CANCELLED,
                cancelledAt: new Date(),
                notes: 'Automatically cancelled due to expiry',
            },
        });
        this.logger.log(`Cleaned up ${expiredBookings.count} expired bookings`);
        return expiredBookings.count;
    }
    generateBookingReference(type) {
        const prefix = this.getBookingPrefix(type);
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}${timestamp}${random}`;
    }
    getBookingPrefix(type) {
        switch (type) {
            case client_1.BookingType.FLIGHT:
                return 'FL';
            case client_1.BookingType.HOTEL:
                return 'HT';
            case client_1.BookingType.PACKAGE:
                return 'PK';
            case client_1.BookingType.HAJJ:
                return 'HJ';
            case client_1.BookingType.UMRAH:
                return 'UM';
            default:
                return 'BK';
        }
    }
    async awardLoyaltyPoints(userId, amount, reference) {
        try {
            const points = Math.floor(amount);
            if (points > 0) {
                await this.prisma.$transaction([
                    this.prisma.loyaltyTransaction.create({
                        data: {
                            userId,
                            points,
                            type: 'EARNED',
                            description: `Points earned from booking ${reference}`,
                            reference,
                        },
                    }),
                    this.prisma.user.update({
                        where: { id: userId },
                        data: {
                            loyaltyPoints: {
                                increment: points,
                            },
                        },
                    }),
                ]);
                this.logger.log(`Awarded ${points} loyalty points to user ${userId} for booking ${reference}`);
            }
        }
        catch (error) {
            this.logger.error('Failed to award loyalty points', error);
        }
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = BookingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map