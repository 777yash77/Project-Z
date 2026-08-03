'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from './dashboard/api';

/**
 * Invisible component that auto-redirects to /dashboard
 * if a valid JWT already exists in localStorage.
 * Place on login and register pages.
 */
export function AuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    getMe()
      .then(() => router.replace('/dashboard'))
      .catch(() => {
        // Token is invalid or expired — clear it silently
        localStorage.removeItem('token');
      });
  }, [router]);

  return null; // renders nothing
}
