"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async register(registerDto) {
        const { email, password, firstName, lastName, phone, role = client_1.UserRole.CUSTOMER } = registerDto;
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ email }, { phone: phone || undefined }],
            },
        });
        if (existingUser) {
            if (existingUser.email === email) {
                throw new common_1.ConflictException('User with this email already exists');
            }
            if (existingUser.phone === phone) {
                throw new common_1.ConflictException('User with this phone number already exists');
            }
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        try {
            const result = await this.prisma.$transaction(async (prisma) => {
                const user = await prisma.user.create({
                    data: {
                        email,
                        password: hashedPassword,
                        firstName,
                        lastName,
                        phone,
                        role,
                        status: client_1.UserStatus.PENDING_VERIFICATION,
                    },
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        role: true,
                        status: true,
                        emailVerified: true,
                        phoneVerified: true,
                        loyaltyPoints: true,
                        createdAt: true,
                    },
                });
                await prisma.userPreferences.create({
                    data: {
                        userId: user.id,
                    },
                });
                if (role === client_1.UserRole.CUSTOMER) {
                    await prisma.wallet.create({
                        data: {
                            userId: user.id,
                        },
                    });
                }
                return user;
            });
            const tokens = await this.generateTokens(result);
            await this.createSession(result.id, tokens.accessToken, tokens.refreshToken);
            this.logger.log(`New user registered: ${result.email}`);
            return {
                user: result,
                ...tokens,
            };
        }
        catch (error) {
            this.logger.error('Registration failed', error);
            throw new common_1.BadRequestException('Registration failed');
        }
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                status: true,
                emailVerified: true,
                phoneVerified: true,
                loyaltyPoints: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status === client_1.UserStatus.SUSPENDED) {
            throw new common_1.UnauthorizedException('Account is suspended');
        }
        if (user.status === client_1.UserStatus.INACTIVE) {
            throw new common_1.UnauthorizedException('Account is inactive');
        }
        const tokens = await this.generateTokens(user);
        await this.createSession(user.id, tokens.accessToken, tokens.refreshToken);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        const { password: _, ...userWithoutPassword } = user;
        this.logger.log(`User logged in: ${user.email}`);
        return {
            user: userWithoutPassword,
            ...tokens,
        };
    }
    async refreshToken(refreshTokenDto) {
        const { refreshToken } = refreshTokenDto;
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('jwt.refreshSecret'),
            });
            const session = await this.prisma.userSession.findUnique({
                where: { refreshToken },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                            role: true,
                            status: true,
                            emailVerified: true,
                            phoneVerified: true,
                            loyaltyPoints: true,
                            createdAt: true,
                        },
                    },
                },
            });
            if (!session || !session.isActive) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            if (session.user.status === client_1.UserStatus.SUSPENDED) {
                throw new common_1.UnauthorizedException('Account is suspended');
            }
            const tokens = await this.generateTokens(session.user);
            await this.prisma.userSession.update({
                where: { id: session.id },
                data: {
                    token: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });
            return {
                user: session.user,
                ...tokens,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId, token) {
        await this.prisma.userSession.updateMany({
            where: {
                userId,
                token,
            },
            data: {
                isActive: false,
            },
        });
        this.logger.log(`User logged out: ${userId}`);
    }
    async logoutAll(userId) {
        await this.prisma.userSession.updateMany({
            where: { userId },
            data: { isActive: false },
        });
        this.logger.log(`All sessions logged out for user: ${userId}`);
    }
    async validateUser(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                firstName: true,
                lastName: true,
                role: true,
                status: true,
            },
        });
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password: _, ...result } = user;
            return result;
        }
        return null;
    }
    async validateJwtPayload(payload) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                status: true,
                emailVerified: true,
                phoneVerified: true,
            },
        });
        if (!user || user.status === client_1.UserStatus.SUSPENDED) {
            return null;
        }
        return user;
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('jwt.secret'),
                expiresIn: this.configService.get('jwt.expiresIn'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('jwt.refreshSecret'),
                expiresIn: this.configService.get('jwt.refreshExpiresIn'),
            }),
        ]);
        return {
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: this.configService.get('jwt.expiresIn'),
        };
    }
    async createSession(userId, token, refreshToken, deviceInfo, ipAddress, userAgent) {
        return this.prisma.userSession.create({
            data: {
                userId,
                token,
                refreshToken,
                deviceInfo,
                ipAddress,
                userAgent,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map