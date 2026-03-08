import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { toast } from 'sonner';

export interface FeaturedItem {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  link: string;
  type: 'song' | 'album' | 'artist' | 'playlist' | 'event' | 'custom';
  song_id?: number;
  album_id?: number;
  artist_id?: number;
  is_active: boolean;
  sort_order: number;
  starts_at?: string;
  ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFeaturedItemData {
  title: string;
  subtitle: string;
  image?: File;
  image_url?: string;
  link: string;
  type: FeaturedItem['type'];
  song_id?: number;
  album_id?: number;
  artist_id?: number;
  is_active?: boolean;
  sort_order?: number;
  starts_at?: string;
  ends_at?: string;
}

export interface UpdateFeaturedItemData {
  title?: string;
  subtitle?: string;
  image?: File;
  image_url?: string;
  link?: string;
  type?: FeaturedItem['type'];
  is_active?: boolean;
  sort_order?: number;
  starts_at?: string;
  ends_at?: string;
}

export function useFeaturedContent(params?: { status?: string }) {
  return useQuery({
    queryKey: ['admin', 'featured', params],
    queryFn: async () => {
      const res = await apiGet<{ data: FeaturedItem[] }>('/admin/featured', { params });
      return res.data || [];
    },
  });
}

export function useCreateFeaturedItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateFeaturedItemData) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });
      return apiPost<{ data: FeaturedItem }>('/admin/featured', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'featured'] });
      queryClient.invalidateQueries({ queryKey: ['featured'] });
      toast.success('Featured item created');
    },
    onError: () => toast.error('Failed to create featured item'),
  });
}

export function useUpdateFeaturedItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateFeaturedItemData }) => {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });
      return apiPost<{ data: FeaturedItem }>(`/admin/featured/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'featured'] });
      queryClient.invalidateQueries({ queryKey: ['featured'] });
      toast.success('Featured item updated');
    },
    onError: () => toast.error('Failed to update featured item'),
  });
}

export function useDeleteFeaturedItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiDelete(`/admin/featured/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'featured'] });
      queryClient.invalidateQueries({ queryKey: ['featured'] });
      toast.success('Featured item deleted');
    },
    onError: () => toast.error('Failed to delete featured item'),
  });
}

export function useReorderFeaturedItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: number; sort_order: number }[]) =>
      apiPost('/admin/featured/reorder', { items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'featured'] });
      queryClient.invalidateQueries({ queryKey: ['featured'] });
    },
    onError: () => toast.error('Failed to reorder items'),
  });
}

export function useToggleFeaturedItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiPost(`/admin/featured/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'featured'] });
      queryClient.invalidateQueries({ queryKey: ['featured'] });
    },
    onError: () => toast.error('Failed to toggle item'),
  });
}
