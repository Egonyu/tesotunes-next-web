'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Heart, TrendingUp, Calendar, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

interface ArtistCampaign {
  id: number;
  title: string;
  cover: string;
  goal: number;
  raised: number;
  backers: number;
  days_left: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  category: string;
  created_at: string;
}

export default function ArtistCampaignsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['artist', 'campaigns'],
    queryFn: () => apiGet<{ data: ArtistCampaign[] }>('/ojokotau/my-campaigns').then(res => {
      if (Array.isArray(res)) return res as ArtistCampaign[];
      return (res as { data?: ArtistCampaign[] }).data || [];
    }),
  });

  const filteredCampaigns = (campaigns || []).filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: campaigns?.length || 0,
    active: campaigns?.filter(c => c.status === 'active').length || 0,
    totalRaised: campaigns?.reduce((sum, c) => sum + c.raised, 0) || 0,
    totalBackers: campaigns?.reduce((sum, c) => sum + c.backers, 0) || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Campaigns</h1>
          <p className="text-muted-foreground">Manage your Ojokotau crowdfunding campaigns</p>
        </div>
        <Link
          href="/artist/campaigns/create"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Campaigns', value: stats.total, icon: Heart, color: 'text-pink-500' },
          { label: 'Active', value: stats.active, icon: TrendingUp, color: 'text-green-500' },
          { label: 'Total Raised', value: formatCurrency(stats.totalRaised), icon: Calendar, color: 'text-blue-500' },
          { label: 'Total Backers', value: stats.totalBackers, icon: Users, color: 'text-purple-500' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 bg-card rounded-xl border">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={cn('h-4 w-4', stat.color)} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Campaign List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-muted rounded-xl h-32" />
          ))}
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first crowdfunding campaign and let your fans support your music
          </p>
          <Link
            href="/artist/campaigns/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
          >
            <Plus className="h-4 w-4" />
            Create Campaign
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => {
            const progress = campaign.goal > 0 ? (campaign.raised / campaign.goal) * 100 : 0;
            return (
              <Link
                key={campaign.id}
                href={`/ojokotau/campaigns/${campaign.id}`}
                className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-xl border hover:border-primary transition-colors"
              >
                <div
                  className="w-full sm:w-40 h-28 rounded-lg bg-cover bg-center shrink-0"
                  style={{ backgroundImage: `url(${campaign.cover || '/images/placeholder.jpg'})` }}
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold">{campaign.title}</h3>
                    <span
                      className={cn(
                        'px-2 py-0.5 text-xs rounded-full font-medium',
                        campaign.status === 'active' && 'bg-green-100 text-green-700',
                        campaign.status === 'draft' && 'bg-yellow-100 text-yellow-700',
                        campaign.status === 'completed' && 'bg-blue-100 text-blue-700',
                        campaign.status === 'cancelled' && 'bg-red-100 text-red-700'
                      )}
                    >
                      {campaign.status}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {formatCurrency(campaign.raised)} / {formatCurrency(campaign.goal)}
                    </span>
                    <span>{campaign.backers} backers</span>
                    <span>{campaign.days_left} days left</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
