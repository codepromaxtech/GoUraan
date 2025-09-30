import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
import { AuthResponse } from './interfaces';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<AuthResponse>;
    login(loginDto: LoginDto): Promise<AuthResponse>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse>;
    logout(user: any, req: any): Promise<{
        message: string;
    }>;
    logoutAll(user: any): Promise<{
        message: string;
    }>;
    getProfile(user: any): Promise<any>;
}
