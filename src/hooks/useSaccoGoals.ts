import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
import type {
  SavingsGoal,
  CreateGoalData,
  UpdateGoalData,
  FundingOptions,
  SaccoTransaction,
  SaccoApiResponse,
  SaccoPaginatedResponse,
} from '@/types/sacco'

// ============================================================================
// Savings Goals Hooks
// ============================================================================

export function useSaccoGoals(params?: { status?: string; type?: string }) {
  return useQuery({
    queryKey: ['sacco', 'goals', params],
    queryFn: () =>
      apiGet<SaccoApiResponse<SavingsGoal[]>>('/sacco/goals', { params }).then(
        (res) => res.data
      ),
    staleTime: 30 * 1000,
  })
}

export function useSaccoGoal(id: number | string) {
  return useQuery({
    queryKey: ['sacco', 'goals', id],
    queryFn: () =>
      apiGet<SaccoApiResponse<SavingsGoal>>(`/sacco/goals/${id}`).then(
        (res) => res.data
      ),
    enabled: !!id,
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateGoalData) =>
      apiPost<SaccoApiResponse<SavingsGoal>>('/sacco/goals', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacco', 'goals'] })
      queryClient.invalidateQueries({ queryKey: ['sacco', 'dashboard'] })
    },
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGoalData }) =>
      apiPut<SaccoApiResponse<SavingsGoal>>(`/sacco/goals/${id}`, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sacco', 'goals'] })
      queryClient.invalidateQueries({
        queryKey: ['sacco', 'goals', variables.id],
      })
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      apiDelete<{ message: string }>(`/sacco/goals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacco', 'goals'] })
      queryClient.invalidateQueries({ queryKey: ['sacco', 'dashboard'] })
    },
  })
}

export function useGoalDeposit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      goalId,
      data,
    }: {
      goalId: number
      data: {
        amount: number
        phone_number: string
        payment_method: 'mtn_momo' | 'airtel_money'
      }
    }) =>
      apiPost<SaccoApiResponse<{ reference: string; status: string }>>(
        `/sacco/goals/${goalId}/deposit`,
        data
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sacco'] })
      queryClient.invalidateQueries({
        queryKey: ['sacco', 'goals', variables.goalId],
      })
    },
  })
}

export function useGoalConvertCredits() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      goalId,
      data,
    }: {
      goalId: number
      data: { amount: number }
    }) =>
      apiPost<SaccoApiResponse<{ converted: number; ugx_value: number }>>(
        `/sacco/goals/${goalId}/convert-credits`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacco'] })
    },
  })
}

export function useUpdateAutoSave() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      goalId,
      data,
    }: {
      goalId: number
      data: {
        auto_deposit: boolean
        auto_deposit_percentage?: number
        credit_conversion_enabled?: boolean
      }
    }) =>
      apiPost<SaccoApiResponse<SavingsGoal>>(
        `/sacco/goals/${goalId}/auto-save`,
        data
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['sacco', 'goals', variables.goalId],
      })
    },
  })
}

export function useGoalTransactions(goalId: number, params?: { page?: number }) {
  return useQuery({
    queryKey: ['sacco', 'goals', goalId, 'transactions', params],
    queryFn: () =>
      apiGet<SaccoPaginatedResponse<SaccoTransaction>>(
        `/sacco/goals/${goalId}/transactions`,
        { params }
      ),
    enabled: !!goalId,
  })
}

export function useGoalFundingOptions(goalId: number) {
  return useQuery({
    queryKey: ['sacco', 'goals', goalId, 'funding'],
    queryFn: () =>
      apiGet<SaccoApiResponse<FundingOptions>>(
        `/sacco/goals/${goalId}/funding-options`
      ).then((res) => res.data),
    enabled: !!goalId,
  })
}
