'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  CreditCard, 
  Gift, 
  Star, 
  ChevronRight,
  QrCode,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useMyLoyaltyCards, 
  useFeaturedLoyaltyClubs,
  useLoyaltyMembership,
  LoyaltyCard,
  LoyaltyClub
} from '@/hooks/useLoyalty';

export default function LoyaltyPage() {
  const { data: membership, isLoading: loadingMembership, error: membershipError } = useLoyaltyMembership();
  const { data: myCards, isLoading: loadingCards, error: cardsError } = useMyLoyaltyCards();
  const { data: featuredClubs, isLoading: loadingFeatured, error: featuredError } = useFeaturedLoyaltyClubs();
  
  const cards: LoyaltyCard[] = myCards || [];
  const featured: LoyaltyClub[] = featuredClubs || [];
  
  const isLoading = loadingMembership || loadingCards;
  const hasError = membershipError || cardsError;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (hasError && !membership && cards.length === 0) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="p-12 rounded-xl border bg-card text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-3" />
          <h2 className="text-xl font-semibold mb-2">Failed to load loyalty data</h2>
          <p className="text-muted-foreground mb-4">Please check your connection and try again.</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Loyalty Cards</h1>
          <p className="text-muted-foreground">
            Earn points and unlock exclusive rewards from your favorite artists
          </p>
        </div>
        <Link
          href="/loyalty/scan"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <QrCode className="h-5 w-5" />
          Scan QR
        </Link>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Total Points</span>
          </div>
          <p className="text-3xl font-bold">{(membership?.total_points ?? 0).toLocaleString()}</p>
        </div>
        
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm text-muted-foreground">Active Cards</span>
          </div>
          <p className="text-3xl font-bold">{cards.length}</p>
        </div>
        
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-sm text-muted-foreground">Your Tier</span>
          </div>
          <p className="text-3xl font-bold">{membership?.tier ?? '—'}</p>
        </div>
      </div>
      
      {/* My Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">My Cards</h2>
          <Link href="/loyalty/wallet" className="text-sm text-primary flex items-center">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        {cards.length === 0 ? (
          <div className="p-8 rounded-xl border bg-card text-center">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No loyalty cards yet</h3>
            <p className="text-muted-foreground mb-4">
              Join artist loyalty programs to earn points and get exclusive rewards
            </p>
            <Link
              href="/loyalty/discover"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Discover Programs
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cards.slice(0, 6).map((card) => (
              <Link
                key={card.id}
                href={`/loyalty/clubs/${card.club.slug || card.club_id}`}
                className="p-4 rounded-xl border bg-card hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  {card.club.logo_url ? (
                    <Image 
                      src={card.club.logo_url} 
                      alt={card.club.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-linear-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
                      {card.club.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{card.club.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {card.club.artist?.name || 'Platform Program'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">{card.points_balance}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                  <span className={cn(
                    'px-2 py-1 text-xs rounded-full',
                    card.tier === 'Gold' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    card.tier === 'Silver' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  )}>
                    {card.tier}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* Discover Programs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Discover Programs</h2>
          <Link href="/loyalty/discover" className="text-sm text-primary flex items-center">
            See all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        {loadingFeatured ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : featured.length === 0 ? (
          <div className="p-6 rounded-xl border bg-card text-center">
            <p className="text-muted-foreground">No featured programs available</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {featured.slice(0, 4).map((club) => (
              <Link
                key={club.id}
                href={`/loyalty/clubs/${club.slug || club.id}`}
                className="p-4 rounded-xl border bg-card hover:border-primary transition-colors"
              >
                <div className="aspect-square rounded-lg bg-linear-to-br from-purple-500 to-pink-500 mb-3 flex items-center justify-center overflow-hidden">
                  {club.logo_url ? (
                    <Image src={club.logo_url} alt={club.name} width={200} height={200} className="w-full h-full object-cover" />
                  ) : (
                    <Gift className="h-12 w-12 text-white" />
                  )}
                </div>
                <h3 className="font-medium truncate">{club.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {club.member_count.toLocaleString()} members
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* How It Works */}
      <div className="p-6 rounded-xl bg-linear-to-r from-primary/10 to-purple-500/10 border">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h3 className="font-medium">Join a program</h3>
              <p className="text-sm text-muted-foreground">
                Find your favorite artists and join their loyalty programs
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="font-medium">Earn points</h3>
              <p className="text-sm text-muted-foreground">
                Stream music, attend events, buy merch, and scan QR codes
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h3 className="font-medium">Redeem rewards</h3>
              <p className="text-sm text-muted-foreground">
                Get exclusive merch, meet & greets, early access, and more
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
