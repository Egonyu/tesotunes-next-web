import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

// ============================================================================
// Credits guide — generated from credit_rates, the table the rewards engine
// enforces. Matches App\Http\Controllers\Api\CreditGuideController.
// ============================================================================

export interface CreditGuideRate {
  activity_type: string;
  label: string;
  description: string | null;
  credits: number;
  daily_limit: number | null;
  cooldown_minutes: number | null;
  /** Present only when the reader is signed in. */
  earned_today?: number;
  remaining_today?: number | null;
  available_in_minutes?: number;
}

export interface CreditGuideGroup {
  key: string;
  label: string;
  blurb: string;
  rates: CreditGuideRate[];
}

export interface CreditGuide {
  personalised: boolean;
  groups: CreditGuideGroup[];
}

interface Wrapped<T> {
  success: boolean;
  data: T;
}

export function useCreditsGuide() {
  return useQuery({
    queryKey: ['credits', 'guide'],
    queryFn: () => apiGet<Wrapped<CreditGuide>>('/credits/guide').then((r) => r.data),
    // Rates change when an operator edits them, not minute to minute.
    staleTime: 5 * 60 * 1000,
  });
}
