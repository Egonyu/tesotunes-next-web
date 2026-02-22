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
    queryFn: () => apiGet<{ data: SaccoMember | null }>("/sacco/membership")
      .then(res => res.data),
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
      payment_method?: 'mtn_momo' | 'airtel_money';
    }) => apiPost<{ message: string; data: SaccoMember }>("/sacco/join", data)
      .then(res => res),
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
    queryFn: () => apiGet<{ data: SaccoMemberDashboard }>("/sacco/me")
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
    }>("/sacco/savings").then(res => res.data),
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
      payment_method: 'mtn_momo' | 'airtel_money';
    }) => apiPost<{
            message: string;
      data: { reference: string; status: 'pending' | 'processing' };
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
    queryFn: () => apiGet<{
            data: SaccoTransaction[];
      pagination: { current_page: number; last_page: number; total: number };
    }>("/sacco/transactions", { params }),
    staleTime: 30 * 1000,
  });
}

// ============================================================================
// Loan Hooks
// ============================================================================

export function useSaccoLoanProducts() {
  return useQuery({
    queryKey: ["sacco", "loan-products"],
    queryFn: () => apiGet<{ data: SaccoLoanProduct[] }>("/sacco/loan-products")
      .then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSaccoLoans(params?: { status?: string }) {
  return useQuery({
    queryKey: ["sacco", "loans", params],
    queryFn: () => apiGet<{
            data: SaccoLoan[];
    }>("/sacco/loans", { params }).then(res => res.data),
    staleTime: 60 * 1000,
  });
}

export function useSaccoLoan(id: number) {
  return useQuery({
    queryKey: ["sacco", "loans", id],
    queryFn: () => apiGet<{ data: SaccoLoan }>(`/sacco/loans/${id}`)
      .then(res => res.data),
    enabled: !!id,
  });
}

export function useSaccoActiveLoan() {
  return useQuery({
    queryKey: ["sacco", "loans", "active"],
    queryFn: () => apiGet<{ data: SaccoLoan | null }>("/sacco/loans/active")
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
      payment_method: 'mtn_momo' | 'airtel_money';
    }) => apiPost<{
            message: string;
      data: { reference: string; status: 'pending' | 'processing' };
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
    queryFn: () => apiGet<{ data: SaccoShare }>("/sacco/shares")
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
  return useQuery({
    queryKey: ["sacco", "dividends"],
    queryFn: () => apiGet<{ data: SaccoDividend[] }>("/sacco/dividends")
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
