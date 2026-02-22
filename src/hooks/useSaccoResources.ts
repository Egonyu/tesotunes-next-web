import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/lib/api'
import type {
  PlatformResource,
  ResourceBookingData,
  ResourceLoan,
  SaccoApiResponse,
} from '@/types/sacco'

// ============================================================================
// Platform Resources Hooks
// ============================================================================

export function useSaccoResources(params?: {
  type?: string
  status?: string
  search?: string
}) {
  return useQuery({
    queryKey: ['sacco', 'resources', params],
    queryFn: () =>
      apiGet<SaccoApiResponse<PlatformResource[]>>('/sacco/resources', {
        params,
      }).then((res) => res.data),
    staleTime: 60 * 1000,
  })
}

export function useSaccoStudios() {
  return useQuery({
    queryKey: ['sacco', 'resources', 'studios'],
    queryFn: () =>
      apiGet<SaccoApiResponse<PlatformResource[]>>(
        '/sacco/resources/studios'
      ).then((res) => res.data),
    staleTime: 60 * 1000,
  })
}

export function useSaccoEquipment() {
  return useQuery({
    queryKey: ['sacco', 'resources', 'equipment'],
    queryFn: () =>
      apiGet<SaccoApiResponse<PlatformResource[]>>(
        '/sacco/resources/equipment'
      ).then((res) => res.data),
    staleTime: 60 * 1000,
  })
}

export function useSaccoVenues() {
  return useQuery({
    queryKey: ['sacco', 'resources', 'venues'],
    queryFn: () =>
      apiGet<SaccoApiResponse<PlatformResource[]>>(
        '/sacco/resources/venues'
      ).then((res) => res.data),
    staleTime: 60 * 1000,
  })
}

export function useSaccoResource(id: number | string) {
  return useQuery({
    queryKey: ['sacco', 'resources', id],
    queryFn: () =>
      apiGet<SaccoApiResponse<PlatformResource>>(
        `/sacco/resources/${id}`
      ).then((res) => res.data),
    enabled: !!id,
  })
}

export function useResourceAvailability(resourceId: number | string) {
  return useQuery({
    queryKey: ['sacco', 'resources', resourceId, 'availability'],
    queryFn: () =>
      apiGet<
        SaccoApiResponse<{
          available_dates: string[]
          booked_dates: string[]
          next_available: string | null
        }>
      >(`/sacco/resources/${resourceId}/availability`).then(
        (res) => res.data
      ),
    enabled: !!resourceId,
  })
}

export function useRequestBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      resourceId,
      data,
    }: {
      resourceId: number
      data: ResourceBookingData
    }) =>
      apiPost<SaccoApiResponse<{ booking_id: number; status: string }>>(
        `/sacco/resources/${resourceId}/request-booking`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacco', 'resources'] })
      queryClient.invalidateQueries({
        queryKey: ['sacco', 'resource-loans'],
      })
    },
  })
}

// ============================================================================
// Resource Loans Hooks
// ============================================================================

export function useResourceLoanApply() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      resource_id: number
      goal_id?: number
      tenure_months: number
      repayment_type: string
      purpose: string
    }) =>
      apiPost<SaccoApiResponse<ResourceLoan>>(
        '/sacco/resource-loans/apply',
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacco'] })
    },
  })
}

export function useMyResourceBookings() {
  return useQuery({
    queryKey: ['sacco', 'resource-loans', 'bookings'],
    queryFn: () =>
      apiGet<SaccoApiResponse<ResourceLoan[]>>(
        '/sacco/resource-loans/my-bookings'
      ).then((res) => res.data),
    staleTime: 30 * 1000,
  })
}

export function useResourceLoan(id: number | string) {
  return useQuery({
    queryKey: ['sacco', 'resource-loans', id],
    queryFn: () =>
      apiGet<SaccoApiResponse<ResourceLoan>>(
        `/sacco/resource-loans/${id}`
      ).then((res) => res.data),
    enabled: !!id,
  })
}

export function useCancelResourceLoan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      apiPost<{ message: string }>(`/sacco/resource-loans/${id}/cancel`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sacco', 'resource-loans'],
      })
    },
  })
}
