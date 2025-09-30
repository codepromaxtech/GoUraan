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
var SslcommerzService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SslcommerzService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let SslcommerzService = SslcommerzService_1 = class SslcommerzService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SslcommerzService_1.name);
        const isLive = this.configService.get('payments.sslcommerz.isLive');
        this.baseUrl = isLive
            ? 'https://securepay.sslcommerz.com'
            : 'https://sandbox.sslcommerz.com';
        this.storeId = this.configService.get('payments.sslcommerz.storeId');
        this.storePassword = this.configService.get('payments.sslcommerz.storePassword');
    }
    async initiatePayment(data) {
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
            const response = await axios_1.default.post(`${this.baseUrl}/gwprocess/v4/api.php`, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            if (response.data.status === 'SUCCESS') {
                return {
                    success: true,
                    sessionKey: response.data.sessionkey,
                    gatewayUrl: response.data.GatewayPageURL,
                    transactionId: data.orderId,
                };
            }
            else {
                return {
                    success: false,
                    error: response.data.failedreason || 'Payment initiation failed',
                };
            }
        }
        catch (error) {
            this.logger.error('SSLCommerz payment initiation failed', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async processPayment(data) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/validator/api/validationserverAPI.php`, {
                params: {
                    val_id: data.transactionId,
                    store_id: this.storeId,
                    store_passwd: this.storePassword,
                    v: 1,
                    format: 'json',
                },
            });
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
            }
            else {
                return {
                    success: false,
                    error: 'Transaction validation failed',
                    status: response.data.status,
                };
            }
        }
        catch (error) {
            this.logger.error('SSLCommerz payment processing failed', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async refundPayment(data) {
        try {
            const payload = {
                store_id: this.storeId,
                store_passwd: this.storePassword,
                bank_tran_id: data.transactionId,
                refund_amount: data.amount,
                refund_remarks: data.reason || 'Customer requested refund',
                refe_id: `REF_${Date.now()}`,
            };
            const response = await axios_1.default.post(`${this.baseUrl}/validator/api/merchantTransIDvalidationAPI.php`, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            if (response.data.status === 'SUCCESS') {
                return {
                    success: true,
                    refundId: response.data.refund_ref_id,
                    status: response.data.status,
                    amount: data.amount,
                };
            }
            else {
                return {
                    success: false,
                    error: response.data.errorReason || 'Refund processing failed',
                };
            }
        }
        catch (error) {
            this.logger.error('SSLCommerz refund processing failed', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async handleWebhook(payload) {
        try {
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
        }
        catch (error) {
            this.logger.error('SSLCommerz webhook handling failed', error);
            return { success: false, error: error.message };
        }
    }
    verifyWebhookSignature(payload) {
        return true;
    }
    async handlePaymentSuccess(payload) {
        this.logger.log(`Payment successful: ${payload.tran_id}`);
    }
    async handlePaymentFailure(payload) {
        this.logger.log(`Payment failed: ${payload.tran_id}`);
    }
    async handlePaymentCancellation(payload) {
        this.logger.log(`Payment cancelled: ${payload.tran_id}`);
    }
};
exports.SslcommerzService = SslcommerzService;
exports.SslcommerzService = SslcommerzService = SslcommerzService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SslcommerzService);
//# sourceMappingURL=sslcommerz.service.js.map