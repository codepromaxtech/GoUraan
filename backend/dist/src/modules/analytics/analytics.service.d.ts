import { PrismaService } from '@/common/prisma/prisma.service';
import { ReportsService } from './services/reports.service';
import { MetricsService } from './services/metrics.service';
import { DashboardService } from './services/dashboard.service';
export declare class AnalyticsService {
    private prisma;
    private reportsService;
    private metricsService;
    private dashboardService;
    private readonly logger;
    constructor(prisma: PrismaService, reportsService: ReportsService, metricsService: MetricsService, dashboardService: DashboardService);
    getDashboardOverview(dateRange?: {
        from: Date;
        to: Date;
    }): Promise<{
        bookingStats: {
            total: number;
            confirmed: number;
            cancelled: number;
            pending: number;
            conversionRate: number;
            cancellationRate: number;
            byType: Record<string, number>;
            trend: any[];
        };
        revenueStats: {
            total: number;
            paid: number;
            refunded: number;
            net: number;
            averageBookingValue: number;
            byType: Record<string, number>;
            trend: any[];
        };
        userStats: {
            new: number;
            active: number;
            total: number;
            retention: {
                sevenDay: number;
                thirtyDay: number;
            };
            byRole: Record<string, number>;
        };
        popularDestinations: {
            destination: string;
            count: number;
        }[];
        recentActivity: {
            type: string;
            id: string;
            title: string;
            description: string;
            status: string;
            timestamp: Date;
        }[];
        dateRange: {
            from: Date;
            to: Date;
        };
    }>;
    getBookingStats(from: Date, to: Date): Promise<{
        total: number;
        confirmed: number;
        cancelled: number;
        pending: number;
        conversionRate: number;
        cancellationRate: number;
        byType: Record<string, number>;
        trend: any[];
    }>;
    getRevenueStats(from: Date, to: Date): Promise<{
        total: number;
        paid: number;
        refunded: number;
        net: number;
        averageBookingValue: number;
        byType: Record<string, number>;
        trend: any[];
    }>;
    getUserStats(from: Date, to: Date): Promise<{
        new: number;
        active: number;
        total: number;
        retention: {
            sevenDay: number;
            thirtyDay: number;
        };
        byRole: Record<string, number>;
    }>;
    getPopularDestinations(from: Date, to: Date, limit?: number): Promise<{
        destination: string;
        count: number;
    }[]>;
    getRecentActivity(limit?: number): Promise<{
        type: string;
        id: string;
        title: string;
        description: string;
        status: string;
        timestamp: Date;
    }[]>;
    private getBookingsTrend;
    private getRevenueTrend;
    private calculateUserRetention;
    getCustomerLifetimeValue(): Promise<{
        averageCLV: number;
        topCustomers: {
            userId: string;
            totalSpent: number;
            bookingCount: number;
            avgOrderValue: number;
            clv: number;
        }[];
        distribution: {
            high: number;
            medium: number;
            low: number;
        };
    }>;
    getMarketingAttribution(from: Date, to: Date): Promise<{
        channels: {
            channel: string;
            bookings: number;
            revenue: number;
            cost: number;
        }[];
        totalROI: number;
        bestPerformingChannel: string;
    }>;
    getOperationalMetrics(from: Date, to: Date): Promise<{
        avgResponseTime: {
            email: number;
            chat: number;
            phone: number;
        };
        supportTickets: {
            total: number;
            resolved: number;
            pending: number;
            avgResolutionTime: number;
            satisfactionScore: number;
        };
        systemUptime: {
            percentage: number;
            incidents: number;
            avgDowntime: number;
        };
        errorRate: {
            percentage: number;
            totalErrors: number;
            criticalErrors: number;
            mostCommonError: string;
        };
    }>;
    private calculateAvgResponseTime;
    private getSupportTicketStats;
    private getSystemUptime;
    private getErrorRate;
}
