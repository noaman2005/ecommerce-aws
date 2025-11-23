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
import { ADMIN_EMAIL, APP_NAME, APP_TAGLINE } from '@/lib/constants';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fffdf8] via-[#fef3eb] to-[#f7ebe0] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white/80 border border-[#d9cfc2] p-10 rounded-3xl shadow-[0_25px_60px_rgba(28,26,23,0.08)] backdrop-blur"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#5f4b3f] text-center">{APP_NAME}</p>
          <h2 className="text-center text-3xl font-semibold text-[#1c1a17] mt-2">
            Welcome back to the studio
          </h2>
          <p className="mt-2 text-center text-sm text-[#5f4b3f]">
            {APP_TAGLINE}
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

          <div className="flex items-center justify-between text-sm">
            <div className="text-sm">
              <Link
                href={`/auth/forgot-password?email=${encodeURIComponent(watchedEmail || '')}`}
                className="font-medium text-[#b7472f] hover:text-[#c3743a]"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" className="w-full bg-[#b7472f] hover:bg-[#c3743a] text-white border-0" isLoading={isLoading}>
            Sign In
          </Button>

          <div className="text-center text-sm">
            <span className="text-[#5f4b3f]">Don&apos;t have an account? </span>
            <Link
              href="/auth/signup"
              className="font-medium text-[#b7472f] hover:text-[#c3743a]"
            >
              Sign up
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
