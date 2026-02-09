<?php

namespace App\Http\Controllers\Api\Music;

use App\Http\Controllers\Controller;
use App\Models\Artist;
use App\Models\UserFollow;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ArtistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Artist::where('status', 'active')
                ->where('is_verified', true);

            // Filters
            if ($request->has('genre')) {
                $query->whereHas('songs.genre', function($q) use ($request) {
                    $q->where('slug', $request->genre);
                });
            }

            if ($request->has('country')) {
                $query->where('country', $request->country);
            }

            if ($request->has('verified_only')) {
                $query->where('is_verified', $request->boolean('verified_only'));
            }

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('bio', 'LIKE', "%{$search}%");
                });
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'followers_count');
            $sortOrder = $request->get('sort_order', 'desc');

            switch ($sortBy) {
                case 'popularity':
                    $query->orderBy('followers_count', $sortOrder);
                    break;
                case 'songs':
                    $query->withCount('songs')->orderBy('songs_count', $sortOrder);
                    break;
                case 'plays':
                    $query->orderBy('total_plays', $sortOrder);
                    break;
                default:
                    $query->orderBy($sortBy, $sortOrder);
            }

            $artists = $query->paginate($request->get('per_page', 20));

            // Add user-specific data
            if (auth()->check()) {
                $artists->getCollection()->each(function ($artist) {
                    $artist->is_following = UserFollow::where('follower_id', auth()->id())
                        ->where('following_type', 'artist')
                        ->where('following_id', $artist->user_id)
                        ->exists();
                });
            }

            return response()->json([
                'success' => true,
                'data' => $artists
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch artists',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Artist $artist): JsonResponse
    {
        try {
            $artist->load([
                'songs' => function($query) {
                    $query->where('status', 'published')
                          ->where('is_active', true)
                          ->orderBy('created_at', 'desc')
                          ->limit(10);
                },
                'albums' => function($query) {
                    $query->where('status', 'published')
                          ->where('is_active', true)
                          ->orderBy('release_date', 'desc')
                          ->limit(5);
                }
            ]);

            // Add user-specific data
            if (auth()->check()) {
                $artist->is_following = UserFollow::where('follower_id', auth()->id())
                    ->where('following_type', 'artist')
                    ->where('following_id', $artist->user_id)
                    ->exists();
            }

            // Calculate artist stats
            $artist->stats = [
                'total_songs' => $artist->songs()->where('songs.status', 'published')->count(),
                'total_albums' => $artist->albums()->where('status', 'published')->count(),
                'total_plays' => $artist->songs()->sum('play_count'),
                'total_likes' => $artist->songs()->sum('like_count'),
                'total_downloads' => $artist->songs()->sum('download_count'),
                'monthly_listeners' => $artist->getMonthlyListenersAttribute(),
            ];

            return response()->json([
                'success' => true,
                'data' => $artist
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch artist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function trending(Request $request): JsonResponse
    {
        try {
            $artists = Artist::where('status', 'active')
                ->where('is_verified', true)
                ->whereHas('songs.playHistory', function($query) {
                    $query->where('played_at', '>=', now()->subDays(7));
                })
                ->withCount(['songs as recent_plays' => function($query) {
                    $query->whereHas('playHistory', function($subQuery) {
                        $subQuery->where('played_at', '>=', now()->subDays(7));
                    });
                }])
                ->orderBy('recent_plays', 'desc')
                ->limit($request->get('limit', 20))
                ->get();

            return response()->json([
                'success' => true,
                'data' => $artists
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch trending artists',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function songs(Request $request, Artist $artist): JsonResponse
    {
        try {
            $songs = $artist->songs()
                ->with(['album', 'genre'])
                ->where('status', 'published')
                ->where('is_active', true)
                ->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 20));

            return response()->json([
                'success' => true,
                'data' => $songs
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch artist songs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function albums(Request $request, Artist $artist): JsonResponse
    {
        try {
            $albums = $artist->albums()
                ->with(['songs', 'genre'])
                ->where('status', 'published')
                ->where('is_active', true)
                ->orderBy('release_date', 'desc')
                ->paginate($request->get('per_page', 10));

            return response()->json([
                'success' => true,
                'data' => $albums
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch artist albums',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function toggleFollow(Artist $artist): JsonResponse
    {
        try {
            $user = auth()->user();

            $isFollowing = $user->following()
                ->where('following_id', $artist->id)
                ->where('following_type', 'artist')
                ->first();

            if ($isFollowing) {
                $isFollowing->delete();
                $artist->decrement('followers_count');
                $message = 'Artist unfollowed';
                $following = false;
            } else {
                $user->following()->create([
                    'following_id' => $artist->id,
                    'type' => 'artist',
                ]);
                $artist->increment('followers_count');
                $message = 'Artist followed';
                $following = true;
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'is_following' => $following,
                'follower_count' => $artist->fresh()->followers_count
            ]);

        } catch (\Exception $e) {
            \Log::error('Artist toggle follow error: ' . $e->getMessage(), [
                'artist_id' => $artist->id,
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle follow',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Follow an artist
     */
    public function follow(Artist $artist): JsonResponse
    {
        try {
            $user = auth()->user();

            // Check if already following using the UserFollow model structure
            $isAlreadyFollowing = $user->following()
                ->where('following_id', $artist->id)
                ->where('following_type', 'artist')
                ->exists();

            if ($isAlreadyFollowing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Already following this artist'
                ], 400);
            }

            // Create follow relationship using User's following relationship
            $user->following()->create([
                'following_id' => $artist->id,
                'type' => 'artist',
            ]);

            // Update artist follower count
            $artist->increment('followers_count');

            return response()->json([
                'success' => true,
                'message' => 'Artist followed successfully',
                'is_following' => true,
                'follower_count' => $artist->fresh()->followers_count
            ]);

        } catch (\Exception $e) {
            \Log::error('Artist follow error: ' . $e->getMessage(), [
                'artist_id' => $artist->id,
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to follow artist',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Unfollow an artist
     */
    public function unfollow(Artist $artist): JsonResponse
    {
        try {
            $user = auth()->user();

            $deleted = $user->following()
                ->where('following_id', $artist->id)
                ->where('following_type', 'artist')
                ->delete();

            if ($deleted) {
                $artist->decrement('followers_count');
            }

            return response()->json([
                'success' => true,
                'message' => 'Artist unfollowed successfully',
                'is_following' => false,
                'follower_count' => $artist->fresh()->followers_count
            ]);

        } catch (\Exception $e) {
            \Log::error('Artist unfollow error: ' . $e->getMessage(), [
                'artist_id' => $artist->id,
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to unfollow artist',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}