import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { FloatingConcierge } from '@/components/layout/FloatingConcierge';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { VVStoreProvider } from '@/context/VVStoreContext';
import './globals.css';

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'V.V Properties | Residential & Commercial Real Estate in Coimbatore',
    template: '%s | V.V Properties',
  },
  description:
    'V.V Properties is a trusted real estate company in Gandhinagar, Saibaba Colony, Coimbatore specializing in residential and commercial property sales, land and plot transactions, investment guidance, and real estate consultation.',
  icons: {
    icon: '/assets/branding/favicon.png',
    shortcut: '/assets/branding/favicon.png',
    apple: '/assets/branding/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#0D0221]">
        <VVStoreProvider>
          <Suspense fallback={<div className="h-[76px] border-b border-[#0D0221]/10 bg-white" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
          <Suspense fallback={null}>
            <FloatingConcierge />
          </Suspense>
          <ToastContainer />
        </VVStoreProvider>
      </body>
    </html>
  );
}
