"use client";

import Link from "next/link";
import { Vote, CalendarDays, ShoppingBag, Languages, Trophy, ArrowRight } from "lucide-react";
import { SnapCarousel, SnapCarouselItem } from "@/components/ui/snap-carousel";
import { STORE_ENABLED } from "@/lib/features";
import { useContributionsStatus } from "@/hooks/useContributions";

interface Activity {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  gradient: string;
}

/**
 * A compact, interleaved row of non-music things to do while listening —
 * vote in polls, catch events, shop, or help build the Ateso corpus. Sits
 * between song rows so the home feed mixes activity with playback.
 */
export function ActivitiesStrip() {
  const { data: contributions } = useContributionsStatus();

  const activities: Activity[] = [
    {
      title: "Community Polls",
      description: "Cast your vote and shape the platform.",
      href: "/polls",
      icon: <Vote className="h-5 w-5" />,
      gradient: "from-violet-500/20 to-purple-500/20",
    },
    {
      title: "Live Events",
      description: "Concerts & shows happening near you.",
      href: "/events",
      icon: <CalendarDays className="h-5 w-5" />,
      gradient: "from-orange-500/20 to-amber-500/20",
    },
    {
      title: "Awards",
      description: "Nominate & vote for the best.",
      href: "/awards",
      icon: <Trophy className="h-5 w-5" />,
      gradient: "from-yellow-500/20 to-amber-500/20",
    },
  ];

  if (STORE_ENABLED) {
    activities.splice(2, 0, {
      title: "Shop Merch",
      description: "Support artists with merch & extras.",
      href: "/store",
      icon: <ShoppingBag className="h-5 w-5" />,
      gradient: "from-pink-500/20 to-rose-500/20",
    });
  }

  if (contributions?.enabled) {
    activities.unshift({
      title: "Ateso Corpus",
      description: "Translate a line, earn credits.",
      href: "/contribute",
      icon: <Languages className="h-5 w-5" />,
      gradient: "from-emerald-500/20 to-teal-500/20",
    });
  }

  return (
    <SnapCarousel arrows>
      {activities.map((activity) => (
        <SnapCarouselItem key={activity.title} className="sm:w-64">
          <Link
            href={activity.href}
            className={`group flex h-full flex-col justify-between gap-4 rounded-xl border border-border/50 bg-gradient-to-br ${activity.gradient} p-4 transition-all hover:border-border hover:shadow-md`}
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-background/60 p-2 text-foreground/80">{activity.icon}</div>
              <div className="min-w-0">
                <h3 className="font-bold">{activity.title}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{activity.description}</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-primary transition-all group-hover:gap-2">
              Open
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </SnapCarouselItem>
      ))}
    </SnapCarousel>
  );
}
