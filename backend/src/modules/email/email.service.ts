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
  private templateCache = new Map<string, HandlebarsTemplateDelegate>();

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });
  }

  private async getTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName);
    }

    try {
      const templatePath = path.join(
        __dirname,
        '..',
        '..',
        'templates',
        'emails',
        `${templateName}.hbs`
      );
      
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);
      this.templateCache.set(templateName, template);
      return template;
    } catch (error) {
      this.logger.error(`Failed to load email template: ${templateName}`, error.stack);
      throw new Error(`Failed to load email template: ${templateName}`);
    }
  }

  async sendEmail(to: string, subject: string, template: string, context: any = {}) {
    try {
      const templateFn = await this.getTemplate(template);
      const html = templateFn({
        ...context,
        appName: this.configService.get('APP_NAME') || 'GoUraan',
        appUrl: this.configService.get('APP_URL') || 'https://gouraan.com',
        year: new Date().getFullYear(),
      });

      const mailOptions = {
        from: `"${this.configService.get('EMAIL_FROM_NAME', 'GoUraan Support')}" <${this.configService.get('EMAIL_FROM')}>`,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error('Error sending email', error.stack);
      throw error;
    }
  }

  async sendSupportTicketCreated(
    to: string,
    ticket: { id: string; title: string; status: string; priority: string },
    assigneeName?: string
  ) {
    return this.sendEmail(
      to,
      `New Support Ticket #${ticket.id}: ${ticket.title}`,
      'support-ticket-created',
      {
        ticket,
        assigneeName,
        supportEmail: this.configService.get('SUPPORT_EMAIL', 'support@gouraan.com'),
      }
    );
  }

  async sendSupportTicketUpdated(
    to: string,
    ticket: { id: string; title: string; status: string; priority: string },
    updaterName: string,
    changes: string[]
  ) {
    return this.sendEmail(
      to,
      `Ticket #${ticket.id} has been updated`,
      'support-ticket-updated',
      {
        ticket,
        updaterName,
        changes,
        supportEmail: this.configService.get('SUPPORT_EMAIL', 'support@gouraan.com'),
      }
    );
  }
}
