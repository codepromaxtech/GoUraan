// Use environment variable or default to local development URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Log API URL in development for debugging
if (process.env.NODE_ENV === 'development') {
  console.log(`[API] Using API URL: ${API_URL}`);
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export type UserRole = 'admin' | 'super_admin' | 'travel_agent' | 'finance_staff' | 'operations_staff' | 'support_staff' | 'customer';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  emailVerified: boolean;
  phoneNumber?: string;
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  users?: T[];
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Ensure endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${normalizedEndpoint}`;
    
    // Get auth token from localStorage if in browser environment
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      try {
        token = localStorage.getItem('accessToken');
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
    }

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile(): Promise<any> {
    return this.request<any>('/auth/me');
  }

  // User endpoints
  async getUserBookings(): Promise<any> {
    return this.request<any>('/users/bookings');
  }

  async updateProfile(data: any): Promise<any> {
    return this.request<any>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Bookings endpoints
  async getBookings(): Promise<any> {
    return this.request<any>('/bookings');
  }

  async createBooking(data: any): Promise<any> {
    return this.request<any>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBookingById(id: string): Promise<any> {
    return this.request<any>(`/bookings/${id}`);
  }

  async cancelBooking(id: string, reason?: string): Promise<any> {
    return this.request<any>(`/bookings/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }

  // User management
  async getUsers(params?: Record<string, any>): Promise<{ users: User[] }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<{ users: User[] }>(`/users${query}`);
  }

  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    return this.request<User>(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
  }

  async updateUserStatus(userId: string, status: User['status']): Promise<User> {
    return this.request<User>(`/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
}

export const api = new ApiClient();
export default api;
