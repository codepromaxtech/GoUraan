import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, BookingType as PrismaBookingType, BookingStatus, PaymentStatus } from '@prisma/client';

// GraphQL Types
import { ObjectType, Field, InputType } from '@nestjs/graphql';

@ObjectType()
export class BookingGQLType {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field(() => String)
  type: PrismaBookingType;

  @Field(() => String)
  status: BookingStatus;

  @Field()
  reference: string;

  @Field()
  totalAmount: number;

  @Field()
  currency: string;

  @Field(() => String)
  paymentStatus: PaymentStatus;

  @Field(() => String)
  bookingData: any;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field({ nullable: true })
  confirmedAt?: Date;

  @Field({ nullable: true })
  cancelledAt?: Date;
}

@ObjectType()
export class BookingStatsType {
  @Field()
  totalBookings: number;

  @Field()
  pendingBookings: number;

  @Field()
  confirmedBookings: number;

  @Field()
  completedBookings: number;

  @Field()
  cancelledBookings: number;

  @Field()
  totalRevenue: number;
}

@InputType()
export class CreateBookingInput {
  @Field(() => String)
  type: PrismaBookingType;

  @Field()
  totalAmount: number;

  @Field({ nullable: true })
  currency?: string;

  @Field(() => String)
  bookingData: any;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class UpdateBookingInput {
  @Field(() => String, { nullable: true })
  status?: BookingStatus;

  @Field(() => String, { nullable: true })
  paymentStatus?: PaymentStatus;

  @Field({ nullable: true })
  totalAmount?: number;

  @Field(() => String, { nullable: true })
  bookingData?: any;

  @Field({ nullable: true })
  notes?: string;
}

@Resolver(() => BookingGQLType)
export class BookingsResolver {
  constructor(private readonly bookingsService: BookingsService) {}

  @Mutation(() => BookingGQLType)
  @UseGuards(JwtAuthGuard)
  async createBooking(
    @CurrentUser() user: any,
    @Args('input') input: CreateBookingInput,
  ): Promise<BookingGQLType> {
    return this.bookingsService.createBooking(user.id, input as CreateBookingDto);
  }

  @Query(() => [BookingGQLType])
  @UseGuards(JwtAuthGuard)
  async myBookings(
    @CurrentUser() user: any,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ) {
    const result = await this.bookingsService.getUserBookings(user.id, page, limit);
    return result.bookings;
  }

  @Query(() => BookingGQLType)
  @UseGuards(JwtAuthGuard)
  async booking(
    @CurrentUser() user: any,
    @Args('id') id: string,
  ): Promise<BookingGQLType> {
    return this.bookingsService.findById(id, user.id);
  }

  @Query(() => BookingGQLType)
  @UseGuards(JwtAuthGuard)
  async bookingByReference(
    @CurrentUser() user: any,
    @Args('reference') reference: string,
  ): Promise<BookingGQLType> {
    return this.bookingsService.findByReference(reference, user.id);
  }

  @Mutation(() => BookingGQLType)
  @UseGuards(JwtAuthGuard)
  async updateBooking(
    @CurrentUser() user: any,
    @Args('id') id: string,
    @Args('input') input: UpdateBookingInput,
  ): Promise<BookingGQLType> {
    return this.bookingsService.updateBooking(id, input as UpdateBookingDto, user.id);
  }

  @Mutation(() => BookingGQLType)
  @UseGuards(JwtAuthGuard)
  async confirmBooking(
    @CurrentUser() user: any,
    @Args('id') id: string,
  ): Promise<BookingGQLType> {
    return this.bookingsService.confirmBooking(id, user.id);
  }

  @Mutation(() => BookingGQLType)
  @UseGuards(JwtAuthGuard)
  async cancelBooking(
    @CurrentUser() user: any,
    @Args('id') id: string,
    @Args('reason', { nullable: true }) reason?: string,
  ): Promise<BookingGQLType> {
    return this.bookingsService.cancelBooking(id, reason, user.id);
  }

  @Query(() => BookingStatsType)
  @UseGuards(JwtAuthGuard)
  async myBookingStats(@CurrentUser() user: any): Promise<BookingStatsType> {
    return this.bookingsService.getBookingStats(user.id);
  }

  // Admin queries
  @Query(() => [BookingGQLType])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_OPERATIONS, UserRole.STAFF_SUPPORT)
  async allBookings(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ) {
    const result = await this.bookingsService.getAllBookings(page, limit);
    return result.bookings;
  }

  @Query(() => BookingStatsType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_OPERATIONS)
  async bookingStats(): Promise<BookingStatsType> {
    return this.bookingsService.getBookingStats();
  }
}
