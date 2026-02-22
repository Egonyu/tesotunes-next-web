'use client'

import { useState } from 'react'
import { Search, MapPin, Star, Calendar, DollarSign, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSaccoResources } from '@/hooks/useSaccoResources'
import { EmptyState, SaccoSkeleton } from '@/components/sacco/shared'
import type { PlatformResource, ResourceType } from '@/types/sacco'

const resourceTypes: { value: ResourceType | ''; label: string; icon: string }[] = [
  { value: '', label: 'All', icon: '📦' },
  { value: 'studio', label: 'Studios', icon: '🎙️' },
  { value: 'equipment', label: 'Equipment', icon: '🎸' },
  { value: 'venue', label: 'Venues', icon: '🏟️' },
  { value: 'crew', label: 'Crew', icon: '🎬' },
  { value: 'service', label: 'Services', icon: '🔧' },
]

const statusColors: Record<string, string> = {
  available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  booked: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  maintenance: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  retired: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
}

function ResourceCard({ resource }: { resource: PlatformResource }) {
  const [expanded, setExpanded] = useState(false)
  const pricing = resource.pricing
  const cheapestRate = pricing.hourly_rate ?? pricing.daily_rate ?? pricing.monthly_rate ?? 0

  return (
    <div className="rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
      {/* Photo */}
      {resource.photos?.[0] ? (
        <div className="h-40 bg-muted relative overflow-hidden">
          <img src={resource.photos[0]} alt={resource.name} className="w-full h-full object-cover" />
          <span className={cn(
            'absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full',
            statusColors[resource.status] ?? statusColors.maintenance
          )}>
            {resource.status}
          </span>
        </div>
      ) : (
        <div className="h-40 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center relative">
          <span className="text-4xl">{resourceTypes.find((t) => t.value === resource.type)?.icon ?? '📦'}</span>
          <span className={cn(
            'absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full',
            statusColors[resource.status] ?? statusColors.maintenance
          )}>
            {resource.status}
          </span>
        </div>
      )}

      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{resource.name}</h3>
            {resource.condition && (
              <span className="text-[10px] text-muted-foreground capitalize">{resource.condition}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{resource.description}</p>
        </div>

        {resource.location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {resource.location}
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-baseline gap-1">
          <DollarSign className="h-3 w-3 text-emerald-600" />
          <span className="text-lg font-bold text-emerald-600">{cheapestRate.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">
            UGX/{pricing.hourly_rate ? 'hr' : pricing.daily_rate ? 'day' : 'mo'}
          </span>
          {pricing.member_discount_percent > 0 && (
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full ml-auto">
              {pricing.member_discount_percent}% off
            </span>
          )}
        </div>

        {/* Features */}
        {resource.features?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {resource.features.slice(0, expanded ? undefined : 3).map((f) => (
              <span key={f} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{f}</span>
            ))}
            {resource.features.length > 3 && !expanded && (
              <button onClick={() => setExpanded(true)} className="text-[10px] text-emerald-600 hover:underline">
                +{resource.features.length - 3} more
              </button>
            )}
          </div>
        )}

        {/* Loan Terms Summary */}
        <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Min savings to qualify</span>
            <span className="font-medium text-foreground">{resource.loan_terms?.eligibility?.min_savings?.toLocaleString() ?? 'N/A'} UGX</span>
          </div>
          <div className="flex justify-between">
            <span>Interest rate</span>
            <span className="font-medium text-foreground">{resource.loan_terms?.loan?.interest_rate ?? 'N/A'}%</span>
          </div>
        </div>

        {/* Action */}
        <button
          disabled={resource.status !== 'available'}
          className="w-full py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5"
        >
          <Calendar className="h-3.5 w-3.5" />
          {resource.status === 'available' ? 'Book / Apply' : 'Unavailable'}
        </button>
      </div>
    </div>
  )
}

export default function ResourcesPage() {
  const [typeFilter, setTypeFilter] = useState<ResourceType | ''>('')
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useSaccoResources({
    type: typeFilter || undefined,
    search: search || undefined,
  })

  const resources: PlatformResource[] = data ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Platform Resources</h2>
        <p className="text-sm text-muted-foreground">Studios, equipment, venues & services available to SACCO members</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="w-full rounded-lg border bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {resourceTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setTypeFilter(type.value as ResourceType | '')}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                typeFilter === type.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-muted hover:bg-emerald-100 dark:hover:bg-emerald-900/20'
              )}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <SaccoSkeleton />
      ) : isError ? (
        <EmptyState
          icon={<Star className="h-10 w-10 text-amber-500" />}
          title="Error loading resources"
          description="Could not load resources. Please try again."
        />
      ) : resources.length === 0 ? (
        <EmptyState
          icon={<span className="text-4xl">📦</span>}
          title="No resources found"
          description={search ? `No results for "${search}"` : 'No resources available in this category yet.'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  )
}
