import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import '@/styles/globals.css';

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

export const metadata: Metadata = {
  title: {
    default: 'GoUraan - Travel, Hajj & Booking Platform',
    template: '%s | GoUraan',
  },
  description: 'Book flights, hotels, travel packages, and Hajj & Umrah services with GoUraan - your trusted travel partner.',
  keywords: [
    'travel booking',
    'flight booking',
    'hotel booking',
    'hajj packages',
    'umrah packages',
    'travel packages',
    'bangladesh travel',
    'saudi arabia travel',
  ],
  authors: [{ name: 'GoUraan Team' }],
  creator: 'GoUraan',
  publisher: 'GoUraan',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'bn-BD': '/bn',
      'ar-SA': '/ar',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'GoUraan - Travel, Hajj & Booking Platform',
    description: 'Book flights, hotels, travel packages, and Hajj & Umrah services with GoUraan.',
    siteName: 'GoUraan',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'GoUraan - Travel Booking Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoUraan - Travel, Hajj & Booking Platform',
    description: 'Book flights, hotels, travel packages, and Hajj & Umrah services with GoUraan.',
    images: ['/og-image.jpg'],
    creator: '@gouraan',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="msapplication-TileColor" content="#0ea5e9" />
      </head>
      <body className="min-h-screen bg-gray-50 antialiased">
        <div id="root">
          {children}
        </div>
        <div id="modal-root" />
        <div id="toast-root" />
      </body>
    </html>
  );
}
