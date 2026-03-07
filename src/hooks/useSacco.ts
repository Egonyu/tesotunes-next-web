import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, getAuthToken } from "@/lib/api";
import type {
  SaccoMember,
  SaccoMemberDashboard,
  SaccoTransaction,
  SaccoLoanProduct,
  SaccoLoan,
  SaccoShare,
  SaccoDividend,
} from "@/types/sacco";

// Re-export types for backward compatibility
export type {
  SaccoMember,
  SaccoMemberDashboard,
  SaccoTransaction,
  SaccoLoanProduct,
  SaccoLoan,
  SaccoShare,
  SaccoDividend,
} from "@/types/sacco";

// ---- Backend response types (raw API shapes) ----

interface BackendDashboard {
  member?: {
    id?: number;
    member_number?: string;
    status?: string;
    credit_score?: number;
    joined_at?: string;
  };
  accounts?: {
    savings?: number;
    shares?: number;
    fixed_deposits?: number;
  };
  loans?: {
    active_count?: number;
    total_borrowed?: number;
    total_outstanding?: number;
    total_paid?: number;
  };
  transactions?: {
    today?: number;
    this_month?: number;
    total_volume?: number;
  };
  dividends?: {
    total_earned?: number;
    pending?: number;
  };
}

interface BackendProfile {
  id?: number;
  member_number?: string;
  status?: string;
  credit_score?: number;
  joined_at?: string;
  user?: { name?: string; email?: string };
  national_id?: string;
  phone_number?: string;
  [key: string]: unknown;
}

interface BackendLoan {
  id: number;
  application_number?: string;
  product?: string;
  principal_amount?: number;
  interest_rate?: number;
  total_amount?: number;
  amount_paid?: number;
  outstanding_balance?: number;
  status?: string;
  duration_months?: number;
  disbursement_date?: string | null;
  due_date?: string | null;
  next_payment_date?: string | null;
  next_payment_amount?: number;
}

interface BackendLoanProduct {
  id: number;
  name?: string;
  description?: string;
  min_amount?: number;
  max_amount?: number;
  interest_rate?: number;
  min_duration_months?: number;
  max_duration_months?: number;
  processing_fee_rate?: number;
  requires_guarantors?: boolean;
  min_guarantors?: number;
  is_eligible?: boolean;
  max_eligible_amount?: number;
  eligibility_requirements?: Record<string, unknown>;
}

interface BackendAccount {
  id: number;
  account_number?: string;
  account_type?: string;
  balance?: number;
  interest_rate?: number;
  status?: string;
  created_at?: string;
}

// ---- Helpers ----

/** Safely extract `.data` from backend `{ success, data }` wrapper. */
function extractData<T>(res: { success?: boolean; data?: T }): T {
  return (res as { data: T }).data;
}

// ============================================================================
// Membership Hooks
// ============================================================================

export function useSaccoMembership() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    setEnabled(!!getAuthToken());
  }, []);
  return useQuery({
    queryKey: ["sacco", "membership"],
    queryFn: async (): Promise<SaccoMember | null> => {
      const res = await apiGet<{ success: boolean; data: BackendProfile }>("/sacco/membership");
      const d = extractData(res);
      if (!d || !d.member_number) return null;
      return {
        id: d.id ?? 0,
        member_number: d.member_number ?? "",
        user_id: 0,
        status: (d.status as SaccoMember["status"]) ?? "pending",
        joined_at: d.joined_at ?? "",
        savings_balance: 0, // Not returned by profile endpoint
        shares_count: 0,
        shares_value: 0,
        credit_score: d.credit_score,
      };
    },
    staleTime: 60 * 1000,
    enabled,
    retry: 1,
  });
}

export function useJoinSacco() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      initial_deposit?: number;
      initial_shares?: number;
      phone_number: string;
      payment_method?: "mtn_momo" | "airtel_money";
    }) =>
      apiPost<{ message: string; data: SaccoMember }>("/sacco/join", data).then(
        (res) => res
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sacco"] });
    },
  });
}

// ============================================================================
// Dashboard Hook
// ============================================================================

export function useSaccoDashboard() {
  return useQuery({
    queryKey: ["sacco", "dashboard"],
    queryFn: async (): Promise<SaccoMemberDashboard> => {
      const res = await apiGet<{ success: boolean; data: BackendDashboard }>("/sacco/me");
      const d = extractData(res);
      return {
        member_number: d.member?.member_number ?? "",
        member_since: d.member?.joined_at ?? "",
        status: (d.member?.status as SaccoMemberDashboard["status"]) ?? "pending",
        savings: {
          balance: d.accounts?.savings ?? 0,
          change: 0,
          this_month: d.transactions?.this_month ?? 0,
          total_credits: 0,
        },
        shares: {
          count: 0,
          value: d.accounts?.shares ?? 0,
          change: 0,
        },
        loans: {
          active: d.loans?.active_count ?? 0,
          total_borrowed: d.loans?.total_borrowed ?? 0,
          total_paid: d.loans?.total_paid ?? 0,
          balance: d.loans?.total_outstanding ?? 0,
        },
        dividends: {
          last_year: d.dividends?.total_earned ?? 0,
          pending: d.dividends?.pending ?? 0,
        },
      };
    },
    staleTime: 30 * 1000,
  });
}

