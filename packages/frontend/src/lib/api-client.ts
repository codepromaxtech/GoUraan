import { env } from '@/env.mjs';

const API_BASE_URL = env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  // Add auth token if available
  // Note: In a real app, you might want to use NextAuth's getSession()
  // or a similar method to get the token
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Important for cookies
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Something went wrong');
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Analytics API
export const analyticsApi = {
  getOverview: (params?: Record<string, string>) =>
    apiClient<AnalyticsOverview>('/analytics/overview', { params }),
  
  getBookings: (params?: Record<string, string>) =>
    apiClient<BookingMetrics>('/analytics/bookings', { params }),
    
  getRevenue: (params?: Record<string, string>) =>
    apiClient<RevenueMetrics>('/analytics/revenue', { params }),
    
  getUsers: (params?: Record<string, string>) =>
    apiClient<UserMetrics>('/analytics/users', { params }),
    
  getConversions: (params?: Record<string, string>) =>
    apiClient<ConversionMetrics>('/analytics/conversions', { params }),
    
  getPlatformStats: (params?: Record<string, string>) =>
    apiClient<PlatformStats>('/analytics/platform', { params }),
    
  getPerformance: (params?: Record<string, string>) =>
    apiClient<PerformanceMetrics>('/analytics/performance', { params }),
    
  getPopularDestinations: (limit = 5) =>
    apiClient<PopularDestination[]>(`/analytics/destinations/popular?limit=${limit}`),
    
  getRecentActivity: (params?: Record<string, string>) =>
    apiClient<{ data: RecentActivity[]; total: number }>('/analytics/activity/recent', { params }),
};

// Re-export types for convenience
export type {
  AnalyticsOverview,
  BookingMetrics,
  RevenueMetrics,
  UserMetrics,
  ConversionMetrics,
  PlatformStats,
  PerformanceMetrics,
  PopularDestination,
  RecentActivity,
} from '@/types/analytics';
