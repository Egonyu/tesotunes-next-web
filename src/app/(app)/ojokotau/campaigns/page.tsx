'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import {
  Search,
  Filter,
  Heart,
  Users,
  TrendingUp,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Campaign {
  id: number;
  title: string;
  description: string;
  artist: string;
  cover_image: string;
  goal: number;
  raised: number;
  backers: number;
  days_left: number;
  category: string;
  is_featured: boolean;
}

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['ojokotau', 'campaigns', category, searchQuery],
    queryFn: () => apiGet<{ data: Campaign[] }>(
      `/ojokotau/campaigns?category=${category}&search=${searchQuery}`
    ).then(r => r.data),
  });

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Support artists and fund creative projects</p>
        </div>
        <Link
          href="/ojokotau/campaigns/create"
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
        >
          Start a Campaign
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-sm"
            placeholder="Search campaigns..."
          />
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-muted">
          {['all', 'music', 'events', 'equipment', 'education'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize',
                category === cat ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : campaigns && campaigns.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => {
            const progress = campaign.goal > 0 ? Math.min(100, Math.round((campaign.raised / campaign.goal) * 100)) : 0;
            return (
              <Link
                key={campaign.id}
                href={`/ojokotau/campaigns/${campaign.id}`}
                className="group rounded-xl border overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video relative bg-linear-to-br from-primary/20 to-primary/5">
                  {campaign.cover_image ? (
                    <Image src={campaign.cover_image} alt={campaign.title} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Heart className="h-12 w-12 text-primary/30" />
                    </div>
                  )}
                  {campaign.is_featured && (
                    <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">{campaign.title}</h3>
                    <p className="text-sm text-muted-foreground">by {campaign.artist}</p>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
                  
                  {/* Progress bar */}
                  <div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span className="font-medium">${campaign.raised.toLocaleString()} raised</span>
                      <span className="text-muted-foreground">{progress}% of ${campaign.goal.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {campaign.backers} backers
                    </div>
                    <span>{campaign.days_left > 0 ? `${campaign.days_left} days left` : 'Ended'}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Heart className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No campaigns found</h3>
          <p className="text-muted-foreground mb-6">Be the first to start a campaign!</p>
          <Link
            href="/ojokotau/campaigns/create"
            className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
          >
            Start a Campaign
          </Link>
        </div>
      )}
    </div>
  );
}
