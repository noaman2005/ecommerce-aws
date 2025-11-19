'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/store/auth-store';
import { ADMIN_EMAIL } from '@/lib/constants';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const setEmailToVerify = useAuthStore((state) => state.setEmailToVerify);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const watchedEmail = watch('email');

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      toast.success('Login successful!');
      if (data.email === ADMIN_EMAIL) {
        router.push('/admin/dashboard');
      } else {
        router.push('/products');
      }
    } catch (error: any) {
      const code = error?.code || error?.name;
      switch (code) {
        case 'UserNotConfirmedException': {
          setEmailToVerify(data.email);
          toast.info('Your email is not verified. Please verify to continue.');
          router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
          break;
        }
        case 'NotAuthorizedException': {
          // This is typically incorrect password
          toast.error('Incorrect email or password.');
          break;
        }
        case 'UserNotFoundException': {
          toast.error('No account found with that email.');
          break;
        }
        case 'PasswordResetRequiredException': {
          toast.info('Password reset required. Please set a new password.');
          router.push(`/auth/forgot-password?email=${encodeURIComponent(data.email)}`);
          break;
        }
        case 'TooManyFailedAttemptsException':
        case 'LimitExceededException': {
          toast.error('Too many attempts. Please try again later.');
          break;
        }
        default: {
          toast.error(error?.message || 'Login failed. Please try again.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-slate-800 border border-slate-700 p-8 rounded-xl shadow-xl"
      >
        <div>
          <h2 className="text-center text-3xl font-bold text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-slate-300">
            Sign in to your account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-slate-300"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                href={`/auth/forgot-password?email=${encodeURIComponent(watchedEmail || '')}`}
                className="font-medium text-blue-400 hover:text-blue-300"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0" isLoading={isLoading}>
            Sign In
          </Button>

          <div className="text-center text-sm">
            <span className="text-slate-300">Don&apos;t have an account? </span>
            <Link
              href="/auth/signup"
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              Sign up
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
