import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, User, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { BaseRepository } from '@/common/repositories/base.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateUserPreferencesDto } from '../dto/update-user-preferences.dto';
import * as bcrypt from 'bcryptjs';
import { PaginationOptions, PaginatedResult } from '@/common/interfaces/pagination.interface';

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    preferences: true;
  };
}>;

@Injectable()
export class UsersRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
  protected readonly modelName = 'user';
  private readonly logger: Logger;
  
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger = new Logger(UsersRepository.name);
  }

  async findByEmail(email: string, includeRelations = true): Promise<UserWithRelations | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
        include: includeRelations ? { preferences: true } : undefined,
      });
    } catch (error) {
      this.logger.error(`Error finding user by email: ${email}`, error.stack);
      throw error;
    }
  }

  async findById(id: string): Promise<UserWithRelations | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
        include: { preferences: true },
      });
    } catch (error) {
      this.logger.error(`Error finding user by id: ${id}`, error.stack);
      throw error;
    }
  }

  async findOneOrFail(
    where: Prisma.UserWhereUniqueInput,
    include: Prisma.UserInclude = { preferences: true }
  ): Promise<UserWithRelations> {
    const user = await this.prisma.user.findUnique({
      where,
      include,
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user as UserWithRelations;
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

  async updatePreferences(
    userId: string,
    updateData: UpdateUserPreferencesDto
  ): Promise<any> {
    return this.prisma.userPreferences.upsert({
      where: { userId },
      update: updateData,
      create: {
        ...updateData,
        user: { connect: { id: userId } },
      },
    });
  }

  async updateStatus(userId: string, status: UserStatus): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });
  }

  async updateRole(userId: string, role: UserRole): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  // For paginated queries
  async findMany(
    where: Prisma.UserWhereInput = {},
    options: PaginationOptions = { page: 1, limit: 10 },
    include: Prisma.UserInclude = { preferences: true }
  ): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 10, orderBy } = options;
    const skip = (page - 1) * limit;
    const take = limit > 100 ? 100 : limit;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include,
        skip,
        take,
        orderBy: orderBy || { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / take);

    return {
      data,
      meta: {
        total,
        page,
        limit: take,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // For non-paginated queries
  async findManyRaw(
    where: Prisma.UserWhereInput = {},
    include: Prisma.UserInclude = { preferences: true },
    skip?: number,
    take?: number,
    orderBy?: Prisma.UserOrderByWithAggregationInput
  ): Promise<UserWithRelations[]> {
    return this.prisma.user.findMany({
      where,
      include,
      skip,
      take,
      orderBy,
    });
  }

  async createWithPassword(createUserDto: CreateUserDto, hashedPassword: string): Promise<User> {
    const { password, ...userData } = createUserDto;
    
    return this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        preferences: {
          create: {
            language: 'en',
            timezone: 'UTC',
            emailNotifications: true,
            pushNotifications: true,
          },
        },
      },
    });
  }
}
