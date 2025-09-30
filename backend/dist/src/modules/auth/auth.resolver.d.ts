import { AuthService } from './auth.service';
import { UserRole, UserStatus } from '@prisma/client';
export declare class AuthUserType {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    status: UserStatus;
    emailVerified: boolean;
    phoneVerified: boolean;
    loyaltyPoints: number;
    createdAt: Date;
}
export declare class AuthResponseType {
    user: AuthUserType;
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: string;
}
export declare class RegisterInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: UserRole;
}
export declare class LoginInput {
    email: string;
    password: string;
}
export declare class RefreshTokenInput {
    refreshToken: string;
}
export declare class AuthResolver {
    private readonly authService;
    constructor(authService: AuthService);
    register(input: RegisterInput): Promise<AuthResponseType>;
    login(input: LoginInput): Promise<AuthResponseType>;
    refreshToken(input: RefreshTokenInput): Promise<AuthResponseType>;
    logout(user: any): Promise<string>;
    me(user: any): Promise<AuthUserType>;
}
