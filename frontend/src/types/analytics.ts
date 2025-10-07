export interface DateRange {
  from?: string;
  to?: string;
}

export interface TrendMetric {
  current: number;
  previous: number;
  trend: number;
}

export interface RevenueMetrics {
  total: number;
  trend: number;
  avgOrderValue: number;
  aovTrend: number;
  byPeriod?: Array<{
    date: string;
    revenue: number;
  }>;
}

export interface BookingMetrics {
  total: number;
  trend: number;
  status: {
    confirmed: number;
    pending: number;
    cancelled: number;
  };
  byPeriod?: Array<{
    date: string;
    count: number;
  }>;
}

export interface UserMetrics {
  total: number;
  active: number;
  new: number;
  trend: number;
  byPeriod?: Array<{
    date: string;
    count: number;
  }>;
}

export interface ConversionMetrics {
  booking: number;
  signup: number;
  payment: number;
  trends: {
    booking: number;
    signup: number;
    payment: number;
  };
}

export interface PlatformStats {
  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  browsers: Record<string, number>;
  os: Record<string, number>;
}

export interface PerformanceMetrics {
  responseTime: number;
  uptime: number;
  errorRate: number;
  requests: number;
}

export interface PopularDestination {
  id: string;
  name: string;
  bookings: number;
  revenue: number;
  imageUrl?: string;
}

export interface RecentActivity {
  id: string;
  type: 'booking' | 'user' | 'payment' | 'support';
  title: string;
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
  userAvatar?: string;
}

export interface AnalyticsOverview {
  revenue: RevenueMetrics;
  bookings: BookingMetrics;
  users: UserMetrics;
  conversions: ConversionMetrics;
  platform: PlatformStats;
  performance: PerformanceMetrics;
  popularDestinations: PopularDestination[];
  recentActivity: RecentActivity[];
}

export interface AnalyticsResponse<T> {
  data: T;
  success: boolean;
  timestamp: string;
}
