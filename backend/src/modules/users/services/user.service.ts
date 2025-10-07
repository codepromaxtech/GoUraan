import { 
  Injectable, 
  ConflictException, 
  NotFoundException, 
  BadRequestException, 
  UnauthorizedException,
  Logger,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { UsersRepository, UserWithRelations } from '../repositories/users.repository';
import { BaseCrudService } from '@/common/services/base-crud.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateUserPreferencesDto } from '../dto/update-user-preferences.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import * as bcrypt from 'bcryptjs';
import { User, Prisma, UserRole, UserStatus } from '@prisma/client';
import { PaginationOptions, PaginatedResult } from '@/common/interfaces/pagination.interface';

// Using string token for AuthService to avoid circular dependency
const AUTH_SERVICE = 'AUTH_SERVICE';

export interface IUserService {
  // User CRUD operations
  create(createUserDto: CreateUserDto): Promise<User>;
  findAll(pagination: PaginationOptions, filters?: any): Promise<PaginatedResult<User>>;
  findOne(id: string): Promise<UserWithRelations>;
  update(id: string, updateUserDto: UpdateUserDto, currentUser?: User): Promise<User>;
  remove(id: string, currentUser?: User): Promise<void>;
  
  // User management
  findByEmail(email: string): Promise<UserWithRelations | null>;
  findById(id: string): Promise<UserWithRelations | null>;
  validateUser(email: string, password: string): Promise<User | null>;
  
  // Password management
  updatePassword(
    userId: string, 
    changePasswordDto: ChangePasswordDto, 
    currentUser?: User
  ): Promise<void>;
  
  // Preferences
  updatePreferences(
    userId: string, 
    updatePreferencesDto: UpdateUserPreferencesDto,
    currentUser?: User
  ): Promise<any>;
  
  // Admin operations
  updateStatus(id: string, status: UserStatus, currentUser: User): Promise<User>;
  updateRole(id: string, role: UserRole, currentUser: User): Promise<User>;
}

@Injectable()
export class UserService extends BaseCrudService<User, CreateUserDto, UpdateUserDto> implements IUserService {
  protected readonly modelName = 'user';
  protected readonly logger = new Logger(UserService.name);

  constructor(
    protected readonly usersRepository: UsersRepository,
    @Inject(forwardRef(() => AUTH_SERVICE))
    private readonly authService: any, // Using any to avoid circular dependency
  ) {
    super();
  }

  get repository() {
    return this.usersRepository;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, role = UserRole.CUSTOMER } = createUserDto;

    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with hashed password
    return this.usersRepository.createWithPassword(createUserDto, hashedPassword);
  }

  async findOne(id: string): Promise<UserWithRelations> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserWithRelations | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string): Promise<UserWithRelations | null> {
    return this.usersRepository.findById(id);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findByEmail(email, false);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result as User;
  }

  async updatePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
    currentUser?: User
  ): Promise<void> {
    // Check if current user is the same as the user being updated or is an admin
    if (currentUser && currentUser.id !== userId && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to update this user\'s password');
    }

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If current user is not an admin, verify the current password
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.usersRepository.updatePassword(userId, hashedPassword);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser?: User
  ): Promise<User> {
    // Check if user exists
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check permissions
    if (currentUser && currentUser.id !== id && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to update this user');
    }

    // Prevent role escalation
    if (updateUserDto.role && currentUser?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can change user roles');
    }

    // If email is being updated, check if it's already taken
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailTaken = await this.usersRepository.isEmailTaken(updateUserDto.email, id);
      if (emailTaken) {
        throw new ConflictException('Email is already in use');
      }
    }

    return this.usersRepository.update(id, updateUserDto);
  }

  async remove(id: string, currentUser?: User): Promise<void> {
    // Check if user exists
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check permissions
    if (currentUser && currentUser.id !== id && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this user');
    }

    // Prevent deleting the last admin
    if (user.role === UserRole.ADMIN) {
      const adminCount = await this.usersRepository.count({ role: UserRole.ADMIN });
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot delete the last admin');
      }
    }

    await this.usersRepository.remove(id);
  }

  async updatePreferences(
    userId: string,
    updatePreferencesDto: UpdateUserPreferencesDto,
    currentUser?: User
  ): Promise<any> {
    // Check permissions
    if (currentUser && currentUser.id !== userId && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to update these preferences');
    }

    return this.usersRepository.updatePreferences(userId, updatePreferencesDto);
  }

  async updateStatus(
    id: string,
    status: UserStatus,
    currentUser: User
  ): Promise<User> {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can update user status');
    }

    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Prevent deactivating the last admin
    if (
      status === UserStatus.INACTIVE &&
      user.role === UserRole.ADMIN
    ) {
      const adminCount = await this.usersRepository.count({ 
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        NOT: { id }
      });
      
      if (adminCount === 0) {
        throw new BadRequestException('Cannot deactivate the last active admin');
      }
    }

    return this.usersRepository.updateStatus(id, status);
  }

  async updateRole(
    id: string,
    role: UserRole,
    currentUser: User
  ): Promise<User> {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can update user roles');
    }

    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Prevent changing the role of the last admin
    if (user.role === UserRole.ADMIN) {
      const adminCount = await this.usersRepository.count({ role: UserRole.ADMIN });
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot change the role of the last admin');
      }
    }

    return this.usersRepository.updateRole(id, role);
  }

  async findAll(
    pagination: PaginationOptions = { page: 1, limit: 10 },
    filters: any = {}
  ): Promise<PaginatedResult<User>> {
    return this.usersRepository.findMany(filters, pagination);
  }
}

export const userServiceProvider = {
  provide: 'IUserService',
  useClass: UserService
};
