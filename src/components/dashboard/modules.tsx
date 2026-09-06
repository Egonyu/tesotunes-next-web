'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  Award,
  CalendarDays,
  ChevronRight,
  Coins,
  Crown,
  Headphones,
  Landmark,
  Languages,
  MessageSquare,
  Mic2,
  Music2,
  ShoppingBag,
  TrendingUp,
  Trophy,
  Wallet,
} from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import type {
  DashboardArtist,
  DashboardContributions,
  DashboardDailyBonus,
  DashboardNextAction,
  DashboardOverview,
} from '@/hooks/useDashboard';

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

export function ModuleCard({
  title,
  icon: Icon,
  action,
  children,
  className,
}: {
  title: string;
  icon: React.ElementType;
  action?: { href: string; label: string };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-xl border bg-card p-4', className)}>
      <header className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </h2>
        {action && (
          <Link
            href={action.href}
            className="shrink-0 text-xs font-medium text-primary hover:underline"
          >
            {action.label}
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}

/** A four-up figure strip. Wraps to two columns on narrow screens. */
function StatStrip({
  stats,
}: {
  stats: Array<{ value: string; label: string; note?: string; tone?: 'up' | 'down' | 'flat' }>;
}) {
  return (
    <div className="grid grid-cols-2 gap-y-3 sm:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={cn(
            'px-3 first:pl-0',
            i % 2 === 1 && 'border-l sm:border-l',
            i % 2 === 0 && i > 0 && 'sm:border-l'
          )}
        >
          <p className="text-lg font-bold leading-tight tabular-nums">{s.value}</p>
          <p className="text-[11px] leading-snug text-muted-foreground">{s.label}</p>
          {s.note && (
            <p
              className={cn(
                'text-[10px] font-medium',
                s.tone === 'up' && 'text-emerald-600 dark:text-emerald-400',
                s.tone === 'down' && 'text-primary',
                (!s.tone || s.tone === 'flat') && 'text-muted-foreground'
              )}
            >
              {s.note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Daily bonus — offered only when the rules engine would actually award it
// ---------------------------------------------------------------------------

function waitLabel(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.round(minutes / 60);
    return `Come back in ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  return `Come back in ${Math.max(1, minutes)} min`;
}

export function DailyBonusBanner({
  bonus,
  onClaim,
  isClaiming,
}: {
  bonus: DashboardDailyBonus;
  onClaim: () => void;
  isClaiming: boolean;
}) {
  const streak = bonus.streak_days;

  return (
    <section className="flex items-center gap-3 rounded-2xl bg-primary/10 p-4">
      <span
        aria-hidden
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background"
      >
        <Crown className="h-5 w-5 text-primary" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold leading-snug">
          {bonus.available ? 'Earn more with daily bonus' : 'Daily bonus claimed'}
        </p>
        <p className="text-xs leading-snug text-muted-foreground">
          {bonus.available
            ? `Listen, explore and get ${formatNumber(bonus.credits)} free credits everyday.`
            : waitLabel(bonus.available_in_minutes)}
          {streak > 1 && ` · ${streak}-day streak`}
        </p>
      </div>

      {bonus.available && (
        <button
          type="button"
          onClick={onClaim}
          disabled={isClaiming}
          className="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isClaiming ? 'Claiming…' : 'Claim now'}
        </button>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Shortcuts — the rest of the platform, two up
// ---------------------------------------------------------------------------

const SHORTCUTS = [
  { href: '/artists', label: 'Artists', hint: 'Discover & support', Icon: Mic2 },
  { href: '/events', label: 'Events', hint: 'Find & book tickets', Icon: CalendarDays },
  { href: '/store', label: 'Store', hint: 'Merch & more', Icon: ShoppingBag },
  { href: '/sacco', label: 'SACCO', hint: 'Save & grow', Icon: Landmark },
  { href: '/awards', label: 'Awards', hint: 'Vote & support', Icon: Trophy },
  { href: '/forums', label: 'Forum', hint: 'Talk music', Icon: MessageSquare },
] as const;

export function ShortcutsModule() {
  return (
    <nav aria-label="Explore TesoTunes" className="grid grid-cols-2 gap-3">
      {SHORTCUTS.map(({ href, label, hint, Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-muted/50"
        >
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"
          >
            <Icon className="h-4 w-4 text-primary" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold leading-tight">{label}</span>
            <span className="block truncate text-[11px] leading-snug text-muted-foreground">
              {hint}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
      ))}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Needs you now — the obligations queue
// ---------------------------------------------------------------------------

const IMPORTANCE_DOT: Record<DashboardNextAction['importance'], string> = {
  high: 'border-primary bg-primary/15',
  medium: 'border-muted-foreground/40',
  low: 'border-muted-foreground/25',
};

export function NeedsYouNowModule({
  actions,
  completion,
}: {
  actions: DashboardNextAction[];
  completion: number;
}) {
  if (actions.length === 0) return null;

  return (
    <section className="rounded-xl border border-primary/25 bg-primary/[0.03] p-4">
      <header className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <AlertTriangle className="h-4 w-4 text-primary" />
          Needs you now
        </h2>
        <span className="shrink-0 text-xs text-muted-foreground">
          {actions.length} {actions.length === 1 ? 'item' : 'items'}
        </span>
      </header>

      <div className="mb-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold">Profile {completion}% done</p>
          <span className="text-xs tabular-nums text-muted-foreground">{completion}/100</span>
        </div>
        <ProgressBar percent={completion} />
      </div>

      <ul className="space-y-2">
        {actions.map((action) => {
          const row = (
            <>
              <span
                aria-hidden
                className={cn(
                  'mt-0.5 h-4 w-4 shrink-0 rounded-full border-2',
                  IMPORTANCE_DOT[action.importance]
                )}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium leading-snug">{action.label}</span>
                <span className="block text-xs leading-snug text-muted-foreground">
                  {action.why}
                </span>
              </span>
              {action.route && (
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              )}
            </>
          );

          return (
            <li key={action.key}>
              {action.route ? (
                <Link
                  href={action.route}
                  className="flex items-start gap-3 rounded-lg border bg-card px-3 py-2.5 transition-colors hover:bg-muted/50"
                >
                  {row}
                </Link>
              ) : (
                <div className="flex items-start gap-3 rounded-lg border bg-card px-3 py-2.5">
                  {row}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Money — two balances, each labelled for what it actually is
// ---------------------------------------------------------------------------

export function WalletsModule({ wallet }: { wallet: DashboardOverview['wallet'] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link href="/credits" className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Coins className="h-3.5 w-3.5 text-primary" />
          Credits
        </p>
        <p className="mt-1.5 truncate text-xl font-bold tabular-nums">
          {formatNumber(wallet.credits_balance)}
        </p>
        <p className="text-[11px] leading-snug text-muted-foreground">
          {wallet.credits_earned_today > 0
            ? `+${formatNumber(wallet.credits_earned_today)} earned today`
            : 'Earn by listening and contributing'}
        </p>
      </Link>

      <Link href="/credits" className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Wallet className="h-3.5 w-3.5 text-primary" />
          Cash wallet
        </p>
        <p className="mt-1.5 truncate text-xl font-bold tabular-nums">
          {formatCurrency(wallet.ugx_balance)}
        </p>
        <p className="text-[11px] leading-snug text-muted-foreground">
          Money you topped up — not earnings
        </p>
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Earnings — in whichever currency the ledger actually settled
// ---------------------------------------------------------------------------

/** Minimum balance before a UGX payout can be requested. */
const PAYOUT_MINIMUM_UGX = 50000;

export function EarningsModule({ earnings }: { earnings: DashboardOverview['earnings'] }) {
  const { pending, available, paid_out: paidOut } = earnings;

  const hasUgx = available.ugx + paidOut.ugx + pending.ugx > 0;
  const hasCredits = available.credits + paidOut.credits + pending.credits > 0;

  if (!hasUgx && !hasCredits) return null;

  const show = (money: { ugx: number; credits: number }) =>
    hasUgx ? formatCurrency(money.ugx) : `${formatNumber(money.credits)} credits`;

  const rows = [
    { key: 'available', label: 'Available', note: 'Yours to withdraw', money: available, tone: 'text-emerald-600 dark:text-emerald-400' },
    { key: 'pending', label: 'Pending', note: 'Clears once confirmed', money: pending, tone: 'text-amber-600 dark:text-amber-400' },
    { key: 'paid_out', label: 'Paid out', note: 'Already withdrawn', money: paidOut, tone: 'text-muted-foreground' },
  ];

  const towardsPayout = hasUgx
    ? Math.round((available.ugx / PAYOUT_MINIMUM_UGX) * 100)
    : null;

  return (
    <ModuleCard title="What you've earned" icon={TrendingUp}>
      <dl className="divide-y">
        {rows.map((row) => (
          <div key={row.key} className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0">
            <dt className="min-w-0">
              <span className="block text-sm font-medium">{row.label}</span>
              <span className="block text-xs text-muted-foreground">{row.note}</span>
            </dt>
            <dd className={cn('shrink-0 text-sm font-semibold tabular-nums', row.tone)}>
              {show(row.money)}
            </dd>
          </div>
        ))}
      </dl>

      {towardsPayout !== null && available.ugx < PAYOUT_MINIMUM_UGX && (
        <div className="mt-3 rounded-lg border bg-muted/40 p-3">
          <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">
                {formatCurrency(available.ugx)}
              </span>{' '}
              of {formatCurrency(PAYOUT_MINIMUM_UGX)} minimum
            </span>
            <span className="tabular-nums">{towardsPayout}%</span>
          </div>
          <ProgressBar percent={towardsPayout} />
        </div>
      )}
    </ModuleCard>
  );
}

// ---------------------------------------------------------------------------
// Listening — all-time leads, movement alongside
// ---------------------------------------------------------------------------

function movement(current: number, previous: number) {
  if (previous === 0 && current === 0) return { note: 'no plays yet', tone: 'flat' as const };
  if (previous === 0) return { note: 'new this month', tone: 'up' as const };

  const delta = Math.round(((current - previous) / previous) * 100);
  if (delta === 0) return { note: 'same as last month', tone: 'flat' as const };

  return {
    note: `${delta > 0 ? '▲' : '▼'} ${Math.abs(delta)}% vs last month`,
    tone: delta > 0 ? ('up' as const) : ('down' as const),
  };
}

export function ListeningModule({ listening }: { listening: DashboardOverview['listening'] }) {
  const move = movement(listening.plays_30d, listening.plays_previous_30d);

  return (
    <ModuleCard title="Your listening" icon={Headphones} action={{ href: '/history', label: 'History' }}>
      <StatStrip
        stats={[
          { value: formatNumber(listening.plays_total), label: 'Songs played', note: 'all time' },
          { value: formatNumber(listening.plays_30d), label: 'Last 30 days', note: move.note, tone: move.tone },
          { value: `${formatNumber(listening.minutes_30d)}m`, label: 'Listened', note: 'last 30 days' },
          {
            value: listening.last_played_at
              ? new Date(listening.last_played_at).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                })
              : '—',
            label: 'Last played',
            note: listening.completed_30d > 0
              ? `${formatNumber(listening.completed_30d)} full plays`
              : 'no full plays',
          },
        ]}
      />
    </ModuleCard>
  );
}

// ---------------------------------------------------------------------------
// Ateso corpus — tier comes from quality checks, not volume
// ---------------------------------------------------------------------------

export function ContributionsModule({ contributions }: { contributions: DashboardContributions }) {
  const {
    gold_attempts: attempts,
    gold_attempts_required: required,
    trusted_min_pass_rate: passRate,
  } = contributions;

  const needsChecks = attempts < required;

  return (
    <ModuleCard
      title="Ateso corpus"
      icon={Languages}
      action={{ href: '/contribute', label: 'Contribute' }}
    >
      <StatStrip
        stats={[
          { value: formatNumber(contributions.submissions_total), label: 'Submitted' },
          { value: formatNumber(contributions.submissions_accepted), label: 'Accepted' },
          { value: formatNumber(contributions.validations_total), label: 'Reviewed' },
          { value: formatNumber(contributions.credits_earned_total), label: 'Credits earned' },
        ]}
      />

      <div className="mt-3 rounded-lg border bg-muted/40 p-3">
        <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5" />
            <span className="font-semibold capitalize text-foreground">{contributions.tier}</span>
            {needsChecks && <span>→ trusted</span>}
          </span>
          <span className="tabular-nums">
            {attempts} of {required} quality checks
          </span>
        </div>
        <ProgressBar percent={(attempts / Math.max(1, required)) * 100} />
        <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
          Your tier comes from quality checks, not how much you submit — {required} of them, then{' '}
          {passRate}% correct. Trusted unlocks paid review work.
        </p>
      </div>
    </ModuleCard>
  );
}

// ---------------------------------------------------------------------------
// Artist — the catalogue, for accounts that have one
// ---------------------------------------------------------------------------

export function ArtistModule({ artist }: { artist: DashboardArtist }) {
  return (
    <ModuleCard
      title="Your music"
      icon={Music2}
      action={{ href: '/artist/dashboard', label: 'Studio' }}
    >
      <StatStrip
        stats={[
          { value: formatNumber(artist.total_plays), label: 'Total plays' },
          { value: formatNumber(artist.followers), label: 'Followers' },
          { value: formatNumber(artist.songs_published), label: 'Songs live' },
          {
            value: formatNumber(artist.songs_pending_review),
            label: 'In review',
            note: artist.songs_draft > 0 ? `${artist.songs_draft} draft` : undefined,
          },
        ]}
      />
    </ModuleCard>
  );
}
