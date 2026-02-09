'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCcw, Home, ArrowLeft } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            
            <h1 className="mb-2 text-3xl font-bold">Something went wrong!</h1>
            
            <p className="mb-6 text-muted-foreground">
              We apologize for the inconvenience. An unexpected error occurred.
            </p>
            
            {error.digest && (
              <p className="mb-6 text-sm text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
            
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <RefreshCcw className="h-4 w-4" />
                Try again
              </button>
              
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-md border px-6 py-3 text-sm font-medium hover:bg-accent"
              >
                <Home className="h-4 w-4" />
                Go home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
