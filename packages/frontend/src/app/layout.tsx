'use client';

import { useEffect, useState } from 'react';
import { Inter, Poppins } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import dynamic from 'next/dynamic';
import '@/styles/globals.css';
import { QueryProvider } from '@/providers/query-provider';

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} min-h-screen bg-gray-50 antialiased`}>
        {mounted && (
          <SessionProvider>
            <QueryProvider>
              <div id="root">
                {children}
              </div>
              <div id="modal-root" />
              <div id="toast-root" />
              <LiveChat />
            </QueryProvider>
          </SessionProvider>
        )}
      </body>
    </html>
  );
}
