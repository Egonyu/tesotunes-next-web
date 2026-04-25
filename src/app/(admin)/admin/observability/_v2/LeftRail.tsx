'use client';

import type { LucideIcon } from 'lucide-react';
import { Activity, Coins, Gauge, ScanLine, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useObservabilityShellStore, type ShellSectionKey } from './shellStore';

interface RailItem {
  key: ShellSectionKey;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Populated by the shell from live data; optional until wired. */
  badge?: { value: number; tone: 'muted' | 'warn' | 'crit' };
}

const RAIL_ITEMS: RailItem[] = [
  { key: 'overview', label: 'Overview', description: 'Health at a glance', icon: Gauge },
  { key: 'threats', label: 'Threats', description: 'Events, entry points, attackers, bots', icon: ShieldAlert },
  { key: 'identity', label: 'Identity & Money', description: 'Sessions, payments, stakeholders', icon: Coins },
  { key: 'infra', label: 'Infrastructure', description: 'Collectors, DB, hosts, integrity', icon: Activity },
  { key: 'investigations', label: 'Investigations', description: 'Incidents & audit trail', icon: ScanLine },
];

interface LeftRailProps {
  badges?: Partial<Record<ShellSectionKey, { value: number; tone: 'muted' | 'warn' | 'crit' }>>;
}

export function LeftRail({ badges }: LeftRailProps) {
  const activeSection = useObservabilityShellStore((s) => s.activeSection);
  const setSection = useObservabilityShellStore((s) => s.setSection);

  return (
    <nav
      aria-label="Observability sections"
      className="hidden w-56 shrink-0 border-r bg-card/50 lg:block"
    >
      <ul className="space-y-1 p-3">
        {RAIL_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === activeSection;
          const badge = badges?.[item.key];
          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => setSection(item.key)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                  isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted',
                )}
              >
                <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium">{item.label}</span>
                    {badge && badge.value > 0 ? (
                      <span
                        className={cn(
                          'inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold',
                          isActive
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : badge.tone === 'crit'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300'
                              : badge.tone === 'warn'
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                : 'bg-muted text-foreground/70',
                        )}
                      >
                        {badge.value}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      'mt-0.5 block text-xs',
                      isActive ? 'text-primary-foreground/80' : 'text-muted-foreground',
                    )}
                  >
                    {item.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
