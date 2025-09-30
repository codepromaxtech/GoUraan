// @ts-nocheck
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreatePaymentDto, ProcessPaymentDto, RefundPaymentDto } from './dto';
import { StripeService } from './services/stripe.service';
import { PaypalService } from './services/paypal.service';
import { SslcommerzService } from './services/sslcommerz.service';
import { HyperpayService } from './services/hyperpay.service';
import { PaymentGateway, PaymentStatus, PaymentMethod, BookingStatus } from '@prisma/client';
import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private bookingsService: BookingsService,
    private stripeService: StripeService,
    private paypalService: PaypalService,
    private sslcommerzService: SslcommerzService,
    private hyperpayService: HyperpayService,
  ) {}

  async createPayment(userId: string, createPaymentDto: CreatePaymentDto) {
    const { bookingId, gateway, method, amount, currency } = createPaymentDto;

    // Verify booking exists and belongs to user
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId,
        status: BookingStatus.PENDING,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found or not eligible for payment');
    }

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        bookingId,
        userId,
        amount,
        currency: currency as any,
        method: method as any,
        gateway: gateway as any,
        status: PaymentStatus.PENDING,
      },
    });

    this.logger.log(`Payment created: ${payment.id} for booking: ${bookingId}`);
    return payment;
  }

  async processPayment(paymentId: string, processPaymentDto: ProcessPaymentDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not in pending status');
    }

    try {
      let gatewayResponse;

      // Process payment based on gateway
      switch (payment.gateway) {
        case PaymentGateway.STRIPE:
          gatewayResponse = await this.stripeService.processPayment({
            amount: payment.amount,
            currency: payment.currency,
            paymentMethodId: processPaymentDto.paymentMethodId,
            metadata: {
              paymentId: payment.id,
              bookingId: payment.bookingId,
            },
          });
          break;

        case PaymentGateway.PAYPAL:
          gatewayResponse = await this.paypalService.processPayment({
            amount: payment.amount,
            currency: payment.currency,
            orderId: processPaymentDto.orderId,
          });
          break;

        case PaymentGateway.SSLCOMMERZ:
          gatewayResponse = await this.sslcommerzService.processPayment({
            amount: payment.amount,
            currency: payment.currency,
            transactionId: processPaymentDto.transactionId,
          });
          break;

        case PaymentGateway.HYPERPAY:
          gatewayResponse = await this.hyperpayService.processPayment({
            amount: payment.amount,
            currency: payment.currency,
            checkoutId: processPaymentDto.checkoutId,
          });
          break;

        default:
          throw new BadRequestException('Unsupported payment gateway');
      }

      // Update payment status based on gateway response
      const updatedPayment = await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: gatewayResponse.success ? PaymentStatus.PAID : PaymentStatus.FAILED,
          gatewayTransactionId: gatewayResponse.transactionId,
          gatewayResponse: gatewayResponse,
          processedAt: new Date(),
        },
      });

      // Update booking payment status if payment successful
      if (gatewayResponse.success) {
        await this.prisma.booking.update({
          where: { id: payment.bookingId },
          data: { paymentStatus: PaymentStatus.PAID },
        });

        // Confirm booking if payment is complete
        await this.bookingsService.confirmBooking(payment.bookingId);

        this.logger.log(`Payment successful: ${paymentId}`);
      } else {
        this.logger.warn(`Payment failed: ${paymentId} - ${gatewayResponse.error}`);
      }

      return updatedPayment;
    } catch (error) {
      this.logger.error(`Payment processing failed: ${paymentId}`, error);

      // Update payment status to failed
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.FAILED,
          gatewayResponse: { error: error.message },
          processedAt: new Date(),
        },
      });

      throw new BadRequestException('Payment processing failed');
    }
  }

  async refundPayment(paymentId: string, refundPaymentDto: RefundPaymentDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException('Only paid payments can be refunded');
    }

    try {
      let refundResponse;

      // Process refund based on gateway
      switch (payment.gateway) {
        case PaymentGateway.STRIPE:
          refundResponse = await this.stripeService.refundPayment({
            transactionId: payment.gatewayTransactionId,
            amount: refundPaymentDto.amount || payment.amount,
            reason: refundPaymentDto.reason,
          });
          break;

        case PaymentGateway.PAYPAL:
          refundResponse = await this.paypalService.refundPayment({
            transactionId: payment.gatewayTransactionId,
            amount: refundPaymentDto.amount || payment.amount,
            reason: refundPaymentDto.reason,
          });
          break;

        case PaymentGateway.SSLCOMMERZ:
          refundResponse = await this.sslcommerzService.refundPayment({
            transactionId: payment.gatewayTransactionId,
            amount: refundPaymentDto.amount || payment.amount,
            reason: refundPaymentDto.reason,
          });
          break;

        case PaymentGateway.HYPERPAY:
          refundResponse = await this.hyperpayService.refundPayment({
            transactionId: payment.gatewayTransactionId,
            amount: refundPaymentDto.amount || payment.amount,
            reason: refundPaymentDto.reason,
          });
          break;

        default:
          throw new BadRequestException('Unsupported payment gateway for refund');
      }

      // Update payment with refund information
      const updatedPayment = await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.REFUNDED,
          refundAmount: refundPaymentDto.amount || payment.amount,
          refundedAt: new Date(),
          refundReason: refundPaymentDto.reason,
          gatewayResponse: {
            ...payment.gatewayResponse,
            refund: refundResponse,
          },
        },
      });

      // Update booking status
      await this.prisma.booking.update({
        where: { id: payment.bookingId },
        data: { 
          paymentStatus: PaymentStatus.REFUNDED,
          status: BookingStatus.REFUNDED,
        },
      });

      this.logger.log(`Payment refunded: ${paymentId}`);
      return updatedPayment;
    } catch (error) {
      this.logger.error(`Refund processing failed: ${paymentId}`, error);
      throw new BadRequestException('Refund processing failed');
    }
  }

  async getPaymentsByBooking(bookingId: string) {
    return this.prisma.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPaymentsByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            select: {
              reference: true,
              type: true,
              totalAmount: true,
            },
          },
        },
      }),
      this.prisma.payment.count({ where: { userId } }),
    ]);

    return {
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPaymentStats(userId?: string) {
    const where = userId ? { userId } : {};

    const [
      totalPayments,
      successfulPayments,
      failedPayments,
      refundedPayments,
      totalAmount,
      totalRefunded,
    ] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.count({ where: { ...where, status: PaymentStatus.PAID } }),
      this.prisma.payment.count({ where: { ...where, status: PaymentStatus.FAILED } }),
      this.prisma.payment.count({ where: { ...where, status: PaymentStatus.REFUNDED } }),
      this.prisma.payment.aggregate({
        where: { ...where, status: PaymentStatus.PAID },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { ...where, status: PaymentStatus.REFUNDED },
        _sum: { refundAmount: true },
      }),
    ]);

    return {
      totalPayments,
      successfulPayments,
      failedPayments,
      refundedPayments,
      totalAmount: totalAmount._sum.amount || 0,
      totalRefunded: totalRefunded._sum.refundAmount || 0,
      successRate: totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0,
    };
  }

  // Webhook handlers
  async handleStripeWebhook(payload: any, signature: string) {
    return this.stripeService.handleWebhook(payload, signature);
  }

  async handlePaypalWebhook(payload: any) {
    return this.paypalService.handleWebhook(payload);
  }

  async handleSslcommerzWebhook(payload: any) {
    return this.sslcommerzService.handleWebhook(payload);
  }

  async handleHyperpayWebhook(payload: any) {
    return this.hyperpayService.handleWebhook(payload);
  }
}
