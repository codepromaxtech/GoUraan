import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, UpdateUserPreferencesDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, UserStatus } from '@prisma/client';

// GraphQL Types
import { ObjectType, Field, InputType } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field(() => String)
  role: UserRole;

  @Field(() => String)
  status: UserStatus;

  @Field()
  emailVerified: boolean;

  @Field()
  phoneVerified: boolean;

  @Field()
  loyaltyPoints: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class UserStatsType {
  @Field()
  totalBookings: number;

  @Field()
  completedBookings: number;

  @Field()
  totalSpent: number;

  @Field()
  loyaltyPoints: number;

  @Field()
  walletBalance: number;

  @Field()
  walletCurrency: string;
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  avatar?: string;
}

@InputType()
export class UpdateUserPreferencesInput {
  @Field({ nullable: true })
  language?: string;

  @Field({ nullable: true })
  currency?: string;

  @Field({ nullable: true })
  timezone?: string;

  @Field({ nullable: true })
  emailNotifications?: boolean;

  @Field({ nullable: true })
  smsNotifications?: boolean;

  @Field({ nullable: true })
  pushNotifications?: boolean;

  @Field({ nullable: true })
  marketingEmails?: boolean;

  @Field({ nullable: true })
  seatPreference?: string;

  @Field({ nullable: true })
  mealPreference?: string;

  @Field(() => [String], { nullable: true })
  specialAssistance?: string[];
}

@Resolver(() => UserType)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => UserType)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: any): Promise<UserType> {
    return this.usersService.findById(user.id);
  }

  @Mutation(() => UserType)
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: any,
    @Args('input') input: UpdateUserInput,
  ): Promise<UserType> {
    return this.usersService.updateProfile(user.id, input as UpdateUserDto);
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async updatePreferences(
    @CurrentUser() user: any,
    @Args('input') input: UpdateUserPreferencesInput,
  ): Promise<string> {
    await this.usersService.updatePreferences(user.id, input as UpdateUserPreferencesDto);
    return 'Preferences updated successfully';
  }

  @Query(() => UserStatsType)
  @UseGuards(JwtAuthGuard)
  async userStats(@CurrentUser() user: any): Promise<UserStatsType> {
    return this.usersService.getUserStats(user.id);
  }

  @Mutation(() => UserType)
  @UseGuards(JwtAuthGuard)
  async deactivateAccount(@CurrentUser() user: any): Promise<UserType> {
    return this.usersService.deactivateAccount(user.id);
  }

  // Admin queries
  @Query(() => UserType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_SUPPORT)
  async user(@Args('id') id: string): Promise<UserType> {
    return this.usersService.findById(id);
  }

  @Mutation(() => UserType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateUserStatus(
    @Args('id') id: string,
    @Args('status') status: UserStatus,
  ): Promise<UserType> {
    return this.usersService.updateUserStatus(id, status);
  }
}
