import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingsResolver } from './bookings.resolver';

@Module({
  providers: [BookingsService, BookingsResolver],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}
