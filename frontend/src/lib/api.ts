const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

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

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
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
    const url = `${this.baseUrl}${endpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
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
  async healthCheck(): Promise<any> {
    return this.request<any>('/health');
  }
}

export const api = new ApiClient();
export default api;
