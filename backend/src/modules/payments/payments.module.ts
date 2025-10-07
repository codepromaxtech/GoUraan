import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../../prisma/prisma.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsResolver } from './payments.resolver';
import { PaypalService } from './services/paypal.service';
import { StripeService } from './services/stripe.service';
import { SslcommerzService } from './services/sslcommerz.service';
import { HyperpayService } from './services/hyperpay.service';
import { OfflinePaymentService } from './services/offline-payment.service';
import { OfflinePaymentController } from './offline-payment.controller';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
      inject: [ConfigService],
    }),
    BookingsModule
  ],
  providers: [
    PaymentsService,
    PaymentsResolver,
    StripeService,
    PaypalService,
    SslcommerzService,
    HyperpayService,
    OfflinePaymentService,
  ],
  controllers: [PaymentsController, OfflinePaymentController],
  exports: [PaymentsService, OfflinePaymentService],
})
export class PaymentsModule {}
