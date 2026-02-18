import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { toast } from 'sonner';

// ============================================================================
// Types — aligned to Laravel API Resource outputs
// ============================================================================

export type AwardStatus =
  | 'upcoming'
  | 'draft'
  | 'nominations_open'
  | 'nominations_closed'
  | 'voting_open'
  | 'voting_closed'
  | 'completed';

export type AwardVisibility = 'public' | 'private';

export type CategoryType =
  | 'music'
  | 'artist'
  | 'album'
  | 'song'
  | 'video'
  | 'podcast'
  | 'general';

export type NominationStatus = 'pending' | 'approved' | 'rejected' | 'winner';

export type NomineeType = 'artist' | 'song' | 'album' | 'video' | 'podcast' | 'user' | 'other';

/** Award — maps to AwardResource */
export interface Award {
  id: number;
  uuid: string;
  title: string;
  slug: string;
  description: string | null;
  year: number;
  season: string | null;
  artwork: string | null;
  banner: string | null;
  nomination_starts_at: string | null;
  nomination_ends_at: string | null;
  voting_starts_at: string | null;
  voting_ends_at: string | null;
  ceremony_date: string | null;
  status: AwardStatus;
  visibility: AwardVisibility;
  allow_public_nominations: boolean;
  allow_public_voting: boolean;
  votes_per_category: number;
  is_nomination_open: boolean;
  is_voting_open: boolean;
  categories_count?: number;
  nominations_count?: number;
  categories?: AwardCategory[];
  created_at: string;
  updated_at: string;
}

/** AwardCategory — maps to AwardCategoryResource */
export interface AwardCategory {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  description: string | null;
  artwork: string | null;
  category_type: CategoryType;
  is_active: boolean;
  sort_order: number;
  nominations_count?: number;
  nominations?: AwardNomination[];
  created_at: string;
  updated_at: string;
}

/** AwardNomination — maps to AwardNominationResource */
export interface AwardNomination {
  id: number;
  uuid: string;
  award_id?: number;
  category_id?: number;
  nominee_name: string;
  nominee_artwork: string | null;
  nomination_reason: string | null;
  status: NominationStatus;
  is_official: boolean;
  nominee_type: string | null;
  nominee_id: number | null;
  category?: AwardCategory;
  award?: Pick<Award, 'id' | 'title' | 'year' | 'status'>;
  nominated_by?: { id: number; username: string };
  votes_count?: number;
  approved_at: string | null;
  created_at: string;
}

/** Dashboard stats (admin) */
export interface AwardStats {
  total_awards: number;
  active_awards: number;
  total_categories: number;
  total_nominations: number;
  pending_nominations: number;
  total_votes: number;
}

/** Pagination meta */
interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/** Category result with total votes (for results page) */
export interface CategoryResult {
  category: AwardCategory;
  nominations: AwardNomination[];
  total_votes: number;
}

// ============================================================================
// Mutation DTOs
// ============================================================================

export interface CreateAwardData {
  name: string;
  year: number;
  description?: string;
  season?: string;
  nominations_start_at?: string;
  nominations_end_at?: string;
  voting_start_at?: string;
  voting_end_at?: string;
  ceremony_date?: string;
  status?: AwardStatus;
  visibility?: AwardVisibility;
  allow_public_nominations?: boolean;
  allow_public_voting?: boolean;
  votes_per_category?: number;
}

