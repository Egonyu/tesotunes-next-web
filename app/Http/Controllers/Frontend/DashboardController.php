<?php

namespace App\Http\Controllers\Frontend;

use Carbon\Carbon;
use App\Models\Song;
use App\Models\Event;
use App\Models\Album;
use App\Models\Activity;
use App\Models\PlayHistory;
use App\Modules\Store\Models\Product;
use Illuminate\Http\Request;
use App\Services\FeedService;
use App\Services\ActivityService;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use App\Services\FeedPreferenceService;

class DashboardController extends Controller
{
    protected FeedService $feedService;

    public function __construct(FeedService $feedService)
    {
        $this->feedService = $feedService;
    }

    public function index(Request $request)
    {
        // User dashboard - requires authentication
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        // Redirect artists to the artist dashboard
        if ($user->hasAnyRole(['artist', 'admin', 'super_admin']) && $user->artist) {
            return redirect()->route('frontend.artist.dashboard');
        }

        // Get user's play statistics
        $stats = $this->getUserStats($user);

        // Get recently played tracks
        $recentlyPlayed = $this->getRecentlyPlayed($user);

        // Get top albums
        $topAlbums = $this->getTopAlbums();

        // Get upcoming events
        $upcomingEvents = $this->getUpcomingEvents();

        // Get top products
        $topProducts = $this->getTopProducts();

        return view('frontend.dashboard', compact(
            'stats',
            'recentlyPlayed',
            'topAlbums',
            'upcomingEvents',
            'topProducts'
        ));
    }

    /**
     * Get user statistics
     */
    protected function getUserStats($user)
    {
        return Cache::remember("dashboard.stats.{$user->id}", 300, function () use ($user) {
            $playHistory = PlayHistory::where('user_id', $user->id);

            return [
                'total_plays' => $playHistory->count(),
                'unique_songs' => $playHistory->distinct('song_id')->count('song_id'),
                'total_listening_time' => $playHistory->sum('duration_played_seconds'),
                'following_count' => $user->following()->count(),
            ];
        });
    }

