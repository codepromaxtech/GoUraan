"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
let StripeService = StripeService_1 = class StripeService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(StripeService_1.name);
        this.stripe = new stripe_1.default(this.configService.get('payments.stripe.secretKey'), {
            apiVersion: '2023-10-16',
        });
    }
    async processPayment(data) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(data.amount * 100),
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
            }
            else if (paymentIntent.status === 'requires_action') {
                return {
                    success: false,
                    requiresAction: true,
                    clientSecret: paymentIntent.client_secret,
                    status: paymentIntent.status,
                };
            }
            else {
                return {
                    success: false,
                    error: 'Payment failed',
                    status: paymentIntent.status,
                };
            }
        }
        catch (error) {
            this.logger.error('Stripe payment processing failed', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async refundPayment(data) {
        try {
            const refund = await this.stripe.refunds.create({
                payment_intent: data.transactionId,
                amount: data.amount ? Math.round(data.amount * 100) : undefined,
                reason: data.reason,
            });
            return {
                success: true,
                refundId: refund.id,
                status: refund.status,
                amount: refund.amount / 100,
                currency: refund.currency,
            };
        }
        catch (error) {
            this.logger.error('Stripe refund processing failed', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async createPaymentIntent(data) {
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
        }
        catch (error) {
            this.logger.error('Stripe payment intent creation failed', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async createCustomer(data) {
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
        }
        catch (error) {
            this.logger.error('Stripe customer creation failed', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async handleWebhook(payload, signature) {
        try {
            const webhookSecret = this.configService.get('payments.stripe.webhookSecret');
            const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
            this.logger.log(`Stripe webhook received: ${event.type}`);
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentSucceeded(event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentFailed(event.data.object);
                    break;
                case 'charge.dispute.created':
                    await this.handleChargeDispute(event.data.object);
                    break;
                default:
                    this.logger.log(`Unhandled Stripe webhook event: ${event.type}`);
            }
            return { success: true };
        }
        catch (error) {
            this.logger.error('Stripe webhook handling failed', error);
            return { success: false, error: error.message };
        }
    }
    async handlePaymentSucceeded(paymentIntent) {
        this.logger.log(`Payment succeeded: ${paymentIntent.id}`);
    }
    async handlePaymentFailed(paymentIntent) {
        this.logger.log(`Payment failed: ${paymentIntent.id}`);
    }
    async handleChargeDispute(dispute) {
        this.logger.warn(`Charge dispute created: ${dispute.id}`);
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map