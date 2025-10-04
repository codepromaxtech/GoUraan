import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { BaseRepository } from '@/common/base/repository.base';

@Injectable()
export class UserRepository extends BaseRepository {
  modelName = 'user';

  constructor(protected prisma: PrismaService) {
    super(prisma);
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
