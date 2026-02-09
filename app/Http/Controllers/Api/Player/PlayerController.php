<?php

namespace App\Http\Controllers\Api\Player;

use App\Http\Controllers\Controller;
use App\Models\PlayQueue;
use App\Models\Song;
use App\Models\PlayHistory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;

class PlayerController extends Controller
{
    public function updateNowPlaying(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'song_id' => 'required|integer|exists:songs,id',
                'queue_item_id' => 'nullable|integer|exists:play_queues,id',
                'position' => 'nullable|integer|min:0',
                'play_duration_seconds' => 'nullable|integer|min:0',
                'is_playing' => 'boolean',
                'volume' => 'nullable|integer|min:0|max:100',
                'shuffle' => 'boolean',
                'repeat' => 'nullable|in:off,one,all'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = auth()->user();
            $songId = $request->song_id;
            $song = Song::findOrFail($songId);

            // Check if user can play this song
            if (!$song->is_free && (!$user->hasActiveSubscription() && !$user->canPlayPremiumContent())) {
                return response()->json([
                    'success' => false,
                    'message' => 'Premium subscription required to play this song'
                ], 403);
            }

            // Update queue if queue_item_id provided
            if ($request->queue_item_id) {
                PlayQueue::where('user_id', $user->id)->update(['is_current' => false]);
                PlayQueue::where('id', $request->queue_item_id)
                    ->where('user_id', $user->id)
                    ->update(['is_current' => true]);
            }

            // Store player state in cache
            $playerState = [
                'user_id' => $user->id,
                'song_id' => $songId,
                'queue_item_id' => $request->queue_item_id,
                'position' => $request->get('position', 0),
                'play_duration_seconds' => $request->get('play_duration_seconds', 0),
                'is_playing' => $request->boolean('is_playing', true),
                'volume' => $request->get('volume', $user->settings->volume_level ?? 80),
                'shuffle' => $request->boolean('shuffle', false),
                'repeat' => $request->get('repeat', 'off'),
                'updated_at' => now(),
            ];

            Cache::put("player_state_{$user->id}", $playerState, now()->addHours(24));

            // Update play history if song changed
            $lastPlayHistory = PlayHistory::where('user_id', $user->id)
                ->where('song_id', $songId)
                ->whereDate('played_at', today())
                ->latest()
                ->first();

            if (!$lastPlayHistory || $lastPlayHistory->played_at->lt(now()->subMinutes(5))) {
                PlayHistory::create([
                    'user_id' => $user->id,
                    'song_id' => $songId,
                    'artist_id' => $song->artist_id,
                    'album_id' => $song->album_id,
                    'played_at' => now(),
                    'duration_played_seconds' => $request->get('play_duration_seconds', 0),
                    'completed' => false,
                    'device_type' => $request->get('device_type', 'web'),
                    'quality' => $user->settings->audio_quality_preference ?? '128',
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Now playing updated successfully',
                'data' => [
                    'song' => $song->load(['artist', 'album']),
                    'player_state' => $playerState
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update now playing',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getStatus(): JsonResponse
    {
        try {
            $user = auth()->user();

            // Get player state from cache
            $playerState = Cache::get("player_state_{$user->id}");

            if (!$playerState) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'is_playing' => false,
                        'current_song' => null,
                        'queue_length' => 0,
                        'message' => 'No active player session'
                    ]
                ]);
            }

            // Get current song details
            $currentSong = null;
            if ($playerState['song_id']) {
                $currentSong = Song::with(['artist', 'album'])
                    ->find($playerState['song_id']);
            }

            // Get queue information
            $queueCount = PlayQueue::where('user_id', $user->id)->count();
            $nextSong = PlayQueue::getNextSong($user);

            return response()->json([
                'success' => true,
                'data' => [
                    'is_playing' => $playerState['is_playing'],
                    'current_song' => $currentSong,
                    'next_song' => $nextSong,
                    'position' => $playerState['position'],
                    'play_duration_seconds' => $playerState['play_duration_seconds'],
                    'volume' => $playerState['volume'],
                    'shuffle' => $playerState['shuffle'],
                    'repeat' => $playerState['repeat'],
                    'queue_length' => $queueCount,
                    'last_updated' => $playerState['updated_at']
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch player status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function previous(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();
            $previousSong = PlayQueue::getPreviousSong($user);

            if (!$previousSong) {
                return response()->json([
                    'success' => false,
                    'message' => 'No previous song in queue'
                ], 404);
            }

            // Update current playing
            PlayQueue::where('user_id', $user->id)->update(['is_current' => false]);
            PlayQueue::where('id', $previousSong->id)->update(['is_current' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Moved to previous song',
                'data' => [
                    'song' => $previousSong->song->load(['artist', 'album']),
                    'queue_item' => $previousSong
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to move to previous song',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function next(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();
            $nextSong = PlayQueue::getNextSong($user);

            if (!$nextSong) {
                return response()->json([
                    'success' => false,
                    'message' => 'No next song in queue'
                ], 404);
            }

            // Update current playing
            PlayQueue::where('user_id', $user->id)->update(['is_current' => false]);
            PlayQueue::where('id', $nextSong->id)->update(['is_current' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Moved to next song',
                'data' => [
                    'song' => $nextSong->song->load(['artist', 'album']),
                    'queue_item' => $nextSong
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to move to next song',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function seek(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'position' => 'required|integer|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = auth()->user();
            $position = $request->position;

            // Update player state
            $playerState = Cache::get("player_state_{$user->id}", []);
            $playerState['position'] = $position;
            $playerState['updated_at'] = now();

            Cache::put("player_state_{$user->id}", $playerState, now()->addHours(24));

            return response()->json([
                'success' => true,
                'message' => 'Seek position updated',
                'position' => $position
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update seek position',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}