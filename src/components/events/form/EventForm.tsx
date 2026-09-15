'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  CATEGORIES,
  EventDraft,
  FeeHandling,
  StepErrors,
  TIER_PRESETS,
  TicketingMode,
  TierDraft,
  formatUGX,
  isFree,
  newTier,
  normalizedTiers,
  sellsOnTesotunes,
  ticketSummary,
  validateStep,
} from './event-form-model';

const GUIDE = '/events/organizer-guide';

const STEPS = ['Event', 'Tickets', 'Publish'] as const;

const MODES: { value: TicketingMode; label: string; hint: string }[] = [
  { value: 'tesotunes_managed', label: 'Sell here', hint: 'Tesotunes sells & scans' },
  { value: 'free_rsvp', label: 'Free RSVP', hint: 'No payment' },
  { value: 'hybrid', label: 'Hybrid', hint: 'Here + your own' },
  { value: 'external_only', label: 'Elsewhere', hint: 'Promote only' },
];

interface Simulation {
  platform_commission_percent: number;
  processing_fee_percent: number;
  fee_handling: FeeHandling;
  totals: { customer_paid_total: number; organizer_net_amount: number; tesotunes_fee_revenue: number; gross_revenue: number };
}

export interface EventFormProps {
  mode: 'artist' | 'admin';
  initial: EventDraft;
  isEdit?: boolean;
  submitting: boolean;
  serverErrors?: { errors: StepErrors; step: number } | null;
  estimateEndpoint: string;
  onSubmit: (draft: EventDraft, intent: 'draft' | 'publish' | 'save') => void;
  onCancel: () => void;
}

const inputCls =
  'w-full min-w-0 rounded-lg border bg-background px-3 py-2.5 text-[15px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-muted disabled:text-muted-foreground';

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn('block min-w-0', className)}>
      <span className={cn('mb-1 block text-xs font-medium', error ? 'text-red-600' : 'text-muted-foreground')}>
        {error || label}
      </span>
      {children}
    </label>
  );
}

function LearnMore({ anchor, children = 'Learn more' }: { anchor: string; children?: React.ReactNode }) {
  return (
    <Link href={`${GUIDE}#${anchor}`} target="_blank" className="text-xs font-medium text-primary hover:underline">
      {children}
    </Link>
  );
}

