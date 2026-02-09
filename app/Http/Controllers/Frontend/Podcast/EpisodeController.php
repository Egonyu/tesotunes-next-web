<?php

namespace App\Http\Controllers\Frontend\Podcast;

use App\Http\Controllers\Controller;
use App\Models\Podcast;
use App\Models\PodcastEpisode;
use App\Services\Podcast\EpisodeService;
use App\Http\Requests\Podcast\CreateEpisodeRequest;
use App\Http\Requests\Podcast\UpdateEpisodeRequest;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class EpisodeController extends Controller
{
    public function __construct(
        protected EpisodeService $episodeService
    ) {
        $this->middleware('auth')->except(['show']);
    }

    /**
     * Display the specified episode.
     */
    public function show(Podcast $podcast, PodcastEpisode $episode): View
    {
        // Ensure episode belongs to podcast
        if ($episode->podcast_id !== $podcast->id) {
            abort(404);
        }

        $episode->load(['podcast.user', 'podcast.category']);

        // Check access for premium content
        $canAccess = !($episode->is_premium ?? false)
            || auth()->check() && (
                (auth()->user()->subscription_tier ?? 'free') === 'premium' 
                || $podcast->user_id === auth()->id()
            );

        // Get next and previous episodes
        $nextEpisode = PodcastEpisode::where('podcast_id', $podcast->id)
            ->where('created_at', '>', $episode->created_at)
            ->where('status', 'published')
            ->orderBy('created_at')
            ->first();

        $previousEpisode = PodcastEpisode::where('podcast_id', $podcast->id)
            ->where('created_at', '<', $episode->created_at)
            ->where('status', 'published')
            ->orderByDesc('created_at')
            ->first();

        // Get more episodes from the same podcast
        $moreEpisodes = PodcastEpisode::where('podcast_id', $podcast->id)
            ->where('id', '!=', $episode->id)
            ->where('status', 'published')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        // Format duration for display
        if ($episode->duration_seconds) {
            $minutes = floor($episode->duration_seconds / 60);
            $seconds = $episode->duration_seconds % 60;
            $episode->duration = sprintf('%d:%02d', $minutes, $seconds);
        }

        return view('frontend.podcast.episodes.show', compact(
            'podcast',
            'episode',
            'canAccess',
            'nextEpisode',
            'previousEpisode',
            'moreEpisodes'
        ));
    }

    /**
     * Show the form for creating a new episode.
     */
    public function create(Podcast $podcast): View
    {
        $this->authorize('update', $podcast);

        return view('frontend.podcast.episodes.create', compact('podcast'));
    }

    /**
     * Store a newly created episode.
     */
    public function store(CreateEpisodeRequest $request, Podcast $podcast): RedirectResponse
    {
        $this->authorize('update', $podcast);

        $episode = $this->episodeService->create($podcast, $request->validated());

        return redirect()
            ->route('podcast.episode.show', [$podcast->slug, $episode->slug])
            ->with('success', 'Episode created successfully!');
    }

    /**
     * Show the form for editing the specified episode.
     */
    public function edit(Podcast $podcast, PodcastEpisode $episode): View
    {
        $this->authorize('update', $podcast);

        // Ensure episode belongs to podcast
        if ($episode->podcast_id !== $podcast->id) {
            abort(404);
        }

        return view('frontend.podcast.episodes.edit', compact('podcast', 'episode'));
    }

    /**
     * Update the specified episode.
     */
    public function update(UpdateEpisodeRequest $request, Podcast $podcast, PodcastEpisode $episode): RedirectResponse
    {
        $this->authorize('update', $podcast);

        // Ensure episode belongs to podcast
        if ($episode->podcast_id !== $podcast->id) {
            abort(404);
        }

        $episode = $this->episodeService->update($episode, $request->validated());

        return redirect()
            ->route('podcast.episode.show', [$podcast->slug, $episode->slug])
            ->with('success', 'Episode updated successfully!');
    }

    /**
     * Publish the specified episode.
     */
    public function publish(Podcast $podcast, PodcastEpisode $episode): RedirectResponse
    {
        $this->authorize('update', $podcast);

        if ($episode->podcast_id !== $podcast->id) {
            abort(404);
        }

        $this->episodeService->publish($episode);

        return back()->with('success', 'Episode published successfully!');
    }

    /**
     * Remove the specified episode.
     */
    public function destroy(Podcast $podcast, PodcastEpisode $episode): RedirectResponse
    {
        $this->authorize('update', $podcast);

        if ($episode->podcast_id !== $podcast->id) {
            abort(404);
        }

        $this->episodeService->delete($episode);

        return redirect()
            ->route('podcast.show', $podcast->slug)
            ->with('success', 'Episode deleted successfully!');
    }
}
