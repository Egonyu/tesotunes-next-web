<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Artist;
use App\Models\MusicUpload;
use App\Models\Song;
use App\Models\Album;
use App\Models\Genre;
use App\Services\MusicStorageService;
use App\Services\Music\SongUploadService;
use App\Services\Music\ISRCService;
use App\Services\SecureFileUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MusicUploadController extends Controller
{
    protected MusicStorageService $storageService;
    protected SongUploadService $uploadService;
    protected ISRCService $isrcService;
    protected SecureFileUploadService $secureUploadService;

    public function __construct(
        MusicStorageService $storageService,
        SongUploadService $uploadService,
        ISRCService $isrcService,
        SecureFileUploadService $secureUploadService
    ) {
        $this->middleware(['auth', 'verified']);
        $this->storageService = $storageService;
        $this->uploadService = $uploadService;
        $this->isrcService = $isrcService;
        $this->secureUploadService = $secureUploadService;
    }

    public function index()
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist) {
            return redirect()->route('frontend.artist.setup')->with('warning', 'Please complete your artist profile first.');
        }

        $uploads = MusicUpload::where('artist_id', $artist->id)
            ->with(['song'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $stats = [
            'total_uploads' => MusicUpload::where('artist_id', $artist->id)->count(),
            'pending_review' => MusicUpload::where('artist_id', $artist->id)->pendingReview()->count(),
            'approved' => MusicUpload::where('artist_id', $artist->id)->approved()->count(),
            'songs_created' => Song::where('artist_id', $artist->id)->count(),
        ];

        return view('frontend.artist.upload.index', compact('uploads', 'stats', 'artist'));
    }

    public function create(Request $request)
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist) {
            return redirect()->route('frontend.artist.setup')->with('warning', 'Please complete your artist profile first.');
        }

        $uploadType = $request->input('upload_type', 'single');
        $batchId = $request->input('batch_id');
        $supportedFormats = ['MP3', 'WAV', 'FLAC', 'M4A', 'AAC'];
        $maxFileSize = MusicUpload::getMaxFileSize();
        $ugandanGenres = $this->getUgandanGenres();
        $ugandanLanguages = $this->getUgandanLanguages();

        return view('frontend.artist.upload.create', compact(
            'artist',
            'uploadType',
            'batchId',
            'supportedFormats',
            'maxFileSize',
            'ugandanGenres',
            'ugandanLanguages'
        ));
    }

    public function store(Request $request)
    {
        $request->validate([
            'files.*' => [
                'required',
                'file',
                'mimes:mp3,wav,flac,aac,m4a',
                'max:' . (MusicUpload::getMaxFileSize() / 1024), // Convert to KB
            ],
            'upload_type' => 'required|in:single,album,ep,compilation',
            'batch_id' => 'nullable|string',
        ]);

        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist) {
            return response()->json(['error' => 'Artist profile required'], 400);
        }

        $uploadType = $request->input('upload_type', 'single');
        $batchId = $request->input('batch_id') ?: MusicUpload::generateBatchId();
        $uploadedFiles = [];

        DB::beginTransaction();
        try {
            // Handle album creation for batch uploads
            $album = null;
            if (in_array($uploadType, ['album', 'ep', 'compilation'])) {
                $album = $this->createAlbumForBatch($artist, $uploadType, $batchId, $request);
            }

            $files = $request->file('files');
            if ($files && is_array($files)) {
                foreach ($files as $file) {
                    $upload = $this->processFileUpload($file, $artist, $user, $uploadType, $batchId);
                    $uploadedFiles[] = $upload;
                }
            } else {
                throw new \Exception('No files were uploaded');
            }

            // Queue album batch processing if this is an album
            if ($album) {
                \App\Jobs\ProcessAlbumBatch::dispatch($album, $batchId)->delay(now()->addMinutes(2));
            }

            DB::commit();

            // Check if this is an AJAX request
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => count($uploadedFiles) . ' file(s) uploaded successfully',
                    'uploads' => collect($uploadedFiles)->map(function ($upload) {
                        return [
                            'id' => $upload->id,
                            'filename' => $upload->original_filename,
                            'status' => $upload->processing_status,
                            'progress' => $upload->processing_progress,
                        ];
                    }),
                    'batch_id' => $batchId,
                ]);
            } else {
                // Regular form submission - redirect with success message
                return redirect()->route('frontend.artist.upload.index')
                    ->with('success', count($uploadedFiles) . ' file(s) uploaded successfully');
            }

        } catch (\Exception $e) {
            DB::rollback();

            if ($request->expectsJson() || $request->ajax()) {
                return response()->json(['error' => 'Upload failed: ' . $e->getMessage()], 500);
            } else {
                return redirect()->back()
                    ->withInput()
                    ->withErrors(['upload' => 'Upload failed: ' . $e->getMessage()]);
            }
        }
    }

    public function show(MusicUpload $upload)
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist || $upload->artist_id !== $artist->id) {
            abort(403);
        }

        $upload->load(['song', 'reviewer']);

        return view('frontend.artist.upload.show', compact('upload', 'artist'));
    }

    public function createSong(MusicUpload $upload)
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist || $upload->artist_id !== $artist->id) {
            abort(403);
        }

        if (!$upload->isReadyForSongCreation()) {
            return back()->with('error', 'Upload is not ready for song creation yet.');
        }

        $genres = Genre::active()->get();
        $albums = Album::where('artist_id', $artist->id)->get();

        return view('frontend.artist.upload.create-song', compact('upload', 'artist', 'genres', 'albums'));
    }

    public function storeSong(Request $request, MusicUpload $upload)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'lyrics' => 'nullable|string',
            'album_id' => 'nullable|exists:albums,id',
            'genres' => 'required|array|min:1',
            'genres.*' => 'exists:genres,id',
            'price' => 'nullable|numeric|min:0',
            'is_free' => 'boolean',
            'is_explicit' => 'boolean',
            'release_date' => 'nullable|date',
            'featured_artists' => 'nullable|string',
            'primary_language' => 'required|string',
            'languages_sung' => 'nullable|array',
            'cultural_context' => 'nullable|string',
            'recording_location' => 'nullable|string',
            'producer_credits' => 'nullable|string',
            'collaborator_splits' => 'nullable|array',
        ]);

        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist || $upload->artist_id !== $artist->id) {
            abort(403);
        }

        if (!$upload->isReadyForSongCreation()) {
            return back()->with('error', 'Upload is not ready for song creation.');
        }

        DB::beginTransaction();
        try {
            // Create the song
            $song = Song::create([
                'artist_id' => $artist->id,
                'album_id' => $request->album_id,
                'title' => $request->title,
                'slug' => Str::slug($request->title . '-' . $artist->name),
                'lyrics' => $request->lyrics,
                'audio_file_original' => $upload->file_path,
                'duration_seconds' => $upload->duration_seconds ?? 0,
                'price' => $request->price ?? 0,
                'is_free' => $request->boolean('is_free', true),
                'is_explicit' => $request->boolean('is_explicit', false),
                'status' => 'published',
                'release_date' => $request->release_date ?? now(),
                'featured_artists' => $request->featured_artists,

                // Enhanced metadata from upload
                'original_filename' => $upload->original_filename,
                'file_format' => $upload->audio_format,
                'file_size_bytes' => $upload->file_size_bytes,
                'bitrate' => $upload->bitrate,
                'sample_rate' => $upload->sample_rate,
                'audio_quality' => $upload->getAudioQualityDisplayAttribute(),
                'file_hash' => $upload->file_hash,

                // Ugandan context
                'primary_language' => $request->primary_language,
                'languages_sung' => $request->languages_sung,
                'contains_local_language' => in_array('Luganda', $request->languages_sung ?? []) ||
                                           in_array('Swahili', $request->languages_sung ?? []) ||
                                           in_array('Luo', $request->languages_sung ?? []),

                // Technical details
                'recording_location' => $request->recording_location,
                
                // Credits (use featured_artists for collaborators)
                'featured_artists' => $request->featured_artists ?: $request->collaborator_splits,
                'producer' => $request->producer_credits,

                // Distribution status
                'distribution_status' => 'not_submitted',
            ]);

            // Attach genres
            $song->genres()->attach($request->genres);

            // Generate ISRC code using ISRCService
            $isrcCode = $this->isrcService->generate($song);
            $song->update(['isrc_code' => $isrcCode]);

            // Update upload status
            $upload->update([
                'processing_status' => 'converted_to_song',
                'ready_for_distribution' => true,
            ]);

            DB::commit();

            return redirect()->route('frontend.artist.music.show', $song)
                ->with('success', 'Song created successfully and ready for distribution!');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->with('error', 'Failed to create song: ' . $e->getMessage())
                        ->withInput();
        }
    }

    public function batchProgress(string $batchId)
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $uploads = MusicUpload::inBatch($batchId)
            ->where('artist_id', $artist->id)
            ->get();

        return response()->json([
            'batch_id' => $batchId,
            'total_files' => $uploads->count(),
            'completed' => $uploads->where('processing_status', 'processed')->count(),
            'failed' => $uploads->where('processing_status', 'failed')->count(),
            'files' => $uploads->map(function ($upload) {
                return [
                    'id' => $upload->id,
                    'filename' => $upload->original_filename,
                    'status' => $upload->processing_status,
                    'progress' => $upload->processing_progress,
                    'error' => $upload->processing_error,
                ];
            }),
        ]);
    }

    // Helper Methods

    private function processFileUpload($file, Artist $artist, $user, string $uploadType, string $batchId): MusicUpload
    {
        // Use SecureFileUploadService for validation and security
        $validationResult = $this->secureUploadService->validateAudioFile($file);
        
        if (!$validationResult['valid']) {
            throw new \Exception($validationResult['errors'][0] ?? 'File validation failed');
        }

        $originalName = $file->getClientOriginalName();
        
        // Validate file real path exists
        $realPath = $file->getRealPath();
        if (empty($realPath) || !file_exists($realPath)) {
            throw new \Exception("Uploaded file is not accessible. Please try again.");
        }
        
        $hash = hash_file('sha256', $realPath);

        // Check for duplicate uploads
        $existingUpload = MusicUpload::where('file_hash', $hash)
            ->where('artist_id', $artist->id)
            ->first();

        if ($existingUpload) {
            throw new \Exception("File '{$originalName}' has already been uploaded.");
        }

        // Use MusicStorageService to store the file
        $storageResult = $this->storageService->storeMusicFile(
            $file,
            $artist,
            'upload',
            MusicStorageService::ACCESS_PRIVATE,
            [
                'upload_type' => $uploadType,
                'batch_id' => $batchId,
                'user_agent' => request()->userAgent(),
                'ip_address' => request()->ip(),
            ]
        );

        if (!$storageResult['success']) {
            throw new \Exception("Storage failed: " . $storageResult['error']);
        }

        // Create upload record using UploadService
        $upload = $this->uploadService->createUploadRecord([
            'user_id' => $user->id,
            'artist_id' => $artist->id,
            'upload_batch_id' => $batchId,
            'original_filename' => $originalName,
            'stored_filename' => basename($storageResult['storage_path']),
            'file_path' => $storageResult['storage_path'],
            'file_extension' => $file->getClientOriginalExtension(),
            'mime_type' => $file->getMimeType(),
            'file_size_bytes' => $file->getSize(),
            'file_hash' => $hash,
            'upload_type' => $uploadType,
            'upload_source' => 'web',
            'upload_metadata' => [
                'user_agent' => request()->userAgent(),
                'ip_address' => request()->ip(),
                'upload_time' => now()->toISOString(),
                'storage_driver' => $storageResult['metadata']['storage_driver'],
                'has_backup' => $storageResult['metadata']['has_backup'],
                'access_urls' => $storageResult['access_urls'],
            ],
            'processing_status' => 'uploaded',
            'upload_completed_at' => now(),
            'storage_driver' => $storageResult['metadata']['storage_driver'],
            'storage_path_primary' => $storageResult['primary_storage']['path'],
            'storage_path_backup' => $storageResult['backup_storage']['path'] ?? null,
            'streaming_url' => $storageResult['access_urls']['streaming'] ?? null,
            'download_url' => $storageResult['access_urls']['download'] ?? null,
        ]);

        // Queue for processing
        \App\Jobs\ProcessAudioMetadata::dispatch($upload);

        return $upload;
    }

    private function createAlbumForBatch($artist, string $uploadType, string $batchId, $request): \App\Models\Album
    {
        $albumTitle = $request->input('album_title') ?: 'Untitled ' . ucfirst($uploadType);
        $trackCount = is_array($request->file('audio_files')) ? count($request->file('audio_files')) : 1;

        return \App\Models\Album::create([
            'artist_id' => $artist->id,
            'title' => $albumTitle,
            'slug' => \Illuminate\Support\Str::slug($albumTitle . '-' . $artist->name),
            'description' => $request->input('album_description'),
            'status' => 'draft',
            'release_date' => $request->input('release_date') ? \Carbon\Carbon::parse($request->input('release_date')) : now(),

            // Batch management
            'upload_batch_id' => $batchId,
            'batch_upload_status' => 'uploading',
            'total_tracks_expected' => $trackCount,
            'tracks_uploaded' => 0,
            'tracks_processed' => 0,

            // Album classification
            'album_type' => $uploadType,
            'distribution_status' => 'not_submitted',

            // Uganda-specific defaults
            'primary_language' => 'English',
            'target_regions' => ['Uganda'],
            'audio_quality_standard' => 'cd',
        ]);
    }


    private function getUgandanGenres(): array
    {
        return [
            'Kadongo Kamu' => 'Traditional Ugandan folk music',
            'Lugaflow' => 'Ugandan hip-hop in local languages',
            'Afrobeats' => 'Modern African pop music',
            'Dancehall' => 'Jamaican-influenced dance music',
            'Gospel' => 'Christian music',
            'Kidandali' => 'Ugandan dance music',
            'Traditional' => 'Indigenous Ugandan music',
            'Hip-Hop' => 'Rap and hip-hop music',
            'R&B' => 'Rhythm and blues',
            'Reggae' => 'Jamaican reggae music',
            'Zouk' => 'Caribbean-influenced music',
            'Rhumba' => 'Congolese rumba',
        ];
    }

    private function getUgandanLanguages(): array
    {
        return [
            'English' => 'English',
            'Luganda' => 'Luganda',
            'Swahili' => 'Kiswahili',
            'Luo' => 'Luo/Acholi',
            'Runyankole' => 'Runyankole',
            'Rutooro' => 'Rutooro',
            'Lugbara' => 'Lugbara',
            'Ateso' => 'Ateso',
            'Runyoro' => 'Runyoro',
            'Lusoga' => 'Lusoga',
            'Mixed' => 'Multiple Languages',
        ];
    }

    private function extractLocalGenres(array $genreIds): array
    {
        $localGenres = ['Kadongo Kamu', 'Lugaflow', 'Kidandali', 'Traditional'];
        $selectedGenres = Genre::whereIn('id', $genreIds)->pluck('name')->toArray();

        return array_intersect($selectedGenres, $localGenres);
    }

    private function generateISRCCode(Artist $artist, Song $song): string
    {
        // Format: CC-XXX-YY-NNNNN
        // CC = Country code (UG for Uganda)
        // XXX = Registrant code (simplified for demo)
        // YY = Year
        // NNNNN = Designation code

        $countryCode = 'UG';
        $registrantCode = str_pad(substr(preg_replace('/[^A-Z0-9]/', '', strtoupper($artist->name)), 0, 3), 3, '0');
        $year = now()->format('y');
        $designation = str_pad($song->id, 5, '0', STR_PAD_LEFT);

        return "{$countryCode}-{$registrantCode}-{$year}-{$designation}";
    }
}
