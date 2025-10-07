import { Body, Controller, Get, Post, Query, Headers, BadRequestException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { PaypalService } from './services/paypal.service';
import { StripeService } from './services/stripe.service';
import { SslcommerzService } from './services/sslcommerz.service';
import { HyperpayService } from './services/hyperpay.service';

@Controller('payments')
@ApiTags('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paypalService: PaypalService,
    private readonly stripeService: StripeService,
    private readonly sslcommerzService: SslcommerzService,
    private readonly hyperpayService: HyperpayService,
  ) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Create a payment order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createOrder(
    @Body() body: {
      amount: number;
      currency: string;
      description: string;
      paymentMethod: 'paypal' | 'stripe' | 'sslcommerz' | 'hyperpay';
      metadata?: any;
    },
  ) {
    try {
      switch (body.paymentMethod) {
        case 'paypal':
          return await this.paypalService.createOrder(
            body.amount,
            body.currency,
            body.description,
          );
        case 'stripe':
          // Stripe handles payment intent creation differently
          throw new BadRequestException('Use /payments/stripe/create-payment-intent for Stripe');
        case 'sslcommerz':
          return await this.sslcommerzService.createPayment({
            amount: body.amount,
            currency: body.currency,
            desc: body.description,
            metadata: body.metadata,
          });
        case 'hyperpay':
          return await this.hyperpayService.initiatePayment({
            amount: body.amount,
            currency: body.currency,
            description: body.description,
            metadata: body.metadata,
          });
        default:
          throw new BadRequestException('Unsupported payment method');
      }
    } catch (error) {
      this.logger.error('Failed to create order', error);
      throw new BadRequestException(error.message || 'Failed to create order');
    }
  }

  @Post('capture-payment')
  @ApiOperation({ summary: 'Capture a payment' })
  @ApiResponse({ status: 200, description: 'Payment captured successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async capturePayment(
    @Body() body: {
      paymentMethod: 'paypal' | 'stripe' | 'sslcommerz' | 'hyperpay';
      orderId: string;
      paymentId?: string;
      payerId?: string;
    },
  ) {
    try {
      switch (body.paymentMethod) {
        case 'paypal':
          return await this.paypalService.capturePayment(body.orderId);
        case 'stripe':
          return await this.stripeService.confirmPayment(body.orderId);
        case 'sslcommerz':
          return await this.sslcommerzService.verifyPayment(body.orderId);
        case 'hyperpay':
          return await this.hyperpayService.verifyPayment(body.orderId);
        default:
          throw new BadRequestException('Unsupported payment method');
      }
    } catch (error) {
      this.logger.error('Failed to capture payment', error);
      throw new BadRequestException(error.message || 'Failed to capture payment');
    }
  }

  @Post('refund')
  @ApiOperation({ summary: 'Process a refund' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async processRefund(
    @Body() body: {
      paymentMethod: 'paypal' | 'stripe' | 'sslcommerz' | 'hyperpay';
      paymentId: string;
      amount: number;
      currency: string;
      reason?: string;
    },
  ) {
    try {
      switch (body.paymentMethod) {
        case 'paypal':
          return await this.paypalService.refundPayment(
            body.paymentId,
            body.amount,
            body.currency,
            body.reason,
          );
        case 'stripe':
          return await this.stripeService.refundPayment(
            body.paymentId,
            body.amount,
            body.currency,
          );
        case 'sslcommerz':
          return await this.sslcommerzService.refundPayment({
            paymentId: body.paymentId,
            amount: body.amount,
            reason: body.reason,
          });
        case 'hyperpay':
          return await this.hyperpayService.refundPayment({
            paymentId: body.paymentId,
            amount: body.amount,
            reason: body.reason,
          });
        default:
          throw new BadRequestException('Unsupported payment method');
      }
    } catch (error) {
      this.logger.error('Failed to process refund', error);
      throw new BadRequestException(error.message || 'Failed to process refund');
    }
  }

  @Post('webhook/paypal')
  @ApiOperation({ summary: 'Handle PayPal webhook events' })
  @ApiHeader({ name: 'paypal-transmission-id', required: true })
  @ApiHeader({ name: 'paypal-transmission-time', required: true })
  @ApiHeader({ name: 'paypal-cert-url', required: true })
  @ApiHeader({ name: 'paypal-transmission-sig', required: true })
  @ApiHeader({ name: 'paypal-auth-algo', required: true })
  async handlePayPalWebhook(
    @Headers() headers: any,
    @Body() body: any,
  ) {
    const isValid = await this.paypalService.verifyWebhook(headers, body);
    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Handle different webhook events
    const eventType = body.event_type;
    const resource = body.resource;

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // Handle successful payment
        this.logger.log(`Payment captured: ${resource.id}`);
        break;
      case 'PAYMENT.CAPTURE.REFUNDED':
        // Handle refund
        this.logger.log(`Payment refunded: ${resource.id}`);
        break;
      // Add more event types as needed
    }

    return { received: true };
  }

  @Get('payment-methods')
  @ApiOperation({ summary: 'Get available payment methods' })
  @ApiResponse({ status: 200, description: 'List of available payment methods' })
  getPaymentMethods() {
    return {
      methods: [
        {
          id: 'paypal',
          name: 'PayPal',
          currencies: ['USD', 'EUR', 'GBP', 'AUD', 'CAD'],
          supportsRefunds: true,
        },
        {
          id: 'stripe',
          name: 'Credit/Debit Card (Stripe)',
          currencies: ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'MYR', 'AED'],
          supportsRefunds: true,
        },
        {
          id: 'sslcommerz',
          name: 'Local Payment Methods',
          currencies: ['BDT'],
          supportsRefunds: true,
        },
        {
          id: 'hyperpay',
          name: 'Mada & Credit Cards (HyperPay)',
          currencies: ['SAR', 'AED', 'USD', 'EUR', 'GBP'],
          supportsRefunds: true,
        },
      ],
    };
  }
}
