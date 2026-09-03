'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut, apiPost } from '@/lib/api';
import { toast } from 'sonner';
import { Coins, Loader2, Plus, Save, X, Users, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * What the platform pays people to do.
 *
 * Every rate here was a constant in a service until now, and the table behind
 * it sat empty because three parts of the codebase disagreed about its column
 * names. Marketing retunes a reward on this page rather than in a deploy, and a
 * time-boxed push is a rate with a window on it.
 *
 * Each rule is shown beside what it has actually paid out, so a rule can be
 * judged on its cost rather than its intention.
 */

interface RewardRule {
  id: number;
  activity_type: string;
  label: string;
  description: string | null;
  credits_per_action: number;
  daily_limit: number | null;
  cooldown_minutes: number | null;
  max_per_user_lifetime: number | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  is_live: boolean;
  is_campaign: boolean;
  awards: number;
  credits_paid: number;
  people_paid: number;
}

interface ReferralOverview {
  referred_signups: number;
  credits_paid_out: number;
  accounts_with_codes: number;
  total_accounts: number;
  signup_rate: number | null;
  welcome_rate: number | null;
  top_referrers: Array<{ user_id: number; name: string | null; referred: number }>;
}

/** Only the fields an operator edits. */
type Draft = Pick<
  RewardRule,
  'credits_per_action' | 'daily_limit' | 'cooldown_minutes' | 'max_per_user_lifetime' | 'ends_at' | 'is_active'
>;

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function AdminRewardsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  const { data: rules, isLoading } = useQuery({
    queryKey: ['admin', 'reward-rules'],
    queryFn: () => apiGet<{ data: RewardRule[] }>('/admin/reward-rules').then((r) => r.data),
  });

  const { data: referrals } = useQuery({
    queryKey: ['admin', 'reward-rules', 'referrals'],
    queryFn: () => apiGet<{ data: ReferralOverview }>('/admin/reward-rules/referrals').then((r) => r.data),
  });

  const save = useMutation({
    mutationFn: ({ id, changes }: { id: number; changes: Partial<RewardRule> }) =>
      apiPut(`/admin/reward-rules/${id}`, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reward-rules'] });
      setEditing(null);
      setDraft(null);
      toast.success('Rule updated.');
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : 'Could not save the rule'),
  });

  const seed = useMutation({
    mutationFn: () => apiPost('/admin/reward-rules', {
      activity_type: `custom_activity_${Date.now()}`,
      display_name: 'New activity',
      credits_per_action: 1,
      is_active: false,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reward-rules'] });
      toast.success('Rule created — switch it on once the figures are right.');
    },
  });

  const beginEdit = (rule: RewardRule) => {
    setEditing(rule.id);
    setDraft({
      credits_per_action: rule.credits_per_action,
      daily_limit: rule.daily_limit,
      cooldown_minutes: rule.cooldown_minutes,
      max_per_user_lifetime: rule.max_per_user_lifetime,
      ends_at: rule.ends_at,
      is_active: rule.is_active,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const list = rules ?? [];
  const totalPaid = list.reduce((sum, r) => sum + r.credits_paid, 0);
  const liveCount = list.filter((r) => r.is_live).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Coins className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Rewards</h1>
            <p className="text-sm text-muted-foreground">
              What the platform pays for each activity, and what it has cost.
            </p>
          </div>
        </div>
        <button
          onClick={() => seed.mutate()}
          disabled={seed.isPending}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border bg-card px-3 text-sm font-medium hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
          New rule
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Live rules" value={`${liveCount} of ${list.length}`} />
        <StatTile label="Credits paid" value={totalPaid.toLocaleString()} hint="across every rule" />
        <StatTile
          label="Referred signups"
          value={(referrals?.referred_signups ?? 0).toLocaleString()}
          hint={
            referrals && referrals.referred_signups === 0
              ? 'none yet'
              : `${(referrals?.credits_paid_out ?? 0).toLocaleString()} credits paid`
          }
        />
        <StatTile
          label="Accounts with a code"
          value={`${referrals?.accounts_with_codes ?? 0} of ${referrals?.total_accounts ?? 0}`}
          hint="a code is generated on first use"
        />
      </div>

      {referrals?.referred_signups === 0 && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-sm">
            <p className="font-semibold">No referred signups yet</p>
            <p className="text-muted-foreground">
              Registration only began accepting referral codes recently. Anyone who signed up through a
              link before that was never credited to their referrer.
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">Activity</th>
                <th className="p-3 font-medium">Pays</th>
                <th className="p-3 font-medium">Daily cap</th>
                <th className="p-3 font-medium">Cooldown</th>
                <th className="p-3 font-medium">Once only</th>
                <th className="p-3 font-medium">Paid out</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map((rule) => {
                const isEditing = editing === rule.id;

                return (
                  <tr key={rule.id} className={cn(isEditing && 'bg-muted/30')}>
                    <td className="p-3">
                      <p className="font-medium">{rule.label}</p>
                      <p className="text-xs text-muted-foreground">{rule.activity_type}</p>
                    </td>

                    <td className="p-3 tabular-nums">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.5"
                          min={0}
                          value={draft?.credits_per_action ?? 0}
                          onChange={(e) =>
                            setDraft((d) => d && { ...d, credits_per_action: Number(e.target.value) })
                          }
                          className="w-24 rounded-md border bg-background px-2 py-1"
                        />
                      ) : (
                        rule.credits_per_action.toLocaleString()
                      )}
                    </td>

                    <td className="p-3 tabular-nums">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={draft?.daily_limit ?? ''}
                          placeholder="none"
                          onChange={(e) =>
                            setDraft((d) => d && { ...d, daily_limit: e.target.value === '' ? null : Number(e.target.value) })
                          }
                          className="w-24 rounded-md border bg-background px-2 py-1"
                        />
                      ) : (
                        rule.daily_limit?.toLocaleString() ?? <span className="text-muted-foreground">none</span>
                      )}
                    </td>

                    <td className="p-3 tabular-nums">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={draft?.cooldown_minutes ?? ''}
                          placeholder="none"
                          onChange={(e) =>
                            setDraft((d) => d && { ...d, cooldown_minutes: e.target.value === '' ? null : Number(e.target.value) })
                          }
                          className="w-24 rounded-md border bg-background px-2 py-1"
                        />
                      ) : rule.cooldown_minutes ? (
                        `${rule.cooldown_minutes} min`
                      ) : (
                        <span className="text-muted-foreground">none</span>
                      )}
                    </td>

                    <td className="p-3">
                      {rule.max_per_user_lifetime === 1 ? (
                        'Yes'
                      ) : rule.max_per_user_lifetime ? (
                        `max ${rule.max_per_user_lifetime}`
                      ) : (
                        <span className="text-muted-foreground">no</span>
                      )}
                    </td>

                    <td className="p-3 tabular-nums">
                      {rule.credits_paid > 0 ? (
                        <>
                          <span className="font-medium">{rule.credits_paid.toLocaleString()}</span>
                          <span className="block text-xs text-muted-foreground">
                            {rule.awards} awards · {rule.people_paid} people
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">never</span>
                      )}
                    </td>

                    <td className="p-3">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                          rule.is_live
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {rule.is_live ? (rule.is_campaign ? 'Campaign' : 'Live') : 'Off'}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => draft && save.mutate({ id: rule.id, changes: { ...draft, activity_type: rule.activity_type } })}
                            disabled={save.isPending}
                            className="rounded-md bg-primary p-1.5 text-primary-foreground hover:bg-primary/90"
                            aria-label="Save"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { setEditing(null); setDraft(null); }}
                            className="rounded-md border p-1.5 hover:bg-muted"
                            aria-label="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => beginEdit(rule)}
                          className="rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-muted"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {list.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            <p>No reward rules yet.</p>
            <p className="mt-1 text-sm">Run the credit rate seeder, or add one above.</p>
          </div>
        )}
      </div>

      {(referrals?.top_referrers?.length ?? 0) > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Users className="h-4 w-4" />
            Top referrers
          </h2>
          <div className="divide-y overflow-hidden rounded-xl border bg-card">
            {referrals?.top_referrers.map((r) => (
              <div key={r.user_id} className="flex items-center justify-between p-3">
                <span>{r.name ?? `User ${r.user_id}`}</span>
                <span className="font-medium tabular-nums">{r.referred}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
