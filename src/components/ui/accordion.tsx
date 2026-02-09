'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
}

function Accordion({ className, children, ...props }: AccordionProps) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

interface AccordionItemContextValue {
  value: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | undefined>(undefined);

function AccordionItem({ value, className, children, ...props }: AccordionItemProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <AccordionItemContext.Provider value={{ value, open, setOpen }}>
      <div className={cn('border-b', className)} {...props}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

function AccordionTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(AccordionItemContext);
  if (!context) throw new Error('AccordionTrigger must be used within AccordionItem');

  return (
    <button
      className={cn(
        'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline w-full text-left',
        className
      )}
      onClick={() => context.setOpen(!context.open)}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          'h-4 w-4 shrink-0 transition-transform duration-200',
          context.open && 'rotate-180'
        )}
      />
    </button>
  );
}

function AccordionContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(AccordionItemContext);
  if (!context) throw new Error('AccordionContent must be used within AccordionItem');

  if (!context.open) return null;

  return (
    <div
      className={cn('overflow-hidden text-sm pb-4 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
