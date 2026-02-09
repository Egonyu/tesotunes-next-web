'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronLeft,
  Heart,
  Calendar,
  ChevronRight,
  Filter,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMyDonations, transformDonation } from '@/hooks/useCampaigns';

interface Donation {
  id: number;
  campaign: {
    id: number;
    title: string;
    artist: string;
    cover: string;
    status: 'active' | 'funded' | 'ended';
  };
  amount: number;
  reward?: string;
  date: string;
  message?: string;
  isAnonymous: boolean;
}

export default function MyDonationsPage() {
  // API hook
  const { data: donationsData, isLoading } = useMyDonations();
  
  // Mock data for fallback
  const mockDonations: Donation[] = [
    {
      id: 1,
      campaign: {
        id: 1,
        title: 'Help Me Record My Debut Album',
        artist: 'Sarah Nakato',
        cover: '/images/campaigns/album.jpg',
        status: 'active',
      },
      amount: 50000,
      reward: 'Signed Physical CD',
      date: '2026-02-01',
      message: 'Can\'t wait to hear the album! Good luck! 🎵',
      isAnonymous: false,
    },
    {
      id: 2,
      campaign: {
        id: 2,
        title: 'Music Video for "Sunrise"',
        artist: 'MC Thunder',
        cover: '/images/campaigns/video.jpg',
        status: 'funded',
      },
      amount: 25000,
      reward: 'Digital Album + Bonus Tracks',
      date: '2026-01-15',
      isAnonymous: false,
    },
    {
      id: 3,
      campaign: {
        id: 3,
        title: 'Support Local Talent Festival',
        artist: 'TesoTunes Foundation',
        cover: '/images/campaigns/festival.jpg',
        status: 'ended',
      },
      amount: 100000,
      date: '2025-12-20',
      isAnonymous: true,
    },
  ];
  
  // Transform API data to component format
  const donations: Donation[] = useMemo(() => {
    if (donationsData && Array.isArray(donationsData)) {
      return donationsData.map((d: Record<string, unknown>) => {
        const transformed = transformDonation(d);
        const campaign = d.campaign as Record<string, unknown> || {};
        return {
          id: transformed.id,
          campaign: {
            id: transformed.campaignId,
            title: transformed.campaignTitle,
            artist: transformed.artistName,
            cover: transformed.campaignCover,
            status: (campaign.status as 'active' | 'funded' | 'ended') || 'active',
          },
          amount: transformed.amount,
          reward: transformed.rewardTitle,
          date: transformed.donatedAt,
          message: d.message as string | undefined,
          isAnonymous: (d.is_anonymous as boolean) || false,
        };
      });
    }
    return mockDonations;
  }, [donationsData]);
  
  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalCampaigns = donations.length;
  
  const getStatusStyles = (status: Donation['campaign']['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'funded':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'ended':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container py-8 max-w-4xl">
      {/* Back Link */}
      <Link 
        href="/ojokotau"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Ojokotau
      </Link>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Donations</h1>
        <p className="text-muted-foreground">
          Track your contributions to artists and campaigns
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-6 rounded-xl border bg-card text-center">
          <Heart className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">UGX {totalDonated.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Donated</p>
        </div>
        <div className="p-6 rounded-xl border bg-card text-center">
          <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{totalCampaigns}</p>
          <p className="text-sm text-muted-foreground">Campaigns Supported</p>
        </div>
      </div>
      
      {/* Donations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Donation History</h2>
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
        
        {donations.map((donation) => (
          <Link
            key={donation.id}
            href={`/ojokotau/campaigns/${donation.campaign.id}`}
            className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
              <Image
                src={donation.campaign.cover}
                alt={donation.campaign.title}
                width={64}
                height={64}
                className="object-cover h-full w-full"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium truncate">{donation.campaign.title}</h3>
                <span className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded-full capitalize flex-shrink-0',
                  getStatusStyles(donation.campaign.status)
                )}>
                  {donation.campaign.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{donation.campaign.artist}</p>
              
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>{new Date(donation.date).toLocaleDateString()}</span>
                {donation.reward && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
                    {donation.reward}
                  </span>
                )}
                {donation.isAnonymous && (
                  <span className="text-muted-foreground italic">Anonymous</span>
                )}
              </div>
              
              {donation.message && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-1 italic">
                  "{donation.message}"
                </p>
              )}
            </div>
            
            <div className="text-right flex-shrink-0">
              <p className="font-semibold">UGX {donation.amount.toLocaleString()}</p>
              <ChevronRight className="h-5 w-5 text-muted-foreground mt-1 ml-auto" />
            </div>
          </Link>
        ))}
      </div>
      
      {donations.length === 0 && (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">You haven't made any donations yet</p>
          <Link
            href="/ojokotau"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
          >
            Explore Campaigns
          </Link>
        </div>
      )}
    </div>
  );
}
