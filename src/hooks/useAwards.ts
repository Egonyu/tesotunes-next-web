import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { toast } from 'sonner';

// ============================================================================
// Types — aligned to Laravel `awards` table schema
// ============================================================================

export type AwardStatus =
  | 'upcoming'
  | 'nominations_open'
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

export type NomineeType = 'artist' | 'song' | 'album';

/** Main award (season/show) — maps to `awards` table */
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
  created_at: string;
  updated_at: string;
}

/** Award category — maps to `award_categories` table */
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
  created_at: string;
  updated_at: string;
  // Loaded relations
  nominations?: AwardNomination[];
}

/** Award nomination — maps to `award_nominations` table */
export interface AwardNomination {
  id: number;
  uuid: string;
  award_id: number;
  category_id: number;
  nominee_type: NomineeType;
  nominee_id: number;
  nominee_name: string;
  nominee_artwork: string | null;
  nominated_by_id: number | null;
  nomination_reason: string | null;
  status: NominationStatus;
  is_official: boolean;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  // Loaded relations
  category?: AwardCategory;
  award?: Award;
  nominated_by?: { id: number; name: string };
  // Computed / frontend-injected fields
  is_winner?: boolean;
  has_voted?: boolean;
  vote_count?: number;
  vote_percentage?: number;
  nominee_image_url?: string | null;
  artist_name?: string | null;
}

/** Award vote — maps to `award_votes` table */
export interface AwardVote {
  id: number;
  uuid: string;
  award_id: number;
  category_id: number;
  nomination_id: number;
  user_id: number;
  weight: number;
  ip_address: string | null;
  created_at: string;
  // Joined fields
  voter_name?: string;
  nominee_name?: string;
  category_name?: string;
  season_name?: string;
  year?: number;
}

/** Dashboard stats */
export interface AwardStats {
  total_awards: number;
  active_awards: number;
  total_categories: number;
  total_nominations: number;
  pending_nominations: number;
  total_votes: number;
  unique_voters: number;
}

/** Pagination meta from Laravel */
interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ============================================================================
// Frontend types (kept for backward compat with (app)/awards pages)
// ============================================================================

export interface AwardSeason {
  id: number;
  name: string;
  slug: string;
  year: number;
  status: AwardStatus | 'closed';
  nominations_start: string;
  nominations_end: string;
  voting_start: string;
  voting_end: string;
  ceremony_date: string | null;
  cover_image_url: string | null;
  total_votes: number;
  categories_count: number;
}

export interface LeaderboardVoter {
  id: number;
  user: { id: number; name: string; avatar_url: string | null };
  total_votes: number;
  rank: number;
  badge?: 'gold' | 'silver' | 'bronze';
}

export interface FrontendAwardStats {
  total_votes: number;
  total_voters: number;
  total_categories: number;
  total_nominees: number;
  voting_ends_at: string | null;
}

// ============================================================================
// Shared form-data types for mutations
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
  category_type: CategoryType;
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
  nominee_type: NomineeType;
  nominee_id?: number;
  nomination_reason?: string;
  is_official?: boolean;
}

// ============================================================================
// Frontend Hooks (used by (app)/awards pages)
// ============================================================================

export function useAwardSeasons(status?: string) {
  return useQuery({
    queryKey: ['awards', 'seasons', status],
    queryFn: () => {
      const params = status ? `?status=${status}` : '';
      return apiGet<{ data: AwardSeason[] }>(`/awards/seasons${params}`).then(res => res.data);
    },
    staleTime: 60 * 1000,
  });
}

export function useAwardSeason(slug: string) {
  return useQuery({
    queryKey: ['awards', 'season', slug],
    queryFn: () =>
      apiGet<{ data: AwardSeason & { categories: AwardCategory[] } }>(`/awards/seasons/${slug}`).then(res => res.data),
    enabled: !!slug,
  });
}

export function useAwardLeaderboard(seasonSlug?: string, limit = 20) {
  return useQuery({
    queryKey: ['awards', 'leaderboard', seasonSlug, limit],
    queryFn: () => {
      const params = new URLSearchParams();
      if (seasonSlug) params.append('season', seasonSlug);
      params.append('limit', String(limit));
      return apiGet<{ data: LeaderboardVoter[] }>(`/awards/leaderboard?${params.toString()}`).then(res => res.data);
    },
    staleTime: 30 * 1000,
  });
}

export function useAwardStats(seasonSlug?: string) {
  return useQuery({
    queryKey: ['awards', 'stats', seasonSlug],
    queryFn: () =>
      apiGet<{ data: FrontendAwardStats }>(`/awards/stats${seasonSlug ? `?season=${seasonSlug}` : ''}`).then(
        res => res.data,
      ),
    staleTime: 30 * 1000,
  });
}

export function useVoteForNomination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ seasonSlug, nominationId }: { seasonSlug: string; nominationId: number }) =>
      apiPost(`/awards/seasons/${seasonSlug}/vote`, { nomination_id: nominationId }),
    onSuccess: (_, variables) => {
      toast.success('Vote cast successfully!');
      queryClient.invalidateQueries({ queryKey: ['awards', 'season', variables.seasonSlug] });
      queryClient.invalidateQueries({ queryKey: ['awards', 'leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['awards', 'stats'] });
    },
    onError: () => toast.error('Failed to cast vote. You may have already voted in this category.'),
  });
}

// ============================================================================
// Admin — Award (Season) CRUD
// ============================================================================

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

export function useAdminAwardStats() {
  return useQuery({
    queryKey: ['admin', 'awards', 'stats'],
    queryFn: () => apiGet<{ success: boolean; data: AwardStats }>('/admin/awards/stats').then(res => res.data),
    staleTime: 60 * 1000,
  });
}

export function useCreateAward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAwardData) => apiPost<{ success: boolean; data: Award }>('/admin/awards/seasons', data),
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
    onError: () => toast.error('Failed to delete award. It may have nominations.'),
  });
}

// ============================================================================
// Admin — Award Categories CRUD
// ============================================================================

export function useAdminAwardCategories(params?: {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  per_page?: number;
}) {
  return useQuery({
    queryKey: ['admin', 'awards', 'categories', params],
    queryFn: () =>
      apiGet<{ success: boolean; data: AwardCategory[]; meta: PaginationMeta }>('/admin/awards/categories', {
        params,
      }),
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

// ============================================================================
// Admin — Nominations
// ============================================================================

export function useAdminNominations(params?: {
  search?: string;
  status?: string;
  award_id?: number;
  category_id?: number;
  page?: number;
  per_page?: number;
}) {
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

// ============================================================================
// Admin — Votes
// ============================================================================

export function useAdminVotes(params?: { award_id?: number; page?: number; per_page?: number }) {
  return useQuery({
    queryKey: ['admin', 'awards', 'votes', params],
    queryFn: () =>
      apiGet<{ success: boolean; data: AwardVote[]; seasons: Pick<Award, 'id' | 'title' | 'year'>[]; meta: PaginationMeta }>(
        '/admin/awards/votes',
        { params },
      ),
    staleTime: 30 * 1000,
  });
}

export function useDeleteVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiDelete(`/admin/awards/votes/${id}`),
    onSuccess: () => {
      toast.success('Vote deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'awards', 'votes'] });
    },
    onError: () => toast.error('Failed to delete vote'),
  });
}
