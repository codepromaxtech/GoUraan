'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoading: boolean;  // Alias for loading for backward compatibility
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        next: { revalidate: 0 } // Disable Next.js cache
      });

      if (!response.ok) {
        // If unauthorized, clear any existing session
        if (response.status === 401) {
          setUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
          }
          return null;
        }
        throw new Error(`Failed to refresh session: ${response.status}`);
      }
      
      const session = await response.json();
      if (session?.user) {
        setUser(session.user);
        // Update localStorage with fresh user data
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(session.user));
        }
        return session.user;
      }
      return null;
    } catch (error) {
      console.error('Session refresh failed:', error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await refreshSession();
        
        if (!user && pathname.startsWith('/admin')) {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (pathname.startsWith('/admin')) {
          router.push('/auth/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Set up session refresh interval (every 30 minutes)
    const interval = setInterval(refreshSession, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [pathname, router, refreshSession]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Login failed. Please check your credentials.');
      }

      const data = await response.json();
      setUser(data.user);
      
      // Store user data in localStorage for quick access
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      // Redirect based on user role
      const redirectPath = data.user.role === 'admin' ? '/admin' : '/dashboard';
      router.push(redirectPath);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include' 
      });
      
      // Clear user data from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
      
      setUser(null);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, clear local state
      setUser(null);
      if (typeof window !== 'undefined') {
      }
      router.push('/auth/login');
    }
  };

  // Determine authentication status
  const isAuthenticated = !!user && !loading;

  const contextValue: AuthContextType = {
    user,
    loading,
    isLoading: loading,  // Alias for backward compatibility
    isAuthenticated,
    login,
    logout,
    refreshSession
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
