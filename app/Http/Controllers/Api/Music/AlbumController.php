<?php

namespace App\Http\Controllers\Api\Music;

use App\Http\Controllers\Controller;
use App\Models\Album;
use App\Models\Like;
use App\Models\Follow;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AlbumController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Album::with(['artist', 'songs', 'genre'])
                ->where('status', 'published')
                ->where('is_active', true);

            // Filters
            if ($request->has('artist_id')) {
                $query->where('artist_id', $request->artist_id);
            }

            if ($request->has('genre')) {
                $query->whereHas('genre', function($q) use ($request) {
                    $q->where('slug', $request->genre);
                });
            }

            if ($request->has('year')) {
                $query->whereYear('release_date', $request->year);
            }

            if ($request->has('type')) {
                $query->where('following_type', $request->type);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'release_date');
            $sortOrder = $request->get('sort_order', 'desc');

            switch ($sortBy) {
                case 'popularity':
                    $query->orderBy('play_count', $sortOrder);
                    break;
                case 'likes':
                    $query->orderBy('like_count', $sortOrder);
                    break;
                case 'songs':
                    $query->withCount('songs')->orderBy('songs_count', $sortOrder);
                    break;
                default:
                    $query->orderBy($sortBy, $sortOrder);
            }

            $albums = $query->paginate($request->get('per_page', 20));

            // Add user-specific data
            if (auth()->check()) {
                $albums->getCollection()->each(function ($album) {
                    $album->is_liked = Like::where('user_id', auth()->id())
                        ->where('likeable_type', Album::class)
                        ->where('likeable_id', $album->id)
                        ->exists();
                });
            }

            return response()->json([
                'success' => true,
                'data' => $albums
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch albums',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Album $album): JsonResponse
    {
        try {
            $album->load([
                'artist',
                'songs.artist',
                'genre',
                'comments.user',
                'likes.user'
            ]);

            // Add user-specific data
            if (auth()->check()) {
                $album->is_liked = Like::where('user_id', auth()->id())
                    ->where('likeable_type', Album::class)
                    ->where('likeable_id', $album->id)
                    ->exists();
            }

            // Calculate album stats
            $album->total_duration = $album->songs->sum('duration_seconds');
            $album->total_plays = $album->songs->sum('play_count');
            $album->avg_rating = $album->songs->avg('rating') ?? 0;

            return response()->json([
                'success' => true,
                'data' => $album
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch album',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function trending(Request $request): JsonResponse
    {
        try {
            $albums = Album::with(['artist', 'songs'])
                ->where('status', 'published')
                ->where('is_active', true)
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
                'data' => $albums
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch trending albums',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function toggleLike(Album $album): JsonResponse
    {
        try {
            $user = auth()->user();
            $isLiked = Like::toggle($user, $album);

            return response()->json([
                'success' => true,
                'message' => $isLiked ? 'Album liked' : 'Album unliked',
                'is_liked' => $isLiked,
                'like_count' => $album->fresh()->like_count
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle like',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}