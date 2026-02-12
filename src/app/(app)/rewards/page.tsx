"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  Gift,
  Star,
  Zap,
  TrendingUp,
  Clock,
  Check,
  ChevronRight,
  Crown,
  Music,
  ShoppingBag,
  Headphones,
  Share2,
  Heart,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { formatNumber, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface LoyaltyData {
  points: {
    balance: number;
    lifetime: number;
    pending: number;
    expiring_soon: number;
    expiring_date?: string;
  };
  tier: {
    name: string;
    level: number;
    icon: string;
    next_tier?: string;
    points_to_next: number;
    benefits: string[];
  };
  recent_activity: {
    id: number;
    type: "earned" | "spent" | "expired";
    amount: number;
    description: string;
    date: string;
  }[];
  available_rewards: {
    id: number;
    title: string;
    description: string;
    points_required: number;
    image_url?: string;
    category: string;
    quantity_available: number;
    is_redeemable: boolean;
    expires_at?: string;
  }[];
  ways_to_earn: {
    id: number;
    action: string;
    points: number;
    description: string;
    icon: string;
    limit?: string;
  }[];
}

const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  bronze: { bg: "bg-amber-600", text: "text-amber-600", border: "border-amber-600" },
  silver: { bg: "bg-gray-400", text: "text-gray-400", border: "border-gray-400" },
  gold: { bg: "bg-yellow-500", text: "text-yellow-500", border: "border-yellow-500" },
  platinum: { bg: "bg-cyan-400", text: "text-cyan-400", border: "border-cyan-400" },
  diamond: { bg: "bg-purple-500", text: "text-purple-500", border: "border-purple-500" },
};

const earnIcons: Record<string, typeof Star> = {
  listen: Headphones,
  purchase: ShoppingBag,
  share: Share2,
  like: Heart,
  refer: Gift,
  review: Star,
  streak: Zap,
};

