'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCcw, LayoutDashboard } from 'lucide-react';

export default function ArtistError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Artist studio error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
          <AlertTriangle className="h-8 w-8 text-orange-500" />
        </div>

        <h2 className="mb-2 text-2xl font-bold">Studio Error</h2>

        <p className="mb-6 text-muted-foreground">
          Something went wrong in your artist studio. Please try again or go back to the dashboard.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </button>

          <Link
            href="/artist"
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Artist Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
