'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error Boundary Caught:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <AlertCircle className="h-16 w-16 mb-4 text-red-500" />
      <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
      <p className="text-sm mb-6 max-w-md" style={{ color: 'var(--text-muted)' }}>
        An unexpected error occurred in the application. This could be due to a network issue or an internal application error.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="rounded-xl px-6 py-2.5 text-sm font-bold text-black transition hover:opacity-90"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-xl px-6 py-2.5 text-sm font-bold border transition hover:opacity-90"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
        >
          Return to Dashboard
        </Link>
      </div>
      
      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-8 p-4 rounded-xl text-left text-xs max-w-2xl w-full overflow-auto" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <p className="font-bold text-red-400 mb-2">Error Details (Development Only):</p>
          <pre className="whitespace-pre-wrap">{error.message}</pre>
        </div>
      )}
    </div>
  );
}
