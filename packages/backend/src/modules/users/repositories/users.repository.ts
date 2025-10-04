import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { BaseRepository } from '@/common/repositories/base.repository';

@Injectable()
export class UsersRepository extends BaseRepository<'User'> {
  constructor(prisma: PrismaService) {
    super(prisma, 'User');
  }

  async findByEmail(email: string) {
    return this.findOne({ email });
  }

  async isEmailTaken(email: string, excludeId?: string) {
    const where: any = { email };
    if (excludeId) {
      where.NOT = { id: excludeId };
    }
    return this.exists(where);
  }

  async updatePassword(userId: string, hashedPassword: string) {
    return this.update(userId, { password: hashedPassword });
  }
}
