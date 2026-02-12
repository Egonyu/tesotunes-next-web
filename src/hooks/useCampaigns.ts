'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';

// Types
export interface Campaign {
  id: number;
  title: string;
  artist: {
    id?: number;
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  cover: string;
  goal: number;
  raised: number;
  backers: number;
  daysLeft: number;
  category: string;
  isFeatured?: boolean;
  description?: string;
  updates?: CampaignUpdate[];
  rewards?: CampaignReward[];
  story?: string;
}

export interface CampaignUpdate {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface CampaignReward {
  id: number;
  title: string;
  description: string;
  amount: number;
  backers: number;
  limit?: number;
}

export interface Donation {
  id: number;
  campaignId: number;
  campaignTitle: string;
  campaignCover: string;
  artistName: string;
  amount: number;
  donatedAt: string;
  rewardTitle?: string;
  status: 'confirmed' | 'pending' | 'failed';
}

// Transform API response to component format
export function transformCampaign(data: Record<string, unknown>): Campaign {
  const artist = data.artist as Record<string, unknown> || data.user as Record<string, unknown> || {};
  
  // Calculate days left from end_date
  let daysLeft = 0;
  if (data.end_date) {
    const end = new Date(data.end_date as string);
    const now = new Date();
    daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  } else if (data.days_left !== undefined) {
    daysLeft = data.days_left as number;
  }

  return {
    id: data.id as number,
    title: (data.title as string) || '',
    artist: {
      id: artist.id as number || undefined,
      name: (artist.name as string) || (artist.display_name as string) || 'Anonymous',
      avatar: (artist.avatar as string) || (artist.profile_image as string) || '/images/avatar-placeholder.png',
      isVerified: (artist.is_verified as boolean) || false,
    },
    cover: (data.cover as string) || (data.image as string) || (data.cover_image as string) || '/images/placeholder.jpg',
    goal: (data.goal as number) || (data.target_amount as number) || 0,
    raised: (data.raised as number) || (data.current_amount as number) || 0,
    backers: (data.backers as number) || (data.backers_count as number) || 0,
    daysLeft,
    category: (data.category as string) || 'General',
    isFeatured: (data.is_featured as boolean) || false,
    description: data.description as string || undefined,
    story: data.story as string || undefined,
    updates: (data.updates as CampaignUpdate[]) || [],
    rewards: (data.rewards as CampaignReward[]) || [],
  };
}

export function transformDonation(data: Record<string, unknown>): Donation {
  const campaign = data.campaign as Record<string, unknown> || {};
  
  return {
    id: data.id as number,
    campaignId: (campaign.id as number) || (data.campaign_id as number),
    campaignTitle: (campaign.title as string) || '',
    campaignCover: (campaign.cover as string) || '/images/placeholder.jpg',
    artistName: (campaign.artist as Record<string, unknown>)?.name as string || '',
    amount: (data.amount as number) || 0,
    donatedAt: (data.donated_at as string) || (data.created_at as string) || new Date().toISOString(),
    rewardTitle: data.reward_title as string || undefined,
    status: (data.status as 'confirmed' | 'pending' | 'failed') || 'confirmed',
  };
}

// Get all campaigns with optional filters
export function useCampaigns(category?: string) {
  return useQuery({
    queryKey: ['campaigns', category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      
      const response = await apiGet<{ data: unknown } | unknown[]>(`/api/ojokotau/campaigns?${params.toString()}`);
      return (response as { data?: unknown }).data || response;
    },
  });
}

// Get featured campaigns
export function useFeaturedCampaigns() {
  return useQuery({
    queryKey: ['campaigns', 'featured'],
    queryFn: async () => {
      const response = await apiGet<{ data: unknown } | unknown[]>('/ojokotau/campaigns/featured');
      return (response as { data?: unknown }).data || response;
    },
  });
}

// Get a single campaign
export function useCampaign(campaignId: string) {
  return useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const response = await apiGet<{ data: unknown } | unknown>(`/api/ojokotau/campaigns/${campaignId}`);
      return (response as { data?: unknown }).data || response;
    },
    enabled: !!campaignId,
  });
}

