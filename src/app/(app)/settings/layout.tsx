'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { User, CreditCard, Bell, Shield, Palette, LogOut, Lock, Loader2, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsNav = [
  { href: '/settings', label: 'General', icon: User },
  { href: '/settings/profile', label: 'Profile', icon: User },
  { href: '/settings/claims', label: 'My Claims', icon: BadgeCheck },
  { href: '/settings/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings/security', label: 'Security & 2FA', icon: Lock },
  { href: '/settings/privacy', label: 'Privacy', icon: Shield },
  { href: '/settings/appearance', label: 'Appearance', icon: Palette },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      const timer = setTimeout(() => {
        setAuthChecked(true);
        router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      }, 200);

      return () => clearTimeout(timer);
    }

    setAuthChecked(true);
  }, [status, router, pathname]);

  if (status === 'loading' || !authChecked || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Settings</h1>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>

      {/* Horizontal tab bar — scrolls sideways instead of stacking vertically */}
      <nav className="-mx-1 mb-6 flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {settingsNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Settings Content */}
      <main className="min-w-0">
        <div className="rounded-xl border bg-card p-6">{children}</div>
      </main>
    </div>
  );
}