export default function EventForm({
  mode,
  initial,
  isEdit = false,
  submitting,
  serverErrors,
  estimateEndpoint,
  onSubmit,
  onCancel,
}: EventFormProps) {
  const [draft, setDraft] = useState<EventDraft>(initial);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<StepErrors>({});
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => setDraft(initial), [initial]);

  useEffect(() => {
    if (serverErrors) {
      setErrors(serverErrors.errors);
      setStep(serverErrors.step);
    }
  }, [serverErrors]);

  const set = <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    if (errors[key as string]) setErrors(({ [key as string]: _, ...rest }) => rest);
  };

  const setTier = (index: number, patch: Partial<TierDraft>) => {
    setDraft((d) => ({ ...d, tiers: d.tiers.map((t, i) => (i === index ? { ...t, ...patch } : t)) }));
    const touched = Object.keys(patch).map((k) => `tier.${index}.${k}`);
    if (touched.some((k) => errors[k])) {
      setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !touched.includes(k))));
    }
  };

  const goTo = (next: number) => {
    if (next > step) {
      for (let s = step; s < next; s += 1) {
        const found = validateStep(s, draft);
        if (Object.keys(found).length) {
          setErrors(found);
          setStep(s);
          topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }
    }
    setErrors({});
    setStep(next);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const submit = (intent: 'draft' | 'publish' | 'save') => {
    for (let s = 0; s < 2; s += 1) {
      const found = validateStep(s, draft);
      if (Object.keys(found).length) {
        setErrors(found);
        setStep(s);
        return;
      }
    }
    onSubmit(draft, intent);
  };

  return (
    <div ref={topRef} className="mx-auto w-full max-w-3xl scroll-mt-20 pb-28">
      {/* Progress */}
      <ol className="mb-5 grid grid-cols-3 gap-2">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => (i < step ? goTo(i) : i > step ? goTo(i) : undefined)}
              className="group w-full text-left"
            >
              <span
                className={cn(
                  'block h-1.5 rounded-full transition-colors',
                  i < step ? 'bg-emerald-500' : i === step ? 'bg-primary' : 'bg-muted',
                )}
              />
              <span
                className={cn(
                  'mt-1.5 flex items-center gap-1 text-xs font-medium',
                  i === step ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {i < step && <Check className="h-3 w-3 text-emerald-600" />}
                {i + 1}. {label}
              </span>
            </button>
          </li>
        ))}
      </ol>

      {step === 0 && <StepEvent mode={mode} draft={draft} errors={errors} set={set} />}
      {step === 1 && (
        <StepTickets
          draft={draft}
          errors={errors}
          set={set}
          setTier={setTier}
          estimateEndpoint={estimateEndpoint}
        />
      )}
      {step === 2 && <StepPublish mode={mode} isEdit={isEdit} draft={draft} set={set} estimateEndpoint={estimateEndpoint} />}

      {/* Sticky actions — thumb reach on phones */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:sticky md:bottom-4 md:mt-6 md:rounded-xl md:border">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3">
          {step === 0 ? (
            <button type="button" onClick={onCancel} className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">
              Cancel
            </button>
          ) : (
            <button type="button" onClick={() => goTo(step - 1)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          )}
          <div className="flex-1" />
          {step < 2 ? (
            <button
              type="button"
              onClick={() => goTo(step + 1)}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : isEdit ? (
            <button
              type="button"
              disabled={submitting}
              onClick={() => submit('save')}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={submitting}
                onClick={() => submit('draft')}
                className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-60"
              >
                Save draft
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => submit('publish')}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Publish
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── Step 1: Event ───────────────────────────── */

function StepEvent({
  mode,
  draft,
  errors,
  set,
}: {
  mode: 'artist' | 'admin';
  draft: EventDraft;
  errors: StepErrors;
  set: <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <section className="space-y-4">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className={cn(
          'relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-muted/40 text-muted-foreground transition hover:border-primary/50 sm:aspect-[21/9]',
          draft.coverPreview && 'border-solid',
        )}
      >
        {draft.coverPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={draft.coverPreview} alt="Event cover" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-sm">
            <ImagePlus className="h-7 w-7" />
            Add a poster or cover photo
          </span>
        )}
        {draft.coverPreview && (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white">Change</span>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            set('cover', file);
            set('coverPreview', URL.createObjectURL(file));
          }
        }}
      />

      {mode === 'admin' && <AdminOwner draft={draft} set={set} />}

      <Field label="Event name" error={errors.title}>
        <input className={inputCls} value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="Teete Experience" />
      </Field>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => set('category', c.value)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm transition',
              draft.category === c.value ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted',
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2">
        <Field label="Date" error={errors.startDate}>
          <input type="date" className={inputCls} value={draft.startDate} onChange={(e) => set('startDate', e.target.value)} />
        </Field>
        <Field label="Starts" error={errors.startTime}>
          <input type="time" className={inputCls} value={draft.startTime} onChange={(e) => set('startTime', e.target.value)} />
        </Field>
        <Field label="Ends" error={errors.endTime}>
          <input type="time" className={inputCls} value={draft.endTime} onChange={(e) => set('endTime', e.target.value)} />
        </Field>
      </div>
      <details className="-mt-2 text-sm" open={Boolean(draft.endDate)}>
        <summary className="cursor-pointer text-xs font-medium text-muted-foreground">Runs past midnight or over several days?</summary>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Field label="End date" error={errors.endDate}>
            <input type="date" min={draft.startDate} className={inputCls} value={draft.endDate} onChange={(e) => set('endDate', e.target.value)} />
          </Field>
        </div>
      </details>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Venue" error={errors.venueName} className="col-span-2">
          <input className={inputCls} value={draft.venueName} onChange={(e) => set('venueName', e.target.value)} placeholder="Flame Club Oditel" />
        </Field>
        <Field label="City" error={errors.city}>
          <input className={inputCls} value={draft.city} onChange={(e) => set('city', e.target.value)} placeholder="Soroti" />
        </Field>
        <Field label="Country">
          <input className={inputCls} value={draft.country} onChange={(e) => set('country', e.target.value)} />
        </Field>
        <Field label="Street / landmark (optional)" className="col-span-2">
          <input className={inputCls} value={draft.venueAddress} onChange={(e) => set('venueAddress', e.target.value)} placeholder="Kapelebyong Road" />
        </Field>
      </div>

      <Field label="About the event" error={errors.description}>
        <textarea
          rows={3}
          className={cn(inputCls, 'resize-y')}
          value={draft.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Who's performing and what to expect"
        />
      </Field>
    </section>
  );
}

function AdminOwner({
  draft,
  set,
}: {
  draft: EventDraft;
  set: <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => void;
}) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const { data: artists = [], isFetching } = useQuery({
    queryKey: ['admin', 'artists-select', search],
    queryFn: async () => {
      const res = await apiGet<{ data: { id: string; name: string }[] } | { id: string; name: string }[]>(
        `/admin/artists?per_page=20${search ? `&search=${encodeURIComponent(search)}` : ''}`,
      );
      return Array.isArray(res) ? res : res.data ?? [];
    },
    enabled: open,
  });

  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl border bg-muted/30 p-3">
      <div className="relative col-span-2">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Artist (ticket money settles to them)</span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(inputCls, 'flex items-center justify-between text-left')}
        >
          <span className={draft.artistName ? '' : 'text-muted-foreground'}>{draft.artistName || 'Choose artist (or leave as you)'}</span>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </button>
        {open && (
          <div className="absolute z-30 mt-1 w-full rounded-lg border bg-popover p-2 shadow-lg">
            <div className="flex items-center gap-2 rounded-md border px-2">
              <Search className="h-4 w-4 opacity-60" />
              <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent py-2 text-sm outline-none" placeholder="Search artists" />
              {isFetching && <Loader2 className="h-4 w-4 animate-spin opacity-60" />}
            </div>
            <ul className="mt-1 max-h-56 overflow-y-auto">
              <li>
                <button type="button" className="w-full rounded px-2 py-2 text-left text-sm hover:bg-muted" onClick={() => { set('artistId', ''); set('artistName', ''); setOpen(false); }}>
                  No artist — keep on my account
                </button>
              </li>
              {artists.map((a) => (
                <li key={a.id}>
                  <button type="button" className="w-full rounded px-2 py-2 text-left text-sm hover:bg-muted" onClick={() => { set('artistId', String(a.id)); set('artistName', a.name); setOpen(false); }}>
                    {a.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Field label="Status">
        <select className={inputCls} value={draft.status} onChange={(e) => set('status', e.target.value)}>
          {['draft', 'published', 'postponed', 'cancelled', 'completed'].map((s) => (
            <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </Field>
      <label className="flex items-end gap-2 pb-2.5 text-sm">
        <input type="checkbox" className="h-4 w-4" checked={draft.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} />
        Featured
      </label>
    </div>
  );
}

/* ──────────────────────────── Step 2: Tickets ──────────────────────────── */

function useEstimate(draft: EventDraft, endpoint: string, enabled: boolean) {
  const tiers = normalizedTiers(draft).filter((t) => t.quantity > 0);
  const payload = {
    ticketing_mode: draft.ticketingMode,
    fee_handling: draft.feeHandling,
    currency: 'UGX',
    ticket_tiers: tiers.map((t) => ({ name: t.name || 'Ticket', price: t.price, quantity: t.quantity })),
  };
  const key = JSON.stringify(payload);
  const [debounced, setDebounced] = useState(key);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(key), 400);
    return () => clearTimeout(id);
  }, [key]);

  return useQuery({
    queryKey: ['event-fee-estimate', endpoint, debounced],
    queryFn: () => apiPost<{ data: Simulation }>(endpoint, JSON.parse(debounced)).then((r) => r.data),
    enabled: enabled && tiers.length > 0,
    staleTime: 60_000,
  });
}

function StepTickets({
  draft,
  errors,
  set,
  setTier,
  estimateEndpoint,
}: {
  draft: EventDraft;
  errors: StepErrors;
  set: <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => void;
  setTier: (index: number, patch: Partial<TierDraft>) => void;
  estimateEndpoint: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const free = isFree(draft);
  const paid = sellsOnTesotunes(draft);
  const external = draft.ticketingMode === 'external_only';
  const { data: estimate, isFetching } = useEstimate(draft, estimateEndpoint, paid);
  const summary = ticketSummary(draft);

  const feePercent = estimate ? estimate.platform_commission_percent + estimate.processing_fee_percent : null;
  const sample = normalizedTiers(draft).find((t) => t.price > 0)?.price ?? 0;
  const sampleFee = feePercent !== null ? Math.round(sample * (feePercent / 100)) : null;

  const addTier = (preset?: (typeof TIER_PRESETS)[number]) =>
    set('tiers', [...draft.tiers, newTier(preset ? { ...preset } : {})]);
  const removeTier = (index: number) => set('tiers', draft.tiers.filter((_, i) => i !== index));
  const unusedPresets = TIER_PRESETS.filter((p) => !draft.tiers.some((t) => t.name.toLowerCase() === p.name.toLowerCase()));

  return (
    <section className="space-y-5">
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">How are tickets sold?</h2>
          <LearnMore anchor="selling" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => set('ticketingMode', m.value)}
              className={cn(
                'rounded-xl border p-3 text-left transition',
                draft.ticketingMode === m.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50',
              )}
            >
              <span className="block text-sm font-semibold">{m.label}</span>
              <span className="block text-xs text-muted-foreground">{m.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {paid && (
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">
              Who pays the fees{feePercent !== null ? ` (${feePercent}%)` : ''}?
            </h2>
            <LearnMore anchor="fees" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {([
              ['pass_to_buyer', 'Buyer', sample && sampleFee !== null ? `${formatUGX(sample)} ticket → buyer pays ${formatUGX(sample + sampleFee)}, you get ${formatUGX(sample)}` : 'Added at checkout. You keep your full price.'],
              ['absorb', 'Me', sample && sampleFee !== null ? `Buyer pays ${formatUGX(sample)}, you get ${formatUGX(sample - sampleFee)}` : 'Included in your price. Buyers pay the listed price.'],
            ] as const).map(([value, label, hint]) => (
              <button
                key={value}
                type="button"
                onClick={() => set('feeHandling', value)}
                className={cn(
                  'rounded-xl border p-3 text-left transition',
                  draft.feeHandling === value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50',
                )}
              >
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  {draft.feeHandling === value && <Check className="h-3.5 w-3.5 text-primary" />}
                  {label}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{hint}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!external && (
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Tickets</h2>
            <LearnMore anchor="tickets">Tiers, limits & sale times</LearnMore>
          </div>

          <div className="mb-1 grid grid-cols-[1fr_6.5rem_4.5rem_2rem] gap-2 px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <span>Name</span>
            <span>{free ? 'Price' : 'Price (UGX)'}</span>
            <span>Qty</span>
            <span />
          </div>

          <ul className="space-y-2">
            {draft.tiers.map((tier, i) => {
              const open = expanded === tier.key;
              return (
                <li key={tier.key} className="rounded-xl border bg-card">
                  <div className="grid grid-cols-[1fr_6.5rem_4.5rem_2rem] items-start gap-2 p-2">
                    <input
                      className={cn(inputCls, errors[`tier.${i}.name`] && 'border-red-500')}
                      value={tier.name}
                      placeholder="Ordinary"
                      onChange={(e) => setTier(i, { name: e.target.value })}
                    />
                    <input
                      inputMode="numeric"
                      className={cn(inputCls, errors[`tier.${i}.price`] && 'border-red-500')}
                      value={free ? '0' : tier.price}
                      disabled={free}
                      placeholder="5000"
                      onChange={(e) => setTier(i, { price: e.target.value.replace(/[^\d]/g, '') })}
                    />
                    <input
                      inputMode="numeric"
                      className={cn(inputCls, errors[`tier.${i}.quantity`] && 'border-red-500')}
                      value={tier.quantity}
                      placeholder="300"
                      onChange={(e) => setTier(i, { quantity: e.target.value.replace(/[^\d]/g, '') })}
                    />
                    <button
                      type="button"
                      aria-label={tier.sold > 0 ? 'Has sales — cannot remove' : `Remove ${tier.name || 'ticket'}`}
                      disabled={tier.sold > 0 || draft.tiers.length === 1}
                      onClick={() => removeTier(i)}
                      className="mt-1.5 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-red-500/10 hover:text-red-600 disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t px-3 py-1.5 text-xs text-muted-foreground">
                    <span className="truncate">
                      {errors[`tier.${i}.quantity`] || errors[`tier.${i}.saleEndsAt`] ||
                        [tier.sold > 0 ? `${tier.sold} sold` : null, `max ${tier.maxPerOrder || 10}/order`, tier.saleEndsAt ? 'custom sale end' : 'sells until event ends']
                          .filter(Boolean)
                          .join(' · ')}
                    </span>
                    <button type="button" onClick={() => setExpanded(open ? null : tier.key)} className="inline-flex shrink-0 items-center gap-0.5 font-medium text-primary">
                      {open ? 'Less' : 'More'} <ChevronDown className={cn('h-3.5 w-3.5 transition', open && 'rotate-180')} />
                    </button>
                  </div>

                  {open && (
                    <div className="grid grid-cols-2 gap-2 border-t p-3">
                      <Field label="What's included (optional)" className="col-span-2">
                        <input className={inputCls} value={tier.description} onChange={(e) => setTier(i, { description: e.target.value })} placeholder="Front area, free drink" />
                      </Field>
                      <Field label="Max per order">
                        <input inputMode="numeric" className={inputCls} value={tier.maxPerOrder} onChange={(e) => setTier(i, { maxPerOrder: e.target.value.replace(/[^\d]/g, '') })} />
                      </Field>
                      <span />
                      <Field label="Sales open (optional)">
                        <input type="datetime-local" className={inputCls} value={tier.saleStartsAt} onChange={(e) => setTier(i, { saleStartsAt: e.target.value })} />
                      </Field>
                      <Field label="Sales close (blank = event end)" error={errors[`tier.${i}.saleEndsAt`]}>
                        <input type="datetime-local" className={inputCls} value={tier.saleEndsAt} onChange={(e) => setTier(i, { saleEndsAt: e.target.value })} />
                      </Field>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-2 flex flex-wrap gap-2">
            {unusedPresets.map((p) => (
              <button key={p.name} type="button" onClick={() => addTier(p)} className="inline-flex items-center gap-1 rounded-full border border-dashed px-3 py-1.5 text-sm hover:bg-muted">
                <Plus className="h-3.5 w-3.5" /> {p.name}
              </button>
            ))}
            <button type="button" onClick={() => addTier()} className="inline-flex items-center gap-1 rounded-full border border-dashed px-3 py-1.5 text-sm hover:bg-muted">
              <Plus className="h-3.5 w-3.5" /> Custom
            </button>
          </div>
        </div>
      )}

      {!external && (
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/50 p-3 text-center">
          <div>
            <p className="text-lg font-semibold tabular-nums">{summary.count.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">tickets</p>
          </div>
          <div>
            <p className="text-lg font-semibold tabular-nums">
              {paid && estimate ? formatUGX(estimate.totals.customer_paid_total).replace('UGX ', '') : (summary.grossValue).toLocaleString()}
            </p>
            <p className="text-[11px] text-muted-foreground">{paid && estimate ? 'buyers pay if sold out' : 'ticket value'}</p>
          </div>
          <div>
            <p className="text-lg font-semibold tabular-nums text-emerald-600">
              {paid ? (estimate ? Math.round(estimate.totals.organizer_net_amount).toLocaleString() : isFetching ? '…' : '—') : '0'}
            </p>
            <p className="text-[11px] text-muted-foreground">you receive (UGX)</p>
          </div>
        </div>
      )}
    </section>
  );
}

/* ──────────────────────────── Step 3: Publish ──────────────────────────── */

function StepPublish({
  mode,
  isEdit,
  draft,
  set,
  estimateEndpoint,
}: {
  mode: 'artist' | 'admin';
  isEdit: boolean;
  draft: EventDraft;
  set: <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => void;
  estimateEndpoint: string;
}) {
  const paid = sellsOnTesotunes(draft);
  const { data: estimate } = useEstimate(draft, estimateEndpoint, paid);
  const feePercent = estimate ? estimate.platform_commission_percent + estimate.processing_fee_percent : 0;
  const when = useMemo(() => {
    if (!draft.startDate) return '';
    const d = new Date(`${draft.startDate}T${draft.startTime || '00:00'}`);
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + (draft.startTime ? ` · ${draft.startTime}` : '');
  }, [draft.startDate, draft.startTime]);

  return (
    <section className="space-y-4">
      {mode === 'artist' && isEdit && (
        <div className="grid grid-cols-2 gap-2">
          {(['draft', 'published'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => set('status', value)}
              className={cn(
                'rounded-xl border p-3 text-left text-sm transition',
                draft.status === value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50',
              )}
            >
              <span className="block font-semibold">{value === 'draft' ? 'Draft' : 'Published'}</span>
              <span className="block text-xs text-muted-foreground">{value === 'draft' ? 'Only you can see it' : 'Live and on sale'}</span>
            </button>
          ))}
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold">What buyers will see</h2>
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="flex gap-3 p-3">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
              {draft.coverPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.coverPreview} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{draft.title || 'Untitled event'}</p>
              <p className="text-sm text-muted-foreground">{when}</p>
              <p className="truncate text-sm text-muted-foreground">{[draft.venueName, draft.city].filter(Boolean).join(', ')}</p>
            </div>
          </div>
          {draft.ticketingMode !== 'external_only' && (
            <ul className="divide-y border-t text-sm">
              {normalizedTiers(draft).map((t, i) => {
                const fee = paid && draft.feeHandling === 'pass_to_buyer' ? Math.round(t.price * (feePercent / 100)) : 0;
                return (
                  <li key={i} className="flex items-center justify-between px-3 py-2">
                    <span>{t.name || 'Ticket'}</span>
                    <span className="font-medium tabular-nums">
                      {t.price === 0 ? 'Free' : formatUGX(t.price + fee)}
                      {fee > 0 && <span className="ml-1 text-xs font-normal text-muted-foreground">incl. fees</span>}
                      {fee === 0 && t.price > 0 && paid && draft.feeHandling === 'pass_to_buyer' && !estimate && (
                        <span className="ml-1 text-xs font-normal text-muted-foreground">+ fees</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {mode === 'artist' && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">
            Optional extras <span className="font-normal text-muted-foreground">— skip and add later</span>
          </h2>

          <Extra title="Contact for attendees" hint="phone, email, website">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Phone"><input className={inputCls} value={draft.supportPhone} onChange={(e) => set('supportPhone', e.target.value)} placeholder="+256…" /></Field>
              <Field label="Email"><input type="email" className={inputCls} value={draft.supportEmail} onChange={(e) => set('supportEmail', e.target.value)} /></Field>
              <Field label="Website" className="col-span-2"><input type="url" className={inputCls} value={draft.website} onChange={(e) => set('website', e.target.value)} placeholder="https://" /></Field>
            </div>
          </Extra>

          <Extra title="Entry rules" hint="age, refunds, what to bring" anchor="rules">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Age limit"><input className={inputCls} value={draft.ageRestriction} onChange={(e) => set('ageRestriction', e.target.value)} placeholder="e.g. 18 and over" /></Field>
              <Field label="Capacity"><input inputMode="numeric" className={inputCls} value={draft.capacity} onChange={(e) => set('capacity', e.target.value.replace(/[^\d]/g, ''))} /></Field>
              <Field label="Refunds" className="col-span-2"><input className={inputCls} value={draft.refundPolicy} onChange={(e) => set('refundPolicy', e.target.value)} placeholder="No refunds unless cancelled" /></Field>
              <Field label="If cancelled or moved" className="col-span-2"><input className={inputCls} value={draft.cancellationPolicy} onChange={(e) => set('cancellationPolicy', e.target.value)} /></Field>
              <Field label="Door notes" className="col-span-2"><input className={inputCls} value={draft.doorNotes} onChange={(e) => set('doorNotes', e.target.value)} placeholder="Gates open 6 PM" /></Field>
              <Field label="Bring (one per line)" className="col-span-2"><textarea rows={2} className={inputCls} value={draft.requirements} onChange={(e) => set('requirements', e.target.value)} /></Field>
            </div>
          </Extra>

          <Extra title="Tax & invoices" hint="registered businesses only" anchor="tax">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Business name"><input className={inputCls} value={draft.invoiceIssuerName} onChange={(e) => set('invoiceIssuerName', e.target.value)} /></Field>
              <Field label="TIN"><input className={inputCls} value={draft.taxRegistrationNumber} onChange={(e) => set('taxRegistrationNumber', e.target.value)} /></Field>
              <Field label="Tax %"><input inputMode="decimal" className={inputCls} value={draft.taxRatePercent} onChange={(e) => set('taxRatePercent', e.target.value)} placeholder="18" /></Field>
              <label className="flex items-end gap-2 pb-2.5 text-sm"><input type="checkbox" className="h-4 w-4" checked={draft.taxIsInclusive} onChange={(e) => set('taxIsInclusive', e.target.checked)} /> Included in price</label>
            </div>
          </Extra>
        </div>
      )}
    </section>
  );
}

function Extra({ title, hint, anchor, children }: { title: string; hint: string; anchor?: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl border bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-3">
        <span className="min-w-0">
          <span className="block text-sm font-medium">{title}</span>
          <span className="block text-xs text-muted-foreground">{hint}</span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" />
      </summary>
      <div className="border-t p-3">
        {children}
        {anchor && <div className="mt-2 text-right"><LearnMore anchor={anchor} /></div>}
      </div>
    </details>
  );
}
