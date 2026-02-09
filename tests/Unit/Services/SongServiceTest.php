<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\SongService;
use App\Services\MusicStorageService;
use App\Models\Song;
use App\Models\User;
use App\Models\Artist;
use App\Models\Album;
use App\Models\Genre;
use App\Models\Like;
use App\Models\Download;
use App\Models\PlayHistory;
use App\Models\Activity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Queue;
use Illuminate\Pagination\LengthAwarePaginator;
use Mockery;
use Exception;

class SongServiceTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected SongService $songService;
    protected $storageServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->storageServiceMock = Mockery::mock(MusicStorageService::class);
        $this->songService = new SongService($this->storageServiceMock);

        Storage::fake('public');
        Queue::fake();
        
        // Create necessary roles for tests
        \App\Models\Role::firstOrCreate(
            ['name' => 'artist'], 
            ['display_name' => 'Artist', 'description' => 'Music artist']
        );
        \App\Models\Role::firstOrCreate(
            ['name' => 'moderator'], 
            ['display_name' => 'Moderator', 'description' => 'Content moderator']
        );
        \App\Models\Role::firstOrCreate(
            ['name' => 'admin'], 
            ['display_name' => 'Administrator', 'description' => 'Administrator']
        );
        \App\Models\Role::firstOrCreate(
            ['name' => 'super_admin'], 
            ['display_name' => 'Super Administrator', 'description' => 'Super Administrator']
        );
    }

    /**
     * Test getting songs with basic filtering
     */
    public function test_get_songs_basic_filtering()
    {
        // Arrange
        $genre = Genre::factory()->create(['slug' => 'afrobeat']);
        $user = User::factory()->create();
        $artist = Artist::factory()->create(['user_id' => $user->id]);

        Song::factory()->count(5)->create([
            'status' => 'published',
            'primary_genre_id' => $genre->id,
            'artist_id' => $artist->id,
            'user_id' => $user->id,
        ]);

        Song::factory()->count(3)->create([
            'status' => 'pending_review',
            ]);

        // Act
        $result = $this->songService->getSongs(['genre' => 'afrobeat'], 10);

        // Assert
        $this->assertInstanceOf(LengthAwarePaginator::class, $result);
        $this->assertEquals(5, $result->total());
        $this->assertEquals(5, $result->count());
    }

    /**
     * Test getting songs with sorting
     */
    public function test_get_songs_with_sorting()
    {
        // Arrange
        Song::factory()->create([
            'status' => 'published',
            'play_count' => 1000,
            'created_at' => now()->subDays(1),
        ]);

        Song::factory()->create([
            'status' => 'published',
            'play_count' => 500,
            'created_at' => now()->subDays(2),
        ]);

        Song::factory()->create([
            'status' => 'published',
            'play_count' => 1500,
            'created_at' => now()->subDays(3),
        ]);

        // Act - Sort by popularity (play_count)
        $result = $this->songService->getSongs([
            'sort_by' => 'popularity',
            'sort_order' => 'desc'
        ], 10);

        // Assert
        $songs = $result->items();
        $this->assertEquals(1500, $songs[0]->play_count);
        $this->assertEquals(1000, $songs[1]->play_count);
        $this->assertEquals(500, $songs[2]->play_count);
    }

    /**
     * Test getting trending songs
     */
    public function test_get_trending_songs()
    {
        // Arrange
        $song1 = Song::factory()->create(['status' => 'published']);
        $song2 = Song::factory()->create(['status' => 'published']);
        $song3 = Song::factory()->create(['status' => 'published']);

        // Create recent play history for trending calculation
        PlayHistory::factory()->count(10)->create([
            'song_id' => $song1->id,
            'played_at' => now()->subDays(2),
        ]);

        PlayHistory::factory()->count(5)->create([
            'song_id' => $song2->id,
            'played_at' => now()->subDays(1),
        ]);

        PlayHistory::factory()->count(2)->create([
            'song_id' => $song3->id,
            'played_at' => now()->subDays(10), // Old plays, shouldn't count
        ]);

        // Act
        $trendingSongs = $this->songService->getTrendingSongs(7, 10);

        // Assert
        $this->assertEquals(2, $trendingSongs->count()); // Only songs with recent plays
        $this->assertEquals($song1->id, $trendingSongs->first()->id); // Most plays first
    }

    /**
     * Test getting new releases
     */
    public function test_get_new_releases()
    {
        // Arrange
        Song::factory()->count(3)->create([
            'status' => 'published',
            'created_at' => now()->subDays(5), // Recent
        ]);

        Song::factory()->count(2)->create([
            'status' => 'published',
            'created_at' => now()->subDays(35), // Old
        ]);

        // Act
        $newReleases = $this->songService->getNewReleases(30, 10);

        // Assert
        $this->assertEquals(3, $newReleases->count());
    }

    /**
     * Test song search functionality
     */
    public function test_search_songs()
    {
        // Arrange
        $user = User::factory()->create();
        $artist = Artist::factory()->create(['user_id' => $user->id, 'stage_name' => 'Test Artist']);
        $album = Album::factory()->create(['title' => 'Test Album', 'artist_id' => $artist->id, 'user_id' => $user->id]);

        Song::factory()->create([
            'title' => 'Amazing Song',
            'status' => 'published',
            'artist_id' => $artist->id,
            'user_id' => $user->id,
        ]);

        Song::factory()->create([
            'title' => 'Different Title',
            'description' => 'Amazing description',
            'status' => 'published',
            ]);

        Song::factory()->create([
            'title' => 'Another Song',
            'status' => 'published',
            'artist_id' => $artist->id,
            'user_id' => $user->id,
        ]);

        Song::factory()->create([
            'title' => 'Hidden Song',
            'status' => 'pending_review',
            ]);

        // Act
        $results = $this->songService->searchSongs('amazing', 10);

        // Assert
        $this->assertEquals(2, $results->total()); // Title and description matches

        // Test artist search
        $artistResults = $this->songService->searchSongs('Test Artist', 10);
        $this->assertEquals(2, $artistResults->total());
    }

    /**
     * Test recording song play
     */
    public function test_record_play_success()
    {
        // Arrange
        $user = User::factory()->create();
        $song = Song::factory()->create([
            'is_free' => true,
            'play_count' => 0,
        ]);

        $playData = [
            'play_duration_seconds' => 180,
            'was_completed' => true,
            'platform' => 'web',
        ];

        // Act
        $playHistory = $this->songService->recordPlay($song, $user, $playData);

        // Assert
        $this->assertInstanceOf(PlayHistory::class, $playHistory);
        $this->assertEquals($user->id, $playHistory->user_id);
        $this->assertEquals($song->id, $playHistory->song_id);
        $this->assertEquals(180, $playHistory->play_duration_seconds);
        $this->assertTrue($playHistory->completed);

        // Check that play count was incremented
        $song->refresh();
        $this->assertEquals(1, $song->play_count);

        // Check that activity was created
        $this->assertDatabaseHas('activities', [
            'user_id' => $user->id,
            'activity_type' => 'played_song',
            'subject_type' => Song::class,
            'subject_id' => $song->id,
        ]);
    }

    /**
     * Test play recording with premium content restriction
     */
    public function test_record_play_premium_restriction()
    {
        // Arrange
        $user = User::factory()->create(); // Regular user without subscription
        $song = Song::factory()->create(['is_free' => false]);

        // Act & Assert
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Premium subscription required to play this song');

        $this->songService->recordPlay($song, $user);
    }

    /**
     * Test song download functionality
     */
    public function test_download_song_success()
    {
        // Arrange
        $user = User::factory()->create([
            'subscription_type' => 'premium', // Premium user can download
        ]);
        $song = Song::factory()->create([
            'is_free' => true,
            'is_downloadable' => true,
            'status' => 'published',
            'file_size_bytes' => 5000000,
            'download_count' => 0,
        ]);

        // Act
        $result = $this->songService->downloadSong($song, $user);

        // Assert
        $this->assertArrayHasKey('download_url', $result);
        $this->assertArrayHasKey('expires_at', $result);
        $this->assertEquals('Download initiated successfully', $result['message']);

        // Check download record was created
        $this->assertDatabaseHas('downloads', [
            'user_id' => $user->id,
            'song_id' => $song->id,
        ]);

        // Check download count was incremented
        $song->refresh();
        $this->assertEquals(1, $song->download_count);
    }

    /**
     * Test download with existing download
     */
    public function test_download_song_already_downloaded()
    {
        // Arrange
        $user = User::factory()->create([
            'subscription_type' => 'premium',
        ]);
        $song = Song::factory()->create([
            'is_free' => true,
            'is_downloadable' => true,
            'status' => 'published',
        ]);

        $existingDownload = Download::factory()->create([
            'user_id' => $user->id,
            'song_id' => $song->id,
            'expires_at' => now()->addDays(30),
        ]);

        // Act
        $result = $this->songService->downloadSong($song, $user);

        // Assert
        $this->assertEquals('Song already downloaded', $result['message']);
        $this->assertEquals($existingDownload->expires_at->format('Y-m-d H:i:s'), $result['expires_at']->format('Y-m-d H:i:s'));
    }

    /**
     * Test download limit restriction
     */
    public function test_download_song_limit_reached()
    {
        // Arrange
        $user = User::factory()->create(); // Regular user without premium
        $song = Song::factory()->create([
            'is_free' => true,
            'is_downloadable' => true,
            'status' => 'published',
        ]);

        // Create downloads to reach the limit (assuming limit is 3 per day for free users)
        Download::factory()->count(3)->create([
            'user_id' => $user->id,
            'created_at' => now(),
        ]);

        // Act & Assert
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Download limit reached. Upgrade to premium for unlimited downloads.');

        $this->songService->downloadSong($song, $user);
    }

    /**
     * Test song like/unlike toggle
     */
    public function test_toggle_like()
    {
        // Arrange
        $user = User::factory()->create();
        $song = Song::factory()->create(['like_count' => 5]);

        // Act - Like the song
        $result = $this->songService->toggleLike($song, $user);

        // Assert
        $this->assertTrue($result['is_liked']);
        $this->assertEquals(6, $result['like_count']);
        $this->assertEquals('Song liked', $result['message']);

        // Act - Unlike the song
        $result = $this->songService->toggleLike($song, $user);

        // Assert
        $this->assertFalse($result['is_liked']);
        $this->assertEquals(5, $result['like_count']);
        $this->assertEquals('Song unliked', $result['message']);
    }

    /**
     * Test song upload success
     */
    public function test_upload_song_success()
    {
        // Arrange
        $user = User::factory()->create();
        $user->assignRole('artist'); // Give artist role for permission
        $artist = Artist::factory()->create(['user_id' => $user->id]);
        
        $genre = Genre::factory()->create();
        $album = Album::factory()->create(['artist_id' => $artist->id, 'user_id' => $user->id]);

        $file = UploadedFile::fake()->create('song.mp3', 5000, 'audio/mpeg');

        $songData = [
            'file' => $file,
            'title' => 'Test Song',
            'description' => 'A test song',
            'genre_id' => $genre->id,
            'album_id' => $album->id,
            'is_free' => true,
            'is_explicit' => false,
            'language' => 'en',
            'moods' => ['happy', 'energetic'],
            'tags' => ['pop', 'dance'],
        ];

        $fileData = [
            'file_path' => 'songs/test-song.mp3',
            'file_size' => 5000000,
            'file_format' => 'mp3',
            'duration' => 210,
        ];

        $this->storageServiceMock
            ->shouldReceive('uploadSong')
            ->once()
            ->with($file, $user)
            ->andReturn($fileData);

        // Act
        $song = $this->songService->uploadSong($songData, $user);

        // Assert
        $this->assertInstanceOf(Song::class, $song);
        $this->assertEquals('Test Song', $song->title);
        $this->assertEquals('A test song', $song->description);
        $this->assertEquals($user->id, $song->user_id);
        $this->assertEquals($artist->id, $song->artist_id);
        $this->assertEquals($genre->id, $song->primary_genre_id);
        $this->assertEquals($album->id, $song->album_id);
        $this->assertEquals('songs/test-song.mp3', $song->audio_file_original);
        $this->assertEquals(210, $song->duration);
        $this->assertEquals('pending_review', $song->status);
        $this->assertTrue($song->is_free);
        $this->assertFalse($song->is_explicit);
    }

    /**
     * Test song upload with cover art
     */
    public function test_upload_song_with_cover_art()
    {
        // Arrange
        $user = User::factory()->create();
        $user->assignRole('artist');
        $artist = Artist::factory()->create(['user_id' => $user->id]);
        
        $file = UploadedFile::fake()->create('song.mp3', 5000, 'audio/mpeg');
        $coverArt = UploadedFile::fake()->image('cover.jpg', 500, 500);

        $songData = [
            'file' => $file,
            'title' => 'Test Song',
            'cover_art' => $coverArt,
        ];

        $fileData = [
            'file_path' => 'songs/test-song.mp3',
            'file_size' => 5000000,
            'file_format' => 'mp3',
            'duration' => 210,
        ];

        $coverData = [
            'file_path' => 'covers/test-cover.jpg',
        ];

        $this->storageServiceMock
            ->shouldReceive('uploadSong')
            ->once()
            ->andReturn($fileData);

        $this->storageServiceMock
            ->shouldReceive('uploadCoverArt')
            ->once()
            ->andReturn($coverData);

        // Act
        $song = $this->songService->uploadSong($songData, $user);

        // Assert
        $this->assertEquals('covers/test-cover.jpg', $song->artwork);
    }

    /**
     * Test song upload permission denied
     */
    public function test_upload_song_permission_denied()
    {
        // Arrange
        $user = User::factory()->create(); // Regular user without upload permission
        $file = UploadedFile::fake()->create('song.mp3', 5000, 'audio/mpeg');

        $songData = [
            'file' => $file,
            'title' => 'Test Song',
        ];

        // Act & Assert
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('You do not have permission to upload songs');

        $this->songService->uploadSong($songData, $user);
    }

    /**
     * Test song update functionality
     */
    public function test_update_song_success()
    {
        // Arrange
        $user = User::factory()->create();
        $artist = Artist::factory()->create(['user_id' => $user->id]);
        $song = Song::factory()->create(['artist_id' => $artist->id, 'user_id' => $user->id]);
        $genre = Genre::factory()->create();

        $updateData = [
            'title' => 'Updated Title',
            'description' => 'Updated description',
            'primary_genre_id' => $genre->id,
            'is_explicit' => true,
        ];

        // Act
        $updatedSong = $this->songService->updateSong($song, $updateData, $user);

        // Assert
        $this->assertEquals('Updated Title', $updatedSong->title);
        $this->assertEquals('Updated description', $updatedSong->description);
        $this->assertEquals($genre->id, $updatedSong->primary_genre_id);
        $this->assertTrue($updatedSong->is_explicit);
    }

    /**
     * Test song update permission denied
     */
    public function test_update_song_permission_denied()
    {
        // Arrange
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $artist = Artist::factory()->create(['user_id' => $otherUser->id]);
        $song = Song::factory()->create(['artist_id' => $artist->id, 'user_id' => $otherUser->id]);

        $updateData = ['title' => 'Updated Title'];

        // Act & Assert
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('You do not have permission to edit this song');

        $this->songService->updateSong($song, $updateData, $user);
    }

    /**
     * Test song deletion
     */
    public function test_delete_song_success()
    {
        // Arrange
        $user = User::factory()->create();
        $artist = Artist::factory()->create(['user_id' => $user->id]);
        $song = Song::factory()->create([
            'artist_id' => $artist->id,
            'user_id' => $user->id,
            'status' => 'published',
        ]);

        $this->storageServiceMock
            ->shouldReceive('deleteSongFiles')
            ->once()
            ->with($song);

        // Act
        $result = $this->songService->deleteSong($song, $user);

        // Assert
        $this->assertTrue($result);

        $song->refresh();
        // Check song is marked as removed
        $this->assertEquals('removed', $song->status);
    }

    /**
     * Test song moderation
     */
    public function test_moderate_song_approval()
    {
        // Arrange
        $moderator = User::factory()->create();
        $moderator->assignRole('moderator'); // Give moderator permission
        
        $song = Song::factory()->create(['status' => 'pending_review']);

        // Act
        $moderatedSong = $this->songService->moderateSong($song, 'approve', $moderator, 'Meets quality standards');

        // Assert
        $this->assertEquals('published', $moderatedSong->status);
        $this->assertEquals($moderator->id, $moderatedSong->moderated_by);
        $this->assertEquals('Meets quality standards', $moderatedSong->moderation_reason);
        $this->assertNotNull($moderatedSong->moderated_at);
    }

    /**
     * Test song moderation permission denied
     */
    public function test_moderate_song_permission_denied()
    {
        // Arrange
        $user = User::factory()->create(); // Regular user without moderation permission
        $song = Song::factory()->create(['status' => 'pending_review']);

        // Act & Assert
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('You do not have permission to moderate content');

        $this->songService->moderateSong($song, 'approve', $user);
    }

    /**
     * Test song analytics
     */
    public function test_get_song_analytics()
    {
        // Arrange
        $song = Song::factory()->create([
            'play_count' => 1000,
            'like_count' => 150,
            'download_count' => 75,
        ]);

        // Create play history for analytics
        PlayHistory::factory()->count(50)->create([
            'song_id' => $song->id,
            'played_at' => now()->subDays(5),
            'was_completed' => true,
        ]);

        PlayHistory::factory()->count(30)->create([
            'song_id' => $song->id,
            'played_at' => now()->subDays(3),
            'was_completed' => false,
        ]);

        // Act
        $analytics = $this->songService->getSongAnalytics($song, 30);

        // Assert
        $this->assertEquals(1000, $analytics['total_plays']);
        $this->assertEquals(80, $analytics['recent_plays']); // 50 + 30
        $this->assertEquals(150, $analytics['total_likes']);
        $this->assertEquals(75, $analytics['total_downloads']);
        $this->assertEquals(62.5, $analytics['completion_rate']); // 50 completed out of 80 total
        $this->assertArrayHasKey('daily_plays', $analytics);
        $this->assertArrayHasKey('listener_demographics', $analytics);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
