import { Module } from '@nestjs/common';
import { FlightBookingsService } from './flight-bookings.service';
import { FlightBookingsController } from './flight-bookings.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FlightBookingsController],
  providers: [FlightBookingsService],
  exports: [FlightBookingsService],
})
export class FlightBookingsModule {}
