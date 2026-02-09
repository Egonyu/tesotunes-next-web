<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Song;
use App\Models\Album;
use App\Models\Artist;
use App\Models\Genre;
use App\Models\PlayHistory;
use App\Models\Playlist;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Modules\Forum\Poll;
use Carbon\Carbon;

class HomeController extends Controller
{
    /**
     * Show the application homepage.
     */
    public function index(Request $request)
    {
        // Platform Statistics - Cached for 5 minutes
        $statistics = cache()->remember('homepage.statistics', 300, function () {
            return [
                'total_songs' => Song::whereIn('status', ['published', 'approved'])->count(),
                'songs_this_week' => Song::whereIn('status', ['published', 'approved'])
                    ->where('created_at', '>=', now()->subWeek())
                    ->count(),
                'active_artists' => Artist::whereIn('status', ['active', 'verified'])->count(),
                'total_plays' => Song::sum('play_count'),
                'total_genres' => Genre::count(),
            ];
        });

        // Featured content for the homepage - top songs by play count
        $featuredSongs = Song::whereIn('status', ['published', 'approved'])
            ->with(['artist', 'genres'])
            ->orderBy('play_count', 'desc')
            ->limit(12)
            ->get();

        // Trending songs (most played recently)
        $trendingSongs = Song::whereIn('status', ['published', 'approved'])
            ->with(['artist', 'genres'])
            ->orderBy('play_count', 'desc')
            ->limit(10)
            ->get();

        // New releases (songs from last 90 days)
        $newReleases = Song::whereIn('status', ['published', 'approved'])
            ->where('created_at', '>=', Carbon::now()->subDays(90))
            ->with(['artist', 'genres'])
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();

        // Popular genres with song counts
        $popularGenres = Genre::withCount(['songs' => function($query) {
                $query->whereIn('status', ['published', 'approved']);
            }])
            ->having('songs_count', '>', 0)
            ->orderBy('songs_count', 'desc')
            ->limit(8)
            ->get();

        // Featured artists with their song counts - get all artists if no songs exist
        $featuredArtists = Artist::whereIn('status', ['active', 'verified'])
            ->withSum(['songs' => function($query) {
                $query->whereIn('status', ['published', 'approved']);
            }], 'play_count')
            ->orderBy('follower_count', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get();

        // Popular albums with play counts from songs
        $popularAlbums = Album::whereIn('status', ['published', 'approved'])
            ->with(['artist'])
            ->withCount(['songs' => function($query) {
                $query->whereIn('status', ['published', 'approved']);
            }])
            ->orderBy('songs_count', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get();

        // Featured playlists for "Made for You" section
        $featuredPlaylists = Playlist::where('visibility', 'public')
            ->withCount('songs')
            ->orderBy('play_count', 'desc')
            ->limit(6)
            ->get();

        // Trending playlists
        $trendingPlaylists = Playlist::where('visibility', 'public')
            ->withCount('songs')
            ->orderBy('play_count', 'desc')
            ->limit(4)
            ->get();

        // Upcoming events (published and future events)
        $upcomingEvents = Event::where('status', 'published')
            ->where('starts_at', '>=', now())
            ->with('tickets')
            ->orderBy('starts_at', 'asc')
            ->limit(3)
            ->get();
        
        // Featured products from store
        $featuredProducts = \App\Modules\Store\Models\Product::active()
            ->with(['store'])
            ->where('is_featured', true)
            ->orderBy('created_at', 'desc')
            ->limit(4)
            ->get();

        // Community polls - Get active polls with their options
        $communityPolls = Poll::active()
            ->with(['options' => function($query) {
                $query->orderBy('position');
            }])
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get();

        // User personalized data if logged in
        $userRecommendations = [];
        $recentlyPlayed = [];

        if (Auth::check()) {
            $user = Auth::user();

            // Recently played songs
            $recentlyPlayed = PlayHistory::where('user_id', $user->id)
                ->with(['song.artist', 'song.genres'])
                ->orderBy('played_at', 'desc')
                ->limit(8)
                ->get()
                ->pluck('song')
                ->unique('id');

            // Basic recommendations based on listening history
            $userGenres = PlayHistory::query()
                ->join('songs', 'play_histories.song_id', '=', 'songs.id')
                ->join('song_genres', 'songs.id', '=', 'song_genres.song_id')
                ->whereRaw('play_histories.user_id = ?', [$user->id]) // Fixed: Use whereRaw to preserve table prefix
                ->selectRaw('song_genres.genre_id, COUNT(*) as play_count')
                ->groupBy('song_genres.genre_id')
                ->orderBy('play_count', 'desc')
                ->limit(3)
                ->pluck('genre_id');

            if ($userGenres->isNotEmpty()) {
                $userRecommendations = Song::whereIn('status', ['published', 'approved'])
                    ->whereHas('genres', function($query) use ($userGenres) {
                        $query->whereIn('genres.id', $userGenres);
                    })
                    ->whereNotIn('id', $recentlyPlayed->pluck('id'))
                    ->with(['artist', 'genres'])
                    ->orderBy('play_count', 'desc')
                    ->limit(8)
                    ->get();
            }
        }

        return view('frontend.home', compact(
            'statistics',
            'featuredSongs',
            'trendingSongs',
            'newReleases',
            'popularGenres',
            'featuredArtists',
            'popularAlbums',
            'featuredPlaylists',
            'trendingPlaylists',
            'upcomingEvents',
            'userRecommendations',
            'recentlyPlayed',
            'featuredProducts',
            'communityPolls'
        ));
    }

    /**
     * Show the about page.
     */
    public function about()
    {
        return view('frontend.about');
    }

    /**
     * Show the features page.
     */
    public function features()
    {
        return view('frontend.features');
    }

    /**
     * Show the pricing page.
     */
    public function pricing()
    {
        return view('frontend.pricing');
    }

    /**
     * Show the contact page.
     */
    public function contact()
    {
        return view('frontend.contact');
    }

    /**
     * Handle contact form submission.
     */
    public function submitContact(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string|max:1000',
        ]);

        // Handle contact form logic here
        // For now, just redirect back with success message
        return redirect()->route('frontend.contact')
            ->with('success', 'Thank you for your message. We will get back to you soon.');
    }
}
