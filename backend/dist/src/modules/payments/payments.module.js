"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const payments_controller_1 = require("./payments.controller");
const payments_resolver_1 = require("./payments.resolver");
const stripe_service_1 = require("./services/stripe.service");
const paypal_service_1 = require("./services/paypal.service");
const sslcommerz_service_1 = require("./services/sslcommerz.service");
const hyperpay_service_1 = require("./services/hyperpay.service");
const bookings_module_1 = require("../bookings/bookings.module");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [bookings_module_1.BookingsModule],
        providers: [
            payments_service_1.PaymentsService,
            payments_resolver_1.PaymentsResolver,
            stripe_service_1.StripeService,
            paypal_service_1.PaypalService,
            sslcommerz_service_1.SslcommerzService,
            hyperpay_service_1.HyperpayService,
        ],
        controllers: [payments_controller_1.PaymentsController],
        exports: [payments_service_1.PaymentsService],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map