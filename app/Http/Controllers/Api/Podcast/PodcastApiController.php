<?php

namespace App\Http\Controllers\Api\Podcast;

use App\Http\Controllers\Controller;
use App\Models\Podcast;
use App\Models\PodcastEpisode;
use App\Services\Podcast\RssFeedService;
use App\Services\Podcast\AnalyticsService;
use App\Http\Resources\PodcastResource;
use App\Http\Resources\PodcastEpisodeResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class PodcastApiController extends Controller
{
    public function __construct(
        protected RssFeedService $rssFeedService,
        protected AnalyticsService $analyticsService
    ) {
        $this->middleware('auth:sanctum')->except(['index', 'show', 'episodes', 'rss']);
        $this->middleware('throttle:streaming')->only(['play', 'download']);
    }

    /**
     * Get all published podcasts.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Podcast::published()->with(['creator', 'category']);

        // Search
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Filter by category
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Sort
        $sort = $request->get('sort', 'latest');
        match ($sort) {
            'popular' => $query->orderByDesc('total_listen_count'),
            'trending' => $query->orderByDesc('subscriber_count'),
            default => $query->latest('created_at'),
        };

        $podcasts = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => PodcastResource::collection($podcasts),
            'meta' => [
                'current_page' => $podcasts->currentPage(),
                'last_page' => $podcasts->lastPage(),
                'per_page' => $podcasts->perPage(),
                'total' => $podcasts->total(),
            ],
        ]);
    }

    /**
     * Get a specific podcast.
     */
    public function show(string $uuid): JsonResponse
    {
        $podcast = Podcast::where('uuid', $uuid)
            ->with(['creator', 'category', 'subcategory'])
            ->firstOrFail();

        return response()->json([
            'data' => new PodcastResource($podcast),
        ]);
    }

    /**
     * Get episodes for a podcast.
     */
    public function episodes(Request $request, string $uuid): JsonResponse
    {
        $podcast = Podcast::where('uuid', $uuid)->firstOrFail();

        $query = $podcast->episodes()->published();

        // Filter by season
        if ($request->filled('season')) {
            $query->where('season_number', $request->season);
        }

        // Sort
        $sort = $request->get('sort', 'latest');
        match ($sort) {
            'oldest' => $query->oldest('created_at'),
            'popular' => $query->orderByDesc('listen_count'),
            default => $query->latest('created_at'),
        };

        $episodes = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => PodcastEpisodeResource::collection($episodes),
            'meta' => [
                'current_page' => $episodes->currentPage(),
                'last_page' => $episodes->lastPage(),
                'per_page' => $episodes->perPage(),
                'total' => $episodes->total(),
            ],
        ]);
    }

    /**
     * Get RSS feed for a podcast.
     */
    public function rss(string $uuid): Response
    {
        $podcast = Podcast::where('uuid', $uuid)
            ->with(['episodes' => function ($query) {
                $query->published()->latest('created_at');
            }])
            ->firstOrFail();

        $rss = $this->rssFeedService->generate($podcast);

        return response($rss, 200, [
            'Content-Type' => 'application/rss+xml; charset=UTF-8',
            'Cache-Control' => 'public, max-age=' . (config('podcast.rss.ttl', 60) * 60),
        ]);
    }

    /**
     * Play an episode (track analytics).
     */
    public function play(Request $request, string $uuid): JsonResponse
    {
        $episode = PodcastEpisode::where('uuid', $uuid)
            ->with('podcast')
            ->firstOrFail();

        // Check premium access
        if ($episode->is_premium && !$this->canAccessPremium($request->user(), $episode)) {
            return response()->json([
                'error' => 'Premium subscription required to access this episode.',
                'upgrade_url' => route('subscription.plans'),
            ], 403);
        }

        // Check freemium limit for non-premium users
        if ($request->user() && $request->user()->subscription_tier !== 'premium') {
            if ($this->analyticsService->hasExceededFreeLimit($request->user())) {
                return response()->json([
                    'error' => 'You have reached your free episode limit for this month.',
                    'upgrade_url' => route('subscription.plans'),
                ], 403);
            }
        }

        // Track listen
        $listen = $this->analyticsService->trackListen($episode, [
            'user_id' => $request->user()?->id,
            'session_id' => $request->input('session_id', session()->getId()),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'listen_duration' => $request->input('duration_seconds', 0),
            'started_at' => $request->input('started_at', now()),
            'last_position' => $request->input('position', 0),
            'device_type' => $this->detectDeviceType($request->userAgent()),
        ]);

        // Return streaming URL
        return response()->json([
            'data' => [
                'stream_url' => $episode->audio_url,
                'episode' => new PodcastEpisodeResource($episode),
                'listen_id' => $listen->id,
            ],
        ]);
    }

    /**
     * Download an episode.
     */
    public function download(Request $request, string $uuid): JsonResponse
    {
        $episode = PodcastEpisode::where('uuid', $uuid)
            ->with('podcast')
            ->firstOrFail();

        // Check premium access
        if ($episode->is_premium && !$this->canAccessPremium($request->user(), $episode)) {
            return response()->json([
                'error' => 'Premium subscription required to download this episode.',
            ], 403);
        }

        // Track download
        $this->analyticsService->trackDownload($episode, [
            'user_id' => $request->user()?->id,
            'quality' => $request->input('quality', 'medium'),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'data' => [
                'download_url' => $episode->audio_url,
                'file_size' => $episode->file_size,
                'mime_type' => $episode->mime_type,
            ],
        ]);
    }

    /**
     * Get user's subscribed podcasts.
     */
    public function subscriptions(Request $request): JsonResponse
    {
        $podcasts = Podcast::whereHas('subscriptions', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })
            ->with(['creator', 'category'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'data' => PodcastResource::collection($podcasts),
        ]);
    }

    /**
     * Get user's listening history.
     */
    public function history(Request $request): JsonResponse
    {
        $history = $this->analyticsService->getUserListeningHistory(
            $request->user(),
            $request->get('limit', 20)
        );

        return response()->json([
            'data' => $history,
        ]);
    }

    /**
     * Check if user can access premium content.
     */
    protected function canAccessPremium(?object $user, PodcastEpisode $episode): bool
    {
        if (!$user) {
            return false;
        }

        // Premium subscribers have access
        if ($user->subscription_tier === 'premium') {
            return true;
        }

        // Podcast owners have access
        if ($episode->podcast->isOwnedBy($user)) {
            return true;
        }

        return false;
    }

    /**
     * Detect device type from user agent.
     */
    protected function detectDeviceType(string $userAgent): string
    {
        if (preg_match('/mobile|android|iphone/i', $userAgent)) {
            return 'mobile';
        }

        if (preg_match('/tablet|ipad/i', $userAgent)) {
            return 'tablet';
        }

        return 'desktop';
    }
}
