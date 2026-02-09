<?php

namespace App\Http\Controllers\Frontend\Podcast;

use App\Http\Controllers\Controller;
use App\Models\Podcast;
use App\Models\PodcastEpisode;
use App\Modules\Podcast\Models\PodcastListen;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    /**
     * Display user's podcast subscriptions
     */
    public function index()
    {
        $user = auth()->user();

        // Get user's subscribed podcasts with episode counts
        $subscriptions = Podcast::whereHas('subscribers', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with(['user', 'category'])
            ->withCount('episodes')
            ->latest('created_at')
            ->paginate(20);

        // Calculate additional stats
        $newEpisodesCount = PodcastEpisode::whereIn('podcast_id', $subscriptions->pluck('id'))
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        // Calculate total hours listened from play history
        $totalSecondsListened = PodcastListen::where('user_id', $user->id)
            ->whereIn('podcast_id', $subscriptions->pluck('id'))
            ->sum('listen_duration');
        $hoursListened = round($totalSecondsListened / 3600, 1);

        // Add hasNewEpisodes flag to each podcast
        $subscriptions->each(function ($podcast) {
            $podcast->hasNewEpisodes = $podcast->episodes()
                ->where('created_at', '>=', now()->subDays(7))
                ->exists();
            
            $podcast->last_episode_at = $podcast->episodes()
                ->latest('created_at')
                ->value('created_at');
        });

        return view('frontend.podcast.subscriptions.index', compact(
            'subscriptions',
            'newEpisodesCount',
            'hoursListened'
        ));
    }

    /**
     * Subscribe to a podcast
     */
    public function subscribe(Podcast $podcast)
    {
        $user = auth()->user();

        // Check if already subscribed
        if ($podcast->subscribers()->where('user_id', $user->id)->exists()) {
            return back()->with('info', 'You are already subscribed to this podcast.');
        }

        // Subscribe
        $podcast->subscribers()->attach($user->id, [
            'subscribed_at' => now()
        ]);

        // Increment subscriber count
        $podcast->increment('subscriber_count');

        return back()->with('success', 'Successfully subscribed to ' . $podcast->title);
    }

    /**
     * Unsubscribe from a podcast
     */
    public function unsubscribe(Podcast $podcast)
    {
        $user = auth()->user();

        // Check if subscribed
        if (!$podcast->subscribers()->where('user_id', $user->id)->exists()) {
            return back()->with('info', 'You are not subscribed to this podcast.');
        }

        // Unsubscribe
        $podcast->subscribers()->detach($user->id);

        // Decrement subscriber count
        $podcast->decrement('subscriber_count');

        return back()->with('success', 'Successfully unsubscribed from ' . $podcast->title);
    }
}
