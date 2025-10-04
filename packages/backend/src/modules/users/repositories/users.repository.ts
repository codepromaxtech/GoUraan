import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { BaseRepository } from '@/common/repositories/base.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    preferences: true;
    // Add other relations as needed
  };
}>;

@Injectable()
export class UsersRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
  protected readonly modelName = 'user';
  
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  async findByEmail(email: string): Promise<UserWithRelations | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        preferences: true,
        // Include other relations as needed
      },
    });
  }

  async isEmailTaken(email: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.UserWhereInput = { email };
    if (excludeId) {
      where.NOT = { id: excludeId };
    }
    const count = await this.prisma.user.count({ where });
    return count > 0;
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
  
  async updatePreferences(userId: string, updateData: any): Promise<any> {
    // Ensure required fields have default values if not provided
    const data = {
      ...updateData,
      language: updateData.language || 'EN',
      currency: updateData.currency || 'USD',
      timezone: updateData.timezone || 'UTC',
      emailNotifications: updateData.emailNotifications !== undefined ? updateData.emailNotifications : true,
      smsNotifications: updateData.smsNotifications !== undefined ? updateData.smsNotifications : false,
      pushNotifications: updateData.pushNotifications !== undefined ? updateData.pushNotifications : true,
      marketingEmails: updateData.marketingEmails !== undefined ? updateData.marketingEmails : true,
      specialAssistance: updateData.specialAssistance || [],
    };
    
    return this.prisma.userPreferences.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
  }
}
