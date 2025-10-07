import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ReportsService } from './services/reports.service';
import { MetricsService } from './services/metrics.service';
import { DashboardService } from './services/dashboard.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private prisma: PrismaService,
    private reportsService: ReportsService,
    private metricsService: MetricsService,
    private dashboardService: DashboardService,
  ) {}

  async getDashboardOverview(dateRange?: { from: Date; to: Date }) {
    const from = dateRange?.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const to = dateRange?.to || new Date();

    const [
      bookingStats,
      revenueStats,
      userStats,
      popularDestinations,
      recentActivity,
    ] = await Promise.all([
      this.getBookingStats(from, to),
      this.getRevenueStats(from, to),
      this.getUserStats(from, to),
      this.getPopularDestinations(from, to),
      this.getRecentActivity(10),
    ]);

    return {
      bookingStats,
      revenueStats,
      userStats,
      popularDestinations,
      recentActivity,
      dateRange: { from, to },
    };
  }

  async getBookingStats(from: Date, to: Date) {
    const [
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      pendingBookings,
      bookingsByType,
      bookingsTrend,
    ] = await Promise.all([
      this.prisma.booking.count({
        where: { createdAt: { gte: from, lte: to } },
      }),
      this.prisma.booking.count({
        where: { 
          createdAt: { gte: from, lte: to },
          status: 'CONFIRMED',
        },
      }),
      this.prisma.booking.count({
        where: { 
          createdAt: { gte: from, lte: to },
          status: 'CANCELLED',
        },
      }),
      this.prisma.booking.count({
        where: { 
          createdAt: { gte: from, lte: to },
          status: 'PENDING',
        },
      }),
      this.prisma.booking.groupBy({
        by: ['type'],
        where: { createdAt: { gte: from, lte: to } },
        _count: { type: true },
      }),
      this.getBookingsTrend(from, to),
    ]);

    const conversionRate = totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0;
    const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;

    return {
      total: totalBookings,
      confirmed: confirmedBookings,
      cancelled: cancelledBookings,
      pending: pendingBookings,
      conversionRate: Math.round(conversionRate * 100) / 100,
      cancellationRate: Math.round(cancellationRate * 100) / 100,
      byType: bookingsByType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<string, number>),
      trend: bookingsTrend,
    };
  }

  async getRevenueStats(from: Date, to: Date) {
    const [
      totalRevenue,
      paidRevenue,
      refundedAmount,
      revenueByType,
      revenueTrend,
      averageBookingValue,
    ] = await Promise.all([
      this.prisma.booking.aggregate({
        where: { createdAt: { gte: from, lte: to } },
        _sum: { totalAmount: true },
      }),
      this.prisma.booking.aggregate({
        where: { 
          createdAt: { gte: from, lte: to },
          paymentStatus: 'PAID',
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.payment.aggregate({
        where: { 
          createdAt: { gte: from, lte: to },
          status: 'REFUNDED',
        },
        _sum: { refundAmount: true },
      }),
      this.prisma.booking.groupBy({
        by: ['type'],
        where: { 
          createdAt: { gte: from, lte: to },
          paymentStatus: 'PAID',
        },
        _sum: { totalAmount: true },
      }),
      this.getRevenueTrend(from, to),
      this.prisma.booking.aggregate({
        where: { 
          createdAt: { gte: from, lte: to },
          paymentStatus: 'PAID',
        },
        _avg: { totalAmount: true },
      }),
    ]);

    return {
      total: totalRevenue._sum.totalAmount || 0,
      paid: paidRevenue._sum.totalAmount || 0,
      refunded: refundedAmount._sum.refundAmount || 0,
      net: (paidRevenue._sum.totalAmount || 0) - (refundedAmount._sum.refundAmount || 0),
      averageBookingValue: Math.round((averageBookingValue._avg.totalAmount || 0) * 100) / 100,
      byType: revenueByType.reduce((acc, item) => {
        acc[item.type] = item._sum.totalAmount || 0;
        return acc;
      }, {} as Record<string, number>),
      trend: revenueTrend,
    };
  }

  async getUserStats(from: Date, to: Date) {
    const [
      newUsers,
      activeUsers,
      totalUsers,
      usersByRole,
      userRetention,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { createdAt: { gte: from, lte: to } },
      }),
      this.prisma.user.count({
        where: { 
          lastLoginAt: { gte: from, lte: to },
          status: 'ACTIVE',
        },
      }),
      this.prisma.user.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.user.groupBy({
        by: ['role'],
        where: { createdAt: { gte: from, lte: to } },
        _count: { role: true },
      }),
      this.calculateUserRetention(from, to),
    ]);

    return {
      new: newUsers,
      active: activeUsers,
      total: totalUsers,
      retention: userRetention,
      byRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count.role;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async getPopularDestinations(from: Date, to: Date, limit = 10) {
    // This would analyze booking data to find popular destinations
    const bookings = await this.prisma.booking.findMany({
      where: { 
        createdAt: { gte: from, lte: to },
        status: 'CONFIRMED',
      },
      select: { bookingData: true, type: true },
    });

    const destinationCounts: Record<string, number> = {};

    bookings.forEach(booking => {
      const data = booking.bookingData as any;
      let destination = 'Unknown';

      if (booking.type === 'FLIGHT' && data.flight?.segments) {
        destination = data.flight.segments[0]?.arrival?.airport || 'Unknown';
      } else if (booking.type === 'HOTEL' && data.hotel?.city) {
        destination = data.hotel.city;
      } else if (booking.type === 'PACKAGE' && data.package?.destinations) {
        destination = data.package.destinations[0] || 'Unknown';
      }

      destinationCounts[destination] = (destinationCounts[destination] || 0) + 1;
    });

    return Object.entries(destinationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([destination, count]) => ({ destination, count }));
  }

  async getRecentActivity(limit = 20) {
    const [recentBookings, recentPayments, recentUsers] = await Promise.all([
      this.prisma.booking.findMany({
        take: limit / 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          reference: true,
          type: true,
          status: true,
          totalAmount: true,
          currency: true,
          createdAt: true,
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      }),
      this.prisma.payment.findMany({
        take: limit / 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          gateway: true,
          createdAt: true,
          booking: {
            select: { reference: true },
          },
        },
      }),
      this.prisma.user.findMany({
        take: limit / 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    const activities = [
      ...recentBookings.map(booking => ({
        type: 'booking',
        id: booking.id,
        title: `New ${booking.type.toLowerCase()} booking`,
        description: `${booking.user.firstName} ${booking.user.lastName} booked ${booking.reference}`,
        amount: booking.totalAmount,
        currency: booking.currency,
        status: booking.status,
        timestamp: booking.createdAt,
      })),
      ...recentPayments.map(payment => ({
        type: 'payment',
        id: payment.id,
        title: `Payment ${payment.status.toLowerCase()}`,
        description: `${payment.gateway} payment for ${payment.booking?.reference}`,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        timestamp: payment.createdAt,
      })),
      ...recentUsers.map(user => ({
        type: 'user',
        id: user.id,
        title: 'New user registration',
        description: `${user.firstName} ${user.lastName} (${user.role})`,
        status: 'ACTIVE',
        timestamp: user.createdAt,
      })),
    ];

    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  private async getBookingsTrend(from: Date, to: Date) {
    const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    const trend = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(from.getTime() + i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      const count = await this.prisma.booking.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      trend.push({
        date: date.toISOString().split('T')[0],
        count,
      });
    }

    return trend;
  }

  private async getRevenueTrend(from: Date, to: Date) {
    const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    const trend = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(from.getTime() + i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      const revenue = await this.prisma.booking.aggregate({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
          paymentStatus: 'PAID',
        },
        _sum: { totalAmount: true },
      });

      trend.push({
        date: date.toISOString().split('T')[0],
        revenue: revenue._sum.totalAmount || 0,
      });
    }

    return trend;
  }

  private async calculateUserRetention(from: Date, to: Date) {
    // Calculate 7-day and 30-day retention rates
    const sevenDaysAgo = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      newUsersLast7Days,
      activeUsersLast7Days,
      newUsersLast30Days,
      activeUsersLast30Days,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgo, lte: to } },
      }),
      this.prisma.user.count({
        where: { 
          createdAt: { gte: sevenDaysAgo, lte: to },
          lastLoginAt: { gte: sevenDaysAgo },
        },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo, lte: to } },
      }),
      this.prisma.user.count({
        where: { 
          createdAt: { gte: thirtyDaysAgo, lte: to },
          lastLoginAt: { gte: sevenDaysAgo },
        },
      }),
    ]);

    return {
      sevenDay: newUsersLast7Days > 0 ? (activeUsersLast7Days / newUsersLast7Days) * 100 : 0,
      thirtyDay: newUsersLast30Days > 0 ? (activeUsersLast30Days / newUsersLast30Days) * 100 : 0,
    };
  }

  // Advanced analytics methods
  async getCustomerLifetimeValue() {
    const users = await this.prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      include: {
        bookings: {
          where: { paymentStatus: 'PAID' },
          select: { totalAmount: true },
        },
      },
    });

    const clvData = users.map(user => {
      const totalSpent = user.bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
      const bookingCount = user.bookings.length;
      const avgOrderValue = bookingCount > 0 ? totalSpent / bookingCount : 0;

      return {
        userId: user.id,
        totalSpent,
        bookingCount,
        avgOrderValue,
        clv: totalSpent, // Simplified CLV calculation
      };
    });

    const avgCLV = clvData.reduce((sum, user) => sum + user.clv, 0) / clvData.length;

    return {
      averageCLV: Math.round(avgCLV * 100) / 100,
      topCustomers: clvData
        .sort((a, b) => b.clv - a.clv)
        .slice(0, 10),
      distribution: {
        high: clvData.filter(u => u.clv > avgCLV * 2).length,
        medium: clvData.filter(u => u.clv > avgCLV && u.clv <= avgCLV * 2).length,
        low: clvData.filter(u => u.clv <= avgCLV).length,
      },
    };
  }

  async getMarketingAttribution(from: Date, to: Date) {
    // This would analyze how users found the platform
    // For now, return mock data structure
    return {
      channels: [
        { channel: 'Organic Search', bookings: 45, revenue: 125000, cost: 0 },
        { channel: 'Google Ads', bookings: 32, revenue: 89000, cost: 15000 },
        { channel: 'Facebook Ads', bookings: 28, revenue: 76000, cost: 12000 },
        { channel: 'Direct', bookings: 25, revenue: 68000, cost: 0 },
        { channel: 'Referral', bookings: 18, revenue: 52000, cost: 5000 },
      ],
      totalROI: 2.8,
      bestPerformingChannel: 'Organic Search',
    };
  }

  async getOperationalMetrics(from: Date, to: Date) {
    const [
      avgResponseTime,
      supportTickets,
      systemUptime,
      errorRate,
    ] = await Promise.all([
      this.calculateAvgResponseTime(from, to),
      this.getSupportTicketStats(from, to),
      this.getSystemUptime(from, to),
      this.getErrorRate(from, to),
    ]);

    return {
      avgResponseTime,
      supportTickets,
      systemUptime,
      errorRate,
    };
  }

  private async calculateAvgResponseTime(from: Date, to: Date) {
    // Mock implementation - would integrate with support system
    return {
      email: 2.5, // hours
      chat: 0.25, // hours (15 minutes)
      phone: 0.083, // hours (5 minutes)
    };
  }

  private async getSupportTicketStats(from: Date, to: Date) {
    // Mock implementation - would integrate with support system
    return {
      total: 156,
      resolved: 142,
      pending: 14,
      avgResolutionTime: 4.2, // hours
      satisfactionScore: 4.6, // out of 5
    };
  }

  private async getSystemUptime(from: Date, to: Date) {
    // Mock implementation - would integrate with monitoring system
    return {
      percentage: 99.8,
      incidents: 2,
      avgDowntime: 0.5, // hours
    };
  }

  private async getErrorRate(from: Date, to: Date) {
    // Mock implementation - would integrate with error tracking
    return {
      percentage: 0.02,
      totalErrors: 45,
      criticalErrors: 2,
      mostCommonError: 'Payment gateway timeout',
    };
  }
}
