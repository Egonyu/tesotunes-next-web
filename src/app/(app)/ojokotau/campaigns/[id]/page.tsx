'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  Heart,
  Share2,
  Clock,
  Users,
  CheckCircle,
  Gift,
  MessageCircle,
  Flag,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCampaign, transformCampaign } from '@/hooks/useCampaigns';
import { useCampaignBackers } from '@/hooks/useCampaigns';
import { FollowButton } from '@/components/social/FollowButton';
import { CommentSection } from '@/components/social/CommentSection';
import type { CampaignBacker } from '@/hooks/useCampaigns';

interface Reward {
  id: number;
  title: string;
  minAmount: number;
  description: string;
  claimedCount: number;
  limitCount?: number;
}

interface Update {
  id: number;
  title: string;
  content: string;
  date: string;
}

interface Campaign {
  id: number;
  title: string;
  artist: {
    id: number;
    name: string;
    avatar: string;
    isVerified: boolean;
    followers: number;
  };
  cover: string;
  goal: number;
  raised: number;
  backers: number;
  daysLeft: number;
  category: string;
  description: string;
  story: string;
  rewards: Reward[];
  updates: Update[];
  createdAt: string;
}

export default function CampaignDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<'story' | 'rewards' | 'updates' | 'backers'>('story');

  // API hook
  const { data: campaignData, isLoading, error } = useCampaign(id);
  const { data: backersData } = useCampaignBackers(id);

  // Transform API data to component format
  const campaign: Campaign | null = useMemo(() => {
    if (campaignData) {
      const transformed = transformCampaign(campaignData as Record<string, unknown>);
      const rawData = campaignData as Record<string, unknown>;
      const rawArtist = rawData.artist as Record<string, unknown> | undefined;
      return {
        ...transformed,
        artist: { ...transformed.artist, id: transformed.artist.id || 0, followers: (rawArtist?.followers as number) || 0 },
        rewards: (rawData.rewards as Record<string, unknown>[] | undefined)?.map((r: Record<string, unknown>) => ({
          id: r.id as number,
          title: r.title as string,
          minAmount: (r.min_amount as number) || (r.amount as number) || 0,
          description: r.description as string,
          claimedCount: (r.claimed_count as number) || 0,
          limitCount: r.limit_count as number | undefined,
        })) || [],
        updates: (rawData.updates as Record<string, unknown>[] | undefined)?.map((u: Record<string, unknown>) => ({
          id: u.id as number,
          title: u.title as string,
          content: u.content as string,
          date: u.date as string || u.created_at as string,
        })) || [],
      } as Campaign;
    }
    return null;
  }, [campaignData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="container py-8 max-w-3xl">
        <Link href="/ojokotau" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="h-4 w-4" />
          Back to Ojokotau
        </Link>
        <div className="text-center py-12">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Campaign not found</p>
          <p className="text-muted-foreground">This campaign may have been removed or doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const progress = (campaign.raised / campaign.goal) * 100;

  return (
    <div className="container py-8">
      {/* Back Link */}
      <Link
        href="/ojokotau"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Campaigns
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Image */}
          <div className="relative h-64 md:h-96 rounded-xl overflow-hidden bg-muted">
            <Image
              src={campaign.cover}
              alt={campaign.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Title & Artist */}
          <div>
            <span className="text-sm text-primary font-medium">{campaign.category}</span>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">{campaign.title}</h1>

            <div className="flex items-center gap-3 mt-4">
              <Link href={`/artists/${campaign.artist.id}`} className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                  <Image
                    src={campaign.artist.avatar}
                    alt={campaign.artist.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{campaign.artist.name}</span>
                    {campaign.artist.isVerified && (
                      <CheckCircle className="h-4 w-4 text-primary fill-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {campaign.artist.followers.toLocaleString()} followers
                  </p>
                </div>
              </Link>
            </div>

            <p className="mt-4 text-muted-foreground">{campaign.description}</p>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex gap-6">
              {(['story', 'rewards', 'updates', 'backers'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'pb-3 text-sm font-medium capitalize border-b-2 -mb-px transition-colors',
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab}
                  {tab === 'updates' && (
                    <span className="ml-1 text-xs">({campaign.updates.length})</span>
                  )}
                  {tab === 'backers' && (
                    <span className="ml-1 text-xs">({campaign.backers})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {activeTab === 'story' && (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {campaign.story.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-xl font-bold mt-6 mb-4">{line.replace('## ', '')}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.replace('### ', '')}</h3>;
                  }
                  if (line.startsWith('- ')) {
                    return <li key={i} className="ml-4">{line.replace('- ', '')}</li>;
                  }
                  return line ? <p key={i}>{line}</p> : null;
                })}
              </div>
            )}

            {activeTab === 'rewards' && (
              <div className="space-y-4">
                {campaign.rewards.map((reward) => (
                  <div key={reward.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold">{reward.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{reward.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">UGX {reward.minAmount.toLocaleString()}+</p>
                        <p className="text-xs text-muted-foreground">
                          {reward.claimedCount} claimed
                          {reward.limitCount && ` / ${reward.limitCount}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'updates' && (
              <div className="space-y-4">
                {campaign.updates.map((update) => (
                  <div key={update.id} className="p-4 rounded-lg border bg-card">
                    <p className="text-xs text-muted-foreground mb-1">
                      {new Date(update.date).toLocaleDateString()}
                    </p>
                    <h4 className="font-semibold">{update.title}</h4>
                    <p className="text-sm text-muted-foreground mt-2">{update.content}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'backers' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {campaign.backers} people have backed this project
                </p>
                {(backersData as CampaignBacker[] | undefined)?.length ? (
                  <div className="space-y-3">
                    {(backersData as CampaignBacker[]).map((backer) => (
                      <div key={backer.id} className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                        <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                          {backer.is_anonymous || !backer.user ? (
                            <Users className="h-5 w-5 text-muted-foreground" />
                          ) : backer.user.avatar_url ? (
                            <Image
                              src={backer.user.avatar_url}
                              alt={backer.user.name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {backer.user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {backer.is_anonymous ? 'Anonymous Backer' : backer.user?.name || 'Anonymous'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>UGX {backer.amount.toLocaleString()}</span>
                            {backer.reward_title && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Gift className="h-3 w-3" />
                                  {backer.reward_title}
                                </span>
                              </>
                            )}
                            <span>•</span>
                            <span>{new Date(backer.donated_at).toLocaleDateString()}</span>
                          </div>
                          {backer.message && (
                            <p className="text-xs text-muted-foreground mt-1 italic">&quot;{backer.message}&quot;</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No backers yet. Be the first to support!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-24">
            {/* Progress Card */}
            <div className="p-6 rounded-xl border bg-card">
              <div className="text-center mb-4">
                <p className="text-3xl font-bold">UGX {campaign.raised.toLocaleString()}</p>
                <p className="text-muted-foreground">
                  raised of {(campaign.goal / 1000000).toFixed(0)}M goal
                </p>
              </div>

              {/* Progress Bar */}
              <div className="h-3 bg-muted rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div>
                  <p className="text-xl font-bold">{Math.round(progress)}%</p>
                  <p className="text-xs text-muted-foreground">funded</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{campaign.backers}</p>
                  <p className="text-xs text-muted-foreground">backers</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{campaign.daysLeft}</p>
                  <p className="text-xs text-muted-foreground">days left</p>
                </div>
              </div>

              <Link
                href={`/ojokotau/donate/${campaign.id}`}
                className="block w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium text-center hover:bg-primary/90"
              >
                <Heart className="h-5 w-5 inline mr-2" />
                Support This Project
              </Link>

              <div className="flex gap-2 mt-3">
                <FollowButton
                  followableType="campaign"
                  followableId={campaign.id}
                  variant="outline"
                  followLabel="Follow Campaign"
                  followingLabel="Following"
                />
                <button className="flex-1 py-2 border rounded-lg hover:bg-muted flex items-center justify-center gap-1">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button className="py-2 px-4 border rounded-lg hover:bg-muted">
                  <Flag className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Reminder */}
            <div className="mt-4 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {campaign.daysLeft} days left to back this project
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-10">
        <CommentSection
          commentableType="campaign"
          commentableId={campaign.id}
          title="Discussion"
        />
      </div>
    </div>
  );
}
