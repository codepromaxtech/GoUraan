import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateBookingDto, UpdateBookingDto } from './dto';
import { BookingType, BookingStatus, PaymentStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(private prisma: PrismaService) {}

  async createBooking(userId: string, createBookingDto: CreateBookingDto) {
    const { type, bookingData, totalAmount, currency } = createBookingDto;

    // Generate unique booking reference
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
          status: BookingStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes expiry
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
    } catch (error) {
      this.logger.error('Failed to create booking', error);
      throw new BadRequestException('Failed to create booking');
    }
  }

  async findById(id: string, userId?: string) {
    const where: any = { id };
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
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async findByReference(reference: string, userId?: string) {
    const where: any = { reference };
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
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async getUserBookings(userId: string, page = 1, limit = 10, filters?: any) {
    const skip = (page - 1) * limit;
    const where: any = { userId };

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

  async updateBooking(id: string, updateBookingDto: UpdateBookingDto, userId?: string) {
    const where: any = { id };
    if (userId) {
      where.userId = userId;
    }

    // Check if booking exists
    const existingBooking = await this.prisma.booking.findUnique({ where });
    if (!existingBooking) {
      throw new NotFoundException('Booking not found');
    }

    // Check if booking can be updated
    if (existingBooking.status === BookingStatus.CANCELLED || 
        existingBooking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot update completed or cancelled booking');
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

  async confirmBooking(id: string, userId?: string) {
    const where: any = { id };
    if (userId) {
      where.userId = userId;
    }

    const booking = await this.prisma.booking.findUnique({ where });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be confirmed');
    }

    if (booking.paymentStatus !== PaymentStatus.PAID) {
      throw new BadRequestException('Payment must be completed before confirmation');
    }

    const confirmedBooking = await this.prisma.booking.update({
      where,
      data: {
        status: BookingStatus.CONFIRMED,
        confirmedAt: new Date(),
        expiresAt: null, // Remove expiry once confirmed
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

    // Award loyalty points for confirmed booking
    await this.awardLoyaltyPoints(booking.userId, booking.totalAmount, booking.reference);

    this.logger.log(`Booking confirmed: ${confirmedBooking.reference}`);
    return confirmedBooking;
  }

  async cancelBooking(id: string, reason?: string, userId?: string) {
    const where: any = { id };
    if (userId) {
      where.userId = userId;
    }

    const booking = await this.prisma.booking.findUnique({ where });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed booking');
    }

    const cancelledBooking = await this.prisma.booking.update({
      where,
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        notes: reason,
      },
    });

    this.logger.log(`Booking cancelled: ${cancelledBooking.reference}`);
    return cancelledBooking;
  }

  async completeBooking(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed bookings can be completed');
    }

    const completedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.COMPLETED,
      },
    });

    this.logger.log(`Booking completed: ${completedBooking.reference}`);
    return completedBooking;
  }

  async getBookingStats(userId?: string) {
    const where = userId ? { userId } : {};

    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.count({ where: { ...where, status: BookingStatus.PENDING } }),
      this.prisma.booking.count({ where: { ...where, status: BookingStatus.CONFIRMED } }),
      this.prisma.booking.count({ where: { ...where, status: BookingStatus.COMPLETED } }),
      this.prisma.booking.count({ where: { ...where, status: BookingStatus.CANCELLED } }),
      this.prisma.booking.aggregate({
        where: { ...where, paymentStatus: PaymentStatus.PAID },
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

  // Admin functions
  async getAllBookings(page = 1, limit = 10, filters?: any) {
    const skip = (page - 1) * limit;
    const where: any = {};

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
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        expiresAt: {
          lt: new Date(),
        },
      },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        notes: 'Automatically cancelled due to expiry',
      },
    });

    this.logger.log(`Cleaned up ${expiredBookings.count} expired bookings`);
    return expiredBookings.count;
  }

  private generateBookingReference(type: BookingType): string {
    const prefix = this.getBookingPrefix(type);
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  private getBookingPrefix(type: BookingType): string {
    switch (type) {
      case BookingType.FLIGHT:
        return 'FL';
      case BookingType.HOTEL:
        return 'HT';
      case BookingType.PACKAGE:
        return 'PK';
      case BookingType.HAJJ:
        return 'HJ';
      case BookingType.UMRAH:
        return 'UM';
      default:
        return 'BK';
    }
  }

  private async awardLoyaltyPoints(userId: string, amount: number, reference: string) {
    try {
      // Calculate points (1 point per dollar spent)
      const points = Math.floor(amount);

      if (points > 0) {
        await this.prisma.$transaction([
          // Add loyalty transaction
          this.prisma.loyaltyTransaction.create({
            data: {
              userId,
              points,
              type: 'EARNED',
              description: `Points earned from booking ${reference}`,
              reference,
            },
          }),
          // Update user's total loyalty points
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
    } catch (error) {
      this.logger.error('Failed to award loyalty points', error);
    }
  }
}
