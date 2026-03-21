import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { useSession } from "next-auth/react";
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
  loan_number?: string;
  loan_type?: string;
  product_name?: string;
  principal_amount_ugx?: number;
  interest_rate?: number;
  total_payable_ugx?: number;
  amount_paid_ugx?: number;
  balance_remaining_ugx?: number;
  status?: string;
  tenure_months?: number;
  disbursement_date?: string | null;
  maturity_date?: string | null;
  first_payment_date?: string | null;
  monthly_installment_ugx?: number;
  repayments?: Array<{
    id: number;
    amount_ugx?: number;
    payment_date?: string;
    created_at?: string;
    principal_paid_ugx?: number;
    interest_paid_ugx?: number;
  }>;
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

interface BackendSavingsSummary {
  accounts?: Array<{
    id: number;
    account_number?: string;
    account_type?: string;
    account_name?: string;
    balance_ugx?: number;
    interest_rate?: number;
    accrued_interest_ugx?: number;
    status?: string;
    created_at?: string;
  }>;
  balance?: number;
  interest_earned?: number;
  interest_rate?: number;
  this_month?: number;
  last_deposit?: string | null;
  goals?: Array<{ id: number; name: string; target: number; current: number; deadline: string }>;
}

interface BackendTransaction {
  id: number;
  type?: string;
  amount_ugx?: number;
  description?: string;
  created_at?: string;
  payment_date?: string;
  status?: string;
  reference_number?: string;
}

interface BackendShareSummary {
  member_id?: number;
  total_shares?: number;
  share_value?: number;
  total_value?: number;
  purchases?: Array<{
    id: number;
    type?: string;
    quantity?: number;
    amount?: number;
    date?: string;
  }>;
  market?: {
    price_per_share_ugx?: number;
    total_shares_issued?: number;
    total_market_value_ugx?: number;
  };
}

// ---- Helpers ----

/** Safely extract `.data` from canonical API responses, falling back to the raw payload if needed. */
function extractData<T>(res: { data?: T } | T): T {
  if (res && typeof res === "object" && "data" in (res as Record<string, unknown>)) {
    return (res as { data: T }).data;
  }

  return res as T;
}

// ============================================================================
// Membership Hooks
// ============================================================================

export function useSaccoMembership() {
  const { status } = useSession();

  return useQuery({
    queryKey: ["sacco", "membership"],
    queryFn: async (): Promise<SaccoMember | null> => {
      const res = await apiGet<{ data: BackendProfile | null }>("/sacco/membership");
      const d = extractData(res);
      if (!d || !d.member_number) return null;

      const sharesRecord = (d.shares as { total_shares?: number; total_value_ugx?: number; share_value_ugx?: number } | undefined);
      const savingsAccounts = Array.isArray(d.savings_accounts)
        ? (d.savings_accounts as Array<{ balance_ugx?: number }>)
        : [];

      return {
        id: d.id ?? 0,
        member_number: d.member_number ?? "",
        user_id: 0,
        status: (d.status as SaccoMember["status"]) ?? "pending",
        joined_at: d.joined_at ?? "",
        savings_balance:
          Number((d as BackendProfile & { total_savings?: number }).total_savings ?? 0) ||
          savingsAccounts.reduce((sum, account) => sum + Number(account.balance_ugx ?? 0), 0),
        shares_count: Number(sharesRecord?.total_shares ?? 0),
        shares_value: Number(sharesRecord?.total_value_ugx ?? 0),
        credit_score: d.credit_score,
      };
    },
    staleTime: 60 * 1000,
    enabled: status === "authenticated",
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
      const res = await apiGet<{ data: BackendDashboard }>("/sacco/dashboard");
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
      const res = await apiGet<{ data: BackendSavingsSummary }>("/sacco/savings");
      const summary = extractData(res);
      return {
        balance: summary?.balance ?? 0,
        interest_earned: summary?.interest_earned ?? 0,
        interest_rate: summary?.interest_rate ?? 0,
        this_month: summary?.this_month ?? 0,
        last_deposit: summary?.last_deposit ?? null,
        goals: summary?.goals ?? [],
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
      }>("/sacco/savings/deposit", data),
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
      }>("/sacco/savings/withdraw", data),
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
        data: BackendTransaction[];
        meta?: { current_page?: number; last_page?: number; total?: number };
      }>("/sacco/transactions", { params: { ...params, per_page: params?.limit } });

      const items = Array.isArray(res.data) ? res.data : [];

      const data: SaccoTransaction[] = items.map((tx) => ({
        id: tx.id,
        type: (tx.type ?? "deposit") as SaccoTransaction["type"],
        amount: tx.amount_ugx ?? 0,
        description: tx.description ?? "",
        date: tx.payment_date ?? tx.created_at ?? "",
        status: (tx.status ?? "completed") as SaccoTransaction["status"],
        reference: tx.reference_number,
      }));

      return {
        data,
        pagination: {
          current_page: res.meta?.current_page ?? 1,
          last_page: res.meta?.last_page ?? 1,
          total: res.meta?.total ?? data.length,
        },
      };
    },
    staleTime: 30 * 1000,
  });
}

