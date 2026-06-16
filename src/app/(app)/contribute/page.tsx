'use client';

import { useState } from 'react';
import {
  Languages,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Sparkles,
  Coins,
  Award,
  ThumbsUp,
  PencilLine,
  ThumbsDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useConsentStatus,
  useRecordConsent,
  useContributorProfile,
  useTranslationTasks,
  useSubmitTranslation,
  useValidationQueue,
  useSubmitValidation,
  DIALECTS,
  type Verdict,
} from '@/hooks/useContributions';

type Tab = 'translate' | 'validate' | 'standing';

export default function ContributePage() {
  const { data: consent, isLoading: consentLoading } = useConsentStatus();
  const recordConsent = useRecordConsent();

  if (consentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (consent?.needs_consent) {
    return <ConsentGate onAccept={() => recordConsent.mutate()} pending={recordConsent.isPending} licenseVersion={consent.license_version} />;
  }

  return <ContributeHub />;
}

// ── Consent gate ───────────────────────────────────────────────

function ConsentGate({ onAccept, pending, licenseVersion }: { onAccept: () => void; pending: boolean; licenseVersion: string }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Languages className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Help build the Ateso corpus</h1>
        <p className="text-muted-foreground">
          Translate short lines of Ateso and English, review others&apos; work, and earn credits for
          accepted contributions. You&apos;re helping teach machines to understand Ateso.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Before you start, please accept the contribution data terms:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Your contributions may be used to train models and published as an open corpus.</li>
              <li>The public corpus is released under <span className="font-medium text-foreground">{licenseVersion}</span>, with pseudonymous attribution.</li>
              <li>Earned credits are withdrawable once you complete identity verification (KYC).</li>
            </ul>
          </div>
        </div>
        <button
          onClick={onAccept}
          disabled={pending}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 font-medium"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Accept &amp; start contributing
        </button>
      </div>
    </div>
  );
}

// ── Hub ────────────────────────────────────────────────────────

function ContributeHub() {
  const [tab, setTab] = useState<Tab>('translate');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Languages className="h-6 w-6 text-primary" /> Ateso corpus
        </h1>
        <p className="text-muted-foreground">Translate, review, and earn credits for accepted work.</p>
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {([['translate', 'Translate'], ['validate', 'Review'], ['standing', 'Your standing']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              tab === key ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'translate' && <TranslateTab />}
      {tab === 'validate' && <ValidateTab />}
      {tab === 'standing' && <StandingTab />}
    </div>
  );
}

// ── Translate ──────────────────────────────────────────────────

function TranslateTab() {
  const { data, isLoading } = useTranslationTasks();
  const submit = useSubmitTranslation();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [mixed, setMixed] = useState<Record<string, boolean>>({});
  const [dialect, setDialect] = useState('');

  if (isLoading) return <SectionLoader />;

  const tasks = data?.data ?? [];

  return (
    <div className="space-y-3">
      <div className="rounded-xl border bg-card p-3 flex items-center gap-3 flex-wrap">
        <span className="text-sm text-muted-foreground">Your Ateso dialect:</span>
        <select value={dialect} onChange={(e) => setDialect(e.target.value)} className="px-3 py-1.5 border rounded-lg bg-background text-sm">
          <option value="">Choose…</option>
          {DIALECTS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <span className="text-xs text-muted-foreground">Helps us keep every regional variant — there are no wrong dialects.</span>
      </div>

      {tasks.length === 0 ? (
        <EmptyState text="No translation tasks right now. Check back soon." />
      ) : tasks.map((task) => (
        <div key={task.uuid} className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {task.source_lang} → {task.target_lang}{task.register ? ` · ${task.register}` : ''}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <Coins className="h-3.5 w-3.5" /> earn credits
            </span>
          </div>
          <p className="text-lg font-medium">{task.prompt_text}</p>
          <textarea
            value={drafts[task.uuid] ?? ''}
            onChange={(e) => setDrafts((d) => ({ ...d, [task.uuid]: e.target.value }))}
            placeholder="Type your translation…"
            rows={2}
            className="w-full px-3 py-2 border rounded-lg bg-background resize-none"
          />
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={!!mixed[task.uuid]} onChange={(e) => setMixed((m) => ({ ...m, [task.uuid]: e.target.checked }))} />
              Mixes in English/Swahili/Luganda words
            </label>
            <button
              onClick={() => submit.mutate(
                { uuid: task.uuid, translation: drafts[task.uuid] ?? '', dialect: dialect || undefined, code_switched: !!mixed[task.uuid] },
                { onSuccess: () => setDrafts((d) => ({ ...d, [task.uuid]: '' })) }
              )}
              disabled={submit.isPending || !(drafts[task.uuid] ?? '').trim()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 text-sm font-medium"
            >
              {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Submit
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Validate ───────────────────────────────────────────────────

function ValidateTab() {
  const { data, isLoading } = useValidationQueue();
  const validate = useSubmitValidation();

  if (isLoading) return <SectionLoader />;

  const items = data?.data ?? [];
  if (items.length === 0) return <EmptyState text="Nothing to review right now. Check back soon." />;

  const verdictBtn = (uuid: string, verdict: Verdict, label: string, Icon: React.ElementType, tone: string) => (
    <button
      onClick={() => validate.mutate({ uuid, verdict })}
      disabled={validate.isPending}
      className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-60', tone)}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.submission_uuid} className="rounded-xl border bg-card p-4 space-y-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {item.source_lang} → {item.target_lang}{item.register ? ` · ${item.register}` : ''}
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{item.source_text}</p>
            <p className="text-lg font-medium">{item.translation}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {verdictBtn(item.submission_uuid, 'agree', 'Looks right', ThumbsUp, 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300')}
            {verdictBtn(item.submission_uuid, 'minor_fix', 'Minor fix', PencilLine, 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300')}
            {verdictBtn(item.submission_uuid, 'valid_variant', 'Different dialect — also valid', Languages, 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300')}
            {verdictBtn(item.submission_uuid, 'reject', 'Wrong', ThumbsDown, 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300')}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Standing ───────────────────────────────────────────────────

function StandingTab() {
  const { data: profile, isLoading } = useContributorProfile();

  if (isLoading) return <SectionLoader />;
  if (!profile) return <EmptyState text="Start translating to build your standing." />;

  const tierLabel = { novice: 'Novice', trusted: 'Trusted', reviewer: 'Reviewer' }[profile.tier];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Award className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Your tier</p>
          <p className="text-xl font-bold">{tierLabel}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-sm text-muted-foreground">Credits earned</p>
          <p className="text-xl font-bold inline-flex items-center gap-1">
            <Coins className="h-5 w-5 text-amber-500" />{profile.credits_earned_total}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Submitted" value={profile.submissions_total} />
        <Stat label="Accepted" value={profile.submissions_accepted} />
        <Stat label="Reviews" value={profile.validations_total} />
        <Stat label="Gold pass-rate" value={`${profile.gold_pass_rate}%`} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border bg-card p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// ── Shared ─────────────────────────────────────────────────────

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">{text}</div>;
}
