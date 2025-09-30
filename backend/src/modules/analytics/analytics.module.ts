import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsResolver } from './analytics.resolver';
import { ReportsService } from './services/reports.service';
import { MetricsService } from './services/metrics.service';
import { DashboardService } from './services/dashboard.service';

@Module({
  providers: [
    AnalyticsService,
    AnalyticsResolver,
    ReportsService,
    MetricsService,
    DashboardService,
  ],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
