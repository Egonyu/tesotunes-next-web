'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronLeft, 
  Gift,
  Search,
  Users,
  Filter,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useLoyaltyClubs, useMyLoyaltyCards, type LoyaltyClub, type LoyaltyCard } from '@/hooks/useLoyalty';

export default function LoyaltyDiscoverPage() {
  const [search, setSearch] = useState('');
  const { data: clubsData, isLoading, error } = useLoyaltyClubs({ search: search || undefined });
  const { data: myCards } = useMyLoyaltyCards();
  
  // Get clubs from response
  const allClubs: LoyaltyClub[] = clubsData?.data || [];
  
  // Check membership
  const isMember = (clubId: number) => myCards?.some((card: LoyaltyCard) => card.club_id === clubId) ?? false;
  
  // Filter by search already handled by API, but can do additional client filtering if needed
  const filteredClubs = allClubs;
  
  return (
    <div className="container max-w-6xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/loyalty" className="p-2 rounded-lg hover:bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Discover Programs</h1>
          <p className="text-muted-foreground">
            Find and join artist loyalty programs
          </p>
        </div>
      </div>
      
      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search programs or artists..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button className="px-4 py-2.5 border rounded-lg hover:bg-muted flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filter</span>
        </button>
      </div>
      
      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="p-12 rounded-xl border bg-card text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-3" />
          <h2 className="text-xl font-semibold mb-2">Failed to load programs</h2>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="p-12 rounded-xl border bg-card text-center">
          <Gift className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {search ? 'No programs found' : 'No programs available'}
          </h2>
          <p className="text-muted-foreground">
            {search 
              ? 'Try a different search term' 
              : 'Check back soon for new loyalty programs'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredClubs.map((club) => (
              <Link
                key={club.id}
                href={`/loyalty/clubs/${club.slug || club.id}`}
                className="group p-4 rounded-xl border bg-card hover:border-primary hover:shadow-lg transition-all"
              >
                <div className="aspect-square rounded-lg bg-linear-to-br from-primary/20 to-purple-500/20 mb-3 flex items-center justify-center overflow-hidden">
                  {club.logo_url ? (
                    <Image 
                      src={club.logo_url} 
                      alt={club.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <Gift className="h-16 w-16 text-primary/50" />
                  )}
                </div>
                
                <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                  {club.name}
                </h3>
                {club.artist && (
                  <p className="text-sm text-muted-foreground truncate">
                    by {club.artist.name}
                  </p>
                )}
                
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{club.member_count.toLocaleString()} members</span>
                </div>
                
                {isMember(club.id) && (
                  <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded">
                    Joined
                  </span>
                )}
              </Link>
            ))}
          </div>
          
          {/* Pagination info */}
          {clubsData?.pagination && clubsData.pagination.total > filteredClubs.length && (
            <div className="text-center text-sm text-muted-foreground">
              Showing {filteredClubs.length} of {clubsData.pagination.total} programs
            </div>
          )}
        </>
      )}
    </div>
  );
}
