import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";

// ============================================================================
// Types
// ============================================================================

export interface PhoneValidation {
  valid: boolean;
  phone: string;
  provider: 'mtn_momo' | 'airtel_money' | 'unknown';
  formatted: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  prefixes?: string[];
  min_amount: number;
  max_amount: number;
  currency: string;
  enabled?: boolean;
}

export interface PaymentMethodsResponse {
  mobile_money: PaymentMethod[];
  other: PaymentMethod[];
}

export interface InitiatePaymentRequest {
  phone: string;
  amount: number;
  purpose: 'wallet_topup' | 'subscription' | 'purchase' | 'tip';
  item_id?: string;
  item_type?: string;
}

export interface InitiatePaymentResponse {
  reference: string;
  status: 'pending' | 'processing';
  provider: 'mtn_momo' | 'airtel_money';
  phone: string;
  amount: number;
  message: string;
}

export interface PaymentStatus {
  reference: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  amount?: number;
  provider?: string;
  completed_at?: string;
}

export interface WalletInfo {
  balance: number;
  currency: string;
  formatted_balance: string;
}

export interface WalletTransactionItem {
  id: number;
  type: 'credit' | 'debit';
  amount: number;
  balance_after: number;
  description: string;
  reference: string;
  created_at: string;
}

export interface WalletTransactionsResponse {
  data: WalletTransactionItem[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ============================================================================
// Phone Validation Hook
// ============================================================================

export function useValidatePhone() {
  return useMutation({
    mutationFn: (phone: string) =>
      apiPost<{ success: boolean; data: PhoneValidation }>("/payments/mobile-money/validate-phone", { phone })
        .then(res => res.data),
  });
}

// ============================================================================
// Payment Methods Hook
// ============================================================================

export function usePaymentMethods() {
  return useQuery({
    queryKey: ["payment", "methods"],
    queryFn: () => apiGet<{ success: boolean; data: PaymentMethodsResponse }>("/payments/methods")
      .then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// Initiate Payment Hook
// ============================================================================

export function useInitiatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InitiatePaymentRequest) =>
      apiPost<{ success: boolean; data: InitiatePaymentResponse }>("/payments/mobile-money/initiate", data)
        .then(res => res.data),
    onSuccess: () => {
      // Invalidate wallet after payment initiated (will be updated on completion)
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

// ============================================================================
// Payment Status Hook
// ============================================================================

export function usePaymentStatus(reference: string, options?: { enabled?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ["payment", "status", reference],
    queryFn: () => apiGet<{ success: boolean; data: PaymentStatus }>(`/payments/mobile-money/status/${reference}`)
      .then(res => res.data),
    enabled: !!reference && (options?.enabled !== false),
    refetchInterval: options?.refetchInterval ?? 5000, // Poll every 5 seconds by default
    refetchIntervalInBackground: false,
  });
}

// ============================================================================
// Wallet Hooks
// ============================================================================

export function useWallet() {
  return useQuery({
    queryKey: ["wallet"],
    queryFn: () => apiGet<{ success: boolean; data: WalletInfo }>("/payments/wallet")
      .then(res => res.data),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useWalletTransactions(page: number = 1, perPage: number = 20) {
  return useQuery({
    queryKey: ["wallet", "transactions", page, perPage],
    queryFn: () => apiGet<{ success: boolean } & WalletTransactionsResponse>("/payments/wallet/transactions", {
      params: { page, per_page: perPage },
    }),
    staleTime: 30 * 1000,
  });
}

// ============================================================================
// Deposit Hook (shorthand for wallet topup)
// ============================================================================

export function useDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { phone?: string; amount: number; provider?: string }) => {
      const response = await apiPost<{ success: boolean; data: InitiatePaymentResponse & { transaction_ref?: string } }>("/payments/mobile-money/initiate", {
        phone: data.phone,
        amount: data.amount,
        purpose: 'wallet_topup',
        provider: data.provider,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

// ============================================================================
// Withdraw Hook
// ============================================================================

export interface WithdrawRequest {
  amount: number;
  phone: string;
  provider: 'mtn_momo' | 'airtel_money';
}

export interface WithdrawResponse {
  reference: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  amount: number;
  phone: string;
  message: string;
}

export function useWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WithdrawRequest) => {
      const response = await apiPost<{ success: boolean; data: WithdrawResponse }>("/payments/wallet/withdraw", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "transactions"] });
    },
  });
}

// ============================================================================
// Helper: Detect provider from phone number (client-side)
// ============================================================================

export function detectProvider(phone: string): 'mtn_momo' | 'airtel_money' | 'unknown' {
  const cleaned = phone.replace(/[^0-9]/g, '');
  let normalized = cleaned;

  // Normalize to start with 256
  if (normalized.startsWith('0')) {
    normalized = '256' + normalized.substring(1);
  }
  if (!normalized.startsWith('256')) {
    normalized = '256' + normalized;
  }

  // MTN prefixes
  if (/^256(77|78|76|39)/.test(normalized)) {
    return 'mtn_momo';
  }

  // Airtel prefixes
  if (/^256(70|75|74)/.test(normalized)) {
    return 'airtel_money';
  }

  return 'unknown';
}

// ============================================================================
// Helper: Format phone number for display
// ============================================================================

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  let normalized = cleaned;

  if (normalized.startsWith('0')) {
    normalized = '256' + normalized.substring(1);
  }
  if (!normalized.startsWith('256')) {
    normalized = '256' + normalized;
  }

  if (normalized.length === 12) {
    return `+${normalized.substring(0, 3)} ${normalized.substring(3, 6)} ${normalized.substring(6)}`;
  }

  return phone;
}

// ============================================================================
// Helper: Format UGX amount
// ============================================================================

export function formatUGX(amount: number): string {
  return `UGX ${amount.toLocaleString()}`;
}
