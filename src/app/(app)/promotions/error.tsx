"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function PromotionsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container mx-auto max-w-md py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-7 w-7 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold">Promotions didn&apos;t load</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Something went wrong on our side. Try again — if it keeps happening, check your
        connection or come back in a few minutes.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
