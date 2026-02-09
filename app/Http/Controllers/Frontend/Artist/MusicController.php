<?php

namespace App\Http\Controllers\Frontend\Artist;

use App\Http\Controllers\Controller;
use App\Models\Genre;
use App\Models\Artist;
use App\Models\Song;
use App\Services\MusicStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MusicController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist) {
            return redirect()->route('frontend.artist.setup')->with('warning', 'Please complete your artist profile first.');
        }

        // Load artist's songs with related data
        $songs = Song::where('artist_id', $artist->id)
            ->with(['genres', 'album', 'artist'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Transform songs data for frontend
        $tracks = $songs->map(function ($song) {
            return [
                'id' => $song->id,
                'title' => $song->title,
                'artist_name' => $song->artist->stage_name ?? $song->artist->name ?? 'Unknown Artist',
                'status' => $song->status,
                'artwork' => $song->artwork_url,
                'genre' => $song->genres->first() ? [
                    'id' => $song->genres->first()->id,
                    'name' => $song->genres->first()->name
                ] : null,
                'genre_id' => $song->genres->first()?->id,
                'play_count' => $song->play_count,
                'created_at' => $song->created_at->format('M d, Y'),
                'duration_seconds' => $song->duration_seconds ?? 0,
                'duration_formatted' => $song->duration_formatted,
                'price' => $song->price,
                'is_free' => $song->is_free,
                'file_path' => $song->audio_file_original,
                'storage_disk' => 'public',
            ];
        });

        // Load genres for filter dropdown
        $genres = Genre::active()->ordered()->get();

        // Stats for the artist
        $stats = [
            'total_songs' => $songs->count(),
            'published_songs' => $songs->where('status', 'published')->count(),
            'pending_songs' => $songs->where('status', 'pending')->count(),
            'total_plays' => $songs->sum('play_count'),
            'total_revenue' => $songs->sum('revenue_generated'),
        ];

        return view('frontend.artist.music.index', compact('tracks', 'stats', 'artist', 'genres'));
    }

    public function upload()
    {
        $genres = Genre::active()->ordered()->get();
        return view('frontend.artist.music.upload', compact('genres'));
    }

    public function store(Request $request)
    {
        try {
            // Debug: Log what we received
            \Log::info('Music upload request received', [
                'has_audio_file' => $request->hasFile('audio_file'),
                'has_artwork' => $request->hasFile('artwork'),
                'audio_file_info' => $request->hasFile('audio_file') ? [
                    'name' => $request->file('audio_file')->getClientOriginalName(),
                    'size' => $request->file('audio_file')->getSize(),
                    'mime' => $request->file('audio_file')->getMimeType(),
                    'error' => $request->file('audio_file')->getError(),
                    'is_valid' => $request->file('audio_file')->isValid(),
                    'real_path' => $request->file('audio_file')->getRealPath(),
                ] : null,
                'title' => $request->input('title'),
                'genre_id' => $request->input('genre_id'),
            ]);

            // Validate the request
            $allowedAudioMimes = config('music.storage.allowed_mime_types.audio', [
                'audio/mpeg',
                'audio/wav',
                'audio/x-wav',
                'audio/flac',
                'audio/x-flac',
                'audio/aac',
                'audio/mp4',
                'audio/x-m4a',
            ]);
            
            $allowedArtworkMimes = config('music.storage.allowed_formats.artwork', ['jpg', 'jpeg', 'png', 'webp']);
            $maxAudioSize = config('music.storage.limits.max_audio_size', 52428800); // 50MB default
            $maxArtworkSize = config('music.storage.limits.max_artwork_size', 10485760); // 10MB default

            $request->validate([
                'audio_file' => [
                    'required',
                    'file',
                    'mimetypes:' . implode(',', $allowedAudioMimes),
                    'max:' . ($maxAudioSize / 1024) // Convert to KB
                ],
                'title' => 'required|string|max:255',
                'genre_id' => 'required|exists:genres,id',
                'description' => 'nullable|string|max:1000',
                'price' => 'nullable|numeric|min:0',
                'is_explicit' => 'nullable|boolean',
                'allow_downloads' => 'nullable|boolean',
                'artwork' => [
                    'nullable',
                    'image',
                    'mimes:' . implode(',', $allowedArtworkMimes),
                    'max:' . ($maxArtworkSize / 1024) // Convert to KB
                ],
                'publish_type' => 'required|in:now,draft,single',
                'featured_artists' => 'nullable|string|max:500',
                'primary_language' => 'nullable|string|max:50',
                'release_date' => 'nullable|date',
                'duration_seconds' => 'nullable|integer|min:0',
                'lyrics' => 'nullable|string',
            ]);

            $user = Auth::user();
            $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

            if (!$artist) {
                throw new \Exception('Artist profile is required to upload music.');
            }

            DB::beginTransaction();

            try {
                // Initialize storage service
                $storageService = new MusicStorageService();

                // Store audio file
                $audioResult = $storageService->storeMusicFile(
                    $request->file('audio_file'),
                    $artist,
                    'song',
                    MusicStorageService::ACCESS_PRIVATE
                );

                if (!$audioResult['success']) {
                    throw new \Exception('Failed to store audio file: ' . $audioResult['error']);
                }

                // Store artwork if provided
                $artworkResult = null;
                if ($request->hasFile('artwork')) {
                    $artworkResult = $storageService->storeArtwork(
                        $request->file('artwork'),
                        $artist,
                        'song_cover',
                        MusicStorageService::ACCESS_PUBLIC
                    );

                    if (!$artworkResult['success']) {
                        \Log::warning('Artwork upload failed but continuing with song creation', [
                            'error' => $artworkResult['error']
                        ]);
                    }
                }

                // Generate unique slug
                $baseSlug = Str::slug($request->title . '-' . $artist->name);
                $slug = $baseSlug;
                $counter = 1;

                while (Song::where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $counter;
                    $counter++;
                }

                // Create song record
                $song = Song::create([
                    'user_id' => $user->id,
                    'artist_id' => $artist->id,
                    'title' => $request->title,
                    'slug' => $slug,
                    'description' => $request->description,
                    'audio_file_original' => $audioResult['storage_path'],
                    'artwork' => $artworkResult && $artworkResult['success'] ? ($artworkResult['storage_path'] ?? $artworkResult['storage']['path'] ?? null) : null,
                    'duration_seconds' => $audioResult['file_info']['duration'] ?? 0,
                    'price' => $request->price,
                    'is_free' => ($request->price ?? 0) == 0,
                    'is_explicit' => $request->boolean('is_explicit', false),
                    'is_downloadable' => $request->boolean('is_downloadable', true),
                    'status' => $request->publish_type === 'now' ? 'pending_review' : 'draft',
                    'release_date' => $request->release_date ?? now(),
                    'featured_artists' => $request->featured_artists,
                    'primary_language' => $request->primary_language ?? 'English',

                    // File metadata
                    'file_format' => $audioResult['file_info']['extension'],
                    'file_size_bytes' => $audioResult['file_info']['size'],
                    'file_hash' => $audioResult['file_info']['hash'],

                    // Distribution status
                    'distribution_status' => 'not_submitted',
                ]);

                // Attach genre
                $song->genres()->attach($request->genre_id);

                // Generate ISRC code if auto-generation is enabled
                if (config('music.isrc.auto_generate')) {
                    $song->update([
                        'isrc_code' => $this->generateISRCCode($artist, $song)
                    ]);
                }

                DB::commit();

                \Log::info('Song uploaded successfully', [
                    'song_id' => $song->id,
                    'artist_id' => $artist->id,
                    'storage_driver' => $audioResult['metadata']['storage_driver']
                ]);

                if ($request->wantsJson()) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Track uploaded successfully!',
                        'song' => [
                            'id' => $song->id,
                            'title' => $song->title,
                            'slug' => $song->slug,
                            'status' => $song->status
                        ]
                    ], 201);
                }

                return redirect()->route('frontend.artist.music.index')
                    ->with('success', 'Track uploaded successfully!');

            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $e->errors()
                ], 422);
            }

            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            \Log::error('Music upload error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id()
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Upload failed: ' . $e->getMessage()
                ], 500);
            }

            return back()->with('error', 'Upload failed: ' . $e->getMessage())->withInput();
        }
    }

    public function edit($id)
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist) {
            return redirect()->route('frontend.artist.setup')->with('warning', 'Please complete your artist profile first.');
        }

        $song = Song::where('artist_id', $artist->id)
            ->where('id', $id)
            ->with(['genres', 'album'])
            ->firstOrFail();

        $genres = Genre::active()->ordered()->get();

        return view('frontend.artist.music.edit', compact('song', 'genres', 'artist'));
    }

    public function update(Request $request, $id)
    {
        try {
            $user = Auth::user();
            $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

            if (!$artist) {
                if ($request->wantsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Artist profile is required.'
                    ], 403);
                }
                throw new \Exception('Artist profile is required.');
            }

            $song = Song::where('id', $id)->firstOrFail();
            
            // Check if song belongs to this artist
            if ($song->artist_id !== $artist->id) {
                if ($request->wantsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthorized to update this song.'
                    ], 403);
                }
                return back()->with('error', 'Unauthorized to update this song.');
            }

            $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'genre_id' => 'sometimes|required|exists:genres,id',
                'description' => 'nullable|string|max:1000',
                'price' => 'nullable|numeric|min:0',
                'is_explicit' => 'nullable|boolean',
                'allow_downloads' => 'nullable|boolean',
                'featured_artists' => 'nullable|string|max:500',
                'primary_language' => 'nullable|string|max:50',
                'status' => 'nullable|in:draft,published,private',
                'release_date' => 'nullable|date',
                'audio_file' => 'nullable|file|mimes:mp3,wav,flac,aac|max:102400', // 100MB max
                'artwork' => 'nullable|image|mimes:jpeg,jpg,png|max:10240', // 10MB max
            ]);

            DB::beginTransaction();

            try {
                $storageService = app(MusicStorageService::class);
                $updateData = [];
                
                // Only update fields that are provided
                if ($request->filled('title')) {
                    $updateData['title'] = $request->title;
                }
                if ($request->filled('description')) {
                    $updateData['description'] = $request->description;
                }
                if ($request->has('price')) {
                    $updateData['price'] = $request->price ?? 0;
                    $updateData['is_free'] = $request->price == 0;
                }
                if ($request->has('is_explicit')) {
                    $updateData['is_explicit'] = $request->boolean('is_explicit', false);
                }
                if ($request->has('is_downloadable')) {
                    $updateData['is_downloadable'] = $request->boolean('is_downloadable', true);
                }
                if ($request->filled('featured_artists')) {
                    $updateData['featured_artists'] = $request->featured_artists;
                }
                if ($request->filled('primary_language')) {
                    $updateData['primary_language'] = $request->primary_language;
                }
                if ($request->filled('status')) {
                    $updateData['status'] = $request->status;
                }

                // Handle release date
                if ($request->filled('release_date')) {
                    $updateData['release_date'] = $request->release_date;
                }

                // Handle new audio file upload
                if ($request->hasFile('audio_file')) {
                    \Log::info('Processing audio file replacement for song', ['song_id' => $song->id]);

                    // Delete old audio file
                    if ($song->audio_file_original) {
                        \Storage::disk('public')->delete($song->audio_file_original);
                    }

                    // Upload new audio file
                    $audioResult = $storageService->storeAudioFile(
                        $request->file('audio_file'),
                        $user->id,
                        $artist->slug ?? Str::slug($artist->stage_name ?? $artist->name)
                    );

                    if ($audioResult && $audioResult['success']) {
                        $updateData['audio_file_original'] = $audioResult['storage_path'];
                        $updateData['duration_seconds'] = $audioResult['file_info']['duration'] ?? 0;
                        $updateData['file_format'] = $audioResult['file_info']['extension'];
                        $updateData['file_size_bytes'] = $audioResult['file_info']['size'];
                        $updateData['file_hash'] = $audioResult['file_info']['hash'];

                        \Log::info('Audio file replaced successfully', [
                            'song_id' => $song->id,
                            'new_path' => $audioResult['storage_path']
                        ]);
                    }
                }

                // Handle new artwork upload
                if ($request->hasFile('artwork')) {
                    \Log::info('Processing artwork replacement for song', ['song_id' => $song->id]);

                    // Delete old artwork
                    if ($song->artwork) {
                        \Storage::disk('public')->delete($song->artwork);
                    }

                    // Upload new artwork
                    $artworkResult = $storageService->storeArtwork(
                        $request->file('artwork'),
                        $artist,
                        'song_cover'
                    );

                    if ($artworkResult && $artworkResult['success']) {
                        $updateData['artwork'] = $artworkResult['storage_path'] ?? $artworkResult['storage']['path'] ?? null;

                        \Log::info('Artwork replaced successfully', [
                            'song_id' => $song->id,
                            'new_path' => $updateData['artwork']
                        ]);
                    }
                }

                // Update slug if title changed
                if ($request->filled('title') && $request->title !== $song->title) {
                    $updateData['slug'] = Str::slug($request->title . ' ' . ($artist->stage_name ?? $artist->name));
                }

                $song->update($updateData);

                // Update genre if provided
                if ($request->filled('genre_id')) {
                    $song->genres()->sync([$request->genre_id]);
                }

                DB::commit();

                if ($request->wantsJson()) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Track updated successfully!'
                    ]);
                }

                return redirect()->route('frontend.artist.music.index')
                    ->with('success', 'Track updated successfully!');

            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            \Log::error('Music update error', [
                'error' => $e->getMessage(),
                'song_id' => $id,
                'user_id' => Auth::id()
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Update failed: ' . $e->getMessage()
                ], 500);
            }

            return back()->with('error', 'Update failed: ' . $e->getMessage())->withInput();
        }
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
     * Delete a song
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

            if (!$artist) {
                if (request()->wantsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Artist profile not found.'
                    ], 404);
                }
                return back()->with('error', 'Artist profile not found.');
            }

            $song = Song::where('artist_id', $artist->id)
                ->where('id', $id)
                ->firstOrFail();

            DB::beginTransaction();

            try {
                // Delete associated files
                if ($song->audio_file_original) {
                    \Storage::disk('public')->delete($song->audio_file_original);
                }
                if ($song->artwork) {
                    \Storage::disk('public')->delete($song->artwork);
                }

                // Delete the song
                $song->delete();

                DB::commit();

                if (request()->wantsJson()) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Track deleted successfully!'
                    ]);
                }

                return redirect()->route('frontend.artist.music.index')
                    ->with('success', 'Track deleted successfully!');

            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            \Log::error('Music delete error', [
                'error' => $e->getMessage(),
                'song_id' => $id,
                'user_id' => Auth::id()
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete track: ' . $e->getMessage()
                ], 500);
            }

            return back()->with('error', 'Failed to delete track: ' . $e->getMessage());
        }
    }
}