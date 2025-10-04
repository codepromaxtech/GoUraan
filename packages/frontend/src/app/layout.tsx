'use client';

import { useEffect, useState } from 'react';
import { Inter, Poppins } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import dynamic from 'next/dynamic';
import '@/styles/globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/contexts/AuthContext';

// Dynamically import LiveChat to avoid SSR issues
const LiveChat = dynamic(
  () => import('@/components/chat/LiveChat').then((mod) => mod.default),
  { ssr: false }
);

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

// This is a Client Component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  // This effect will only run on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <QueryProvider>
          <SessionProvider>
            <AuthProvider>
              {children}
              <LiveChat />
            </AuthProvider>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
