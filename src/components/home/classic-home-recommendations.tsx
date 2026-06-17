"use client";

import Link from "next/link";
import { Play, Pause, ChevronRight } from "lucide-react";
import { useHomepageRecommendations } from "@/hooks/useHomepage";
import { usePlayerStore } from "@/stores";
import { SafeImage, InitialsAvatar } from "@/components/ui/safe-image";
import { SnapCarousel, SnapCarouselItem } from "@/components/ui/snap-carousel";
import type { HomepageItem, HomepageModule, HomepageModuleType } from "@/types/homepage";

const PERSONALIZED_MODULE_ORDER: HomepageModuleType[] = [
  "made_for_you",
  "because_you_listened",
  "recently_played",
  "new_from_followed",
];

const DISCOVERY_MODULE_ORDER: HomepageModuleType[] = [
  "recommended_today",
  "popular_radio",
  "editorial_pick",
];

function SectionHeader({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle?: string | null;
  href?: string | null;
}) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          See all
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

function RecommendationSkeleton() {
  return (
    <div className="space-y-10">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="mb-4 h-8 w-56 rounded bg-muted" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((__, itemIndex) => (
              <div key={itemIndex} className="space-y-2">
                <div className="aspect-square rounded-lg bg-muted" />
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function pickModule(
  modules: HomepageModule[],
  priority: HomepageModuleType[],
  excludeIds: Set<string>
): HomepageModule | null {
  for (const type of priority) {
    const match = modules.find(
      (module) => module.type === type && module.items.length > 0 && !excludeIds.has(module.id)
    );

    if (match) {
      excludeIds.add(match.id);
      return match;
    }
  }

  return null;
}

function renderItemImage(item: HomepageItem) {
  if (item.image_url) {
    return (
      <SafeImage
        src={item.image_url}
        alt={item.title}
        fill
        className="object-cover"
        fallback={
          <InitialsAvatar
            name={item.title}
            className="h-full w-full rounded-lg"
            textClassName="text-3xl"
            icon={item.entity_type === "song" ? "music" : "user"}
          />
        }
        sizes="280px"
      />
    );
  }

  return (
    <InitialsAvatar
      name={item.title}
      className="h-full w-full rounded-lg"
      textClassName="text-3xl"
      icon={item.entity_type === "song" ? "music" : "user"}
    />
  );
}

function RecommendationCard({ item, queue }: { item: HomepageItem; queue: HomepageItem[] }) {
  const { play, pause, resume, currentSong, isPlaying } = usePlayerStore();
  const isCurrentSong = currentSong?.id === item.song?.id;

  const handlePlay = () => {
    if (!item.song) {
      return;
    }

    if (isCurrentSong) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
      return;
    }

    const playableQueue = queue
      .map((queueItem) => queueItem.song)
      .filter((song): song is NonNullable<typeof item.song> => Boolean(song));

    play(item.song, playableQueue.length > 0 ? playableQueue : undefined);
  };

  return (
    <div className="group min-w-0">
      <div className="overflow-hidden rounded-lg bg-card transition hover:bg-accent/40">
        <div className="relative aspect-square overflow-hidden rounded-lg">
          {renderItemImage(item)}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-70 transition group-hover:opacity-90" />
          {item.song ? (
            <button
              type="button"
              onClick={handlePlay}
              className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105"
              aria-label={isCurrentSong && isPlaying ? `Pause ${item.title}` : `Play ${item.title}`}
            >
              {isCurrentSong && isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="ml-0.5 h-4 w-4" />
              )}
            </button>
          ) : null}
        </div>
        <Link href={item.href} className="block p-3">
          {item.eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
              {item.eyebrow}
            </p>
          ) : null}
          <h3 className="mt-1 line-clamp-1 font-semibold">{item.title}</h3>

          {item.reason ? (
            <p className="mt-3 line-clamp-2 text-xs text-muted-foreground/90">{item.reason}</p>
          ) : null}
        </Link>
      </div>
    </div>
  );
}

function RecommendationSection({ module }: { module: HomepageModule }) {
  const visibleItems = module.items.slice(0, 12);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionHeader title={module.title} subtitle={module.subtitle} href={module.view_all_href} />
      <SnapCarousel arrows>
        {visibleItems.map((item) => (
          <SnapCarouselItem key={`${module.id}-${item.id}`} className="sm:w-44">
            <RecommendationCard item={item} queue={visibleItems} />
          </SnapCarouselItem>
        ))}
      </SnapCarousel>
    </section>
  );
}

export function ClassicHomeRecommendations() {
  const { data, isLoading, isError } = useHomepageRecommendations("all");

  if (isLoading) {
    return <RecommendationSkeleton />;
  }

  if (isError || !data) {
    return null;
  }

  const candidateModules = data.modules.filter(
    (module) => module.type !== "hero_feature" && module.items.length > 0
  );
  const usedModuleIds = new Set<string>();
  const sections = [
    pickModule(candidateModules, PERSONALIZED_MODULE_ORDER, usedModuleIds),
    pickModule(candidateModules, DISCOVERY_MODULE_ORDER, usedModuleIds),
  ].filter((module): module is HomepageModule => Boolean(module));

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-10">
      {sections.map((module) => (
        <RecommendationSection key={module.id} module={module} />
      ))}
    </div>
  );
}
