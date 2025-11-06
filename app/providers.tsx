'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

export function Providers({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}
