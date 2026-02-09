'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'error' | 'warning';
  title?: string;
  description?: string;
  onClose?: () => void;
}

const toastVariants = {
  default: 'bg-background border',
  success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
  error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
  warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
};

function Toast({
  className,
  variant = 'default',
  title,
  description,
  onClose,
  children,
  ...props
}: ToastProps) {
  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm rounded-lg border p-4 shadow-lg',
        'animate-in slide-in-from-bottom-5',
        toastVariants[variant],
        className
      )}
      {...props}
    >
      <div className="flex gap-3">
        <div className="flex-1">
          {title && <p className="text-sm font-semibold">{title}</p>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {children}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

interface ToastContainerProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const positionClasses = {
  'top-right': 'top-0 right-0',
  'top-left': 'top-0 left-0',
  'bottom-right': 'bottom-0 right-0',
  'bottom-left': 'bottom-0 left-0',
};

function ToastContainer({ children, position = 'bottom-right' }: ToastContainerProps) {
  return (
    <div
      className={cn(
        'fixed z-[100] flex max-h-screen flex-col-reverse gap-2 p-4 sm:flex-col',
        positionClasses[position]
      )}
    >
      {children}
    </div>
  );
}

export { Toast, ToastContainer };
