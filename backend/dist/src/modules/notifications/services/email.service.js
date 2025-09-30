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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.templates = new Map();
        this.initializeTransporter();
        this.loadTemplates();
    }
    initializeTransporter() {
        const emailConfig = this.configService.get('email');
        this.transporter = nodemailer.createTransport({
            host: emailConfig.smtp.host,
            port: emailConfig.smtp.port,
            secure: emailConfig.smtp.secure,
            auth: {
                user: emailConfig.smtp.user,
                pass: emailConfig.smtp.password,
            },
        });
        this.transporter.verify((error, success) => {
            if (error) {
                this.logger.error('Email transporter verification failed', error);
            }
            else {
                this.logger.log('Email transporter is ready');
            }
        });
    }
    loadTemplates() {
        const templatesDir = path.join(__dirname, '..', 'templates');
        try {
            const templateFiles = fs.readdirSync(templatesDir);
            templateFiles.forEach(file => {
                if (file.endsWith('.hbs')) {
                    const templateName = file.replace('.hbs', '');
                    const templatePath = path.join(templatesDir, file);
                    const templateContent = fs.readFileSync(templatePath, 'utf8');
                    const compiledTemplate = handlebars.compile(templateContent);
                    this.templates.set(templateName, compiledTemplate);
                }
            });
            this.logger.log(`Loaded ${this.templates.size} email templates`);
        }
        catch (error) {
            this.logger.error('Failed to load email templates', error);
        }
    }
    async sendEmail(data) {
        try {
            let html = data.html;
            let text = data.text;
            if (data.template && this.templates.has(data.template)) {
                const template = this.templates.get(data.template);
                html = template(data.data || {});
                text = this.htmlToText(html);
            }
            const mailOptions = {
                from: {
                    name: this.configService.get('email.from.name'),
                    address: this.configService.get('email.from.address'),
                },
                to: Array.isArray(data.to) ? data.to.join(', ') : data.to,
                subject: data.subject,
                html,
                text,
                attachments: data.attachments,
            };
            const result = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email sent successfully: ${result.messageId}`);
            return {
                success: true,
                messageId: result.messageId,
                response: result.response,
            };
        }
        catch (error) {
            this.logger.error('Failed to send email', error);
            throw error;
        }
    }
    async sendBookingConfirmation(data) {
        return await this.sendEmail({
            to: data.to,
            subject: `Booking Confirmed - ${data.bookingReference}`,
            template: 'booking-confirmation',
            data: {
                userName: data.userName,
                bookingReference: data.bookingReference,
                bookingType: data.bookingType,
                totalAmount: data.totalAmount,
                currency: data.currency,
                bookingDetails: data.bookingDetails,
                supportEmail: this.configService.get('email.support'),
                companyName: 'GoUraan',
                year: new Date().getFullYear(),
            },
        });
    }
    async sendPaymentSuccess(data) {
        return await this.sendEmail({
            to: data.to,
            subject: `Payment Successful - ${data.bookingReference}`,
            template: 'payment-success',
            data: {
                userName: data.userName,
                bookingReference: data.bookingReference,
                amount: data.amount,
                currency: data.currency,
                paymentMethod: data.paymentMethod,
                transactionId: data.transactionId,
                supportEmail: this.configService.get('email.support'),
                companyName: 'GoUraan',
                year: new Date().getFullYear(),
            },
        });
    }
    async sendFlightReminder(data) {
        return await this.sendEmail({
            to: data.to,
            subject: `Flight Reminder - ${data.flightDetails.flightNumber}`,
            template: 'flight-reminder',
            data: {
                userName: data.userName,
                flightDetails: data.flightDetails,
                bookingReference: data.bookingReference,
                checkInUrl: data.checkInUrl,
                supportEmail: this.configService.get('email.support'),
                companyName: 'GoUraan',
                year: new Date().getFullYear(),
            },
        });
    }
    async sendPasswordReset(data) {
        return await this.sendEmail({
            to: data.to,
            subject: 'Reset Your Password - GoUraan',
            template: 'password-reset',
            data: {
                userName: data.userName,
                resetUrl: data.resetUrl,
                resetToken: data.resetToken,
                expiryHours: 24,
                supportEmail: this.configService.get('email.support'),
                companyName: 'GoUraan',
                year: new Date().getFullYear(),
            },
        });
    }
    async sendWelcomeEmail(data) {
        return await this.sendEmail({
            to: data.to,
            subject: 'Welcome to GoUraan - Your Journey Begins Here',
            template: 'welcome',
            data: {
                userName: data.userName,
                verificationUrl: data.verificationUrl,
                dashboardUrl: `${this.configService.get('app.frontendUrl')}/dashboard`,
                supportEmail: this.configService.get('email.support'),
                companyName: 'GoUraan',
                year: new Date().getFullYear(),
            },
        });
    }
    async sendPromotionalEmail(data) {
        return await this.sendEmail({
            to: data.to,
            subject: data.subject,
            template: 'promotional',
            data: {
                content: data.content,
                ctaText: data.ctaText,
                ctaUrl: data.ctaUrl,
                imageUrl: data.imageUrl,
                unsubscribeUrl: `${this.configService.get('app.frontendUrl')}/unsubscribe`,
                supportEmail: this.configService.get('email.support'),
                companyName: 'GoUraan',
                year: new Date().getFullYear(),
            },
        });
    }
    async sendDocumentRequest(data) {
        return await this.sendEmail({
            to: data.to,
            subject: `Documents Required - ${data.bookingReference}`,
            template: 'document-request',
            data: {
                userName: data.userName,
                bookingReference: data.bookingReference,
                requiredDocuments: data.requiredDocuments,
                uploadUrl: data.uploadUrl,
                deadline: data.deadline,
                supportEmail: this.configService.get('email.support'),
                companyName: 'GoUraan',
                year: new Date().getFullYear(),
            },
        });
    }
    htmlToText(html) {
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .trim();
    }
    async sendBulkEmail(emails) {
        const results = [];
        for (const email of emails) {
            try {
                const result = await this.sendEmail(email);
                results.push({ success: true, email: email.to, result });
            }
            catch (error) {
                results.push({ success: false, email: email.to, error: error.message });
            }
        }
        return results;
    }
    async sendNewsletterToSegment(data) {
        const emails = data.segment.map(email => ({
            to: email,
            subject: data.subject,
            template: 'newsletter',
            data: {
                content: data.content,
                ctaText: data.ctaText,
                ctaUrl: data.ctaUrl,
                unsubscribeUrl: `${this.configService.get('app.frontendUrl')}/unsubscribe?email=${email}`,
                supportEmail: this.configService.get('email.support'),
                companyName: 'GoUraan',
                year: new Date().getFullYear(),
            },
        }));
        return await this.sendBulkEmail(emails);
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map