<?php

namespace App\Http\Controllers\Api\Podcast;

use App\Http\Controllers\Controller;
use App\Models\Episode;
use Illuminate\Http\Request;

class PlayerApiController extends Controller
{
    public function play(Episode $episode)
    {
        return response()->json(['success' => true]);
    }

    public function updateProgress(Episode $episode, Request $request)
    {
        return response()->json(['success' => true]);
    }

    public function markComplete(Episode $episode)
    {
        return response()->json(['success' => true]);
    }

    public function pause(Episode $episode)
    {
        return response()->json(['success' => true]);
    }

    public function listeningQueue()
    {
        return response()->json(['queue' => []]);
    }

    public function recentlyPlayed()
    {
        return response()->json(['recent' => []]);
    }
}
