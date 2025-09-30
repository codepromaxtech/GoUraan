declare const _default: () => {
    app: {
        name: string;
        port: number;
        environment: string;
        url: string;
        frontendUrl: string;
    };
    database: {
        url: string;
        shadowUrl: string;
    };
    redis: {
        host: string;
        port: number;
        password: string;
        db: number;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    encryption: {
        key: string;
    };
    email: {
        smtp: {
            host: string;
            port: number;
            secure: boolean;
            auth: {
                user: string;
                pass: string;
            };
        };
        from: {
            email: string;
            name: string;
        };
    };
    payments: {
        stripe: {
            secretKey: string;
            publishableKey: string;
            webhookSecret: string;
        };
        paypal: {
            clientId: string;
            clientSecret: string;
            mode: string;
        };
        sslcommerz: {
            storeId: string;
            storePassword: string;
            isLive: boolean;
        };
        hyperpay: {
            userId: string;
            password: string;
            entityId: string;
            isLive: boolean;
        };
    };
    apis: {
        amadeus: {
            apiKey: string;
            apiSecret: string;
            baseUrl: string;
        };
        googleMaps: {
            apiKey: string;
        };
    };
    storage: {
        aws: {
            accessKeyId: string;
            secretAccessKey: string;
            region: string;
            bucket: string;
        };
        cloudinary: {
            cloudName: string;
            apiKey: string;
            apiSecret: string;
        };
    };
    rateLimit: {
        ttl: number;
        limit: number;
    };
    logging: {
        level: string;
        file: string;
    };
    queue: {
        redis: {
            host: string;
            port: number;
            password: string;
        };
    };
    monitoring: {
        sentryDsn: string;
    };
    features: {
        enableRegistration: boolean;
        enableEmailVerification: boolean;
        enableSmsVerification: boolean;
        enableTwoFactorAuth: boolean;
        enableLoyaltyProgram: boolean;
        enableAffiliateSystem: boolean;
    };
};
export default _default;
