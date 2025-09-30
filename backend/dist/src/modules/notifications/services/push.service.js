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
var PushService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const admin = require("firebase-admin");
let PushService = PushService_1 = class PushService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PushService_1.name);
        this.initializeFirebase();
    }
    initializeFirebase() {
        try {
            const firebaseConfig = this.configService.get('firebase');
            if (!admin.apps.length) {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId: firebaseConfig.projectId,
                        clientEmail: firebaseConfig.clientEmail,
                        privateKey: firebaseConfig.privateKey.replace(/\\n/g, '\n'),
                    }),
                });
            }
            this.logger.log('Firebase Admin initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize Firebase Admin', error);
        }
    }
    async sendPushNotification(data) {
        try {
            const message = {
                tokens: data.tokens.filter(token => token && token.length > 0),
                notification: {
                    title: data.title,
                    body: data.body,
                    imageUrl: data.imageUrl,
                },
                data: data.data || {},
                android: {
                    notification: {
                        icon: 'ic_notification',
                        color: '#1E40AF',
                        sound: 'default',
                        clickAction: data.clickAction,
                    },
                    priority: 'high',
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                            category: data.data?.type || 'general',
                        },
                    },
                    fcmOptions: {
                        imageUrl: data.imageUrl,
                    },
                },
                webpush: {
                    notification: {
                        icon: '/icons/icon-192x192.png',
                        badge: '/icons/badge-72x72.png',
                        image: data.imageUrl,
                        requireInteraction: true,
                        actions: [
                            {
                                action: 'view',
                                title: 'View Details',
                            },
                            {
                                action: 'dismiss',
                                title: 'Dismiss',
                            },
                        ],
                    },
                    fcmOptions: {
                        link: data.clickAction || '/',
                    },
                },
            };
            const response = await admin.messaging().sendMulticast(message);
            this.logger.log(`Push notification sent: ${response.successCount}/${data.tokens.length} successful`);
            return {
                success: true,
                successCount: response.successCount,
                failureCount: response.failureCount,
                responses: response.responses,
            };
        }
        catch (error) {
            this.logger.error('Failed to send push notification', error);
            throw error;
        }
    }
    async sendToTopic(data) {
        try {
            const message = {
                topic: data.topic,
                notification: {
                    title: data.title,
                    body: data.body,
                    imageUrl: data.imageUrl,
                },
                data: data.data || {},
                android: {
                    notification: {
                        icon: 'ic_notification',
                        color: '#1E40AF',
                        sound: 'default',
                    },
                    priority: 'high',
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                },
            };
            const response = await admin.messaging().send(message);
            this.logger.log(`Topic notification sent: ${response}`);
            return {
                success: true,
                messageId: response,
            };
        }
        catch (error) {
            this.logger.error('Failed to send topic notification', error);
            throw error;
        }
    }
    async subscribeToTopic(tokens, topic) {
        try {
            const response = await admin.messaging().subscribeToTopic(tokens, topic);
            this.logger.log(`Subscribed ${response.successCount} tokens to topic: ${topic}`);
            return {
                success: true,
                successCount: response.successCount,
                failureCount: response.failureCount,
            };
        }
        catch (error) {
            this.logger.error('Failed to subscribe to topic', error);
            throw error;
        }
    }
    async unsubscribeFromTopic(tokens, topic) {
        try {
            const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
            this.logger.log(`Unsubscribed ${response.successCount} tokens from topic: ${topic}`);
            return {
                success: true,
                successCount: response.successCount,
                failureCount: response.failureCount,
            };
        }
        catch (error) {
            this.logger.error('Failed to unsubscribe from topic', error);
            throw error;
        }
    }
    async sendBookingConfirmation(data) {
        return await this.sendPushNotification({
            tokens: data.tokens,
            title: 'Booking Confirmed! ✈️',
            body: `Hi ${data.userName}! Your ${data.bookingType} booking ${data.bookingReference} has been confirmed.`,
            data: {
                type: 'booking_confirmation',
                bookingReference: data.bookingReference,
                bookingType: data.bookingType,
            },
            clickAction: '/dashboard/bookings',
        });
    }
    async sendPaymentSuccess(data) {
        return await this.sendPushNotification({
            tokens: data.tokens,
            title: 'Payment Successful! 💳',
            body: `Payment of ${data.currency} ${data.amount} for booking ${data.bookingReference} was successful.`,
            data: {
                type: 'payment_success',
                bookingReference: data.bookingReference,
                amount: data.amount.toString(),
                currency: data.currency,
            },
            clickAction: '/dashboard/bookings',
        });
    }
    async sendFlightReminder(data) {
        return await this.sendPushNotification({
            tokens: data.tokens,
            title: `Flight Reminder - ${data.flightNumber} ✈️`,
            body: `Your flight departs in ${data.hoursUntilFlight} hours at ${data.departureTime}. Don't forget to check-in!`,
            data: {
                type: 'flight_reminder',
                flightNumber: data.flightNumber,
                departureTime: data.departureTime,
            },
            clickAction: '/dashboard/bookings',
        });
    }
    async sendDocumentReminder(data) {
        const docsText = data.documentsNeeded.join(', ');
        return await this.sendPushNotification({
            tokens: data.tokens,
            title: 'Documents Required 📄',
            body: `Please upload ${docsText} for booking ${data.bookingReference}.`,
            data: {
                type: 'document_reminder',
                bookingReference: data.bookingReference,
                documentsNeeded: JSON.stringify(data.documentsNeeded),
            },
            clickAction: '/dashboard/documents',
        });
    }
    async sendPromotionalNotification(data) {
        return await this.sendPushNotification({
            tokens: data.tokens,
            title: data.title,
            body: data.message,
            imageUrl: data.imageUrl,
            data: {
                type: 'promotional',
                campaignId: data.campaignId || '',
            },
            clickAction: data.ctaUrl || '/packages',
        });
    }
    async sendSystemAlert(data) {
        const icons = {
            info: 'ℹ️',
            warning: '⚠️',
            error: '🚨',
        };
        return await this.sendPushNotification({
            tokens: data.tokens,
            title: `${icons[data.severity]} ${data.title}`,
            body: data.message,
            data: {
                type: 'system_alert',
                severity: data.severity,
            },
            clickAction: '/dashboard',
        });
    }
    async sendBulkNotifications(notifications) {
        const results = [];
        for (const notification of notifications) {
            try {
                const result = await this.sendPushNotification(notification);
                results.push({ success: true, result });
            }
            catch (error) {
                results.push({ success: false, error: error.message });
            }
        }
        return results;
    }
    async sendToAllUsers(data) {
        return await this.sendToTopic({
            topic: 'all_users',
            title: data.title,
            body: data.body,
            data: data.data,
            imageUrl: data.imageUrl,
        });
    }
    async sendToPremiumUsers(data) {
        return await this.sendToTopic({
            topic: 'premium_users',
            title: data.title,
            body: data.body,
            data: data.data,
            imageUrl: data.imageUrl,
        });
    }
    async sendToHajjCustomers(data) {
        return await this.sendToTopic({
            topic: 'hajj_customers',
            title: data.title,
            body: data.body,
            data: data.data,
            imageUrl: data.imageUrl,
        });
    }
    async validateTokens(tokens) {
        const validTokens = [];
        for (const token of tokens) {
            try {
                await admin.messaging().send({
                    token,
                    data: { test: 'true' },
                }, true);
                validTokens.push(token);
            }
            catch (error) {
                this.logger.warn(`Invalid FCM token: ${token}`);
            }
        }
        return validTokens;
    }
};
exports.PushService = PushService;
exports.PushService = PushService = PushService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PushService);
//# sourceMappingURL=push.service.js.map