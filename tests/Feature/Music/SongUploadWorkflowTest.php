<?php

namespace Tests\Feature\Music;

use App\Models\User;
use App\Models\Artist;
use App\Models\Genre;
use App\Models\Song;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SongUploadWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Artist $artist;
    protected Genre $genre;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test user with artist role
        $this->user = User::factory()->create([
            'status' => 'active',
        ]);

        // Create artist profile
        $this->artist = Artist::factory()->create([
            'user_id' => $this->user->id,
            'verification_status' => 'verified',
        ]);

        // Create a genre
        $this->genre = Genre::factory()->create();

        // Fake storage
        Storage::fake('local');
        Storage::fake('digitalocean');
    }

    public function test_artist_can_access_upload_page(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('frontend.artist.music.upload'));

        $response->assertStatus(200);
        $response->assertViewIs('frontend.artist.music.upload');
        $response->assertViewHas('genres');
    }

    public function test_non_artist_cannot_access_upload_page(): void
    {
        $regularUser = User::factory()->create();

        $response = $this->actingAs($regularUser)
            ->get(route('frontend.artist.music.upload'));

        $response->assertStatus(403);
    }

    public function test_artist_can_upload_song_with_required_fields(): void
    {
        $audioFile = UploadedFile::fake()->create('test-song.mp3', 5000, 'audio/mpeg');

        $response = $this->actingAs($this->user)
            ->post(route('frontend.artist.music.store'), [
                'audio_file' => $audioFile,
                'title' => 'Test Song Title',
                'genre_id' => $this->genre->id,
                'publish_type' => 'draft',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('songs', [
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
            'title' => 'Test Song Title',
            'status' => 'draft',
        ]);
    }

    public function test_artist_cannot_upload_without_audio_file(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('frontend.artist.music.store'), [
                'title' => 'Test Song',
                'genre_id' => $this->genre->id,
                'publish_type' => 'draft',
            ]);

        $response->assertSessionHasErrors('audio_file');
    }

    public function test_artist_cannot_upload_without_title(): void
    {
        $audioFile = UploadedFile::fake()->create('test-song.mp3', 5000, 'audio/mpeg');

        $response = $this->actingAs($this->user)
            ->post(route('frontend.artist.music.store'), [
                'audio_file' => $audioFile,
                'genre_id' => $this->genre->id,
                'publish_type' => 'draft',
            ]);

        $response->assertSessionHasErrors('title');
    }

    public function test_artist_cannot_upload_without_genre(): void
    {
        $audioFile = UploadedFile::fake()->create('test-song.mp3', 5000, 'audio/mpeg');

        $response = $this->actingAs($this->user)
            ->post(route('frontend.artist.music.store'), [
                'audio_file' => $audioFile,
                'title' => 'Test Song',
                'publish_type' => 'draft',
            ]);

        $response->assertSessionHasErrors('genre_id');
    }

    public function test_artist_can_upload_with_optional_fields(): void
    {
        $audioFile = UploadedFile::fake()->create('test-song.mp3', 5000, 'audio/mpeg');
        $artworkFile = UploadedFile::fake()->image('artwork.jpg', 400, 400);

        $response = $this->actingAs($this->user)
            ->post(route('frontend.artist.music.store'), [
                'audio_file' => $audioFile,
                'title' => 'Complete Test Song',
                'genre_id' => $this->genre->id,
                'description' => 'This is a test song description',
                'artwork' => $artworkFile,
                'price' => 5000,
                'is_explicit' => true,
                'allow_downloads' => true,
                'publish_type' => 'draft',
                'featured_artists' => 'Featured Artist Name',
                'primary_language' => 'Luganda',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('songs', [
            'title' => 'Complete Test Song',
            'is_explicit' => true,
            'price' => 5000,
        ]);
    }

    public function test_audio_file_validates_mime_type(): void
    {
        // Try to upload a non-audio file
        $invalidFile = UploadedFile::fake()->create('test.pdf', 1000, 'application/pdf');

        $response = $this->actingAs($this->user)
            ->post(route('frontend.artist.music.store'), [
                'audio_file' => $invalidFile,
                'title' => 'Test Song',
                'genre_id' => $this->genre->id,
                'publish_type' => 'draft',
            ]);

        $response->assertSessionHasErrors('audio_file');
    }

    public function test_audio_file_validates_max_size(): void
    {
        // Try to upload a file larger than allowed (assuming 100MB limit)
        $largeFile = UploadedFile::fake()->create('large-song.mp3', 110000, 'audio/mpeg');

        $response = $this->actingAs($this->user)
            ->post(route('frontend.artist.music.store'), [
                'audio_file' => $largeFile,
                'title' => 'Large Song',
                'genre_id' => $this->genre->id,
                'publish_type' => 'draft',
            ]);

        $response->assertSessionHasErrors('audio_file');
    }

    public function test_artwork_validates_as_image(): void
    {
        $audioFile = UploadedFile::fake()->create('test-song.mp3', 5000, 'audio/mpeg');
        $invalidArtwork = UploadedFile::fake()->create('artwork.txt', 100, 'text/plain');

        $response = $this->actingAs($this->user)
            ->post(route('frontend.artist.music.store'), [
                'audio_file' => $audioFile,
                'title' => 'Test Song',
                'genre_id' => $this->genre->id,
                'artwork' => $invalidArtwork,
                'publish_type' => 'draft',
            ]);

        $response->assertSessionHasErrors('artwork');
    }

    public function test_song_slug_is_generated_automatically(): void
    {
        $audioFile = UploadedFile::fake()->create('test-song.mp3', 5000, 'audio/mpeg');

        $this->actingAs($this->user)
            ->post(route('frontend.artist.music.store'), [
                'audio_file' => $audioFile,
                'title' => 'My Awesome Song',
                'genre_id' => $this->genre->id,
                'publish_type' => 'draft',
            ]);

        $song = Song::where('title', 'My Awesome Song')->first();

        $this->assertNotNull($song);
        $this->assertNotNull($song->slug);
        $this->assertStringContainsString('my-awesome-song', $song->slug);
    }

    public function test_song_creates_unique_slug_for_duplicate_titles(): void
    {
        $audioFile1 = UploadedFile::fake()->create('test-song-1.mp3', 5000, 'audio/mpeg');
        $audioFile2 = UploadedFile::fake()->create('test-song-2.mp3', 5000, 'audio/mpeg');

        // Upload first song
        $this->actingAs($this->user)
            ->post(route('frontend.artist.music.store'), [
                'audio_file' => $audioFile1,
                'title' => 'Same Title',
                'genre_id' => $this->genre->id,
                'publish_type' => 'draft',
            ]);

        // Upload second song with same title
        $this->actingAs($this->user)
            ->post(route('frontend.artist.music.store'), [
                'audio_file' => $audioFile2,
                'title' => 'Same Title',
                'genre_id' => $this->genre->id,
                'publish_type' => 'draft',
            ]);

        $songs = Song::where('title', 'Same Title')->get();

        $this->assertCount(2, $songs);
        $this->assertNotEquals($songs[0]->slug, $songs[1]->slug);
    }

    public function test_song_status_is_draft_when_publish_type_is_draft(): void
    {
        $audioFile = UploadedFile::fake()->create('test-song.mp3', 5000, 'audio/mpeg');

        $this->actingAs($this->user)
            ->post(route('frontend.artist.music.store'), [
                'audio_file' => $audioFile,
                'title' => 'Draft Song',
                'genre_id' => $this->genre->id,
                'publish_type' => 'draft',
            ]);

        $song = Song::where('title', 'Draft Song')->first();

        $this->assertEquals('draft', $song->status);
    }

    public function test_song_status_is_pending_review_when_publish_type_is_now(): void
    {
        $audioFile = UploadedFile::fake()->create('test-song.mp3', 5000, 'audio/mpeg');

        $this->actingAs($this->user)
            ->post(route('frontend.artist.music.store'), [
                'audio_file' => $audioFile,
                'title' => 'Published Song',
                'genre_id' => $this->genre->id,
                'publish_type' => 'now',
            ]);

        $song = Song::where('title', 'Published Song')->first();

        $this->assertEquals('pending_review', $song->status);
    }

    public function test_song_associates_with_genre(): void
    {
        $audioFile = UploadedFile::fake()->create('test-song.mp3', 5000, 'audio/mpeg');

        $this->actingAs($this->user)
            ->post(route('frontend.artist.music.store'), [
                'audio_file' => $audioFile,
                'title' => 'Test Song',
                'genre_id' => $this->genre->id,
                'publish_type' => 'draft',
            ]);

        $song = Song::where('title', 'Test Song')->first();

        $this->assertTrue($song->genres->contains($this->genre->id));
    }

    public function test_unverified_artist_can_still_upload_as_draft(): void
    {
        $unverifiedArtist = Artist::factory()->create([
            'user_id' => User::factory()->create()->id,
            'verification_status' => 'pending',
        ]);

        $audioFile = UploadedFile::fake()->create('test-song.mp3', 5000, 'audio/mpeg');

        $response = $this->actingAs($unverifiedArtist->user)
            ->post(route('frontend.artist.music.store'), [
                'audio_file' => $audioFile,
                'title' => 'Unverified Artist Song',
                'genre_id' => $this->genre->id,
                'publish_type' => 'draft',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('songs', [
            'title' => 'Unverified Artist Song',
            'status' => 'draft',
        ]);
    }

    public function test_song_price_defaults_to_null_when_not_provided(): void
    {
        $audioFile = UploadedFile::fake()->create('test-song.mp3', 5000, 'audio/mpeg');

        $this->actingAs($this->user)
            ->post(route('frontend.artist.music.store'), [
                'audio_file' => $audioFile,
                'title' => 'Free Song',
                'genre_id' => $this->genre->id,
                'publish_type' => 'draft',
            ]);

        $song = Song::where('title', 'Free Song')->first();

        $this->assertNull($song->price);
    }

    public function test_song_stores_file_metadata(): void
    {
        $audioFile = UploadedFile::fake()->create('test-song.mp3', 5000, 'audio/mpeg');

        $this->actingAs($this->user)
            ->post(route('frontend.artist.music.store'), [
                'audio_file' => $audioFile,
                'title' => 'Metadata Song',
                'genre_id' => $this->genre->id,
                'publish_type' => 'draft',
            ]);

        $song = Song::where('title', 'Metadata Song')->first();

        $this->assertNotNull($song->file_path);
        // Additional metadata assertions can be added based on your implementation
    }
}
