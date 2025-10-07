import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DATABASE_CONFIG',
      useFactory: (configService: ConfigService) => ({
        url: configService.get('database.url'),
        shadowUrl: configService.get('database.shadowUrl'),
      }),
      inject: [ConfigService],
    },
  ],
  exports: ['DATABASE_CONFIG'],
})
export class DatabaseModule {}
