'use client';

import { cn } from '@/lib/utils';

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'default';
type StatusSize = 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  size?: StatusSize;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  error: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const sizeStyles: Record<StatusSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

// Auto-detect variant from common status names
function getVariantFromStatus(status: string): StatusVariant {
  const lowered = status.toLowerCase();
  
  if (['active', 'approved', 'published', 'verified', 'completed', 'paid', 'success'].includes(lowered)) {
    return 'success';
  }
  if (['pending', 'processing', 'draft', 'in_progress', 'review'].includes(lowered)) {
    return 'warning';
  }
  if (['inactive', 'rejected', 'failed', 'cancelled', 'suspended', 'banned', 'out_of_stock', 'error'].includes(lowered)) {
    return 'error';
  }
  if (['new', 'featured', 'highlighted'].includes(lowered)) {
    return 'info';
  }
  
  return 'default';
}

export function StatusBadge({ status, variant, size = 'md', className }: StatusBadgeProps) {
  const resolvedVariant = variant || getVariantFromStatus(status);
  
  // Format display text
  const displayText = status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
  
  return (
    <span
      className={cn(
        'rounded-full font-medium inline-block',
        sizeStyles[size],
        variantStyles[resolvedVariant],
        className
      )}
    >
      {displayText}
    </span>
  );
}
