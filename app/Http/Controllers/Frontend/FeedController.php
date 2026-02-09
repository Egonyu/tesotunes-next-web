<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Services\FeedService;
use App\Services\FeedPreferenceService;
use App\Services\FeedAnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FeedController extends Controller
{
    public function __construct(
        protected FeedService $feedService,
        protected FeedPreferenceService $preferenceService,
        protected FeedAnalyticsService $analyticsService
    ) {}

    /**
     * Display the main feed
     */
    public function index(Request $request)
    {
        $tab = $request->get('tab', 'for_you');
        $page = $request->get('page', 1);

        // Build feed based on tab
        $feedBuilder = $this->feedService->forUser(auth()->user());

        switch ($tab) {
            case 'following':
                $feedBuilder->withFollowedArtists()
                           ->withFriendActivity();
                break;
            case 'events':
                $feedBuilder->withPlatformEvents();
                break;
            case 'discover':
                $feedBuilder->withRecommendations();
                break;
            default: // 'for_you'
                $feedBuilder->withFollowedArtists()
                           ->withFriendActivity()
                           ->withPlatformEvents()
                           ->withForumActivity()
                           ->withPollActivity()
                           ->withRecommendations();
        }

        $feed = $feedBuilder->paginate($page);

        // Track view
        $this->analyticsService->trackView(auth()->user(), $tab);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'feed' => $feed->items(),
                'pagination' => [
                    'current_page' => $feed->currentPage(),
                    'total' => $feed->total(),
                    'per_page' => $feed->perPage(),
                    'has_more' => $feed->hasMorePages(),
                ],
            ]);
        }

        return view('frontend.feed.index', compact('feed', 'tab'));
    }

    /**
     * Mark activity as "not interested"
     */
    public function notInterested(Request $request, Activity $activity): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|in:not_relevant,seen_too_often,dont_like_artist,dont_like_genre,inappropriate,other',
            'comment' => 'nullable|string|max:500',
        ]);

        $metadata = [];
        if (!empty($validated['comment'])) {
            $metadata['comment'] = $validated['comment'];
        }

        $this->preferenceService->markNotInterested(
            auth()->user(),
            $activity,
            $validated['reason'],
            $metadata
        );

        // Track event
        $this->analyticsService->trackHidden(
            auth()->user(),
            $activity->id,
            $request->get('tab', 'for_you')
        );

        return response()->json([
            'success' => true,
            'message' => 'Your feed has been updated based on your feedback.',
        ]);
    }

    /**
     * Hide activity from feed
     */
    public function hide(Activity $activity): JsonResponse
    {
        $this->preferenceService->hideActivity(auth()->user(), $activity);

        return response()->json([
            'success' => true,
            'message' => 'Activity hidden from your feed.',
        ]);
    }

    /**
     * Undo "not interested" or "hidden" preference
     */
    public function undoPreference(Activity $activity): JsonResponse
    {
        $success = $this->preferenceService->undoPreference(auth()->user(), $activity);

        if ($success) {
            return response()->json([
                'success' => true,
                'message' => 'Preference removed. Activity may appear in your feed again.',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No preference found to undo.',
        ], 404);
    }

    /**
     * Save activity for later
     */
    public function save(Activity $activity): JsonResponse
    {
        $this->preferenceService->saveActivity(auth()->user(), $activity);

        return response()->json([
            'success' => true,
            'message' => 'Activity saved for later.',
        ]);
    }

    /**
     * Refresh feed (clear cache)
     */
    public function refresh(Request $request): JsonResponse
    {
        $this->feedService->forUser(auth()->user())->clearCache();

        return response()->json([
            'success' => true,
            'message' => 'Feed refreshed successfully.',
        ]);
    }

    /**
     * Get user's feed preferences
     */
    public function preferences(): JsonResponse
    {
        $preferences = $this->preferenceService->getUserPreferences(auth()->user());

        return response()->json([
            'success' => true,
            'preferences' => $preferences,
        ]);
    }

    /**
     * Track activity click
     */
    public function trackClick(Request $request, Activity $activity): JsonResponse
    {
        $this->analyticsService->trackClick(
            auth()->user(),
            $activity->id,
            $request->get('tab', 'for_you'),
            $request->only(['position', 'source'])
        );

        return response()->json(['success' => true]);
    }

    /**
     * Track activity like
     */
    public function trackLike(Request $request, Activity $activity): JsonResponse
    {
        $this->analyticsService->trackLike(
            auth()->user(),
            $activity->id,
            $request->get('tab', 'for_you')
        );

        return response()->json(['success' => true]);
    }

    /**
     * Track activity share
     */
    public function trackShare(Request $request, Activity $activity): JsonResponse
    {
        $this->analyticsService->trackShare(
            auth()->user(),
            $activity->id,
            $request->get('tab', 'for_you')
        );

        return response()->json(['success' => true]);
    }
}
