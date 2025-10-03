import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

// GraphQL Types (these would typically be in separate files)
import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { UserRole, UserStatus } from '@prisma/client';

@ObjectType()
export class AuthUserType {
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
}

@ObjectType()
export class AuthResponseType {
  @Field(() => AuthUserType)
  user: AuthUserType;

  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field()
  tokenType: string;

  @Field()
  expiresIn: string;
}

@InputType()
export class RegisterInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  role?: UserRole;
}

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class RefreshTokenInput {
  @Field()
  refreshToken: string;
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponseType)
  async register(@Args('input') input: RegisterInput): Promise<AuthResponseType> {
    return this.authService.register(input as RegisterDto);
  }

  @Mutation(() => AuthResponseType)
  async login(@Args('input') input: LoginInput): Promise<AuthResponseType> {
    return this.authService.login(input as LoginDto);
  }

  @Mutation(() => AuthResponseType)
  async refreshToken(@Args('input') input: RefreshTokenInput): Promise<AuthResponseType> {
    return this.authService.refreshToken(input as RefreshTokenDto);
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: any): Promise<string> {
    await this.authService.logoutAll(user.id);
    return 'Successfully logged out';
  }

  @Query(() => AuthUserType)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: any): Promise<AuthUserType> {
    return user;
  }
}
