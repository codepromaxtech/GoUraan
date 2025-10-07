import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class HyperpayService {
  private readonly logger = new Logger(HyperpayService.name);
  private readonly baseUrl: string;
  private readonly entityId: string;
  private readonly accessToken: string;
  private readonly testMode: boolean;

  constructor(private configService: ConfigService) {
    this.testMode = this.configService.get('payments.hyperpay.testMode');
    this.baseUrl = this.testMode
      ? 'https://test.oppwa.com/v1'
      : 'https://eu-prod.oppwa.com/v1';
    this.entityId = this.configService.get('payments.hyperpay.entityId');
    this.accessToken = this.configService.get('payments.hyperpay.accessToken');
  }

  async initiatePayment(data: {
    amount: number;
    currency: string;
    description: string;
    metadata?: any;
  }) {
    try {
      const paymentType = 'DB';
      const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      const response = await axios.post(
        `${this.baseUrl}/checkouts`,
        new URLSearchParams({
          'entityId': this.entityId,
          'amount': data.amount.toFixed(2),
          'currency': data.currency,
          'paymentType': paymentType,
          'merchantTransactionId': orderId,
          'customer.email': data.metadata?.customerEmail || 'customer@example.com',
          'billing.street1': data.metadata?.billingAddress?.street || 'N/A',
          'billing.city': data.metadata?.billingAddress?.city || 'N/A',
          'billing.country': data.metadata?.billingAddress?.country || 'SA',
          'merchantMemo': data.description,
          'createRegistration': 'true',
        } as Record<string, string>),
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.result.code !== '000.200.100') {
        throw new Error(response.data.result.description || 'Failed to initiate payment');
      }

      return {
        success: true,
        checkoutId: response.data.id,
        orderId: orderId,
        redirectUrl: `${this.baseUrl}/payment/${response.data.id}`,
      };
    } catch (error) {
      this.logger.error('Failed to initiate payment', error);
      throw new Error(`Payment initiation failed: ${error.message}`);
    }
  }

  async verifyPayment(checkoutId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/checkouts/${checkoutId}/payment`,
        {
          params: {
            entityId: this.entityId,
          },
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      const result = response.data;
      const isSuccessful = result.result?.code?.startsWith('000.000.') || 
                          result.result?.code?.startsWith('000.100.1');

      if (!isSuccessful) {
        throw new Error(result.result?.description || 'Payment verification failed');
      }

      return {
        success: true,
        status: result.paymentResult?.processingReturn?.processingStatus || 'PENDING',
        transactionId: result.id,
        amount: parseFloat(result.amount),
        currency: result.currency,
        card: {
          last4: result.paymentBrand === 'VISA' ? result.card?.last4Digits : undefined,
          expiry: result.card?.expiryMonth && result.card?.expiryYear 
            ? `${result.card.expiryMonth}/${result.card.expiryYear}` 
            : undefined,
          holder: result.card?.holder,
          type: result.paymentBrand,
        },
        rawResponse: result,
      };
    } catch (error) {
      this.logger.error('Failed to verify payment', error);
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  async processRefund(transactionId: string, amount: number, currency: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/payments/${transactionId}`,
        new URLSearchParams({
          'entityId': this.entityId,
          'amount': amount.toFixed(2),
          'currency': currency,
          'paymentType': 'RF',
        } as Record<string, string>),
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const result = response.data;
      const isSuccessful = result.result?.code?.startsWith('000.100.1');

      if (!isSuccessful) {
        throw new Error(result.result?.description || 'Refund failed');
      }

      return {
        success: true,
        refundId: result.id,
        amount: parseFloat(result.amount),
        currency: result.currency,
        status: result.result?.description || 'SUCCESS',
      };
    } catch (error) {
      this.logger.error('Failed to process refund', error);
      throw new Error(`Refund processing failed: ${error.message}`);
    }
  }

  async handleWebhook(payload: any): Promise<any> {
    try {
      // Verify the webhook signature if needed
      // const isValid = this.verifyWebhookSignature(payload);
      // if (!isValid) {
      //   throw new Error('Invalid webhook signature');
      // }

      const { id, paymentType, result } = payload;
      
      return {
        processed: true,
        success: result.code.startsWith('000.000.') || result.code.startsWith('000.100.1'),
        transactionId: id,
        paymentType,
        resultCode: result.code,
        resultDescription: result.description,
      };
    } catch (error) {
      this.logger.error('Error processing webhook', error);
      throw new Error(`Webhook processing failed: ${error.message}`);
    }
  }

  // Helper method to verify webhook signature (if needed)
  private verifyWebhookSignature(payload: any): boolean {
    // Implement signature verification logic if required by Hyperpay
    // This is a placeholder implementation
    return true;
  }
}
