'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: number;
  max?: number;
  min?: number;
  step?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value = 0, max = 100, min = 0, step = 1, onChange, disabled = false, ...props }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const sliderRef = React.useRef<HTMLDivElement>(null);

    const percentage = ((value - min) / (max - min)) * 100;

    const handleMove = React.useCallback(
      (clientX: number) => {
        if (!sliderRef.current || disabled) return;

        const rect = sliderRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = Math.max(0, Math.min(1, x / rect.width));
        const newValue = Math.round((percent * (max - min) + min) / step) * step;
        onChange?.(newValue);
      },
      [max, min, step, onChange, disabled]
    );

    const handleMouseDown = (e: React.MouseEvent) => {
      if (disabled) return;
      setIsDragging(true);
      handleMove(e.clientX);
    };

    React.useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
          handleMove(e.clientX);
        }
      };

      const handleMouseUp = () => {
        setIsDragging(false);
      };

      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging, handleMove]);

    return (
      <div
        ref={(node) => {
          sliderRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onMouseDown={handleMouseDown}
        {...props}
      >
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <div
            className="absolute h-full bg-primary"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div
          className={cn(
            'absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            isDragging && 'scale-110',
            disabled && 'pointer-events-none'
          )}
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };
