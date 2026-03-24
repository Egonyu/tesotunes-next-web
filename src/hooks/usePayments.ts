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
  purpose: 'wallet_topup' | 'credits_purchase' | 'subscription' | 'purchase' | 'tip';
  item_id?: string;
  item_type?: string;
}

export interface InitiatePaymentResponse {
  reference: string;
  status: 'pending' | 'processing' | 'completed';
  provider: 'zengapay';
  phone: string;
  amount: number;
  message: string;
}

export interface PaymentStatus {
  reference: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired' | 'cancelled' | 'refunded' | 'not_found';
  amount?: number;
  provider?: string;
  completed_at?: string;
  message?: string;
}

export interface WalletInfo {
  balance: number;
  credits_balance?: number;
  currency: string;
  formatted_balance: string;
}

export interface CreditBalanceSummary {
  credits: number;
  wallet_balance: number;
  currency: string;
  exchange_rate?: {
    credits_per_ugx: number;
    ugx_per_credit: number;
  };
}

export interface CreditsPurchasePayload {
  credits_amount?: number;
  ugx_amount?: number;
}

export interface CreditsPurchaseResult {
  credits_purchased: number;
  ugx_spent: number;
  wallet_balance: number;
  credits_balance: number;
}

export interface CreditsExchangePayload {
  direction: 'wallet_to_credits' | 'credits_to_wallet';
  credits_amount?: number;
  ugx_amount?: number;
}

export interface CreditsExchangeResult {
  credits_purchased?: number;
  ugx_spent?: number;
  credits_spent?: number;
  ugx_received?: number;
  wallet_balance: number;
  credits_balance: number;
}

export interface WalletTransactionItem {
  id: number;
  type: 'credit' | 'debit';
  category?: string;
  amount: number;
  balance_after: number;
  description: string;
  reference: string;
  created_at: string;
  status?: 'completed' | 'pending' | 'failed';
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
      apiPost<{ data: PhoneValidation }>("/payments/mobile-money/validate-phone", { phone })
        .then(res => res.data),
  });
}

// ============================================================================
// Payment Methods Hook
// ============================================================================

export function usePaymentMethods() {
  return useQuery({
    queryKey: ["payment", "methods"],
    queryFn: () => apiGet<{ data: PaymentMethodsResponse }>("/payments/methods")
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
      apiPost<{ data: InitiatePaymentResponse }>("/payments/mobile-money/initiate", data)
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
    queryFn: () => apiGet<{ data: PaymentStatus }>(`/payments/mobile-money/status/${reference}`)
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
    queryFn: () => apiGet<{ data: { ugx_balance?: number; credits_balance?: number; currency?: string; balance?: number; formatted_balance?: string } }>("/payments/wallet")
      .then(res => {
        const balance = Number(res.data.ugx_balance ?? res.data.balance ?? 0);
        const currency = res.data.currency ?? "UGX";

        return {
          balance,
          credits_balance: Number(res.data.credits_balance ?? 0),
          currency,
          formatted_balance: res.data.formatted_balance ?? `${currency} ${balance.toLocaleString()}`,
        };
      }),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useWalletTransactions(page: number = 1, perPage: number = 20) {
  return useQuery({
    queryKey: ["wallet", "transactions", page, perPage],
    queryFn: () => apiGet<{
      data: Array<{
        id: number;
        payment_type?: string;
        amount?: number | string;
        status?: string;
        description?: string;
        transaction_reference?: string;
        payment_reference?: string;
        created_at?: string;
      }>;
      meta?: {
        current_page?: number;
        last_page?: number;
        per_page?: number;
        total?: number;
      };
      pagination?: WalletTransactionsResponse["pagination"];
    }>("/payments/wallet/transactions", {
      params: { page, per_page: perPage },
    }).then((res) => {
      const items = Array.isArray(res.data) ? res.data : [];

      return {
        data: items.map((item) => {
          const isDebit = item.payment_type === "withdrawal";
          const amount = Number(item.amount ?? 0);

          return {
            id: item.id,
            type: isDebit ? "debit" : "credit",
            category: item.payment_type,
            amount,
            balance_after: 0,
            description:
              item.description ??
              (item.payment_type === "wallet_topup"
                ? "Wallet top-up"
                : item.payment_type === "credits_purchase"
                  ? "Credits purchase"
                  : item.payment_type === "withdrawal"
                    ? "Wallet withdrawal"
                    : item.payment_type === "credits_sale"
                      ? "Credits converted to wallet"
                    : "Wallet transaction"),
            reference: item.transaction_reference ?? item.payment_reference ?? "",
            created_at: item.created_at ?? "",
            status: (item.status as 'completed' | 'pending' | 'failed' | undefined) ?? 'pending',
          };
        }),
        pagination: res.pagination ?? {
          current_page: res.meta?.current_page ?? page,
          last_page: res.meta?.last_page ?? page,
          per_page: res.meta?.per_page ?? perPage,
          total: res.meta?.total ?? items.length,
        },
      };
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
    mutationFn: async (data: { phone?: string; amount: number }) => {
      const response = await apiPost<{ data: InitiatePaymentResponse & { transaction_ref?: string } }>("/payments/mobile-money/initiate", {
        phone: normalizePhoneNumber(data.phone ?? ""),
        amount: data.amount,
        purpose: 'wallet_topup',
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
  provider: 'mtn_momo' | 'airtel_money' | 'zengapay';
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
      const response = await apiPost<{ data: WithdrawResponse }>("/payments/wallet/withdraw", {
        ...data,
        phone: normalizePhoneNumber(data.phone),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "transactions"] });
    },
  });
}

export function useCreditBalance() {
  return useQuery({
    queryKey: ["credits", "balance"],
    queryFn: () =>
      apiGet<{ success: boolean; data: CreditBalanceSummary }>("/credits/balance").then(
        (res) => res.data
      ),
    staleTime: 30 * 1000,
  });
}

export function usePurchaseCredits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreditsPurchasePayload) =>
      apiPost<{ success: boolean; message: string; data: CreditsPurchaseResult }>("/credits/purchase", data).then(
        (res) => res.data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["credits"] });
    },
  });
}

export function useExchangeCredits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreditsExchangePayload) =>
      apiPost<{ success: boolean; message: string; data: CreditsExchangeResult }>("/credits/exchange", data).then(
        (res) => res.data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["credits"] });
    },
  });
}

// ============================================================================
// Helper: Detect provider from phone number (client-side)
// ============================================================================

export function detectProvider(phone: string): 'mtn_momo' | 'airtel_money' | 'unknown' {
  const normalized = normalizePhoneNumber(phone);

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
// Helper: Normalize phone number for API payloads
// ============================================================================

export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  let normalized = cleaned;

  if (normalized.startsWith('0')) {
    normalized = '256' + normalized.substring(1);
  }
  if (normalized && !normalized.startsWith('256')) {
    normalized = '256' + normalized;
  }

  return normalized;
}

// ============================================================================
// Helper: Format phone number for display
// ============================================================================

export function formatPhoneNumber(phone: string): string {
  const normalized = normalizePhoneNumber(phone);

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
