<?php

namespace App\Http\Controllers\Frontend\Podcast;

use App\Http\Controllers\Controller;
use App\Models\Podcast;
use App\Models\PodcastCategory;
use App\Services\Podcast\PodcastService;
use App\Http\Requests\Podcast\CreatePodcastRequest;
use App\Http\Requests\Podcast\UpdatePodcastRequest;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class PodcastController extends Controller
{
    public function __construct(
        protected PodcastService $podcastService
    ) {
        $this->middleware('auth')->except(['index', 'show']);
    }

    /**
     * Display a listing of podcasts.
     */
    public function index(Request $request): View
    {
        $query = Podcast::published()->with(['creator', 'category']);

        // Search
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        // Filter by language
        if ($request->filled('language')) {
            $query->where('language', $request->language);
        }

        // Sort
        $sort = $request->get('sort', 'latest');
        match ($sort) {
            'popular' => $query->orderByDesc('total_listen_count'),
            'trending' => $query->orderByDesc('subscriber_count'),
            default => $query->latest('created_at'),
        };

        $podcasts = $query->paginate(24);
        $categories = PodcastCategory::active()
            ->withCount('podcasts')
            ->orderBy('name')
            ->get();

        return view('frontend.podcast.index', compact('podcasts', 'categories'));
    }

    /**
     * Display the specified podcast.
     */
    public function show(string $slug): View
    {
        $podcast = Podcast::where('slug', $slug)
            ->with(['creator', 'category', 'episodes' => function ($query) {
                $query->published()->orderByDesc('published_at');
            }])
            ->firstOrFail();

        // Check if user is subscribed
        $isSubscribed = false;
        if (auth()->check()) {
            $isSubscribed = $podcast->subscriptions()
                ->where('user_id', auth()->id())
                ->exists();
        }

        return view('frontend.podcast.show', compact('podcast', 'isSubscribed'));
    }

    /**
     * Show the form for creating a new podcast.
     */
    public function create(): View
    {
        $categories = PodcastCategory::active()
            ->orderBy('name')
            ->get();

        return view('frontend.podcast.create', compact('categories'));
    }

    /**
     * Store a newly created podcast.
     */
    public function store(CreatePodcastRequest $request): RedirectResponse
    {
        $podcast = $this->podcastService->create(
            auth()->user(),
            $request->validated()
        );

        return redirect()
            ->route('podcast.show', $podcast->slug)
            ->with('success', 'Podcast created successfully!');
    }

    /**
     * Show the form for editing the specified podcast.
     */
    public function edit(Podcast $podcast): View
    {
        $this->authorize('update', $podcast);

        $categories = PodcastCategory::active()
            ->orderBy('name')
            ->get();

        return view('frontend.podcast.edit', compact('podcast', 'categories'));
    }

    /**
     * Update the specified podcast.
     */
    public function update(UpdatePodcastRequest $request, Podcast $podcast): RedirectResponse
    {
        $this->authorize('update', $podcast);

        $podcast = $this->podcastService->update($podcast, $request->validated());

        return redirect()
            ->route('podcast.show', $podcast->slug)
            ->with('success', 'Podcast updated successfully!');
    }

    /**
     * Publish the specified podcast.
     */
    public function publish(Podcast $podcast): RedirectResponse
    {
        $this->authorize('update', $podcast);

        $this->podcastService->publish($podcast);

        return back()->with('success', 'Podcast published successfully!');
    }

    /**
     * Archive the specified podcast.
     */
    public function archive(Podcast $podcast): RedirectResponse
    {
        $this->authorize('update', $podcast);

        $podcast->update(['status' => 'archived']);

        return redirect()
            ->route('podcast.index')
            ->with('success', 'Podcast archived successfully!');
    }

    /**
     * Remove the specified podcast.
     */
    public function destroy(Podcast $podcast): RedirectResponse
    {
        $this->authorize('delete', $podcast);

        $this->podcastService->delete($podcast);

        return redirect()
            ->route('podcast.index')
            ->with('success', 'Podcast deleted successfully!');
    }

    /**
     * Show user's podcasts.
     */
    public function myPodcasts(): View
    {
        $user = auth()->user();

        $podcasts = Podcast::where('user_id', $user->id)
            ->with(['category', 'user'])
            ->withCount('episodes')
            ->orderByDesc('created_at')
            ->paginate(12);

        // Calculate statistics
        $totalEpisodes = $podcasts->sum('episodes_count');
        $totalSubscribers = $podcasts->sum('subscriber_count');
        $totalPlays = $podcasts->sum('total_listen_count');

        return view('frontend.podcast.my.index', compact(
            'podcasts',
            'totalEpisodes',
            'totalSubscribers',
            'totalPlays'
        ));
    }

    /**
     * Subscribe to a podcast.
     */
    public function subscribe(Podcast $podcast): RedirectResponse
    {
        $user = auth()->user();

        // Check if already subscribed
        if ($podcast->subscriptions()->where('user_id', $user->id)->exists()) {
            return back()->with('info', 'You are already subscribed to this podcast.');
        }

        $podcast->subscriptions()->create([
            'user_id' => $user->id,
            'subscribed_at' => now(),
        ]);

        return back()->with('success', 'Subscribed to podcast successfully!');
    }

    /**
     * Unsubscribe from a podcast.
     */
    public function unsubscribe(Podcast $podcast): RedirectResponse
    {
        $user = auth()->user();

        $podcast->subscriptions()
            ->where('user_id', $user->id)
            ->delete();

        return back()->with('success', 'Unsubscribed from podcast successfully!');
    }
}
