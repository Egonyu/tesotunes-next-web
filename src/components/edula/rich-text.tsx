'use client';

import Link from 'next/link';
import { Fragment } from 'react';

/**
 * Parses text and renders @mentions as links to profiles and #hashtags as
 * links to search/topic pages. All other text is rendered as plain spans.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  // Match @username (word chars, dots, underscores) or #hashtag (word chars)
  const parts = text.split(/(@[\w._]+|#\w+)/g);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          const username = part.slice(1);
          return (
            <Link
              key={i}
              href={`/profile/${encodeURIComponent(username)}`}
              className="text-primary hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        if (part.startsWith('#')) {
          const tag = part.slice(1);
          return (
            <Link
              key={i}
              href={`/edula/trending?tag=${encodeURIComponent(tag)}`}
              className="text-primary hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </span>
  );
}
