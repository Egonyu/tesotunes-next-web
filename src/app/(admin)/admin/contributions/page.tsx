'use client';

import { useState } from 'react';
import { Languages, Loader2, Upload, Download, Target, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useContributionsOverview,
  useAdminTasks,
  useImportTasks,
  useCloseTask,
  useSeedGold,
  useExportCorpus,
  type Direction,
} from '@/hooks/useContributionsAdmin';

export default function AdminContributionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Languages className="h-6 w-6 text-primary" /> Ateso corpus
        </h1>
        <p className="text-muted-foreground">Author prompts, seed gold items, monitor the pool, and export the corpus.</p>
      </div>

      <Overview />
      <ImportPrompts />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SeedGold />
        <ExportCard />
      </div>
      <TaskPool />
    </div>
  );
}

// ── Overview ───────────────────────────────────────────────────

function Overview() {
  const { data, isLoading } = useContributionsOverview();
  if (isLoading) return <Loader />;
  if (!data) return null;

  const stats: Array<[string, number | string]> = [
    ['Corpus pairs', data.corpus.total_pairs],
    ['Open tasks', data.tasks.open],
    ['Gold items', data.tasks.gold],
    ['Awaiting review', data.submissions.awaiting_validation],
    ['Accepted', data.submissions.accepted],
    ['Contributors', data.contributors.total],
    ['Pool spent today', `${data.rewards.pool_spent_today}/${data.rewards.daily_pool}`],
    ['Pool left today', data.rewards.pool_remaining_today],
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(([label, value]) => (
        <div key={label} className="rounded-xl border bg-card p-4">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Import prompts (the primary authoring tool) ────────────────

function ImportPrompts() {
  const importTasks = useImportTasks();
  const [direction, setDirection] = useState<Direction>('en_to_teo');
  const [register, setRegister] = useState('');
  const [raw, setRaw] = useState('');

  const prompts = raw.split('\n').map((l) => l.trim()).filter(Boolean);

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Upload className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Add prompts to translate</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Paste one prompt per line. They become tasks the community can translate and verify.
      </p>

      <div className="flex flex-wrap gap-3">
        <label className="text-sm">
          <span className="block text-muted-foreground mb-1">Direction</span>
          <select value={direction} onChange={(e) => setDirection(e.target.value as Direction)} className="px-3 py-2 border rounded-lg bg-background">
            <option value="en_to_teo">English → Ateso (show English)</option>
            <option value="teo_to_en">Ateso → English (show Ateso)</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-muted-foreground mb-1">Register (optional)</span>
          <input value={register} onChange={(e) => setRegister(e.target.value)} placeholder="e.g. market, proverb" className="px-3 py-2 border rounded-lg bg-background" />
        </label>
      </div>

      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={6}
        placeholder={'Good morning\nHow much is this?\nThank you'}
        className="w-full px-3 py-2 border rounded-lg bg-background font-mono text-sm"
      />

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{prompts.length} prompt(s) ready</span>
        <button
          onClick={() => importTasks.mutate(
            { direction, register: register || undefined, prompts },
            { onSuccess: () => setRaw('') }
          )}
          disabled={importTasks.isPending || prompts.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 font-medium"
        >
          {importTasks.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Import prompts
        </button>
      </div>
    </div>
  );
}

// ── Seed gold ──────────────────────────────────────────────────

function SeedGold() {
  const seed = useSeedGold();
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');

  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Seed a gold item</h2>
      </div>
      <p className="text-sm text-muted-foreground">Known-answer items, hidden and mixed in to score contributor accuracy.</p>
      <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Prompt (shown)" className="w-full px-3 py-2 border rounded-lg bg-background text-sm" />
      <input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Correct answer (hidden)" className="w-full px-3 py-2 border rounded-lg bg-background text-sm" />
      <button
        onClick={() => seed.mutate({ prompt_text: prompt, gold_answer: answer }, { onSuccess: () => { setPrompt(''); setAnswer(''); } })}
        disabled={seed.isPending || !prompt.trim() || !answer.trim()}
        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted disabled:opacity-60 text-sm font-medium"
      >
        {seed.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
        Seed gold
      </button>
    </div>
  );
}

// ── Export ─────────────────────────────────────────────────────

function ExportCard() {
  const exportCorpus = useExportCorpus();
  const [version, setVersion] = useState('');

  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Download className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Export corpus</h2>
      </div>
      <p className="text-sm text-muted-foreground">Write all accepted pairs to a versioned JSONL file for ateso-nlp.</p>
      <input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="Version label (optional, e.g. v1)" className="w-full px-3 py-2 border rounded-lg bg-background text-sm" />
      <button
        onClick={() => exportCorpus.mutate(version || undefined)}
        disabled={exportCorpus.isPending}
        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted disabled:opacity-60 text-sm font-medium"
      >
        {exportCorpus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Run export
      </button>
    </div>
  );
}

// ── Task pool ──────────────────────────────────────────────────

function TaskPool() {
  const [status, setStatus] = useState('open');
  const { data, isLoading } = useAdminTasks({ status: status || undefined });
  const close = useCloseTask();

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Task pool</h2>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-1.5 border rounded-lg bg-background text-sm">
          <option value="open">Open</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="closed">Closed</option>
          <option value="">All</option>
        </select>
      </div>

      {isLoading ? (
        <Loader />
      ) : (data?.data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No tasks.</p>
      ) : (
        <div className="divide-y">
          {(data?.data ?? []).map((task) => (
            <div key={task.uuid} className="flex items-center gap-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.prompt_text}</p>
                <p className="text-xs text-muted-foreground">
                  {task.source_lang} → {task.target_lang}
                  {task.register ? ` · ${task.register}` : ''}
                  {task.is_gold ? ' · gold' : ''} · {task.submission_count} submission(s)
                </p>
              </div>
              <span className={cn(
                'text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full',
                task.status === 'open' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-muted text-muted-foreground'
              )}>
                {task.status}
              </span>
              {task.status === 'open' && (
                <button onClick={() => close.mutate(task.uuid)} disabled={close.isPending} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" title="Close task">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
