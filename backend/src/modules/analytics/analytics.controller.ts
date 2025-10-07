import { Controller, Get, Query, UseGuards, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AnalyticsService } from './analytics.service';
import { MetricsService } from './services/metrics.service';
import { DashboardService } from './services/dashboard.service';
import { DateRangeDto } from './dto/date-range.dto';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';

@Controller('analytics')
@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Roles(UserRole.ADMIN, UserRole.STAFF_OPERATIONS)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly metricsService: MetricsService,
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get analytics overview' })
  @ApiResponse({ status: 200, description: 'Returns analytics overview' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getOverview(@Query() dateRange: DateRangeDto) {
    return this.dashboardService.getOverview(dateRange);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Get booking analytics' })
  @ApiResponse({ status: 200, description: 'Returns booking analytics' })
  async getBookingAnalytics(@Query() dateRange: DateRangeDto) {
    return this.metricsService.getBookingMetrics(dateRange);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue analytics' })
  @ApiResponse({ status: 200, description: 'Returns revenue analytics' })
  async getRevenueAnalytics(@Query() dateRange: DateRangeDto) {
    return this.metricsService.getRevenueMetrics(dateRange);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get user analytics' })
  @ApiResponse({ status: 200, description: 'Returns user analytics' })
  async getUserAnalytics(@Query() dateRange: DateRangeDto) {
    return this.metricsService.getUserMetrics(dateRange);
  }

  @Get('conversions')
  @ApiOperation({ summary: 'Get conversion metrics' })
  @ApiResponse({ status: 200, description: 'Returns conversion metrics' })
  async getConversionAnalytics(@Query() dateRange: DateRangeDto) {
    return this.dashboardService.getConversionMetrics(dateRange);
  }

  @Get('platform')
  @ApiOperation({ summary: 'Get platform statistics' })
  @ApiResponse({ status: 200, description: 'Returns platform statistics' })
  async getPlatformAnalytics(@Query() dateRange: DateRangeDto) {
    return this.dashboardService.getPlatformStats(dateRange);
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get API performance metrics' })
  @ApiResponse({ status: 200, description: 'Returns API performance metrics' })
  async getPerformanceAnalytics(@Query() dateRange: DateRangeDto) {
    return this.dashboardService.getPerformanceMetrics(dateRange);
  }

  @Get('destinations/popular')
  @ApiOperation({ summary: 'Get popular destinations' })
  @ApiResponse({ status: 200, description: 'Returns popular destinations' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of results to return (default: 5)' })
  async getPopularDestinations(@Query('limit') limit = 5) {
    return this.metricsService.getPopularDestinations(limit);
  }

  @Get('activity/recent')
  @ApiOperation({ summary: 'Get recent activity' })
  @ApiResponse({ status: 200, description: 'Returns recent activity' })
  @ApiPaginatedResponse()
  async getRecentActivity(@Query() pagination: PaginationDto) {
    return this.analyticsService.getRecentActivity(pagination);
  }
}
