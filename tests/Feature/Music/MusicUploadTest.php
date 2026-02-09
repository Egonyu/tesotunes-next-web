<?php

namespace Tests\Feature\Music;

use Tests\TestCase;
use App\Models\User;
use App\Models\Artist;
use App\Models\Song;
use App\Models\Album;
use App\Models\Genre;
use App\Models\ContentReview;
use App\Services\MusicStorageService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Event;

class MusicUploadTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        Queue::fake();
        Event::fake();
        
        // Music upload endpoints are not yet implemented
        $this->markTestIncomplete('Music upload functionality is not yet implemented. Waiting for upload API endpoints.');
    }

    /**
     * Test successful music file upload
     */
    public function test_successful_music_upload()
    {
        // Arrange
        $artist = User::factory()->create();

        $genre = Genre::factory()->create();
        $album = Album::factory()->create(['artist_id' => $artist->id]);

        $audioFile = UploadedFile::fake()->create('song.mp3', 5000); // 5MB file
        $coverArt = UploadedFile::fake()->image('cover.jpg', 500, 500);

        // Act
        $response = $this->actingAs($artist)->postJson('/api/music/upload', [
            'title' => 'Amazing Song',
            'description' => 'This is an amazing song',
            'audio_file' => $audioFile,
            'cover_art' => $coverArt,
            'genre_id' => $genre->id,
            'album_id' => $album->id,
            'is_free' => false,
            'is_explicit' => false,
            'language' => 'en',
            'moods' => ['happy', 'energetic'],
            'tags' => ['pop', 'dance'],
            'release_date' => now()->addDays(7)->format('Y-m-d'),
        ]);

        // Assert
        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'song' => [
                    'id',
                    'title',
                    'description',
                    'artist_id',
                    'genre_id',
                    'album_id',
                    'duration',
                    'file_path',
                    'cover_art_path',
                    'status',
                ]
            ]);

        // Verify song was created in database
        $this->assertDatabaseHas('songs', [
            'title' => 'Amazing Song',
            'artist_id' => $artist->id,
            'genre_id' => $genre->id,
            'album_id' => $album->id,
            'status' => 'pending_review',
            'is_explicit' => false,
            'language' => 'en',
        ]);

        // Verify files were stored
        $song = Song::where('title', 'Amazing Song')->first();
        $this->assertNotNull($song->file_path);
        $this->assertNotNull($song->cover_art_path);

        // Verify background job was queued for audio processing
        Queue::assertPushed(\App\Jobs\ProcessAudioMetadata::class);
    }

    /**
     * Test file validation - invalid audio format
     */
    public function test_upload_invalid_audio_format()
    {
        $artist = User::factory()->create();

        $invalidFile = UploadedFile::fake()->create('document.pdf', 1000);

        $response = $this->actingAs($artist)->postJson('/api/music/upload', [
            'title' => 'Test Song',
            'audio_file' => $invalidFile,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['audio_file']);
    }

    /**
     * Test file validation - file too large
     */
    public function test_upload_file_too_large()
    {
        $artist = User::factory()->create();

        // Create a file larger than the allowed limit (assume 100MB limit)
        $largeFile = UploadedFile::fake()->create('large_song.mp3', 150000); // 150MB

        $response = $this->actingAs($artist)->postJson('/api/music/upload', [
            'title' => 'Large Song',
            'audio_file' => $largeFile,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['audio_file']);
    }

    /**
     * Test file validation - file too small
     */
    public function test_upload_file_too_small()
    {
        $artist = User::factory()->create();

        $tinyFile = UploadedFile::fake()->create('tiny_song.mp3', 50); // 50KB - too small

        $response = $this->actingAs($artist)->postJson('/api/music/upload', [
            'title' => 'Tiny Song',
            'audio_file' => $tinyFile,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['audio_file']);
    }

    /**
     * Test metadata validation
     */
    public function test_upload_metadata_validation()
    {
        $artist = User::factory()->create();

        $audioFile = UploadedFile::fake()->create('song.mp3', 5000);

        // Test missing required fields
        $response = $this->actingAs($artist)->postJson('/api/music/upload', [
            'audio_file' => $audioFile,
            // Missing title
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title']);

        // Test invalid data types
        $response = $this->actingAs($artist)->postJson('/api/music/upload', [
            'title' => 'Test Song',
            'audio_file' => $audioFile,
            'genre_id' => 'invalid', // Should be integer
            'is_explicit' => 'yes', // Should be boolean
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['genre_id', 'is_explicit']);
    }

    /**
     * Test cover art validation
     */
    public function test_cover_art_validation()
    {
        $artist = User::factory()->create();

        $audioFile = UploadedFile::fake()->create('song.mp3', 5000);

        // Test invalid image format
        $invalidCover = UploadedFile::fake()->create('cover.txt', 100);

        $response = $this->actingAs($artist)->postJson('/api/music/upload', [
            'title' => 'Test Song',
            'audio_file' => $audioFile,
            'cover_art' => $invalidCover,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['cover_art']);

        // Test image too small
        $smallCover = UploadedFile::fake()->image('small.jpg', 100, 100); // Too small

        $response = $this->actingAs($artist)->postJson('/api/music/upload', [
            'title' => 'Test Song',
            'audio_file' => $audioFile,
            'cover_art' => $smallCover,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['cover_art']);
    }

    /**
     * Test upload without permission
     */
    public function test_upload_without_permission()
    {
        $user = User::factory()->create(); // Regular user without upload permission
        $audioFile = UploadedFile::fake()->create('song.mp3', 5000);

        $response = $this->actingAs($user)->postJson('/api/music/upload', [
            'title' => 'Test Song',
            'audio_file' => $audioFile,
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You do not have permission to upload music',
            ]);
    }

    /**
     * Test batch upload functionality
     */
    public function test_batch_upload()
    {
        $artist = User::factory()->create();

        $album = Album::factory()->create(['artist_id' => $artist->id]);
        $genre = Genre::factory()->create();

        $files = [
            UploadedFile::fake()->create('song1.mp3', 5000),
            UploadedFile::fake()->create('song2.mp3', 4500),
            UploadedFile::fake()->create('song3.mp3', 5500),
        ];

        $response = $this->actingAs($artist)->postJson('/api/music/batch-upload', [
            'album_id' => $album->id,
            'genre_id' => $genre->id,
            'files' => $files,
            'titles' => ['Song One', 'Song Two', 'Song Three'],
            'is_explicit' => false,
            'language' => 'en',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'batch_id',
                'songs_count',
            ]);

        // Verify songs were created
        $this->assertDatabaseHas('songs', ['title' => 'Song One', 'artist_id' => $artist->id]);
        $this->assertDatabaseHas('songs', ['title' => 'Song Two', 'artist_id' => $artist->id]);
        $this->assertDatabaseHas('songs', ['title' => 'Song Three', 'artist_id' => $artist->id]);

        // Verify batch processing job was queued
        Queue::assertPushed(\App\Jobs\ProcessAlbumBatch::class);
    }

    /**
     * Test upload progress tracking
     */
    public function test_upload_progress_tracking()
    {
        $artist = User::factory()->create();

        $audioFile = UploadedFile::fake()->create('song.mp3', 10000); // Larger file

        // Start upload
        $response = $this->actingAs($artist)->postJson('/api/music/upload', [
            'title' => 'Large Song',
            'audio_file' => $audioFile,
        ]);

        $response->assertStatus(201);
        $songId = $response->json('song.id');

        // Check upload progress
        $progressResponse = $this->actingAs($artist)->getJson("/api/music/upload-progress/{$songId}");

        $progressResponse->assertStatus(200)
            ->assertJsonStructure([
                'progress',
                'status',
                'current_step',
                'total_steps',
            ]);
    }

    /**
     * Test audio metadata extraction
     */
    public function test_audio_metadata_extraction()
    {
        $artist = User::factory()->create();

        // Mock an MP3 file with embedded metadata
        $audioFile = UploadedFile::fake()->create('song_with_metadata.mp3', 5000);

        $response = $this->actingAs($artist)->postJson('/api/music/upload', [
            'title' => 'Metadata Song',
            'audio_file' => $audioFile,
            'extract_metadata' => true,
        ]);

        $response->assertStatus(201);

        // Verify metadata extraction job was queued
        Queue::assertPushed(\App\Jobs\ProcessAudioMetadata::class, function ($job) {
            return $job->extractMetadata === true;
        });
    }

    /**
     * Test content moderation workflow
     */
    public function test_content_moderation_workflow()
    {
        $artist = User::factory()->create();

        $audioFile = UploadedFile::fake()->create('explicit_song.mp3', 5000);

        $response = $this->actingAs($artist)->postJson('/api/music/upload', [
            'title' => 'Explicit Song',
            'audio_file' => $audioFile,
            'is_explicit' => true,
            'lyrics' => 'These are some explicit lyrics with bad words',
        ]);

        $response->assertStatus(201);

        $song = Song::where('title', 'Explicit Song')->first();

        // Verify content review record was created
        $this->assertDatabaseHas('content_reviews', [
            'reviewable_type' => Song::class,
            'reviewable_id' => $song->id,
            'status' => 'pending',
            'priority' => 'high', // Due to explicit content
        ]);

        // Verify song status is pending review
        $this->assertEquals('pending_review', $song->status);
    }

    /**
     * Test upload with virus scanning
     */
    public function test_upload_with_virus_scanning()
    {
        $artist = User::factory()->create();

        $audioFile = UploadedFile::fake()->create('suspicious_file.mp3', 5000);

        // Mock virus scanner to detect threat
        $this->mock(\App\Services\VirusScannerService::class, function ($mock) {
            $mock->shouldReceive('scanFile')
                ->once()
                ->andReturn([
                    'clean' => false,
                    'threats' => ['Trojan.Generic.123'],
                    'scan_id' => 'scan_456789'
                ]);
        });

        $response = $this->actingAs($artist)->postJson('/api/music/upload', [
            'title' => 'Suspicious Song',
            'audio_file' => $audioFile,
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'File failed security scan',
            ]);

        // Verify no song was created
        $this->assertDatabaseMissing('songs', ['title' => 'Suspicious Song']);
    }

    /**
     * Test upload quota enforcement
     */
    public function test_upload_quota_enforcement()
    {
        $artist = User::factory()->create();

        // Set artist upload quota to 2 songs per month
        $artist->artist_profile->update(['monthly_upload_limit' => 2]);

        // Upload 2 songs this month
        Song::factory()->count(2)->create([
            'artist_id' => $artist->id,
            'created_at' => now(),
        ]);

        $audioFile = UploadedFile::fake()->create('quota_exceeded.mp3', 5000);

        $response = $this->actingAs($artist)->postJson('/api/music/upload', [
            'title' => 'Quota Exceeded',
            'audio_file' => $audioFile,
        ]);

        $response->assertStatus(429)
            ->assertJson([
                'success' => false,
                'message' => 'Monthly upload quota exceeded',
            ]);
    }

    /**
     * Test duplicate detection
     */
    public function test_duplicate_detection()
    {
        $artist = User::factory()->create();

        // Create existing song
        Song::factory()->create([
            'title' => 'Existing Song',
            'artist_id' => $artist->id,
        ]);

        $audioFile = UploadedFile::fake()->create('duplicate.mp3', 5000);

        $response = $this->actingAs($artist)->postJson('/api/music/upload', [
            'title' => 'Existing Song', // Same title
            'audio_file' => $audioFile,
        ]);

        $response->assertStatus(409)
            ->assertJson([
                'success' => false,
                'message' => 'A song with this title already exists',
            ]);
    }

    /**
     * Test upload with copyright information
     */
    public function test_upload_with_copyright_info()
    {
        $artist = User::factory()->create();

        $audioFile = UploadedFile::fake()->create('copyrighted_song.mp3', 5000);

        $response = $this->actingAs($artist)->postJson('/api/music/upload', [
            'title' => 'Copyrighted Song',
            'audio_file' => $audioFile,
            'copyright_info' => [
                'owner' => 'Test Music Publishing',
                'year' => 2024,
                'percentage' => 100,
                'territory' => 'worldwide',
            ],
            'publishing_splits' => [
                [
                    'name' => 'John Songwriter',
                    'percentage' => 50,
                    'role' => 'composer',
                ],
                [
                    'name' => 'Jane Lyricist',
                    'percentage' => 50,
                    'role' => 'lyricist',
                ],
            ],
        ]);

        $response->assertStatus(201);

        $song = Song::where('title', 'Copyrighted Song')->first();

        // Verify publishing rights were created
        $this->assertDatabaseHas('publishing_rights', [
            'song_id' => $song->id,
            'copyright_owner' => 'Test Music Publishing',
            'copyright_year' => 2024,
        ]);

        // Verify royalty splits were created
        $this->assertDatabaseHas('royalty_splits', [
            'song_id' => $song->id,
            'contributor_name' => 'John Songwriter',
            'percentage' => 50,
            'role' => 'composer',
        ]);
    }

    /**
     * Test upload failure recovery
     */
    public function test_upload_failure_recovery()
    {
        $artist = User::factory()->create();

        $audioFile = UploadedFile::fake()->create('recovery_test.mp3', 5000);

        // Mock storage service to fail
        $this->mock(MusicStorageService::class, function ($mock) {
            $mock->shouldReceive('uploadSong')
                ->once()
                ->andThrow(new \Exception('Storage service unavailable'));
        });

        $response = $this->actingAs($artist)->postJson('/api/music/upload', [
            'title' => 'Recovery Test',
            'audio_file' => $audioFile,
        ]);

        $response->assertStatus(500)
            ->assertJson([
                'success' => false,
                'message' => 'Upload failed. Please try again.',
            ]);

        // Verify no partial records were created
        $this->assertDatabaseMissing('songs', ['title' => 'Recovery Test']);

        // Verify cleanup was performed
        Storage::disk('public')->assertMissing('temp/recovery_test.mp3');
    }

    /**
     * Test upload analytics tracking
     */
    public function test_upload_analytics_tracking()
    {
        $artist = User::factory()->create();

        $audioFile = UploadedFile::fake()->create('analytics_song.mp3', 5000);

        $response = $this->actingAs($artist)->postJson('/api/music/upload', [
            'title' => 'Analytics Song',
            'audio_file' => $audioFile,
        ]);

        $response->assertStatus(201);

        // Verify upload analytics were recorded
        $this->assertDatabaseHas('upload_analytics', [
            'user_id' => $artist->id,
            'file_type' => 'audio',
            'file_size' => 5000000,
            'status' => 'success',
        ]);
    }
}