export default function RewardsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"rewards" | "earn" | "history">("rewards");

  const { data, isLoading } = useQuery({
    queryKey: ["loyalty"],
    queryFn: () => apiGet<LoyaltyData>("/api/loyalty"),
  });

  const redeemReward = useMutation({
    mutationFn: (rewardId: number) => apiPost(`/api/loyalty/redeem`, { reward_id: rewardId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty"] });
      toast.success("Reward redeemed successfully!");
    },
    onError: () => toast.error("Failed to redeem reward"),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-muted rounded-lg" />
          <div className="grid sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Rewards Program</h1>
        <p className="text-muted-foreground mb-6">
          Sign in to access your rewards and points
        </p>
        <Link
          href="/login?redirect=/rewards"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const tierColor = tierColors[data.tier.name.toLowerCase()] || tierColors.bronze;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero Card */}
      <div className={`relative rounded-2xl overflow-hidden mb-8 ${tierColor.bg}`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Crown className="h-8 w-8" />
                <span className="text-lg font-medium opacity-90 capitalize">
                  {data.tier.name} Member
                </span>
              </div>
              <div className="text-5xl font-bold mb-2">
                {formatNumber(data.points.balance)}
              </div>
              <p className="opacity-80">Available Points</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4 text-sm opacity-80">
                <div>
                  <span className="block font-medium text-lg text-white">
                    {formatNumber(data.points.lifetime)}
                  </span>
                  <span>Lifetime Points</span>
                </div>
                <div className="w-px h-8 bg-white/30" />
                <div>
                  <span className="block font-medium text-lg text-white">
                    {formatNumber(data.points.pending)}
                  </span>
                  <span>Pending</span>
                </div>
              </div>

              {data.points.expiring_soon > 0 && (
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatNumber(data.points.expiring_soon)} points expiring{" "}
                    {data.points.expiring_date && formatDate(data.points.expiring_date)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tier Progress */}
          {data.tier.next_tier && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="capitalize">{data.tier.name}</span>
                <span className="capitalize">{data.tier.next_tier}</span>
              </div>
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      ((data.points.lifetime - data.tier.points_to_next) /
                        data.points.lifetime) *
                        100
                    )}%`,
                  }}
                />
              </div>
              <p className="text-sm opacity-80 mt-2">
                {formatNumber(data.tier.points_to_next)} more points to{" "}
                {data.tier.next_tier}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tier Benefits */}
      <div className="bg-card rounded-lg border p-6 mb-8">
        <h2 className="font-bold text-xl mb-4">Your {data.tier.name} Benefits</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.tier.benefits.map((benefit, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`p-1 rounded-full ${tierColor.bg}/10`}>
                <Check className={`h-4 w-4 ${tierColor.text}`} />
              </div>
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {[
          { id: "rewards", label: "Rewards", icon: Gift },
          { id: "earn", label: "Ways to Earn", icon: Zap },
          { id: "history", label: "History", icon: Clock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Rewards Tab */}
      {activeTab === "rewards" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.available_rewards.map((reward) => (
            <div
              key={reward.id}
              className="bg-card rounded-lg border overflow-hidden"
            >
              <div className="relative h-40 bg-linear-to-br from-primary/10 to-primary/5">
                {reward.image_url ? (
                  <Image
                    src={reward.image_url}
                    alt={reward.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Gift className="absolute inset-0 m-auto h-16 w-16 text-muted-foreground" />
                )}
                <div className="absolute top-2 right-2 bg-background px-2 py-1 rounded text-xs">
                  {reward.category}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-1">{reward.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {reward.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold">
                      {formatNumber(reward.points_required)}
                    </span>
                    <span className="text-sm text-muted-foreground">pts</span>
                  </div>

                  {reward.is_redeemable && data.points.balance >= reward.points_required ? (
                    <button
                      onClick={() => redeemReward.mutate(reward.id)}
                      disabled={redeemReward.isPending}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
                    >
                      Redeem
                    </button>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {data.points.balance >= reward.points_required
                        ? "Not available"
                        : `Need ${formatNumber(reward.points_required - data.points.balance)} more`}
                    </span>
                  )}
                </div>

                {reward.expires_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Expires {formatDate(reward.expires_at)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ways to Earn Tab */}
      {activeTab === "earn" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {data.ways_to_earn.map((way) => {
            const Icon = earnIcons[way.icon] || Star;
            return (
              <div
                key={way.id}
                className="bg-card rounded-lg border p-4 flex items-center gap-4"
              >
                <div className={`p-3 rounded-lg ${tierColor.bg}/10`}>
                  <Icon className={`h-6 w-6 ${tierColor.text}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{way.action}</h3>
                  <p className="text-sm text-muted-foreground">{way.description}</p>
                  {way.limit && (
                    <p className="text-xs text-muted-foreground mt-1">{way.limit}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-primary">
                    +{formatNumber(way.points)}
                  </span>
                  <span className="text-sm text-muted-foreground block">pts</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="bg-card rounded-lg border divide-y">
          {data.recent_activity.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No activity yet</p>
            </div>
          ) : (
            data.recent_activity.map((activity) => (
              <div key={activity.id} className="p-4 flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === "earned"
                      ? "bg-green-500/10 text-green-500"
                      : activity.type === "spent"
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {activity.type === "earned" ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : activity.type === "spent" ? (
                    <Gift className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(activity.date)}
                  </p>
                </div>
                <span
                  className={`font-bold ${
                    activity.type === "earned"
                      ? "text-green-500"
                      : activity.type === "spent"
                      ? "text-blue-500"
                      : "text-red-500"
                  }`}
                >
                  {activity.type === "earned" ? "+" : "-"}
                  {formatNumber(activity.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Referral CTA */}
      <div className="mt-12 bg-linear-to-r from-primary/10 to-primary/5 rounded-lg p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-primary/10 rounded-full">
            <Gift className="h-12 w-12 text-primary" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">Invite Friends & Earn</h3>
            <p className="text-muted-foreground">
              Share your referral code and earn 500 points for every friend who joins!
            </p>
          </div>
          <Link
            href="/referrals"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Get Referral Link
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
