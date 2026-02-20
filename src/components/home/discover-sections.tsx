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
} from "lucide-react";

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
    title: "SACCO",
    description: "Save, invest & grow with fellow music lovers. Earn dividends on your shares.",
    href: "/sacco",
    icon: <Landmark className="h-6 w-6" />,
    gradient: "from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30",
    badge: "Earn Together",
  },
  {
    title: "Live Polls",
    description: "Vote for your favorite artists and songs. Your voice shapes the charts!",
    href: "/polls",
    icon: <Vote className="h-6 w-6" />,
    gradient: "from-violet-500/20 to-purple-500/20 hover:from-violet-500/30 hover:to-purple-500/30",
    badge: "Vote Now",
  },
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

export function DiscoverSections() {
  return (
    <div className="space-y-6">
      {/* Main Grid - 2 + 3 layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {discoverCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className={`group relative flex flex-col justify-between p-5 rounded-xl bg-gradient-to-br ${card.gradient} border border-border/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-border`}
          >
            {/* Badge */}
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
