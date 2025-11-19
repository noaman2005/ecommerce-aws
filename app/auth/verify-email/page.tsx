'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/store/auth-store';
import { confirmSignUp, resendConfirmationCode } from '@/lib/auth/cognito';

const verifySchema = z.object({
  code: z.string().min(6, 'Code must be 6 characters').max(6, 'Code must be 6 characters'),
});

type VerifyFormData = z.infer<typeof verifySchema>;

export default function VerifyEmailPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const emailToVerify = useAuthStore((state) => state.emailToVerify);
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    // Read query param from window.location (client component)
    try {
      const emailFromQuery = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('email') : null;
      const finalEmail = emailToVerify || emailFromQuery || '';
      if (finalEmail) setEmail(finalEmail);
    } catch (e) {
      // ignore
    }
  }, [emailToVerify]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: VerifyFormData) => {
    if (!email) {
      toast.error('Please enter your email to verify.');
      return;
    }

    try {
      setIsLoading(true);
      await confirmSignUp(email, data.code);
      toast.success('Email verified successfully! You can now log in.');
      router.push('/auth/login');
    } catch (error: any) {
      toast.error(error.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Please enter your email to resend the code.');
      return;
    }
    try {
      setResending(true);
      await resendConfirmationCode(email);
      toast.success('A new verification code has been sent to your email.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend code.');
    } finally {
      setResending(false);
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
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-slate-300">
            {email
              ? (<span>A verification code has been sent to <strong className="text-blue-400">{email}</strong>.</span>)
              : (<span>Enter your email and the verification code you received.</span>)}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Verification Code"
            type="text"
            placeholder="123456"
            error={errors.code?.message}
            {...register('code')}
            maxLength={6}
          />

          <div className="flex items-center gap-3">
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0" isLoading={isLoading}>
              Verify Account
            </Button>
            <Button type="button" variant="outline" className="w-full border-slate-600 text-slate-200 hover:bg-slate-700" isLoading={resending} onClick={handleResend}>
              Resend Code
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
