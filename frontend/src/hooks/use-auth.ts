import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';

// Define the User type that matches your application's needs
export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  accessToken?: string;
  roles?: string[];
}

// Extend the Session type to include custom fields
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      roles?: string[];
    };
  }
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = status === 'authenticated' && user !== null;
  
  // Helper function to create user object from session
  const createUserFromSession = useCallback((session: any): User | null => {
    if (!session?.user) return null;
    
    return {
      id: session.user.id || '',
      name: session.user.name || null,
      email: session.user.email || null,
      image: session.user.image || null,
      accessToken: session.accessToken,
      roles: session.user.roles || [],
    };
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        if (status === 'authenticated' && session?.user) {
          const userData = createUserFromSession(session);
          setUser(userData);
          
          if (userData?.accessToken) {
            localStorage.setItem('accessToken', userData.accessToken);
          }
        } else if (status === 'unauthenticated') {
          setUser(null);
          localStorage.removeItem('accessToken');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        localStorage.removeItem('accessToken');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [session, status, createUserFromSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      // This would typically call your authentication API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Login failed');
      }

      // Update the session with the new token
      const data = await response.json();
      await update({
        ...session,
        user: {
          ...session?.user,
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          roles: data.user.roles || [],
        },
        accessToken: data.accessToken,
      });
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }, [session, update]);

  const signOut = useCallback(async () => {
    try {
      // Call your API to invalidate the token
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear the session and redirect
      await nextAuthSignOut({ redirect: false });
      setUser(null);
      localStorage.removeItem('accessToken');
      router.push('/auth/login');
    }
  }, [router]);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh session');
      }

      const session = await response.json();
      const userData = createUserFromSession(session);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Session refresh failed:', error);
      setUser(null);
      return null;
    }
  }, [createUserFromSession]);

  const authContextValue = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signOut,
    refreshSession,
  }), [user, isLoading, isAuthenticated, signIn, signOut, refreshSession]);

  return authContextValue;
}
