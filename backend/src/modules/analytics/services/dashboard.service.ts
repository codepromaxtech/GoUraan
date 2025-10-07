import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { MetricsService } from './metrics.service';
import { DateRangeDto } from '../dto/date-range.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private prisma: PrismaService,
    private metricsService: MetricsService,
  ) {}

  /**
   * Get dashboard overview with key metrics
   */
  async getOverview(dateRange?: DateRangeDto) {
    try {
      const [
        bookingMetrics,
        revenueMetrics,
        userMetrics,
        popularDestinations,
        recentActivity,
        conversionMetrics,
        platformStats
      ] = await Promise.all([
        this.metricsService.getBookingMetrics(dateRange),
        this.metricsService.getRevenueMetrics(dateRange),
        this.metricsService.getUserMetrics(dateRange),
        this.metricsService.getPopularDestinations(5),
        this.metricsService.getRecentActivity(10),
        this.getConversionMetrics(dateRange),
        this.getPlatformStats(dateRange)
      ]);

      return {
        bookings: bookingMetrics,
        revenue: revenueMetrics,
        users: userMetrics,
        popularDestinations,
        recentActivity,
        conversions: conversionMetrics,
        platform: platformStats,
        dateRange: dateRange || { 
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
          to: new Date() 
        },
      };
    } catch (error) {
      this.logger.error('Failed to get dashboard overview', error.stack);
      throw error;
    }
  }

  /**
   * Get conversion metrics
   */
  private async getConversionMetrics(dateRange?: DateRangeDto) {
    const { from, to } = this.metricsService['getDateRange'](dateRange);

    const [
      totalSessions,
      totalBookings,
      totalUsers,
      sessionsWithBooking
    ] = await Promise.all([
      this.prisma.userSession.count({
        where: { 
          lastActivityAt: { gte: from, lte: to } 
        },
      }),
      this.prisma.booking.count({
        where: { 
          createdAt: { gte: from, lte: to },
          status: { in: ['CONFIRMED', 'COMPLETED'] }
        },
      }),
      this.prisma.user.count({
        where: { 
          createdAt: { lte: to } 
        },
      }),
      this.prisma.$queryRaw`
        SELECT COUNT(DISTINCT "userId") as count
        FROM "UserSession"
        WHERE 
          "lastActivityAt" >= ${from} AND 
          "lastActivityAt" <= ${to} AND
          "userId" IN (
            SELECT "userId" 
            FROM "Booking" 
            WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}
          )
      `
    ]);

    const conversionRate = totalSessions > 0 
      ? (totalBookings / totalSessions) * 100 
      : 0;

    const userConversionRate = totalUsers > 0 
      ? (sessionsWithBooking[0]?.count || 0) / totalUsers * 100 
      : 0;

    return {
      sessionToBooking: parseFloat(conversionRate.toFixed(2)),
      userToBooking: parseFloat(userConversionRate.toFixed(2)),
      totalSessions,
      totalBookings,
      dateRange: { from, to }
    };
  }

  /**
   * Get platform statistics
   */
  private async getPlatformStats(dateRange?: DateRangeDto) {
    const { from, to } = this.metricsService['getDateRange'](dateRange);

    const [
      deviceStats,
      browserStats,
      osStats,
      countryStats
    ] = await Promise.all([
      this.prisma.userSession.groupBy({
        by: ['deviceType'],
        where: { 
          lastActivityAt: { gte: from, lte: to } 
        },
        _count: { _all: true },
        orderBy: { _count: { _all: 'desc' } },
        take: 5
      }),
      this.prisma.userSession.groupBy({
        by: ['browser'],
        where: { 
          lastActivityAt: { gte: from, lte: to },
          browser: { not: null }
        },
        _count: { _all: true },
        orderBy: { _count: { _all: 'desc' } },
        take: 5
      }),
      this.prisma.userSession.groupBy({
        by: ['os'],
        where: { 
          lastActivityAt: { gte: from, lte: to },
          os: { not: null }
        },
        _count: { _all: true },
        orderBy: { _count: { _all: 'desc' } },
        take: 5
      }),
      this.prisma.userSession.groupBy({
        by: ['country'],
        where: { 
          lastActivityAt: { gte: from, lte: to },
          country: { not: null }
        },
        _count: { _all: true },
        orderBy: { _count: { _all: 'desc' } },
        take: 10
      })
    ]);

    return {
      devices: deviceStats.map(stat => ({
        type: stat.deviceType || 'Unknown',
        count: stat._count._all
      })),
      browsers: browserStats.map(stat => ({
        name: stat.browser || 'Unknown',
        count: stat._count._all
      })),
      os: osStats.map(stat => ({
        name: stat.os || 'Unknown',
        count: stat._count._all
      })),
      countries: countryStats.map(stat => ({
        code: stat.country || 'XX',
        count: stat._count._all
      }))
    };
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(dateRange?: DateRangeDto) {
    const { from, to } = this.metricsService['getDateRange'](dateRange);

    // Get average response times for different endpoints
    const responseTimes = await this.prisma.auditLog.groupBy({
      by: ['action'],
      where: {
        action: { startsWith: 'API_' },
        createdAt: { gte: from, lte: to },
        metadata: {
          path: ['responseTime'],
          not: null
        }
      },
      _avg: {
        metadata: {
          path: ['responseTime']
        }
      },
      _count: true,
      orderBy: {
        _count: 'desc'
      },
      take: 10
    });

    // Get error rates
    const errorRates = await this.prisma.auditLog.groupBy({
      by: ['action', 'status'],
      where: {
        action: { startsWith: 'API_' },
        createdAt: { gte: from, lte: to },
        status: { not: 'SUCCESS' }
      },
      _count: true,
      orderBy: {
        _count: 'desc'
      }
    });

    // Calculate error rates per endpoint
    const endpointErrorRates = errorRates.reduce((acc, item) => {
      const existing = acc.find(e => e.action === item.action);
      if (existing) {
        existing.errors += item._count;
      } else {
        acc.push({
          action: item.action,
          errors: item._count,
          status: item.status
        });
      }
      return acc;
    }, []);

    // Merge response times with error rates
    const performanceMetrics = responseTimes.map(metric => {
      const errors = endpointErrorRates.find(e => e.action === metric.action)?.errors || 0;
      const totalRequests = metric._count;
      const errorRate = (errors / totalRequests) * 100;

      return {
        endpoint: metric.action.replace('API_', '').replace(/_/g, ' '),
        avgResponseTime: metric._avg.metadata || 0,
        totalRequests,
        errorRate: parseFloat(errorRate.toFixed(2))
      };
    });

    return {
      metrics: performanceMetrics,
      dateRange: { from, to }
    };
  }
}
