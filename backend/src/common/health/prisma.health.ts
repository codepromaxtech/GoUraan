import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const isHealthy = await this.prismaService.isHealthy();
      const result = this.getStatus(key, isHealthy);

      if (isHealthy) {
        return result;
      }
      throw new HealthCheckError('Prisma check failed', result);
    } catch (error) {
      throw new HealthCheckError('Prisma check failed', this.getStatus(key, false));
    }
  }
}
