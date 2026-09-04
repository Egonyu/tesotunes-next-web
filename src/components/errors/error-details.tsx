'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/**
 * What actually went wrong, on the page rather than only in the console.
 *
 * These boundaries said "Something went wrong" and nothing else. That is fine
 * for reassurance and useless for repair: a person reporting the fault had
 * nothing to report, and anyone trying to fix it had to ask them to open dev
 * tools — which on a phone is not a reasonable request. A whole round of
 * chasing a /credits failure was spent inferring from server logs because the
 * one line that would have answered it was never shown.
 *
 * A render error's message is present in the browser even in production, so
 * showing it costs nothing and saves the round trip. The digest only maps to
 * server logs, so it is shown alongside rather than instead.
 */
export function ErrorDetails({ error }: { error: Error & { digest?: string } }) {
  const [copied, setCopied] = useState(false);

  const message = error?.message?.trim();
  const digest = error?.digest;

  if (!message && !digest) {
    return null;
  }

  const detail = [message, digest && `Error ID: ${digest}`].filter(Boolean).join('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(detail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is unavailable over plain HTTP and in some embedded
      // browsers. The text is on screen regardless, which is the point.
    }
  };

  return (
    <div className="mb-6 rounded-lg border bg-muted/40 p-3 text-left">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 break-words font-mono text-xs text-muted-foreground">
          {message}
          {digest && (
            <>
              {message && <br />}
              <span className="opacity-70">Error ID: {digest}</span>
            </>
          )}
        </p>

        <button
          onClick={copy}
          className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Copy error details"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
