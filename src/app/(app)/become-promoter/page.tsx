'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Instagram,
  Loader2,
  Megaphone,
  Music,
  Radio,
  Star,
  Tv,
  Twitter,
  Users,
  Youtube,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOnboardAsPromoter, useMyPromoterProfileV2 } from '@/hooks/usePromotionsV2';
import Link from 'next/link';

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', Icon: Instagram },
  { value: 'tiktok', label: 'TikTok', Icon: Tv },
  { value: 'youtube', label: 'YouTube', Icon: Youtube },
  { value: 'twitter', label: 'Twitter / X', Icon: Twitter },
  { value: 'facebook', label: 'Facebook', Icon: Globe },
  { value: 'radio', label: 'Radio', Icon: Radio },
  { value: 'blog', label: 'Blog / Press', Icon: Globe },
  { value: 'club', label: 'Club / DJ', Icon: Music },
];

const NICHES = [
  'Afrobeats', 'Gospel', 'Hip-Hop', 'R&B', 'Dancehall',
  'Pop', 'Traditional', 'Jazz', 'Reggae', 'Electronic',
];

const REGIONS = [
  'Uganda', 'Kenya', 'Tanzania', 'Rwanda', 'East Africa',
  'West Africa', 'Nigeria', 'Ghana', 'South Africa', 'Global',
];

const RESPONSE_TIMES = [
  { value: 2, label: 'Under 2 hours' },
  { value: 6, label: 'Under 6 hours' },
  { value: 12, label: 'Same day (12h)' },
  { value: 24, label: 'Within 24 hours' },
  { value: 48, label: 'Within 48 hours' },
];

const STEPS = [
  { id: 1, label: 'About you', icon: Users },
  { id: 2, label: 'Platforms', icon: Megaphone },
  { id: 3, label: 'Audience', icon: Star },
  { id: 4, label: 'Details', icon: Zap },
];

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

