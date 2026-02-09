<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Playlist;
use Illuminate\Http\Request;

class PlaylistController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Get popular/trending public playlists (accessible to everyone)
        $popularPlaylists = \App\Models\Playlist::where('visibility', 'public')
            ->with(['owner', 'songs'])
            ->withCount('followers')
            ->orderBy('followers_count', 'desc')
            ->orderBy('play_count', 'desc')
            ->limit(12)
            ->get();

        // For authenticated users, also get their personal playlists
        $userPlaylists = null;
        $followedPlaylists = collect();
        
        if ($user) {
            // Get user's own playlists
            $userPlaylists = \App\Models\Playlist::where('user_id', $user->id)
                ->withCount('songs')
                ->orderBy('updated_at', 'desc')
                ->paginate(12);

            // Get followed playlists
            $followedPlaylists = \App\Models\Playlist::whereHas('followers', function($query) use ($user) {
                $query->where('follower_id', $user->id);
            })
            ->where('user_id', '!=', $user->id)
            ->with(['songs', 'owner'])
            ->orderBy('updated_at', 'desc')
            ->limit(6)
            ->get();
        }

        return view('frontend.playlists.index', compact('userPlaylists', 'followedPlaylists', 'popularPlaylists'));
    }

    public function create()
    {
        return view('frontend.playlists.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:300',
            'artwork' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_private' => 'required|in:0,1',
            'is_collaborative' => 'nullable|boolean',
        ]);

        $playlist = new \App\Models\Playlist();
        $playlist->user_id = auth()->id();
        $playlist->name = $request->name;
        $playlist->slug = \Illuminate\Support\Str::slug($request->name . '-' . time());
        $playlist->description = $request->description;
        $playlist->visibility = $request->is_private ? 'private' : 'public';
        $playlist->is_collaborative = $request->boolean('is_collaborative');
        $playlist->song_count = 0;
        $playlist->total_duration_seconds = 0;
        $playlist->play_count = 0;
        $playlist->follower_count = 0;

        // Handle artwork upload
        if ($request->hasFile('artwork')) {
            $artwork = $request->file('artwork');
            $filename = time() . '_' . uniqid() . '.' . $artwork->getClientOriginalExtension();
            $path = $artwork->storeAs('playlists/artwork', $filename, 'public');
            $playlist->artwork = $path;
        }

        $playlist->save();

        return redirect()->route('frontend.playlists.index')->with('success', 'Playlist created successfully!');
    }

    public function show(Playlist $playlist)
    {
        // Redirect to slug-based URL if accessed via numeric ID (SEO best practice)
        $segments = request()->segments();
        $lastSegment = end($segments);
        if (is_numeric($lastSegment) && $playlist->slug) {
            return redirect()->route('frontend.playlists.show', $playlist->slug, 301);
        }
        
        $playlist->load([
            'owner',
            'songs.artist',
            'songs.album',
            'followers'
        ]);
        $playlist->loadCount('songs');
        
        // Update song_count if it doesn't match actual count
        if ($playlist->song_count != $playlist->songs_count) {
            $playlist->update(['song_count' => $playlist->songs_count]);
        }

        // Check if user is following this playlist
        $isFollowing = false;
        if (auth()->check()) {
            $isFollowing = $playlist->followers()
                ->where('follower_id', auth()->id())
                ->exists();
        }

        return view('frontend.playlists.show', compact('playlist', 'isFollowing'));
    }

    public function edit($playlist)
    {
        return view('frontend.playlists.edit', compact('playlist'));
    }

    public function update(Request $request, $playlist)
    {
        // Update playlist logic
        return redirect()->route('frontend.playlists.show', $playlist);
    }

    public function destroy($playlist)
    {
        // Delete playlist logic
        return redirect()->route('frontend.playlists.index');
    }

    public function addSong(Request $request, $playlist)
    {
        // Add song to playlist logic
        return response()->json(['success' => true]);
    }

    public function removeSong($playlist, $song)
    {
        // Remove song from playlist logic
        return response()->json(['success' => true]);
    }

    public function follow($id)
    {
        try {
            $playlist = \App\Models\Playlist::findOrFail($id);
            $user = auth()->user();

            // Check if already following
            $existingFollow = \App\Models\UserFollow::where('follower_id', $user->id)
                ->where('following_type', \App\Models\Playlist::class)
                ->where('following_id', $playlist->id)
                ->first();

            if ($existingFollow) {
                return response()->json([
                    'success' => false,
                    'message' => 'Already following this playlist',
                    'is_following' => true
                ]);
            }

            // Create follow
            \App\Models\UserFollow::create([
                'follower_id' => $user->id,
                'following_type' => \App\Models\Playlist::class,
                'following_id' => $playlist->id,
            ]);

            // Update follower count
            $playlist->increment('follower_count');

            return response()->json([
                'success' => true,
                'message' => 'Following playlist',
                'is_following' => true
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to follow playlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function unfollow($id)
    {
        try {
            $playlist = \App\Models\Playlist::findOrFail($id);
            $user = auth()->user();

            // Find and delete follow
            $deleted = \App\Models\UserFollow::where('follower_id', $user->id)
                ->where('following_type', \App\Models\Playlist::class)
                ->where('following_id', $playlist->id)
                ->delete();

            if ($deleted) {
                // Update follower count
                $playlist->decrement('follower_count');
            }

            return response()->json([
                'success' => true,
                'message' => 'Unfollowed playlist',
                'is_following' => false
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to unfollow playlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}