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
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const reports_service_1 = require("./services/reports.service");
const metrics_service_1 = require("./services/metrics.service");
const dashboard_service_1 = require("./services/dashboard.service");
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    constructor(prisma, reportsService, metricsService, dashboardService) {
        this.prisma = prisma;
        this.reportsService = reportsService;
        this.metricsService = metricsService;
        this.dashboardService = dashboardService;
        this.logger = new common_1.Logger(AnalyticsService_1.name);
    }
    async getDashboardOverview(dateRange) {
        const from = dateRange?.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const to = dateRange?.to || new Date();
        const [bookingStats, revenueStats, userStats, popularDestinations, recentActivity,] = await Promise.all([
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
    async getBookingStats(from, to) {
        const [totalBookings, confirmedBookings, cancelledBookings, pendingBookings, bookingsByType, bookingsTrend,] = await Promise.all([
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
            }, {}),
            trend: bookingsTrend,
        };
    }
    async getRevenueStats(from, to) {
        const [totalRevenue, paidRevenue, refundedAmount, revenueByType, revenueTrend, averageBookingValue,] = await Promise.all([
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
            }, {}),
            trend: revenueTrend,
        };
    }
    async getUserStats(from, to) {
        const [newUsers, activeUsers, totalUsers, usersByRole, userRetention,] = await Promise.all([
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
            }, {}),
        };
    }
    async getPopularDestinations(from, to, limit = 10) {
        const bookings = await this.prisma.booking.findMany({
            where: {
                createdAt: { gte: from, lte: to },
                status: 'CONFIRMED',
            },
            select: { bookingData: true, type: true },
        });
        const destinationCounts = {};
        bookings.forEach(booking => {
            const data = booking.bookingData;
            let destination = 'Unknown';
            if (booking.type === 'FLIGHT' && data.flight?.segments) {
                destination = data.flight.segments[0]?.arrival?.airport || 'Unknown';
            }
            else if (booking.type === 'HOTEL' && data.hotel?.city) {
                destination = data.hotel.city;
            }
            else if (booking.type === 'PACKAGE' && data.package?.destinations) {
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
    async getBookingsTrend(from, to) {
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
    async getRevenueTrend(from, to) {
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
    async calculateUserRetention(from, to) {
        const sevenDaysAgo = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
        const [newUsersLast7Days, activeUsersLast7Days, newUsersLast30Days, activeUsersLast30Days,] = await Promise.all([
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
                clv: totalSpent,
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
    async getMarketingAttribution(from, to) {
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
    async getOperationalMetrics(from, to) {
        const [avgResponseTime, supportTickets, systemUptime, errorRate,] = await Promise.all([
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
    async calculateAvgResponseTime(from, to) {
        return {
            email: 2.5,
            chat: 0.25,
            phone: 0.083,
        };
    }
    async getSupportTicketStats(from, to) {
        return {
            total: 156,
            resolved: 142,
            pending: 14,
            avgResolutionTime: 4.2,
            satisfactionScore: 4.6,
        };
    }
    async getSystemUptime(from, to) {
        return {
            percentage: 99.8,
            incidents: 2,
            avgDowntime: 0.5,
        };
    }
    async getErrorRate(from, to) {
        return {
            percentage: 0.02,
            totalErrors: 45,
            criticalErrors: 2,
            mostCommonError: 'Payment gateway timeout',
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        reports_service_1.ReportsService,
        metrics_service_1.MetricsService,
        dashboard_service_1.DashboardService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map