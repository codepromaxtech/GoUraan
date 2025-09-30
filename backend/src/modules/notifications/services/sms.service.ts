import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly provider: string;
  private readonly twilioConfig: any;
  private readonly sslWirelessConfig: any;

  constructor(private configService: ConfigService) {
    this.provider = this.configService.get('sms.provider') || 'twilio';
    this.twilioConfig = this.configService.get('sms.twilio');
    this.sslWirelessConfig = this.configService.get('sms.sslwireless');
  }

  async sendSms(data: {
    to: string;
    message: string;
    templateData?: any;
  }) {
    try {
      switch (this.provider) {
        case 'twilio':
          return await this.sendViaTwilio(data);
        case 'sslwireless':
          return await this.sendViaSSLWireless(data);
        default:
          throw new Error(`Unsupported SMS provider: ${this.provider}`);
      }
    } catch (error) {
      this.logger.error('Failed to send SMS', error);
      throw error;
    }
  }

  private async sendViaTwilio(data: {
    to: string;
    message: string;
  }) {
    const accountSid = this.twilioConfig.accountSid;
    const authToken = this.twilioConfig.authToken;
    const fromNumber = this.twilioConfig.fromNumber;

    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      new URLSearchParams({
        From: fromNumber,
        To: data.to,
        Body: data.message,
      }),
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return {
      success: true,
      messageId: response.data.sid,
      status: response.data.status,
      provider: 'twilio',
    };
  }

  private async sendViaSSLWireless(data: {
    to: string;
    message: string;
  }) {
    const user = this.sslWirelessConfig.user;
    const pass = this.sslWirelessConfig.password;
    const sid = this.sslWirelessConfig.sid;

    const response = await axios.post(
      'https://smsplus.sslwireless.com/api/v3/send-sms',
      {
        api_token: this.sslWirelessConfig.apiToken,
        sid: sid,
        msisdn: data.to.replace('+', ''),
        sms: data.message,
        csms_id: `GOURAAN_${Date.now()}`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    return {
      success: response.data.status === 'SUCCESS',
      messageId: response.data.smsinfo?.csms_id,
      status: response.data.status,
      provider: 'sslwireless',
    };
  }

  async sendBookingConfirmationSms(data: {
    to: string;
    userName: string;
    bookingReference: string;
    bookingType: string;
    amount: number;
    currency: string;
  }) {
    const message = `Hi ${data.userName}! Your ${data.bookingType} booking is confirmed. Reference: ${data.bookingReference}. Amount: ${data.currency} ${data.amount}. Thank you for choosing GoUraan!`;
    
    return await this.sendSms({
      to: data.to,
      message,
    });
  }

  async sendPaymentSuccessSms(data: {
    to: string;
    userName: string;
    bookingReference: string;
    amount: number;
    currency: string;
  }) {
    const message = `Payment successful! ${data.currency} ${data.amount} received for booking ${data.bookingReference}. Your booking is now confirmed. - GoUraan`;
    
    return await this.sendSms({
      to: data.to,
      message,
    });
  }

  async sendFlightReminderSms(data: {
    to: string;
    userName: string;
    flightNumber: string;
    departureTime: string;
    departureAirport: string;
  }) {
    const message = `Flight Reminder: ${data.flightNumber} departing ${data.departureTime} from ${data.departureAirport}. Please arrive 3 hours early for international flights. Safe travels! - GoUraan`;
    
    return await this.sendSms({
      to: data.to,
      message,
    });
  }

  async sendOtpSms(data: {
    to: string;
    otp: string;
    purpose: 'verification' | 'login' | 'password_reset';
  }) {
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

  async sendDocumentReminderSms(data: {
    to: string;
    userName: string;
    bookingReference: string;
    documentsNeeded: string[];
    deadline: string;
  }) {
    const docsText = data.documentsNeeded.join(', ');
    const message = `Hi ${data.userName}! Please upload ${docsText} for booking ${data.bookingReference} by ${data.deadline}. Visit your dashboard to upload. - GoUraan`;
    
    return await this.sendSms({
      to: data.to,
      message,
    });
  }

  async sendPromotionalSms(data: {
    to: string[];
    message: string;
    campaignId?: string;
  }) {
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
      } catch (error) {
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

  async sendBulkSms(messages: Array<{
    to: string;
    message: string;
    templateData?: any;
  }>) {
    const results = [];
    
    for (const sms of messages) {
      try {
        const result = await this.sendSms(sms);
        results.push({ success: true, phoneNumber: sms.to, result });
      } catch (error) {
        results.push({ success: false, phoneNumber: sms.to, error: error.message });
      }
    }

    return results;
  }

  // SMS templates for different languages
  async sendLocalizedSms(data: {
    to: string;
    templateKey: string;
    language: 'en' | 'bn' | 'ar';
    variables: Record<string, string>;
  }) {
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

    // Replace variables
    Object.keys(data.variables).forEach(key => {
      message = message.replace(`{${key}}`, data.variables[key]);
    });

    return await this.sendSms({
      to: data.to,
      message,
    });
  }

  // Utility methods
  formatPhoneNumber(phoneNumber: string, countryCode: string = '+880'): string {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle Bangladesh numbers
    if (countryCode === '+880') {
      if (cleaned.startsWith('880')) {
        return `+${cleaned}`;
      } else if (cleaned.startsWith('01')) {
        return `+880${cleaned}`;
      } else if (cleaned.length === 10) {
        return `+880${cleaned}`;
      }
    }
    
    // Default: add country code if not present
    if (!cleaned.startsWith(countryCode.replace('+', ''))) {
      return `${countryCode}${cleaned}`;
    }
    
    return `+${cleaned}`;
  }

  validatePhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  }
}
