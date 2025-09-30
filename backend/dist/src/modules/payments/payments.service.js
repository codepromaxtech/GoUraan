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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const stripe_service_1 = require("./services/stripe.service");
const paypal_service_1 = require("./services/paypal.service");
const sslcommerz_service_1 = require("./services/sslcommerz.service");
const hyperpay_service_1 = require("./services/hyperpay.service");
const client_1 = require("@prisma/client");
const bookings_service_1 = require("../bookings/bookings.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(prisma, bookingsService, stripeService, paypalService, sslcommerzService, hyperpayService) {
        this.prisma = prisma;
        this.bookingsService = bookingsService;
        this.stripeService = stripeService;
        this.paypalService = paypalService;
        this.sslcommerzService = sslcommerzService;
        this.hyperpayService = hyperpayService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
    }
    async createPayment(userId, createPaymentDto) {
        const { bookingId, gateway, method, amount, currency } = createPaymentDto;
        const booking = await this.prisma.booking.findFirst({
            where: {
                id: bookingId,
                userId,
                status: client_1.BookingStatus.PENDING,
            },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found or not eligible for payment');
        }
        const payment = await this.prisma.payment.create({
            data: {
                bookingId,
                userId,
                amount,
                currency: currency,
                method: method,
                gateway: gateway,
                status: client_1.PaymentStatus.PENDING,
            },
        });
        this.logger.log(`Payment created: ${payment.id} for booking: ${bookingId}`);
        return payment;
    }
    async processPayment(paymentId, processPaymentDto) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: { booking: true },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (payment.status !== client_1.PaymentStatus.PENDING) {
            throw new common_1.BadRequestException('Payment is not in pending status');
        }
        try {
            let gatewayResponse;
            switch (payment.gateway) {
                case client_1.PaymentGateway.STRIPE:
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
                case client_1.PaymentGateway.PAYPAL:
                    gatewayResponse = await this.paypalService.processPayment({
                        amount: payment.amount,
                        currency: payment.currency,
                        orderId: processPaymentDto.orderId,
                    });
                    break;
                case client_1.PaymentGateway.SSLCOMMERZ:
                    gatewayResponse = await this.sslcommerzService.processPayment({
                        amount: payment.amount,
                        currency: payment.currency,
                        transactionId: processPaymentDto.transactionId,
                    });
                    break;
                case client_1.PaymentGateway.HYPERPAY:
                    gatewayResponse = await this.hyperpayService.processPayment({
                        amount: payment.amount,
                        currency: payment.currency,
                        checkoutId: processPaymentDto.checkoutId,
                    });
                    break;
                default:
                    throw new common_1.BadRequestException('Unsupported payment gateway');
            }
            const updatedPayment = await this.prisma.payment.update({
                where: { id: paymentId },
                data: {
                    status: gatewayResponse.success ? client_1.PaymentStatus.PAID : client_1.PaymentStatus.FAILED,
                    gatewayTransactionId: gatewayResponse.transactionId,
                    gatewayResponse: gatewayResponse,
                    processedAt: new Date(),
                },
            });
            if (gatewayResponse.success) {
                await this.prisma.booking.update({
                    where: { id: payment.bookingId },
                    data: { paymentStatus: client_1.PaymentStatus.PAID },
                });
                await this.bookingsService.confirmBooking(payment.bookingId);
                this.logger.log(`Payment successful: ${paymentId}`);
            }
            else {
                this.logger.warn(`Payment failed: ${paymentId} - ${gatewayResponse.error}`);
            }
            return updatedPayment;
        }
        catch (error) {
            this.logger.error(`Payment processing failed: ${paymentId}`, error);
            await this.prisma.payment.update({
                where: { id: paymentId },
                data: {
                    status: client_1.PaymentStatus.FAILED,
                    gatewayResponse: { error: error.message },
                    processedAt: new Date(),
                },
            });
            throw new common_1.BadRequestException('Payment processing failed');
        }
    }
    async refundPayment(paymentId, refundPaymentDto) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (payment.status !== client_1.PaymentStatus.PAID) {
            throw new common_1.BadRequestException('Only paid payments can be refunded');
        }
        try {
            let refundResponse;
            switch (payment.gateway) {
                case client_1.PaymentGateway.STRIPE:
                    refundResponse = await this.stripeService.refundPayment({
                        transactionId: payment.gatewayTransactionId,
                        amount: refundPaymentDto.amount || payment.amount,
                        reason: refundPaymentDto.reason,
                    });
                    break;
                case client_1.PaymentGateway.PAYPAL:
                    refundResponse = await this.paypalService.refundPayment({
                        transactionId: payment.gatewayTransactionId,
                        amount: refundPaymentDto.amount || payment.amount,
                        reason: refundPaymentDto.reason,
                    });
                    break;
                case client_1.PaymentGateway.SSLCOMMERZ:
                    refundResponse = await this.sslcommerzService.refundPayment({
                        transactionId: payment.gatewayTransactionId,
                        amount: refundPaymentDto.amount || payment.amount,
                        reason: refundPaymentDto.reason,
                    });
                    break;
                case client_1.PaymentGateway.HYPERPAY:
                    refundResponse = await this.hyperpayService.refundPayment({
                        transactionId: payment.gatewayTransactionId,
                        amount: refundPaymentDto.amount || payment.amount,
                        reason: refundPaymentDto.reason,
                    });
                    break;
                default:
                    throw new common_1.BadRequestException('Unsupported payment gateway for refund');
            }
            const updatedPayment = await this.prisma.payment.update({
                where: { id: paymentId },
                data: {
                    status: client_1.PaymentStatus.REFUNDED,
                    refundAmount: refundPaymentDto.amount || payment.amount,
                    refundedAt: new Date(),
                    refundReason: refundPaymentDto.reason,
                    gatewayResponse: {
                        ...payment.gatewayResponse,
                        refund: refundResponse,
                    },
                },
            });
            await this.prisma.booking.update({
                where: { id: payment.bookingId },
                data: {
                    paymentStatus: client_1.PaymentStatus.REFUNDED,
                    status: client_1.BookingStatus.REFUNDED,
                },
            });
            this.logger.log(`Payment refunded: ${paymentId}`);
            return updatedPayment;
        }
        catch (error) {
            this.logger.error(`Refund processing failed: ${paymentId}`, error);
            throw new common_1.BadRequestException('Refund processing failed');
        }
    }
    async getPaymentsByBooking(bookingId) {
        return this.prisma.payment.findMany({
            where: { bookingId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getPaymentsByUser(userId, page = 1, limit = 10) {
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
    async getPaymentStats(userId) {
        const where = userId ? { userId } : {};
        const [totalPayments, successfulPayments, failedPayments, refundedPayments, totalAmount, totalRefunded,] = await Promise.all([
            this.prisma.payment.count({ where }),
            this.prisma.payment.count({ where: { ...where, status: client_1.PaymentStatus.PAID } }),
            this.prisma.payment.count({ where: { ...where, status: client_1.PaymentStatus.FAILED } }),
            this.prisma.payment.count({ where: { ...where, status: client_1.PaymentStatus.REFUNDED } }),
            this.prisma.payment.aggregate({
                where: { ...where, status: client_1.PaymentStatus.PAID },
                _sum: { amount: true },
            }),
            this.prisma.payment.aggregate({
                where: { ...where, status: client_1.PaymentStatus.REFUNDED },
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
    async handleStripeWebhook(payload, signature) {
        return this.stripeService.handleWebhook(payload, signature);
    }
    async handlePaypalWebhook(payload) {
        return this.paypalService.handleWebhook(payload);
    }
    async handleSslcommerzWebhook(payload) {
        return this.sslcommerzService.handleWebhook(payload);
    }
    async handleHyperpayWebhook(payload) {
        return this.hyperpayService.handleWebhook(payload);
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bookings_service_1.BookingsService,
        stripe_service_1.StripeService,
        paypal_service_1.PaypalService,
        sslcommerz_service_1.SslcommerzService,
        hyperpay_service_1.HyperpayService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map