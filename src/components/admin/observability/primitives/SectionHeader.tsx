'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SectionSubTab {
  key: string;
  label: string;
  badge?: ReactNode;
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  subTabs?: SectionSubTab[];
  activeSubTab?: string;
  onSubTabChange?: (key: string) => void;
  actions?: ReactNode;
}

export function SectionHeader({
  title,
  description,
  subTabs,
  activeSubTab,
  onSubTabChange,
  actions,
}: SectionHeaderProps) {
  return (
    <div className="space-y-4 border-b pb-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>

      {subTabs && subTabs.length > 0 ? (
        <nav className="flex flex-wrap gap-1" aria-label={`${title} sub-sections`}>
          {subTabs.map((tab) => {
            const isActive = tab.key === activeSubTab;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onSubTabChange?.(tab.key)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <span>{tab.label}</span>
                {tab.badge ? (
                  <span
                    className={cn(
                      'inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold',
                      isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-foreground/70',
                    )}
                  >
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
