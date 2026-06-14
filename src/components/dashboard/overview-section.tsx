'use client';

import Link from 'next/link';
import { Wallet, Coins, Headphones, Languages, TrendingUp, Loader2, Award } from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { useDashboardOverview } from '@/hooks/useDashboard';

/**
 * Unified "Your overview" block for the account dashboard — wallet, money
 * earned across every vertical, listening, and (when relevant) Ateso corpus
 * standing. Capability-aware: sections appear only when they have data.
 */
export function DashboardOverviewSection() {
  const { data, isLoading } = useDashboardOverview();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!data) return null;

  const earned = data.earnings.available.ugx + data.earnings.paid_out.ugx;

  return (
    <div className="space-y-4">
      {/* Headline tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile icon={Wallet} label="Wallet (UGX)" value={formatCurrency(data.wallet.ugx_balance)} href="/credits" />
        <Tile icon={Coins} label="Credits" value={formatNumber(data.wallet.credits_balance)} href="/credits" />
        <Tile icon={TrendingUp} label="Earned (UGX)" value={formatCurrency(earned)} hint={`${formatCurrency(data.earnings.pending.ugx)} pending`} />
        <Tile icon={Headphones} label="Plays (30d)" value={formatNumber(data.listening.plays_30d)} hint={`${formatNumber(data.listening.plays_total)} all-time`} href="/history" />
      </div>

      {/* Contributions standing — only for corpus contributors */}
      {data.contributions && (
        <Link href="/contribute" className="block rounded-xl border bg-card p-4 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Languages className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium flex items-center gap-2">
                Ateso corpus
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground capitalize">
                  <Award className="h-3.5 w-3.5" />{data.contributions.tier}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                {formatNumber(data.contributions.submissions_accepted)} accepted ·
                {' '}{formatNumber(data.contributions.validations_total)} reviews ·
                {' '}{formatNumber(data.contributions.credits_earned_total)} credits earned
              </p>
            </div>
          </div>
        </Link>
      )}

      {/* Recent activity */}
      {data.recent_activity.length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <p className="font-medium mb-3">Recent activity</p>
          <ul className="space-y-2">
            {data.recent_activity.map((a, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{a.label}</span>
                <span className="text-xs text-muted-foreground">{a.at ? new Date(a.at).toLocaleDateString() : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Tile({ icon: Icon, label, value, hint, href }: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
  href?: string;
}) {
  const body = (
    <div className={cn('rounded-xl border bg-card p-4', href && 'hover:bg-muted/50 transition-colors')}>
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-xl font-bold truncate">{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground truncate">{hint}</p>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}
