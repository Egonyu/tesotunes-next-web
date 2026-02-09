<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Song;
use App\Models\Artist;
use App\Models\User;
use App\Models\Genre;
use App\Models\Playlist;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DiscoverController extends Controller
{
    public function index()
    {
        // Featured content for discovery homepage
        $featuredSongs = Song::published()
            ->with(['artist', 'album'])
            ->orderBy('play_count', 'desc')
            ->limit(8)
            ->get();

        $trendingSongs = Song::published()
            ->with(['artist', 'album'])
            ->where('created_at', '>=', now()->subDays(7))
            ->orderBy('play_count', 'desc')
            ->limit(6)
            ->get();

        $newReleases = Song::published()
            ->with(['artist', 'album'])
            ->where('created_at', '>=', now()->subDays(30))
            ->orderBy('created_at', 'desc')
            ->limit(12)
            ->get();

        $featuredArtists = Artist::where('status', 'active')
            ->withSum(['songs' => function($query) {
                $query->whereIn('status', ['published', 'approved']);
            }], 'play_count')
            ->orderBy('follower_count', 'desc')
            ->limit(6)
            ->get();

        $topGenres = Genre::whereHas('songs', function($query) {
                $query->whereIn('status', ['published', 'approved']);
            })
            ->withCount(['songs' => function($query) {
                $query->whereIn('status', ['published', 'approved']);
            }])
            ->having('songs_count', '>', 0)
            ->orderBy('songs_count', 'desc')
            ->limit(8)
            ->get();

        return Inertia::render('Frontend/Discover', compact(
            'featuredSongs',
            'trendingSongs',
            'newReleases',
            'featuredArtists',
            'topGenres'
        ));
    }

    public function trending()
    {
        $period = request('period', 'daily');
        $days = match($period) {
            'daily' => 1,
            'weekly' => 7,
            'monthly' => 30,
            'viral' => 7, // Viral uses different sorting
            default => 7
        };

        // Get top songs for the chart (paginated for the table)
        $trendingSongsQuery = Song::published()
            ->with(['artist', 'album'])
            ->orderBy('play_count', 'desc');
        
        // For viral, we might want to sort by recent growth/engagement
        if ($period === 'viral') {
            $trendingSongsQuery->where('created_at', '>=', now()->subDays($days))
                ->orderByRaw('(play_count + like_count * 2) DESC');
        } else {
            $trendingSongsQuery->where('created_at', '>=', now()->subDays($days * 2)); // Wider window for discovery
        }

        $trendingSongs = $trendingSongsQuery->paginate(50);

        // Get top 3 for the podium section (always top performers)
        $topThree = Song::published()
            ->with(['artist', 'album'])
            ->orderBy('play_count', 'desc')
            ->limit(3)
            ->get();

        // Get the #1 featured song for hero section
        $featuredSong = $topThree->first();

        $trendingArtists = Artist::where('status', 'active')
            ->withCount('songs')
            ->whereHas('songs', function($query) use ($days) {
                $query->whereIn('status', ['published', 'approved'])
                    ->where('created_at', '>=', now()->subDays($days));
            })
            ->orderBy('follower_count', 'desc')
            ->limit(10)
            ->get();

        return view('frontend.discover.trending', compact(
            'trendingSongs',
            'trendingArtists',
            'topThree',
            'featuredSong',
            'period'
        ));
    }

    public function genres()
    {
        // Only show active genres with songs
        $genres = Genre::whereHas('songs', function($query) {
                $query->whereIn('status', ['published', 'approved']);
            })
            ->withCount(['songs' => function($query) {
                $query->whereIn('status', ['published', 'approved']);
            }])
            ->having('songs_count', '>', 0)
            ->orderBy('songs_count', 'desc')
            ->get();

        $selectedGenre = null;
        $genreSongs = collect();

        if (request('genre')) {
            $selectedGenre = Genre::where(function($query) {
                    $query->where('slug', request('genre'))
                          ->orWhere('id', request('genre'));
                })
                ->first();

            if ($selectedGenre) {
                $genreSongs = Song::published()
                    ->whereHas('genres', function($query) use ($selectedGenre) {
                        $query->where('genres.id', $selectedGenre->id);
                    })
                    ->with(['artist', 'album'])
                    ->orderBy('play_count', 'desc')
                    ->paginate(20);
            } else {
                // Genre not found or inactive, redirect to genres page
                return redirect()->route('frontend.genres')
                    ->with('error', 'Genre not found or is no longer active.');
            }
        }

        return view('frontend.discover.genres', compact(
            'genres',
            'selectedGenre',
            'genreSongs'
        ));
    }

    public function artists()
    {
        $featuredArtists = \App\Models\Artist::where('status', 'active')
            ->where('is_verified', true)
            ->with(['user'])
            ->withSum(['songs' => function($query) {
                $query->whereIn('status', ['published', 'approved']);
            }], 'play_count')
            ->orderBy('follower_count', 'desc')
            ->limit(8)
            ->get();

        $risingArtists = \App\Models\Artist::where('status', 'active')
            ->with(['user'])
            ->withSum(['songs' => function($query) {
                $query->whereIn('status', ['published', 'approved']);
            }], 'play_count')
            ->where('created_at', '>=', now()->subMonths(6))
            ->orderBy('follower_count', 'desc')
            ->limit(8)
            ->get();

        // Get all artists with pagination
        $allArtists = \App\Models\Artist::where('status', 'active')
            ->with(['user'])
            ->withSum(['songs' => function($query) {
                $query->whereIn('status', ['published', 'approved']);
            }], 'play_count')
            ->orderBy('follower_count', 'desc')
            ->paginate(16);

        // Get genre statistics from genres table
        $genreStats = \App\Models\Genre::whereHas('songs', function($query) {
                $query->whereIn('status', ['published', 'approved']);
            })
            ->withCount(['songs' => function($query) {
                $query->whereIn('status', ['published', 'approved'])
                    ->whereHas('artist', function($q) {
                        $q->where('status', 'active');
                    });
            }])
            ->having('songs_count', '>', 0)
            ->orderBy('songs_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function($genre) {
                return (object)[
                    'genre' => $genre->name,
                    'artist_count' => \App\Models\Artist::where('status', 'active')
                        ->whereHas('songs', function($q) use ($genre) {
                            $q->whereHas('genres', function($sq) use ($genre) {
                                $sq->where('genres.id', $genre->id);
                            });
                        })
                        ->distinct()
                        ->count()
                ];
            });

        $totalArtists = \App\Models\Artist::where('status', 'active')->count();
        $newThisWeek = \App\Models\Artist::where('status', 'active')->where('created_at', '>=', now()->subWeek())->count();
        $activeMonthly = \App\Models\Artist::where('status', 'active')->whereHas('songs', function($query) {
            $query->where('created_at', '>=', now()->subMonth());
        })->count();

        return view('frontend.discover.artists', compact(
            'featuredArtists',
            'risingArtists',
            'allArtists',
            'genreStats',
            'totalArtists',
            'newThisWeek',
            'activeMonthly'
        ));
    }

    public function playlists()
    {
        try {
            // Get featured playlist for hero (the most popular one)
            $heroPlaylist = \App\Models\Playlist::where('visibility', 'public')
                ->with(['owner', 'songs.artist'])
                ->withCount('songs')
                ->orderBy('follower_count', 'desc')
                ->first();

            // Get featured playlists (excluding hero)
            $featuredPlaylists = \App\Models\Playlist::where('visibility', 'public')
                ->with('owner')
                ->withCount('songs')
                ->when($heroPlaylist, function($query) use ($heroPlaylist) {
                    return $query->where('id', '!=', $heroPlaylist->id);
                })
                ->orderBy('follower_count', 'desc')
                ->limit(8)
                ->get();

            // Get popular playlists  
            $popularPlaylists = \App\Models\Playlist::where('visibility', 'public')
                ->with('owner')
                ->withCount('songs')
                ->orderBy('play_count', 'desc')
                ->limit(12)
                ->get();

            // Get trending songs for the "Trending in Teso" section
            $trendingSongs = \App\Models\Song::published()
                ->with(['artist', 'album'])
                ->orderBy('play_count', 'desc')
                ->limit(5)
                ->get();

            // Get editor's picks (featured playlists or recently updated)
            $editorsPicks = \App\Models\Playlist::where('visibility', 'public')
                ->with('owner')
                ->withCount('songs')
                ->where('is_featured', true)
                ->orWhere(function($query) {
                    $query->where('visibility', 'public')
                        ->where('updated_at', '>=', now()->subDays(7));
                })
                ->orderBy('updated_at', 'desc')
                ->limit(4)
                ->get();

            // Get all public playlists with pagination
            $allPlaylists = \App\Models\Playlist::where('visibility', 'public')
                ->with('owner')
                ->withCount('songs')
                ->orderBy('updated_at', 'desc')
                ->paginate(16);

            $totalPlaylists = \App\Models\Playlist::where('visibility', 'public')->count();
            $communityPlaylists = $totalPlaylists;

            return view('frontend.discover.playlists', compact(
                'heroPlaylist',
                'featuredPlaylists',
                'popularPlaylists',
                'trendingSongs',
                'editorsPicks',
                'allPlaylists',
                'totalPlaylists',
                'communityPlaylists'
            ));
        } catch (\Exception $e) {
            \Log::error('Playlists page error: ' . $e->getMessage());
            return view('frontend.discover.playlists', [
                'featuredPlaylists' => collect(),
                'popularPlaylists' => collect(),
                'allPlaylists' => new \Illuminate\Pagination\LengthAwarePaginator([], 0, 16),
                'totalPlaylists' => 0,
                'communityPlaylists' => 0
            ]);
        }
    }

    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $type = $request->get('type', 'all'); // all, songs, artists, users, playlists
        $genre = $request->get('genre');
        $sortBy = $request->get('sort', 'relevance'); // relevance, plays, recent, title

        $results = [
            'songs' => collect(),
            'artists' => collect(),
            'users' => collect(),
            'playlists' => collect(),
        ];

        if (strlen($query) >= 2) {
            // Search songs
            if ($type === 'all' || $type === 'songs') {
                $songQuery = Song::published()
                    ->withOptimizedRelations()
                    ->withUserLikeStatus()
                    ->where(function($q) use ($query) {
                        $q->where('title', 'LIKE', "%{$query}%")
                          ->orWhere('lyrics', 'LIKE', "%{$query}%")
                          ->orWhereHas('artist', function($subQuery) use ($query) {
                              $subQuery->where('stage_name', 'LIKE', "%{$query}%");
                          });
                    });

                if ($genre) {
                    $songQuery->byGenre($genre);
                }

                switch ($sortBy) {
                    case 'plays':
                        $songQuery->orderBy('play_count', 'desc');
                        break;
                    case 'recent':
                        $songQuery->orderBy('created_at', 'desc');
                        break;
                    case 'title':
                        $songQuery->orderBy('title', 'asc');
                        break;
                    default: // relevance
                        // ✅ SECURITY FIX: Use parameterized queries to prevent SQL injection
                        $songQuery->orderByRaw("
                            CASE
                                WHEN title LIKE ? THEN 1
                                WHEN title LIKE ? THEN 2
                                ELSE 3
                            END
                        ", [$query . '%', '%' . $query . '%'])->orderBy('play_count', 'desc');
                }

                $results['songs'] = $songQuery->take(20)->get();
            }

            // Search artists
            if ($type === 'all' || $type === 'artists') {
                $artistQuery = Artist::where('status', 'active')
                    ->withFreshStats()
                    ->where(function($q) use ($query) {
                        $q->where('stage_name', 'LIKE', "%{$query}%")
                          ->orWhere('bio', 'LIKE', "%{$query}%");
                    });

                switch ($sortBy) {
                    case 'plays':
                        $artistQuery->orderBy('total_plays', 'desc');
                        break;
                    case 'recent':
                        $artistQuery->orderBy('created_at', 'desc');
                        break;
                    case 'title':
                        $artistQuery->orderBy('stage_name', 'asc');
                        break;
                    default: // relevance
                        // ✅ SECURITY FIX: Use parameterized queries to prevent SQL injection
                        $artistQuery->orderByRaw("
                            CASE
                                WHEN stage_name LIKE ? THEN 1
                                WHEN stage_name LIKE ? THEN 2
                                ELSE 3
                            END
                        ", [$query . '%', '%' . $query . '%'])->orderBy('total_plays', 'desc');
                }

                $results['artists'] = $artistQuery->take(15)->get();
            }

            // Search users (regular app users)
            if ($type === 'all' || $type === 'users') {
                $userQuery = User::where('is_active', true)
                    ->where(function($q) use ($query) {
                        $q->where('name', 'LIKE', "%{$query}%")
                          ->orWhere('username', 'LIKE', "%{$query}%")
                          ->orWhere('email', 'LIKE', "%{$query}%");
                    });

                switch ($sortBy) {
                    case 'recent':
                        $userQuery->orderBy('created_at', 'desc');
                        break;
                    case 'title':
                        $userQuery->orderBy('name', 'asc');
                        break;
                    default: // relevance
                        // ✅ SECURITY FIX: Use parameterized queries to prevent SQL injection
                        $userQuery->orderByRaw("
                            CASE
                                WHEN name LIKE ? THEN 1
                                WHEN username LIKE ? THEN 2
                                WHEN name LIKE ? THEN 3
                                ELSE 4
                            END
                        ", [$query . '%', $query . '%', '%' . $query . '%'])->orderBy('created_at', 'desc');
                }

                $results['users'] = $userQuery->take(10)->get(['id', 'name', 'username', 'email', 'avatar', 'created_at']);
            }

            // Search playlists
            if ($type === 'all' || $type === 'playlists') {
                $playlistQuery = Playlist::public()
                    ->with(['owner', 'songs'])
                    ->withCount(['songs', 'followers'])
                    ->where(function($q) use ($query) {
                        $q->where('name', 'LIKE', "%{$query}%")
                          ->orWhere('description', 'LIKE', "%{$query}%");
                    });

                switch ($sortBy) {
                    case 'plays':
                        $playlistQuery->orderBy('followers_count', 'desc');
                        break;
                    case 'recent':
                        $playlistQuery->orderBy('updated_at', 'desc');
                        break;
                    case 'title':
                        $playlistQuery->orderBy('name', 'asc');
                        break;
                    default: // relevance
                        // ✅ SECURITY FIX: Use parameterized queries to prevent SQL injection
                        $playlistQuery->orderByRaw("
                            CASE
                                WHEN name LIKE ? THEN 1
                                WHEN name LIKE ? THEN 2
                                ELSE 3
                            END
                        ", [$query . '%', '%' . $query . '%'])->orderBy('followers_count', 'desc');
                }

                $results['playlists'] = $playlistQuery->take(15)->get();
            }
        }

        // Get genres for filter
        $genres = Genre::withCount(['songs' => function($query) {
                $query->published();
            }])
            ->having('songs_count', '>', 0)
            ->orderBy('name')
            ->get();

        $totalResults = $results['songs']->count() +
                       $results['artists']->count() +
                       $results['users']->count() +
                       $results['playlists']->count();

        return view('frontend.discover.search', compact(
            'query',
            'type',
            'genre',
            'sortBy',
            'results',
            'genres',
            'totalResults'
        ));
    }

}