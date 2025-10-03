import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  accessToken?: string;
  roles?: string[];
}

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (status === 'authenticated' && session?.user) {
          const userData: User = {
            id: session.user.id || '',
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
            accessToken: session.accessToken as string,
            roles: session.user.roles || [],
          };
          setUser(userData);
          
          // Store the access token in localStorage for WebSocket authentication
          if (userData.accessToken) {
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
  }, [session, status]);

  const signIn = useCallback(async (email: string, password: string) => {
    // This would typically call your authentication API
    // For now, we'll just update the session
    await update({
      ...session,
      user: {
        ...session?.user,
        email,
      },
      accessToken: 'dummy-token', // Replace with actual token from your auth API
    });
  }, [session, update]);

  const signOut = useCallback(async () => {
    // This would typically call your sign-out API
    await update(null);
    setUser(null);
    localStorage.removeItem('accessToken');
    router.push('/auth/signin');
  }, [router, update]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signOut,
  };
}
