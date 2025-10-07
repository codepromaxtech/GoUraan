export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  role: 'admin' | 'user' | 'support';
  image?: string | null;
  emailVerified?: Date | null;
}

export interface Session {
  user: User;
  expires: string;
  accessToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  expiresIn: number;
}