export interface UpdateAwardData extends CreateAwardData {
  id: number;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  category_type?: CategoryType;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateCategoryData extends CreateCategoryData {
  id: number;
}

export interface CreateNominationData {
  award_id: number;
  category_id: number;
  nominee_name: string;
  nominee_type?: string;
  nominee_id?: number;
  nominee_artwork?: string;
  nomination_reason?: string;
  status?: NominationStatus;
  is_official?: boolean;
}

export interface SubmitNominationData {
  category_id: number;
  nominee_name: string;
  nominee_type?: string;
  nominee_id?: number;
  nominee_artwork?: string;
  nomination_reason?: string;
}

// ============================================================================
// Public Hooks — match actual backend routes under /api/awards
// ============================================================================

/** GET /awards — list all public awards */
export function useAwards(params?: { per_page?: number; page?: number }) {
  return useQuery({
    queryKey: ['awards', 'list', params],
    queryFn: () =>
      apiGet<{ data: Award[]; meta: PaginationMeta }>('/awards', { params }),
    staleTime: 60 * 1000,
  });
}

/** GET /awards/current-season — active award season with categories */
export function useCurrentSeason() {
  return useQuery({
    queryKey: ['awards', 'current-season'],
    queryFn: () =>
      apiGet<{ data: Award }>('/awards/current-season').then(res => res.data),
    staleTime: 60 * 1000,
    retry: false,
  });
}

/** GET /awards/{idOrSlug} — single award detail with categories + nominations */
export function useAwardDetail(idOrSlug: string | number) {
  return useQuery({
    queryKey: ['awards', 'detail', idOrSlug],
    queryFn: () =>
      apiGet<{ data: Award }>(`/awards/${idOrSlug}`).then(res => res.data),
    enabled: !!idOrSlug,
    staleTime: 30 * 1000,
  });
}

/** GET /awards/{id}/categories — categories for an award */
export function useAwardCategories(awardId: string | number) {
  return useQuery({
    queryKey: ['awards', 'categories', awardId],
    queryFn: () =>
      apiGet<{ data: AwardCategory[] }>(`/awards/${awardId}/categories`).then(res => res.data),
    enabled: !!awardId,
    staleTime: 30 * 1000,
  });
}

/** GET /awards/{id}/results — voting results (only when voting_closed/completed) */
export function useAwardResults(awardId: string | number) {
  return useQuery({
    queryKey: ['awards', 'results', awardId],
    queryFn: () =>
      apiGet<{ data: { award: Award; results: CategoryResult[] } }>(`/awards/${awardId}/results`).then(res => res.data),
    enabled: !!awardId,
    staleTime: 60 * 1000,
    retry: false,
  });
}

/** POST /awards/{id}/nominations — submit a public nomination (auth) */
export function useSubmitNomination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ awardId, data }: { awardId: number | string; data: SubmitNominationData }) =>
      apiPost<{ data: AwardNomination; message: string }>(`/awards/${awardId}/nominations`, data),
    onSuccess: (res, vars) => {
      toast.success(res.message || 'Nomination submitted!');
      queryClient.invalidateQueries({ queryKey: ['awards', 'detail', vars.awardId] });
      queryClient.invalidateQueries({ queryKey: ['awards', 'categories', vars.awardId] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to submit nomination.');
    },
  });
}

/** POST /awards/{id}/vote — cast a vote (auth) */
export function useVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ awardId, categoryId, nominationId }: { awardId: number | string; categoryId: number; nominationId: number }) =>
      apiPost<{ data: { voted: boolean }; message: string }>(`/awards/${awardId}/vote`, {
        category_id: categoryId,
        nomination_id: nominationId,
      }),
    onSuccess: (res, vars) => {
      toast.success(res.message || 'Vote cast!');
      queryClient.invalidateQueries({ queryKey: ['awards', 'detail', vars.awardId] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to cast vote.');
    },
  });
}

// ============================================================================
// Admin Hooks — prefix /admin/awards
// ============================================================================

export function useAdminAwardStats() {
  return useQuery({
    queryKey: ['admin', 'awards', 'stats'],
    queryFn: () =>
      apiGet<{ success: boolean; data: AwardStats }>('/admin/awards/stats').then(res => res.data),
    staleTime: 60 * 1000,
  });
}

export function useAdminAwards(params?: { search?: string; status?: string; page?: number; per_page?: number }) {
  return useQuery({
    queryKey: ['admin', 'awards', params],
    queryFn: () =>
      apiGet<{
        success: boolean;
        data: Award[];
        stats: AwardStats;
        meta: PaginationMeta;
      }>('/admin/awards', { params }),
    staleTime: 30 * 1000,
  });
}

export function useAdminAwardSeasons(params?: { search?: string; status?: string; page?: number }) {
  return useQuery({
    queryKey: ['admin', 'awards', 'seasons', params],
    queryFn: () =>
      apiGet<{ success: boolean; data: Award[]; meta: PaginationMeta }>('/admin/awards/seasons', { params }),
    staleTime: 30 * 1000,
  });
}

export function useAdminAwardDetail(id: number | string) {
  return useQuery({
    queryKey: ['admin', 'awards', 'season', id],
    queryFn: () =>
      apiGet<{
        success: boolean;
        data: Award;
        categories: AwardCategory[];
        nominations: AwardNomination[];
        stats: Record<string, number>;
      }>(`/admin/awards/seasons/${id}`),
    enabled: !!id,
  });
}

export function useCreateAward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAwardData) =>
      apiPost<{ success: boolean; data: Award }>('/admin/awards/seasons', data),
    onSuccess: () => {
      toast.success('Award created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'awards'] });
    },
    onError: () => toast.error('Failed to create award'),
  });
}

