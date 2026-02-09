<?php

namespace App\Http\Controllers\Frontend\Artist;

use App\Http\Controllers\Controller;
use App\Models\Artist;
use App\Models\ArtistRevenue;
use App\Models\CreditTransaction;
use App\Models\Song;
use App\Models\Album;
use App\Models\PlayHistory;
use App\Models\MusicUpload;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist) {
            return redirect()->route('frontend.artist.setup')->with('warning', 'Please complete your artist profile first.');
        }

        // Date ranges for growth calculations
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        $twoMonthsAgo = Carbon::now()->subMonths(2)->startOfMonth();
        $thisWeek = Carbon::now()->startOfWeek();

        // Get song IDs for this artist
        $songIds = $artist->songs()->pluck('songs.id');

        // ========================================
        // 1. WALLET & EARNINGS DATA (Comprehensive)
        // ========================================
        $walletData = $this->getWalletAndEarningsData($user, $artist, $thisMonth, $lastMonth, $thisWeek);

        // ========================================
        // 2. REVENUE DATA (Legacy format for backward compatibility)
        // ========================================
        $revenueData = [
            'music_royalties' => $walletData['streaming_revenue_total'],
            'music_growth' => $this->getGrowthRate($artist, $songIds, 'royalties', $thisMonth, $lastMonth, $twoMonthsAgo),
            'merch_sales' => $this->getMerchSales($artist),
            'merch_growth' => $this->getMerchGrowth($artist, $thisMonth, $lastMonth, $twoMonthsAgo),
            'ticket_sales' => $this->getTicketSales($artist),
            'ticket_growth' => $this->getTicketGrowth($artist, $thisMonth, $lastMonth, $twoMonthsAgo),
            'total_earnings' => 0, // Will calculate below
        ];

        // Calculate total earnings
        $revenueData['total_earnings'] = 
            $revenueData['music_royalties'] + 
            $revenueData['merch_sales'] + 
            $revenueData['ticket_sales'];

        // ========================================
        // 3. MUSIC STATS
        // ========================================
        $musicStats = [
            'total_streams' => $artist->total_plays_count ?? $artist->songs()->sum('play_count'),
            'streams_this_month' => $this->getStreamsThisMonth($songIds, $thisMonth),
            'streams_growth' => $this->getStreamsGrowth($songIds, $thisMonth, $lastMonth, $twoMonthsAgo),
            'total_tracks' => $artist->songs()->count(),
            'published_tracks' => $artist->songs()->where('status', 'published')->count(),
            'pending_tracks' => $artist->songs()->where('status', 'pending')->count(),
            'upcoming_events' => Event::where('organizer_id', $artist->user_id)->where('starts_at', '>=', now())->count(),
        ];

        // ========================================
        // 3. RECENT TRACKS
        // ========================================
        $recentTracks = $artist->songs()
            ->where('status', 'published')
            ->with(['genres', 'album'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function($song) use ($thisMonth) {
                return [
                    'id' => $song->id,
                    'title' => $song->title,
                    'slug' => $song->slug,
                    'artwork' => $song->artwork,
                    'artwork_url' => $song->artwork ? \Storage::url($song->artwork) : null,
                    'type' => $song->album_id ? 'Album Track' : 'Single',
                    'album_name' => $song->album?->title,
                    'play_count' => $song->play_count ?? 0,
                    'streams_this_month' => PlayHistory::where('song_id', $song->id)
                        ->where('played_at', '>=', $thisMonth)
                        ->count(),
                    'created_at' => $song->created_at,
                    'genre' => $song->genres->first()?->name ?? 'Unknown',
                ];
            });

        // ========================================
        // 4. UPCOMING EVENTS
        // ========================================
        $upcomingEvents = Event::where('organizer_id', $artist->user_id)
            ->where('starts_at', '>=', now())
            ->with(['tickets'])
            ->orderBy('starts_at')
            ->limit(5)
            ->get()
            ->map(function($event) {
                $totalTickets = $event->tickets()->sum('quantity');
                $soldTickets = $event->tickets()->sum('sold');
                
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'slug' => $event->slug,
                    'start_date' => $event->starts_at,
                    'venue' => $event->venue,
                    'city' => $event->city,
                    'total_tickets' => $totalTickets,
                    'sold_tickets' => $soldTickets,
                    'percentage_sold' => $totalTickets > 0 ? round(($soldTickets / $totalTickets) * 100) : 0,
                    'status' => $this->getEventStatus($soldTickets, $totalTickets),
                ];
            });

        // ========================================
        // 5. STORE STATS & TOP PRODUCTS
        // ========================================
        $storeStats = $this->getStoreStats($artist);
        $topProducts = $this->getTopProducts($artist);

        // ========================================
        // 6. TOP ALBUMS
        // ========================================
        $topAlbums = Album::where('artist_id', $artist->id)
            ->withCount('songs')
            ->with('songs')
            ->orderByDesc(function($query) {
                $query->select(DB::raw('SUM(play_count)'))
                    ->from('songs')
                    ->whereColumn('album_id', 'albums.id');
            })
            ->limit(5)
            ->get()
            ->map(function($album) {
                return [
                    'id' => $album->id,
                    'title' => $album->title,
                    'slug' => $album->slug,
                    'artwork' => $album->artwork ? \Storage::url($album->artwork) : null,
                    'tracks_count' => $album->songs_count,
                    'total_plays' => $album->songs->sum('play_count'),
                    'release_date' => $album->release_date,
                ];
            });

        // ========================================
        // 7. PENDING UPLOADS
        // ========================================
        $pendingUploads = MusicUpload::where('artist_id', $artist->id)
            ->whereIn('processing_status', ['uploaded', 'processing'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // ========================================
        // 8. RECENT ACTIVITY
        // ========================================
        $recentActivity = PlayHistory::whereIn('song_id', $songIds)
            ->with(['song', 'user'])
            ->orderBy('played_at', 'desc')
            ->limit(10)
            ->get();

        return view('frontend.artist.dashboard', compact(
            'artist',
            'walletData',
            'revenueData',
            'musicStats',
            'recentTracks',
            'upcomingEvents',
            'storeStats',
            'topProducts',
            'topAlbums',
            'pendingUploads',
            'recentActivity'
        ));
    }

    /**
     * Get comprehensive wallet and earnings data for the artist
     */
    private function getWalletAndEarningsData($user, $artist, $thisMonth, $lastMonth, $thisWeek)
    {
        // Wallet balance
        $walletBalance = $user->ugx_balance ?? 0;
        
        // Total plays for revenue calculation
        $totalPlays = Song::where('artist_id', $artist->id)->sum('play_count');
        $avgRevenuePerStream = 7; // UGX average (premium: 10.5, free: 3.5)
        
        // Streaming revenue from actual records or estimate
        $actualStreamingRevenue = ArtistRevenue::where('artist_id', $artist->id)
            ->where('revenue_type', 'stream')
            ->sum('net_amount');
        $streamingRevenueTotal = $actualStreamingRevenue > 0 ? $actualStreamingRevenue : ($totalPlays * $avgRevenuePerStream);
        
        // Revenue this month
        $revenueThisMonth = ArtistRevenue::where('artist_id', $artist->id)
            ->whereMonth('revenue_date', now()->month)
            ->whereYear('revenue_date', now()->year)
            ->sum('net_amount');
        
        // Revenue last month (for comparison)
        $revenueLastMonth = ArtistRevenue::where('artist_id', $artist->id)
            ->whereMonth('revenue_date', now()->subMonth()->month)
            ->whereYear('revenue_date', now()->subMonth()->year)
            ->sum('net_amount');
        
        // Revenue this week
        $revenueThisWeek = ArtistRevenue::where('artist_id', $artist->id)
            ->where('revenue_date', '>=', $thisWeek)
            ->sum('net_amount');
        
        // Calculate growth percentage
        $monthlyGrowth = $revenueLastMonth > 0 
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1) 
            : ($revenueThisMonth > 0 ? 100 : 0);
        
        // Recent earnings transactions (last 5)
        $recentEarnings = CreditTransaction::where('user_id', $user->id)
            ->where('type', 'stream')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        // Total earnings from all credit transactions
        $totalEarnedFromStreams = CreditTransaction::where('user_id', $user->id)
            ->where('type', 'stream')
            ->sum('amount');
        
        // Pending payout (if any - balance that can be withdrawn)
        $pendingPayout = $walletBalance;
        
        // Revenue breakdown by type
        $revenueByType = ArtistRevenue::where('artist_id', $artist->id)
            ->select('revenue_type', DB::raw('SUM(net_amount) as total'))
            ->groupBy('revenue_type')
            ->pluck('total', 'revenue_type')
            ->toArray();
        
        return [
            'wallet_balance' => $walletBalance,
            'streaming_revenue_total' => $streamingRevenueTotal,
            'revenue_this_month' => $revenueThisMonth,
            'revenue_last_month' => $revenueLastMonth,
            'revenue_this_week' => $revenueThisWeek,
            'monthly_growth' => $monthlyGrowth,
            'total_plays' => $totalPlays,
            'avg_revenue_per_stream' => $avgRevenuePerStream,
            'recent_earnings' => $recentEarnings,
            'total_earned_from_streams' => $totalEarnedFromStreams,
            'pending_payout' => $pendingPayout,
            'revenue_by_type' => $revenueByType,
        ];
    }

    /**
     * Calculate music royalties from streams
     */
    private function getMusicRoyalties($artist, $songIds)
    {
        // If you have a revenue column, use it
        $revenue = $artist->songs()->sum('revenue_generated') ?? 0;
        
        // Or calculate from streams (example: $0.01 per stream)
        if ($revenue == 0) {
            $totalStreams = PlayHistory::whereIn('song_id', $songIds)->count();
            $revenue = $totalStreams * 0.01; // $0.01 per stream
        }
        
        return round($revenue, 2);
    }

    /**
     * Calculate merch sales from orders
     */
    private function getMerchSales($artist)
    {
        return DB::table('orders')
            ->join('stores', 'orders.store_id', '=', 'stores.id')
            ->where('stores.owner_type', 'App\\Models\\Artist')
            ->where('stores.owner_id', $artist->id)
            ->whereIn('orders.status', ['completed', 'delivered'])
            ->sum('orders.total_amount') ?? 0;
    }

    /**
     * Calculate merch growth
     */
    private function getMerchGrowth($artist, $thisMonth, $lastMonth, $twoMonthsAgo)
    {
        $currentSales = DB::table('orders')
            ->join('stores', 'orders.store_id', '=', 'stores.id')
            ->where('stores.owner_type', 'App\\Models\\Artist')
            ->where('stores.owner_id', $artist->id)
            ->whereIn('orders.status', ['completed', 'delivered'])
            ->where('orders.created_at', '>=', $thisMonth)
            ->sum('orders.total_amount') ?? 0;

        $lastMonthSales = DB::table('orders')
            ->join('stores', 'orders.store_id', '=', 'stores.id')
            ->where('stores.owner_type', 'App\\Models\\Artist')
            ->where('stores.owner_id', $artist->id)
            ->whereIn('orders.status', ['completed', 'delivered'])
            ->whereBetween('orders.created_at', [$lastMonth, $thisMonth])
            ->sum('orders.total_amount') ?? 0;

        return $this->calculateGrowthPercentage($currentSales, $lastMonthSales);
    }

    /**
     * Calculate ticket sales
     */
    private function getTicketSales($artist)
    {
        return DB::table('event_tickets')
            ->join('events', 'event_tickets.event_id', '=', 'events.id')
            ->where('events.organizer_id', $artist->user_id)
            ->where('event_tickets.status', 'sold')
            ->sum(DB::raw('event_tickets.price * event_tickets.sold')) ?? 0;
    }

    /**
     * Calculate ticket growth
     */
    private function getTicketGrowth($artist, $thisMonth, $lastMonth, $twoMonthsAgo)
    {
        $currentSales = DB::table('event_tickets')
            ->join('events', 'event_tickets.event_id', '=', 'events.id')
            ->where('events.organizer_id', $artist->user_id)
            ->where('event_tickets.status', 'sold')
            ->where('event_tickets.updated_at', '>=', $thisMonth)
            ->sum(DB::raw('event_tickets.price * event_tickets.sold')) ?? 0;

        $lastMonthSales = DB::table('event_tickets')
            ->join('events', 'event_tickets.event_id', '=', 'events.id')
            ->where('events.organizer_id', $artist->user_id)
            ->where('event_tickets.status', 'sold')
            ->whereBetween('event_tickets.updated_at', [$lastMonth, $thisMonth])
            ->sum(DB::raw('event_tickets.price * event_tickets.sold')) ?? 0;

        return $this->calculateGrowthPercentage($currentSales, $lastMonthSales);
    }

    /**
     * Get streams this month
     */
    private function getStreamsThisMonth($songIds, $thisMonth)
    {
        return PlayHistory::whereIn('song_id', $songIds)
            ->where('played_at', '>=', $thisMonth)
            ->count();
    }

    /**
     * Calculate streams growth
     */
    private function getStreamsGrowth($songIds, $thisMonth, $lastMonth, $twoMonthsAgo)
    {
        $currentStreams = PlayHistory::whereIn('song_id', $songIds)
            ->where('played_at', '>=', $thisMonth)
            ->count();

        $lastMonthStreams = PlayHistory::whereIn('song_id', $songIds)
            ->whereBetween('played_at', [$lastMonth, $thisMonth])
            ->count();

        return $this->calculateGrowthPercentage($currentStreams, $lastMonthStreams);
    }

    /**
     * Calculate generic growth rate
     */
    private function getGrowthRate($artist, $songIds, $type, $thisMonth, $lastMonth, $twoMonthsAgo)
    {
        if ($type === 'royalties') {
            return $this->getStreamsGrowth($songIds, $thisMonth, $lastMonth, $twoMonthsAgo);
        }
        return 0;
    }

    /**
     * Calculate growth percentage
     */
    private function calculateGrowthPercentage($current, $previous)
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }
        return round((($current - $previous) / $previous) * 100, 1);
    }

    /**
     * Get store statistics
     */
    private function getStoreStats($artist)
    {
        $hasStore = DB::table('stores')
            ->where('owner_type', 'App\\Models\\Artist')
            ->where('owner_id', $artist->id)
            ->exists();

        if (!$hasStore) {
            return [
                'has_store' => false,
                'total_orders' => 0,
                'pending_orders' => 0,
                'total_products' => 0,
            ];
        }

        $storeId = DB::table('stores')
            ->where('owner_type', 'App\\Models\\Artist')
            ->where('owner_id', $artist->id)
            ->value('id');

        return [
            'has_store' => true,
            'store_id' => $storeId,
            'total_orders' => DB::table('orders')->where('store_id', $storeId)->count(),
            'pending_orders' => DB::table('orders')
                ->where('store_id', $storeId)
                ->whereIn('status', ['pending', 'processing'])
                ->count(),
            'total_products' => DB::table('store_products')->where('store_id', $storeId)->count(),
        ];
    }

    /**
     * Get top selling products
     */
    private function getTopProducts($artist)
    {
        $storeId = DB::table('stores')
            ->where('owner_type', 'App\\Models\\Artist')
            ->where('owner_id', $artist->id)
            ->value('id');

        if (!$storeId) {
            return collect([]);
        }

        return DB::table('store_products')
            ->select(
                'store_products.*',
                DB::raw('COUNT(order_items.id) as sales_count'),
                DB::raw('SUM(order_items.quantity) as total_sold')
            )
            ->leftJoin('order_items', 'store_products.id', '=', 'order_items.product_id')
            ->where('store_products.store_id', $storeId)
            ->groupBy('store_products.id')
            ->orderByDesc('sales_count')
            ->limit(5)
            ->get();
    }

    /**
     * Determine event status based on ticket sales
     */
    private function getEventStatus($sold, $total)
    {
        if ($total == 0) return 'ON SALE';
        
        $percentage = ($sold / $total) * 100;
        
        if ($percentage >= 90) return 'SELLING FAST';
        if ($percentage >= 70) return 'ALMOST FULL';
        if ($percentage >= 50) return 'HALF SOLD';
        
        return 'ON SALE';
    }
}