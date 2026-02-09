<?php

namespace App\Http\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use App\Models\Song;
use App\Models\Album;
use App\Models\Artist;
use App\Models\Genre;
use App\Models\Playlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MusicController extends Controller
{
    public function index()
    {
        $stats = [
            'total_songs' => Song::count(),
            'published_songs' => Song::where('status', 'published')->count(),
            'total_artists' => Artist::count(),
            'verified_artists' => Artist::where('is_verified', true)->count(),
            'total_albums' => Album::count(),
            'published_albums' => Album::where('status', 'published')->count(),
            'total_playlists' => Playlist::count(),
            'public_playlists' => Playlist::where('visibility', 'public')->count(),  // Fixed: privacy -> visibility
            'pending_content' => Song::where('status', 'pending_review')->count() +
                               Album::where('status', 'pending')->count(),
        ];

        $recentSongs = Song::with(['artist', 'album'])
            ->latest()
            ->limit(5)
            ->get();

        $recentArtists = Artist::latest()
            ->limit(5)
            ->get();

        return view('backend.music.index', compact('stats', 'recentSongs', 'recentArtists'));
    }

    public function songs(Request $request)
    {
        $query = Song::with(['artist', 'album', 'genres']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhereHas('artist', function($artistQuery) use ($search) {
                      $artistQuery->where('name', 'LIKE', "%{$search}%");
                  })
                  ->orWhereHas('album', function($albumQuery) use ($search) {
                      $albumQuery->where('title', 'LIKE', "%{$search}%");
                  });
            });
        }

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('genre_id')) {
            $query->where('primary_genre_id', $request->genre_id);
        }

        $filteredArtist = null;
        if ($request->filled('artist')) {
            $query->where('artist_id', $request->artist);
            $filteredArtist = Artist::find($request->artist);
        }

        if ($request->filled('is_free')) {
            $query->where('is_free', $request->boolean('is_free'));
        }

        if ($request->filled('language')) {
            $query->where('primary_language', $request->language);
        }

        // Date filters
        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date_to);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $songs = $query->paginate($request->get('per_page', 25));

        // Calculate statistics for the view
        $publishedSongs = Song::where('status', 'published')->count();
        $pendingSongs = Song::where('status', 'pending_review')->count();
        $draftSongs = Song::where('status', 'draft')->count();
        $rejectedSongs = Song::where('status', 'rejected')->count();
        $totalSongs = Song::count();

        // Calculate total plays (sum all play counts from songs)
        $totalPlays = Song::sum('play_count') ?? 0;

        // Filter options
        $genres = Genre::orderBy('name')->get();
        $artists = Artist::orderBy('stage_name')->get();
        $statuses = ['draft', 'published', 'archived', 'pending'];
        $languages = Song::distinct('primary_language')->pluck('primary_language')->filter()->sort();

        return view('admin.music.songs.index', compact(
            'songs',
            'genres',
            'artists',
            'statuses',
            'languages',
            'publishedSongs',
            'pendingSongs',
            'draftSongs',
            'rejectedSongs',
            'totalSongs',
            'filteredArtist',
            'totalPlays'
        ));
    }

    public function showSong(Song $song)
    {
        $song->load(['artist', 'album', 'genre', 'playHistory', 'likes', 'comments']);

        // Get artist follower stats - use following_type to filter for artist follows
        $artistFollowers = \DB::table('user_follows')
            ->where('following_id', $song->artist_id)
            ->where('following_type', 'artist')
            ->count();

        $analytics = [
            'total_plays' => $song->play_count,
            'unique_listeners' => $song->playHistory()->distinct('user_id')->count(),
            'total_likes' => $song->like_count,
            'total_downloads' => $song->download_count,
            'completion_rate' => $song->playHistory()->where('was_completed', true)->count() /
                max(1, $song->playHistory()->count()) * 100,
            'recent_plays' => $song->playHistory()->where('played_at', '>=', now()->subDays(30))->count(),
            'artist_followers' => $artistFollowers,
            'artist_followers_cached' => $song->artist->follower_count ?? 0,
        ];

        // Play history by day (last 30 days)
        $dailyPlays = $song->playHistory()
            ->where('played_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(played_at) as date, COUNT(*) as plays')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return view('admin.music.songs.show', compact('song', 'analytics', 'dailyPlays'));
    }

    public function editSong(Song $song)
    {
        $artists = Artist::where('status', 'active')->orderBy('stage_name')->get();
        $albums = Album::where('status', 'published')->orderBy('title')->get();
        $genres = Genre::orderBy('name')->get();
        $statuses = ['draft', 'published', 'archived'];
        $languages = ['en', 'sw', 'lg', 'fr', 'es'];

        return view('admin.music.songs.edit', compact('song', 'artists', 'albums', 'genres', 'statuses', 'languages'));
    }

    public function updateSong(Request $request, Song $song)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'artist_id' => 'required|exists:artists,id',
            'album_id' => 'nullable|exists:albums,id',
            'genre_id' => 'required|exists:genres,id',
            'track_number' => 'nullable|integer|min:1',
            'duration_seconds' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'primary_language' => 'nullable|string|max:50',
            'release_date' => 'nullable|date',
            'isrc_code' => 'nullable|string|max:20',
            'is_free' => 'boolean',
            'is_explicit' => 'boolean',
            'is_downloadable' => 'boolean',
            'price' => 'nullable|numeric|min:0',
            'status' => 'required|in:draft,pending,published,rejected,archived',
            'audio_file_original' => 'nullable|file|mimes:mp3,wav,flac,aac,m4a|max:51200', // 50MB
            'artwork' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240', // 10MB
        ]);

        try {
            \DB::beginTransaction();

            // Handle audio file upload if provided
            if ($request->hasFile('audio_file_original')) {
                $storageService = new \App\Services\MusicStorageService();
                $audioResult = $storageService->storeMusicFile(
                    $request->file('audio_file_original'),
                    $song->artist,
                    'song',
                    \App\Services\MusicStorageService::ACCESS_PRIVATE
                );

                if ($audioResult['success']) {
                    // Delete old file
                    if ($song->audio_file_original) {
                        Storage::disk('public')->delete($song->audio_file_original);
                    }
                    
                    $song->audio_file_original = $audioResult['storage_path'];
                    $song->file_format = $audioResult['file_info']['extension'];
                    $song->file_size_bytes = $audioResult['file_info']['size'];
                    $song->file_hash = $audioResult['file_info']['hash'];
                }
            }

            // Handle artwork upload if provided
            if ($request->hasFile('artwork')) {
                $storageService = $storageService ?? new \App\Services\MusicStorageService();
                $artworkResult = $storageService->storeArtwork(
                    $request->file('artwork'),
                    $song->artist,
                    'song_cover',
                    \App\Services\MusicStorageService::ACCESS_PUBLIC
                );

                if ($artworkResult['success']) {
                    // Delete old artwork
                    if ($song->artwork) {
                        Storage::disk('public')->delete($song->artwork);
                    }
                    
                    $song->artwork = $artworkResult['storage']['path'];
                }
            }

            // Update song data
            $song->update([
                'title' => $request->title,
                'slug' => \Str::slug($request->title . '-' . $song->artist->stage_name),
                'artist_id' => $request->artist_id,
                'album_id' => $request->album_id,
                'primary_genre_id' => $request->genre_id,
                'track_number' => $request->track_number,
                'duration_seconds' => $request->duration_seconds,
                'description' => $request->description,
                'primary_language' => $request->primary_language,
                'isrc_code' => $request->isrc_code,
                'is_free' => $request->boolean('is_free'),
                'is_explicit' => $request->boolean('is_explicit'),
                'is_downloadable' => $request->boolean('is_downloadable'),
                'price' => $request->price ?? 0,
                'status' => $request->status,
            ]);

            \DB::commit();

            return redirect()->route('admin.music.songs.show', $song)
                ->with('success', 'Song updated successfully!');
                
        } catch (\Exception $e) {
            \DB::rollback();
            \Log::error('Song update failed', [
                'song_id' => $song->id,
                'error' => $e->getMessage(),
                'admin_id' => auth()->id()
            ]);

            return back()->with('error', 'Failed to update song: ' . $e->getMessage())->withInput();
        }
    }

    public function deleteSong(Song $song)
    {
        // Delete associated files
        if ($song->audio_file_original) {
            Storage::disk('public')->delete($song->audio_file_original);
        }
        if ($song->artwork) {
            Storage::disk('public')->delete($song->artwork);
        }

        $song->delete();

        return redirect()->route('backend.music.songs.index')
            ->with('success', 'Song deleted successfully');
    }

    public function albums(Request $request)
    {
        $query = Album::with(['artist'])->withCount('songs');

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhereHas('artist', function($artistQuery) use ($search) {
                      $artistQuery->where('name', 'LIKE', "%{$search}%");
                  });
            });
        }

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('genre_id')) {
            $query->where('primary_genre_id', $request->genre_id);
        }

        if ($request->filled('type')) {
            $query->where('album_type', $request->type);
        }

        $filteredArtist = null;
        if ($request->filled('artist')) {
            $query->where('artist_id', $request->artist);
            $filteredArtist = Artist::find($request->artist);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'release_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $albums = $query->paginate($request->get('per_page', 25));

        // Filter options
        $genres = Genre::orderBy('name')->get();
        $statuses = ['draft', 'published', 'archived'];
        $types = ['album', 'ep', 'single', 'compilation'];

        return view('admin.music.albums.index', compact('albums', 'genres', 'statuses', 'types', 'filteredArtist'));
    }

    public function artists(Request $request)
    {
        $query = Artist::withCount(['songs', 'albums']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('bio', 'LIKE', "%{$search}%");
            });
        }

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('country')) {
            $query->where('country', $request->country);
        }

        if ($request->filled('verified')) {
            $query->where('is_verified', $request->boolean('verified'));
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $artists = $query->paginate($request->get('per_page', 25));

        // Calculate statistics for the view
        $verifiedArtists = Artist::where('is_verified', true)->count();
        $activeArtists = Artist::where('status', 'approved')->count();
        $pendingVerification = Artist::where('status', 'pending')->count();
        $totalArtists = Artist::count();

        // Filter options - get countries from users table via relationship
        $countries = Artist::with('user')->get()
            ->pluck('user.country')
            ->filter()
            ->unique()
            ->sort()
            ->values();
        $statuses = ['active', 'inactive', 'suspended'];

        return view('admin.music.artists.index', compact(
            'artists',
            'countries',
            'statuses',
            'verifiedArtists',
            'activeArtists',
            'pendingVerification',
            'totalArtists'
        ));
    }

    public function createArtist()
    {
        // Get users who don't have an artist profile yet
        $users = \App\Models\User::whereDoesntHave('artist')->orderBy('name')->get();
        // Get countries from users table since that's where country column exists
        $countries = \App\Models\User::whereNotNull('country')
            ->distinct()
            ->pluck('country')
            ->filter()
            ->sort()
            ->values();

        return view('admin.music.artists.create', compact('users', 'countries'));
    }

    public function storeArtist(Request $request)
    {
        $request->validate([
            'user_id' => 'nullable|exists:users,id|unique:artists,user_id',
            'stage_name' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'country' => 'nullable|string|max:255',
            'website' => 'nullable|url',
            'social_links' => 'nullable|array',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
            'status' => 'required|in:active,suspended,banned',
            'is_verified' => 'boolean',
            'is_trusted' => 'boolean',
            'can_upload' => 'boolean',
            'monthly_upload_limit' => 'nullable|integer|min:0',
            'commission_rate' => 'nullable|numeric|between:0,100',
            'is_claimable' => 'boolean',
            'legacy_artist' => 'boolean',
        ]);

        // If user_id is provided, ensure user has settings (prevents duplicate key error)
        if ($request->user_id) {
            $user = \App\Models\User::find($request->user_id);
            if ($user && !$user->settings) {
                // Create user settings if they don't exist
                \App\Models\UserSettings::create(['user_id' => $user->id]);
            }
        }

        // Create artist with basic data
        $artist = new Artist($request->only([
            'user_id', 'stage_name', 'bio', 'country', 'website', 'social_links',
            'status', 'monthly_upload_limit', 'commission_rate'
        ]));

        // Generate unique slug from stage_name
        $baseSlug = \Illuminate\Support\Str::slug($request->stage_name);
        $slug = $baseSlug;
        $counter = 1;
        while (Artist::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }
        $artist->slug = $slug;

        // Handle boolean fields explicitly (checkboxes don't send false values)
        $artist->is_verified = $request->boolean('is_verified', false);
        $artist->is_trusted = $request->boolean('is_trusted', false);
        $artist->can_upload = $request->boolean('can_upload', true); // Default to true
        $artist->is_claimable = $request->boolean('is_claimable', !$request->user_id);
        $artist->legacy_artist = $request->boolean('legacy_artist', !$request->user_id);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $avatar = $request->file('avatar');
            $filename = time() . '_avatar_' . uniqid() . '.' . $avatar->getClientOriginalExtension();
            $path = $avatar->storeAs('music/artists', $filename, 'public');
            $artist->avatar = $path;
        }

        // Handle banner upload
        if ($request->hasFile('cover_image')) {
            $bannerFile = $request->file('cover_image');
            $filename = time() . '_banner_' . uniqid() . '.' . $bannerFile->getClientOriginalExtension();
            $path = $bannerFile->storeAs('music/artists', $filename, 'public');
            $artist->banner = $path;
        }

        $artist->save();

        // Update user's artist_id if user_id provided
        if ($request->user_id) {
            \App\Models\User::where('id', $request->user_id)->update(['artist_id' => $artist->id]);
        }

        $message = $artist->is_claimable 
            ? 'Legacy artist created successfully. Profile can be claimed by verified artists.' 
            : 'Artist created successfully';

        return redirect()->route('admin.music.artists.index')
            ->with('success', $message);
    }

    public function showArtist(Artist $artist)
    {
        $artist->load(['songs', 'albums']);

        $analytics = [
            'total_songs' => $artist->songs()->where('songs.status', 'published')->count(),
            'total_albums' => $artist->albums()->where('status', 'published')->count(),
            'total_plays' => $artist->songs()->sum('play_count'),
            'total_followers' => $artist->follower_count,
            'monthly_listeners' => $artist->getMonthlyListenersAttribute(),
            'revenue' => $artist->getTotalRevenueAttribute(),
        ];

        return view('admin.music.artists.show', compact('artist', 'analytics'));
    }

    public function editArtist(Artist $artist)
    {
        // Get users who don't have an artist profile yet, OR the current artist's user
        $users = \App\Models\User::whereDoesntHave('artist')
            ->orWhere('id', $artist->user_id)
            ->orderBy('display_name')
            ->get();
        // Get countries from users table
        $countries = \App\Models\User::whereNotNull('country')
            ->distinct()
            ->pluck('country')
            ->filter()
            ->sort()
            ->values();

        return view('admin.music.artists.edit', compact('artist', 'users', 'countries'));
    }

    public function updateArtist(Request $request, Artist $artist)
    {
        try {
            // Build validation rules
            $rules = [
                'user_id' => 'required|exists:users,id|unique:artists,user_id,' . $artist->id,
                'stage_name' => 'required|string|max:255',
                'bio' => 'nullable|string',
                'country' => 'nullable|string|max:255',
                'website_url' => 'nullable|url',
                'social_links' => 'nullable|array',
                'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'banner' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
                'status' => 'nullable|in:active,pending,suspended,banned',
                'verification_status' => 'nullable|in:pending,verified,rejected',
                'is_verified' => 'nullable|boolean',
                'is_trusted' => 'nullable|boolean',
                'can_upload' => 'nullable|boolean',
                'monthly_upload_limit' => 'nullable|integer|min:0',
                'commission_rate' => 'nullable|numeric|between:0,100',
            ];
            
            // Only validate slug uniqueness if it's being changed
            if ($request->filled('slug') && $request->slug !== $artist->slug) {
                $rules['slug'] = 'string|unique:artists,slug';
            } else {
                $rules['slug'] = 'nullable|string';
            }
            
            $validated = $request->validate($rules);

            \Log::info('Artist Update Started', [
                'artist_id' => $artist->id,
                'stage_name' => $request->stage_name,
                'current_slug' => $artist->slug,
                'new_slug' => $request->slug,
                'has_avatar' => $request->hasFile('avatar'),
                'has_banner' => $request->hasFile('banner'),
            ]);

            // Handle slug updates
            if ($request->filled('slug') && $request->slug !== $artist->slug) {
                // User is changing the slug to a new value
                $artist->slug = $request->slug;
            } elseif (!$request->filled('slug') && !$artist->slug) {
                // No slug provided and artist doesn't have one - generate it
                $slug = \Illuminate\Support\Str::slug($request->stage_name);
                $count = 1;
                while (Artist::where('slug', $slug)->where('id', '!=', $artist->id)->exists()) {
                    $slug = \Illuminate\Support\Str::slug($request->stage_name) . '-' . $count++;
                }
                $artist->slug = $slug;
            }
            // Otherwise keep existing slug (most common case)

            // Update basic fields
            $artist->user_id = $request->user_id;
            $artist->stage_name = $request->stage_name;
            $artist->bio = $request->bio;
            // Note: website_url stored in social_links JSON for now (no separate column)
            $artist->social_links = $request->social_links;
            // Note: monthly_upload_limit and commission_rate may need to be stored in metadata
            // $artist->monthly_upload_limit = $request->monthly_upload_limit ?? 10;
            // $artist->commission_rate = $request->commission_rate ?? 30;

            // Update status fields
            if ($request->filled('status')) {
                $artist->status = $request->status;
            }
            if ($request->filled('verification_badge')) {
                $artist->verification_badge = $request->verification_badge;
            }

            // Handle checkboxes (they won't be in request if unchecked)
            $artist->is_verified = $request->boolean('is_verified');
            $artist->is_trusted = $request->boolean('is_trusted');
            $artist->can_upload = $request->boolean('can_upload');

            // Handle avatar upload
            if ($request->hasFile('avatar')) {
                // Delete old avatar
                if ($artist->avatar && \Storage::disk('public')->exists($artist->avatar)) {
                    \Storage::disk('public')->delete($artist->avatar);
                }

                $avatar = $request->file('avatar');
                $filename = time() . '_avatar_' . uniqid() . '.' . $avatar->getClientOriginalExtension();
                $path = $avatar->storeAs('music/artists', $filename, 'public');
                $artist->avatar = $path;
                
                \Log::info('Avatar uploaded', ['path' => $path]);
            }

            // Handle banner upload (cover_image)
            if ($request->hasFile('banner')) {
                // Delete old banner
                if ($artist->banner && \Storage::disk('public')->exists($artist->banner)) {
                    \Storage::disk('public')->delete($artist->banner);
                }

                $bannerFile = $request->file('banner');
                $filename = time() . '_banner_' . uniqid() . '.' . $bannerFile->getClientOriginalExtension();
                $path = $bannerFile->storeAs('music/artists', $filename, 'public');
                $artist->banner = $path;
                
                \Log::info('Banner uploaded', ['path' => $path]);
            }

            $artist->save();

            \Log::info('Artist Updated Successfully', ['artist_id' => $artist->id]);

            return redirect()->route('admin.music.artists.show', $artist)
                ->with('success', 'Artist updated successfully');
                
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Artist Update Validation Failed', [
                'errors' => $e->errors(),
                'artist_id' => $artist->id
            ]);
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
                
        } catch (\Exception $e) {
            \Log::error('Artist Update Failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'artist_id' => $artist->id
            ]);
            return redirect()->back()
                ->with('error', 'Failed to update artist: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroyArtist(Artist $artist)
    {
        // Delete avatar and banner
        if ($artist->avatar) {
            Storage::disk('public')->delete($artist->avatar);
        }
        if ($artist->banner) {
            Storage::disk('public')->delete($artist->banner);
        }

        // Note: No need to update user table as the relationship is handled via artist.user_id
        // The user will automatically not have an artist when we delete the artist record

        $artist->delete();

        return redirect()->route('admin.music.artists.index')
            ->with('success', 'Artist deleted successfully');
    }

    public function toggleArtistVerification(Artist $artist)
    {
        $artist->update(['is_verified' => !$artist->is_verified]);

        $status = $artist->is_verified ? 'verified' : 'unverified';
        return back()->with('success', "Artist {$status} successfully");
    }

    public function bulkActions(Request $request)
    {
        $request->validate([
            'action' => 'required|in:approve,reject,delete,feature,unfeature',
            'items' => 'required|array',
            'type' => 'required|in:songs,albums,artists,playlists',
        ]);

        $count = 0;
        $model = $this->getModelClass($request->type);

        foreach ($request->items as $id) {
            $item = $model::find($id);
            if ($item) {
                switch ($request->action) {
                    case 'approve':
                        $item->update(['status' => 'published']);
                        break;
                    case 'reject':
                        $item->update(['status' => 'rejected']);
                        break;
                    case 'delete':
                        $item->delete();
                        break;
                    case 'feature':
                        $item->update(['is_featured' => true]);
                        break;
                    case 'unfeature':
                        $item->update(['is_featured' => false]);
                        break;
                }
                $count++;
            }
        }

        return back()->with('success', "{$count} items {$request->action}d successfully");
    }

    public function analytics(Request $request)
    {
        $period = $request->get('period', '30');
        $startDate = now()->subDays($period);

        $analytics = [
            'uploads_by_date' => Song::where('created_at', '>=', $startDate)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),

            'top_genres' => Genre::withCount(['songs' => function($q) use ($startDate) {
                $q->where('created_at', '>=', $startDate);
            }])
                ->orderBy('songs_count', 'desc')
                ->limit(10)
                ->get(),

            'content_status_breakdown' => [
                'songs' => Song::selectRaw('status, COUNT(*) as count')
                    ->groupBy('status')
                    ->pluck('count', 'status'),
                'albums' => Album::selectRaw('status, COUNT(*) as count')
                    ->groupBy('status')
                    ->pluck('count', 'status'),
            ],

            'artist_growth' => Artist::where('created_at', '>=', $startDate)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),

            'storage_stats' => [
                'total_size' => Song::sum('file_size'),
                'audio_files' => Song::count(),
                'image_files' => Album::whereNotNull('cover_image')->count() +
                                Artist::whereNotNull('avatar')->count(),
            ],
        ];

        return view('backend.music.analytics', compact('analytics', 'period'));
    }

    public function contentModeration(Request $request)
    {
        $filter = $request->get('filter', 'all');
        $type = $request->get('type', 'all');

        // Base queries for different content types
        $songQuery = Song::with(['artist', 'album']);
        $albumQuery = Album::with('artist');
        $artistQuery = Artist::with('user');

        // Apply status filters
        switch ($filter) {
            case 'pending':
                $songQuery->where('status', 'pending_review');
                $albumQuery->where('status', 'pending');
                $artistQuery->where('status', 'pending');
                break;
            case 'flagged':
                // Flagging system not yet implemented - return empty results for now
                $songQuery->whereRaw('1 = 0'); // Return no results
                $albumQuery->whereRaw('1 = 0'); // Return no results
                $artistQuery->whereRaw('1 = 0'); // Return no results
                break;
            case 'reported':
                // This would require a reports table - skip for now
                break;
        }

        $moderationData = [];

        if ($type === 'all' || $type === 'songs') {
            $moderationData['songs'] = $songQuery->latest()->limit(20)->get()->map(function($song) {
                return [
                    'id' => $song->id,
                    'type' => 'song',
                    'title' => $song->title,
                    'artist' => $song->artist->name ?? 'Unknown',
                    'status' => $song->status,
                    'uploaded_at' => $song->created_at,
                    'duration_seconds' => $song->duration,
                    'file_size' => $song->file_size,
                    'play_count' => $song->play_count,
                    'is_explicit' => $song->is_explicit ?? false,
                    'flagged_reason' => null, // Flagging not yet implemented
                ];
            });
        }

        if ($type === 'all' || $type === 'albums') {
            $moderationData['albums'] = $albumQuery->latest()->limit(20)->get()->map(function($album) {
                return [
                    'id' => $album->id,
                    'type' => 'album',
                    'title' => $album->title,
                    'artist' => $album->artist->name ?? 'Unknown',
                    'status' => $album->status,
                    'uploaded_at' => $album->created_at,
                    'track_count' => $album->songs()->count(),
                    'flagged_reason' => null, // Flagging not yet implemented
                ];
            });
        }

        if ($type === 'all' || $type === 'artists') {
            $moderationData['artists'] = $artistQuery->latest()->limit(20)->get()->map(function($artist) {
                return [
                    'id' => $artist->id,
                    'type' => 'artist',
                    'name' => $artist->stage_name ?? $artist->user->name ?? 'Unknown',
                    'email' => $artist->user->email ?? '',
                    'verification_status' => $artist->status ?? 'pending',
                    'created_at' => $artist->created_at,
                    'songs_count' => $artist->songs()->count(),
                    'is_verified' => $artist->is_verified,
                    'flagged_reason' => null, // Artists don't have flagged_reason column
                ];
            });
        }

        // Statistics for moderation dashboard
        $stats = [
            'pending_songs' => Song::where('status', 'pending_review')->count(),
            'pending_albums' => Album::where('status', 'pending')->count(),
            'pending_artists' => Artist::where('status', 'pending')->count(),
            'flagged_content' => 0, // Flagging system not yet implemented
            'total_processed_today' => Song::whereDate('updated_at', today())->count() +
                                     Album::whereDate('updated_at', today())->count(),
        ];

        return view('admin.moderation.index', compact('moderationData', 'stats', 'filter', 'type'));
    }

    public function moderateContent(Request $request)
    {
        $request->validate([
            'action' => 'required|in:approve,reject,unpublish,flag,unflag',
            'type' => 'required|in:song,album,artist',
            'id' => 'required|integer',
            'reason' => 'required_if:action,reject,unpublish,flag|string|max:500',
        ]);

        $model = $this->getModelClass($request->type . 's');
        $item = $model::findOrFail($request->id);

        switch ($request->action) {
            case 'approve':
                if ($request->following_type === 'artist') {
                    $item->update([
                        'status' => 'approved',
                        'is_verified' => true,
                        'verified_at' => now(),
                    ]);
                } else {
                    // For songs and albums
                    $item->update([
                        'status' => 'published',
                        'approved_at' => now(),
                        'approved_by' => auth()->id(),
                    ]);
                }
                $message = ucfirst($request->type) . ' approved and published successfully';
                break;

            case 'reject':
                if ($request->following_type === 'artist') {
                    $item->update([
                        'status' => 'rejected',
                        'is_verified' => false,
                        'rejection_reason' => $request->reason,
                    ]);
                } else {
                    // For songs and albums
                    $item->update([
                        'status' => 'rejected',
                        'rejection_reason' => $request->reason,
                        'review_notes' => $request->reason, // Some models use review_notes
                    ]);
                }
                $message = ucfirst($request->type) . ' rejected successfully';
                break;

            case 'unpublish':
                if ($request->following_type === 'artist') {
                    $item->update([
                        'status' => 'pending',
                        'is_verified' => false,
                        'rejection_reason' => $request->reason,
                    ]);
                } else {
                    // For songs and albums - move back to pending for review
                    $item->update([
                        'status' => 'pending_review',
                        'review_notes' => $request->reason,
                    ]);
                }
                $message = ucfirst($request->type) . ' unpublished and moved to pending review';
                break;

            case 'flag':
                // Flagging system not yet implemented
                $message = 'Flagging system will be implemented in a future update';
                break;

            case 'unflag':
                // Flagging system not yet implemented
                $message = 'Unflagging system will be implemented in a future update';
                break;
        }

        // Log moderation action
        $this->logModerationAction($item, $request->action, $request->reason);

        return response()->json(['success' => true, 'message' => $message]);
    }

    public function moderationLogs(Request $request)
    {
        // This would require a moderation_logs table
        // For now, return empty collection
        $logs = collect();

        return view('admin.moderation.logs', compact('logs'));
    }

    private function logModerationAction($item, $action, $reason = null)
    {
        // This would typically insert into a moderation_logs table
        // For now, we could use Laravel's activity log or create a simple log
        \Log::info('Moderation Action', [
            'moderator_id' => auth()->id(),
            'item_type' => get_class($item),
            'item_id' => $item->id,
            'action' => $action,
            'reason' => $reason,
            'timestamp' => now(),
        ]);
    }

    public function exportData(Request $request)
    {
        $type = $request->get('type', 'songs');
        $format = $request->get('format', 'csv');

        $filename = $type . '_export_' . now()->format('Y-m-d_H-i-s') . '.' . $format;

        switch ($type) {
            case 'songs':
                return $this->exportSongs($format, $filename);
            case 'artists':
                return $this->exportArtists($format, $filename);
            case 'albums':
                return $this->exportAlbums($format, $filename);
            default:
                return back()->with('error', 'Invalid export type');
        }
    }

    public function reportedContent(Request $request)
    {
        // This would require a reports table, for now return empty view
        $reports = collect();

        return view('backend.music.reports', compact('reports'));
    }

    public function featuredContent()
    {
        $featured = [
            'songs' => Song::where('is_featured', true)
                ->with(['artist', 'album'])
                ->paginate(20, ['*'], 'songs_page'),
            'albums' => Album::where('is_featured', true)
                ->with('artist')
                ->paginate(20, ['*'], 'albums_page'),
            'artists' => Artist::where('is_featured', true)
                ->paginate(20, ['*'], 'artists_page'),
        ];

        return view('backend.music.featured', compact('featured'));
    }

    private function getModelClass($type)
    {
        switch ($type) {
            case 'songs':
                return Song::class;
            case 'albums':
                return Album::class;
            case 'artists':
                return Artist::class;
            case 'playlists':
                return Playlist::class;
            default:
                throw new \InvalidArgumentException('Invalid model type');
        }
    }

    private function exportSongs($format, $filename)
    {
        $songs = Song::with(['artist', 'album', 'genre'])->get();

        $data = $songs->map(function($song) {
            return [
                'ID' => $song->id,
                'Title' => $song->title,
                'Artist' => $song->artist->name ?? 'Unknown',
                'Album' => $song->album->title ?? '',
                'Genre' => $song->genre->name ?? '',
                'duration_seconds' => $song->duration,
                'Play Count' => $song->play_count,
                'Status' => $song->status,
                'Created At' => $song->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return $this->downloadData($data, $filename, $format);
    }

    private function exportArtists($format, $filename)
    {
        $artists = Artist::withCount(['songs', 'albums'])->get();

        $data = $artists->map(function($artist) {
            return [
                'ID' => $artist->id,
                'Name' => $artist->name,
                'Email' => $artist->email ?? '',
                'Country' => $artist->country ?? '',
                'Songs Count' => $artist->songs_count,
                'Albums Count' => $artist->albums_count,
                'Verified' => $artist->is_verified ? 'Yes' : 'No',
                'Created At' => $artist->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return $this->downloadData($data, $filename, $format);
    }

    private function exportAlbums($format, $filename)
    {
        $albums = Album::with(['artist'])->withCount('songs')->get();

        $data = $albums->map(function($album) {
            return [
                'ID' => $album->id,
                'Title' => $album->title,
                'Artist' => $album->artist->name ?? 'Unknown',
                'Track Count' => $album->songs_count,
                'Release Date' => $album->release_date ?? '',
                'Status' => $album->status,
                'Created At' => $album->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return $this->downloadData($data, $filename, $format);
    }

    private function downloadData($data, $filename, $format)
    {
        if ($format === 'csv') {
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ];

            $callback = function() use ($data) {
                $file = fopen('php://output', 'w');

                if ($data->isNotEmpty()) {
                    fputcsv($file, array_keys($data->first()));
                    foreach ($data as $row) {
                        fputcsv($file, $row);
                    }
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

        return back()->with('error', 'Unsupported export format');
    }

    public function playlists(Request $request)
    {
        // Get statistics for the view
        $publicPlaylists = Playlist::where('visibility', 'public')->count();  // Fixed: privacy -> visibility
        $collaborativePlaylists = Playlist::where('is_collaborative', true)->count();
        $totalFollowers = \DB::table('playlist_followers')->count();

        $query = Playlist::with(['user'])->withCount(['songs', 'followers']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")  // Column is 'name' not 'title'
                  ->orWhere('description', 'LIKE', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'LIKE', "%{$search}%");
                  });
            });
        }

        // Filters
        if ($request->filled('visibility')) {  // Fixed: privacy -> visibility
            $query->where('visibility', $request->visibility);
        }

        // Note: playlists table doesn't have a 'type' column

        if ($request->filled('is_collaborative')) {
            $query->where('is_collaborative', $request->boolean('is_collaborative'));
        }

        // Sorting
        $sortBy = $request->get('sort', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $playlists = $query->paginate($request->get('per_page', 25));

        return view('admin.music.playlists.index', compact(
            'playlists',
            'publicPlaylists',
            'collaborativePlaylists',
            'totalFollowers'
        ));
    }

    public function togglePlaylistFeatured(Playlist $playlist)
    {
        // Since is_featured column doesn't exist, we'll use a different approach
        // You can add this column via migration or use another method
        // For now, let's comment this out or use a different field
        return back()->with('error', 'Featured playlist functionality needs to be implemented');
    }

    public function deletePlaylist(Playlist $playlist)
    {
        $playlist->delete();

        return back()->with('success', 'Playlist deleted successfully');
    }

    // Song Creation Methods for Admin
    public function createSong(Request $request)
    {
        $artists = Artist::where('status', 'active')->orderBy('stage_name')->get();
        $albums = Album::where('status', 'published')->orderBy('title')->get();
        $genres = Genre::orderBy('name')->get();
        $statuses = ['draft', 'published', 'archived'];
        $languages = config('music.uganda.local_languages', ['English', 'Luganda', 'Swahili']);

        // Get preselected artist if provided (support both artist_id and artist parameters)
        $preselectedArtist = null;
        $artistId = $request->get('artist_id') ?? $request->get('artist');
        if ($artistId) {
            $preselectedArtist = Artist::find($artistId);
        }

        return view('admin.music.songs.create', compact('artists', 'albums', 'genres', 'statuses', 'languages', 'preselectedArtist'));
    }

    public function storeSong(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'artist_id' => 'required|exists:artists,id',
            'album_id' => 'nullable|exists:albums,id',
            'genre_id' => 'required|exists:genres,id',
            'audio_file_original' => 'required|file|mimes:mp3,wav,flac,aac,m4a|max:51200', // 50MB
            'artwork' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240', // 10MB
            'track_number' => 'nullable|integer|min:1',
            'duration_seconds' => 'nullable|integer|min:1', // Optional - will be auto-extracted
            'description' => 'nullable|string',
            'lyrics' => 'nullable|string',
            'language' => 'required|string|max:50', // Form sends 'language', will map to 'primary_language'
            'is_free' => 'boolean',
            'price' => 'nullable|numeric|min:0',
            'status' => 'required|in:draft,published,archived,pending_review',
            'is_explicit' => 'boolean',
            'is_downloadable' => 'boolean',
            'release_date' => 'nullable|date',
        ]);

        try {
            \DB::beginTransaction();

            $artist = Artist::findOrFail($request->artist_id);

            // Use MusicStorageService to handle file storage
            $storageService = new \App\Services\MusicStorageService();

            // Store audio file
            $audioResult = $storageService->storeMusicFile(
                $request->file('audio_file_original'),
                $artist,
                'song',
                \App\Services\MusicStorageService::ACCESS_PRIVATE
            );

            if (!$audioResult['success']) {
                throw new \Exception('Failed to store audio file: ' . $audioResult['error']);
            }

            // Extract audio duration if not provided
            $duration = $request->duration_seconds;
            if (!$duration && isset($audioResult['file_info']['duration'])) {
                $duration = $audioResult['file_info']['duration'];
            }

            // If still no duration, try to extract from file
            if (!$duration) {
                try {
                    $audioPath = storage_path('app/public/' . $audioResult['storage_path']);
                    if (file_exists($audioPath) && function_exists('shell_exec')) {
                        $output = shell_exec("ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 " . escapeshellarg($audioPath));
                        if ($output) {
                            $duration = (int) round(floatval(trim($output)));
                        }
                    }
                } catch (\Exception $e) {
                    \Log::warning('Could not extract audio duration: ' . $e->getMessage());
                }
            }

            // Default duration to 180 seconds (3 minutes) if still not available
            if (!$duration) {
                $duration = 180;
                \Log::warning('Using default duration for song: ' . $request->title);
            }

            // Store artwork if provided
            $artworkResult = null;
            if ($request->hasFile('artwork')) {
                $artworkResult = $storageService->storeArtwork(
                    $request->file('artwork'),
                    $artist,
                    'song_cover',
                    \App\Services\MusicStorageService::ACCESS_PUBLIC
                );
            }

            // Create song record
            // For legacy artists without user accounts, use the admin's user_id
            $userId = $artist->user_id ?? auth()->id();
            
            $song = Song::create([
                'title' => $request->title,
                'slug' => \Str::slug($request->title . '-' . $artist->stage_name),
                'user_id' => $userId, // Use artist's user_id or admin's for legacy artists
                'artist_id' => $request->artist_id,
                'album_id' => $request->album_id,
                'primary_genre_id' => $request->genre_id,
                'track_number' => $request->track_number,
                'duration_seconds' => $duration,
                'description' => $request->description,
                'lyrics' => $request->lyrics,
                'primary_language' => $request->language, // Map 'language' to 'primary_language'
                'is_free' => $request->boolean('is_free'),
                'price' => $request->price ?? 0,
                'status' => $request->status,
                'is_explicit' => $request->boolean('is_explicit'),
                'is_downloadable' => $request->boolean('is_downloadable', true),
                'published_at' => $request->release_date ?? now(),

                // File metadata
                'audio_file_original' => $audioResult['storage_path'],
                'artwork' => $artworkResult && $artworkResult['success'] ? $artworkResult['storage']['path'] : null,
                'file_format' => $audioResult['file_info']['extension'],
                'file_size_bytes' => $audioResult['file_info']['size'],
                'file_hash' => $audioResult['file_info']['hash'],

                // Distribution status - use 'not_submitted' as default
                'distribution_status' => 'not_submitted',
            ]);

            // Generate ISRC code if auto-generation is enabled
            if (config('music.isrc.auto_generate')) {
                $song->update([
                    'isrc_code' => $this->generateISRCCode($artist, $song)
                ]);
            }

            \DB::commit();

            return redirect()->route('admin.music.songs.show', $song)
                ->with('success', 'Song created successfully!');

        } catch (\Exception $e) {
            \DB::rollback();
            \Log::error('Admin song creation failed', [
                'error' => $e->getMessage(),
                'admin_id' => auth()->id()
            ]);

            return back()->with('error', 'Failed to create song: ' . $e->getMessage())->withInput();
        }
    }

    // Artist Moderation Methods
    public function approveSong(Request $request, Song $song)
    {
        $song->update([
            'status' => 'published',
            'approved_at' => now(),
            'approved_by' => auth()->id(),
            'admin_notes' => ($song->admin_notes ?? '') . "\nApproved by admin: " . auth()->user()->name . " at " . now()
        ]);

        // Return JSON for AJAX requests
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Song approved and published successfully',
                'song' => [
                    'id' => $song->id,
                    'status' => $song->status,
                    'approved_at' => $song->approved_at->format('Y-m-d H:i:s')
                ]
            ]);
        }

        return back()->with('success', 'Song approved and published successfully');
    }

    public function rejectSong(Song $song)
    {
        $song->update([
            'status' => 'rejected',
            'rejected_at' => now(),
            'rejected_by' => auth()->id(),
            'admin_notes' => ($song->admin_notes ?? '') . "\nRejected by admin: " . auth()->user()->name . " at " . now()
        ]);

        return back()->with('success', 'Song rejected successfully');
    }

    public function featureSong(Song $song)
    {
        $song->update([
            'is_featured' => !$song->is_featured,
            'featured_at' => $song->is_featured ? null : now(),
            'featured_by' => $song->is_featured ? null : auth()->id(),
        ]);

        $message = $song->is_featured ? 'Song featured successfully' : 'Song unfeatured successfully';
        return back()->with('success', $message);
    }

    public function verifyArtist(Artist $artist)
    {
        $isVerifying = !$artist->is_verified;
        
        $artist->update([
            'is_verified' => $isVerifying,
            'verification_status' => $isVerifying ? 'verified' : 'pending',
            'verified_at' => $isVerifying ? now() : null,
            'verified_by' => $isVerifying ? auth()->id() : null,
        ]);

        $message = $isVerifying ? 'Artist verified successfully' : 'Artist verification removed';
        return back()->with('success', $message);
    }

    public function featureArtist(Artist $artist)
    {
        $artist->update([
            'is_featured' => !$artist->is_featured,
            'featured_at' => $artist->is_featured ? null : now(),
            'featured_by' => $artist->is_featured ? null : auth()->id(),
        ]);

        $message = $artist->is_featured ? 'Artist featured successfully' : 'Artist unfeatured successfully';
        return back()->with('success', $message);
    }

    // Album Management Methods
    public function createAlbum(Request $request)
    {
        $artists = Artist::approved()->orderBy('stage_name')->get();
        $genres = Genre::orderBy('name')->get();

        // Get preselected artist if provided
        $preselectedArtist = null;
        $artistId = $request->get('artist_id') ?? $request->get('artist');
        if ($artistId) {
            $preselectedArtist = Artist::find($artistId);
        }

        return view('admin.music.albums.create', compact('artists', 'genres', 'preselectedArtist'));
    }

    public function storeAlbum(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'artist_id' => 'required|exists:artists,id',
            'description' => 'nullable|string',
            'genre_id' => 'nullable|exists:genres,id',
            'release_date' => 'required|date',
            'status' => 'required|in:draft,published,archived',
            'type' => 'required|in:album,ep,single,compilation',
            'artwork' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        $album = new Album($request->only([
            'title', 'artist_id', 'description', 'genre_id', 'release_date', 'status', 'type'
        ]));

        // Handle artwork upload
        if ($request->hasFile('artwork')) {
            $artwork = $request->file('artwork');
            $filename = time() . '_' . uniqid() . '.' . $artwork->getClientOriginalExtension();
            $path = $artwork->storeAs('music/albums', $filename, 'public');
            $album->artwork = $path;
        }

        $album->save();

        return redirect()->route('admin.music.albums.index')
            ->with('success', 'Album created successfully');
    }

    public function showAlbum(Album $album)
    {
        $album->load(['artist', 'genre', 'songs']);

        return view('admin.music.albums.show', compact('album'));
    }

    public function editAlbum(Album $album)
    {
        $artists = Artist::approved()->orderBy('stage_name')->get();
        $genres = Genre::orderBy('name')->get();

        return view('admin.music.albums.edit', compact('album', 'artists', 'genres'));
    }

    public function updateAlbum(Request $request, Album $album)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'artist_id' => 'required|exists:artists,id',
            'description' => 'nullable|string',
            'genre_id' => 'nullable|exists:genres,id',
            'release_date' => 'required|date',
            'status' => 'required|in:draft,published,archived',
            'type' => 'required|in:album,ep,single,compilation',
            'artwork' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        $album->fill($request->only([
            'title', 'artist_id', 'description', 'genre_id', 'release_date', 'status', 'type'
        ]));

        // Handle artwork upload
        if ($request->hasFile('artwork')) {
            // Delete old artwork
            if ($album->artwork) {
                Storage::disk('public')->delete($album->artwork);
            }

            $artwork = $request->file('artwork');
            $filename = time() . '_' . uniqid() . '.' . $artwork->getClientOriginalExtension();
            $path = $artwork->storeAs('music/albums', $filename, 'public');
            $album->artwork = $path;
        }

        $album->save();

        return redirect()->route('backend.music.albums.show', $album)
            ->with('success', 'Album updated successfully');
    }

    public function destroyAlbum(Album $album)
    {
        // Delete artwork
        if ($album->artwork) {
            Storage::disk('public')->delete($album->artwork);
        }

        $album->delete();

        return redirect()->route('admin.music.albums.index')
            ->with('success', 'Album deleted successfully');
    }

    public function featureAlbum(Album $album)
    {
        $album->update([
            'is_featured' => !$album->is_featured,
            'featured_at' => $album->is_featured ? null : now(),
            'featured_by' => $album->is_featured ? null : auth()->id(),
        ]);

        $message = $album->is_featured ? 'Album featured successfully' : 'Album unfeatured successfully';
        return back()->with('success', $message);
    }

    // Playlist Management Methods
    public function createPlaylist()
    {
        $users = \App\Models\User::orderBy('name')->get();

        return view('admin.music.playlists.create', compact('users'));
    }

    public function storePlaylist(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',  // Fixed: name -> title
            'user_id' => 'required|exists:users,id',
            'description' => 'nullable|string',
            'visibility' => 'required|in:public,private,unlisted',  // Fixed: privacy -> visibility
            'is_collaborative' => 'boolean',
            'artwork' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        $playlist = new \App\Models\Playlist($request->only([
            'title', 'user_id', 'description', 'visibility', 'is_collaborative'  // Fixed column names
        ]));

        // Generate slug
        $playlist->slug = \Illuminate\Support\Str::slug($playlist->title);

        // Handle artwork upload
        if ($request->hasFile('artwork')) {
            $artwork = $request->file('artwork');
            $filename = time() . '_' . uniqid() . '.' . $artwork->getClientOriginalExtension();
            $path = $artwork->storeAs('music/playlists', $filename, 'public');
            $playlist->artwork = $path;
        }

        $playlist->save();

        return redirect()->route('admin.music.playlists.index')
            ->with('success', 'Playlist created successfully');
    }

    public function showPlaylist(\App\Models\Playlist $playlist)
    {
        $playlist->load(['owner', 'songs' => function($query) {
            $query->with(['artist', 'album']);
        }]);

        return view('admin.music.playlists.show', compact('playlist'));
    }

    public function editPlaylist(\App\Models\Playlist $playlist)
    {
        $users = \App\Models\User::orderBy('name')->get();

        return view('admin.music.playlists.edit', compact('playlist', 'users'));
    }

    public function updatePlaylist(Request $request, \App\Models\Playlist $playlist)
    {
        $request->validate([
            'title' => 'required|string|max:255',  // Fixed: name -> title
            'user_id' => 'required|exists:users,id',
            'description' => 'nullable|string',
            'visibility' => 'required|in:public,private,unlisted',  // Fixed: privacy -> visibility
            'is_collaborative' => 'boolean',
            'artwork' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        $playlist->fill($request->only([
            'title', 'user_id', 'description', 'visibility', 'is_collaborative'  // Fixed column names
        ]));

        // Update slug if title changed
        if ($playlist->isDirty('title')) {
            $playlist->slug = \Illuminate\Support\Str::slug($playlist->title);
        }

        // Handle artwork upload
        if ($request->hasFile('artwork')) {
            // Delete old artwork
            if ($playlist->artwork) {
                Storage::disk('public')->delete($playlist->artwork);
            }

            $artwork = $request->file('artwork');
            $filename = time() . '_' . uniqid() . '.' . $artwork->getClientOriginalExtension();
            $path = $artwork->storeAs('music/playlists', $filename, 'public');
            $playlist->artwork = $path;
        }

        $playlist->save();

        return redirect()->route('admin.music.playlists.show', $playlist)
            ->with('success', 'Playlist updated successfully');
    }

    public function destroyPlaylist(\App\Models\Playlist $playlist)
    {
        // Delete artwork
        if ($playlist->artwork) {
            Storage::disk('public')->delete($playlist->artwork);
        }

        $playlist->delete();

        return redirect()->route('admin.music.playlists.index')
            ->with('success', 'Playlist deleted successfully');
    }

    public function featurePlaylist(\App\Models\Playlist $playlist)
    {
        $playlist->update([
            'is_featured' => !$playlist->is_featured,
            'featured_at' => $playlist->is_featured ? null : now(),
            'featured_by' => $playlist->is_featured ? null : auth()->id(),
        ]);

        $message = $playlist->is_featured ? 'Playlist featured successfully' : 'Playlist unfeatured successfully';
        return back()->with('success', $message);
    }

    /**
     * AJAX endpoint for artist search (used by Select2)
     */
    public function searchArtists(Request $request)
    {
        $search = $request->get('q', '');
        $page = $request->get('page', 1);
        $perPage = 20;

        $query = Artist::query()
            ->whereIn('status', ['approved', 'active'])
            ->orderBy('stage_name');

        if (!empty($search)) {
            $query->where('stage_name', 'LIKE', "%{$search}%");
        }

        $total = $query->count();
        $artists = $query->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get(['id', 'stage_name', 'is_verified']);

        return response()->json([
            'results' => $artists->map(function($artist) {
                return [
                    'id' => $artist->id,
                    'text' => $artist->stage_name . ($artist->is_verified ? ' ✓' : ''),
                ];
            }),
            'pagination' => [
                'more' => ($page * $perPage) < $total
            ]
        ]);
    }

    /**
     * Generate ISRC code for the song
     */
    private function generateISRCCode(Artist $artist, Song $song): string
    {
        $countryCode = config('music.isrc.country_code', 'UG');
        $registrantCode = str_pad(
            substr(preg_replace('/[^A-Z0-9]/', '', strtoupper($artist->name)), 0, 3),
            3,
            '0'
        );
        $year = now()->format('y');
        $designation = str_pad($song->id, 5, '0', STR_PAD_LEFT);

        return "{$countryCode}-{$registrantCode}-{$year}-{$designation}";
    }

    /**
     * Show pending artists
     */
    public function pending(Request $request)
    {
        $artists = Artist::where('status', 'pending')
            ->withCount(['songs', 'albums'])
            ->orderBy('created_at', 'desc')
            ->paginate(25);

        return view('admin.music.artists.pending', compact('artists'));
    }

    /**
     * Show verified artists
     */
    public function verified(Request $request)
    {
        $artists = Artist::where('is_verified', true)
            ->withCount(['songs', 'albums'])
            ->orderBy('verified_at', 'desc')
            ->paginate(25);

        return view('admin.music.artists.verified', compact('artists'));
    }

    /**
     * Show rejected artists
     */
    public function rejected(Request $request)
    {
        $artists = Artist::where('status', 'rejected')
            ->withCount(['songs', 'albums'])
            ->orderBy('updated_at', 'desc')
            ->paginate(25);

        return view('admin.music.artists.rejected', compact('artists'));
    }

    /**
     * Show suspended artists
     */
    public function suspended(Request $request)
    {
        $artists = Artist::where('status', 'suspended')
            ->withCount(['songs', 'albums'])
            ->orderBy('updated_at', 'desc')
            ->paginate(25);

        return view('admin.music.artists.suspended', compact('artists'));
    }

    /**
     * Approve an artist
     */
    public function approve($id)
    {
        try {
            $artist = Artist::findOrFail($id);
            
            \Illuminate\Support\Facades\DB::transaction(function () use ($artist) {
                // Update artist status
                $artist->update([
                    'status' => 'active',
                    'is_verified' => true,
                    'verified_at' => now(),
                ]);

                // Update user status if exists
                if ($artist->user) {
                    $artist->user->update([
                        'is_verified' => true,
                        'verified_at' => now(),
                        'verified_by' => auth()->id(),
                        'application_status' => 'approved',
                    ]);

                    // Clear role cache
                    cache()->forget("user:{$artist->user->id}:roles");

                    // Assign artist role if not already assigned
                    $artistRole = \App\Models\Role::whereRaw('LOWER(name) = ?', ['artist'])->first();
                    if ($artistRole && !$artist->user->roles()->where('role_id', $artistRole->id)->exists()) {
                        $artist->user->roles()->attach($artistRole->id, [
                            'assigned_at' => now(),
                            'assigned_by' => auth()->id(),
                        ]);
                    }
                }
            });

            return redirect()->back()->with('success', "Artist '{$artist->stage_name}' has been approved successfully.");
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to approve artist', [
                'artist_id' => $id,
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'Failed to approve artist: ' . $e->getMessage());
        }
    }

    /**
     * Reject an artist
     */
    public function reject(Request $request, $id)
    {
        try {
            $artist = Artist::findOrFail($id);
            
            $artist->update([
                'status' => 'rejected',
                'rejection_reason' => $request->input('reason'),
            ]);

            if ($artist->user) {
                $artist->user->update([
                    'application_status' => 'rejected',
                ]);
            }

            return redirect()->back()->with('success', "Artist '{$artist->stage_name}' has been rejected.");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to reject artist: ' . $e->getMessage());
        }
    }

    /**
     * Suspend an artist
     */
    public function suspend(Request $request, $id)
    {
        try {
            $artist = Artist::findOrFail($id);
            
            $artist->update([
                'status' => 'suspended',
                'suspension_reason' => $request->input('reason'),
            ]);

            return redirect()->back()->with('success', "Artist '{$artist->stage_name}' has been suspended.");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to suspend artist: ' . $e->getMessage());
        }
    }

    /**
     * Reactivate an artist
     */
    public function reactivate($id)
    {
        try {
            $artist = Artist::findOrFail($id);
            
            $artist->update([
                'status' => 'active',
            ]);

            return redirect()->back()->with('success', "Artist '{$artist->stage_name}' has been reactivated.");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to reactivate artist: ' . $e->getMessage());
        }
    }

    /**
     * Show artist revenue
     */
    public function revenue($id)
    {
        $artist = Artist::with('user')->findOrFail($id);
        
        return view('admin.music.artists.revenue', compact('artist'));
    }

    /**
     * Show artist analytics
     */
    public function artistAnalytics($id)
    {
        $artist = Artist::with('user')->findOrFail($id);
        
        return view('admin.music.artists.analytics', compact('artist'));
    }

}