'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingCart, User, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useCartStore } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';
import { ADMIN_EMAIL } from '@/lib/constants';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const cartItemCount = getItemCount();

  // Prevent hydration mismatch by only rendering cart count after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = !!user && user.email === ADMIN_EMAIL;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/categories', label: 'Categories' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur-lg border-b border-slate-700 shadow-lg sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600"
            >
              Paper & Ink
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-all duration-300 ${
                  pathname === link.href
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-slate-300 hover:text-blue-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {mounted && isAuthenticated && (
              isAdmin ? (
                <Link href="/admin/dashboard">
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/products">
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white">Shop</Button>
                </Link>
              )
            )}

            {/* Cart */}
            <Link href="/cart" className="relative">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <ShoppingCart className="w-6 h-6 text-slate-300 hover:text-blue-400 transition-colors" />
                {mounted && cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </motion.div>
            </Link>

            {/* User Menu */}
            {mounted && isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-slate-300 hover:text-blue-400 transition-colors">
                  <User className="w-6 h-6" />
                  <span className="hidden md:block text-sm font-medium text-slate-200">
                    {user?.name}
                  </span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="px-4 py-2 text-xs text-slate-400 border-b border-slate-700">{isAdmin ? 'Admin' : 'Customer'}</div>
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    Profile
                  </Link>
                  <div className="border-t border-slate-700 mt-1 pt-1">
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : mounted ? (
              <Link href="/auth/login">
                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0">Login</Button>
              </Link>
            ) : (
              <div className="w-16 h-8" /> 
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-300 hover:text-blue-400 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-slate-700"
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-base font-medium ${
                  pathname === link.href
                    ? 'text-blue-400'
                    : 'text-slate-300 hover:text-blue-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
};
