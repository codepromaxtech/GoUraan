import { 
  BadRequestException, 
  ConflictException, 
  Injectable, 
  Logger, 
  NotFoundException 
} from '@nestjs/common';
import { User, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { BaseCrudService } from '@/common/services/base-crud.service';
import { UsersRepository } from './repositories/users.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';

@Injectable()
export class UsersService extends BaseCrudService<User, CreateUserDto, UpdateUserDto> {
  protected readonly modelName = 'User';
  
  constructor(
    protected readonly usersRepository: UsersRepository,
    private readonly prisma: PrismaService,
  ) {
    super();
  }
  
  get repository() {
    return this.usersRepository;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        loyaltyPoints: true,
        createdAt: true,
        updatedAt: true,
        preferences: true,
        wallet: {
          select: {
            id: true,
            balance: true,
            currency: true,
            isActive: true,
          },
        },
        agentProfile: {
          select: {
            id: true,
            companyName: true,
            commissionRate: true,
            totalSales: true,
            totalCommission: true,
            isVerified: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        loyaltyPoints: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    const { email, phone, ...updateData } = updateUserDto;

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new BadRequestException('Email is already taken');
      }
    }

    // Check if phone is being changed and if it's already taken
    if (phone) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          phone,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new BadRequestException('Phone number is already taken');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        email,
        phone,
        // Reset verification if email or phone changed
        ...(email && { emailVerified: false }),
        ...(phone && { phoneVerified: false }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        loyaltyPoints: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`User profile updated: ${updatedUser.email}`);
    return updatedUser;
  }

  async updatePreferences(userId: string, updatePreferencesDto: UpdateUserPreferencesDto) {
    // Map DTO to Prisma model fields
    const updateData: any = { ...updatePreferencesDto };
    
    // Handle special cases or transformations if needed
    // For example, if you need to handle nested objects or arrays
    
    const preferences = await this.prisma.userPreferences.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData,
        // Ensure required fields have default values if not provided
        language: updateData.language || 'EN',
        currency: updateData.currency || 'USD',
        timezone: updateData.timezone || 'UTC',
        emailNotifications: updateData.emailNotifications !== undefined ? updateData.emailNotifications : true,
        smsNotifications: updateData.smsNotifications !== undefined ? updateData.smsNotifications : false,
        pushNotifications: updateData.pushNotifications !== undefined ? updateData.pushNotifications : true,
        marketingEmails: updateData.marketingEmails !== undefined ? updateData.marketingEmails : true,
        specialAssistance: updateData.specialAssistance || [],
      },
    });

    this.logger.log(`User preferences updated for user: ${userId}`);
    return preferences;
  }

  async getBookingHistory(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          status: true,
          reference: true,
          totalAmount: true,
          currency: true,
          paymentStatus: true,
          createdAt: true,
          updatedAt: true,
          confirmedAt: true,
          bookingData: true,
        },
      }),
      this.prisma.booking.count({
        where: { userId },
      }),
    ]);

    return {
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getWalletTransactions(userId: string, page = 1, limit = 10) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const totalTransactions = await this.prisma.walletTransaction.count({
      where: { walletId: wallet.id },
    });

    return {
      wallet: {
        id: wallet.id,
        balance: wallet.balance,
        currency: wallet.currency,
        isActive: wallet.isActive,
      },
      transactions: wallet.transactions,
      pagination: {
        total: totalTransactions,
        page,
        limit,
        totalPages: Math.ceil(totalTransactions / limit),
      },
    };
  }

  async getLoyaltyTransactions(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.loyaltyTransaction.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.loyaltyTransaction.count({
        where: { userId },
      }),
    ]);

    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserStats(userId: string) {
    const [
      totalBookings,
      completedBookings,
      totalSpent,
      loyaltyPoints,
      walletBalance,
    ] = await Promise.all([
      this.prisma.booking.count({
        where: { userId },
      }),
      this.prisma.booking.count({
        where: {
          userId,
          status: 'COMPLETED',
        },
      }),
      this.prisma.booking.aggregate({
        where: {
          userId,
          paymentStatus: 'PAID',
        },
        _sum: {
          totalAmount: true,
        },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { loyaltyPoints: true },
      }),
      this.prisma.wallet.findUnique({
        where: { userId },
        select: { balance: true, currency: true },
      }),
    ]);

    return {
      totalBookings,
      completedBookings,
      totalSpent: totalSpent._sum.totalAmount || 0,
      loyaltyPoints: loyaltyPoints?.loyaltyPoints || 0,
      walletBalance: walletBalance?.balance || 0,
      walletCurrency: walletBalance?.currency || 'USD',
    };
  }

  async deactivateAccount(userId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.INACTIVE,
      },
      select: {
        id: true,
        email: true,
        status: true,
      },
    });

    // Deactivate all sessions
    await this.prisma.userSession.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    this.logger.log(`User account deactivated: ${user.email}`);
    return user;
  }

  async reactivateAccount(userId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        email: true,
        status: true,
      },
    });

    this.logger.log(`User account reactivated: ${user.email}`);
    return user;
  }

  // Admin functions
  async getAllUsers(page = 1, limit = 10, filters?: any) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          emailVerified: true,
          phoneVerified: true,
          loyaltyPoints: true,
          createdAt: true,
          lastLoginAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserStatus(userId: string, status: UserStatus) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });

    this.logger.log(`User status updated: ${user.email} -> ${status}`);
    return user;
  }
}