// ============================================================================
// Savings Hooks
// ============================================================================

export function useSaccoSavings() {
  return useQuery({
    queryKey: ["sacco", "savings"],
    queryFn: async () => {
      const res = await apiGet<{ success: boolean; data: BackendAccount[] }>("/sacco/savings");
      const accounts = extractData(res);
      const savingsAccounts = Array.isArray(accounts)
        ? accounts.filter((a) => a.account_type === "savings")
        : [];
      const totalBalance = savingsAccounts.reduce((s, a) => s + (a.balance ?? 0), 0);
      const avgRate = savingsAccounts.length
        ? savingsAccounts.reduce((s, a) => s + (a.interest_rate ?? 0), 0) / savingsAccounts.length
        : 12;
      return {
        balance: totalBalance,
        interest_earned: 0,
        interest_rate: avgRate,
        this_month: 0,
        last_deposit: null as string | null,
        goals: [] as Array<{ id: number; name: string; target: number; current: number; deadline: string }>,
      };
    },
    staleTime: 60 * 1000,
  });
}

export function useSaccoDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      amount: number;
      phone_number: string;
      payment_method: "mtn_momo" | "airtel_money";
    }) =>
      apiPost<{
        message: string;
        data: { reference: string; status: "pending" | "processing" };
      }>("/sacco/deposit", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sacco"] });
    },
  });
}

export function useSaccoWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      amount: number;
      phone_number: string;
      payment_method: "mtn_momo" | "airtel_money";
    }) =>
      apiPost<{
        message: string;
        data: { reference: string; status: "pending" | "processing" };
      }>("/sacco/withdraw", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sacco"] });
    },
  });
}

// ============================================================================
// Transaction Hooks
// ============================================================================

export function useSaccoTransactions(params?: {
  type?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["sacco", "transactions", params],
    queryFn: async () => {
      const res = await apiGet<{
        success: boolean;
        data: Array<{
          id: number;
          transaction_type?: string;
          type?: string;
          amount?: number;
          description?: string;
          created_at?: string;
          date?: string;
          status?: string;
          reference?: string;
          account?: { account_type?: string };
        }>;
      }>("/sacco/transactions", { params: { ...params, per_page: params?.limit } });

      const raw = extractData(res);
      const items = Array.isArray(raw) ? raw : (raw as unknown as { data: typeof raw }).data ?? [];

      const data: SaccoTransaction[] = items.map((tx) => ({
        id: tx.id,
        type: (tx.transaction_type ?? tx.type ?? "deposit") as SaccoTransaction["type"],
        amount: tx.amount ?? 0,
        description: tx.description ?? "",
        date: tx.created_at ?? tx.date ?? "",
        status: (tx.status ?? "completed") as SaccoTransaction["status"],
        reference: tx.reference,
      }));

      return { data, pagination: { current_page: 1, last_page: 1, total: data.length } };
    },
    staleTime: 30 * 1000,
  });
}

// ============================================================================
// Loan Hooks
// ============================================================================

function mapBackendLoan(raw: BackendLoan): SaccoLoan {
  return {
    id: raw.id,
    amount: raw.principal_amount ?? raw.total_amount ?? 0,
    balance: raw.outstanding_balance ?? 0,
    interest_rate: raw.interest_rate ?? 0,
    term_months: raw.duration_months ?? 0,
    monthly_payment: raw.next_payment_amount ?? 0,
    next_payment: raw.next_payment_amount ?? 0,
    due_date: raw.next_payment_date ?? raw.due_date ?? "",
    status: (raw.status ?? "pending") as SaccoLoan["status"],
    product: raw.product ?? "Loan",
    disbursed_at: raw.disbursement_date ?? null,
    payments: [],
  };
}

