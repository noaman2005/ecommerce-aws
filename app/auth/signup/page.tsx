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
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const signup = useAuthStore((state) => state.signup);
  const setEmailToVerify = useAuthStore((state) => state.setEmailToVerify);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      // Everyone starts as a customer - they can switch to host later
      await signup(data.email, data.password, data.name, 'customer');
      toast.success('Account created! Please check your email for verification.');
      // Ensure the verify page knows which email to verify
      setEmailToVerify(data.email);
      router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      toast.error(error.message || 'Signup failed. Please try again.');
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
            Create your studio profile
          </h2>
          <p className="mt-2 text-center text-sm text-[#5f4b3f]">
            {APP_TAGLINE}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              error={errors.name?.message}
              {...register('name')}
            />

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

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

          <Button type="submit" className="w-full bg-[#b7472f] hover:bg-[#c3743a] text-white border-0" isLoading={isLoading}>
            Create Account
          </Button>

          <div className="text-center text-sm">
            <span className="text-[#5f4b3f]">Already have an account? </span>
            <Link
              href="/auth/login"
              className="font-medium text-[#b7472f] hover:text-[#c3743a]"
            >
              Sign in
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
