import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FeaturedSection } from "@/components/home/featured-section";
import { SongGrid } from "@/components/home/song-grid";
import { ArtistCarousel } from "@/components/home/artist-carousel";
import { GenreGrid } from "@/components/home/genre-grid";
import { DiscoverSections } from "@/components/home/discover-sections";
import { ClassicHomeRecommendations } from "@/components/home/classic-home-recommendations";
import { PlaylistGrid } from "@/components/home/playlist-grid";

function SectionHeader({
  title,
  href,
  subtitle,
}: {
  title: string;
  href?: string;
  subtitle?: string;
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

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-8 w-48 rounded bg-muted" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="aspect-square rounded-lg bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClassicHomePage() {
  return (
    <div className="space-y-10 p-6">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-muted" />}>
        <FeaturedSection />
      </Suspense>

      <ClassicHomeRecommendations />

      <section>
        <SectionHeader
          title="Curated Playlists"
          href="/playlists"
          subtitle="Handpicked collections for every mood"
        />
        <Suspense fallback={<LoadingSkeleton />}>
          <PlaylistGrid />
        </Suspense>
      </section>

      <section>
        <SectionHeader
          title="Trending Now"
          href="/charts"
          subtitle="What's hot in East Africa"
        />
        <Suspense fallback={<LoadingSkeleton />}>
          <SongGrid type="trending" limit={10} />
        </Suspense>
      </section>

      <section>
        <SectionHeader
          title="Popular Artists"
          href="/artists"
          subtitle="Top voices from the region"
        />
        <Suspense fallback={<LoadingSkeleton />}>
          <ArtistCarousel />
        </Suspense>
      </section>

      <section>
        <SectionHeader
          title="New Releases"
          href="/new-releases"
          subtitle="Fresh music just for you"
        />
        <Suspense fallback={<LoadingSkeleton />}>
          <SongGrid type="new" limit={10} />
        </Suspense>
      </section>

      <section>
        <SectionHeader title="Browse by Genre" href="/genres" />
        <Suspense fallback={<LoadingSkeleton />}>
          <GenreGrid />
        </Suspense>
      </section>

      <section>
        <SectionHeader
          title="Discover More"
          subtitle="More than just music — join the community"
        />
        <DiscoverSections />
      </section>

      <section>
        <SectionHeader
          title="Freshly Updated"
          href="/songs"
          subtitle="Latest updates from the catalog"
        />
        <Suspense fallback={<LoadingSkeleton />}>
          <SongGrid type="recent" limit={10} />
        </Suspense>
      </section>
    </div>
  );
}
