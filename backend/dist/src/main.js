"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const compression = require("compression");
const helmet_1 = require("helmet");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const logger = new common_1.Logger('Bootstrap');
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));
    app.use(compression());
    app.enableCors({
        origin: [
            configService.get('FRONTEND_URL'),
            'http://localhost:3000',
            'https://gouraan.vercel.app',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    if (configService.get('NODE_ENV') !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('GoUraan API')
            .setDescription('Travel, Hajj & Booking Platform API')
            .setVersion('1.0')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
        }, 'JWT-auth')
            .addTag('auth', 'Authentication endpoints')
            .addTag('users', 'User management')
            .addTag('bookings', 'Booking management')
            .addTag('payments', 'Payment processing')
            .addTag('packages', 'Travel packages')
            .addTag('flights', 'Flight booking')
            .addTag('hotels', 'Hotel booking')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
            },
        });
        logger.log(`Swagger documentation available at: http://localhost:${configService.get('PORT')}/api/docs`);
    }
    const port = configService.get('PORT') || 3001;
    await app.listen(port);
    logger.log(`🚀 GoUraan API is running on: http://localhost:${port}`);
    logger.log(`📚 GraphQL Playground: http://localhost:${port}/graphql`);
}
bootstrap().catch((error) => {
    common_1.Logger.error('❌ Error starting server', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map