// ============================================================================
// Loan Hooks
// ============================================================================

function mapBackendLoan(raw: BackendLoan): SaccoLoan {
  const statusMap: Record<string, SaccoLoan["status"]> = {
    paid: "paid_off",
    active: "active",
    disbursed: "disbursed",
    pending: "pending",
    rejected: "rejected",
    overdue: "overdue",
  };

  return {
    id: raw.id,
    amount: raw.principal_amount_ugx ?? raw.total_payable_ugx ?? 0,
    balance: raw.balance_remaining_ugx ?? 0,
    interest_rate: raw.interest_rate ?? 0,
    term_months: raw.tenure_months ?? 0,
    monthly_payment: raw.monthly_installment_ugx ?? 0,
    next_payment: raw.monthly_installment_ugx ?? 0,
    due_date: raw.first_payment_date ?? raw.maturity_date ?? "",
    status: statusMap[raw.status ?? "pending"] ?? "pending",
    product: raw.product_name ?? raw.loan_type ?? "Loan",
    disbursed_at: raw.disbursement_date ?? null,
    payments: (raw.repayments ?? []).map((payment) => ({
      id: payment.id,
      amount: payment.amount_ugx ?? 0,
      date: payment.payment_date ?? payment.created_at ?? "",
      principal: payment.principal_paid_ugx ?? 0,
      interest: payment.interest_paid_ugx ?? 0,
    })),
  };
}

export function useSaccoLoanProducts() {
  return useQuery({
    queryKey: ["sacco", "loan-products"],
    queryFn: async (): Promise<SaccoLoanProduct[]> => {
      const res = await apiGet<{ data: BackendLoanProduct[] }>("/sacco/loan-products");
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
      const res = await apiGet<{ data: BackendLoan[] }>("/sacco/loans", { params });
      const items = Array.isArray(res.data) ? res.data : [];
      return (items ?? []).map(mapBackendLoan);
    },
    staleTime: 60 * 1000,
  });
}

