<?php

namespace App\Http\Controllers\Api\Podcast;

use App\Http\Controllers\Controller;
use App\Models\Episode;
use App\Models\Podcast;
use Illuminate\Http\Request;

class EpisodeApiController extends Controller
{
    /**
     * Get episodes for a podcast
     */
    public function index(Podcast $podcast)
    {
        $episodes = $podcast->episodes()
            ->where('status', 'published')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($episodes);
    }

    /**
     * Get single episode details
     */
    public function show(Podcast $podcast, Episode $episode)
    {
        if ($episode->podcast_id !== $podcast->id) {
            return response()->json(['error' => 'Episode not found'], 404);
        }

        return response()->json($episode->load(['podcast', 'user']));
    }

    /**
     * Get episode audio stream URL
     */
    public function stream(Podcast $podcast, Episode $episode)
    {
        if ($episode->podcast_id !== $podcast->id) {
            return response()->json(['error' => 'Episode not found'], 404);
        }

        // Check if episode is premium and user has access
        if ($episode->is_premium && !auth()->check()) {
            return response()->json(['error' => 'Premium content requires authentication'], 401);
        }

        // Generate signed URL for streaming
        $streamUrl = $episode->getStreamUrl();

        return response()->json([
            'stream_url' => $streamUrl,
            'duration_seconds' => $episode->duration_seconds,
            'file_size' => $episode->file_size,
        ]);
    }
}