export function useUpdateAward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateAwardData) =>
      apiPut<{ success: boolean; data: Award }>(`/admin/awards/seasons/${id}`, data),
    onSuccess: (_, vars) => {
      toast.success('Award updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'awards'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'awards', 'season', vars.id] });
    },
    onError: () => toast.error('Failed to update award'),
  });
}

export function useDeleteAward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiDelete(`/admin/awards/seasons/${id}`),
    onSuccess: () => {
      toast.success('Award deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'awards'] });
    },
    onError: () => toast.error('Failed to delete award. It may have votes.'),
  });
}

// ── Admin Categories ─────────────────────────────────────────────────────────

export function useAdminAwardCategories(params?: { search?: string; type?: string; status?: string; page?: number; per_page?: number }) {
  return useQuery({
    queryKey: ['admin', 'awards', 'categories', params],
    queryFn: () =>
      apiGet<{ success: boolean; data: AwardCategory[]; meta: PaginationMeta }>('/admin/awards/categories', { params }),
    staleTime: 30 * 1000,
  });
}

export function useAdminAwardCategoryDetail(id: number | string) {
  return useQuery({
    queryKey: ['admin', 'awards', 'category', id],
    queryFn: () =>
      apiGet<{
        success: boolean;
        data: AwardCategory;
        nominations: AwardNomination[];
        stats: Record<string, number>;
        meta: PaginationMeta;
      }>(`/admin/awards/categories/${id}`),
    enabled: !!id,
  });
}

export function useCreateAwardCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryData) =>
      apiPost<{ success: boolean; data: AwardCategory }>('/admin/awards/categories', data),
    onSuccess: () => {
      toast.success('Category created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'awards', 'categories'] });
    },
    onError: () => toast.error('Failed to create category'),
  });
}

export function useUpdateAwardCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateCategoryData) =>
      apiPut<{ success: boolean; data: AwardCategory }>(`/admin/awards/categories/${id}`, data),
    onSuccess: (_, vars) => {
      toast.success('Category updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'awards', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'awards', 'category', vars.id] });
    },
    onError: () => toast.error('Failed to update category'),
  });
}

export function useDeleteAwardCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiDelete(`/admin/awards/categories/${id}`),
    onSuccess: () => {
      toast.success('Category deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'awards', 'categories'] });
    },
    onError: () => toast.error('Failed to delete category. It may have nominations.'),
  });
}

// ── Admin Nominations ────────────────────────────────────────────────────────

export function useAdminNominations(params?: { search?: string; status?: string; award_id?: number; category_id?: number; page?: number; per_page?: number }) {
  return useQuery({
    queryKey: ['admin', 'awards', 'nominations', params],
    queryFn: () =>
      apiGet<{
        success: boolean;
        data: AwardNomination[];
        seasons: Pick<Award, 'id' | 'title' | 'year' | 'status'>[];
        categories: Pick<AwardCategory, 'id' | 'name' | 'category_type'>[];
        meta: PaginationMeta;
      }>('/admin/awards/nominations', { params }),
    staleTime: 30 * 1000,
  });
}

export function useCreateNomination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNominationData) =>
      apiPost<{ success: boolean; data: AwardNomination }>('/admin/awards/nominations', data),
    onSuccess: () => {
      toast.success('Nomination created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'awards', 'nominations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'awards', 'season'] });
    },
    onError: () => toast.error('Failed to create nomination'),
  });
}

export function useApproveNomination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiPost(`/admin/awards/nominations/${id}/approve`),
    onSuccess: () => {
      toast.success('Nomination approved');
      queryClient.invalidateQueries({ queryKey: ['admin', 'awards', 'nominations'] });
    },
    onError: () => toast.error('Failed to approve nomination'),
  });
}

export function useRejectNomination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiPost(`/admin/awards/nominations/${id}/reject`),
    onSuccess: () => {
      toast.success('Nomination rejected');
      queryClient.invalidateQueries({ queryKey: ['admin', 'awards', 'nominations'] });
    },
    onError: () => toast.error('Failed to reject nomination'),
  });
}

export function useSetWinner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiPost(`/admin/awards/nominations/${id}/set-winner`),
    onSuccess: () => {
      toast.success('Winner declared!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'awards'] });
    },
    onError: () => toast.error('Failed to set winner'),
  });
}

export function useDeleteNomination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiDelete(`/admin/awards/nominations/${id}`),
    onSuccess: () => {
      toast.success('Nomination deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'awards', 'nominations'] });
    },
    onError: () => toast.error('Failed to delete nomination'),
  });
}
