import { Injectable, ConflictException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { BaseCrudService } from '@/common/services/base-crud.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateUserPreferencesDto } from '../dto/update-preferences.dto';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '@prisma/client';

export interface IUserService {
  create(createUserDto: CreateUserDto): Promise<User>;
  findAll(options: any): Promise<{ data: User[]; meta: any }>;
  findOne(id: string): Promise<User>;
  update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
  remove(id: string): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  validateUser(email: string, password: string): Promise<User | null>;
  updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
  updatePreferences(userId: string, updatePreferencesDto: UpdateUserPreferencesDto): Promise<any>;
}

@Injectable()
export class UserService extends BaseCrudService<User, CreateUserDto, UpdateUserDto> implements IUserService {
  protected readonly logger = new Logger(UserService.name);
  
  constructor(
    private readonly usersRepository: UsersRepository,
  ) {
    super();
  }
  
  protected get repository() {
    return this.usersRepository;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, ...rest } = createUserDto;

    // Check if email is already taken
    const emailExists = await this.usersRepository.isEmailTaken(email);
    if (emailExists) {
      throw new ConflictException('Email already in use');
    }

    // Hash the password
    const hashedPassword = await this.hashPassword(password);

    // Create the user
    return this.usersRepository.create({
      ...rest,
      email,
      password: hashedPassword,
      emailVerified: false, // Default to false, verify via email
      role: rest.role || UserRole.CUSTOMER,
      status: rest.status || UserStatus.ACTIVE,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const { email, password, ...rest } = updateUserDto;
    
    // If email is being updated, check if it's already taken
    if (email) {
      const emailExists = await this.usersRepository.isEmailTaken(email, id);
      if (emailExists) {
        throw new ConflictException('Email already in use');
      }
    }
    
    // If password is being updated, hash it first
    const updateData = { ...rest };
    if (password) {
      updateData.password = await this.hashPassword(password);
    }
    if (email) {
      updateData.email = email;
    }
    
    return super.update(id, updateData as UpdateUserDto);
  }
  
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }
  
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    
    return user;
  }
  
  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }
    
    const hashedPassword = await this.hashPassword(newPassword);
    await this.usersRepository.updatePassword(userId, hashedPassword);
  }
  
  async updatePreferences(userId: string, updatePreferencesDto: UpdateUserPreferencesDto): Promise<any> {
    // Map DTO to Prisma model fields
    const updateData: any = { ...updatePreferencesDto };
    
    try {
      // First, check if the user exists
      const user = await this.usersRepository.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      // Use the repository to update preferences
      const preferences = await this.usersRepository.updatePreferences(userId, updateData);
      
      this.logger.log(`User preferences updated for user: ${userId}`);
      return preferences;
    } catch (error) {
      this.logger.error(`Error updating preferences for user ${userId}`, error.stack);
      throw error;
    }
  }
  
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  private async comparePasswords(plainText: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }
}

export const userServiceProvider = {
  provide: 'IUserService',
  useClass: UserService,
};
