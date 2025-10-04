import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { BaseService } from '@/common/base/service.base';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcrypt';

type User = any; // Replace with your Prisma User type

export interface IUserService {
  create(createUserDto: CreateUserDto): Promise<User>;
  findAll(options: any): Promise<{ data: User[]; meta: any }>;
  findOne(id: string): Promise<User>;
  update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
  remove(id: string): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  validateUser(email: string, password: string): Promise<User | null>;
  updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
}

@Injectable()
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> implements IUserService {
  constructor(
    protected readonly userRepository: UserRepository,
  ) {
    super(userRepository);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, ...rest } = createUserDto;

    // Check if email is already taken
    const emailExists = await this.userRepository.isEmailTaken(email);
    if (emailExists) {
      throw new ConflictException('Email already in use');
    }

    // Hash the password
    const hashedPassword = await this.hashPassword(password);

    // Create the user
    return this.userRepository.create({
      ...rest,
      email,
      password: hashedPassword,
      emailVerified: false, // Default to false, verify via email
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const { email, ...rest } = updateUserDto;

    if (email) {
      // Check if new email is already taken by another user
      const emailExists = await this.userRepository.isEmailTaken(email, id);
      if (emailExists) {
        throw new ConflictException('Email already in use');
      }
    }

    return this.userRepository.update(id, {
      ...rest,
      ...(email && { email }),
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result as User;
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await this.comparePasswords(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await this.userRepository.updatePassword(userId, hashedPassword);
  }

  // Helper methods
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private async comparePasswords(plainText: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }
}

export const userServiceProvider = {
  provide: 'IUserService',
  useClass: UserService,
};
