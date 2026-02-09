<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Artist;
use App\Models\UserFollow;
use Illuminate\Http\Request;

class ArtistController extends Controller
{
    public function show(Artist $artist)
    {
        $artist->loadCount(['songs as songs_count' => function ($query) {
            $query->where('status', 'published');
        }]);

        // Check if the current user is following this artist
        $isFollowing = false;
        if (auth()->check()) {
            $isFollowing = UserFollow::where('follower_id', auth()->id())
                ->where('following_id', $artist->id)
                ->where('following_type', 'artist')
                ->exists();
        }

        // Get all published songs for play all functionality
        $allSongs = $artist->songs()
            ->published()
            ->with(['album', 'genres', 'artist'])
            ->select(['id', 'title', 'slug', 'duration_seconds', 'play_count', 'artist_id', 'album_id', 'artwork', 'price', 'is_free', 'currency', 'is_downloadable', 'is_explicit'])
            ->orderBy('play_count', 'desc')
            ->get()
            ->map(function($song) {
                return [
                    'id' => $song->id,
                    'title' => $song->title,
                    'artist' => $song->artist->stage_name ?? $song->artist->name,
                    'artist_id' => $song->artist_id,
                    'artwork_url' => $song->artwork_url,
                    'audio_url' => $song->audio_url,
                    'duration' => $song->duration_seconds ?? 0,
                    'play_count' => $song->play_count ?? 0,
                    'slug' => $song->slug,
                    'price' => $song->price ?? 0,
                    'is_free' => $song->is_free,
                    'currency' => $song->currency ?? 'UGX',
                    'is_downloadable' => $song->is_downloadable,
                    'is_explicit' => $song->is_explicit,
                ];
            });

        return view('frontend.artist.show', compact('artist', 'isFollowing', 'allSongs'));
    }

    public function tracks(Artist $artist, Request $request)
    {
        $sortBy = $request->get('sort', 'play_count');
        $sortOrder = 'desc';

        // Handle different sort options
        switch ($sortBy) {
            case 'title':
                $sortOrder = 'asc';
                break;
            case 'created_at':
            case 'release_date':
                $sortOrder = 'desc';
                break;
            case 'play_count':
            default:
                $sortBy = 'play_count';
                $sortOrder = 'desc';
                break;
        }

        $tracks = $artist->songs()
            ->where('status', 'published')
            ->with(['album', 'genres'])
            ->withUserLikeStatus()
            ->orderBy($sortBy, $sortOrder)
            ->paginate(25);

        return view('frontend.artist.tracks', compact('artist', 'tracks'));
    }

    public function albums(Artist $artist)
    {
        $albums = $artist->albums()
            ->where('status', 'published')
            ->withCount('songs')
            ->orderBy('release_date', 'desc')
            ->paginate(12);

        return view('frontend.artist.albums', compact('artist', 'albums'));
    }

    public function about(Artist $artist)
    {
        return view('frontend.artist.about', compact('artist'));
    }

    public function follow(Artist $artist)
    {
        $user = auth()->user();

        // Check if already following
        $existingFollow = UserFollow::where('follower_id', $user->id)
            ->where('following_id', $artist->id)
            ->where('following_type', 'artist')
            ->first();

        if (!$existingFollow) {
            UserFollow::create([
                'follower_id' => $user->id,
                'following_id' => $artist->id,
                'following_type' => 'artist',
            ]);

            // Increment follower count
            $artist->increment('followers_count');
        }

        return response()->json([
            'success' => true,
            'message' => 'Following ' . $artist->stage_name,
            'is_following' => true,
            'follower_count' => $artist->fresh()->followers_count,
        ]);
    }

    public function unfollow(Artist $artist)
    {
        $user = auth()->user();

        $deleted = UserFollow::where('follower_id', $user->id)
            ->where('following_id', $artist->id)
            ->where('following_type', 'artist')
            ->delete();

        if ($deleted) {
            // Decrement follower count
            $artist->decrement('followers_count');
        }

        return response()->json([
            'success' => true,
            'message' => 'Unfollowed ' . $artist->stage_name,
            'is_following' => false,
            'follower_count' => $artist->fresh()->followers_count,
        ]);
    }
}