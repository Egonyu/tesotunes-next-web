import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

interface LegalPage {
  id: number;
  title: string;
  slug: string;
  type: string;
  content: string;
  version: number;
  effective_date: string | null;
  requires_acceptance: boolean;
  user_accepted?: boolean;
  accepted_at?: string;
}

interface AcceptanceStatus {
  accepted: boolean;
  version: number;
  title: string;
  accepted_at?: string;
}

interface AcceptanceCheckResponse {
  all_accepted: boolean;
  pages: Record<string, AcceptanceStatus>;
}

export function useLegalPages() {
  const queryClient = useQueryClient();

  // Fetch all published legal pages
  const { data: pages = [], isLoading: pagesLoading } = useQuery({
    queryKey: ['legal-pages'],
    queryFn: async () => {
      const response = await fetch('/api/legal-pages');
      if (!response.ok) throw new Error('Failed to fetch legal pages');
      const json = await response.json();
      return json.data || [];
    },
  });

  // Fetch specific legal page by slug
  const { data: selectedPage, isLoading: pageLoading } = useQuery({
    queryKey: ['legal-page-detail'],
    queryFn: async () => {
      // This will be used when user selects a specific page
      // Call refetch with a specific slug
      return null;
    },
    enabled: false,
  });

  // Check user acceptance status
  const { data: acceptanceStatus, isLoading: acceptanceLoading } = useQuery({
    queryKey: ['legal-acceptance-status'],
    queryFn: async () => {
      const response = await fetch('/api/legal-pages/check-acceptance');
      if (!response.ok) throw new Error('Failed to check acceptance');
      const json = await response.json();
      return json.data as AcceptanceCheckResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    pages,
    pagesLoading,
    selectedPage,
    pageLoading,
    acceptanceStatus,
    acceptanceLoading,
    allAccepted: acceptanceStatus?.all_accepted ?? false,
    missingAcceptances: getMissingAcceptances(acceptanceStatus),
  };
}

export function useLegalPage(slug: string) {
  const { data: page, isLoading, error } = useQuery({
    queryKey: ['legal-page', slug],
    queryFn: async () => {
      if (!slug) return null;
      const response = await fetch(`/api/legal-pages/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch legal page');
      const json = await response.json();
      return json.data as LegalPage;
    },
    enabled: !!slug,
  });

  return { page, isLoading, error };
}

export function useLegalAcceptance() {
  const queryClient = useQueryClient();

  const { data: status, isLoading: isChecking } = useQuery({
    queryKey: ['legal-acceptance-status'],
    queryFn: async () => {
      const response = await fetch('/api/legal-pages/check-acceptance');
      if (!response.ok) throw new Error('Failed to check acceptance');
      const json = await response.json();
      return json.data as AcceptanceCheckResponse;
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (pageId: number) => {
      const response = await fetch(`/api/legal-pages/${pageId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to accept legal page');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-acceptance-status'] });
    },
  });

  const acceptPolicy = useCallback(
    (pageId: number) => acceptMutation.mutate(pageId),
    [acceptMutation]
  );

  return {
    allAccepted: status?.all_accepted ?? false,
    pages: status?.pages ?? {},
    acceptPolicy,
    isAccepting: acceptMutation.isPending,
    acceptanceError: acceptMutation.error,
  };
}

export function useAdminLegalPages() {
  const queryClient = useQueryClient();

  // Fetch all legal pages (admin view)
  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['admin-legal-pages'],
    queryFn: async () => {
      const response = await fetch('/api/admin/legal-pages');
      if (!response.ok) throw new Error('Failed to fetch legal pages');
      const json = await response.json();
      return json.data || [];
    },
  });

  // Save/Create mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = data.id ? `/api/admin/legal-pages/${data.id}` : '/api/admin/legal-pages';
      const method = data.id ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save legal page');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-legal-pages'] });
    },
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/legal-pages/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to publish legal page');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-legal-pages'] });
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/legal-pages/${id}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to archive legal page');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-legal-pages'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/legal-pages/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete legal page');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-legal-pages'] });
    },
  });

  // Get versions
  const { data: versions = [] } = useQuery({
    queryKey: ['legal-page-versions'],
    queryFn: async () => {
      // This will be called when viewing a specific page's history
      return [];
    },
    enabled: false,
  });

  // Get acceptances
  const { data: acceptances = [], isLoading: acceptancesLoading } = useQuery({
    queryKey: ['legal-page-acceptances'],
    queryFn: async () => {
      // This will be called when viewing acceptance statistics
      return [];
    },
    enabled: false,
  });

  return {
    pages,
    isLoading,
    versions,
    acceptances,
    acceptancesLoading,
    save: (data: any) => saveMutation.mutate(data),
    publish: (id: number) => publishMutation.mutate(id),
    archive: (id: number) => archiveMutation.mutate(id),
    delete: (id: number) => deleteMutation.mutate(id),
    isSaving: saveMutation.isPending,
    isPublishing: publishMutation.isPending,
    isArchiving: archiveMutation.isPending,
    isDeleting: deleteMutation.isPending,
    errors: {
      save: saveMutation.error,
      publish: publishMutation.error,
      archive: archiveMutation.error,
      delete: deleteMutation.error,
    },
  };
}

// Helper function to get missing acceptances
function getMissingAcceptances(status?: AcceptanceCheckResponse): LegalPage[] {
  if (!status) return [];
  return Object.entries(status.pages)
    .filter(([_, acceptance]) => !acceptance.accepted)
    .map(([slug, acceptance]) => ({
      id: 0,
      title: acceptance.title,
      slug,
      type: '',
      content: '',
      version: acceptance.version,
      requires_acceptance: true,
      effective_date: null,
      user_accepted: false,
    }));
}

// Hook to check if specific policy is accepted
export function usePolicyAccepted(slug: string): boolean {
  const { pages } = useLegalAcceptance();
  return pages?.[slug]?.accepted ?? false;
}

// Hook to get all required policies that need acceptance
export function useRequiredPolicies() {
  const { pages } = useLegalAcceptance();
  return Object.entries(pages)
    .filter(([_, policy]) => !policy.accepted)
    .map(([slug, policy]) => ({
      slug,
      title: policy.title,
      version: policy.version,
    }));
}
