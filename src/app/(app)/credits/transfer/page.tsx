'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Coins,
  Loader2,
  Search,
  User,
  X,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useCreditBalance,
  useUserSearch,
  useTransferCredits,
  type UserSearchResult,
} from '@/hooks/usePayments';
import { useDebounce } from '@/hooks/useDebounce';

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];

export default function CreditTransferPage() {
  const [query, setQuery] = useState('');
  const [recipient, setRecipient] = useState<UserSearchResult | null>(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 300);
  const { data: balance } = useCreditBalance();
  const { data: searchResults, isFetching: searching } = useUserSearch(debouncedQuery);
  const transfer = useTransferCredits();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDropdownOpen(debouncedQuery.trim().length >= 2);
  }, [debouncedQuery]);

  const clearRecipient = () => {
    setRecipient(null);
    setQuery('');
    setDropdownOpen(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const selectRecipient = (user: UserSearchResult) => {
    setRecipient(user);
    setQuery('');
    setDropdownOpen(false);
  };

  const availableCredits = balance?.credits ?? 0;
  const parsedAmount = parseInt(amount, 10);
  const isAmountValid = parsedAmount >= 1 && parsedAmount <= 1000 && parsedAmount <= availableCredits;

  const handleSubmit = () => {
    if (!recipient || !isAmountValid) return;
    transfer.mutate(
      { recipient_id: recipient.id, amount: parsedAmount, message: message.trim() || undefined },
      {
        onSuccess: (res) => {
          setDone(res.message ?? `Sent ${parsedAmount} credits to ${recipient.name}`);
        },
        onError: (err: unknown) => {
          const msg = (err as { message?: string })?.message ?? 'Transfer failed';
          toast.error(msg);
        },
      }
    );
  };

  if (done) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h1 className="text-xl font-bold">Transfer Sent!</h1>
        <p className="mt-2 text-sm text-muted-foreground">{done}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/credits"
            className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted/60"
          >
            Back to Credits
          </Link>
          <button
            onClick={() => {
              setDone(null);
              setRecipient(null);
              setAmount('');
              setMessage('');
            }}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Send Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/credits" className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted/60">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-lg font-bold">Send Credits</h1>
          <p className="text-xs text-muted-foreground">
            Balance: <span className="font-semibold text-foreground">{availableCredits.toLocaleString()} credits</span>
          </p>
        </div>
      </div>

      {/* Recipient picker */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">To</p>

        {recipient ? (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
              {recipient.avatar_url ? (
                <Image src={recipient.avatar_url} alt={recipient.name} fill unoptimized className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{recipient.name}</p>
              <p className="text-xs text-muted-foreground">@{recipient.username}</p>
            </div>
            <button
              onClick={clearRecipient}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search by name or username…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim().length >= 2 && setDropdownOpen(true)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoComplete="off"
              />
              {searching && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </div>

            {dropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border bg-popover shadow-lg overflow-hidden">
                {!searchResults || searchResults.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-muted-foreground">No users found</p>
                ) : (
                  searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => selectRecipient(user)}
                      className="flex w-full items-center gap-3 px-3 py-2 hover:bg-muted/60 transition-colors"
                    >
                      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted">
                        {user.avatar_url ? (
                          <Image src={user.avatar_url} alt={user.name} fill unoptimized className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Amount</p>

        <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
          <Coins className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="number"
            min={1}
            max={Math.min(1000, availableCredits)}
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-xs text-muted-foreground">credits</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {QUICK_AMOUNTS.map((n) => (
            <button
              key={n}
              onClick={() => setAmount(String(n))}
              disabled={n > availableCredits}
              className={cn(
                'rounded-lg border py-1.5 text-sm font-medium transition-colors disabled:opacity-40',
                amount === String(n)
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'hover:bg-muted/60'
              )}
            >
              {n}
            </button>
          ))}
        </div>

        {parsedAmount > 0 && parsedAmount > availableCredits && (
          <p className="text-xs text-destructive">Insufficient credits</p>
        )}
        {parsedAmount > 1000 && (
          <p className="text-xs text-destructive">Maximum transfer is 1,000 credits</p>
        )}
      </div>

      {/* Message */}
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Message <span className="font-normal normal-case">(optional)</span>
        </p>
        <textarea
          rows={2}
          maxLength={200}
          placeholder="Add a note…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
        />
        <p className="text-right text-xs text-muted-foreground">{message.length}/200</p>
      </div>

      {/* Send button */}
      <button
        onClick={handleSubmit}
        disabled={!recipient || !isAmountValid || transfer.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {transfer.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Send {parsedAmount > 0 ? parsedAmount.toLocaleString() : ''} Credits
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Transfers are instant and irreversible. Max 1,000 credits per transfer.
      </p>
    </div>
  );
}
