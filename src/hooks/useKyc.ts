import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { toast } from 'sonner';

// ============================================================================
// Types — must match backend KycStatusResource
// ============================================================================

export type KycStatusValue =
  | 'none'
  | 'partial'
  | 'pending_review'
  | 'verified'
  | 'rejected'
  | 'expired';

export type KycDocumentTypeValue =
  | 'national_id_front'
  | 'national_id_back'
  | 'selfie_with_id';

export type KycDocumentStatusValue = 'pending' | 'verified' | 'rejected';

export interface KycDocument {
  id: number;
  document_type: KycDocumentTypeValue;
  status: KycDocumentStatusValue;
  rejection_reason: string | null;
  submitted_at: string | null;
  verified_at: string | null;
}

export interface KycStatus {
  status: KycStatusValue;
  status_label: string;
  submitted_at: string | null;
  verified_at: string | null;
  expires_at: string | null;
  rejection_reason: string | null;
  can_submit_documents: boolean;
  eligible_for_sensitive_actions: boolean;
  documents: KycDocument[];
  requirements: {
    required_document_types: Array<{ type: KycDocumentTypeValue; label: string }>;
  };
}

export interface KycRequirements {
  action: string;
  eligible: boolean;
  missing_steps: string[];
  current_status: KycStatusValue;
}

export interface PendingKycUser extends KycStatus {
  user_id: number;
  email: string;
  full_name: string | null;
}

// ============================================================================
// User-facing hooks
// ============================================================================

export function useKycStatus(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['kyc', 'status'],
    queryFn: () => apiGet<{ data: KycStatus }>('/kyc/status').then((r) => r.data),
    staleTime: 30_000,
    enabled: options?.enabled !== false,
  });
}

export function useKycRequirements(action: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['kyc', 'requirements', action],
    queryFn: () =>
      apiGet<{ data: KycRequirements }>(`/kyc/requirements/${encodeURIComponent(action)}`).then((r) => r.data),
    staleTime: 10_000,
    enabled: options?.enabled !== false,
  });
}

export function useUploadKycDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      document_type: KycDocumentTypeValue;
      file: File;
      document_number?: string;
    }) => {
      const formData = new FormData();
      formData.append('document_type', input.document_type);
      formData.append('file', input.file);
      if (input.document_number) {
        formData.append('document_number', input.document_number);
      }
      return apiPost<{ data: { document_id: number; document_type: string; status: string; kyc_status: KycStatusValue } }>(
        '/kyc/documents',
        formData,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc'] });
      toast.success('Document uploaded. Awaiting review.');
    },
    onError: (e: Error) => {
      toast.error(e.message || 'Upload failed.');
    },
  });
}

// ============================================================================
// Admin hooks
// ============================================================================

export function usePendingKyc(perPage = 20) {
  return useQuery({
    queryKey: ['kyc', 'admin', 'pending', perPage],
    queryFn: () =>
      apiGet<{
        data: PendingKycUser[];
        meta: { current_page: number; last_page: number; per_page: number; total: number };
      }>(`/admin/kyc/pending?per_page=${perPage}`),
    staleTime: 15_000,
  });
}

export function useReviewKyc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      userId: number;
      decision: 'approve' | 'reject';
      reason?: string;
      notes?: string;
    }) =>
      apiPost(`/admin/kyc/users/${input.userId}/review`, {
        decision: input.decision,
        reason: input.reason,
        notes: input.notes,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kyc'] });
      toast.success(variables.decision === 'approve' ? 'KYC approved.' : 'KYC rejected.');
    },
    onError: (e: Error) => {
      toast.error(e.message || 'Review failed.');
    },
  });
}
