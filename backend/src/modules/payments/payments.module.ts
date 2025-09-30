import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentsResolver } from './payments.resolver';
import { StripeService } from './services/stripe.service';
import { PaypalService } from './services/paypal.service';
import { SslcommerzService } from './services/sslcommerz.service';
import { HyperpayService } from './services/hyperpay.service';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [BookingsModule],
  providers: [
    PaymentsService,
    PaymentsResolver,
    StripeService,
    PaypalService,
    SslcommerzService,
    HyperpayService,
  ],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
