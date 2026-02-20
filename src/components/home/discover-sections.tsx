"use client";

import Link from "next/link";
import {
  Vote,
  CalendarDays,
  ShoppingBag,
  Trophy,
  Landmark,
  ArrowRight,
  Flame,
  TrendingUp,
  Sparkles,
  Store,
  PiggyBank,
  Coins,
  CreditCard,
  Shield,
  Gift,
} from "lucide-react";
import { CommunityPoll } from "./community-poll";

interface DiscoverCard {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  gradient: string;
  badge?: string;
}

const discoverCards: DiscoverCard[] = [
  {
    title: "Events",
    description: "Discover concerts, festivals & live shows happening near you.",
    href: "/events",
    icon: <CalendarDays className="h-6 w-6" />,
    gradient: "from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30",
    badge: "Upcoming",
  },
  {
    title: "Artist Stores",
    description: "Shop merch, exclusive content & collectibles directly from your favorite artists.",
    href: "/store",
    icon: <Store className="h-6 w-6" />,
    gradient: "from-pink-500/20 to-rose-500/20 hover:from-pink-500/30 hover:to-rose-500/30",
    badge: "Shop Now",
  },
  {
    title: "Awards",
    description: "Nominate & vote in music award seasons. Celebrate the best of East African music.",
    href: "/awards",
    icon: <Trophy className="h-6 w-6" />,
    gradient: "from-yellow-500/20 to-amber-500/20 hover:from-yellow-500/30 hover:to-amber-500/30",
    badge: "Season Open",
  },
];

const saccoRewards = [
  {
    icon: PiggyBank,
    label: "Savings",
    detail: "12% annual interest",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  {
    icon: Coins,
    label: "Dividends",
    detail: "Earn from shares",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    icon: CreditCard,
    label: "Loans",
    detail: "Up to 3x savings",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    icon: Gift,
    label: "Loyalty",
    detail: "Earn points on purchases",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
];

export function DiscoverSections() {
  return (
    <div className="space-y-6">
      {/* Two-column: Community Poll + SACCO Rewards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Community Poll */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Vote className="h-4 w-4" />
            Community Poll
          </h3>
          <CommunityPoll />
        </div>

        {/* SACCO & Rewards */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            SACCO &amp; Rewards
          </h3>
          <div className="rounded-xl border bg-card overflow-hidden h-full flex flex-col">
            {/* SACCO Header */}
            <div className="p-5 bg-gradient-to-br from-emerald-600/10 to-teal-600/10 dark:from-emerald-600/20 dark:to-teal-600/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold">TesoTunes Artist SACCO</h4>
                  <p className="text-xs text-muted-foreground">Save together, grow together</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A savings &amp; credit cooperative for music artists. Earn dividends, access affordable loans,
                and build wealth with your community.
              </p>
            </div>

            {/* Reward Cards Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 flex-1">
              {saccoRewards.map((reward) => {
                const Icon = reward.icon;
                return (
                  <div
                    key={reward.label}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${reward.bg} shrink-0`}>
                      <Icon className={`h-4 w-4 ${reward.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight">{reward.label}</p>
                      <p className="text-[11px] text-muted-foreground">{reward.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Revenue Split Info */}
            <div className="px-4 pb-2">
              <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2">How Artists Earn</p>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex-1 rounded-full bg-emerald-500/20 dark:bg-emerald-500/30">
                    <div className="bg-emerald-500 text-white text-[10px] font-bold text-center py-1 rounded-full" style={{ width: "70%" }}>
                      Artist 70%
                    </div>
                  </div>
                  <div className="bg-muted rounded-full px-2 py-1 text-[10px] font-medium text-muted-foreground shrink-0">
                    Platform 30%
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  + Loyalty points on every purchase &middot; Download access included
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="px-4 pb-4">
              <Link
                href="/sacco"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
              >
                Join SACCO &amp; Start Earning
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Cards - Events, Store, Awards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {discoverCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className={`group relative flex flex-col justify-between p-5 rounded-xl bg-gradient-to-br ${card.gradient} border border-border/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-border`}
          >
            {card.badge && (
              <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-background/80 text-foreground/70">
                {card.badge}
              </span>
            )}

            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-lg bg-background/60 text-foreground/80">
                {card.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base">{card.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {card.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-sm text-primary font-medium mt-2 group-hover:gap-2 transition-all">
              Explore
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Stats Bar */}
      <div className="flex flex-wrap items-center justify-center gap-6 py-3 px-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Flame className="h-4 w-4 text-orange-500" />
          Community-powered platform
        </span>
        <span className="hidden sm:flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          Growing daily
        </span>
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-violet-500" />
          100% East African music
        </span>
        <span className="hidden md:flex items-center gap-1.5">
          <ShoppingBag className="h-4 w-4 text-pink-500" />
          Artist-owned stores
        </span>
      </div>
    </div>
  );
}
