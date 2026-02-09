'use client';

import { ReactNode } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  // Support both API styles
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'destructive' | 'warning' | 'default';
  isLoading?: boolean;
  children?: ReactNode;
}

export function ConfirmDialog({
  isOpen,
  open,
  onClose,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading,
  children,
}: ConfirmDialogProps) {
  // Support both 'open' and 'isOpen'
  const isDialogOpen = open ?? isOpen ?? false;
  
  // Support both 'onOpenChange' and 'onClose'
  const handleClose = () => {
    onOpenChange?.(false);
    onClose?.();
  };
  
  if (!isDialogOpen) return null;

  // Normalize 'destructive' to 'danger'
  const normalizedVariant = variant === 'destructive' ? 'danger' : variant;

  const variantStyles = {
    danger: {
      icon: <Trash2 className="h-6 w-6" />,
      iconBg: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
      button: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
      icon: <AlertTriangle className="h-6 w-6" />,
      iconBg: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    },
    default: {
      icon: <AlertTriangle className="h-6 w-6" />,
      iconBg: 'bg-primary/10 text-primary',
      button: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    },
  };

  const styles = variantStyles[normalizedVariant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-background rounded-xl shadow-xl max-w-md w-full mx-4 p-6 space-y-4">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 hover:bg-muted rounded-lg"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-full", styles.iconBg)}>
            {styles.icon}
          </div>
          <div className="flex-1 pt-1">
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
        
        {children}
        
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 border rounded-lg hover:bg-muted disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn("px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50", styles.button)}
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
