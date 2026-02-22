'use client'

import { useState } from 'react'
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Calendar,
  X,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEventFiltersStore } from '@/stores/events'

const CATEGORIES = [
  'All',
  'concert',
  'festival',
  'party',
  'workshop',
  'conference',
  'meetup',
  'comedy',
  'theater',
  'sports',
  'exhibition',
  'other',
]

const SORT_OPTIONS = [
  { value: 'date_asc', label: 'Date (Soonest)' },
  { value: 'date_desc', label: 'Date (Latest)' },
  { value: 'trending', label: 'Trending' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price (Low to High)' },
  { value: 'price_desc', label: 'Price (High to Low)' },
] as const

const CITIES = [
  'Kampala',
  'Entebbe',
  'Jinja',
  'Mbarara',
  'Gulu',
  'Mbale',
  'Fort Portal',
  'Lira',
]

interface EventFiltersProps {
  onSearch?: (query: string) => void
  onCategoryChange?: (category: string | undefined) => void
  categories?: string[]
  className?: string
}

export function EventFilters({
  onSearch,
  onCategoryChange,
  categories: customCategories,
  className,
}: EventFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { filters, setFilter, setFilters, resetFilters } =
    useEventFiltersStore()

  const categories = customCategories
    ? ['All', ...customCategories]
    : CATEGORIES

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) =>
      value !== undefined && key !== 'sort' && value !== '',
  ).length

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search + Filter Toggle */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search events, venues, artists..."
            value={filters.search || ''}
            onChange={(e) => {
              setFilter('search', e.target.value || undefined)
              onSearch?.(e.target.value)
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          {filters.search && (
            <button
              onClick={() => {
                setFilter('search', undefined)
                onSearch?.('')
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm transition-colors',
            showAdvanced && 'bg-primary text-primary-foreground border-primary',
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => {
          const isActive =
            cat === 'All'
              ? !filters.category
              : filters.category === cat
          return (
            <button
              key={cat}
              onClick={() => {
                const value = cat === 'All' ? undefined : cat
                setFilter('category', value as typeof filters.category)
                onCategoryChange?.(value)
              }}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all capitalize',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                  : 'border hover:bg-muted',
              )}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-4 rounded-xl border bg-card space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* City */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                City
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  value={filters.city || ''}
                  onChange={(e) =>
                    setFilter('city', e.target.value || undefined)
                  }
                  className="w-full pl-9 pr-8 py-2 rounded-lg border bg-background text-sm appearance-none"
                >
                  <option value="">All Cities</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Date From */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                From Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) =>
                    setFilter('date_from', e.target.value || undefined)
                  }
                  className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm"
                />
              </div>
            </div>

            {/* Date To */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                To Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) =>
                    setFilter('date_to', e.target.value || undefined)
                  }
                  className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Sort By
              </label>
              <div className="relative">
                <select
                  value={filters.sort || 'date_asc'}
                  onChange={(e) =>
                    setFilter('sort', e.target.value as typeof filters.sort)
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm appearance-none"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Quick toggles */}
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={filters.is_free ?? false}
                onChange={(e) =>
                  setFilter('is_free', e.target.checked || undefined)
                }
                className="rounded border-gray-300"
              />
              Free Events
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={filters.is_virtual ?? false}
                onChange={(e) =>
                  setFilter('is_virtual', e.target.checked || undefined)
                }
                className="rounded border-gray-300"
              />
              Virtual Events
            </label>
          </div>

          {/* Price Range */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Min Price (UGX)
              </label>
              <input
                type="number"
                value={filters.price_min ?? ''}
                onChange={(e) =>
                  setFilter(
                    'price_min',
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Max Price (UGX)
              </label>
              <input
                type="number"
                value={filters.price_max ?? ''}
                onChange={(e) =>
                  setFilter(
                    'price_max',
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                placeholder="Any"
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-2 border-t">
            <button
              onClick={() => {
                resetFilters()
                onSearch?.('')
                onCategoryChange?.(undefined)
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear all filters
            </button>
            <button
              onClick={() => setShowAdvanced(false)}
              className="text-sm text-primary font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventFilters
