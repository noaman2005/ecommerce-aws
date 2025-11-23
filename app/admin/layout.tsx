'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package2, Layers, ClipboardList, UserCircle2, Menu, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { ADMIN_EMAIL } from '@/lib/constants';
import { useAuthStore } from '@/lib/store/auth-store';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package2 },
  { label: 'Categories', href: '/admin/categories', icon: Layers },
  { label: 'Orders', href: '/admin/orders', icon: ClipboardList },
  { label: 'Account', href: '/admin/account', icon: UserCircle2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.email !== ADMIN_EMAIL) {
      router.replace('/products');
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fffdf8] via-[#fef3eb] to-[#f7ebe0] text-[#5f4b3f]">
        <div className="flex items-center gap-3 text-sm">
          <span className="h-4 w-4 rounded-full border-2 border-t-transparent border-[#b7472f] animate-spin" />
          <span>Loading admin area...</span>
        </div>
      </div>
    );
  }

  if (user?.email !== ADMIN_EMAIL) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffdf8] via-[#fef3eb] to-[#f7ebe0] text-[#1c1a17]">
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 w-72 transform bg-white/90 backdrop-blur border-r border-[#d9cfc2] shadow-[0_18px_40px_rgba(28,26,23,0.16)] transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f1e3d5]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#b59b84]">Admin</p>
            <h1 className="text-xl font-semibold text-[#1c1a17]">Control Center</h1>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden rounded-full p-2 text-[#5f4b3f] hover:text-[#b7472f] hover:bg-[#f4ebe3]"
            aria-label="Close sidebar"
          >
            <span className="sr-only">Close sidebar</span>
            <XIcon />
          </button>
        </div>

        <nav className="px-4 py-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#f4ebe3] text-[#b7472f] shadow-[0_10px_22px_rgba(28,26,23,0.10)]'
                    : 'text-[#5f4b3f] hover:bg-[#f7eee5]'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-72 min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 border-b border-[#d9cfc2] bg-white/85 backdrop-blur">
          <div className="px-4 lg:px-8 py-3 flex items-center justify-between">
            <button
              type="button"
              className="lg:hidden rounded-full p-2 text-[#5f4b3f] hover:text-[#b7472f] hover:bg-[#f4ebe3]"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden lg:flex items-center gap-2 text-[11px] font-medium text-[#b59b84] uppercase tracking-[0.35em]">
              <span>Admin</span>
              <span className="text-[#e3d5c6]">/</span>
              <span>{NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.label || 'Dashboard'}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-[#1c1a17]">{user?.name || 'Admin'}</p>
                <p className="text-xs text-[#5f4b3f]">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.replace('/auth/login');
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#d9cfc2] bg-white px-3 py-2 text-xs sm:text-sm text-[#5f4b3f] hover:bg-[#f4ebe3]"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 lg:px-8 py-6">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
