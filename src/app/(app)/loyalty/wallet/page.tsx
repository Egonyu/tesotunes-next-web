'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  CreditCard, 
  Star, 
  ChevronLeft,
  QrCode,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMyLoyaltyCards, LoyaltyCard } from '@/hooks/useLoyalty';

export default function LoyaltyWalletPage() {
  const { data: myCards, isLoading, error } = useMyLoyaltyCards();
  
  const cards: LoyaltyCard[] = myCards || [];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="p-12 rounded-xl border bg-card text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-3" />
          <h2 className="text-xl font-semibold mb-2">Failed to load wallet</h2>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/loyalty" className="p-2 rounded-lg hover:bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">My Loyalty Wallet</h1>
          <p className="text-muted-foreground">
            All your loyalty cards in one place
          </p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/loyalty/scan"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <QrCode className="h-4 w-4" />
          Scan to Earn
        </Link>
        <Link
          href="/loyalty/discover"
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted"
        >
          <CreditCard className="h-4 w-4" />
          Get New Card
        </Link>
      </div>
      
      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div className="p-12 rounded-xl border bg-card text-center">
          <CreditCard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No cards yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start collecting loyalty cards from your favorite artists. 
            Earn points with every stream, purchase, and event attendance.
          </p>
          <Link
            href="/loyalty/discover"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Explore Programs
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={`/loyalty/clubs/${card.club.slug || card.club_id}`}
              className="group p-5 rounded-xl border bg-card hover:border-primary hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {card.club.logo_url ? (
                    <Image 
                      src={card.club.logo_url} 
                      alt={card.club.name}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-linear-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                      {card.club.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {card.club.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {card.club.artist?.name || 'TesoTunes Program'}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  card.tier === 'Gold' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                  card.tier === 'Silver' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                  card.tier === 'Platinum' ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200' :
                  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                )}>
                  {card.tier}
                </span>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{card.points_balance.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">points available</p>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    Joined {new Date(card.joined_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