    /**
     * Get recently played tracks
     */
    protected function getRecentlyPlayed($user)
    {
        return Cache::remember("dashboard.recently_played.{$user->id}", 300, function () use ($user) {
            $recentTracks = PlayHistory::where('user_id', $user->id)
                ->with(['song.artist'])
                ->orderBy('played_at', 'desc')
                ->limit(10)
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
                    'progress_percent' => $history->duration_played_seconds && $song->duration 
                        ? min(100, ($history->duration_played_seconds / $song->duration) * 100)
                        : 0,
                ];
            })->filter();
        });
    }

    /**
     * Get top albums
     */
    protected function getTopAlbums()
    {
        return Cache::remember('dashboard.top_albums', 600, function () {
            return \App\Models\Album::where('status', 'published')
                ->with(['artist'])
                ->withCount('songs')
                ->orderBy('play_count', 'desc')
                ->limit(12)
                ->get();
        });
    }

    /**
     * Get upcoming events
     */
    protected function getUpcomingEvents()
    {
        return Cache::remember('dashboard.upcoming_events', 600, function () {
            return Event::where('starts_at', '>=', Carbon::now())
                ->where('status', 'published')
                ->orderBy('starts_at', 'asc')
                ->limit(5)
                ->get();
        });
    }

    /**
     * Get top products
     */
    protected function getTopProducts()
    {
        return Cache::remember('dashboard.top_products', 600, function () {
            return Product::where('status', 'active')
                ->whereHas('inventory', function ($query) {
                    $query->where('is_in_stock', 1)
                          ->where('stock_quantity', '>', 0);
                })
                ->orderBy('view_count', 'desc')
                ->limit(8)
                ->get();
        });
    }

    /**
     * Hybrid dashboard for timeline view
     */
    public function timeline(Request $request)
    {
        return $this->hybridDashboard($request);
    }


    /**
     * Hybrid dashboard with activity feed (Phase 3 implementation)
     * Now using FeedService for intelligent personalized feed
     * Accessible to both guests and authenticated users
     */
    protected function hybridDashboard(Request $request)
    {
        $user = Auth::user();
        $page = $request->get('page', 1);

        // For guests, show public content only
        if (!$user) {
            $forYouFeed = $this->getPublicFeed($page);
            $followingFeed = collect();
            $eventsFeed = $this->getPublicEvents($page);
        } else {
            // Phase 2 Integration: Use FeedService for personalized "For You" feed
            $forYouFeed = $this->feedService
                ->forUser($user)
                ->withFollowedArtists()
                ->withFriendActivity()
                ->withPlatformEvents()
                ->withForumActivity()      // NEW: Forum integration
                // ->withPollActivity()        // Temporarily disabled until Poll model is properly set up
                // ->withRecommendations()     // Temporarily disabled due to database schema issues
                ->perPage(20)
                ->paginate($page);

            // Get activities from following only
            $followingFeed = $this->feedService
                ->forUser($user)
                ->withFollowedArtists()
                ->perPage(20)
                ->paginate($page);

            // Get event-related activities
            $eventsFeed = $this->feedService
                ->forUser($user)
                ->withPlatformEvents()
                ->perPage(20)
                ->paginate($page);
        }

        // Get trending songs with caching (5 minutes)
        $trendingNow = Cache::remember('dashboard.trending.sidebar', 300, function () {
            return Song::where('status', 'approved')
                ->where('distribution_status', 'distributed')
                ->with(['artist:id,stage_name,avatar'])
                ->select('id', 'title', 'artist_id', 'artwork', 'play_count')
                ->orderBy('play_count', 'desc')
                ->limit(5)
                ->get();
        });

        // Get trending songs for discover tab with caching (5 minutes)
        $trendingSongs = Cache::remember('dashboard.trending.discover', 300, function () {
            return Song::where('status', 'approved')
                ->where('distribution_status', 'distributed')
                ->with(['artist:id,stage_name,avatar'])
                ->select('id', 'title', 'artist_id', 'artwork', 'play_count')
                ->orderBy('play_count', 'desc')
                ->limit(12)
                ->get();
        });

        // Get new releases with caching (10 minutes)
        $newReleases = Cache::remember('dashboard.new.releases', 600, function () {
            return Song::where('status', 'approved')
                ->where('distribution_status', 'distributed')
                ->where('created_at', '>=', Carbon::now()->subDays(7))
                ->with(['artist:id,stage_name,avatar'])
                ->select('id', 'title', 'artist_id', 'artwork', 'created_at')
                ->orderBy('created_at', 'desc')
                ->limit(12)
                ->get();
        });

        // Get upcoming events with caching (15 minutes)
        $upcomingEvents = Cache::remember('dashboard.upcoming.events', 900, function () {
            return Event::where('starts_at', '>=', Carbon::now())
                ->where('status', 'published')
                ->select('id', 'title', 'starts_at', 'venue_name', 'cover_image', 'city')
                ->orderBy('starts_at', 'asc')
                ->limit(5)
                ->get();
        });

        // Sidebar stats with user-specific caching (5 minutes) or public stats for guests
        $sidebarStats = $user 
            ? Cache::remember("dashboard.sidebar.stats.{$user->id}", 300, function () use ($user) {
                $today = Carbon::today();
                $weekAgo = Carbon::now()->subWeek();

                // Use single query for today's stats
                $todayStats = PlayHistory::where('user_id', $user->id)
                    ->whereDate('played_at', $today)
                    ->selectRaw('COUNT(*) as plays_count, SUM(duration_played_seconds) as total_seconds')
                    ->first();

                // Use single query for weekly stats
                $weekStats = PlayHistory::where('user_id', $user->id)
                    ->where('played_at', '>=', $weekAgo)
                    ->selectRaw('
                        COUNT(DISTINCT song_id) as unique_songs,
                        SUM(duration_played_seconds) as total_seconds
                    ')
                    ->first();

                // Get unique artists this week (separate query due to join complexity)
                $weekArtists = PlayHistory::where('play_histories.user_id', $user->id)
                    ->join('songs', 'play_histories.song_id', '=', 'songs.id')
                    ->where('play_histories.played_at', '>=', $weekAgo)
                    ->distinct('songs.artist_id')
                    ->count('songs.artist_id');

                return [
                    'plays_today' => $todayStats->plays_count ?? 0,
                    'time_today' => $todayStats->total_seconds ?? 0,
                    'following_count' => $user->following_count,
                    'new_songs_week' => $weekStats->unique_songs ?? 0,
                    'new_artists_week' => $weekArtists,
                    'total_time_week' => $weekStats->total_seconds ?? 0,
                ];
            })
            : [
                'plays_today' => 0,
                'time_today' => 0,
                'following_count' => 0,
                'new_songs_week' => 0,
                'new_artists_week' => 0,
                'total_time_week' => 0,
            ];

        return view('frontend.dashboard-hybrid', [
            'forYouFeed' => $forYouFeed,
            'followingFeed' => $followingFeed,
            'eventsFeed' => $eventsFeed,
            'trendingNow' => $trendingNow,
            'trendingSongs' => $trendingSongs,
            'newReleases' => $newReleases,
            'upcomingEvents' => $upcomingEvents,
            'sidebarStats' => $sidebarStats,
        ]);
    }

    /**
     * Toggle dashboard (no longer used - timeline always uses hybrid)
     */
    public function toggleDashboard(Request $request)
    {
        return redirect()->route('frontend.timeline')->with('success',
            'Timeline dashboard updated'
        );
    }

    /**
     * Get feed data via AJAX for infinite scrolling
     */
    public function getFeed(Request $request)
    {
        $user = Auth::user();
        $tab = $request->get('tab', 'for-you');
        $page = $request->get('page', 1);

        // Handle real-time update checks (only for authenticated users)
        if ($request->has('check_updates') && $user) {
            return $this->checkForUpdates($request, $user);
        }

        // For guests, return public feed
        if (!$user) {
            $feed = match($tab) {
                'events' => $this->getPublicEvents($page),
                default => $this->getPublicFeed($page),
            };
        } else {
            $feed = match($tab) {
                'following' => $this->feedService
                    ->forUser($user)
                    ->withFollowedArtists()
                    ->perPage(20)
                    ->paginate($page),

                'events' => $this->feedService
                    ->forUser($user)
                    ->withPlatformEvents()
                    ->perPage(20)
                    ->paginate($page),

                'forum' => $this->feedService
                    ->forUser($user)
                    ->withForumActivity()
                    ->withPollActivity()
                    ->perPage(20)
                    ->paginate($page),

                default => $this->feedService
                    ->forUser($user)
                    ->withFollowedArtists()
                    ->withFriendActivity()
                    ->withPlatformEvents()
                    ->withForumActivity()      // NEW: Forum integration
                    ->withPollActivity()        // NEW: Poll integration
                    ->withRecommendations()
                    ->perPage(20)
                    ->paginate($page),
            };
        }

        return response()->json([
            'success' => true,
            'items' => collect($feed->items())->map(function($activity) {
                return [
                    'id' => $activity->id,
                    'action' => $activity->action,
                    'actor' => [
                        'id' => $activity->actor->id,
                        'name' => $activity->actor->name,
                        'avatar' => $activity->actor->avatar_url ?? null,
                    ],
                    'subject' => $activity->subject,
                    'created_at' => $activity->created_at->diffForHumans(),
                    'html' => view('components.activity-card', [
                        'type' => $activity->action,
                        'activity' => $activity
                    ])->render()
                ];
            }),
            'hasMore' => $feed->hasMorePages(),
            'nextPage' => $feed->currentPage() + 1,
        ]);
    }

    /**
     * Check for new updates since timestamp
     */
    private function checkForUpdates(Request $request, $user)
    {
        $since = $request->get('since');
        $sinceDate = $since ? Carbon::createFromTimestamp($since / 1000) : Carbon::now()->subMinutes(5);

        // Check for new activities since the given timestamp
        $newActivitiesCount = Activity::where('created_at', '>', $sinceDate)
            ->where(function($query) use ($user) {
                // Only count activities relevant to this user
                $query->whereIn('actor_id', $user->following()->pluck('followed_id'))
                      ->orWhere('action', 'like', ['new_song', 'new_album', 'platform_event']);
            })
            ->count();

        return response()->json([
            'success' => true,
            'has_updates' => $newActivitiesCount > 0,
            'update_count' => $newActivitiesCount,
            'timestamp' => Carbon::now()->timestamp * 1000
        ]);
    }

    /**
     * Mark activity as "not interested"
     */
    public function notInterested(Request $request)
    {
        $user = Auth::user();
        $activityId = $request->input('activity_id');
        $reason = $request->input('reason');

        // Use FeedPreferenceService to record preference
        $activity = Activity::findOrFail($activityId);
        app(FeedPreferenceService::class)->markNotInterested(
            $user,
            $activity,
            $reason
        );

        return response()->json([
            'success' => true,
            'message' => 'Thanks for your feedback! We\'ll show you less content like this.'
        ]);
    }

    /**
     * Get public feed for guests (trending/recent activities)
     * Enhanced to show diverse content mix: 50% music, 50% community
     */
    protected function getPublicFeed($page = 1)
    {
        $perPage = 20;
        
        // Get diverse public activities with balanced content
        $musicActivities = [
            'uploaded_song',
            'new_song',
            'new_album', 
            'released_album',
            'album_published',
            'distributed_song',
            'verified_artist',
            'artist_milestone',
            'featured_song',
        ];
        
        $communityActivities = [
            'created_forum_topic',
            'featured_discussion',
            'created_poll',
            'closed_poll',
            'user_joined',
            'user_milestone',
        ];
        
        $platformActivities = [
            'platform_event',
            'created_event',
            'award_nomination',
            'store_product_launch',
            'promotion_started',
            'challenge_started',
            'new_release',
        ];
        
        // Combine all public activity types
        $allPublicTypes = array_merge($musicActivities, $communityActivities, $platformActivities);
        
        // Get activities with diversity - use ranking to balance content types
        $activities = Activity::whereIn('activity_type', $allPublicTypes)
            ->where('visibility', 'public')
            ->with(['actor', 'subject'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        return $activities;
    }

    /**
     * Get public events for guests
     */
    protected function getPublicEvents($page = 1)
    {
        $perPage = 20;
        
        // Get public event-related activities
        $activities = Activity::where('activity_type', 'platform_event')
            ->where('visibility', 'public')
            ->with(['actor', 'subject'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        return $activities;
    }
}
