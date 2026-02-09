'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Heart, 
  TrendingUp,
  Clock,
  Users,
  Target,
  ChevronRight,
  Star,
  Sparkles,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCampaigns, useFeaturedCampaigns, transformCampaign, Campaign } from '@/hooks/useCampaigns';

const categories = ['All', 'Albums', 'Videos', 'Tours', 'Equipment', 'Medical', 'Education'];

export default function OjokotauPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // API hooks
  const { data: campaignsData, isLoading } = useCampaigns(selectedCategory);
  const { data: featuredData } = useFeaturedCampaigns();
  
  // Mock data for fallback
  const mockFeaturedCampaigns: Campaign[] = [
    {
      id: 1,
      title: 'Help Me Record My Debut Album',
      artist: { name: 'Sarah Nakato', avatar: '/images/artists/sarah.jpg', isVerified: true },
      cover: '/images/campaigns/album.jpg',
      goal: 15000000,
      raised: 11250000,
      backers: 234,
      daysLeft: 21,
      category: 'Albums',
      isFeatured: true,
    },
    {
      id: 2,
      title: 'Music Video for "Sunrise"',
      artist: { name: 'MC Thunder', avatar: '/images/artists/thunder.jpg', isVerified: true },
      cover: '/images/campaigns/video.jpg',
      goal: 8000000,
      raised: 5600000,
      backers: 156,
      daysLeft: 14,
      category: 'Videos',
      isFeatured: true,
    },
  ];
  
  const mockCampaigns: Campaign[] = [
    ...mockFeaturedCampaigns,
    {
      id: 3,
      title: 'East Africa Tour Fund',
      artist: { name: 'The Beats Collective', avatar: '/images/artists/beats.jpg', isVerified: false },
      cover: '/images/campaigns/tour.jpg',
      goal: 25000000,
      raised: 7500000,
      backers: 89,
      daysLeft: 45,
      category: 'Tours',
    },
    {
      id: 4,
      title: 'Studio Equipment Upgrade',
      artist: { name: 'Producer Jay', avatar: '/images/artists/jay.jpg', isVerified: true },
      cover: '/images/campaigns/studio.jpg',
      goal: 5000000,
      raised: 4250000,
      backers: 67,
      daysLeft: 7,
      category: 'Equipment',
    },
    {
      id: 5,
      title: 'Help Fund My Music Education',
      artist: { name: 'Young Talent', avatar: '/images/artists/talent.jpg', isVerified: false },
      cover: '/images/campaigns/education.jpg',
      goal: 3000000,
      raised: 1200000,
      backers: 45,
      daysLeft: 30,
      category: 'Education',
    },
  ];
  
  // Transform API data to component format
  const featuredCampaigns: Campaign[] = useMemo(() => {
    if (featuredData && Array.isArray(featuredData)) {
      return featuredData.map((c: Record<string, unknown>) => transformCampaign(c));
    }
    return mockFeaturedCampaigns;
  }, [featuredData]);
  
  const campaigns: Campaign[] = useMemo(() => {
    if (campaignsData && Array.isArray(campaignsData)) {
      return campaignsData.map((c: Record<string, unknown>) => transformCampaign(c));
    }
    return mockCampaigns;
  }, [campaignsData]);
  
  const filteredCampaigns = campaigns.filter(c => 
    selectedCategory === 'All' || c.category === selectedCategory
  );
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-4">
          <Heart className="h-5 w-5" />
          <span className="font-medium">Ojokotau</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Support Artists You Love
        </h1>
        <p className="text-muted-foreground">
          Help Ugandan artists fund their dreams. From albums to music videos, 
          your contribution makes a difference.
        </p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card text-center">
          <p className="text-2xl font-bold text-primary">UGX 250M+</p>
          <p className="text-sm text-muted-foreground">Total Raised</p>
        </div>
        <div className="p-4 rounded-xl border bg-card text-center">
          <p className="text-2xl font-bold">156</p>
          <p className="text-sm text-muted-foreground">Active Campaigns</p>
        </div>
        <div className="p-4 rounded-xl border bg-card text-center">
          <p className="text-2xl font-bold">12,500+</p>
          <p className="text-sm text-muted-foreground">Supporters</p>
        </div>
        <div className="p-4 rounded-xl border bg-card text-center">
          <p className="text-2xl font-bold">89</p>
          <p className="text-sm text-muted-foreground">Funded Projects</p>
        </div>
      </div>
      
      {/* Featured Campaigns */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-semibold">Featured Campaigns</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {featuredCampaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/ojokotau/campaigns/${campaign.id}`}
              className="group relative rounded-xl overflow-hidden border bg-card"
            >
              <div className="relative h-48">
                <Image
                  src={campaign.cover}
                  alt={campaign.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-semibold text-lg">{campaign.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-6 w-6 rounded-full bg-muted overflow-hidden">
                      <Image
                        src={campaign.artist.avatar}
                        alt={campaign.artist.name}
                        width={24}
                        height={24}
                        className="object-cover"
                      />
                    </div>
                    <span className="text-white/80 text-sm">{campaign.artist.name}</span>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-yellow-500 text-black text-xs font-medium rounded">
                    <Star className="h-3 w-3 inline mr-1" />
                    Featured
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                {/* Progress Bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-primary"
                    style={{ width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold">UGX {campaign.raised.toLocaleString()}</p>
                    <p className="text-muted-foreground">of {(campaign.goal / 1000000).toFixed(0)}M goal</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{campaign.backers}</p>
                    <p className="text-muted-foreground">backers</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{campaign.daysLeft}</p>
                    <p className="text-muted-foreground">days left</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* All Campaigns */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">All Campaigns</h2>
          <Link 
            href="/ojokotau/campaigns"
            className="text-sm text-primary flex items-center"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </section>
      
      {/* CTA */}
      <div className="text-center p-8 rounded-xl bg-linear-to-r from-primary/10 to-purple-500/10 border">
        <h3 className="text-xl font-bold mb-2">Are you an artist?</h3>
        <p className="text-muted-foreground mb-4">
          Start your own campaign and let your fans help fund your next project.
        </p>
        <Link
          href="/ojokotau/campaigns/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
        >
          <Target className="h-5 w-5" />
          Start a Campaign
        </Link>
      </div>
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const progress = (campaign.raised / campaign.goal) * 100;
  
  return (
    <Link
      href={`/ojokotau/campaigns/${campaign.id}`}
      className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative h-40 bg-muted">
        <Image
          src={campaign.cover}
          alt={campaign.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 bg-black/60 text-white text-xs rounded">
            {campaign.category}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-6 w-6 rounded-full bg-muted overflow-hidden">
            <Image
              src={campaign.artist.avatar}
              alt={campaign.artist.name}
              width={24}
              height={24}
              className="object-cover"
            />
          </div>
          <span className="text-sm text-muted-foreground">{campaign.artist.name}</span>
        </div>
        
        <h3 className="font-semibold line-clamp-2 mb-3">{campaign.title}</h3>
        
        {/* Progress Bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-primary"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{Math.round(progress)}% funded</span>
          <span className="text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {campaign.daysLeft}d left
          </span>
        </div>
      </div>
    </Link>
  );
}
