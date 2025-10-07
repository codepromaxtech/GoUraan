import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get('payments.stripe.secretKey'),
      {
        apiVersion: '2023-10-16',
      }
    );
  }

  async confirmPayment(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          transactionId: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
        };
      }

      // If payment requires additional action, confirm it
      if (paymentIntent.status === 'requires_confirmation' || 
          paymentIntent.status === 'requires_action') {
        const confirmedIntent = await this.stripe.paymentIntents.confirm(paymentIntent.id);
        
        if (confirmedIntent.status === 'succeeded') {
          return {
            success: true,
            transactionId: confirmedIntent.id,
            status: confirmedIntent.status,
            amount: confirmedIntent.amount / 100,
            currency: confirmedIntent.currency,
          };
        }
      }

      return {
        success: false,
        status: paymentIntent.status,
        error: `Payment status: ${paymentIntent.status}`,
      };
    } catch (error) {
      this.logger.error('Failed to confirm payment', error);
      throw new Error(`Payment confirmation failed: ${error.message}`);
    }
  }

  async processPayment(data: {
    amount: number;
    currency: string;
    paymentMethodId: string;
    metadata?: any;
  }) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency.toLowerCase(),
        payment_method: data.paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
        metadata: data.metadata,
        return_url: `${this.configService.get('app.frontendUrl')}/payment/return`,
      });

      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          transactionId: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
        };
      } else if (paymentIntent.status === 'requires_action') {
        return {
          success: false,
          requiresAction: true,
          clientSecret: paymentIntent.client_secret,
          status: paymentIntent.status,
        };
      } else {
        return {
          success: false,
          error: 'Payment failed',
          status: paymentIntent.status,
        };
      }
    } catch (error) {
      this.logger.error('Stripe payment processing failed', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async refundPayment(data: {
    transactionId: string;
    amount?: number;
    reason?: string;
  }) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: data.transactionId,
        amount: data.amount ? Math.round(data.amount * 100) : undefined,
        reason: data.reason as Stripe.RefundCreateParams.Reason,
      });

      return {
        success: true,
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount / 100,
        currency: refund.currency,
      };
    } catch (error) {
      this.logger.error('Stripe refund processing failed', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async createPaymentIntent(data: {
    amount: number;
    currency: string;
    customerId?: string;
    metadata?: any;
  }) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100),
        currency: data.currency.toLowerCase(),
        customer: data.customerId,
        metadata: data.metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      this.logger.error('Stripe payment intent creation failed', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async createCustomer(data: {
    email: string;
    name: string;
    phone?: string;
    metadata?: any;
  }) {
    try {
      const customer = await this.stripe.customers.create({
        email: data.email,
        name: data.name,
        phone: data.phone,
        metadata: data.metadata,
      });

      return {
        success: true,
        customerId: customer.id,
      };
    } catch (error) {
      this.logger.error('Stripe customer creation failed', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async handleWebhook(payload: any, signature: string) {
    try {
      const webhookSecret = this.configService.get('payments.stripe.webhookSecret');
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      this.logger.log(`Stripe webhook received: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        case 'charge.dispute.created':
          await this.handleChargeDispute(event.data.object as Stripe.Dispute);
          break;
        default:
          this.logger.log(`Unhandled Stripe webhook event: ${event.type}`);
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Stripe webhook handling failed', error);
      return { success: false, error: error.message };
    }
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    // Update payment status in database
    this.logger.log(`Payment succeeded: ${paymentIntent.id}`);
    // Implementation would update the payment record
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    // Update payment status in database
    this.logger.log(`Payment failed: ${paymentIntent.id}`);
    // Implementation would update the payment record
  }

  private async handleChargeDispute(dispute: Stripe.Dispute) {
    // Handle charge dispute
    this.logger.warn(`Charge dispute created: ${dispute.id}`);
    // Implementation would handle the dispute
  }
}
