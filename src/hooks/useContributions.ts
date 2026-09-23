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
  /** Submitted work still awaiting peer acceptance (persists across refresh). */
  submissions_pending: number;
  /** Estimated credits for that pending work (submissions_pending × per-pair rate). */
  pending_estimate_credits: number;
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
    // Refetch on every mount so the nav reflects an admin toggle promptly
    // (the cached value still renders instantly meanwhile).
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
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

// ── Guest loop ─────────────────────────────────────────────────
// The unauthenticated front door: type, see the model try, say whether it is
// right, correct it. No account and no consent gate — the only people who ever
// contributed to the prototype did so anonymously, and a wall on arrival turns
// them away before they have any reason to care.

export type GuestDirection = 'teo_to_en' | 'en_to_teo';
export type GuestVerdict = 'correct' | 'wrong' | 'skipped';

export interface GuestSession {
  session_key: string;
  my_contributions: number;
  total_contributions: number;
}

export interface GuestAttempt {
  uuid: string;
  source_text: string;
  translation: string;
  direction: GuestDirection;
}

export interface GuestSuggestion {
  text: string;
  direction: GuestDirection;
}

const GUEST_KEY_STORAGE = 'ateso.guest.session';

/** Per-browser key. Storage can throw in private mode, so never let it break the page. */
export function readGuestKey(): string | null {
  try {
    return window.localStorage.getItem(GUEST_KEY_STORAGE);
  } catch {
    return null;
  }
}

function persistGuestKey(key: string): void {
  try {
    window.localStorage.setItem(GUEST_KEY_STORAGE, key);
  } catch {
    /* Contributions still work for this visit; only the key is not remembered. */
  }
}

export function useGuestSession() {
  return useQuery({
    queryKey: ['contributions', 'guest', 'session'],
    queryFn: async () => {
      const existing = readGuestKey();
      const res = await apiGet<Wrapped<GuestSession>>('/contributions/guest/session', {
        params: existing ? { session_key: existing } : undefined,
      });
      persistGuestKey(res.data.session_key);
      return res.data;
    },
    staleTime: 30 * 1000,
    retry: false,
  });
}

export function useGuestSuggestions(limit = 3) {
  return useQuery({
    queryKey: ['contributions', 'guest', 'suggestions', limit],
    queryFn: () =>
      apiGet<Wrapped<GuestSuggestion[]>>('/contributions/guest/suggestions', {
        params: { limit },
      }).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export interface GuestTranslateVars {
  text: string;
  direction: GuestDirection;
  origin?: 'typed' | 'suggested';
}

export function useGuestTranslate() {
  return useMutation({
    mutationFn: async (vars: GuestTranslateVars) => {
      const session_key = readGuestKey();
      if (!session_key) throw new Error('No session yet.');
      const res = await apiPost<Wrapped<GuestAttempt>, GuestTranslateVars & { session_key: string }>(
        '/contributions/guest/translate',
        { ...vars, session_key }
      );
      return res.data;
    },
    // A 503 means the translator is waking from idle, which is expected on a
    // free CPU Space — say so rather than reporting a generic failure.
    onError: (e) => toast.error(errorMessage(e, 'Could not reach the translator. Try again.')),
  });
}

export interface GuestVerdictVars {
  uuid: string;
  verdict: GuestVerdict;
  correction?: string;
  dialect?: string;
  code_switched?: boolean;
}

export function useGuestVerdict() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ uuid, ...body }: GuestVerdictVars) => {
      const session_key = readGuestKey();
      if (!session_key) throw new Error('No session yet.');
      const res = await apiPost<Wrapped<{ uuid: string; verdict: GuestVerdict; pending_claim: number }>>(
        `/contributions/guest/${uuid}/verdict`,
        { ...body, session_key }
      );
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contributions', 'guest', 'session'] }),
    onError: (e) => toast.error(errorMessage(e, 'Could not save your answer.')),
  });
}

/** Called once after sign-in so work done as a guest is never lost. */
export function useClaimGuestWork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const session_key = readGuestKey();
      if (!session_key) return { claimed: 0, skipped: 0 };
      const res = await apiPost<Wrapped<{ claimed: number; skipped: number }>>(
        '/contributions/guest/claim',
        { session_key }
      );
      return res.data;
    },
    onSuccess: (data) => {
      if (data.claimed > 0) {
        qc.invalidateQueries({ queryKey: ['contributions'] });
        toast.success(`Kept ${data.claimed} translation${data.claimed === 1 ? '' : 's'} you made earlier.`);
      }
    },
    onError: () => {
      /* Silent: the rows stay unclaimed and the next sign-in retries. */
    },
  });
}
