import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { SupportGateway } from './support.gateway';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { WsJwtGuard } from '@/common/guards/ws-jwt.guard';
import { EmailModule } from '@/modules/email/email.module';
import { MessagesController } from './messages/messages.controller';
import { EmailController } from './email/email.controller';

@Module({
  imports: [
    PrismaModule, 
    forwardRef(() => AuthModule),
    EmailModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    SupportController, 
    MessagesController, 
    EmailController
  ],
  providers: [
    SupportService, 
    SupportGateway,
    WsJwtGuard,
    {
      provide: 'SUPPORT_EMAIL',
      useValue: process.env.SUPPORT_EMAIL || 'support@yourdomain.com',
    },
  ],
  exports: [SupportService],
})
export class SupportModule {}