export default function BecomePromoterPage() {
  const router = useRouter();
  const { data: existing } = useMyPromoterProfileV2();
  const onboard = useOnboardAsPromoter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    display_name: '',
    bio: '',
    platforms: [] as string[],
    niches: [] as string[],
    audience_regions: [] as string[],
    audience_summary: '',
    response_time_hours: 24,
    social_links: {} as Record<string, string>,
  });

  if (existing) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40">
          <BadgeCheck className="h-7 w-7 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold">You&apos;re already a promoter!</h1>
        <p className="mt-2 text-muted-foreground">
          Your promoter profile is live as <span className="font-medium">{existing.display_name}</span>.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/artist/promotions/profile"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Edit profile
          </Link>
          <Link
            href="/artist/promotions"
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Seller dashboard
          </Link>
        </div>
      </div>
    );
  }

  const canNext = () => {
    if (step === 1) return form.display_name.trim().length >= 2;
    if (step === 2) return form.platforms.length > 0;
    if (step === 3) return form.niches.length > 0 && form.audience_regions.length > 0;
    return true;
  };

  const handleSubmit = () => {
    const payload = {
      display_name: form.display_name.trim(),
      bio: form.bio.trim() || undefined,
      platforms: form.platforms,
      niches: form.niches,
      audience_regions: form.audience_regions,
      audience_summary: form.audience_summary.trim() || undefined,
      response_time_hours: form.response_time_hours,
      social_links: Object.fromEntries(
        Object.entries(form.social_links).filter(([, v]) => v.trim())
      ),
    };

    onboard.mutate(payload, {
      onSuccess: () => router.push('/artist/promotions/profile'),
    });
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-950/40">
          <Megaphone className="h-6 w-6 text-violet-500" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Become a promoter</h1>
        <p className="text-sm text-muted-foreground">
          Earn UGX + credits promoting music. No artist account required.
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  isDone ? 'bg-emerald-500 text-white' :
                  isActive ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                )}>
                  {isDone ? <BadgeCheck className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                </div>
                <span className={cn('text-[10px] font-medium whitespace-nowrap', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('mx-1 h-0.5 flex-1 mb-4', isDone ? 'bg-emerald-500' : 'bg-muted')} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="rounded-xl bg-card shadow-sm p-6 space-y-5">
        {step === 1 && (
          <>
            <div>
              <h2 className="font-semibold text-lg">Tell us about yourself</h2>
              <p className="text-sm text-muted-foreground mt-0.5">This is how artists will find and recognise you.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Display name <span className="text-destructive">*</span></label>
                <input
                  type="text"
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  placeholder="e.g. Grace Namukasa or GracePromotes"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground">Min 2 characters. This is your public promoter name.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Short bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="I'm a Kampala-based content creator with 85K Instagram followers focused on Afrobeats and Gospel music..."
                  rows={3}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 className="font-semibold text-lg">Where do you promote?</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Select all platforms you actively use. Pick at least one.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PLATFORMS.map(({ value, label, Icon }) => {
                const active = form.platforms.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, platforms: toggle(form.platforms, value) })}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border p-4 text-xs font-medium transition-all',
                      active
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/40'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                );
              })}
            </div>
            {form.platforms.length > 0 && (
              <div className="space-y-3 pt-2">
                <p className="text-sm font-medium">Add your profile links (optional)</p>
                {form.platforms.map((p) => (
                  <div key={p} className="flex items-center gap-2">
                    <span className="w-28 shrink-0 text-xs font-medium capitalize text-muted-foreground">{p}</span>
                    <input
                      type="url"
                      placeholder={`https://${p}.com/yourprofile`}
                      value={form.social_links[p] ?? ''}
                      onChange={(e) => setForm({
                        ...form,
                        social_links: { ...form.social_links, [p]: e.target.value }
                      })}
                      className="flex-1 rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <h2 className="font-semibold text-lg">Your audience</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Help artists find the right fit for their music.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Music niches <span className="text-destructive">*</span></p>
                <div className="flex flex-wrap gap-2">
                  {NICHES.map((n) => {
                    const slug = n.toLowerCase().replace(/[\s/]+/g, '-');
                    const active = form.niches.includes(slug);
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setForm({ ...form, niches: toggle(form.niches, slug) })}
                        className={cn(
                          'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                          active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/60'
                        )}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Audience regions <span className="text-destructive">*</span></p>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map((r) => {
                    const active = form.audience_regions.includes(r);
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setForm({ ...form, audience_regions: toggle(form.audience_regions, r) })}
                        className={cn(
                          'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                          active ? 'bg-sky-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/60'
                        )}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Audience summary</label>
                <textarea
                  value={form.audience_summary}
                  onChange={(e) => setForm({ ...form, audience_summary: e.target.value })}
                  placeholder="My audience is primarily 18–35 year olds in Kampala who love Gospel and Afrobeats..."
                  rows={3}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div>
              <h2 className="font-semibold text-lg">Response time</h2>
              <p className="text-sm text-muted-foreground mt-0.5">How quickly will you typically reply to enquiries?</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {RESPONSE_TIMES.map((rt) => (
                <button
                  key={rt.value}
                  type="button"
                  onClick={() => setForm({ ...form, response_time_hours: rt.value })}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
                    form.response_time_hours === rt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30 hover:bg-muted/30'
                  )}
                >
                  <Clock className={cn('h-5 w-5 shrink-0', form.response_time_hours === rt.value ? 'text-primary' : 'text-muted-foreground')} />
                  <span className={cn('text-sm font-medium', form.response_time_hours === rt.value ? 'text-primary' : '')}>
                    {rt.label}
                  </span>
                </button>
              ))}
            </div>
            <div className="rounded-xl bg-muted/40 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Profile summary</p>
              <div className="grid gap-1 text-sm">
                {[
                  ['Name', form.display_name],
                  ['Platforms', form.platforms.join(', ') || '—'],
                  ['Niches', form.niches.join(', ') || '—'],
                  ['Regions', form.audience_regions.join(', ') || '—'],
                ].map(([label, val]) => (
                  <div key={label} className="flex gap-2">
                    <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
                    <span className="font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
          className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-40"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={onboard.isPending}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
          >
            {onboard.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {onboard.isPending ? 'Creating profile…' : 'Launch my profile'}
          </button>
        )}
      </div>

      {/* Trust signals */}
      <div className="grid gap-4 sm:grid-cols-3 text-center">
        {[
          { icon: Zap, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/40', title: 'No artist account needed', desc: 'Any content creator can join' },
          { icon: BadgeCheck, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40', title: 'Escrow-protected', desc: 'Funds held until delivery verified' },
          { icon: Star, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/40', title: 'Earn UGX + Credits', desc: 'Paid to MTN MoMo or Airtel' },
        ].map(({ icon: Icon, color, bg, title, desc }) => (
          <div key={title} className="rounded-xl bg-card shadow-sm p-4">
            <div className={cn('mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg', bg)}>
              <Icon className={cn('h-4 w-4', color)} />
            </div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