export function useSaccoLoanProducts() {
  return useQuery({
    queryKey: ["sacco", "loan-products"],
    queryFn: async (): Promise<SaccoLoanProduct[]> => {
      const res = await apiGet<{ success: boolean; data: BackendLoanProduct[] }>("/sacco/loan-products");
      const items = extractData(res);
      return (items ?? []).map((p) => {
        const minM = p.min_duration_months ?? 1;
        const maxM = p.max_duration_months ?? 12;
        const months: number[] = [];
        for (let m = minM; m <= maxM; m += 3) months.push(m);
        if (!months.includes(maxM)) months.push(maxM);

        return {
          id: p.id,
          name: p.name ?? "",
          code: "",
          description: p.description ?? "",
          min_amount: p.min_amount ?? 0,
          max_amount: p.max_amount ?? 0,
          interest_rate: p.interest_rate ?? 0,
          term_months: months,
          requirements: [],
          processing_fee: p.processing_fee_rate ?? 0,
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaccoLoans(params?: { status?: string }) {
  return useQuery({
    queryKey: ["sacco", "loans", params],
    queryFn: async (): Promise<SaccoLoan[]> => {
      const res = await apiGet<{ success: boolean; data: BackendLoan[] }>("/sacco/loans", { params });
      const items = extractData(res);
      return (items ?? []).map(mapBackendLoan);
    },
    staleTime: 60 * 1000,
  });
}

export function useSaccoLoan(id: number) {
  return useQuery({
    queryKey: ["sacco", "loans", id],
    queryFn: async (): Promise<SaccoLoan> => {
      const res = await apiGet<{ success: boolean; data: { loan: BackendLoan } }>(`/sacco/loans/${id}`);
      const d = extractData(res);
      return mapBackendLoan(d.loan ?? (d as unknown as BackendLoan));
    },
    enabled: !!id,
  });
}

export function useSaccoActiveLoan() {
  // Derive from the full loans list – no dedicated backend endpoint
  const result = useSaccoLoans();
  return {
    ...result,
    data: result.data?.find((l) => l.status === "active") ?? null,
  };
}

export function useApplyForLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      product_id: number;
      amount: number;
      term_months: number;
      purpose: string;
      phone_number: string;
      payment_method?: "mtn_momo" | "airtel_money";
    }) =>
      apiPost<{
        message: string;
        data: { loan_id: number; status: "pending" };
      }>("/sacco/loans/apply", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sacco", "loans"] });
      queryClient.invalidateQueries({ queryKey: ["sacco", "dashboard"] });
    },
  });
}

export function useMakeLoanPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      loan_id: number;
      amount: number;
      phone_number: string;
      payment_method: "mtn_momo" | "airtel_money";
    }) =>
      apiPost<{
        message: string;
        data: { reference: string; status: "pending" | "processing" };
      }>(`/sacco/loans/${data.loan_id}/pay`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sacco"] });
    },
  });
}

// ============================================================================
// Shares Hooks
// ============================================================================

export function useSaccoShares() {
  return useQuery({
    queryKey: ["sacco", "shares"],
    queryFn: async (): Promise<SaccoShare> => {
      const res = await apiGet<{ success: boolean; data: BackendAccount[] }>("/sacco/shares");
      const accounts = extractData(res);
      const shareAccounts = Array.isArray(accounts)
        ? accounts.filter((a) => a.account_type === "shares")
        : [];
      const totalValue = shareAccounts.reduce((s, a) => s + (a.balance ?? 0), 0);
      const SHARE_PRICE = 10000; // UGX per share – platform constant
      return {
        total_shares: SHARE_PRICE > 0 ? Math.round(totalValue / SHARE_PRICE) : 0,
        share_value: SHARE_PRICE,
        total_value: totalValue,
        purchases: [],
      };
    },
    staleTime: 60 * 1000,
  });
}

export function useBuyShares() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      quantity: number;
      phone_number: string;
      payment_method: "mtn_momo" | "airtel_money";
    }) =>
      apiPost<{
        message: string;
        data: { reference: string; status: "pending" | "processing" };
      }>("/sacco/shares/buy", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sacco"] });
    },
  });
}

// ============================================================================
// Dividends Hook
// ============================================================================

