import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private templates: Map<string, handlebars.TemplateDelegate> = new Map();

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
    this.loadTemplates();
  }

  private initializeTransporter() {
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

    // Verify connection
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Email transporter verification failed', error);
      } else {
        this.logger.log('Email transporter is ready');
      }
    });
  }

  private loadTemplates() {
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
    } catch (error) {
      this.logger.error('Failed to load email templates', error);
    }
  }

  async sendEmail(data: {
    to: string | string[];
    subject: string;
    template?: string;
    html?: string;
    text?: string;
    data?: any;
    attachments?: any[];
  }) {
    try {
      let html = data.html;
      let text = data.text;

      // Use template if specified
      if (data.template && this.templates.has(data.template)) {
        const template = this.templates.get(data.template);
        html = template(data.data || {});
        
        // Generate text version from HTML
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
    } catch (error) {
      this.logger.error('Failed to send email', error);
      throw error;
    }
  }

  async sendBookingConfirmation(data: {
    to: string;
    userName: string;
    bookingReference: string;
    bookingType: string;
    totalAmount: number;
    currency: string;
    bookingDetails: any;
  }) {
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

  async sendPaymentSuccess(data: {
    to: string;
    userName: string;
    bookingReference: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    transactionId: string;
  }) {
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

  async sendFlightReminder(data: {
    to: string;
    userName: string;
    flightDetails: {
      flightNumber: string;
      departure: {
        airport: string;
        city: string;
        time: string;
      };
      arrival: {
        airport: string;
        city: string;
        time: string;
      };
    };
    bookingReference: string;
    checkInUrl?: string;
  }) {
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

  async sendPasswordReset(data: {
    to: string;
    userName: string;
    resetToken: string;
    resetUrl: string;
  }) {
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

  async sendWelcomeEmail(data: {
    to: string;
    userName: string;
    verificationUrl?: string;
  }) {
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

  async sendPromotionalEmail(data: {
    to: string[];
    subject: string;
    content: string;
    ctaText?: string;
    ctaUrl?: string;
    imageUrl?: string;
  }) {
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

  async sendDocumentRequest(data: {
    to: string;
    userName: string;
    bookingReference: string;
    requiredDocuments: string[];
    uploadUrl: string;
    deadline: string;
  }) {
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

  private htmlToText(html: string): string {
    // Simple HTML to text conversion
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

  // Bulk email methods
  async sendBulkEmail(emails: Array<{
    to: string;
    subject: string;
    template?: string;
    html?: string;
    data?: any;
  }>) {
    const results = [];
    
    for (const email of emails) {
      try {
        const result = await this.sendEmail(email);
        results.push({ success: true, email: email.to, result });
      } catch (error) {
        results.push({ success: false, email: email.to, error: error.message });
      }
    }

    return results;
  }

  async sendNewsletterToSegment(data: {
    segment: string[];
    subject: string;
    content: string;
    ctaText?: string;
    ctaUrl?: string;
  }) {
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
}
