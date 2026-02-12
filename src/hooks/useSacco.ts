import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";

// ============================================================================
// Types
// ============================================================================

export interface SaccoMember {
  id: number;
  member_number: string;
  user_id: number;
  status: 'active' | 'suspended' | 'pending';
  joined_at: string;
  savings_balance: number;
  shares_count: number;
  shares_value: number;
}

export interface SaccoMemberDashboard {
  member_number: string;
  member_since: string;
  status: 'active' | 'pending' | 'suspended';
  savings: {
    balance: number;
    change: number;
    this_month: number;
  };
  shares: {
    count: number;
    value: number;
    change: number;
  };
  loans: {
    active: number;
    total_borrowed: number;
    total_paid: number;
    balance: number;
  };
  dividends: {
    last_year: number;
    pending: number;
  };
}

export interface SaccoTransaction {
  id: number;
  type: 'deposit' | 'withdrawal' | 'loan_payment' | 'dividend' | 'share_purchase';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
}

export interface SaccoLoanProduct {
  id: number;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  interest_rate: number;
  term_months: number[];
  requirements: string[];
  processing_fee: number;
}

export interface SaccoLoan {
  id: number;
  amount: number;
  balance: number;
  interest_rate: number;
  term_months: number;
  monthly_payment: number;
  next_payment: number;
  due_date: string;
  status: 'active' | 'overdue' | 'paid_off' | 'pending' | 'rejected';
  product: string;
  disbursed_at: string | null;
  payments: Array<{
    id: number;
    amount: number;
    date: string;
    principal: number;
    interest: number;
  }>;
}

export interface SaccoShare {
  total_shares: number;
  share_value: number;
  total_value: number;
  purchases: Array<{
    id: number;
    quantity: number;
    amount: number;
    date: string;
  }>;
}

export interface SaccoDividend {
  id: number;
  year: number;
  amount: number;
  rate: number;
  status: 'paid' | 'pending';
  paid_at: string | null;
}

// ============================================================================
// Membership Hooks
// ============================================================================

export function useSaccoMembership() {
  return useQuery({
    queryKey: ["sacco", "membership"],
    queryFn: () => apiGet<{ data: SaccoMember | null }>("/api/sacco/membership")
      .then(res => res.data),
    staleTime: 60 * 1000,
  });
}

export function useJoinSacco() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { 
      initial_deposit?: number;
      initial_shares?: number;
      phone_number: string;
      payment_method?: 'mtn_momo' | 'airtel_money';
    }) => apiPost<{ message: string; data: SaccoMember }>("/api/sacco/join", data),
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
    queryFn: () => apiGet<{ data: SaccoMemberDashboard }>("/api/sacco/me")
      .then(res => res.data),
    staleTime: 30 * 1000,
  });
}

// ============================================================================
// Savings Hooks
// ============================================================================

export function useSaccoSavings() {
  return useQuery({
    queryKey: ["sacco", "savings"],
    queryFn: () => apiGet<{ 
            data: { 
        balance: number; 
        interest_earned: number;
        interest_rate: number;
        this_month: number;
        last_deposit: string | null;
        goals?: Array<{
          id: number;
          name: string;
          target: number;
          current: number;
          deadline: string;
        }>;
      } 
    }>("/api/sacco/savings").then(res => res.data),
    staleTime: 60 * 1000,
  });
}

export function useSaccoDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { 
      amount: number; 
      phone_number: string;
      payment_method: 'mtn_momo' | 'airtel_money';
    }) => apiPost<{ 
            message: string;
      data: { reference: string; status: 'pending' | 'processing' };
    }>("/api/sacco/deposit", data),
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
      payment_method: 'mtn_momo' | 'airtel_money';
    }) => apiPost<{ 
            message: string;
      data: { reference: string; status: 'pending' | 'processing' };
    }>("/api/sacco/withdraw", data),
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
    queryFn: () => apiGet<{ 
            data: SaccoTransaction[];
      pagination: { current_page: number; last_page: number; total: number };
    }>("/api/sacco/transactions", { params }),
    staleTime: 30 * 1000,
  });
}

// ============================================================================
// Loan Hooks
// ============================================================================

export function useSaccoLoanProducts() {
  return useQuery({
    queryKey: ["sacco", "loan-products"],
    queryFn: () => apiGet<{ data: SaccoLoanProduct[] }>("/api/sacco/loan-products")
      .then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSaccoLoans(params?: { status?: string }) {
  return useQuery({
    queryKey: ["sacco", "loans", params],
    queryFn: () => apiGet<{ 
            data: SaccoLoan[];
    }>("/api/sacco/loans", { params }).then(res => res.data),
    staleTime: 60 * 1000,
  });
}

export function useSaccoLoan(id: number) {
  return useQuery({
    queryKey: ["sacco", "loans", id],
    queryFn: () => apiGet<{ data: SaccoLoan }>(`/api/sacco/loans/${id}`)
      .then(res => res.data),
    enabled: !!id,
  });
}

export function useSaccoActiveLoan() {
  return useQuery({
    queryKey: ["sacco", "loans", "active"],
    queryFn: () => apiGet<{ data: SaccoLoan | null }>("/api/sacco/loans/active")
      .then(res => res.data),
    staleTime: 60 * 1000,
  });
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
      payment_method?: 'mtn_momo' | 'airtel_money';
    }) => apiPost<{ 
            message: string; 
      data: { loan_id: number; status: 'pending' };
    }>("/api/sacco/loans/apply", data),
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
      payment_method: 'mtn_momo' | 'airtel_money';
    }) => apiPost<{ 
            message: string;
      data: { reference: string; status: 'pending' | 'processing' };
    }>(`/api/sacco/loans/${data.loan_id}/pay`, data),
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
    queryFn: () => apiGet<{ data: SaccoShare }>("/api/sacco/shares")
      .then(res => res.data),
    staleTime: 60 * 1000,
  });
}

export function useBuyShares() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      quantity: number;
      phone_number: string;
      payment_method: 'mtn_momo' | 'airtel_money';
    }) => apiPost<{ 
            message: string;
      data: { reference: string; status: 'pending' | 'processing' };
    }>("/api/sacco/shares/buy", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sacco"] });
    },
  });
}

// ============================================================================
// Dividends Hook
// ============================================================================

export function useSaccoDividends() {
  return useQuery({
    queryKey: ["sacco", "dividends"],
    queryFn: () => apiGet<{ data: SaccoDividend[] }>("/api/sacco/dividends")
      .then(res => res.data),
    staleTime: 5 * 60 * 1000,
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
};
