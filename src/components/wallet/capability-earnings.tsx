'use client';

import Link from 'next/link';
import { Building2, CalendarDays, ChevronRight, Megaphone, Music2, Store } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCapabilities, type CapabilityName } from '@/hooks/useCapabilities';
import { useArtistEarnings } from '@/hooks/useArtist';

/**
 * The money a person earns from the capabilities they hold, shown inside their
 * one wallet.
 *
 * One account can hold several capabilities at once — the same human may be an
 * artist, an organizer and a promoter (see docs/architecture/CAPABILITIES.md).
 * Splitting the wallet per persona would give that person several balances and
 * no single answer to "how much do I have?", so every earning stream surfaces
 * here instead, gated on the grant rather than on a role name.
 *
 * Only streams with a real endpoint print a figure. The rest are navigation
 * until their earnings API exists — the wallet already dropped its "this month"
 * tiles for inventing totals, and an empty money figure would be the same
 * mistake wearing a different label.
 */

interface CapabilitySurface {
  label: string;
  href: string;
  icon: LucideIcon;
  /** What the person actually earns in this mode — shown when no figure exists. */
  blurb: string;
}

const CAPABILITY_SURFACES: Record<CapabilityName, CapabilitySurface> = {
  artist: {
    label: 'Artist earnings',
    href: '/artist/earnings',
    icon: Music2,
    blurb: 'Streams, downloads and tips',
  },
  organizer: {
    label: 'Event payouts',
    href: '/artist/events',
    icon: CalendarDays,
    blurb: 'Ticket sales, after fees',
  },
  seller: {
    label: 'Store payouts',
    href: '/artist/store',
    icon: Store,
    blurb: 'Orders fulfilled through your store',
  },
  // No promoter earnings surface exists yet — /promoters is a public directory
  // and /become-promoter is onboarding. /promotions is the only page carrying
  // this person's own campaign activity, so the row says that rather than
  // promising an earnings view that isn't built.
  promoter: {
    label: 'Promotion activity',
    href: '/promotions',
    icon: Megaphone,
    blurb: 'Campaigns you are running',
  },
  label: {
    label: 'Label earnings',
    href: '/artist/earnings',
    icon: Building2,
    blurb: 'Across the artists you manage',
  },
};

function CapabilityRow({
  surface,
  primary,
  secondary,
}: {
  surface: CapabilitySurface;
  /** The headline figure, already formatted. Omitted when there is nothing true to show. */
  primary?: string;
  secondary?: string;
}) {
  const Icon = surface.icon;

  return (
    <Link
      href={surface.href}
      className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="rounded-full bg-muted p-2 text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium">{surface.label}</p>
          <p className="truncate text-sm text-muted-foreground">{secondary ?? surface.blurb}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {primary && <span className="font-semibold tabular-nums">{primary}</span>}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

/**
 * Split out so `useArtistEarnings` only runs for people who actually hold the
 * artist capability — a listener should never fire an artist request from their
 * wallet.
 */
function ArtistEarningsRow() {
  const { data, isLoading } = useArtistEarnings();
  const surface = CAPABILITY_SURFACES.artist;

  if (isLoading || !data?.stats) {
    return <CapabilityRow surface={surface} />;
  }

  const { balance, pending_earnings: pending } = data.stats;

  return (
    <CapabilityRow
      surface={surface}
      primary={`UGX ${balance.toLocaleString()}`}
      secondary={
        pending > 0
          ? `UGX ${pending.toLocaleString()} still clearing`
          : surface.blurb
      }
    />
  );
}

export function CapabilityEarnings() {
  const { data: capabilities } = useCapabilities();

  const granted = (capabilities ?? []).filter((c) => c.status === 'granted');

  // A listener with no capabilities gets no empty section shouting at them.
  if (granted.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="mb-4 font-semibold">Your earnings</h2>

      <div className="divide-y overflow-hidden rounded-xl border bg-card">
        {granted.map(({ capability }) =>
          capability === 'artist' ? (
            <ArtistEarningsRow key={capability} />
          ) : (
            <CapabilityRow key={capability} surface={CAPABILITY_SURFACES[capability]} />
          ),
        )}
      </div>
    </div>
  );
}
