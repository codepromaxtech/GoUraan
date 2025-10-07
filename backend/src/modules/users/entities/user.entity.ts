import { UserRole, UserStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({ description: 'Unique identifier for the user' })
  id: string;

  @ApiProperty({ description: 'User\'s email address', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'User\'s first name', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'User\'s last name', example: 'Doe' })
  lastName: string;

  @ApiProperty({ description: 'User\'s phone number', example: '+1234567890', required: false })
  phoneNumber?: string;

  @ApiProperty({ enum: UserRole, description: 'User\'s role in the system' })
  role: UserRole;

  @ApiProperty({ enum: UserStatus, description: 'User\'s account status' })
  status: UserStatus;

  @ApiProperty({ description: 'Whether the user\'s email is verified', default: false })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Date when the user was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the user was last updated' })
  updatedAt: Date;

  @ApiProperty({ description: 'Date of the last login', required: false })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'IP address of the last login', required: false })
  lastLoginIp?: string;

  @ApiProperty({ description: 'User\'s profile image URL', required: false })
  profileImage?: string;

  @ApiProperty({ description: 'User\'s timezone', example: 'Asia/Dhaka', required: false })
  timezone?: string;

  @ApiProperty({ description: 'User\'s preferred language', example: 'en', required: false })
  preferredLanguage?: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
