'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { forgotPassword, confirmPassword } from '@/lib/auth/cognito';

const requestSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

const confirmSchema = z
  .object({
    code: z.string().min(6, 'Code must be 6 digits').max(6, 'Code must be 6 digits'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [email, setEmail] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const emailFromQuery = searchParams.get('email');
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [searchParams]);

  const {
    register: registerEmail,
    handleSubmit: handleRequestSubmit,
    formState: { errors: requestErrors },
  } = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email },
    values: { email },
  });

  const {
    register: registerConfirm,
    handleSubmit: handleConfirmSubmit,
    formState: { errors: confirmErrors },
  } = useForm<z.infer<typeof confirmSchema>>({
    resolver: zodResolver(confirmSchema),
  });

  const onRequest = async ({ email }: z.infer<typeof requestSchema>) => {
    try {
      setRequesting(true);
      await forgotPassword(email);
      setEmail(email);
      toast.success('Verification code sent to your email');
      setStep('confirm');
    } catch (error: any) {
      const code = error?.code || error?.name;
      if (code === 'UserNotFoundException') {
        toast.error('No account found with that email.');
      } else if (code === 'LimitExceededException') {
        toast.error('Too many attempts. Please try again later.');
      } else {
        toast.error(error?.message || 'Failed to send verification code.');
      }
    } finally {
      setRequesting(false);
    }
  };

  const onConfirm = async (data: z.infer<typeof confirmSchema>) => {
    try {
      if (!email) {
        toast.error('Missing email. Please go back and enter your email.');
        setStep('request');
        return;
      }
      setConfirming(true);
      await confirmPassword(email, data.code, data.newPassword);
      toast.success('Password updated. You can now log in.');
      router.push(`/auth/login`);
    } catch (error: any) {
      const code = error?.code || error?.name;
      if (code === 'CodeMismatchException') {
        toast.error('Invalid verification code.');
      } else if (code === 'ExpiredCodeException') {
        toast.error('Code expired. Request a new one.');
      } else {
        toast.error(error?.message || 'Failed to reset password.');
      }
    } finally {
      setConfirming(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Enter your email on the previous step.');
      setStep('request');
      return;
    }
    try {
      setRequesting(true);
      await forgotPassword(email);
      toast.success('A new code has been sent.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to resend code.');
    } finally {
      setRequesting(false);
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
            {step === 'request' ? 'Forgot Password' : 'Set New Password'}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-300">
            {step === 'request'
              ? 'Enter your email to receive a verification code.'
              : `We sent a code to ${email}. Enter it and choose a new password.`}
          </p>
        </div>

        {step === 'request' ? (
          <form className="mt-8 space-y-6" onSubmit={handleRequestSubmit(onRequest)}>
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={requestErrors.email?.message}
              {...registerEmail('email')}
            />
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0" isLoading={requesting}>
              Send Verification Code
            </Button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleConfirmSubmit(onConfirm)}>
            <Input
              label="Verification Code"
              type="text"
              placeholder="123456"
              error={confirmErrors.code?.message}
              maxLength={6}
              {...registerConfirm('code')}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              error={confirmErrors.newPassword?.message}
              {...registerConfirm('newPassword')}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              error={confirmErrors.confirmPassword?.message}
              {...registerConfirm('confirmPassword')}
            />

            <div className="flex items-center gap-3">
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0" isLoading={confirming}>
                Update Password
              </Button>
              <Button type="button" variant="outline" className="w-full border-slate-600 text-slate-200 hover:bg-slate-700" isLoading={requesting} onClick={handleResend}>
                Resend Code
              </Button>
            </div>

            <div className="text-center text-sm">
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300"
                onClick={() => setStep('request')}
              >
                Use a different email
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