export function useSaccoLoan(id: number) {
  return useQuery({
    queryKey: ["sacco", "loans", id],
    queryFn: async (): Promise<SaccoLoan> => {
      const res = await apiGet<{ data: BackendLoan }>(`/sacco/loans/${id}`);
      return mapBackendLoan(extractData(res));
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
      product_id?: number;
      loan_type?: "normal" | "emergency" | "development" | "school_fees";
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
      }>(`/sacco/loans/${data.loan_id}/repay`, data),
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
      const res = await apiGet<{ data: BackendShareSummary }>("/sacco/shares");
      const summary = extractData(res);
      const totalValue = summary?.total_value ?? 0;
      const SHARE_PRICE = summary?.share_value ?? summary?.market?.price_per_share_ugx ?? 10000;
      return {
        total_shares: summary?.total_shares ?? (SHARE_PRICE > 0 ? Math.round(totalValue / SHARE_PRICE) : 0),
        share_value: SHARE_PRICE,
        total_value: totalValue,
        purchases: (summary?.purchases ?? [])
          .filter((purchase) => purchase.type === "purchase")
          .map((purchase) => ({
            id: purchase.id,
            quantity: purchase.quantity ?? 0,
            amount: purchase.amount ?? 0,
            date: purchase.date ?? "",
          })),
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
        data: {
          reference?: string;
          status?: "pending" | "processing" | "completed";
          total_shares?: number;
          total_value?: number;
        };
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

export interface SaccoLoanEligibility {
  is_eligible: boolean;
  max_amount: number;
  credit_score: number;
  savings_balance: number;
  shares_value: number;
  membership_months?: number;
  reasons?: string[];
  product?: {
    id: number;
    name: string;
    requires_guarantors: boolean;
    min_guarantors: number;
  } | null;
}

export interface SaccoGuarantor {
  id: number;
  name: string;
  member_number: string;
  credit_score: number;
  total_savings: number;
  shares_value: number;
  active_loans: number;
}

export interface SaccoLoanSchedulePreview {
  product: { id: number; name: string };
  summary: {
    principal_amount: number;
    interest_amount: number;
    processing_fee: number;
    insurance_fee: number;
    total_amount: number;
    monthly_installment: number;
    term_months: number;
  };
  schedule: Array<{
    installment: number;
    due_date: string;
    amount_ugx: number;
    balance_after_ugx: number;
  }>;
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

export function useSaccoProfile() {
  return useQuery({
    queryKey: ["sacco", "profile"],
    queryFn: () => apiGet<{ data: BackendProfile }>("/sacco/profile").then((res) => extractData(res)),
    staleTime: 60 * 1000,
  });
}

export function useSaccoLoanEligibility(productId?: number) {
  return useQuery({
    queryKey: ["sacco", "loan-eligibility", productId],
    queryFn: () =>
      apiGet<{ data: SaccoLoanEligibility }>("/sacco/loans/eligibility", {
        params: productId ? { product_id: productId } : undefined,
      }).then((res) => extractData(res)),
    staleTime: 60 * 1000,
  });
}

export function useSaccoGuarantors(search?: string) {
  return useQuery({
    queryKey: ["sacco", "guarantors", search],
    queryFn: () =>
      apiGet<{ data: SaccoGuarantor[] }>("/sacco/loans/guarantors", {
        params: search ? { search } : undefined,
      }).then((res) => extractData(res)),
    staleTime: 60 * 1000,
  });
}

export function useLoanSchedulePreview() {
  return useMutation({
    mutationFn: (data: { product_id: number; amount: number; term_months: number }) =>
      apiPost<{ data: SaccoLoanSchedulePreview }>("/sacco/loans/calculate-schedule", data).then(
        (res) => extractData(res)
      ),
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
  description?: string;
  meeting_type?: string;
  agenda?: string;
  meeting_date: string;
  scheduled_at?: string;
  location?: string;
  is_online: boolean;
  meeting_link?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  attendees_count: number;
  is_attending?: boolean;
  quorum_required?: number;
  quorum_met?: boolean;
  proxy_name?: string | null;
  minutes?: string | null;
  resolutions?: string[];
}

export interface SaccoNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  channel: string;
  data: Record<string, unknown>;
  read_at?: string | null;
  sent_at?: string | null;
  created_at?: string | null;
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
    mutationFn: ({ meetingId, attending, proxy_name }: { meetingId: number; attending: boolean; proxy_name?: string }) =>
      apiPost<{ message: string; data: SaccoMeeting }>(`/sacco/meetings/${meetingId}/rsvp`, { attending, proxy_name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacco', 'meetings'] });
    },
  });
}

export function useSaccoNotifications(limit = 20) {
  return useQuery({
    queryKey: ['sacco', 'notifications', limit],
    queryFn: async () => {
      const res = await apiGet<{ data: SaccoNotification[]; meta?: { unread_count?: number } }>(
        '/sacco/notifications',
        { params: { limit } }
      );

      return {
        notifications: res.data ?? [],
        unreadCount: res.meta?.unread_count ?? 0,
      };
    },
    staleTime: 60 * 1000,
  });
}

export function useMarkSaccoNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: number) => apiPost<{ message: string }>(`/sacco/notifications/${notificationId}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacco', 'notifications'] });
    },
  });
}

export function useMarkAllSaccoNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<{ message: string }>('/sacco/notifications/read-all', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacco', 'notifications'] });
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
  useSaccoProfile,
  useSaccoLoanEligibility,
  useSaccoGuarantors,
  useLoanSchedulePreview,
  useSaccoGroups,
  useSaccoMeetings,
  useRsvpMeeting,
  useSaccoFines,
  usePaySaccoFine,
  useSaccoWithdrawalRequests,
  useCreateWithdrawalRequest,
};