export function useSaccoDividends() {
  // No dedicated dividends endpoint in the backend yet.
  // Return empty array so consumers don't error out.
  return useQuery({
    queryKey: ["sacco", "dividends"],
    queryFn: (): Promise<SaccoDividend[]> => Promise.resolve([]),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// Contributions Hooks
// ============================================================================

export interface SaccoContribution {
  id: number;
  amount: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed';
  contribution_date: string;
  reference?: string;
  notes?: string;
}

export function useSaccoContributions(params?: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: ['sacco', 'contributions', params],
    queryFn: async () => {
      const res = await apiGet<{ success: boolean; data: SaccoContribution[] }>(
        '/sacco/contributions',
        { params }
      );
      const raw = extractData(res);
      const items = Array.isArray(raw) ? raw : (raw as unknown as { data: SaccoContribution[] }).data ?? [];
      return { data: items, total: items.length };
    },
    staleTime: 60 * 1000,
  });
}

// ============================================================================
// Groups Hooks
// ============================================================================

export interface SaccoGroup {
  id: number;
  name: string;
  description?: string;
  members_count: number;
  created_at: string;
  is_member: boolean;
}

export function useSaccoGroups() {
  return useQuery({
    queryKey: ['sacco', 'groups'],
    queryFn: async () => {
      const res = await apiGet<{ success: boolean; data: SaccoGroup[] }>('/sacco/groups');
      const raw = extractData(res);
      return Array.isArray(raw) ? raw : (raw as unknown as { data: SaccoGroup[] }).data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================================================
// Meetings Hooks
// ============================================================================

export interface SaccoMeeting {
  id: number;
  title: string;
  agenda?: string;
  meeting_date: string;
  location?: string;
  is_online: boolean;
  meeting_link?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  attendees_count: number;
  is_attending?: boolean;
}

export function useSaccoMeetings(params?: { status?: string }) {
  return useQuery({
    queryKey: ['sacco', 'meetings', params],
    queryFn: async () => {
      const res = await apiGet<{ success: boolean; data: SaccoMeeting[] }>(
        '/sacco/meetings',
        { params }
      );
      const raw = extractData(res);
      return Array.isArray(raw) ? raw : (raw as unknown as { data: SaccoMeeting[] }).data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useRsvpMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ meetingId, attending }: { meetingId: number; attending: boolean }) =>
      apiPost<{ message: string }>(`/sacco/meetings/${meetingId}/rsvp`, { attending }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacco', 'meetings'] });
    },
  });
}

// ============================================================================
// Fines Hooks
// ============================================================================

export interface SaccoFine {
  id: number;
  reason: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'waived' | 'overdue';
  issued_date: string;
  paid_at?: string;
}

export function useSaccoFines(params?: { status?: string }) {
  return useQuery({
    queryKey: ['sacco', 'fines', params],
    queryFn: async () => {
      const res = await apiGet<{ success: boolean; data: SaccoFine[] }>(
        '/sacco/fines',
        { params }
      );
      const raw = extractData(res);
      return Array.isArray(raw) ? raw : (raw as unknown as { data: SaccoFine[] }).data ?? [];
    },
    staleTime: 60 * 1000,
  });
}

export function usePaySaccoFine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      fine_id: number;
      phone_number: string;
      payment_method: 'mtn_momo' | 'airtel_money';
    }) =>
      apiPost<{ message: string; data: { reference: string } }>(
        `/sacco/fines/${data.fine_id}/pay`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacco', 'fines'] });
      queryClient.invalidateQueries({ queryKey: ['sacco', 'dashboard'] });
    },
  });
}

// ============================================================================
// Withdrawal Requests Hooks
// ============================================================================

export interface SaccoWithdrawalRequest {
  id: number;
  amount: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  requested_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
  payment_method: string;
  phone_number: string;
}

export function useSaccoWithdrawalRequests(params?: { status?: string }) {
  return useQuery({
    queryKey: ['sacco', 'withdrawal-requests', params],
    queryFn: async () => {
      const res = await apiGet<{ success: boolean; data: SaccoWithdrawalRequest[] }>(
        '/sacco/withdrawal-requests',
        { params }
      );
      const raw = extractData(res);
      return Array.isArray(raw) ? raw : (raw as unknown as { data: SaccoWithdrawalRequest[] }).data ?? [];
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateWithdrawalRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      amount: number;
      reason?: string;
      phone_number: string;
      payment_method: 'mtn_momo' | 'airtel_money';
    }) =>
      apiPost<{ message: string; data: SaccoWithdrawalRequest }>(
        '/sacco/withdrawal-requests',
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacco', 'withdrawal-requests'] });
      queryClient.invalidateQueries({ queryKey: ['sacco', 'dashboard'] });
    },
  });
}

// ============================================================================
// Re-export all hooks for easy imports
// ============================================================================

export const saccoHooks = {
  useSaccoMembership,
  useJoinSacco,
  useSaccoDashboard,
  useSaccoSavings,
  useSaccoDeposit,
  useSaccoWithdraw,
  useSaccoTransactions,
  useSaccoLoanProducts,
  useSaccoLoans,
  useSaccoLoan,
  useSaccoActiveLoan,
  useApplyForLoan,
  useMakeLoanPayment,
  useSaccoShares,
  useBuyShares,
  useSaccoDividends,
  useSaccoContributions,
  useSaccoGroups,
  useSaccoMeetings,
  useRsvpMeeting,
  useSaccoFines,
  usePaySaccoFine,
  useSaccoWithdrawalRequests,
  useCreateWithdrawalRequest,
};
