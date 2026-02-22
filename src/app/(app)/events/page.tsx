'use client'

import { useState } from 'react'
import {
  Calendar,
  Sparkles,
  Flame,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useEvents,
  useFeaturedEvents,
  useTrendingEvents,
  useEventCategories,
} from '@/hooks/useEvents'
import { EventCard } from '@/components/events/EventCard'
import { EventFilters } from '@/components/events/EventFilters'
import { useEventFiltersStore } from '@/stores/events'

export default function EventsPage() {
  const [page, setPage] = useState(1)
  const { filters } = useEventFiltersStore()

  const { data: categoriesData } = useEventCategories()
  const categories = categoriesData || []

  const { data: eventsData, isLoading } = useEvents({
    page,
    per_page: 12,
    category: filters.category || undefined,
    city: filters.city || undefined,
    search: filters.search || undefined,
  })

  const { data: featuredEvents } = useFeaturedEvents()
  const { data: trendingEvents } = useTrendingEvents(6)

  const events = eventsData?.data || []
  const showFeatured =
    featuredEvents &&
    featuredEvents.length > 0 &&
    !filters.category &&
    !filters.search
  const showTrending =
    trendingEvents &&
    trendingEvents.length > 0 &&
    !filters.category &&
    !filters.search

  return (
    <div className="container py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Calendar className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground text-sm">
            Discover concerts, festivals, and live music experiences
          </p>
        </div>
      </div>

      {/* Filters */}
      <EventFilters
        categories={categories}
        onSearch={() => setPage(1)}
        onCategoryChange={() => setPage(1)}
      />

      {/* Featured Events */}
      {showFeatured && (
        <section>
          <SectionHeader
            icon={<Sparkles className="h-5 w-5 text-yellow-500" />}
            title="Featured Events"
            subtitle="Hand-picked experiences"
          />
          <div className="space-y-4 mt-4">
            {featuredEvents!.slice(0, 2).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                featured
                showSocialProof
                showLiveData
                enableQuickActions
              />
            ))}
          </div>
        </section>
      )}

      {/* Trending Events */}
      {showTrending && (
        <section>
          <SectionHeader
            icon={<Flame className="h-5 w-5 text-orange-500" />}
            title="Trending Now"
            subtitle="Hot events everyone is talking about"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {trendingEvents!.slice(0, 6).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                showLiveData
                showSocialProof
                enableQuickActions
              />
            ))}
          </div>
        </section>
      )}

      {/* All Events */}
      <section>
        <SectionHeader
          icon={<Calendar className="h-5 w-5 text-primary" />}
          title={
            filters.category
              ? `${filters.category} Events`
              : filters.search
                ? 'Search Results'
                : 'Upcoming Events'
          }
          subtitle={
            filters.search
              ? `Showing results for "${filters.search}"`
              : 'Browse all upcoming events'
          }
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <EmptyState search={filters.search} />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-4">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  showSocialProof
                  showLiveData
                  enableQuickActions
                />
              ))}
            </div>

            {/* Pagination */}
            {eventsData?.pagination && eventsData.pagination.last_page > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from(
                  { length: eventsData.pagination.last_page },
                  (_, i) => i + 1,
                )
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === eventsData.pagination.last_page ||
                      Math.abs(p - page) <= 2,
                  )
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center gap-2">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="text-muted-foreground">...</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={cn(
                          'h-9 w-9 rounded-lg text-sm font-medium transition-colors',
                          page === p
                            ? 'bg-primary text-primary-foreground'
                            : 'border hover:bg-muted',
                        )}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}

function EmptyState({ search }: { search?: string }) {
  return (
    <div className="text-center py-16 border rounded-xl mt-4">
      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="font-semibold mb-2">No events found</h3>
      <p className="text-muted-foreground text-sm">
        {search
          ? 'Try different search terms or adjust your filters'
          : 'Check back later for upcoming events'}
      </p>
    </div>
  )
}