import { Suspense } from "react";
import Link from "next/link";
import { FeaturedSection } from "@/components/home/featured-section";
import { SongGrid } from "@/components/home/song-grid";
import { ArtistCarousel } from "@/components/home/artist-carousel";
import { GenreGrid } from "@/components/home/genre-grid";
import { ChevronRight } from "lucide-react";

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
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          See all
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-muted rounded mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-3 w-1/2 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="p-6 space-y-10">
      {/* Featured Section */}
      <Suspense fallback={<div className="h-64 bg-muted rounded-lg animate-pulse" />}>
        <FeaturedSection />
      </Suspense>

      {/* Trending Songs */}
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

      {/* Popular Artists */}
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

      {/* New Releases */}
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

      {/* Browse by Genre */}
      <section>
        <SectionHeader
          title="Browse by Genre"
          href="/genres"
        />
        <Suspense fallback={<LoadingSkeleton />}>
          <GenreGrid />
        </Suspense>
      </section>

      {/* Recently Played - only for authenticated users */}
      <section>
        <SectionHeader
          title="Recently Played"
          href="/history"
        />
        <Suspense fallback={<LoadingSkeleton />}>
          <SongGrid type="recent" limit={10} />
        </Suspense>
      </section>
    </div>
  );
}
