import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

// ============================================================================
// Unified account dashboard — matches App\Services\Dashboard\DashboardService
// ============================================================================

interface Money {
  ugx: number;
  credits: number;
}

export interface DashboardOverview {
  wallet: { ugx_balance: number; credits_balance: number };
  earnings: { pending: Money; available: Money; paid_out: Money };
  listening: { plays_total: number; plays_30d: number };
  capabilities: string[];
  contributions: {
    tier: string;
    submissions_total: number;
    submissions_accepted: number;
    validations_total: number;
    credits_earned_total: number;
  } | null;
  recent_activity: Array<{ type: string; label: string; at: string | null }>;
}

interface Wrapped<T> {
  success: boolean;
  data: T;
}

export function useDashboardOverview(enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => apiGet<Wrapped<DashboardOverview>>('/dashboard/overview').then((r) => r.data),
    enabled,
    staleTime: 30 * 1000,
  });
}
