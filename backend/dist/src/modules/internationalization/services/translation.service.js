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
var TranslationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = require("fs");
const path = require("path");
let TranslationService = TranslationService_1 = class TranslationService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(TranslationService_1.name);
        this.translations = new Map();
        this.supportedLocales = ['en', 'bn', 'ar'];
        this.loadTranslations();
    }
    loadTranslations() {
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
        }
        catch (error) {
            this.logger.error('Failed to load translations', error);
        }
    }
    translate(key, locale = 'en', params) {
        const translations = this.translations.get(locale) || this.translations.get('en');
        if (!translations) {
            return key;
        }
        let translation = this.getNestedValue(translations, key);
        if (!translation) {
            const englishTranslations = this.translations.get('en');
            translation = englishTranslations ? this.getNestedValue(englishTranslations, key) : key;
        }
        if (params && typeof translation === 'string') {
            Object.keys(params).forEach(param => {
                translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
            });
        }
        return translation || key;
    }
    getNestedValue(obj, key) {
        return key.split('.').reduce((current, keyPart) => {
            return current && current[keyPart] !== undefined ? current[keyPart] : null;
        }, obj);
    }
    getSupportedLocales() {
        return this.supportedLocales;
    }
    isLocaleSupported(locale) {
        return this.supportedLocales.includes(locale);
    }
    getTranslations(locale) {
        return this.translations.get(locale) || {};
    }
    translateBookingStatus(status, locale = 'en') {
        return this.translate(`booking.status.${status.toLowerCase()}`, locale);
    }
    translateBookingType(type, locale = 'en') {
        return this.translate(`booking.type.${type.toLowerCase()}`, locale);
    }
    translatePaymentStatus(status, locale = 'en') {
        return this.translate(`payment.status.${status.toLowerCase()}`, locale);
    }
    formatCurrency(amount, currency, locale = 'en') {
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
        }
        catch (error) {
            return `${currency} ${amount.toFixed(2)}`;
        }
    }
    formatDate(date, locale = 'en', options) {
        const localeMap = {
            'en': 'en-US',
            'bn': 'bn-BD',
            'ar': 'ar-SA',
        };
        const browserLocale = localeMap[locale] || 'en-US';
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        try {
            return new Intl.DateTimeFormat(browserLocale, options || defaultOptions).format(date);
        }
        catch (error) {
            return date.toLocaleDateString();
        }
    }
    formatNumber(number, locale = 'en') {
        const localeMap = {
            'en': 'en-US',
            'bn': 'bn-BD',
            'ar': 'ar-SA',
        };
        const browserLocale = localeMap[locale] || 'en-US';
        try {
            return new Intl.NumberFormat(browserLocale).format(number);
        }
        catch (error) {
            return number.toString();
        }
    }
    getEmailTemplate(templateKey, locale = 'en') {
        const template = this.translate(`email.templates.${templateKey}`, locale);
        if (typeof template === 'object') {
            return template;
        }
        return this.translate(`email.templates.${templateKey}`, 'en');
    }
    getSmsTemplate(templateKey, locale = 'en') {
        return this.translate(`sms.templates.${templateKey}`, locale);
    }
    getValidationMessage(field, rule, locale = 'en') {
        return this.translate(`validation.${field}.${rule}`, locale);
    }
    getErrorMessage(errorCode, locale = 'en') {
        return this.translate(`errors.${errorCode}`, locale);
    }
    getSuccessMessage(actionKey, locale = 'en') {
        return this.translate(`success.${actionKey}`, locale);
    }
    pluralize(key, count, locale = 'en') {
        const pluralRules = new Intl.PluralRules(locale);
        const rule = pluralRules.select(count);
        const pluralKey = `${key}.${rule}`;
        let translation = this.translate(pluralKey, locale);
        if (translation === pluralKey) {
            translation = this.translate(key, locale);
        }
        return translation.replace('{{count}}', count.toString());
    }
    isRTL(locale) {
        const rtlLocales = ['ar', 'he', 'fa', 'ur'];
        return rtlLocales.includes(locale);
    }
    getTextDirection(locale) {
        return this.isRTL(locale) ? 'rtl' : 'ltr';
    }
    async reloadTranslations() {
        this.translations.clear();
        this.loadTranslations();
        this.logger.log('Translations reloaded');
    }
    getTranslationStats() {
        const stats = {};
        this.supportedLocales.forEach(locale => {
            const translations = this.translations.get(locale);
            if (translations) {
                stats[locale] = {
                    totalKeys: this.countKeys(translations),
                    lastUpdated: new Date().toISOString(),
                };
            }
        });
        return stats;
    }
    countKeys(obj, prefix = '') {
        let count = 0;
        Object.keys(obj).forEach(key => {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                count += this.countKeys(obj[key], fullKey);
            }
            else {
                count++;
            }
        });
        return count;
    }
    suggestTranslationKey(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 50);
    }
};
exports.TranslationService = TranslationService;
exports.TranslationService = TranslationService = TranslationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TranslationService);
//# sourceMappingURL=translation.service.js.map