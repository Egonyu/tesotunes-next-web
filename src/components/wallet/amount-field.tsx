'use client';

import { cn } from '@/lib/utils';

/**
 * Money input shared by the wallet and artist cash-out flows.
 *
 * The two flows are otherwise different products — different minimums,
 * different payout methods, different endpoints — but they ask for an amount
 * the same way, and both used to get it wrong in the same ways: a keyboard
 * that isn't numeric, no thousands separators, and a minimum the user only
 * discovers by failing.
 */

/** Digits only, so "50,000" and "50 000" both parse. */
export function parseAmount(raw: string): number {
  const digits = raw.replace(/\D/g, '');
  return digits === '' ? 0 : parseInt(digits, 10);
}

export function formatAmount(value: number): string {
  return value === 0 ? '' : value.toLocaleString();
}

/**
 * The single source of truth for whether an amount can be submitted. Parents
 * call this to gate their submit button so the button and the inline message
 * can never disagree.
 */
export function amountProblem(amount: number, min: number, max: number): string | null {
  if (amount === 0) return null;
  if (amount < min) return `The smallest cash out is UGX ${min.toLocaleString()}.`;
  if (amount > max) return "That's more than your available balance.";
  return null;
}

/** Compact chip label: 50,000 → "50K", 1,000,000 → "1M". */
function chipLabel(amount: number): string {
  if (amount >= 1_000_000) return `${amount / 1_000_000}M`;
  if (amount >= 1_000) return `${amount / 1_000}K`;
  return amount.toLocaleString();
}

export function AmountField({
  id = 'amount',
  label = 'Amount',
  value,
  onChange,
  min,
  max,
  presets = [],
  maxLabel = 'All of it',
  disabled,
}: {
  id?: string;
  label?: string;
  value: number;
  onChange: (amount: number) => void;
  min: number;
  max: number;
  presets?: number[];
  maxLabel?: string;
  disabled?: boolean;
}) {
  const problem = amountProblem(value, min, max);
  const helpId = `${id}-help`;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          UGX
        </span>
        <input
          id={id}
          // Numeric keypad on a phone — this is a money field on a
          // mobile-first product, not free text. type="number" is avoided
          // deliberately: it forbids the thousands separators shown below.
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          value={formatAmount(value)}
          onChange={(e) => onChange(parseAmount(e.target.value))}
          placeholder="0"
          aria-describedby={helpId}
          aria-invalid={problem !== null}
          className={cn(
            'w-full rounded-lg border bg-background py-3 pl-14 pr-4 text-lg font-semibold tabular-nums',
            problem && 'border-red-500'
          )}
        />
      </div>

      {(presets.length > 0 || max >= min) && (
        <div className="flex flex-wrap gap-2">
          {presets
            .filter((preset) => preset <= max)
            .map((preset) => (
              <button
                key={preset}
                type="button"
                disabled={disabled}
                onClick={() => onChange(preset)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50',
                  value === preset ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                )}
              >
                {chipLabel(preset)}
              </button>
            ))}

          {max >= min && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(max)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50',
                value === max ? 'border-primary bg-primary/5' : 'hover:bg-muted'
              )}
            >
              {maxLabel}
            </button>
          )}
        </div>
      )}

      <p
        id={helpId}
        className={cn('text-xs', problem ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground')}
      >
        {problem ?? `Minimum UGX ${min.toLocaleString()}.`}
      </p>
    </div>
  );
}
