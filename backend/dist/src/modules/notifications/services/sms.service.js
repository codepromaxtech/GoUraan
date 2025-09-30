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
var SmsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let SmsService = SmsService_1 = class SmsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SmsService_1.name);
        this.provider = this.configService.get('sms.provider') || 'twilio';
        this.twilioConfig = this.configService.get('sms.twilio');
        this.sslWirelessConfig = this.configService.get('sms.sslwireless');
    }
    async sendSms(data) {
        try {
            switch (this.provider) {
                case 'twilio':
                    return await this.sendViaTwilio(data);
                case 'sslwireless':
                    return await this.sendViaSSLWireless(data);
                default:
                    throw new Error(`Unsupported SMS provider: ${this.provider}`);
            }
        }
        catch (error) {
            this.logger.error('Failed to send SMS', error);
            throw error;
        }
    }
    async sendViaTwilio(data) {
        const accountSid = this.twilioConfig.accountSid;
        const authToken = this.twilioConfig.authToken;
        const fromNumber = this.twilioConfig.fromNumber;
        const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
        const response = await axios_1.default.post(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, new URLSearchParams({
            From: fromNumber,
            To: data.to,
            Body: data.message,
        }), {
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return {
            success: true,
            messageId: response.data.sid,
            status: response.data.status,
            provider: 'twilio',
        };
    }
    async sendViaSSLWireless(data) {
        const user = this.sslWirelessConfig.user;
        const pass = this.sslWirelessConfig.password;
        const sid = this.sslWirelessConfig.sid;
        const response = await axios_1.default.post('https://smsplus.sslwireless.com/api/v3/send-sms', {
            api_token: this.sslWirelessConfig.apiToken,
            sid: sid,
            msisdn: data.to.replace('+', ''),
            sms: data.message,
            csms_id: `GOURAAN_${Date.now()}`,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        return {
            success: response.data.status === 'SUCCESS',
            messageId: response.data.smsinfo?.csms_id,
            status: response.data.status,
            provider: 'sslwireless',
        };
    }
    async sendBookingConfirmationSms(data) {
        const message = `Hi ${data.userName}! Your ${data.bookingType} booking is confirmed. Reference: ${data.bookingReference}. Amount: ${data.currency} ${data.amount}. Thank you for choosing GoUraan!`;
        return await this.sendSms({
            to: data.to,
            message,
        });
    }
    async sendPaymentSuccessSms(data) {
        const message = `Payment successful! ${data.currency} ${data.amount} received for booking ${data.bookingReference}. Your booking is now confirmed. - GoUraan`;
        return await this.sendSms({
            to: data.to,
            message,
        });
    }
    async sendFlightReminderSms(data) {
        const message = `Flight Reminder: ${data.flightNumber} departing ${data.departureTime} from ${data.departureAirport}. Please arrive 3 hours early for international flights. Safe travels! - GoUraan`;
        return await this.sendSms({
            to: data.to,
            message,
        });
    }
    async sendOtpSms(data) {
        const purposeText = {
            verification: 'verify your account',
            login: 'login to your account',
            password_reset: 'reset your password',
        };
        const message = `Your GoUraan OTP is: ${data.otp}. Use this code to ${purposeText[data.purpose]}. Valid for 10 minutes. Do not share this code.`;
        return await this.sendSms({
            to: data.to,
            message,
        });
    }
    async sendDocumentReminderSms(data) {
        const docsText = data.documentsNeeded.join(', ');
        const message = `Hi ${data.userName}! Please upload ${docsText} for booking ${data.bookingReference} by ${data.deadline}. Visit your dashboard to upload. - GoUraan`;
        return await this.sendSms({
            to: data.to,
            message,
        });
    }
    async sendPromotionalSms(data) {
        const results = [];
        for (const phoneNumber of data.to) {
            try {
                const result = await this.sendSms({
                    to: phoneNumber,
                    message: data.message,
                });
                results.push({
                    success: true,
                    phoneNumber,
                    messageId: result.messageId,
                    campaignId: data.campaignId,
                });
            }
            catch (error) {
                results.push({
                    success: false,
                    phoneNumber,
                    error: error.message,
                    campaignId: data.campaignId,
                });
            }
        }
        return results;
    }
    async sendBulkSms(messages) {
        const results = [];
        for (const sms of messages) {
            try {
                const result = await this.sendSms(sms);
                results.push({ success: true, phoneNumber: sms.to, result });
            }
            catch (error) {
                results.push({ success: false, phoneNumber: sms.to, error: error.message });
            }
        }
        return results;
    }
    async sendLocalizedSms(data) {
        const templates = {
            booking_confirmation: {
                en: 'Hi {userName}! Your {bookingType} booking is confirmed. Reference: {bookingReference}. Thank you for choosing GoUraan!',
                bn: 'হ্যালো {userName}! আপনার {bookingType} বুকিং নিশ্চিত হয়েছে। রেফারেন্স: {bookingReference}। GoUraan বেছে নেওয়ার জন্য ধন্যবাদ!',
                ar: 'مرحبا {userName}! تم تأكيد حجز {bookingType} الخاص بك. المرجع: {bookingReference}. شكرا لاختيارك GoUraan!',
            },
            payment_success: {
                en: 'Payment successful! {currency} {amount} received for booking {bookingReference}. - GoUraan',
                bn: 'পেমেন্ট সফল! {currency} {amount} বুকিং {bookingReference} এর জন্য গৃহীত হয়েছে। - GoUraan',
                ar: 'تم الدفع بنجاح! تم استلام {currency} {amount} للحجز {bookingReference}. - GoUraan',
            },
        };
        let message = templates[data.templateKey]?.[data.language];
        if (!message) {
            message = templates[data.templateKey]?.en || 'Message from GoUraan';
        }
        Object.keys(data.variables).forEach(key => {
            message = message.replace(`{${key}}`, data.variables[key]);
        });
        return await this.sendSms({
            to: data.to,
            message,
        });
    }
    formatPhoneNumber(phoneNumber, countryCode = '+880') {
        let cleaned = phoneNumber.replace(/\D/g, '');
        if (countryCode === '+880') {
            if (cleaned.startsWith('880')) {
                return `+${cleaned}`;
            }
            else if (cleaned.startsWith('01')) {
                return `+880${cleaned}`;
            }
            else if (cleaned.length === 10) {
                return `+880${cleaned}`;
            }
        }
        if (!cleaned.startsWith(countryCode.replace('+', ''))) {
            return `${countryCode}${cleaned}`;
        }
        return `+${cleaned}`;
    }
    validatePhoneNumber(phoneNumber) {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = SmsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SmsService);
//# sourceMappingURL=sms.service.js.map