<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Services\MusicStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MusicStreamController extends Controller
{
    private MusicStorageService $storageService;

    public function __construct(MusicStorageService $storageService)
    {
        $this->storageService = $storageService;
    }

    /**
     * Stream audio file with range support
     */
    public function stream(Request $request): StreamedResponse
    {
        try {
            \Log::info('MusicStreamController@stream: New stream request', ['ip' => $request->ip(), 'ua' => $request->userAgent()]);

            $filePath = decrypt($request->get('file'));
            $disk = decrypt($request->get('disk'));
            $songId = $request->get('song_id'); // Get song ID if provided

            \Log::info('Stream details', ['path' => $filePath, 'disk' => $disk, 'song_id' => $songId]);

            // Increment play count if song ID is provided
            if ($songId) {
                $song = \App\Models\Song::find($songId);
                if ($song && !$request->hasHeader('Range')) {
                    // Only increment on initial request, not range requests
                    $song->increment('play_count');
                    \Log::info('Incremented play count', ['song_id' => $songId, 'new_count' => $song->play_count]);
                }
            }

            // Get file info
            $fileInfo = $this->storageService->getFileInfo($filePath, $disk);
            \Log::info('File info', ['info' => $fileInfo]);

            if (!$fileInfo['exists']) {
                \Log::error('Stream failed: File not found', ['path' => $filePath, 'disk' => $disk]);
                abort(404, 'File not found');
            }

            $diskInstance = Storage::disk($this->mapDiskName($disk));

            if (!$diskInstance->exists($filePath)) {
                \Log::error('Stream failed: File does not exist on disk', ['path' => $filePath, 'disk' => $disk]);
                abort(404, 'File not found');
            }

            $fileSize = $fileInfo['size'];
            $mimeType = $fileInfo['mime_type'] ?? 'audio/mpeg';
            $fileName = basename($filePath);

            \Log::info('Streaming file', ['name' => $fileName, 'size' => $fileSize, 'mime' => $mimeType]);

            return $this->createStreamedResponse($diskInstance, $filePath, $fileSize, $mimeType, $fileName, $request);

        } catch (\Exception $e) {
            \Log::error('Streaming error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            abort(500, 'Streaming error');
        }
    }

    /**
     * Download audio file
     */
    public function download(Request $request)
    {
        try {
            $filePath = decrypt($request->get('file'));
            $disk = decrypt($request->get('disk'));

            // Get file info
            $fileInfo = $this->storageService->getFileInfo($filePath, $disk);

            if (!$fileInfo['exists']) {
                abort(404, 'File not found');
            }

            $diskInstance = Storage::disk($this->mapDiskName($disk));
            $fileName = basename($filePath);

            return $diskInstance->download($filePath, $fileName);

        } catch (\Exception $e) {
            \Log::error('Download error: ' . $e->getMessage());
            abort(500, 'Download error');
        }
    }

    /**
     * Create streamed response with range support
     */
    private function createStreamedResponse(
        $diskInstance,
        string $filePath,
        int $fileSize,
        string $mimeType,
        string $fileName,
        Request $request
    ): StreamedResponse {
        $stream = $diskInstance->readStream($filePath);

        if (!$stream) {
            abort(500, 'Cannot read file');
        }

        $rangeHeader = $request->header('Range');
        $start = 0;
        $end = $fileSize - 1;
        $contentLength = $fileSize;

        // Handle range requests for seeking
        if ($rangeHeader) {
            if (preg_match('/bytes=(\d+)-(\d+)?/', $rangeHeader, $matches)) {
                $start = intval($matches[1]);
                if (isset($matches[2]) && $matches[2] !== '') {
                    $end = intval($matches[2]);
                }
                $contentLength = $end - $start + 1;
            }
        }

        $headers = [
            'Content-Type' => $mimeType,
            'Content-Length' => $contentLength,
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'public, max-age=3600',
            'Content-Disposition' => 'inline; filename="' . $fileName . '"',
        ];

        if ($rangeHeader) {
            $headers['Content-Range'] = "bytes {$start}-{$end}/{$fileSize}";
            $status = 206; // Partial Content
        } else {
            $status = 200;
        }

        return new StreamedResponse(function () use ($stream, $start, $contentLength) {
            if ($start > 0) {
                fseek($stream, $start);
            }

            $chunkSize = config('music.streaming.chunk_size', 8192);
            $bytesLeft = $contentLength;

            while (!feof($stream) && $bytesLeft > 0) {
                $bytesToRead = min($chunkSize, $bytesLeft);
                $chunk = fread($stream, $bytesToRead);

                if ($chunk === false) {
                    break;
                }

                echo $chunk;
                flush();

                $bytesLeft -= strlen($chunk);

                if (connection_aborted()) {
                    break;
                }
            }

            fclose($stream);
        }, $status, $headers);
    }

    /**
     * Map disk names to actual Laravel disk configurations
     */
    private function mapDiskName(string $disk): string
    {
        $diskMap = [
            'local' => 'music_private',
            'digitalocean' => 'digitalocean',
            'local_public' => 'music_public',
        ];

        return $diskMap[$disk] ?? $disk;
    }

    /**
     * Get file temporary URL for private files
     */
    public function temporaryUrl(Request $request)
    {
        try {
            $filePath = decrypt($request->get('file'));
            $disk = decrypt($request->get('disk'));
            $hours = $request->get('hours', 24);

            $diskInstance = Storage::disk($this->mapDiskName($disk));

            if (!$diskInstance->exists($filePath)) {
                return response()->json(['error' => 'File not found'], 404);
            }

            $url = $diskInstance->temporaryUrl(
                $filePath,
                now()->addHours($hours)
            );

            return response()->json([
                'url' => $url,
                'expires_at' => now()->addHours($hours)->toISOString()
            ]);

        } catch (\Exception $e) {
            \Log::error('Temporary URL generation error: ' . $e->getMessage());
            return response()->json(['error' => 'URL generation failed'], 500);
        }
    }
}