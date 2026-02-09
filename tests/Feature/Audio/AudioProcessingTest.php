<?php

namespace Tests\Feature\Audio;

use App\Jobs\Audio\GeneratePreviewJob;
use App\Jobs\Audio\GenerateWaveformJob;
use App\Jobs\Audio\ProcessAudioUploadJob;
use App\Jobs\Audio\TranscodeAudioJob;
use App\Models\Song;
use App\Models\User;
use App\Models\Artist;
use App\Services\Audio\FFmpegService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AudioProcessingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        Storage::fake('digitalocean');
    }

    public function test_ffmpeg_service_is_available(): void
    {
        $ffmpeg = app(FFmpegService::class);

        // Note: This will fail if FFmpeg is not installed
        // Skip if FFmpeg is not available in CI/CD
        if (!$ffmpeg->isAvailable()) {
            $this->markTestSkipped('FFmpeg is not installed');
        }

        $this->assertTrue($ffmpeg->isAvailable());
        $this->assertNotNull($ffmpeg->getVersion());
    }

    public function test_audio_upload_queues_processing_jobs(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $artist = Artist::factory()->create(['user_id' => $user->id]);

        $song = Song::factory()->create([
            'user_id' => $user->id,
            'artist_id' => $artist->id,
            'status' => 'draft'
        ]);

        // Create a temp file
        $tempPath = 'temp/uploads/test.mp3';
        Storage::disk('local')->put($tempPath, 'fake audio content');

        ProcessAudioUploadJob::dispatch($song, $tempPath);

        Queue::assertPushed(ProcessAudioUploadJob::class, function ($job) use ($song) {
            return $job->song->id === $song->id;
        });
    }

    public function test_transcode_job_is_queued_with_correct_quality(): void
    {
        Queue::fake();

        $song = Song::factory()->create();

        TranscodeAudioJob::dispatch($song, '320kbps');
        TranscodeAudioJob::dispatch($song, '128kbps');

        Queue::assertPushed(TranscodeAudioJob::class, 2);

        Queue::assertPushed(TranscodeAudioJob::class, function ($job) {
            return $job->quality === '320kbps';
        });

        Queue::assertPushed(TranscodeAudioJob::class, function ($job) {
            return $job->quality === '128kbps';
        });
    }

    public function test_preview_generation_job_is_queued(): void
    {
        Queue::fake();

        $song = Song::factory()->create();

        GeneratePreviewJob::dispatch($song, 0, 30);

        Queue::assertPushed(GeneratePreviewJob::class, function ($job) use ($song) {
            return $job->song->id === $song->id && $job->duration === 30;
        });
    }

    public function test_waveform_generation_job_is_queued_on_low_priority(): void
    {
        Queue::fake();

        $song = Song::factory()->create();

        GenerateWaveformJob::dispatch($song);

        Queue::assertPushed(GenerateWaveformJob::class, function ($job) use ($song) {
            return $job->song->id === $song->id && $job->queue === 'low';
        });
    }

    public function test_processing_status_is_updated_correctly(): void
    {
        $user = User::factory()->create();
        $artist = Artist::factory()->create(['user_id' => $user->id]);

        $song = Song::factory()->create([
            'user_id' => $user->id,
            'artist_id' => $artist->id,
            'processing_status' => []
        ]);

        $song->update([
            'processing_status' => [
                '320kbps' => 'completed',
                '128kbps' => 'completed',
                'preview' => 'completed'
            ]
        ]);

        $this->assertEquals('completed', $song->processing_status['320kbps']);
        $this->assertEquals('completed', $song->processing_status['128kbps']);
        $this->assertEquals('completed', $song->processing_status['preview']);
    }
}
