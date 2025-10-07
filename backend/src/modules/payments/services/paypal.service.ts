import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as paypal from '@paypal/paypal-server-sdk';

type PayPalEnvironment = 'sandbox' | 'live';

interface PayPalAuthResponse {
  access_token: string;
  token_type: string;
  app_id: string;
  expires_in: number;
  nonce: string;
}

interface PayPalPaymentResponse {
  id: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED';
  links: Array<{ href: string; rel: string; method: string }>;
}

@Injectable()
export class PaypalService {
  private readonly logger = new Logger(PaypalService.name);
  private apiUrl: string;
  private clientId: string;
  private secret: string;
  private environment: PayPalEnvironment;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(private configService: ConfigService) {
    this.environment = this.configService.get<PayPalEnvironment>('payments.paypal.environment', 'sandbox');
    this.apiUrl = this.environment === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';
    this.clientId = this.configService.get<string>('payments.paypal.clientId', '');
    this.secret = this.configService.get<string>('payments.paypal.secret', '');
  }

  private getPayPalClient() {
    const environment = this.environment === 'live'
      ? new paypal.core.LiveEnvironment(this.clientId, this.secret)
      : new paypal.core.SandboxEnvironment(this.clientId, this.secret);
    return new paypal.core.PayPalHttpClient(environment);
  }

  async createOrder(amount: number, currency: string, description: string) {
    try {
      const paypalClient = this.getPayPalClient();
      const request = new paypal.orders.OrdersCreateRequest();
      
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: currency,
                value: amount.toFixed(2)
              }
            }
          },
          description: description,
          items: [{
            name: description,
            description: description,
            quantity: '1',
            unit_amount: {
              currency_code: currency,
              value: amount.toFixed(2)
            }
          }]
        }],
        application_context: {
          brand_name: this.configService.get('app.name', 'GoUraan'),
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${this.configService.get('app.frontendUrl')}/payment/success`,
          cancel_url: `${this.configService.get('app.frontendUrl')}/payment/cancel`,
        }
      });

      const response = await paypalClient.execute(request);
      return {
        id: response.result.id,
        status: response.result.status,
        links: response.result.links,
      };
    } catch (error) {
      this.logger.error('Failed to create PayPal order', error);
      throw new BadRequestException('Failed to create PayPal order');
    }
  }

  async capturePayment(orderId: string) {
    try {
      const paypalClient = this.getPayPalClient();
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});
      
      const response = await paypalClient.execute(request);
      const capture = response.result.purchase_units[0].payments.captures[0];

      return {
        success: capture.status === 'COMPLETED',
        transactionId: capture.id,
        status: capture.status,
        amount: capture.amount.value,
        currency: capture.amount.currency_code,
      };
    } catch (error) {
      this.logger.error('Failed to capture PayPal payment', error);
      throw new BadRequestException('Failed to capture payment');
    }
  }

  async refundPayment(captureId: string, amount: number, currency: string, note: string = '') {
    try {
      const paypalClient = this.getPayPalClient();
      const request = new paypal.payments.CapturesRefundRequest(captureId);
      
      request.requestBody({
        amount: {
          value: amount.toFixed(2),
          currency_code: currency,
        },
        note_to_payer: note || 'Refund',
      });

      const response = await paypalClient.execute(request);
      const refund = response.result;

      return {
        success: refund.status === 'COMPLETED',
        refundId: refund.id,
        status: refund.status,
      };
    } catch (error) {
      this.logger.error('Failed to process PayPal refund', error);
      throw new BadRequestException('Failed to process refund');
    }
  }

  async verifyWebhook(headers: any, body: any): Promise<boolean> {
    try {
      const paypalClient = this.getPayPalClient();
      const webhookId = this.configService.get<string>('payments.paypal.webhookId');
      
      const request = new paypal.notifications.WebhooksVerifySignatureRequest();
      request.requestBody({
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: body,
      });

      const response = await paypalClient.execute(request);
      return response.result.verification_status === 'SUCCESS';
    } catch (error) {
      this.logger.error('Failed to verify PayPal webhook', error);
      return false;
    }
  }
}
