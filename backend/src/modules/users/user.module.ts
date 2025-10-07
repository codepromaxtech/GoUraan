import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { UsersRepository } from './repositories/users.repository';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [
    UserService,
    UsersRepository,
    {
      provide: 'IUserService',
      useClass: UserService,
    },
  ],
  exports: [
    UserService,
    UsersRepository,
    'IUserService',
  ],
})
export class UserModule {}
