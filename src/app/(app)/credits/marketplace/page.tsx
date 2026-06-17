'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Coins,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Plus,
  ShoppingCart,
  History,
  ChevronLeft,
  Loader2,
  AlertCircle,
  X,
  Users,
  Percent,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useMarketplaceStats,
  useMarketplaceListings,
  useMyListings,
  useCreateListing,
  useCancelListing,
  usePurchaseCredits,
  useTradeHistory,
  type CreditListing,
} from '@/hooks/useMarketplace';

type Tab = 'browse' | 'my-listings' | 'history';
type SortOption = 'price_asc' | 'price_desc' | 'credits_desc' | 'newest';

function formatUGX(amount: number) {
  return `UGX ${amount.toLocaleString()}`;
}

export default function CreditMarketplacePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('browse');
  const [sortBy, setSortBy] = useState<SortOption>('price_asc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState<CreditListing | null>(null);

  // Create listing form
  const [listCredits, setListCredits] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [listMinPurchase, setListMinPurchase] = useState('');

  // Data hooks
  const { data: stats, isLoading: statsLoading } = useMarketplaceStats();
  const {
    data: listingsData,
    isLoading: listingsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMarketplaceListings({ sort_by: sortBy });
  const { data: myListings, isLoading: myListingsLoading } = useMyListings();
  const { data: tradeHistory, isLoading: historyLoading } = useTradeHistory();

  // Mutations
  const createListing = useCreateListing();
  const cancelListing = useCancelListing();
  const purchaseCredits = usePurchaseCredits();

  const listings = useMemo(
    () => listingsData?.pages.flatMap((p) => p.data) ?? [],
    [listingsData]
  );

  const currentUserId = (session?.user as { id?: number } | undefined)?.id;

  // Handlers
  const handleCreateListing = () => {
    const credits = parseInt(listCredits);
    const price = parseInt(listPrice);
    const minPurchase = listMinPurchase ? parseInt(listMinPurchase) : undefined;

    if (!credits || credits <= 0) {
      toast.error('Enter a valid credit amount');
      return;
    }
    if (!price || price <= 0) {
      toast.error('Enter a valid price');
      return;
    }

    createListing.mutate(
      { credits_amount: credits, price_ugx: price, min_purchase: minPurchase },
      {
        onSuccess: () => {
          toast.success('Listing created successfully!');
          setShowCreateModal(false);
          setListCredits('');
          setListPrice('');
          setListMinPurchase('');
        },
        onError: () => toast.error('Failed to create listing'),
      }
    );
  };

  const handlePurchase = (listing: CreditListing) => {
    purchaseCredits.mutate(
      { listing_id: listing.id },
      {
        onSuccess: (result) => {
          toast.success(`Purchased ${formatNumber(result.credits_received)} credits!`);
          setShowPurchaseModal(null);
        },
        onError: () => toast.error('Purchase failed. Check your wallet balance.'),
      }
    );
  };

  const handleCancelListing = (listingId: number) => {
    cancelListing.mutate(listingId, {
      onSuccess: () => toast.success('Listing cancelled'),
      onError: () => toast.error('Failed to cancel listing'),
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Back */}
      <Link
        href="/credits"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Credits
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ArrowLeftRight className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Credit Marketplace</h1>
          </div>
          <p className="text-muted-foreground">Buy and sell credits with other users</p>
        </div>
        {session?.user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Sell Credits
          </button>
        )}
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Active Listings</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(stats.total_listings)}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Coins className="h-4 w-4" />
              <span className="text-xs">Credits Available</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(stats.total_credits_available)}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">Avg Rate</span>
            </div>
            <p className="text-2xl font-bold">{formatUGX(stats.avg_rate)}/cr</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Percent className="h-4 w-4" />
              <span className="text-xs">Platform Fee</span>
            </div>
            <p className="text-2xl font-bold">{stats.platform_fee_percent}%</p>
          </div>
        </div>
      ) : null}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {([
          { key: 'browse' as Tab, label: 'Browse', icon: ShoppingCart },
          { key: 'my-listings' as Tab, label: 'My Listings', icon: Coins },
          { key: 'history' as Tab, label: 'Trade History', icon: History },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === key
                ? 'bg-background shadow text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* BROWSE TAB */}
      {/* ============================================================ */}
      {activeTab === 'browse' && (
        <div className="space-y-4">
          {/* Sort */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {listings.length} listing{listings.length !== 1 ? 's' : ''} available
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-sm px-3 py-1.5 border rounded-lg bg-background"
            >
              <option value="price_asc">Lowest Price</option>
              <option value="price_desc">Highest Price</option>
              <option value="credits_desc">Most Credits</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Listings */}
          {listingsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border">
              <ArrowLeftRight className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-lg font-medium">No listings available</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Be the first to list credits for sale!
              </p>
              {session?.user && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                  Create Listing
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-3">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Seller Avatar */}
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {listing.seller.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{listing.seller.name}</span>
                        {listing.seller.is_verified && (
                          <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        @{listing.seller.username}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-1 font-semibold">
                        <Coins className="h-4 w-4 text-purple-500" />
                        {formatNumber(listing.credits_amount)}
                      </div>
                      <p className="text-xs text-muted-foreground">credits</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatUGX(listing.price_ugx)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatUGX(listing.rate_per_credit)}/cr
                      </p>
                    </div>
                    {listing.seller.id !== currentUserId ? (
                      <button
                        onClick={() => setShowPurchaseModal(listing)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        Buy
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 text-xs bg-muted rounded-lg text-muted-foreground">
                        Your listing
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full py-3 text-center text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors disabled:opacity-50"
            >
              {isFetchingNextPage ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                'Load more listings'
              )}
            </button>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MY LISTINGS TAB */}
      {/* ============================================================ */}
      {activeTab === 'my-listings' && (
        <div className="space-y-4">
          {!session?.user ? (
            <div className="text-center py-16 bg-card rounded-xl border">
              <p className="text-muted-foreground">Sign in to manage your listings</p>
            </div>
          ) : myListingsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !myListings || myListings.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border">
              <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-lg font-medium">No active listings</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                List your credits for sale to earn UGX
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
              >
                Create Listing
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {myListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-purple-500" />
                      <span className="font-semibold">
                        {formatNumber(listing.credits_amount)} credits
                      </span>
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          listing.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : listing.status === 'sold'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                        )}
                      >
                        {listing.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatUGX(listing.price_ugx)} &middot;{' '}
                      {formatUGX(listing.rate_per_credit)}/cr &middot; Listed{' '}
                      {new Date(listing.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {listing.status === 'active' && (
                    <button
                      onClick={() => handleCancelListing(listing.id)}
                      disabled={cancelListing.isPending}
                      className="px-3 py-1.5 text-sm border rounded-lg hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TRADE HISTORY TAB */}
      {/* ============================================================ */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !tradeHistory || tradeHistory.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-lg font-medium">No trade history</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your buy and sell transactions will appear here
              </p>
            </div>
          ) : (
            tradeHistory.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-4 rounded-xl border bg-card"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      trade.type === 'buy'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                        : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                    )}
                  >
                    {trade.type === 'buy' ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : (
                      <TrendingUp className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {trade.type === 'buy' ? 'Bought' : 'Sold'}{' '}
                      {formatNumber(trade.credits_amount)} credits
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {trade.type === 'buy' ? 'From' : 'To'} @{trade.counterparty.username}{' '}
                      &middot; {new Date(trade.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      'font-semibold',
                      trade.type === 'sell' ? 'text-green-600' : ''
                    )}
                  >
                    {trade.type === 'sell' ? '+' : '-'} {formatUGX(trade.price_ugx)}
                  </p>
                  {trade.platform_fee > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Fee: {formatUGX(trade.platform_fee)}
                    </p>
                  )}
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      trade.status === 'completed'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : trade.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    )}
                  >
                    {trade.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* CREATE LISTING MODAL */}
      {/* ============================================================ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Sell Credits</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Credits to Sell</label>
                <input
                  type="number"
                  value={listCredits}
                  onChange={(e) => setListCredits(e.target.value)}
                  placeholder="e.g., 1000"
                  min="1"
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price (UGX)</label>
                <input
                  type="number"
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                  placeholder="e.g., 10000"
                  min="1"
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                />
                {listCredits && listPrice && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Rate: {formatUGX(Math.round(parseInt(listPrice) / parseInt(listCredits)))} per
                    credit
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Minimum Purchase (optional)
                </label>
                <input
                  type="number"
                  value={listMinPurchase}
                  onChange={(e) => setListMinPurchase(e.target.value)}
                  placeholder="No minimum"
                  min="1"
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                />
              </div>

              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-sm">
                <p className="text-yellow-700 dark:text-yellow-300">
                  Platform fee: {stats?.platform_fee_percent ?? 5}% deducted from sale proceeds.
                  Credits will be held in escrow until sold.
                </p>
              </div>

              {createListing.error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-red-700 dark:text-red-300">
                    Failed to create listing. Check your credit balance.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted"
                disabled={createListing.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateListing}
                disabled={createListing.isPending || !listCredits || !listPrice}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {createListing.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  'List for Sale'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PURCHASE MODAL */}
      {/* ============================================================ */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Buy Credits</h2>
              <button
                onClick={() => setShowPurchaseModal(null)}
                className="p-1 rounded-lg hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Seller</span>
                  <span className="font-medium">{showPurchaseModal.seller.name}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Credits</span>
                  <span className="font-bold text-lg">
                    {formatNumber(showPurchaseModal.credits_amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="font-bold text-lg">
                    {formatUGX(showPurchaseModal.price_ugx)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rate</span>
                  <span className="text-sm">
                    {formatUGX(showPurchaseModal.rate_per_credit)} per credit
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm">
                <p className="text-blue-700 dark:text-blue-300">
                  This amount will be deducted from your UGX wallet. Credits are transferred
                  instantly after purchase.
                </p>
              </div>

              {purchaseCredits.error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-red-700 dark:text-red-300">
                    Purchase failed. Ensure you have enough UGX balance.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPurchaseModal(null)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted"
                disabled={purchaseCredits.isPending}
              >
                Cancel
              </button>
              <button
                onClick={() => handlePurchase(showPurchaseModal)}
                disabled={purchaseCredits.isPending}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {purchaseCredits.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  `Pay ${formatUGX(showPurchaseModal.price_ugx)}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
