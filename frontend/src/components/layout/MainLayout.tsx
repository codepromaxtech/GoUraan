'use client';

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import LiveChat from '../chat/LiveChat';

interface MainLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showChat?: boolean;
}

export default function MainLayout({ 
  children, 
  showHeader = true, 
  showFooter = true,
  showChat = true
}: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {showFooter && <Footer />}
      {showChat && <LiveChat />}
    </div>
  );
}
