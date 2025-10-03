import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { DateRangeDto } from '../dto/date-range.dto';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get booking metrics for the specified date range
   */
  async getBookingMetrics(dateRange?: DateRangeDto) {
    const { from, to } = this.getDateRange(dateRange);

    const [
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      bookingTrends
    ] = await Promise.all([
      this.prisma.booking.count({
        where: { createdAt: { gte: from, lte: to } },
      }),
      this.prisma.booking.count({
        where: { 
          status: 'CONFIRMED',
          createdAt: { gte: from, lte: to } 
        },
      }),
      this.prisma.booking.count({
        where: { 
          status: 'CANCELLED',
          createdAt: { gte: from, lte: to } 
        },
      }),
      this.prisma.booking.count({
        where: { 
          status: 'COMPLETED',
          createdAt: { gte: from, lte: to } 
        },
      }),
      this.getBookingTrends(from, to)
    ]);

    return {
      total: totalBookings,
      confirmed: confirmedBookings,
      cancelled: cancelledBookings,
      completed: completedBookings,
      trends: bookingTrends,
      dateRange: { from, to }
    };
  }

  /**
   * Get revenue metrics for the specified date range
   */
  async getRevenueMetrics(dateRange?: DateRangeDto) {
    const { from, to } = this.getDateRange(dateRange);

    const [
      totalRevenue,
      revenueByType,
      revenueTrends
    ] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { 
          status: 'PAID',
          paidAt: { gte: from, lte: to } 
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.groupBy({
        by: ['type'],
        where: { 
          status: 'PAID',
          paidAt: { gte: from, lte: to } 
        },
        _sum: { amount: true },
      }),
      this.getRevenueTrends(from, to)
    ]);

    return {
      total: totalRevenue._sum.amount || 0,
      byType: revenueByType.reduce((acc, item) => ({
        ...acc,
        [item.type]: item._sum.amount || 0
      }), {}),
      trends: revenueTrends,
      dateRange: { from, to }
    };
  }

  /**
   * Get user metrics for the specified date range
   */
  async getUserMetrics(dateRange?: DateRangeDto) {
    const { from, to } = this.getDateRange(dateRange);

    const [
      totalUsers,
      newUsers,
      activeUsers,
      userGrowth
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { createdAt: { gte: from, lte: to } },
      }),
      this.prisma.userSession.count({
        distinct: ['userId'],
        where: { 
          lastActivityAt: { gte: from, lte: to } 
        },
      }),
      this.getUserGrowth(from, to)
    ]);

    return {
      total: totalUsers,
      newUsers,
      activeUsers,
      growth: userGrowth,
      dateRange: { from, to }
    };
  }

  /**
   * Get booking trends over time
   */
  private async getBookingTrends(from: Date, to: Date) {
    const dateFormat = this.getDateFormat(from, to);
    
    const trends = await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC(${dateFormat}, "createdAt") as date,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled
      FROM "Booking"
      WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}
      GROUP BY date
      ORDER BY date ASC
    `;

    return trends;
  }

  /**
   * Get revenue trends over time
   */
  private async getRevenueTrends(from: Date, to: Date) {
    const dateFormat = this.getDateFormat(from, to);
    
    const trends = await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC(${dateFormat}, "paidAt") as date,
        COALESCE(SUM(amount), 0) as amount,
        COUNT(*) as transactions
      FROM "Payment"
      WHERE 
        status = 'PAID' AND
        "paidAt" >= ${from} AND "paidAt" <= ${to}
      GROUP BY date
      ORDER BY date ASC
    `;

    return trends;
  }

  /**
   * Get user growth over time
   */
  private async getUserGrowth(from: Date, to: Date) {
    const dateFormat = this.getDateFormat(from, to);
    
    const growth = await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC(${dateFormat}, "createdAt") as date,
        COUNT(*) as count
      FROM "User"
      WHERE "createdAt" <= ${to}
      GROUP BY date
      HAVING DATE_TRUNC(${dateFormat}, "createdAt") >= ${from}
      ORDER BY date ASC
    `;

    return growth;
  }

  /**
   * Get popular destinations
   */
  async getPopularDestinations(limit = 5) {
    return this.prisma.booking.groupBy({
      by: ['destination'],
      _count: { _all: true },
      orderBy: { _count: { _all: 'desc' } },
      take: limit,
    });
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit = 10) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    });
  }

  /**
   * Helper to get date range with defaults
   */
  private getDateRange(dateRange?: DateRangeDto) {
    const from = dateRange?.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const to = dateRange?.to || new Date();
    return { from, to };
  }

  /**
   * Determine appropriate date format based on date range
   */
  private getDateFormat(from: Date, to: Date): string {
    const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'hour';
    if (diffDays <= 7) return 'day';
    if (diffDays <= 30) return 'day';
    if (diffDays <= 90) return 'week';
    return 'month';
  }
}
