"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const cache_manager_1 = require("@nestjs/cache-manager");
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const path_1 = require("path");
const database_module_1 = require("./config/database.module");
const redis_module_1 = require("./config/redis.module");
const configuration_1 = require("./config/configuration");
const prisma_module_1 = require("./common/prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const bookings_module_1 = require("./modules/bookings/bookings.module");
const payments_module_1 = require("./modules/payments/payments.module");
const packages_module_1 = require("./modules/packages/packages.module");
const flights_module_1 = require("./modules/flights/flights.module");
const hotels_module_1 = require("./modules/hotels/hotels.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const documents_module_1 = require("./modules/documents/documents.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const wallet_module_1 = require("./modules/wallet/wallet.module");
const admin_module_1 = require("./modules/admin/admin.module");
const health_module_1 = require("./common/health/health.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
                envFilePath: ['.env.local', '.env'],
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            cache_manager_1.CacheModule.register({
                isGlobal: true,
                ttl: 300,
            }),
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                autoSchemaFile: (0, path_1.join)(process.cwd(), 'src/schema.gql'),
                sortSchema: true,
                playground: process.env.NODE_ENV !== 'production',
                introspection: process.env.NODE_ENV !== 'production',
                context: ({ req, res }) => ({ req, res }),
                formatError: (error) => {
                    return {
                        message: error.message,
                        code: error.extensions?.code,
                        path: error.path,
                    };
                },
            }),
            database_module_1.DatabaseModule,
            redis_module_1.RedisModule,
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            bookings_module_1.BookingsModule,
            payments_module_1.PaymentsModule,
            packages_module_1.PackagesModule,
            flights_module_1.FlightsModule,
            hotels_module_1.HotelsModule,
            notifications_module_1.NotificationsModule,
            documents_module_1.DocumentsModule,
            reviews_module_1.ReviewsModule,
            wallet_module_1.WalletModule,
            admin_module_1.AdminModule,
            health_module_1.HealthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map