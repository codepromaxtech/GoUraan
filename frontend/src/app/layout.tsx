'use client';

import { useEffect, useState } from 'react';
import { Inter, Poppins } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { ThemeProvider } from 'next-themes';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
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

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <QueryProvider>
              <AuthProvider>
                <div className="fixed bottom-4 right-4 z-50">
                  <ThemeToggle />
                </div>
                {mounted && <LiveChat />}
                {children}
              </AuthProvider>
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
