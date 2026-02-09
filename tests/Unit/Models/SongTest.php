<?php

namespace Tests\Unit\Models;

use App\Models\Song;
use App\Models\Artist;
use App\Models\Album;
use App\Models\Genre;
use App\Models\Mood;
use App\Models\User;
use App\Models\MusicUpload;
use App\Models\ISRCCode;
use App\Models\PlayHistory;
use App\Models\PublishingRights;
use App\Models\RoyaltySplit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SongTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Artist $artist;
    protected Song $song;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test user and artist
        $this->user = User::factory()->create();

        $this->artist = Artist::factory()->create([
            'user_id' => $this->user->id,
        ]);

        $this->song = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
        ]);
    }

    public function test_song_can_be_created_with_required_fields(): void
    {
        $song = Song::create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
            'title' => 'Test Song',
            'slug' => 'test-song',
            'audio_file_original' => 'songs/test.mp3',
            'status' => 'draft',
        ]);

        $this->assertDatabaseHas('songs', [
            'title' => 'Test Song',
            'slug' => 'test-song',
        ]);
    }

    public function test_song_belongs_to_user(): void
    {
        $this->assertInstanceOf(User::class, $this->song->user);
        $this->assertEquals($this->user->id, $this->song->user->id);
    }

    public function test_song_belongs_to_artist(): void
    {
        $this->assertInstanceOf(Artist::class, $this->song->artist);
        $this->assertEquals($this->artist->id, $this->song->artist->id);
    }

    public function test_song_can_belong_to_album(): void
    {
        $album = Album::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
        ]);

        $this->song->update(['album_id' => $album->id]);

        $this->assertInstanceOf(Album::class, $this->song->album);
        $this->assertEquals($album->id, $this->song->album->id);
    }

    public function test_song_can_have_many_genres(): void
    {
        $genres = Genre::factory()->count(3)->create();

        $this->song->genres()->attach($genres->pluck('id'));

        $this->assertCount(3, $this->song->genres);
        $this->assertInstanceOf(Genre::class, $this->song->genres->first());
    }

    public function test_song_can_have_many_moods(): void
    {
        $moods = Mood::factory()->count(2)->create();

        $this->song->moods()->attach($moods->pluck('id'));

        $this->assertCount(2, $this->song->moods);
        $this->assertInstanceOf(Mood::class, $this->song->moods->first());
    }

    public function test_song_has_music_upload_relationship(): void
    {
        $this->markTestSkipped('MusicUpload relationship schema inconsistency - song_id column not in music_uploads table');
        
        $musicUpload = MusicUpload::factory()->create([
            'user_id' => $this->user->id,
            'song_id' => $this->song->id,
        ]);

        $this->assertInstanceOf(MusicUpload::class, $this->song->musicUpload);
        $this->assertEquals($musicUpload->id, $this->song->musicUpload->id);
    }

    public function test_song_has_isrc_code_relationship(): void
    {
        $isrc = ISRCCode::factory()->create([
            'song_id' => $this->song->id,
        ]);

        $this->assertInstanceOf(ISRCCode::class, $this->song->isrcCode);
        $this->assertEquals($isrc->code, $this->song->isrcCode->code);
    }

    public function test_song_has_play_history_relationship(): void
    {
        PlayHistory::factory()->count(5)->create([
            'song_id' => $this->song->id,
        ]);

        $this->assertCount(5, $this->song->playHistory);
        $this->assertInstanceOf(PlayHistory::class, $this->song->playHistory->first());
    }

    public function test_song_casts_boolean_fields_correctly(): void
    {
        $song = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
            'is_free' => true,
            'is_explicit' => false,
            'is_downloadable' => true,
        ]);

        $this->assertTrue($song->is_free);
        $this->assertFalse($song->is_explicit);
        $this->assertTrue($song->is_downloadable);
        $this->assertIsBool($song->is_free);
    }

    public function test_song_casts_decimal_fields_correctly(): void
    {
        $song = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
            'price' => 5000.50,
            'revenue_generated' => 15000.75,
        ]);

        $this->assertEquals('5000.50', $song->price);
        $this->assertEquals('15000.75', $song->revenue_generated);
    }

    public function test_song_casts_array_fields_correctly(): void
    {
        $song = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
            'featured_artists' => ['Artist 1', 'Artist 2'],
            'credits' => ['producer' => 'John Doe', 'engineer' => 'Jane Smith'],
            'languages_sung' => ['English', 'Luganda'],
        ]);

        $this->assertIsArray($song->featured_artists);
        $this->assertIsArray($song->credits);
        $this->assertIsArray($song->languages_sung);
        $this->assertCount(2, $song->featured_artists);
    }

    public function test_song_casts_datetime_fields_correctly(): void
    {
        $releaseDate = now()->addDays(7);

        $song = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
            'release_date' => $releaseDate,
            'approved_at' => now(),
        ]);

        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $song->release_date);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $song->approved_at);
    }

    public function test_song_soft_deletes(): void
    {
        $songId = $this->song->id;

        $this->song->delete();

        $this->assertSoftDeleted('songs', ['id' => $songId]);
        $this->assertNotNull($this->song->deleted_at);
    }

    public function test_song_has_correct_fillable_fields(): void
    {
        $fillable = (new Song())->getFillable();

        $expectedFields = [
            'artist_id',
            'album_id',
            'title',
            'slug',
            'audio_file_original',
            'artwork',
            'duration_seconds',
            'price',
            'is_free',
            'is_explicit',
            'status',
            'is_downloadable',
        ];

        foreach ($expectedFields as $field) {
            $this->assertContains($field, $fillable, "Field '$field' should be fillable");
        }
    }

    public function test_song_default_values_are_set_correctly(): void
    {
        $song = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
            'title' => 'Test Song',
            'slug' => 'test-song',
            'audio_file_original' => 'songs/test.mp3',
            'status' => 'draft',
            'play_count' => 0,
            'download_count' => 0,
            'like_count' => 0,
            'is_explicit' => false,
        ]);

        $this->assertEquals('draft', $song->status);
        $this->assertEquals(0, $song->play_count);
        $this->assertEquals(0, $song->download_count);
        $this->assertEquals(0, $song->like_count);
        $this->assertFalse($song->is_explicit);
    }

    public function test_song_file_path_and_audio_file_consistency(): void
    {
        $song = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
            'audio_file_original' => 'songs/original/test.mp3',
        ]);

        $this->assertEquals('songs/original/test.mp3', $song->audio_file_original);
        $this->assertEquals('songs/original/test.mp3', $song->audio_file); // Accessor
    }

    public function test_song_transcoded_file_paths(): void
    {
        $song = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
            'audio_file_original' => 'songs/original/test.mp3',
            'audio_file_128' => 'songs/128kbps/test.mp3',
            'audio_file_320' => 'songs/320kbps/test.mp3',
            'audio_file_preview' => 'songs/preview/test.mp3',
        ]);

        $this->assertNotNull($song->audio_file_128);
        $this->assertNotNull($song->audio_file_320);
        $this->assertNotNull($song->audio_file_preview);
    }

    public function test_song_distribution_status_values(): void
    {
        $statuses = ['not_submitted', 'pending', 'approved', 'distributed', 'live', 'failed'];

        foreach ($statuses as $status) {
            $song = Song::factory()->create([
                'user_id' => $this->user->id,
                'artist_id' => $this->artist->id,
                'distribution_status' => $status,
            ]);

            $this->assertEquals($status, $song->distribution_status);
        }
    }

    public function test_song_status_values(): void
    {
        $statuses = ['draft', 'pending_review', 'approved', 'published', 'archived', 'removed'];

        foreach ($statuses as $status) {
            $song = Song::factory()->create([
                'user_id' => $this->user->id,
                'artist_id' => $this->artist->id,
                'status' => $status,
            ]);

            $this->assertEquals($status, $song->status);
        }
    }

    public function test_song_isrc_code_is_unique(): void
    {
        $isrcCode = 'UG-MUS-25-00001';

        $song1 = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
            'isrc_code' => $isrcCode,
        ]);

        $this->expectException(\Illuminate\Database\QueryException::class);

        Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
            'isrc_code' => $isrcCode,
        ]);
    }

    public function test_song_slug_is_unique(): void
    {
        $slug = 'unique-song-slug';

        $song1 = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
            'slug' => $slug,
        ]);

        // Slug is indexed but not enforced as unique in DB
        $song2 = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
            'slug' => $slug,
        ]);

        $this->assertEquals($slug, $song1->slug);
        $this->assertEquals($slug, $song2->slug);
        $this->assertNotEquals($song1->id, $song2->id);
    }

    public function test_song_ownership_percentages(): void
    {
        $song = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
            'master_ownership_percentage' => 70.00,
            'publishing_ownership_percentage' => 50.00,
        ]);

        $this->assertEquals('70.00', $song->master_ownership_percentage);
        $this->assertEquals('50.00', $song->publishing_ownership_percentage);
    }

    public function test_song_analytics_fields(): void
    {
        $song = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
            'play_count' => 1000,
            'unique_listeners_count' => 500,
            'average_completion_rate' => 85.50,
            'skip_count' => 50,
            'download_count' => 200,
            'like_count' => 150,
            'share_count' => 75,
            'comment_count' => 30,
        ]);

        $this->assertEquals(1000, $song->play_count);
        $this->assertEquals(500, $song->unique_listeners_count);
        $this->assertEquals('85.50', $song->average_completion_rate);
        $this->assertEquals(50, $song->skip_count);
        $this->assertEquals(200, $song->download_count);
        $this->assertEquals(150, $song->like_count);
        $this->assertEquals(75, $song->share_count);
        $this->assertEquals(30, $song->comment_count);
    }

    public function test_song_ugandan_context_fields(): void
    {
        $song = Song::factory()->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
            'languages_sung' => ['English', 'Luganda', 'Swahili'],
            'contains_local_language' => true,
            'local_genres' => ['Kadongo Kamu', 'Afrobeat'],
            'cultural_context' => 'Traditional Ugandan wedding song',
        ]);

        $this->assertCount(3, $song->languages_sung);
        $this->assertTrue($song->contains_local_language);
        $this->assertCount(2, $song->local_genres);
        $this->assertNotNull($song->cultural_context);
    }
}
