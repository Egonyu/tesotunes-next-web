<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Song;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SongController extends Controller
{
    public function index(Request $request)
    {
        $query = Song::published()->withOptimizedRelations()->withUserLikeStatus();

        // Apply filters
        if ($request->filled('genre')) {
            $query->where('primary_genre_id', $request->genre);
        }

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhereHas('artist', function($artistQuery) use ($searchTerm) {
                      $artistQuery->where('stage_name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        // Apply sorting
        $sortBy = $request->get('sort', 'latest');
        switch ($sortBy) {
            case 'popular':
                $query->orderBy('play_count', 'desc');
                break;
            case 'trending':
                $query->trending(7); // Last 7 days
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            default: // latest
                $query->orderBy('created_at', 'desc');
                break;
        }

        $songs = $query->paginate(24);

        // Get filter options
        $genres = \App\Models\Genre::withCount(['songs' => function($query) {
                $query->published();
            }])
            ->having('songs_count', '>', 0)
            ->orderBy('name')
            ->get();

        return Inertia::render('Frontend/Music', [
            'songs' => $songs,
            'genres' => $genres,
            'sortBy' => $sortBy,
            'search' => $request->search,
            'genre' => $request->genre
        ]);
    }

    public function show(Song $song)
    {
        // Redirect to slug-based URL if accessed via numeric ID (SEO best practice)
        // Get the actual URL parameter (before model binding resolved it)
        $segments = request()->segments();
        $lastSegment = end($segments);
        if (is_numeric($lastSegment) && $song->slug) {
            return redirect()->route('frontend.songs.show', $song->slug, 301);
        }
        
        // Load relationships
        $song->load(['artist', 'album', 'primaryGenre']);
        
        // Check if current user has liked this song
        $isLiked = false;
        if (auth()->check()) {
            $isLiked = auth()->user()->likes()
                ->where('likeable_type', Song::class)
                ->where('likeable_id', $song->id)
                ->exists();
        }
        
        // Get related songs (same artist or genre)
        $relatedSongs = Song::where('status', 'published')
            ->where('id', '!=', $song->id)
            ->where(function($query) use ($song) {
                $query->where('artist_id', $song->artist_id);
                if ($song->primary_genre_id) {
                    $query->orWhere('primary_genre_id', $song->primary_genre_id);
                }
            })
            ->with(['artist'])
            ->limit(6)
            ->get();
        
        // Increment play count (can be moved to a job for better performance)
        $song->increment('play_count');
        
        return view('frontend.song.show', compact('song', 'isLiked', 'relatedSongs'));
    }
}