// Get user's donations
export function useMyDonations() {
  return useQuery({
    queryKey: ['my-donations'],
    queryFn: async () => {
      const response = await apiGet<{ data: unknown } | unknown[]>('/ojokotau/donations');
      return (response as { data?: unknown }).data || response;
    },
  });
}

// Make a donation
export function useDonate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      campaignId: string;
      amount: number;
      paymentMethod: string;
      rewardId?: number;
      isAnonymous?: boolean;
      message?: string;
    }) => {
      const response = await apiPost<{ data?: unknown }>(`/api/ojokotau/campaigns/${data.campaignId}/donate`, {
        amount: data.amount,
        payment_method: data.paymentMethod,
        reward_id: data.rewardId,
        is_anonymous: data.isAnonymous,
        message: data.message,
      });
      return response.data || response;
    },
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['my-donations'] });
    },
  });
}

// Create a campaign
export function useCreateCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      goal: number;
      category: string;
      cover?: File;
      story?: string;
      endDate: string;
      rewards?: Array<{ title: string; description: string; amount: number; limit?: number }>;
    }) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('goal', data.goal.toString());
      formData.append('category', data.category);
      formData.append('end_date', data.endDate);
      if (data.story) formData.append('story', data.story);
      if (data.cover) formData.append('cover', data.cover);
      if (data.rewards) formData.append('rewards', JSON.stringify(data.rewards));
      
      const response = await apiPost<{ data?: unknown }>('/ojokotau/campaigns', formData);
      return response.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

// Back/support a campaign (follow for updates)
export function useFollowCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await apiPost<{ data?: unknown }>(`/api/ojokotau/campaigns/${campaignId}/follow`, {});
      return response.data || response;
    },
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
    },
  });
}

// Share a campaign
export function useShareCampaign() {
  return useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await apiPost<{ data?: unknown }>(`/api/ojokotau/campaigns/${campaignId}/share`, {});
      return response.data || response;
    },
  });
}

// Campaign Backer types
export interface CampaignBacker {
  id: number;
  user: {
    id: number;
    name: string;
    avatar_url: string | null;
    username: string;
  } | null; // null if anonymous
  amount: number;
  reward_title?: string;
  message?: string;
  is_anonymous: boolean;
  donated_at: string;
}

// Get campaign backers
export function useCampaignBackers(campaignId: string) {
  return useQuery({
    queryKey: ['campaign-backers', campaignId],
    queryFn: async () => {
      const response = await apiGet<{ data: CampaignBacker[] } | CampaignBacker[]>(
        `/ojokotau/campaigns/${campaignId}/backers`
      );
      return (response as { data?: CampaignBacker[] }).data || response;
    },
    enabled: !!campaignId,
  });
}

// Campaign Analytics types
export interface CampaignAnalytics {
  total_raised: number;
  total_backers: number;
  average_donation: number;
  daily_donations: Array<{ date: string; amount: number; count: number }>;
  reward_breakdown: Array<{ reward_title: string; count: number; amount: number }>;
  referral_sources: Array<{ source: string; count: number; amount: number }>;
  conversion_rate: number;
  top_backers: Array<{ name: string; amount: number; is_anonymous: boolean }>;
  goal_progress_pct: number;
  days_remaining: number;
  projected_total: number;
}

// Get campaign analytics (artist view)
export function useCampaignAnalytics(campaignId: string) {
  return useQuery({
    queryKey: ['campaign-analytics', campaignId],
    queryFn: async () => {
      const response = await apiGet<{ data: CampaignAnalytics } | CampaignAnalytics>(
        `/ojokotau/campaigns/${campaignId}/analytics`
      );
      return ((response as { data?: CampaignAnalytics }).data || response) as CampaignAnalytics;
    },
    enabled: !!campaignId,
  });
}
