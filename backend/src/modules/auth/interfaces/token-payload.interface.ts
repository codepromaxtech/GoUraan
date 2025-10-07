import { UserRole } from '@prisma/client';

export interface TokenPayload {
  /**
   * Subject (user ID)
   */
  sub: string;
  
  /**
   * User's email
   */
  email: string;
  
  /**
   * User's role
   */
  role: UserRole;
  
  /**
   * Issued at (timestamp)
   */
  iat?: number;
  
  /**
   * Expiration time (timestamp)
   */
  exp?: number;
}

export interface RefreshTokenPayload extends TokenPayload {
  /**
   * Token type (refresh)
   */
  type: 'refresh';
}

export interface AccessTokenPayload extends TokenPayload {
  /**
   * Token type (access)
   */
  type: 'access';
}
