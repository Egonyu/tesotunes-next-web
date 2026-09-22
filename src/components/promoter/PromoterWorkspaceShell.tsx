'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import {
  ClipboardList,
  ExternalLink,
  LayoutGrid,
  Loader2,
  Megaphone,
  Search,
  UserRound,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isAdminRole } from '@/lib/roles';
import { useMyPromoterProfileV2 } from '@/hooks/usePromotionsV2';

const TABS = [
  { href: '/promoter', label: 'Services', icon: LayoutGrid, exact: true },
  { href: '/promoter/orders', label: 'Orders', icon: ClipboardList },
  { href: '/promoter/earnings', label: 'Earnings', icon: Wallet },
  { href: '/promoter/profile', label: 'Profile', icon: UserRound },
  { href: '/promotions/requests', label: 'Find briefs', icon: Search },
] as const;

/**
 * The promoter's own workspace, outside the artist studio.
 *
 * Access is decided from the live promoter profile rather than the session
 * token, whose capability list refreshes only every few minutes — reading the
 * token is what bounced brand-new promoters away from "Create service".
 */
export function PromoterWorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const { data: session, update } = useSession();
  const { data: profile, isLoading } = useMyPromoterProfileV2();
  const isAdmin = isAdminRole(session?.user?.role);
  const refreshed = useRef(false);

  const tokenCapabilities = (session?.user as { capabilities?: string[] } | undefined)?.capabilities ?? [];
  const tokenIsStale = Boolean(profile) && !tokenCapabilities.includes('promoter');

  // Bring the session up to date once so capability-driven UI elsewhere
  // (switcher, menus) agrees with what the API already knows.
  useEffect(() => {
    if (tokenIsStale && !refreshed.current) {
      refreshed.current = true;
      void update();
    }
  }, [tokenIsStale, update]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile && !isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-950/40">
          <Megaphone className="h-6 w-6 text-violet-500" />
        </div>
        <h1 className="text-xl font-bold">Set up your promoter profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          List promotion services, take orders from artists and get paid into your wallet. No artist account needed.
        </p>
        <Link
          href="/become-promoter"
          className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Become a promoter
        </Link>
      </div>
    );
  }

  const isActive = (href: string, exact?: boolean) =>
    exact
      ? pathname === href || pathname.startsWith('/promoter/services')
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-4 sm:py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Promoter workspace</p>
          <p className="truncate text-lg font-semibold">{profile?.display_name ?? 'Promoter'}</p>
        </div>
        {profile?.slug && (
          <Link
            href={`/promoters/${profile.slug}`}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            Public page
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <nav
        aria-label="Promoter workspace"
        className="mb-6 grid grid-cols-3 gap-1.5 sm:flex sm:gap-1 sm:border-b"
      >
        {TABS.map(({ href, label, icon: Icon, ...tab }) => {
          const active = isActive(href, 'exact' in tab ? tab.exact : false);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg border px-1.5 py-2 text-center text-xs font-medium transition-colors sm:flex-row sm:rounded-none sm:border-x-0 sm:border-t-0 sm:border-b-2 sm:px-3 sm:py-2.5 sm:text-sm',
                active
                  ? 'border-primary bg-primary/10 text-foreground sm:bg-transparent'
                  : 'border-border text-muted-foreground hover:text-foreground sm:border-transparent',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
