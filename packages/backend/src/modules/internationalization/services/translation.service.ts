import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private translations: Map<string, any> = new Map();
  private supportedLocales = ['en', 'bn', 'ar'];

  constructor(private configService: ConfigService) {
    this.loadTranslations();
  }

  private loadTranslations() {
    const translationsDir = path.join(__dirname, '..', 'translations');
    
    try {
      this.supportedLocales.forEach(locale => {
        const translationPath = path.join(translationsDir, `${locale}.json`);
        if (fs.existsSync(translationPath)) {
          const translationData = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
          this.translations.set(locale, translationData);
        }
      });

      this.logger.log(`Loaded translations for ${this.translations.size} locales`);
    } catch (error) {
      this.logger.error('Failed to load translations', error);
    }
  }

  translate(key: string, locale: string = 'en', params?: Record<string, any>): string {
    const translations = this.translations.get(locale) || this.translations.get('en');
    
    if (!translations) {
      return key;
    }

    let translation = this.getNestedValue(translations, key);
    
    if (!translation) {
      // Fallback to English if translation not found
      const englishTranslations = this.translations.get('en');
      translation = englishTranslations ? this.getNestedValue(englishTranslations, key) : key;
    }

    // Replace parameters in translation
    if (params && typeof translation === 'string') {
      Object.keys(params).forEach(param => {
        translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
      });
    }

    return translation || key;
  }

  private getNestedValue(obj: any, key: string): any {
    return key.split('.').reduce((current, keyPart) => {
      return current && current[keyPart] !== undefined ? current[keyPart] : null;
    }, obj);
  }

  getSupportedLocales(): string[] {
    return this.supportedLocales;
  }

  isLocaleSupported(locale: string): boolean {
    return this.supportedLocales.includes(locale);
  }

  getTranslations(locale: string): any {
    return this.translations.get(locale) || {};
  }

  // Booking-specific translations
  translateBookingStatus(status: string, locale: string = 'en'): string {
    return this.translate(`booking.status.${status.toLowerCase()}`, locale);
  }

  translateBookingType(type: string, locale: string = 'en'): string {
    return this.translate(`booking.type.${type.toLowerCase()}`, locale);
  }

  translatePaymentStatus(status: string, locale: string = 'en'): string {
    return this.translate(`payment.status.${status.toLowerCase()}`, locale);
  }

  // Currency formatting with localization
  formatCurrency(amount: number, currency: string, locale: string = 'en'): string {
    const localeMap = {
      'en': 'en-US',
      'bn': 'bn-BD',
      'ar': 'ar-SA',
    };

    const browserLocale = localeMap[locale] || 'en-US';

    try {
      return new Intl.NumberFormat(browserLocale, {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch (error) {
      // Fallback formatting
      return `${currency} ${amount.toFixed(2)}`;
    }
  }

  // Date formatting with localization
  formatDate(date: Date, locale: string = 'en', options?: Intl.DateTimeFormatOptions): string {
    const localeMap = {
      'en': 'en-US',
      'bn': 'bn-BD',
      'ar': 'ar-SA',
    };

    const browserLocale = localeMap[locale] || 'en-US';
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    try {
      return new Intl.DateTimeFormat(browserLocale, options || defaultOptions).format(date);
    } catch (error) {
      return date.toLocaleDateString();
    }
  }

  // Number formatting with localization
  formatNumber(number: number, locale: string = 'en'): string {
    const localeMap = {
      'en': 'en-US',
      'bn': 'bn-BD',
      'ar': 'ar-SA',
    };

    const browserLocale = localeMap[locale] || 'en-US';

    try {
      return new Intl.NumberFormat(browserLocale).format(number);
    } catch (error) {
      return number.toString();
    }
  }

  // Email template translations
  getEmailTemplate(templateKey: string, locale: string = 'en'): any {
    const template = this.translate(`email.templates.${templateKey}`, locale);
    
    if (typeof template === 'object') {
      return template;
    }

    // Fallback to English template
    return this.translate(`email.templates.${templateKey}`, 'en');
  }

  // SMS template translations
  getSmsTemplate(templateKey: string, locale: string = 'en'): string {
    return this.translate(`sms.templates.${templateKey}`, locale);
  }

  // Validation message translations
  getValidationMessage(field: string, rule: string, locale: string = 'en'): string {
    return this.translate(`validation.${field}.${rule}`, locale);
  }

  // Error message translations
  getErrorMessage(errorCode: string, locale: string = 'en'): string {
    return this.translate(`errors.${errorCode}`, locale);
  }

  // Success message translations
  getSuccessMessage(actionKey: string, locale: string = 'en'): string {
    return this.translate(`success.${actionKey}`, locale);
  }

  // Pluralization support
  pluralize(key: string, count: number, locale: string = 'en'): string {
    const pluralRules = new Intl.PluralRules(locale);
    const rule = pluralRules.select(count);
    
    const pluralKey = `${key}.${rule}`;
    let translation = this.translate(pluralKey, locale);
    
    if (translation === pluralKey) {
      // Fallback to singular form
      translation = this.translate(key, locale);
    }

    return translation.replace('{{count}}', count.toString());
  }

  // RTL language support
  isRTL(locale: string): boolean {
    const rtlLocales = ['ar', 'he', 'fa', 'ur'];
    return rtlLocales.includes(locale);
  }

  // Get text direction for CSS
  getTextDirection(locale: string): 'ltr' | 'rtl' {
    return this.isRTL(locale) ? 'rtl' : 'ltr';
  }

  // Dynamic translation loading (for admin interface)
  async reloadTranslations(): Promise<void> {
    this.translations.clear();
    this.loadTranslations();
    this.logger.log('Translations reloaded');
  }

  // Translation statistics
  getTranslationStats(): any {
    const stats = {};
    
    this.supportedLocales.forEach(locale => {
      const translations = this.translations.get(locale);
      if (translations) {
        stats[locale] = {
          totalKeys: this.countKeys(translations),
          lastUpdated: new Date().toISOString(), // Would be actual file modification time
        };
      }
    });

    return stats;
  }

  private countKeys(obj: any, prefix: string = ''): number {
    let count = 0;
    
    Object.keys(obj).forEach(key => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        count += this.countKeys(obj[key], fullKey);
      } else {
        count++;
      }
    });

    return count;
  }

  // Translation key suggestions for missing translations
  suggestTranslationKey(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }
}
