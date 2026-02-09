<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Services\CrossModuleRevenueService;
use App\Models\Event;
use App\Models\Artist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ArtistDashboardController extends Controller
{
    protected CrossModuleRevenueService $revenueService;

    public function __construct(CrossModuleRevenueService $revenueService)
    {
        $this->middleware('auth')->except(['slugBasedDashboard']);
        $this->revenueService = $revenueService;
    }

    /**
     * Handle slug-based dashboard URL (e.g., /lyrical-jersey/dashboard)
     * Redirects to the appropriate dashboard based on ownership
     */
    public function slugBasedDashboard(Request $request, string $artistSlug)
    {
        // Find the artist by slug
        $artist = Artist::where('slug', $artistSlug)->first();
        
        if (!$artist) {
            abort(404, 'Artist not found');
        }
        
        $user = Auth::user();
        
        // If not logged in, redirect to artist public page
        if (!$user) {
            return redirect()->route('frontend.artist.show', $artist);
        }
        
        // If the user owns this artist profile, show their dashboard
        if ($artist->user_id === $user->id) {
            return $this->index($request);
        }
        
        // Otherwise, redirect to the artist's public page
        return redirect()->route('frontend.artist.show', $artist);
    }

    /**
     * Show the unified artist dashboard
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Check if user has an artist profile
        if (!$user->artist) {
            return redirect()->route('frontend.artist.business.setup')
                ->with('error', 'Please complete your artist profile setup first.');
        }
        
        $period = $request->get('period', 'monthly');

        // Get comprehensive revenue data
        $rawRevenueData = $this->revenueService->calculateTotalUserRevenue($user);
        $report = $this->revenueService->generateCrossModuleReport($user, $period);

        // Get module-specific data
        $musicStats = $this->getMusicStatistics($user);
        $podcastStats = $this->getPodcastStatistics($user);
        $storeStats = $this->getStoreStatistics($user);
        $saccoStats = $this->getSaccoStatistics($user);

        // Date ranges for growth calculations
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        
        // Calculate growth percentages
        $musicGrowth = $this->calculateMusicGrowth($user, $thisMonth, $lastMonth);
        $merchGrowth = $this->calculateMerchGrowth($user, $thisMonth, $lastMonth);
        $ticketData = $this->getTicketSalesData($user);

        // Transform revenue data to match view expectations
        $revenueData = [
            'music_royalties' => $rawRevenueData['music']['total'] ?? 0,
            'music_growth' => $musicGrowth,
            'merch_sales' => $rawRevenueData['store']['total'] ?? 0,
            'merch_growth' => $merchGrowth,
            'ticket_sales' => $ticketData['sales'],
            'ticket_growth' => $ticketData['growth'],
            'total_earnings' => $rawRevenueData['total'] ?? 0,
        ];

        // Get recent activities across all modules
        $recentActivities = $this->getRecentActivities($user);

        // Get earnings timeline
        $earningsTimeline = $this->getEarningsTimeline($user, $period);
        
        // Get recent tracks for dashboard display
        $recentTracks = $this->getRecentTracks($user);

        // Get listener stats (from user dashboard) - artist's own listening activity
        $listenerStats = $this->getListenerStats($user);
        
        // Get recently played by this user
        $recentlyPlayed = $this->getRecentlyPlayed($user);
        
        // Get wallet and earnings data for the dashboard
        $walletData = $this->getWalletData($user);
        
        // Get upcoming events for the artist
        $upcomingEvents = $this->getUpcomingEvents($user);
        
        // Get chart data (not hardcoded)
        $chartData = $this->getChartData($user, $period);

        return view('frontend.artist.dashboard', compact(
            'revenueData',
            'report',
            'musicStats',
            'podcastStats',
            'storeStats',
            'saccoStats',
            'recentActivities',
            'walletData',
            'upcomingEvents',
            'chartData',
            'earningsTimeline',
            'recentTracks',
            'listenerStats',
            'recentlyPlayed',
            'period'
        ));
    }

    /**
     * Get music module statistics
     */
    protected function getMusicStatistics($user): array
    {
        $songs = $user->songs()->where('songs.status', 'published')->get();
        $recentSongs = $user->songs()
            ->where('songs.status', 'published')
            ->where('songs.created_at', '>=', now()->subMonth())
            ->count();

        $topSong = $user->songs()
            ->where('songs.status', 'published')
            ->orderBy('play_count', 'desc')
            ->first();
            
        // Calculate total streams (plays)
        $totalStreams = $songs->sum('play_count');
        
        // Calculate streams growth (compare last 30 days to previous 30 days)
        $lastMonthStreams = $user->songs()
            ->where('songs.status', 'published')
            ->where('songs.created_at', '>=', now()->subDays(30))
            ->sum('play_count');
        $previousMonthStreams = $user->songs()
            ->where('songs.status', 'published')
            ->whereBetween('songs.created_at', [now()->subDays(60), now()->subDays(30)])
            ->sum('play_count');
        $streamsGrowth = $previousMonthStreams > 0 
            ? (($lastMonthStreams - $previousMonthStreams) / $previousMonthStreams) * 100 
            : 0;

        return [
            'total_songs' => $songs->count(),
            'published_tracks' => $songs->count(),
            'total_plays' => $totalStreams,
            'total_streams' => $totalStreams,
            'streams_growth' => round($streamsGrowth, 1),
            'total_downloads' => $songs->sum('download_count'),
            'recent_uploads' => $recentSongs,
            'upcoming_events' => $this->getUpcomingEventsCount($user),
            'top_song' => $topSong,
            'avg_rating' => $songs->avg('rating') ?? 0,
        ];
    }

    /**
     * Get podcast module statistics
     */
    protected function getPodcastStatistics($user): array
    {
        if (!method_exists($user, 'ownedPodcasts')) {
            return [
                'enabled' => false,
                'message' => 'Podcast module not available'
            ];
        }

        $podcasts = $user->ownedPodcasts ?? collect();
        $totalSubscribers = $podcasts->sum('subscriber_count');
        $totalEpisodes = $podcasts->sum('total_episodes');
        $totalListens = $podcasts->sum('total_listens');

        $topPodcast = $podcasts->sortByDesc('subscriber_count')->first();

        return [
            'enabled' => true,
            'total_podcasts' => $podcasts->count(),
            'total_episodes' => $totalEpisodes,
            'total_subscribers' => $totalSubscribers,
            'total_listens' => $totalListens,
            'top_podcast' => $topPodcast,
            'recent_episodes' => $this->getRecentEpisodes($user),
        ];
    }

    /**
     * Get store module statistics
     */
    protected function getStoreStatistics($user): array
    {
        // Check if user has a store
        $store = \App\Modules\Store\Models\Store::where('user_id', $user->id)->first();

        if (!$store) {
            return [
                'enabled' => false,
                'has_store' => false,
                'message' => 'No store created yet',
                'top_products' => collect(),
            ];
        }

        // Get store products with pricing
        $products = \App\Modules\Store\Models\Product::where('store_id', $store->id)
            ->where('status', 'active')
            ->with('pricing')
            ->get();
        
        // Calculate statistics from orders
        $totalSales = $store->total_orders ?? 0;
        $totalRevenue = $store->total_sales_ugx ?? 0;

        // Get top products by view_count
        $topProducts = $products->sortByDesc('view_count')->take(5);
        $topProduct = $topProducts->first();

        return [
            'enabled' => true,
            'has_store' => true,
            'store' => $store,
            'store_id' => $store->id,
            'store_name' => $store->name,
            'store_status' => $store->status,
            'total_products' => $products->count(),
            'total_sales' => $totalSales,
            'total_orders' => $totalSales, // Alias for consistency
            'total_revenue' => $totalRevenue,
            'top_product' => $topProduct,
            'top_products' => $topProducts,
            'average_rating' => $store->average_rating ?? 0,
        ];
    }

    /**
     * Get SACCO module statistics
     */
    protected function getSaccoStatistics($user): array
    {
        if (!method_exists($user, 'saccoMembership')) {
            return [
                'enabled' => false,
                'message' => 'SACCO module not available'
            ];
        }

        $membership = $user->saccoMembership;

        if (!$membership) {
            return [
                'enabled' => true,
                'is_member' => false,
                'message' => 'Not a SACCO member'
            ];
        }

        $activeLoan = $membership->activeLoan ?? null;

        return [
            'enabled' => true,
            'is_member' => true,
            'membership_status' => $membership->status,
            'member_since' => $membership->created_at,
            'shares_owned' => $membership->shares_owned ?? 0,
            'total_contributions' => $membership->total_contributions ?? 0,
            'has_active_loan' => $activeLoan !== null,
            'loan_balance' => $activeLoan ? $activeLoan->remaining_balance : 0,
            'monthly_payment' => $activeLoan ? $activeLoan->monthly_payment : 0,
        ];
    }

    /**
     * Get recent activities across all modules
     */
    protected function getRecentActivities($user): array
    {
        $activities = [];

        // Recent music activities (Songs belong to Artist, not User)
        if ($user->artist) {
            $recentSongs = $user->artist->songs()
                ->where('songs.created_at', '>=', now()->subWeek())
                ->orderBy('songs.created_at', 'desc')
                ->limit(5)
                ->get();

            foreach ($recentSongs as $song) {
                $activities[] = [
                    'type' => 'music_upload',
                    'module' => 'Music',
                    'title' => "Uploaded '{$song->title}'",
                    'date' => $song->created_at,
                    'icon' => 'music-note',
                    'url' => route('frontend.songs.show', $song),
                ];
            }
        }

        // Recent podcast activities
        if (method_exists($user, 'ownedPodcasts')) {
            $recentPodcasts = $user->ownedPodcasts()
                ->where('podcasts.created_at', '>=', now()->subWeek())
                ->orderBy('podcasts.created_at', 'desc')
                ->limit(3)
                ->get();

            foreach ($recentPodcasts as $podcast) {
                $activities[] = [
                    'type' => 'podcast_created',
                    'module' => 'Podcast',
                    'title' => "Created podcast '{$podcast->title}'",
                    'date' => $podcast->created_at,
                    'icon' => 'microphone',
                    'url' => route('frontend.podcasts.show', $podcast),
                ];
            }
        }

        // Recent store activities
        if (method_exists($user, 'storeProducts')) {
            $recentProducts = $user->storeProducts()
                ->where('store_products.created_at', '>=', now()->subWeek())
                ->orderBy('store_products.created_at', 'desc')
                ->limit(3)
                ->get();

            foreach ($recentProducts as $product) {
                $activities[] = [
                    'type' => 'product_listed',
                    'module' => 'Store',
                    'title' => "Listed '{$product->name}'",
                    'date' => $product->created_at,
                    'icon' => 'shopping-bag',
                    'url' => route('frontend.store.products.show', $product),
                ];
            }
        }

        // Sort by date and limit
        usort($activities, function ($a, $b) {
            return $b['date'] <=> $a['date'];
        });

        return array_slice($activities, 0, 10);
    }

    /**
     * Get earnings timeline for charts
     */
    protected function getEarningsTimeline($user, string $period): array
    {
        $days = match ($period) {
            'weekly' => 7,
            'monthly' => 30,
            'quarterly' => 90,
            'yearly' => 365,
            default => 30,
        };

        $timeline = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $dateKey = $date->format('Y-m-d');

            // This would be calculated from actual earnings data
            // For now, using sample data structure
            $timeline[] = [
                'date' => $dateKey,
                'music' => 0, // Calculate from play_history, downloads
                'podcast' => 0, // Calculate from podcast_listens, subscriptions
                'store' => 0, // Calculate from store orders
                'total' => 0,
            ];
        }

        return $timeline;
    }

    /**
     * Get recent podcast episodes
     */
    protected function getRecentEpisodes($user): array
    {
        if (!method_exists($user, 'ownedPodcasts')) {
            return [];
        }

        // This would use proper episode relationship
        return [];
    }

    /**
     * Get recent store orders
     */
    protected function getRecentOrders($user): array
    {
        if (!method_exists($user, 'storeOrders')) {
            return [];
        }

        // This would use proper order relationship
        return [];
    }

    /**
     * API endpoint for dashboard data
     */
    public function apiData(Request $request)
    {
        $user = Auth::user();
        $period = $request->get('period', 'monthly');

        $data = [
            'revenue' => $this->revenueService->calculateTotalUserRevenue($user),
            'report' => $this->revenueService->generateCrossModuleReport($user, $period),
            'music' => $this->getMusicStatistics($user),
            'podcast' => $this->getPodcastStatistics($user),
            'store' => $this->getStoreStatistics($user),
            'sacco' => $this->getSaccoStatistics($user),
            'activities' => $this->getRecentActivities($user),
            'timeline' => $this->getEarningsTimeline($user, $period),
        ];

        return response()->json($data);
    }

    /**
     * Update dashboard preferences
     */
    public function updatePreferences(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'default_period' => 'in:weekly,monthly,quarterly,yearly',
            'show_modules' => 'array',
            'show_modules.*' => 'in:music,podcast,store,sacco',
            'chart_type' => 'in:line,bar,area',
        ]);

        // Save preferences to user preferences or settings table
        $preferences = [
            'dashboard' => [
                'default_period' => $request->get('default_period', 'monthly'),
                'show_modules' => $request->get('show_modules', ['music', 'podcast', 'store', 'sacco']),
                'chart_type' => $request->get('chart_type', 'line'),
            ]
        ];

        // This would save to user_preferences table
        // $user->updatePreferences($preferences);

        return response()->json(['success' => true]);
    }

    /**
     * Export dashboard data
     */
    public function export(Request $request)
    {
        $user = Auth::user();
        $period = $request->get('period', 'monthly');
        $format = $request->get('format', 'csv');

        $report = $this->revenueService->generateCrossModuleReport($user, $period);

        if ($format === 'pdf') {
            // Generate PDF report
            return $this->generatePdfReport($report);
        }

        // Generate CSV report
        return $this->generateCsvReport($report);
    }

    /**
     * Generate PDF report
     */
    protected function generatePdfReport(array $report)
    {
        // This would use a PDF library like DomPDF or similar
        return response()->json(['message' => 'PDF export not yet implemented']);
    }

    /**
     * Generate CSV report
     */
    protected function generateCsvReport(array $report)
    {
        $filename = 'artist-report-' . now()->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($report) {
            $file = fopen('php://output', 'w');

            // CSV headers
            fputcsv($file, [
                'Module',
                'Revenue',
                'Percentage',
                'Details'
            ]);

            // CSV data
            fputcsv($file, [
                'Music',
                $report['revenue']['music']['total'],
                $report['revenue']['breakdown']['music_percentage'] . '%',
                'Streams: ' . $report['revenue']['music']['stats']['total_streams']
            ]);

            fputcsv($file, [
                'Podcast',
                $report['revenue']['podcast']['total'],
                $report['revenue']['breakdown']['podcast_percentage'] . '%',
                'Subscribers: ' . $report['revenue']['podcast']['stats']['total_subscribers']
            ]);

            fputcsv($file, [
                'Store',
                $report['revenue']['store']['total'],
                $report['revenue']['breakdown']['store_percentage'] . '%',
                'Sales: ' . $report['revenue']['store']['stats']['total_sales']
            ]);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
    
    /**
     * Get recent tracks for dashboard display
     */
    protected function getRecentTracks($user)
    {
        return $user->songs()
            ->where('songs.status', 'published')
            ->orderBy('songs.created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($song) {
                return [
                    'title' => $song->title,
                    'artwork_url' => $song->artwork_url ?? $song->cover_image,
                    'type' => $song->type ?? 'Single',
                    'created_at' => $song->created_at,
                    'streams_this_month' => $song->play_count ?? 0, // You might want to add a proper monthly count
                    'slug' => $song->slug ?? $song->id,
                ];
            });
    }

    /**
     * Calculate music royalties growth percentage
     */
    protected function calculateMusicGrowth($user, Carbon $thisMonth, Carbon $lastMonth): float
    {
        try {
            $songs = $user->songs()->pluck('songs.id');
            
            // If no songs, return 0 growth
            if ($songs->isEmpty()) {
                return 0;
            }
            
            // Get play counts for current period vs previous period
            $currentPlays = DB::table('play_histories')
                ->whereIn('song_id', $songs)
                ->where('played_at', '>=', $thisMonth)
                ->count();
                
            $previousPlays = DB::table('play_histories')
                ->whereIn('song_id', $songs)
                ->whereBetween('played_at', [$lastMonth, $thisMonth])
                ->count();

            return $previousPlays > 0 
                ? round((($currentPlays - $previousPlays) / $previousPlays) * 100, 1)
                : ($currentPlays > 0 ? 100 : 0);
        } catch (\Exception $e) {
            // Log the error but don't crash the dashboard
            \Log::warning('Error calculating music growth: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Calculate merch sales growth percentage
     */
    protected function calculateMerchGrowth($user, Carbon $thisMonth, Carbon $lastMonth): float
    {
        try {
            $store = $user->store;
            
            if (!$store) {
                return 0;
            }

            $currentSales = DB::table('orders')
                ->where('store_id', $store->id)
                ->whereIn('status', ['completed', 'delivered'])
                ->where('created_at', '>=', $thisMonth)
                ->sum('total_amount') ?? 0;

            $previousSales = DB::table('orders')
                ->where('store_id', $store->id)
                ->whereIn('status', ['completed', 'delivered'])
                ->whereBetween('created_at', [$lastMonth, $thisMonth])
                ->sum('total_amount') ?? 0;

            return $previousSales > 0 
                ? round((($currentSales - $previousSales) / $previousSales) * 100, 1)
                : ($currentSales > 0 ? 100 : 0);
        } catch (\Exception $e) {
            // Log the error but don't crash the dashboard
            \Log::warning('Error calculating merch growth: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get ticket sales data with growth
     */
    protected function getTicketSalesData($user): array
    {
        $artist = $user->artist;
        
        if (!$artist) {
            return ['sales' => 0, 'growth' => 0];
        }

        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        try {
            // Get total ticket sales using event_ticket_types table
            $totalSales = DB::table('event_ticket_types')
                ->join('events', 'event_ticket_types.event_id', '=', 'events.id')
                ->where('events.organizer_id', $artist->user_id)
                ->where('event_ticket_types.is_active', true)
                ->sum(DB::raw('COALESCE(event_ticket_types.price_ugx * event_ticket_types.quantity_sold, 0)')) ?? 0;

            // Get current period sales (tickets sold this month)
            $currentSales = DB::table('event_ticket_types')
                ->join('events', 'event_ticket_types.event_id', '=', 'events.id')
                ->where('events.organizer_id', $artist->user_id)
                ->where('event_ticket_types.is_active', true)
                ->where('events.created_at', '>=', $thisMonth)
                ->sum(DB::raw('COALESCE(event_ticket_types.price_ugx * event_ticket_types.quantity_sold, 0)')) ?? 0;

            // Get previous period sales
            $previousSales = DB::table('event_ticket_types')
                ->join('events', 'event_ticket_types.event_id', '=', 'events.id')
                ->where('events.organizer_id', $artist->user_id)
                ->where('event_ticket_types.is_active', true)
                ->whereBetween('events.created_at', [$lastMonth, $thisMonth])
                ->sum(DB::raw('COALESCE(event_ticket_types.price_ugx * event_ticket_types.quantity_sold, 0)')) ?? 0;

            $growth = $previousSales > 0 
                ? round((($currentSales - $previousSales) / $previousSales) * 100, 1)
                : ($currentSales > 0 ? 100 : 0);

            return ['sales' => $totalSales, 'growth' => $growth];
        } catch (\Exception $e) {
            // If table doesn't exist or query fails, return zeros
            return ['sales' => 0, 'growth' => 0];
        }
    }

    /**
     * Get upcoming events count for the artist
     */
    protected function getUpcomingEventsCount($user): int
    {
        $artist = $user->artist;
        
        if (!$artist || !class_exists(Event::class)) {
            return 0;
        }

        return Event::where('organizer_id', $artist->user_id)
            ->where('starts_at', '>=', now())
            ->count();
    }

    /**
     * Get listener statistics for the artist (their own listening activity)
     */
    protected function getListenerStats($user): array
    {
        $playHistory = \App\Models\PlayHistory::where('user_id', $user->id);

        return [
            'total_plays' => $playHistory->count(),
            'unique_songs' => $playHistory->clone()->distinct('song_id')->count('song_id'),
            'total_listening_time' => $playHistory->clone()->sum('duration_played_seconds'),
            'following_count' => $user->following()->count(),
            'followers_count' => $user->artist ? $user->artist->followers()->count() : 0,
        ];
    }

    /**
     * Get recently played tracks by the artist (their own listening)
     */
    protected function getRecentlyPlayed($user)
    {
        return \Illuminate\Support\Facades\Cache::remember("artist.dashboard.recently_played.{$user->id}", 300, function () use ($user) {
            $recentTracks = \App\Models\PlayHistory::where('user_id', $user->id)
                ->with(['song.artist'])
                ->orderBy('played_at', 'desc')
                ->limit(5)
                ->get();

            return $recentTracks->map(function ($history) {
                $song = $history->song;
                if (!$song) return null;

                return [
                    'id' => $song->id,
                    'title' => $song->title,
                    'artist_name' => $song->artist->stage_name ?? 'Unknown Artist',
                    'artwork_url' => $song->artwork_url,
                    'duration_formatted' => gmdate('i:s', $song->duration ?? 0),
                    'last_played' => $history->played_at->diffForHumans(),
                ];
            })->filter();
        });
    }
    
    /**
     * Get comprehensive wallet and earnings data for the dashboard
     */
    protected function getWalletData($user): array
    {
        $artist = $user->artist;
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        
        // Get wallet balance (UGX)
        $walletBalance = $user->ugx_balance ?? 0;
        
        // Get total plays for revenue calculation
        $totalPlays = $artist ? $artist->songs()->sum('play_count') : 0;
        
        // Average revenue per stream (mix of premium and free users)
        $avgRevenuePerStream = 7; // UGX average
        
        // Calculate streaming revenue from artist_revenues table or estimate
        $actualStreamingRevenue = $artist ? \App\Models\ArtistRevenue::where('artist_id', $artist->id)
            ->where('revenue_type', 'stream')
            ->sum('net_amount') : 0;
        $streamingRevenueTotal = $actualStreamingRevenue > 0 
            ? $actualStreamingRevenue 
            : ($totalPlays * $avgRevenuePerStream);
        
        // Revenue this month
        $revenueThisMonth = $artist ? \App\Models\ArtistRevenue::where('artist_id', $artist->id)
            ->where('revenue_date', '>=', $thisMonth)
            ->sum('net_amount') : 0;
        
        // Revenue last month for comparison
        $revenueLastMonth = $artist ? \App\Models\ArtistRevenue::where('artist_id', $artist->id)
            ->whereBetween('revenue_date', [$lastMonth, $thisMonth])
            ->sum('net_amount') : 0;
        
        // Calculate monthly growth percentage
        $monthlyGrowth = $revenueLastMonth > 0 
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1) 
            : ($revenueThisMonth > 0 ? 100 : 0);
        
        // Recent earnings transactions
        $recentEarnings = \App\Models\CreditTransaction::where('user_id', $user->id)
            ->whereIn('type', ['stream', 'earn', 'earned'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        // Pending payout (balance available for withdrawal)
        $pendingPayout = $walletBalance;
        
        return [
            'wallet_balance' => $walletBalance,
            'streaming_revenue_total' => $streamingRevenueTotal,
            'revenue_this_month' => $revenueThisMonth,
            'revenue_last_month' => $revenueLastMonth,
            'monthly_growth' => $monthlyGrowth,
            'total_plays' => $totalPlays,
            'avg_revenue_per_stream' => $avgRevenuePerStream,
            'recent_earnings' => $recentEarnings,
            'pending_payout' => $pendingPayout,
        ];
    }
    
    /**
     * Get upcoming events for the artist with detailed info
     */
    protected function getUpcomingEvents($user): \Illuminate\Support\Collection
    {
        $artist = $user->artist;
        
        if (!$artist || !class_exists(Event::class)) {
            return collect();
        }
        
        return Event::where('organizer_id', $artist->user_id)
            ->where('starts_at', '>=', now())
            ->orderBy('starts_at', 'asc')
            ->limit(5)
            ->get()
            ->map(function ($event) {
                // Calculate ticket sales
                $totalTickets = 0;
                $soldTickets = 0;
                
                if (method_exists($event, 'ticketTypes')) {
                    $ticketTypes = $event->ticketTypes;
                    $totalTickets = $ticketTypes->sum('quantity');
                    $soldTickets = $ticketTypes->sum('quantity_sold');
                }
                
                $percentSold = $totalTickets > 0 ? round(($soldTickets / $totalTickets) * 100) : 0;
                
                // Determine status label
                $statusLabel = 'ON SALE';
                if ($percentSold >= 90) {
                    $statusLabel = 'SELLING FAST';
                } elseif ($percentSold >= 70) {
                    $statusLabel = 'ALMOST FULL';
                }
                
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'slug' => $event->slug,
                    'venue' => $event->venue ?? $event->location,
                    'city' => $event->city,
                    'starts_at' => $event->starts_at,
                    'formatted_date' => $event->starts_at->format('M d'),
                    'formatted_time' => $event->starts_at->format('g:i A'),
                    'total_tickets' => $totalTickets,
                    'sold_tickets' => $soldTickets,
                    'percent_sold' => $percentSold,
                    'status_label' => $statusLabel,
                ];
            });
    }
    
    /**
     * Get chart data based on actual database records
     */
    protected function getChartData($user, string $period = 'weekly'): array
    {
        $artist = $user->artist;
        $days = $period === 'monthly' ? 30 : 7;
        
        $streamData = [];
        $revenueData = [];
        $labels = [];
        
        // Get song IDs for this artist
        $songIds = $artist ? $artist->songs()->pluck('songs.id') : collect();
        
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dateKey = $date->format('Y-m-d');
            $labels[] = $date->format('M d');
            
            // Get stream count for this day
            $dayStreams = 0;
            if ($songIds->isNotEmpty()) {
                $dayStreams = DB::table('play_histories')
                    ->whereIn('song_id', $songIds)
                    ->whereDate('played_at', $date)
                    ->count();
            }
            $streamData[] = $dayStreams;
            
            // Get revenue for this day
            $dayRevenue = 0;
            if ($artist) {
                $dayRevenue = \App\Models\ArtistRevenue::where('artist_id', $artist->id)
                    ->whereDate('revenue_date', $date)
                    ->sum('net_amount');
            }
            $revenueData[] = (float) $dayRevenue;
        }
        
        // Calculate heights for bar chart visualization (normalize to 0-100)
        $maxStreams = max($streamData) ?: 1;
        $streamHeights = array_map(function ($value) use ($maxStreams) {
            return round(($value / $maxStreams) * 100);
        }, $streamData);
        
        return [
            'labels' => $labels,
            'streams' => $streamData,
            'revenue' => $revenueData,
            'stream_heights' => $streamHeights,
            'period' => $period,
        ];
    }
}