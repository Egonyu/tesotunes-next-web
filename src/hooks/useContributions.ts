import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api';

// ============================================================================
// Types — must match the Contributions module API (app/Modules/Contributions)
// ============================================================================

export interface ConsentStatus {
  needs_consent: boolean;
  terms_version: string;
  license_version: string;
  consented_at: string | null;
  consented_version: string | null;
}

export interface ContributorProfile {
  tier: 'novice' | 'trusted' | 'reviewer';
  gold_pass_rate: number;
  gold_attempts: number;
  submissions_total: number;
  submissions_accepted: number;
  validations_total: number;
  credits_earned_total: number;
  consented: boolean;
}

export interface TranslationTask {
  uuid: string;
  prompt_text: string;
  source_lang: string;
  target_lang: string;
  register: string | null;
  region: string;
}

export interface ValidationItem {
  submission_uuid: string;
  source_text: string | null;
  translation: string;
  source_lang: string | null;
  target_lang: string | null;
  register: string | null;
}

export type Verdict = 'agree' | 'minor_fix' | 'valid_variant' | 'reject';

/** Ateso varieties — keep in sync with config('contributions.dialects'). */
export const DIALECTS: Array<{ value: string; label: string }> = [
  { value: 'katakwi', label: 'Katakwi / Usuk' },
  { value: 'amuria', label: 'Amuria' },
  { value: 'soroti', label: 'Soroti' },
  { value: 'serere', label: 'Serere' },
  { value: 'kumi', label: 'Kumi' },
  { value: 'ngora', label: 'Ngora' },
  { value: 'bukedea', label: 'Bukedea' },
  { value: 'pallisa', label: 'Pallisa' },
  { value: 'tororo', label: 'Tororo' },
  { value: 'kenya', label: 'Kenya-Teso' },
  { value: 'general', label: 'Unsure / General' },
];

interface Wrapped<T> {
  success: boolean;
  data: T;
  meta?: { current_page: number; last_page: number; total: number };
}

function errorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    return (error.response?.data as { message?: string })?.message ?? fallback;
  }
  return fallback;
}

// ── Public availability (for nav gating) ───────────────────────

export interface ContributionsStatus {
  enabled: boolean;
  feed_cards_enabled: boolean;
}

export function useContributionsStatus() {
  return useQuery({
    queryKey: ['contributions', 'status'],
    queryFn: () => apiGet<Wrapped<ContributionsStatus>>('/contributions/status').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

// ── Consent ────────────────────────────────────────────────────

export function useConsentStatus(enabled = true) {
  return useQuery({
    queryKey: ['contributions', 'consent'],
    queryFn: () => apiGet<Wrapped<ConsentStatus>>('/contributions/consent').then((r) => r.data),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useRecordConsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<Wrapped<unknown>>('/contributions/consent', { accept: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contributions'] });
      toast.success('Thanks for joining — your contributions build the Ateso corpus.');
    },
    onError: (e) => toast.error(errorMessage(e, 'Could not record consent.')),
  });
}

// ── Contributor profile / earnings ─────────────────────────────

export function useContributorProfile(enabled = true) {
  return useQuery({
    queryKey: ['contributions', 'profile'],
    queryFn: () => apiGet<Wrapped<ContributorProfile | null>>('/contributions/profile').then((r) => r.data),
    enabled,
    staleTime: 30 * 1000,
  });
}

// ── Translation tasks ──────────────────────────────────────────

export function useTranslationTasks(params?: { song_id?: number }, enabled = true) {
  return useQuery({
    queryKey: ['contributions', 'tasks', params],
    queryFn: () => apiGet<Wrapped<TranslationTask[]>>('/contributions/tasks', { params }),
    enabled,
  });
}

export interface SubmitTranslationVars {
  uuid: string;
  translation: string;
  dialect?: string;
  code_switched?: boolean;
  note?: string;
}

export function useSubmitTranslation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, translation, dialect, code_switched, note }: SubmitTranslationVars) =>
      apiPost<Wrapped<unknown>>(`/contributions/tasks/${uuid}/submit`, { translation, dialect, code_switched, note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contributions', 'tasks'] });
      qc.invalidateQueries({ queryKey: ['contributions', 'profile'] });
      toast.success('Translation submitted. Thank you!');
    },
    onError: (e) => toast.error(errorMessage(e, 'Could not submit translation.')),
  });
}

// ── Peer validation ────────────────────────────────────────────

export function useValidationQueue(enabled = true) {
  return useQuery({
    queryKey: ['contributions', 'validations'],
    queryFn: () => apiGet<Wrapped<ValidationItem[]>>('/contributions/validations/queue'),
    enabled,
  });
}

export function useSubmitValidation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, verdict, suggested_fix }: { uuid: string; verdict: Verdict; suggested_fix?: string }) =>
      apiPost<Wrapped<unknown>>(`/contributions/submissions/${uuid}/validate`, { verdict, suggested_fix }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contributions', 'validations'] });
      qc.invalidateQueries({ queryKey: ['contributions', 'profile'] });
      toast.success('Verdict recorded. Thank you for reviewing.');
    },
    onError: (e) => toast.error(errorMessage(e, 'Could not record verdict.')),
  });
}

// ── Artist per-song lyric opt-in ───────────────────────────────

export interface SongOptInStatus {
  opted_in: boolean;
  status: string | null;
  tasks_generated: number;
  lyric_line_count: number;
}

export function useSongOptIn(songId: number, enabled = true) {
  return useQuery({
    queryKey: ['contributions', 'optin', songId],
    queryFn: () => apiGet<Wrapped<SongOptInStatus>>(`/contributions/songs/${songId}/optin`).then((r) => r.data),
    enabled: enabled && !!songId,
  });
}

export function useToggleSongOptIn(songId: number) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['contributions', 'optin', songId] });

  const optIn = useMutation({
    mutationFn: () => apiPost<Wrapped<unknown>>(`/contributions/songs/${songId}/optin`, {}),
    onSuccess: () => { invalidate(); toast.success('Lyrics opted in for translation.'); },
    onError: (e) => toast.error(errorMessage(e, 'Could not opt in.')),
  });

  const withdraw = useMutation({
    mutationFn: () => apiDelete<Wrapped<unknown>>(`/contributions/songs/${songId}/optin`),
    onSuccess: () => { invalidate(); toast.success('Lyrics withdrawn from the translation pool.'); },
    onError: (e) => toast.error(errorMessage(e, 'Could not withdraw.')),
  });

  return { optIn, withdraw };
}
