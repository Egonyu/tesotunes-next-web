<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SocialController extends Controller
{
    public function feed()
    {
        $user = auth()->user();

        // Get activities from followed users and own activities
        if ($user) {
            $followingIds = $user->following()->pluck('following_id')->toArray();
            $followingIds[] = $user->id; // Include own posts
            
            $activities = \App\Models\Activity::with(['user.artistProfile', 'subject'])
                ->whereIn('user_id', $followingIds)
                ->latest()
                ->paginate(15);
        } else {
            // For guests, show public activities
            $activities = \App\Models\Activity::with(['user.artistProfile', 'subject'])
                ->where('visibility', 'public')
                ->latest()
                ->paginate(15);
        }

        // Trending songs for right sidebar
        $trendingSongs = \App\Models\Song::where('status', 'approved')
            ->where('is_explicit', false)
            ->orderBy('play_count', 'desc')
            ->take(5)
            ->get();

        // Suggested artists to follow
        if ($user) {
            $suggestedArtists = \App\Models\User::whereHas('artistProfile')
                ->whereNotIn('id', $user->following()->pluck('following_id')->push($user->id))
                ->where('is_active', true)
                ->withCount('followers')
                ->orderByDesc('followers_count')
                ->take(3)
                ->get();
        } else {
            $suggestedArtists = \App\Models\User::whereHas('artistProfile')
                ->where('is_active', true)
                ->withCount('followers')
                ->orderByDesc('followers_count')
                ->take(3)
                ->get();
        }

        // Upcoming events for right sidebar
        $upcomingEvents = \App\Models\Event::where('starts_at', '>', now())
            ->where('status', 'published')
            ->orderBy('starts_at', 'asc')
            ->take(3)
            ->get();

        return view('frontend.social.feed', compact(
            'activities',
            'trendingSongs',
            'suggestedArtists',
            'upcomingEvents'
        ));
    }

    public function followers()
    {
        return view('frontend.social.followers');
    }

    public function following()
    {
        return view('frontend.social.following');
    }

    public function activity()
    {
        return view('frontend.social.activity');
    }

    public function follow(Request $request, $user)
    {
        // Follow user logic
        return response()->json(['success' => true]);
    }

    public function like(Request $request, $type, $id)
    {
        // Like content logic
        return response()->json(['success' => true]);
    }

    public function share(Request $request, $type, $id)
    {
        // Share content logic
        return response()->json(['success' => true]);
    }

    public function comment(Request $request)
    {
        // Comment logic
        return response()->json(['success' => true]);
    }
}