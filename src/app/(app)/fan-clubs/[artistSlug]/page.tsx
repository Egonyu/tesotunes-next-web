"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Crown,
  Star,
  Users,
  Music,
  Check,
  Lock,
  Play,
  MessageSquare,
  Calendar,
  Gift,
  Headphones,
  Video,
  FileText,
  Download,
  ChevronDown,
  ArrowLeft,
  Send,
  Heart,
  Repeat2,
  MessageCircle,
  Rss,
  Wifi,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { formatNumber, formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { getEchoInstance } from "@/lib/echo";

interface FanClubDetail {
  id: number;
  name: string;
  slug: string;
  artist: {
    id: number;
    name: string;
    slug: string;
    avatar_url: string | null;
    cover_url: string | null;
    verified: boolean;
    followers_count: number;
    tracks_count: number;
  };
  cover_image_url: string | null;
  description: string;
  members_count: number;
  is_member: boolean;
  membership_tier?: "free" | "premium" | "vip";
  member_since?: string;
  tiers: {
    id: number;
    name: string;
    slug: "free" | "premium" | "vip";
    monthly_price: number;
    benefits: string[];
    is_current: boolean;
  }[];
  exclusive_content: {
    id: number;
    title: string;
    type: "track" | "video" | "photo" | "document" | "live";
    thumbnail_url: string | null;
    created_at: string;
    tier_required: "free" | "premium" | "vip";
    is_accessible: boolean;
  }[];
  upcoming_events: {
    id: number;
    title: string;
    type: string;
    date: string;
    tier_required: "free" | "premium" | "vip";
  }[];
  leaderboard: {
    user: {
      id: number;
      name: string;
      avatar_url: string | null;
    };
    points: number;
    rank: number;
  }[];
}

const tierOrder = { free: 0, premium: 1, vip: 2 };

interface FeedPost {
  id: number;
  author: { id: number; name: string; avatar_url: string | null; is_artist: boolean };
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  created_at: string;
}

interface ChatMessage {
  id: number;
  user: { id: number; name: string; avatar_url: string | null };
  content: string;
  created_at: string;
}

const contentIcons = {
  track: Headphones,
  video: Video,
  photo: Star,
  document: FileText,
  live: Play,
};

export default function FanClubDetailPage({ params }: { params: Promise<{ artistSlug: string }> }) {
  const { artistSlug } = use(params);
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'feed' | 'chat'>('overview');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [feedPostInput, setFeedPostInput] = useState('');

  const { data: fanClub, isLoading } = useQuery({
    queryKey: ["fan-club", artistSlug],
    queryFn: () => apiGet<FanClubDetail>(`/api/fan-clubs/${artistSlug}`),
  });

  const { data: feedPosts } = useQuery({
    queryKey: ["fan-club-feed", artistSlug],
    queryFn: () => apiGet<FeedPost[]>(`/api/fan-clubs/${artistSlug}/feed`),
    enabled: activeTab === 'feed',
  });

  const postToFeed = useMutation({
    mutationFn: (content: string) => apiPost(`/api/fan-clubs/${artistSlug}/feed`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fan-club-feed", artistSlug] });
      setFeedPostInput('');
      toast.success('Posted to feed');
    },
    onError: () => toast.error('Failed to post'),
  });

  const likeFeedPost = useMutation({
    mutationFn: (postId: number) => apiPost(`/api/fan-clubs/${artistSlug}/feed/${postId}/like`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fan-club-feed", artistSlug] }),
  });

  const sendChatMessage = useMutation({
    mutationFn: (content: string) => apiPost(`/api/fan-clubs/${artistSlug}/chat`, { content }),
    onSuccess: () => setChatInput(''),
    onError: () => toast.error('Failed to send message'),
  });

  // Load initial chat messages
  useEffect(() => {
    if (activeTab !== 'chat' || !fanClub) return;
    apiGet<ChatMessage[]>(`/api/fan-clubs/${artistSlug}/chat`).then(setChatMessages).catch(() => {});
  }, [activeTab, artistSlug, fanClub]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // WebSocket for real-time fan club chat
  useEffect(() => {
    if (activeTab !== 'chat' || !fanClub?.id) return;
    const echo = getEchoInstance();
    if (!echo) return;

    const channel = echo.private(`fan-club.${fanClub.id}`);
    channel.listen('.chat.message', (event: { message: ChatMessage }) => {
      setChatMessages(prev => [...prev, event.message]);
    });

    return () => {
      channel.stopListening('.chat.message');
      echo.leave(`fan-club.${fanClub.id}`);
    };
  }, [activeTab, fanClub?.id]);

  const joinClub = useMutation({
    mutationFn: (tierId: number) =>
      apiPost(`/api/fan-clubs/${artistSlug}/join`, { tier_id: tierId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fan-club", artistSlug] });
      toast.success("Welcome to the fan club!");
    },
    onError: () => toast.error("Failed to join. Please try again."),
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-80 bg-muted" />
        <div className="container mx-auto px-4 -mt-20">
          <div className="h-40 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!fanClub) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Fan Club Not Found</h1>
        <p className="text-muted-foreground mb-6">
          This artist doesn't have a fan club yet.
        </p>
        <Link href="/fan-clubs" className="text-primary hover:underline">
          Browse Fan Clubs
        </Link>
      </div>
    );
  }

  const currentTierIndex = fanClub.membership_tier
    ? tierOrder[fanClub.membership_tier]
    : -1;

  return (
    <div>
      {/* Cover Section */}
      <div className="relative h-80 bg-linear-to-br from-primary/20 to-primary/5">
        {fanClub.artist.cover_url && (
          <Image
            src={fanClub.artist.cover_url}
            alt={fanClub.name}
            fill
            className="object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
        
        <div className="absolute top-4 left-4">
          <Link
            href="/fan-clubs"
            className="flex items-center gap-2 text-white/80 hover:text-white bg-black/20 px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
            All Fan Clubs
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-24 relative z-10">
        {/* Artist Info Card */}
        <div className="bg-card rounded-lg border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="relative w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-muted flex-shrink-0">
              {fanClub.artist.avatar_url ? (
                <Image
                  src={fanClub.artist.avatar_url}
                  alt={fanClub.artist.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <Music className="absolute inset-0 m-auto h-12 w-12 text-muted-foreground" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold">{fanClub.name}</h1>
                {fanClub.artist.verified && (
                  <Check className="h-6 w-6 text-primary bg-primary/10 rounded-full p-1" />
                )}
              </div>
              <Link
                href={`/artist/${fanClub.artist.slug}`}
                className="text-muted-foreground hover:text-primary"
              >
                by {fanClub.artist.name}
              </Link>
              <p className="text-muted-foreground mt-3">{fanClub.description}</p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-4">
                <div>
                  <p className="text-2xl font-bold">{formatNumber(fanClub.members_count)}</p>
                  <p className="text-sm text-muted-foreground">Members</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{fanClub.exclusive_content.length}</p>
                  <p className="text-sm text-muted-foreground">Exclusives</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatNumber(fanClub.artist.tracks_count)}</p>
                  <p className="text-sm text-muted-foreground">Tracks</p>
                </div>
              </div>

              {/* Membership Status */}
              {fanClub.is_member && (
                <div className="mt-4 inline-flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-2 rounded-full">
                  <Crown className="h-5 w-5" />
                  <span className="font-medium capitalize">
                    {fanClub.membership_tier} Member
                  </span>
                  <span className="text-sm opacity-80">
                    since {formatDate(fanClub.member_since!)}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Join */}
            {!fanClub.is_member && (
              <div className="md:text-right">
                <button
                  onClick={() => setSelectedTier(fanClub.tiers[0]?.slug)}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Join Fan Club
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-8 w-fit">
          {([
            { key: 'overview', label: 'Overview', icon: Star },
            { key: 'feed', label: 'Feed', icon: Rss },
            { key: 'chat', label: 'Chat', icon: MessageSquare },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.key
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <div className="max-w-2xl space-y-6">
            {/* New Post */}
            {fanClub.is_member && (
              <div className="bg-card rounded-lg border p-4">
                <textarea
                  value={feedPostInput}
                  onChange={(e) => setFeedPostInput(e.target.value)}
                  placeholder="Share something with the community..."
                  className="w-full bg-transparent resize-none focus:outline-none min-h-20 text-sm"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => feedPostInput.trim() && postToFeed.mutate(feedPostInput.trim())}
                    disabled={!feedPostInput.trim() || postToFeed.isPending}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm disabled:opacity-50 hover:bg-primary/90"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}

            {/* Feed Posts */}
            {!feedPosts?.length ? (
              <div className="text-center py-12">
                <Rss className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No posts yet</p>
              </div>
            ) : feedPosts.map((post) => (
              <div key={post.id} className="bg-card rounded-lg border p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                    {post.author.avatar_url ? (
                      <Image src={post.author.avatar_url} alt={post.author.name} width={40} height={40} className="object-cover" />
                    ) : (
                      <Users className="w-5 h-5 m-2.5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <span className="font-medium">{post.author.name}</span>
                    {post.author.is_artist && (
                      <span className="ml-1.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Artist</span>
                    )}
                    <p className="text-xs text-muted-foreground">{formatDate(post.created_at)}</p>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap mb-3">{post.content}</p>
                {post.image_url && (
                  <div className="relative h-64 rounded-lg overflow-hidden bg-muted mb-3">
                    <Image src={post.image_url} alt="" fill className="object-cover" />
                  </div>
                )}
                <div className="flex items-center gap-4 text-muted-foreground">
                  <button
                    onClick={() => likeFeedPost.mutate(post.id)}
                    className={`flex items-center gap-1.5 text-sm hover:text-red-500 ${post.is_liked ? 'text-red-500' : ''}`}
                  >
                    <Heart className="h-4 w-4" fill={post.is_liked ? 'currentColor' : 'none'} />
                    {post.likes_count}
                  </button>
                  <span className="flex items-center gap-1.5 text-sm">
                    <MessageCircle className="h-4 w-4" />
                    {post.comments_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="max-w-2xl">
            <div className="bg-card rounded-lg border flex flex-col h-125">
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Community Chat</h3>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-green-500">
                  <Wifi className="h-3 w-3" />
                  Live
                </span>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No messages yet. Start the conversation!
                  </div>
                ) : chatMessages.map((msg) => {
                  const isMe = Number(session?.user?.id) === msg.user.id;
                  return (
                    <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 rounded-full bg-muted overflow-hidden shrink-0">
                        {msg.user.avatar_url ? (
                          <Image src={msg.user.avatar_url} alt={msg.user.name} width={32} height={32} className="object-cover" />
                        ) : (
                          <Users className="w-4 h-4 m-2 text-muted-foreground" />
                        )}
                      </div>
                      <div className={`max-w-[70%] ${isMe ? 'text-right' : ''}`}>
                        <span className="text-xs text-muted-foreground">{msg.user.name}</span>
                        <div className={`mt-0.5 px-3 py-2 rounded-2xl text-sm ${
                          isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{formatDate(msg.created_at)}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              {fanClub.is_member ? (
                <div className="p-4 border-t flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && chatInput.trim()) {
                        sendChatMessage.mutate(chatInput.trim());
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-muted rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => chatInput.trim() && sendChatMessage.mutate(chatInput.trim())}
                    disabled={!chatInput.trim() || sendChatMessage.isPending}
                    className="p-2 bg-primary text-primary-foreground rounded-full disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="p-4 border-t text-center text-sm text-muted-foreground">
                  <Lock className="h-4 w-4 inline mr-1" />
                  Join the fan club to chat
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content (Overview Tab) */}
        {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Exclusive Content */}
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-bold text-xl">Exclusive Content</h2>
                {fanClub.is_member && (
                  <Link href={`/fan-clubs/${artistSlug}/content`} className="text-primary text-sm">
                    View All
                  </Link>
                )}
              </div>
              <div className="divide-y">
                {fanClub.exclusive_content.slice(0, 5).map((content) => {
                  const Icon = contentIcons[content.type] || Star;
                  const tierIndex = tierOrder[content.tier_required];
                  const canAccess = content.is_accessible;

                  return (
                    <div
                      key={content.id}
                      className={`p-4 flex items-center gap-4 ${
                        !canAccess ? "opacity-60" : ""
                      }`}
                    >
                      <div className="relative w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {content.thumbnail_url ? (
                          <Image
                            src={content.thumbnail_url}
                            alt={content.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Icon className="absolute inset-0 m-auto h-6 w-6 text-muted-foreground" />
                        )}
                        {!canAccess && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Lock className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{content.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Icon className="h-4 w-4" />
                          <span className="capitalize">{content.type}</span>
                          <span>•</span>
                          <span>{formatDate(content.created_at)}</span>
                        </div>
                      </div>
                      {canAccess ? (
                        <button className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20">
                          <Play className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-xs bg-muted px-2 py-1 rounded capitalize">
                          {content.tier_required}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Events */}
            {fanClub.upcoming_events.length > 0 && (
              <div className="bg-card rounded-lg border">
                <div className="p-4 border-b">
                  <h2 className="font-bold text-xl">Upcoming Events</h2>
                </div>
                <div className="divide-y">
                  {fanClub.upcoming_events.map((event) => (
                    <div key={event.id} className="p-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-primary">
                          {new Date(event.date).getDate()}
                        </span>
                        <span className="text-xs text-primary">
                          {new Date(event.date).toLocaleString("default", { month: "short" })}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {event.type}
                        </p>
                      </div>
                      <span className="text-xs bg-muted px-2 py-1 rounded capitalize">
                        {event.tier_required}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Membership Tiers */}
            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-bold text-lg mb-4">Membership Tiers</h3>
              <div className="space-y-4">
                {fanClub.tiers.map((tier) => {
                  const isCurrentOrLower =
                    currentTierIndex >= tierOrder[tier.slug];
                  return (
                    <div
                      key={tier.id}
                      className={`p-4 rounded-lg border-2 ${
                        tier.is_current
                          ? "border-primary bg-primary/5"
                          : "border-transparent bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold capitalize">{tier.name}</h4>
                        {tier.monthly_price > 0 ? (
                          <span className="font-bold">
                            {formatCurrency(tier.monthly_price)}
                            <span className="text-sm font-normal text-muted-foreground">
                              /mo
                            </span>
                          </span>
                        ) : (
                          <span className="text-green-500 font-bold">Free</span>
                        )}
                      </div>
                      <ul className="space-y-2 mb-4">
                        {tier.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                      {tier.is_current ? (
                        <div className="text-center py-2 text-primary font-medium">
                          Current Plan
                        </div>
                      ) : isCurrentOrLower ? (
                        <button
                          disabled
                          className="w-full py-2 border rounded-lg opacity-50"
                        >
                          Included
                        </button>
                      ) : (
                        <button
                          onClick={() => joinClub.mutate(tier.id)}
                          disabled={joinClub.isPending}
                          className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                        >
                          {fanClub.is_member ? "Upgrade" : "Join"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Fans Leaderboard */}
            {fanClub.leaderboard.length > 0 && (
              <div className="bg-card rounded-lg border p-4">
                <h3 className="font-bold text-lg mb-4">Top Fans</h3>
                <div className="space-y-3">
                  {fanClub.leaderboard.map((entry, index) => (
                    <div key={entry.user.id} className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? "bg-yellow-500 text-white"
                            : index === 1
                            ? "bg-gray-400 text-white"
                            : index === 2
                            ? "bg-amber-600 text-white"
                            : "bg-muted"
                        }`}
                      >
                        {entry.rank}
                      </span>
                      <div className="relative w-8 h-8 rounded-full bg-muted overflow-hidden">
                        {entry.user.avatar_url ? (
                          <Image
                            src={entry.user.avatar_url}
                            alt={entry.user.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Users className="absolute inset-0 m-auto h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className="flex-1 font-medium truncate">
                        {entry.user.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(entry.points)} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-bold text-lg mb-4">Connect</h3>
              <div className="space-y-2">
                <Link
                  href={`/artist/${fanClub.artist.slug}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <Music className="h-5 w-5 text-muted-foreground" />
                  <span>View Artist Profile</span>
                </Link>
                <Link
                  href={`/artist/${fanClub.artist.slug}/music`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <Headphones className="h-5 w-5 text-muted-foreground" />
                  <span>Listen to Music</span>
                </Link>
                <button
                  onClick={() => setActiveTab('chat')}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors w-full"
                >
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <span>Community Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
