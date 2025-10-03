export interface UserSession {
  id: string;
  userId: string;
  token: string;
  refreshToken?: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export interface CreateSessionDto {
  email: string;
  password: string;
  deviceInfo?: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
}
