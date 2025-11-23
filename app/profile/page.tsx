"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Shield, Bell, LogOut } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store/auth-store';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      setValue('name', user.name);
      setValue('email', user.email);
    }
  }, [isAuthenticated, isLoading, user, router, setValue]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsUpdating(true);
    try {
      // TODO: wire to real profile update API / Cognito attributes.
      // For now, update local auth store so changes reflect immediately in UI.
      if (user) {
        setUser({
          ...user,
          name: data.name,
          email: data.email,
          updatedAt: new Date().toISOString(),
        });
      }
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsUpdating(true);
    try {
      // TODO: wire to real password update API.
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Password updated');
      resetPassword();
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'preferences', name: 'Preferences', icon: Bell },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffdf8] via-[#fef3eb] to-[#f7ebe0] text-[#1c1a17] py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-0">
        <div className="mb-8 sm:mb-10 space-y-2 text-center sm:text-left">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.4em] text-[#5f4b3f]">Account</p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1c1a17]">
            Your Nisha Stationery profile
          </h1>
          <p className="text-sm text-[#5f4b3f] max-w-xl">
            Manage your details, security and how we stay in touch about new drops and notebook restocks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-1">
            <Card className="p-5 sm:p-6 bg-white/80 border-[#d9cfc2] shadow-[0_12px_32px_rgba(28,26,23,0.08)]">
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-[#b7472f] text-white flex items-center justify-center text-2xl font-semibold mx-auto mb-4 shadow-[0_10px_25px_rgba(183,71,47,0.45)]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-semibold text-[#1c1a17]">{user.name}</h3>
                <p className="text-sm text-[#5f4b3f]">{user.email}</p>
                <div className="mt-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide ${
                      user.role === 'host'
                        ? 'bg-[#f4ebe3] text-[#b7472f]'
                        : 'bg-[#f7eee5] text-[#5f4b3f]'
                    }`}
                  >
                    {user.role === 'host' ? 'Host' : 'Customer'}
                  </span>
                </div>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 ${
                      activeTab === tab.id
                        ? 'bg-[#f4ebe3] text-[#b7472f] shadow-[0_8px_20px_rgba(28,26,23,0.06)]'
                        : 'text-[#5f4b3f] hover:bg-[#f7eee5]'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-3" />
                    {tab.name}
                  </button>
                ))}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </nav>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-5 sm:space-y-6">
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="p-5 sm:p-6 bg-white/80 border-[#d9cfc2] shadow-[0_14px_36px_rgba(28,26,23,0.08)]">
                  <div className="mb-4 sm:mb-6 space-y-1">
                    <p className="text-[11px] sm:text-xs uppercase tracking-[0.4em] text-[#5f4b3f]">
                      Profile
                    </p>
                    <h2 className="text-lg sm:text-xl font-semibold text-[#1c1a17]">Profile information</h2>
                    <p className="text-xs sm:text-sm text-[#5f4b3f]">
                      Keep your name and contact details up to date for invoices and order updates.
                    </p>
                  </div>

                  <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <Input
                        label="Full Name"
                        placeholder="Your full name"
                        error={profileErrors.name?.message}
                        {...registerProfile('name')}
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="you@example.com"
                        error={profileErrors.email?.message}
                        {...registerProfile('email')}
                      />
                    </div>

                    <Input
                      label="Phone Number (optional)"
                      placeholder="Mobile number for order updates"
                      error={profileErrors.phone?.message}
                      {...registerProfile('phone')}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" isLoading={isUpdating}>
                        Save changes
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="p-5 sm:p-6 bg-white/80 border-[#d9cfc2] shadow-[0_14px_36px_rgba(28,26,23,0.08)]">
                  <div className="mb-4 sm:mb-6 space-y-1">
                    <p className="text-[11px] sm:text-xs uppercase tracking-[0.4em] text-[#5f4b3f]">
                      Security
                    </p>
                    <h2 className="text-lg sm:text-xl font-semibold text-[#1c1a17]">Password & access</h2>
                    <p className="text-xs sm:text-sm text-[#5f4b3f]">
                      Choose a strong password to keep your orders and details safe.
                    </p>
                  </div>

                  <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                    <Input
                      label="Current Password"
                      type="password"
                      placeholder="Enter current password"
                      error={passwordErrors.currentPassword?.message}
                      {...registerPassword('currentPassword')}
                    />

                    <Input
                      label="New Password"
                      type="password"
                      placeholder="Enter new password"
                      error={passwordErrors.newPassword?.message}
                      {...registerPassword('newPassword')}
                    />

                    <Input
                      label="Confirm New Password"
                      type="password"
                      placeholder="Confirm new password"
                      error={passwordErrors.confirmPassword?.message}
                      {...registerPassword('confirmPassword')}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" isLoading={isUpdating}>
                        Update password
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="p-5 sm:p-6 bg-white/80 border-[#d9cfc2] shadow-[0_14px_36px_rgba(28,26,23,0.08)]">
                  <div className="mb-4 sm:mb-6 space-y-1">
                    <p className="text-[11px] sm:text-xs uppercase tracking-[0.4em] text-[#5f4b3f]">
                      Preferences
                    </p>
                    <h2 className="text-lg sm:text-xl font-semibold text-[#1c1a17]">How we reach you</h2>
                    <p className="text-xs sm:text-sm text-[#5f4b3f]">
                      Choose which notebooks, launches and updates you hear about.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm sm:text-base font-medium text-[#1c1a17] mb-3 sm:mb-4">Email notifications</h3>
                      <div className="space-y-3">
                        {[
                          { id: 'order-updates', label: 'Order updates and shipping notifications' },
                          { id: 'promotions', label: 'Promotions and special offers' },
                          { id: 'product-recommendations', label: 'Product recommendations' },
                          { id: 'security-alerts', label: 'Security alerts' },
                        ].map((item) => (
                          <div key={item.id} className="flex items-center">
                            <input
                              id={item.id}
                              type="checkbox"
                              defaultChecked={item.id === 'security-alerts'}
                              className="h-4 w-4 text-[#b7472f] focus:ring-[#b7472f] border-[#d9cfc2] rounded"
                            />
                            <label htmlFor={item.id} className="ml-3 text-sm text-[#5f4b3f]">
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-medium text-[#1c1a17] mb-3 sm:mb-4">Privacy</h3>
                      <div className="space-y-3">
                        {[
                          { id: 'profile-visibility', label: 'Make my profile visible to other users' },
                          { id: 'purchase-history', label: 'Show my purchase history in recommendations' },
                        ].map((item) => (
                          <div key={item.id} className="flex items-center">
                            <input
                              id={item.id}
                              type="checkbox"
                              defaultChecked={false}
                              className="h-4 w-4 text-[#b7472f] focus:ring-[#b7472f] border-[#d9cfc2] rounded"
                            />
                            <label htmlFor={item.id} className="ml-3 text-sm text-[#5f4b3f]">
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button>Save preferences</Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
