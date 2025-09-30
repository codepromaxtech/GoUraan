import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    enableShutdownHooks(app: any): Promise<void>;
    executeTransaction<T>(fn: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>) => Promise<T>): Promise<T>;
    softDelete(model: string, where: any): Promise<any>;
    isHealthy(): Promise<boolean>;
}
