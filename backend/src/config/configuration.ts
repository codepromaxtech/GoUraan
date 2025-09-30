export default () => ({
  // Application
  app: {
    name: process.env.APP_NAME || 'GoUraan API',
    port: parseInt(process.env.PORT, 10) || 3001,
    environment: process.env.NODE_ENV || 'development',
    url: process.env.APP_URL || 'http://localhost:3001',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },

  // Database
  database: {
    url: process.env.DATABASE_URL,
    shadowUrl: process.env.SHADOW_DATABASE_URL,
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // Encryption
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key',
  },

  // Email
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
    from: {
      email: process.env.FROM_EMAIL || 'noreply@gouraan.com',
      name: process.env.FROM_NAME || 'GoUraan',
    },
  },

  // Payment Gateways
  payments: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET,
      mode: process.env.PAYPAL_MODE || 'sandbox',
    },
    sslcommerz: {
      storeId: process.env.SSLCOMMERZ_STORE_ID,
      storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD,
      isLive: process.env.SSLCOMMERZ_IS_LIVE === 'true',
    },
    hyperpay: {
      userId: process.env.HYPERPAY_USER_ID,
      password: process.env.HYPERPAY_PASSWORD,
      entityId: process.env.HYPERPAY_ENTITY_ID,
      isLive: process.env.HYPERPAY_IS_LIVE === 'true',
    },
  },

  // External APIs
  apis: {
    amadeus: {
      apiKey: process.env.AMADEUS_API_KEY,
      apiSecret: process.env.AMADEUS_API_SECRET,
      baseUrl: process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com',
    },
    googleMaps: {
      apiKey: process.env.GOOGLE_MAPS_API_KEY,
    },
  },

  // File Storage
  storage: {
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.AWS_S3_BUCKET || 'gouraan-files',
    },
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
  },

  // Rate Limiting
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
    limit: parseInt(process.env.RATE_LIMIT_LIMIT, 10) || 100,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },

  // Queue/Jobs
  queue: {
    redis: {
      host: process.env.BULL_REDIS_HOST || 'localhost',
      port: parseInt(process.env.BULL_REDIS_PORT, 10) || 6379,
      password: process.env.BULL_REDIS_PASSWORD || undefined,
    },
  },

  // Monitoring
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
  },

  // Feature Flags
  features: {
    enableRegistration: process.env.ENABLE_REGISTRATION === 'true',
    enableEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
    enableSmsVerification: process.env.ENABLE_SMS_VERIFICATION === 'true',
    enableTwoFactorAuth: process.env.ENABLE_TWO_FACTOR_AUTH === 'true',
    enableLoyaltyProgram: process.env.ENABLE_LOYALTY_PROGRAM === 'true',
    enableAffiliateSystem: process.env.ENABLE_AFFILIATE_SYSTEM === 'true',
  },
});
