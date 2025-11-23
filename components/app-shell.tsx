"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isAuthRoute = pathname?.startsWith('/auth');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  if (isAuthRoute) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-[#fffdf8] via-[#fef3eb] to-[#f7ebe0]">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-14 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
