'use client';

import Link from 'next/link';
import { Lock, ShieldAlert } from 'lucide-react';

type AccessNoticeProps = {
  title: string;
  description: string;
  callbackUrl?: string;
  role?: string;
  variant?: 'auth' | 'forbidden';
};

export default function AccessNotice({
  title,
  description,
  callbackUrl,
  role,
  variant = 'auth',
}: AccessNoticeProps) {
  const safeCallback = callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')
    ? callbackUrl
    : '/';
  const loginHref = `/login?callbackUrl=${encodeURIComponent(safeCallback || '/')}`;
  const Icon = variant === 'forbidden' ? ShieldAlert : Lock;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full rounded-2xl border bg-card p-6 text-center space-y-4">
        <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
        {role ? (
          <p className="text-xs text-muted-foreground">Current role: <span className="font-medium">{role}</span></p>
        ) : null}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/" className="px-4 py-2 rounded-lg border hover:bg-muted">
            Go Home
          </Link>
          <Link href={loginHref} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
