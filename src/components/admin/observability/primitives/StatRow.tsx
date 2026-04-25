'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatRowProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

const columnClasses: Record<NonNullable<StatRowProps['columns']>, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 xl:grid-cols-3',
  4: 'md:grid-cols-2 xl:grid-cols-4',
  5: 'md:grid-cols-2 xl:grid-cols-5',
  6: 'md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6',
};

export function StatRow({ children, columns = 4, className }: StatRowProps) {
  return (
    <div className={cn('grid gap-3 sm:gap-4', columnClasses[columns], className)}>
      {children}
    </div>
  );
}
