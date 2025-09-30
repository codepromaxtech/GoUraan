import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma/prisma.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
import { JwtPayload, AuthResponse } from './interfaces';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<AuthResponse>;
    login(loginDto: LoginDto): Promise<AuthResponse>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse>;
    logout(userId: string, token: string): Promise<void>;
    logoutAll(userId: string): Promise<void>;
    validateUser(email: string, password: string): Promise<any>;
    validateJwtPayload(payload: JwtPayload): Promise<any>;
    private generateTokens;
    private createSession;
}
