import { Metadata } from 'next';

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
