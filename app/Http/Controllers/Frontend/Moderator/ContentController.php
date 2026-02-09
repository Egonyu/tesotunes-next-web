<?php

namespace App\Http\Controllers\Frontend\Moderator;

use App\Http\Controllers\Controller;
use App\Models\ContentReview;
use App\Models\Song;
use App\Models\Album;
use App\Models\Comment;
use App\Models\Podcast;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->get('type', 'all');

        // Get counts for filter tabs
        $counts = [
            'all' => ContentReview::pending()->count(),
            'songs' => ContentReview::pending()->where('content_type', 'music')->count(),
            'albums' => ContentReview::pending()->where('content_type', 'album')->count(),
            'podcasts' => ContentReview::pending()->where('content_type', 'podcast')->count(),
            'comments' => ContentReview::pending()->where('content_type', 'comment')->count(),
        ];

        // Get pending content reviews
        $query = ContentReview::with(['reviewable'])
            ->pending()
            ->orderBy('priority', 'desc')
            ->orderBy('submitted_at', 'asc');

        if ($type !== 'all') {
            $query->where('content_type', $type);
        }

        $reviews = $query->paginate(20);

        // Format pending content for the view
        $pendingContent = $reviews->map(function ($review) {
            $content = $review->reviewable;
            
            if (!$content) {
                return null;
            }

            return [
                'id' => $review->id,
                'type' => $review->content_type,
                'title' => $content->title ?? 'Untitled',
                'artist' => $this->getArtistName($content),
                'description' => $content->description ?? '',
                'genre' => $content->genre->name ?? null,
                'duration' => $this->formatDuration($content),
                'explicit' => $content->explicit_content ?? false,
                'artwork' => $this->getArtwork($content),
                'submitted_at' => $review->submitted_at->diffForHumans(),
                'priority' => $review->priority,
                'icon' => $this->getIconForType($review->content_type),
            ];
        })->filter();

        return view('frontend.moderator.content', compact('counts', 'pendingContent'));
    }

    public function approve(Request $request, $type, $id)
    {
        $review = ContentReview::findOrFail($id);
        $user = auth()->user();

        try {
            $review->approve($user, $request->input('notes'));
            
            return response()->json([
                'success' => true,
                'message' => 'Content approved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve content: ' . $e->getMessage()
            ], 500);
        }
    }

    public function reject(Request $request, $type, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        $review = ContentReview::findOrFail($id);
        $user = auth()->user();

        try {
            $review->reject($user, $request->input('reason'));
            
            return response()->json([
                'success' => true,
                'message' => 'Content rejected successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject content: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getArtistName($content): string
    {
        if (isset($content->user)) {
            return $content->user->name;
        }
        if (isset($content->artist)) {
            return $content->artist->name;
        }
        return 'Unknown Artist';
    }

    private function formatDuration($content): ?string
    {
        if (!isset($content->duration)) {
            return null;
        }
        
        $minutes = floor($content->duration / 60);
        $seconds = $content->duration % 60;
        return sprintf('%d:%02d', $minutes, $seconds);
    }

    private function getArtwork($content): string
    {
        return $content->artwork_url ?? $content->artwork ?? $content->cover_image ?? '/images/default-song-artwork.svg';
    }

    private function getIconForType(string $type): string
    {
        return match($type) {
            'music' => 'music_note',
            'album' => 'album',
            'podcast' => 'podcasts',
            'comment' => 'comment',
            default => 'flag',
        };
    }
}