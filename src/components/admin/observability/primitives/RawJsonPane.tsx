'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RawJsonPaneProps {
  data: unknown;
  title?: string;
  className?: string;
  collapsedByDefault?: boolean;
}

export function RawJsonPane({ data, title = 'Raw JSON', className, collapsedByDefault }: RawJsonPaneProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(!collapsedByDefault);

  const text = JSON.stringify(data ?? null, null, 2);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  return (
    <div className={cn('overflow-hidden rounded-2xl border bg-card shadow-sm', className)}>
      <div className="flex items-center justify-between border-b px-4 py-2">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
        >
          {title} {expanded ? '▾' : '▸'}
        </button>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {expanded ? (
        <pre className="max-h-96 overflow-auto bg-muted/30 p-3 text-[11px] leading-relaxed text-muted-foreground">
          {text}
        </pre>
      ) : null}
    </div>
  );
}
