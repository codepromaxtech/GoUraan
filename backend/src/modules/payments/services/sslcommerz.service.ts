import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class SslcommerzService {
  private readonly logger = new Logger(SslcommerzService.name);
  private readonly baseUrl: string;
  private readonly storeId: string;
  private readonly storePassword: string;

  constructor(private configService: ConfigService) {
    const isLive = this.configService.get('payments.sslcommerz.isLive');
    this.baseUrl = isLive 
      ? 'https://securepay.sslcommerz.com'
      : 'https://sandbox.sslcommerz.com';
    this.storeId = this.configService.get('payments.sslcommerz.storeId');
    this.storePassword = this.configService.get('payments.sslcommerz.storePassword');
  }

  async createPayment(data: {
    amount: number;
    currency: string;
    desc: string;
    metadata?: any;
  }) {
    try {
      const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const successUrl = `${this.configService.get('app.frontendUrl')}/payment/success`;
      const failUrl = `${this.configService.get('app.frontendUrl')}/payment/fail`;
      const cancelUrl = `${this.configService.get('app.frontendUrl')}/payment/cancel`;
      const ipnUrl = `${this.configService.get('app.apiUrl')}/payments/sslcommerz/ipn`;

      const payload = {
        store_id: this.storeId,
        store_passwd: this.storePassword,
        total_amount: data.amount,
        currency: data.currency,
        tran_id: orderId,
        product_category: 'service',
        success_url: successUrl,
        fail_url: failUrl,
        cancel_url: cancelUrl,
        ipn_url: ipnUrl,
        cus_name: 'Customer Name', // Should be replaced with actual customer data
        cus_email: 'customer@example.com', // Should be replaced with actual customer data
        cus_phone: '1234567890', // Should be replaced with actual customer data
        cus_add1: 'Address', // Should be replaced with actual customer data
        cus_city: 'City', // Should be replaced with actual customer data
        cus_country: 'Country', // Should be replaced with actual customer data
        shipping_method: 'NO',
        product_name: data.desc,
        product_profile: 'general',
      };

      const response = await axios.post(
        `${this.baseUrl}/gwprocess/v4/api.php`,
        new URLSearchParams(payload as any).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.status !== 'SUCCESS') {
        throw new Error(response.data.failedreason || 'Failed to create payment');
      }

      return {
        success: true,
        paymentUrl: response.data.GatewayPageURL,
        orderId: orderId,
        ...response.data,
      };
    } catch (error) {
      this.logger.error('Failed to create payment', error);
      throw new Error(`Payment creation failed: ${error.message}`);
    }
  }

  async verifyPayment(orderId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/validator/api/merchantTransIDvalidationAPI.php`, {
          params: {
            val_id: orderId,
            store_id: this.storeId,
            store_passwd: this.storePassword,
            format: 'json',
            v: '1',
          },
        }
      );

      if (response.data.status !== 'VALID' && response.data.status !== 'VALIDATED') {
        throw new Error('Payment verification failed');
      }

      return {
        success: true,
        status: response.data.status,
        transactionId: response.data.tran_id,
        amount: parseFloat(response.data.amount),
        currency: response.data.currency,
        cardType: response.data.card_type,
        cardIssuer: response.data.card_issuer,
        bankTransactionId: response.data.bank_tran_id,
        cardNo: response.data.card_no,
        cardBrand: response.data.card_brand,
        cardIssuerCountry: response.data.card_issuer_country,
        cardIssuerCountryCode: response.data.card_issuer_country_code,
      };
    } catch (error) {
      this.logger.error('Failed to verify payment', error);
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  async initiatePayment(data: {
    amount: number;
    currency: string;
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    productName: string;
    productCategory: string;
    successUrl: string;
    failUrl: string;
    cancelUrl: string;
    ipnUrl: string;
  }) {
    try {
      const payload = {
        store_id: this.storeId,
        store_passwd: this.storePassword,
        total_amount: data.amount,
        currency: data.currency,
        tran_id: data.orderId,
        success_url: data.successUrl,
        fail_url: data.failUrl,
        cancel_url: data.cancelUrl,
        ipn_url: data.ipnUrl,
        product_name: data.productName,
        product_category: data.productCategory,
        product_profile: 'general',
        cus_name: data.customerName,
        cus_email: data.customerEmail,
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: data.customerPhone || '01711111111',
        cus_fax: '01711111111',
        ship_name: data.customerName,
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: '1000',
        ship_country: 'Bangladesh',
        shipping_method: 'NO',
        product_amount: data.amount,
        vat: 0,
        discount_amount: 0,
        convenience_fee: 0,
      };

      const response = await axios.post(
        `${this.baseUrl}/gwprocess/v4/api.php`,
        payload,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.status === 'SUCCESS') {
        return {
          success: true,
          sessionKey: response.data.sessionkey,
          gatewayUrl: response.data.GatewayPageURL,
          transactionId: data.orderId,
        };
      } else {
        return {
          success: false,
          error: response.data.failedreason || 'Payment initiation failed',
        };
      }
    } catch (error) {
      this.logger.error('SSLCommerz payment initiation failed', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async processPayment(data: {
    amount: number;
    currency: string;
    transactionId: string;
  }) {
    try {
      // Validate transaction with SSLCommerz
      const response = await axios.get(
        `${this.baseUrl}/validator/api/validationserverAPI.php`,
        {
          params: {
            val_id: data.transactionId,
            store_id: this.storeId,
            store_passwd: this.storePassword,
            v: 1,
            format: 'json',
          },
        }
      );

      if (response.data.status === 'VALID') {
        return {
          success: true,
          transactionId: response.data.tran_id,
          status: response.data.status,
          amount: parseFloat(response.data.amount),
          currency: response.data.currency,
          bankTransactionId: response.data.bank_tran_id,
          cardType: response.data.card_type,
          cardNo: response.data.card_no,
        };
      } else {
        return {
          success: false,
          error: 'Transaction validation failed',
          status: response.data.status,
        };
      }
    } catch (error) {
      this.logger.error('SSLCommerz payment processing failed', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async refundPayment(data: {
    transactionId: string;
    amount: number;
    reason?: string;
  }) {
    try {
      const payload = {
        store_id: this.storeId,
        store_passwd: this.storePassword,
        bank_tran_id: data.transactionId,
        refund_amount: data.amount,
        refund_remarks: data.reason || 'Customer requested refund',
        refe_id: `REF_${Date.now()}`,
      };

      const response = await axios.post(
        `${this.baseUrl}/validator/api/merchantTransIDvalidationAPI.php`,
        payload,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.status === 'SUCCESS') {
        return {
          success: true,
          refundId: response.data.refund_ref_id,
          status: response.data.status,
          amount: data.amount,
        };
      } else {
        return {
          success: false,
          error: response.data.errorReason || 'Refund processing failed',
        };
      }
    } catch (error) {
      this.logger.error('SSLCommerz refund processing failed', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async handleWebhook(payload: any) {
    try {
      // Verify the webhook signature
      const isValid = this.verifyWebhookSignature(payload);
      
      if (!isValid) {
        this.logger.warn('Invalid SSLCommerz webhook signature');
        return { success: false, error: 'Invalid signature' };
      }

      this.logger.log(`SSLCommerz webhook received: ${payload.status}`);

      switch (payload.status) {
        case 'VALID':
          await this.handlePaymentSuccess(payload);
          break;
        case 'FAILED':
          await this.handlePaymentFailure(payload);
          break;
        case 'CANCELLED':
          await this.handlePaymentCancellation(payload);
          break;
        default:
          this.logger.log(`Unhandled SSLCommerz webhook status: ${payload.status}`);
      }

      return { success: true };
    } catch (error) {
      this.logger.error('SSLCommerz webhook handling failed', error);
      return { success: false, error: error.message };
    }
  }

  private verifyWebhookSignature(payload: any): boolean {
    // Implement signature verification logic
    // This is a simplified version - implement proper signature verification
    return true;
  }

  private async handlePaymentSuccess(payload: any) {
    this.logger.log(`Payment successful: ${payload.tran_id}`);
    // Implementation would update the payment record
  }

  private async handlePaymentFailure(payload: any) {
    this.logger.log(`Payment failed: ${payload.tran_id}`);
    // Implementation would update the payment record
  }

  private async handlePaymentCancellation(payload: any) {
    this.logger.log(`Payment cancelled: ${payload.tran_id}`);
    // Implementation would update the payment record
  }
}
