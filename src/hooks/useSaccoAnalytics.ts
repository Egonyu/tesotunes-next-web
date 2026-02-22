import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/lib/api'
import type {
  ProductionAnalytics,
  ProductionForecast,
  Production,
  Achievement,
  SavingsStreak,
  Leaderboard,
  Challenge,
  SavingsRecommendation,
  SuccessStory,
  GroupGoal,
  CreditSavingsSystem,
  SaccoApiResponse,
} from '@/types/sacco'

// ============================================================================
// Production Analytics Hooks
// ============================================================================

export function useProductionAnalytics() {
  return useQuery({
    queryKey: ['sacco', 'analytics', 'productions'],
    queryFn: () =>
      apiGet<SaccoApiResponse<ProductionAnalytics>>(
        '/sacco/analytics/productions'
      ).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  })
}

export function useProductionDetail(id: number | string) {
  return useQuery({
    queryKey: ['sacco', 'analytics', 'productions', id],
    queryFn: () =>
      apiGet<SaccoApiResponse<Production>>(
        `/sacco/analytics/productions/${id}`
      ).then((res) => res.data),
    enabled: !!id,
  })
}

export function useProductionForecast() {
  return useQuery({
    queryKey: ['sacco', 'analytics', 'forecast'],
    queryFn: () =>
      apiGet<SaccoApiResponse<ProductionForecast>>(
        '/sacco/analytics/forecast'
      ).then((res) => res.data),
    staleTime: 10 * 60 * 1000,
  })
}

export function useProductionBenchmarks() {
  return useQuery({
    queryKey: ['sacco', 'analytics', 'benchmarks'],
    queryFn: () =>
      apiGet<
        SaccoApiResponse<{
          industry_average: Record<string, number>
          your_average: Record<string, number>
        }>
      >('/sacco/analytics/benchmarks').then((res) => res.data),
    staleTime: 10 * 60 * 1000,
  })
}

// ============================================================================
// Gamification Hooks
// ============================================================================

export function useSaccoAchievements() {
  return useQuery({
    queryKey: ['sacco', 'gamification', 'achievements'],
    queryFn: () =>
      apiGet<SaccoApiResponse<Achievement[]>>(
        '/sacco/gamification/achievements'
      ).then((res) => res.data),
    staleTime: 60 * 1000,
  })
}

export function useSaccoBadges() {
  return useQuery({
    queryKey: ['sacco', 'gamification', 'badges'],
    queryFn: () =>
      apiGet<
        SaccoApiResponse<
          Array<{
            id: string
            name: string
            icon: string
            description: string
            unlocked: boolean
            unlocked_at?: string
          }>
        >
      >('/sacco/gamification/badges').then((res) => res.data),
    staleTime: 60 * 1000,
  })
}

export function useSaccoLeaderboards(params?: {
  period?: string
  category?: string
}) {
  return useQuery({
    queryKey: ['sacco', 'gamification', 'leaderboards', params],
    queryFn: () =>
      apiGet<SaccoApiResponse<Leaderboard[]>>(
        '/sacco/gamification/leaderboards',
        { params }
      ).then((res) => res.data),
    staleTime: 30 * 1000,
  })
}

export function useSaccoChallenges() {
  return useQuery({
    queryKey: ['sacco', 'gamification', 'challenges'],
    queryFn: () =>
      apiGet<SaccoApiResponse<Challenge[]>>(
        '/sacco/gamification/challenges'
      ).then((res) => res.data),
    staleTime: 60 * 1000,
  })
}

export function useJoinChallenge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (challengeId: number) =>
      apiPost<{ message: string }>(
        `/sacco/gamification/challenges/${challengeId}/join`,
        {}
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sacco', 'gamification', 'challenges'],
      })
    },
  })
}

export function useSaccoStreak() {
  return useQuery({
    queryKey: ['sacco', 'gamification', 'streak'],
    queryFn: () =>
      apiGet<SaccoApiResponse<SavingsStreak>>(
        '/sacco/gamification/streak'
      ).then((res) => res.data),
    staleTime: 60 * 1000,
  })
}

// ============================================================================
// Recommendations Hook
// ============================================================================

export function useSaccoRecommendations() {
  return useQuery({
    queryKey: ['sacco', 'recommendations'],
    queryFn: () =>
      apiGet<SaccoApiResponse<SavingsRecommendation[]>>(
        '/sacco/recommendations'
      ).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  })
}

export function useExecuteRecommendation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recId: string) =>
      apiPost<{ message: string; result: unknown }>(
        `/sacco/recommendations/${recId}/action`,
        {}
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacco'] })
    },
  })
}

// ============================================================================
// Community Hooks
// ============================================================================

export function useSuccessStories(params?: { page?: number }) {
  return useQuery({
    queryKey: ['sacco', 'community', 'stories', params],
    queryFn: () =>
      apiGet<{
        data: SuccessStory[]
        pagination: {
          current_page: number
          last_page: number
          total: number
        }
      }>('/sacco/community/stories', { params }),
    staleTime: 60 * 1000,
  })
}

export function useSubmitStory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      production_id: number
      challenge_faced: string
      how_sacco_helped: string
      results: string
      advice: string
    }) =>
      apiPost<SaccoApiResponse<SuccessStory>>(
        '/sacco/community/stories',
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sacco', 'community', 'stories'],
      })
    },
  })
}

export function useGroupGoals() {
  return useQuery({
    queryKey: ['sacco', 'community', 'group-goals'],
    queryFn: () =>
      apiGet<SaccoApiResponse<GroupGoal[]>>(
        '/sacco/community/group-goals'
      ).then((res) => res.data),
    staleTime: 60 * 1000,
  })
}

export function useCreateGroupGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      title: string
      description: string
      type: string
      target_amount: number
      deadline: string
      event_date?: string
    }) =>
      apiPost<SaccoApiResponse<GroupGoal>>(
        '/sacco/community/group-goals',
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sacco', 'community', 'group-goals'],
      })
    },
  })
}

export function useJoinGroupGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      goalId,
      amount,
    }: {
      goalId: number
      amount: number
    }) =>
      apiPost<{ message: string }>(
        `/sacco/community/group-goals/${goalId}/join`,
        { amount }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sacco', 'community', 'group-goals'],
      })
    },
  })
}

// ============================================================================
// Credit Savings Hooks
// ============================================================================

export function useCreditSavingsSystem() {
  return useQuery({
    queryKey: ['sacco', 'credit-savings'],
    queryFn: () =>
      apiGet<SaccoApiResponse<CreditSavingsSystem>>(
        '/sacco/credit-savings'
      ).then((res) => res.data),
    staleTime: 60 * 1000,
  })
}

export function useCreditConversion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { amount: number; goal_id?: number }) =>
      apiPost<
        SaccoApiResponse<{
          credits_converted: number
          ugx_received: number
          goal_credited?: number
        }>
      >('/sacco/credit-conversion', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacco'] })
    },
  })
}
