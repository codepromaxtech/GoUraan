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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const config_1 = require("@nestjs/config");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    constructor(configService) {
        super({
            datasources: {
                db: {
                    url: configService.get('database.url'),
                },
            },
            log: [
                {
                    emit: 'event',
                    level: 'query',
                },
                {
                    emit: 'event',
                    level: 'error',
                },
                {
                    emit: 'event',
                    level: 'info',
                },
                {
                    emit: 'event',
                    level: 'warn',
                },
            ],
        });
        this.configService = configService;
        this.logger = new common_1.Logger(PrismaService_1.name);
        if (configService.get('app.environment') === 'development') {
            this.$on('query', (e) => {
                this.logger.debug(`Query: ${e.query}`);
                this.logger.debug(`Params: ${e.params}`);
                this.logger.debug(`Duration: ${e.duration}ms`);
            });
        }
        this.$on('error', (e) => {
            this.logger.error(e);
        });
        this.$on('info', (e) => {
            this.logger.log(e);
        });
        this.$on('warn', (e) => {
            this.logger.warn(e);
        });
    }
    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('✅ Database connected successfully');
        }
        catch (error) {
            this.logger.error('❌ Failed to connect to database', error);
            throw error;
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Database disconnected');
    }
    async enableShutdownHooks(app) {
        this.$on('beforeExit', async () => {
            await app.close();
        });
    }
    async executeTransaction(fn) {
        return this.$transaction(fn);
    }
    async softDelete(model, where) {
        return this[model].update({
            where,
            data: {
                deletedAt: new Date(),
                isActive: false,
            },
        });
    }
    async isHealthy() {
        try {
            await this.$queryRaw `SELECT 1`;
            return true;
        }
        catch {
            return false;
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map