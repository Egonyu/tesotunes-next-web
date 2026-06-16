'use client';

import { useState } from 'react';
import { Coins, Loader2, Sparkles, Star } from 'lucide-react';
import { useSubmitTranslation } from '@/hooks/useContributions';

export interface EarnCardData {
  is_daily_challenge?: boolean;
  title?: string;
  content?: string;
  task?: {
    uuid: string;
    prompt_text: string;
    source_lang: string;
    target_lang: string;
    register: string | null;
    reward_credits: number;
  };
}

/**
 * Inline "Earn" translation card woven into the Edula feed. One-tap micro-task:
 * read the prompt, type a translation, submit. Disappears from view after a
 * successful submit (the feed reloads it out on the next page).
 */
export function EarnFeedCard({ item }: { item: EarnCardData }) {
  const submit = useSubmitTranslation();
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);

  const task = item.task;
  if (!task) return null;

  if (done) {
    return (
      <article className="rounded-xl border bg-card p-4 flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-primary" />
        <p className="text-sm font-medium">Thanks! Your translation was submitted.</p>
      </article>
    );
  }

  return (
    <article className="rounded-xl border-2 border-amber-300/60 dark:border-amber-500/30 bg-card overflow-hidden">
      <div className="px-4 py-1.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-500/20 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
          {item.is_daily_challenge ? <Star className="h-3 w-3" /> : <Coins className="h-3 w-3" />}
          {item.is_daily_challenge ? 'Daily challenge' : 'Earn'}
        </span>
        <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">+{task.reward_credits} credits</span>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
            {item.content ?? 'How would you translate this?'} · {task.source_lang} → {task.target_lang}
          </p>
          <p className="text-lg font-medium">{task.prompt_text}</p>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your translation…"
          rows={2}
          className="w-full px-3 py-2 border rounded-lg bg-background resize-none text-sm"
        />
        <button
          onClick={() => submit.mutate({ uuid: task.uuid, translation: text }, { onSuccess: () => setDone(true) })}
          disabled={submit.isPending || !text.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 text-sm font-medium"
        >
          {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Submit &amp; earn
        </button>
      </div>
    </article>
  );
}
