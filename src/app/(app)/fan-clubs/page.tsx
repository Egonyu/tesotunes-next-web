"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Users, Crown, Star, Music, Check, ArrowRight, Search } from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatNumber, formatCurrency } from "@/lib/utils";

interface FanClub {
  id: number;
  name: string;
  slug: string;
  artist: {
    id: number;
    name: string;
    slug: string;
    avatar_url: string | null;
    verified: boolean;
  };
  cover_image_url: string | null;
  description: string;
  members_count: number;
  tier: "free" | "premium" | "vip";
  monthly_price?: number;
  benefits: string[];
  is_member: boolean;
  exclusive_content_count: number;
}

interface FanClubTierBadge {
  tier: string;
  icon: typeof Crown;
  color: string;
  bg: string;
}

const tierConfig: Record<string, FanClubTierBadge> = {
  free: { tier: "Free", icon: Users, color: "text-gray-500", bg: "bg-gray-500/10" },
  premium: { tier: "Premium", icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  vip: { tier: "VIP", icon: Crown, color: "text-purple-500", bg: "bg-purple-500/10" },
};

export default function FanClubsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const { data: fanClubs, isLoading } = useQuery({
    queryKey: ["fan-clubs", filter],
    queryFn: () =>
      apiGet<FanClub[]>(`/fan-clubs${filter !== "all" ? `?tier=${filter}` : ""}`),
  });

  const filteredClubs = fanClubs?.filter(
    (club) =>
      club.name.toLowerCase().includes(search.toLowerCase()) ||
      club.artist.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
          <Crown className="h-5 w-5" />
          Exclusive Access
        </div>
        <h1 className="text-4xl font-bold mb-2">Fan Clubs</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Get closer to your favorite artists. Join their fan clubs for exclusive content,
          early access to releases, and special perks.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search fan clubs or artists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          {["all", "free", "premium", "vip"].map((tier) => (
            <button
              key={tier}
              onClick={() => setFilter(tier)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                filter === tier
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {tier === "all" ? "All Clubs" : tier}
            </button>
          ))}
        </div>
      </div>

      {/* Fan Clubs Grid */}
      {!filteredClubs?.length ? (
        <div className="text-center py-16 bg-card rounded-lg border">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No fan clubs found</h2>
          <p className="text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => {
            const config = tierConfig[club.tier];
            return (
              <Link
                key={club.id}
                href={`/fan-clubs/${club.artist.slug}`}
                className="bg-card rounded-lg border overflow-hidden group hover:border-primary transition-colors"
              >
                {/* Cover Image */}
                <div className="relative h-32 bg-linear-to-br from-primary/20 to-primary/5">
                  {club.cover_image_url && (
                    <Image
                      src={club.cover_image_url}
                      alt={club.name}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full ${config.bg}`}>
                    <config.icon className={`h-4 w-4 ${config.color}`} />
                    <span className={`text-xs font-medium ${config.color}`}>
                      {config.tier}
                    </span>
                  </div>

                  {club.is_member && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-xs font-medium text-green-500">Member</span>
                    </div>
                  )}
                </div>

                {/* Artist Avatar */}
                <div className="relative -mt-10 px-4">
                  <div className="relative w-20 h-20 rounded-full border-4 border-background overflow-hidden bg-muted">
                    {club.artist.avatar_url ? (
                      <Image
                        src={club.artist.avatar_url}
                        alt={club.artist.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Music className="absolute inset-0 m-auto h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 pt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{club.name}</h3>
                    {club.artist.verified && (
                      <Check className="h-5 w-5 text-primary bg-primary/10 rounded-full p-0.5" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    by {club.artist.name}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {club.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {formatNumber(club.members_count)} members
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {club.exclusive_content_count} exclusives
                    </div>
                  </div>

                  {/* Benefits Preview */}
                  {club.benefits.length > 0 && (
                    <div className="space-y-1 mb-4">
                      {club.benefits.slice(0, 3).map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="line-clamp-1">{benefit}</span>
                        </div>
                      ))}
                      {club.benefits.length > 3 && (
                        <p className="text-sm text-primary">
                          +{club.benefits.length - 3} more benefits
                        </p>
                      )}
                    </div>
                  )}

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      {club.monthly_price ? (
                        <p className="font-bold">
                          {formatCurrency(club.monthly_price)}
                          <span className="text-sm font-normal text-muted-foreground">
                            /month
                          </span>
                        </p>
                      ) : (
                        <p className="font-bold text-green-500">Free to Join</p>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-primary group-hover:gap-2 transition-all">
                      {club.is_member ? "View" : "Join"}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* CTA for Artists */}
      <div className="mt-12 bg-linear-to-r from-primary/10 to-primary/5 rounded-lg p-8 text-center">
        <Crown className="h-12 w-12 mx-auto text-primary mb-4" />
        <h3 className="text-2xl font-bold mb-2">Are You an Artist?</h3>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Create your own fan club and connect with your most dedicated fans.
          Offer exclusive content and earn recurring revenue.
        </p>
        <Link
          href="/artist/fan-club"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Create Your Fan Club
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
