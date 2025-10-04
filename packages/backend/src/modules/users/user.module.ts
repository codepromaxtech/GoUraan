import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    {
      provide: 'IUserService',
      useClass: UserService,
    },
  ],
  exports: [
    UserService,
    UserRepository,
    'IUserService',
  ],
})
export class UserModule {}
