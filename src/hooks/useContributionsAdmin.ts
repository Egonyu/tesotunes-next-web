import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, isApiError } from '@/lib/api';
import { toast } from 'sonner';

// ============================================================================
// Admin Contributions console — matches ContributionAdminController
// ============================================================================

export interface ContributionsOverview {
  corpus: { total_pairs: number; by_region: Record<string, number>; by_register: Record<string, number>; exported: number };
  tasks: { open: number; fulfilled: number; gold: number };
  submissions: { awaiting_validation: number; accepted: number };
  contributors: { total: number; by_tier: Record<string, number> };
  rewards: { daily_pool: number; pool_spent_today: number; pool_remaining_today: number };
}

export interface AdminTask {
  uuid: string;
  prompt_text: string;
  source_lang: string;
  target_lang: string;
  register: string | null;
  is_gold: boolean;
  status: string;
  submission_count: number;
}

export type Direction = 'en_to_teo' | 'teo_to_en';

interface Wrapped<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: { current_page: number; last_page: number; total: number };
}

function msg(error: unknown, fallback: string): string {
  if (isApiError(error)) return (error.response?.data as { message?: string })?.message ?? fallback;
  return fallback;
}

export function useContributionsOverview() {
  return useQuery({
    queryKey: ['admin', 'contributions', 'overview'],
    queryFn: () => apiGet<Wrapped<ContributionsOverview>>('/contributions/admin/overview').then((r) => r.data),
    staleTime: 30 * 1000,
  });
}

export function useAdminTasks(params?: { status?: string; register?: string; gold?: boolean }) {
  return useQuery({
    queryKey: ['admin', 'contributions', 'tasks', params],
    queryFn: () => apiGet<Wrapped<AdminTask[]>>('/contributions/admin/tasks', { params }),
  });
}

export function useImportTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { direction: Direction; register?: string; region?: string; prompts: string[] }) =>
      apiPost<Wrapped<{ created: number; skipped: number }>>('/contributions/admin/tasks/import', body),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin', 'contributions'] });
      toast.success(res.message ?? 'Prompts imported.');
    },
    onError: (e) => toast.error(msg(e, 'Could not import prompts.')),
  });
}

export function useCloseTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => apiPost<Wrapped<unknown>>(`/contributions/admin/tasks/${uuid}/close`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'contributions', 'tasks'] });
      toast.success('Task closed.');
    },
    onError: (e) => toast.error(msg(e, 'Could not close task.')),
  });
}

export function useSeedGold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { prompt_text: string; gold_answer: string; source_lang?: string; target_lang?: string; register?: string }) =>
      apiPost<Wrapped<unknown>>('/contributions/admin/gold', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'contributions'] });
      toast.success('Gold item seeded.');
    },
    onError: (e) => toast.error(msg(e, 'Could not seed gold item.')),
  });
}

export function useExportCorpus() {
  return useMutation({
    mutationFn: (version?: string) =>
      apiPost<Wrapped<{ version: string; path: string; count: number }>>('/contributions/admin/export', { version }),
    onSuccess: (res) => toast.success(res.message ?? `Exported ${res.data?.count ?? 0} pair(s).`),
    onError: (e) => toast.error(msg(e, 'Could not export corpus.')),
  });
}
