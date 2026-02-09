'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg';
}

const spinnerSizes = {
  sm: 'h-4 w-4',
  default: 'h-6 w-6',
  lg: 'h-8 w-8',
};

function Spinner({ className, size = 'default', ...props }: SpinnerProps) {
  return (
    <div
      className={cn('flex items-center justify-center', className)}
      {...props}
    >
      <Loader2 className={cn('animate-spin', spinnerSizes[size])} />
    </div>
  );
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export { Spinner, Skeleton };
