<?php

namespace App\Http\Controllers\Api\Music;

use App\Http\Controllers\Controller;
use App\Models\Playlist;
use App\Models\Song;
use App\Models\PlaylistSong;
use App\Models\UserFollow;
use App\Models\Download;
use App\Models\UserFollow as Follow;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class PlaylistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Playlist::with(['user', 'songs'])
                ->where('is_public', true)
                ->where('is_active', true);

            // Filters
            if ($request->has('featured')) {
                $query->where('is_featured', $request->boolean('featured'));
            }

            if ($request->has('collaborative')) {
                $query->where('is_collaborative', $request->boolean('collaborative'));
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            switch ($sortBy) {
                case 'popularity':
                    $query->orderBy('followers_count', $sortOrder);
                    break;
                case 'songs':
                    $query->withCount('songs')->orderBy('songs_count', $sortOrder);
                    break;
                default:
                    $query->orderBy($sortBy, $sortOrder);
            }

            $playlists = $query->paginate($request->get('per_page', 20));

            // Add user-specific data
            if (auth()->check()) {
                $playlists->getCollection()->each(function ($playlist) {
                    $playlist->is_following = Follow::where('user_id', auth()->id())
                        ->where('followable_type', Playlist::class)
                        ->where('followable_id', $playlist->id)
                        ->exists();
                });
            }

            return response()->json([
                'success' => true,
                'data' => $playlists
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch playlists',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function myPlaylists(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();

            $playlists = Playlist::where('user_id', $user->id)
                ->with(['songs.artist'])
                ->withCount('songs')
                ->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 20));

            return response()->json([
                'success' => true,
                'data' => $playlists
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user playlists',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function featured(Request $request): JsonResponse
    {
        try {
            $playlists = Playlist::with(['user', 'songs'])
                ->where('is_featured', true)
                ->where('is_public', true)
                ->where('is_active', true)
                ->orderBy('created_at', 'desc')
                ->limit($request->get('limit', 10))
                ->get();

            return response()->json([
                'success' => true,
                'data' => $playlists
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch featured playlists',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            // Accept both 'title' and 'name' for flexibility
            $playlistName = $request->input('title') ?? $request->input('name');
            
            $validator = Validator::make(array_merge($request->all(), ['playlist_name' => $playlistName]), [
                'playlist_name' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'is_public' => 'boolean',
                'is_collaborative' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Map is_public to visibility
            $visibility = $request->boolean('is_public', true) ? 'public' : 'private';

            $playlist = Playlist::create([
                'user_id' => auth()->id(),
                'name' => $playlistName,  // Use 'name' which is the actual DB column
                'description' => $request->description,
                'visibility' => $visibility,
                'is_collaborative' => $request->boolean('is_collaborative', false),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Playlist created successfully',
                'data' => $playlist
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create playlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Playlist $playlist): JsonResponse
    {
        try {
            // Check if user can view this playlist
            if (!$playlist->is_public && (!auth()->check() || $playlist->user_id !== auth()->id())) {
                return response()->json([
                    'success' => false,
                    'message' => 'Playlist not found or access denied'
                ], 404);
            }

            $playlist->load([
                'user',
                'songs.artist',
                'songs.album',
                'collaborators'
            ]);

            // Add user-specific data
            if (auth()->check()) {
                $playlist->is_following = Follow::where('user_id', auth()->id())
                    ->where('followable_type', Playlist::class)
                    ->where('followable_id', $playlist->id)
                    ->exists();

                $playlist->can_edit = $playlist->canBeEditedBy(auth()->user());
                $playlist->can_download = $playlist->isAvailableForOfflineDownload();
            }

            return response()->json([
                'success' => true,
                'data' => $playlist
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch playlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Playlist $playlist): JsonResponse
    {
        try {
            $user = auth()->user();

            if (!$playlist->canBeEditedBy($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to edit this playlist'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'is_public' => 'boolean',
                'is_collaborative' => 'boolean',
                'cover_image' => 'nullable|string|max:500',
                'mood' => 'nullable|string|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $playlist->update($request->only([
                'title', 'description', 'is_public', 'is_collaborative', 'cover_image', 'mood'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Playlist updated successfully',
                'data' => $playlist->fresh()->load('user')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update playlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Playlist $playlist): JsonResponse
    {
        try {
            $user = auth()->user();

            if ($playlist->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to delete this playlist'
                ], 403);
            }

            $playlist->delete();

            return response()->json([
                'success' => true,
                'message' => 'Playlist deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete playlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add song to playlist (with track_id in request body)
     * Alternative endpoint for modal compatibility
     */
    public function addSongFromBody(Request $request, Playlist $playlist): JsonResponse
    {
        try {
            $user = auth()->user();

            if (!$playlist->canBeEditedBy($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to edit this playlist'
                ], 403);
            }

            // Get song ID from request body (supports both track_id and song_id)
            $songId = $request->input('track_id') ?? $request->input('song_id');
            
            if (!$songId) {
                return response()->json([
                    'success' => false,
                    'message' => 'No track_id or song_id provided'
                ], 422);
            }

            $song = Song::find($songId);
            
            if (!$song) {
                return response()->json([
                    'success' => false,
                    'message' => 'Song not found'
                ], 404);
            }

            // Check if song already in playlist
            $existingEntry = PlaylistSong::where('playlist_id', $playlist->id)
                ->where('song_id', $song->id)
                ->first();

            if ($existingEntry) {
                return response()->json([
                    'success' => false,
                    'message' => 'Song already exists in playlist'
                ], 409);
            }

            $playlist->addSong($song, $user);

            return response()->json([
                'success' => true,
                'message' => 'Song added to playlist successfully',
                'data' => [
                    'playlist_id' => $playlist->id,
                    'song_id' => $song->id,
                    'total_tracks' => $playlist->fresh()->total_tracks
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add song to playlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function addSong(Request $request, Playlist $playlist, Song $song): JsonResponse
    {
        try {
            $user = auth()->user();

            if (!$playlist->canBeEditedBy($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to edit this playlist'
                ], 403);
            }

            // Check if song already in playlist
            $existingEntry = PlaylistSong::where('playlist_id', $playlist->id)
                ->where('song_id', $song->id)
                ->first();

            if ($existingEntry) {
                return response()->json([
                    'success' => false,
                    'message' => 'Song already exists in playlist'
                ], 409);
            }

            $playlist->addSong($song, $user);

            return response()->json([
                'success' => true,
                'message' => 'Song added to playlist successfully',
                'data' => [
                    'playlist_id' => $playlist->id,
                    'song_id' => $song->id,
                    'total_tracks' => $playlist->fresh()->total_tracks
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add song to playlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function removeSong(Playlist $playlist, Song $song): JsonResponse
    {
        try {
            $user = auth()->user();

            if (!$playlist->canBeEditedBy($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to edit this playlist'
                ], 403);
            }

            $removed = $playlist->removeSong($song);

            if (!$removed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Song not found in playlist'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Song removed from playlist successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove song from playlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function toggleFollow(Playlist $playlist): JsonResponse
    {
        try {
            $user = auth()->user();

            if ($playlist->user_id === $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot follow your own playlist'
                ], 400);
            }

            $isFollowing = Follow::where('user_id', $user->id)
                ->where('followable_type', Playlist::class)
                ->where('followable_id', $playlist->id)
                ->first();

            if ($isFollowing) {
                $isFollowing->delete();
                $playlist->decrement('follower_count');
                $message = 'Playlist unfollowed';
                $following = false;
            } else {
                Follow::create([
                    'user_id' => $user->id,
                    'followable_type' => Playlist::class,
                    'followable_id' => $playlist->id,
                ]);
                $playlist->increment('follower_count');
                $message = 'Playlist followed';
                $following = true;
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'is_following' => $following,
                'follower_count' => $playlist->fresh()->follower_count
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle follow',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadOffline(Playlist $playlist): JsonResponse
    {
        try {
            $user = auth()->user();

            if (!$playlist->isAvailableForOfflineDownload()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This playlist is not available for offline download'
                ], 403);
            }

            if (!$user->canDownload()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Download limit reached. Upgrade to premium for unlimited downloads.'
                ], 403);
            }

            // Get downloadable tracks
            $downloadableSongs = $playlist->getDownloadableTracksAttribute();

            $downloads = [];
            foreach ($downloadableSongs as $song) {
                $existingDownload = Download::where('user_id', $user->id)
                    ->where('downloadable_type', Song::class)
                    ->where('downloadable_id', $song->id)
                    ->first();

                if (!$existingDownload) {
                    $download = Download::create([
                        'user_id' => $user->id,
                        'downloadable_type' => Song::class,
                        'downloadable_id' => $song->id,
                        'download_quality' => $user->settings->download_quality ?? '128kbps',
                        'file_size' => $song->file_size,
                        'expires_at' => $song->is_free ? null : now()->addDays(30),
                    ]);

                    $downloads[] = $download;
                    $song->increment('download_count');
                }
            }

            // Create activity
            $user->activities()->create([
                'type' => 'downloaded_playlist',
                'activityable_type' => Playlist::class,
                'activityable_id' => $playlist->id,
                'data' => [
                    'playlist_title' => $playlist->title,
                    'songs_count' => count($downloads),
                ]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Playlist download initiated successfully',
                'downloads_count' => count($downloads),
                'total_songs' => $downloadableSongs->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to download playlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}