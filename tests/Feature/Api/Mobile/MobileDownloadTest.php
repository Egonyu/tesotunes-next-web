<?php

use App\Models\User;
use App\Models\Song;
use App\Models\Artist;
use App\Models\Download;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('digitalocean');
});

test('free user can check download limit', function () {
    $user = User::factory()->create([
        'subscription_tier' => 'free',
    ]);
    
    Sanctum::actingAs($user);
    
    $response = $this->getJson('/api/mobile/downloads/check-limit');
    
    $response->assertOk()
        ->assertJson([
            'can_download' => true,
            'is_premium' => false,
            'downloads_today' => 0,
            'limit' => 10,
            'remaining' => 10,
        ]);
});

test('premium user has unlimited downloads', function () {
    $user = User::factory()->create([
        'subscription_tier' => 'premium',
    ]);
    
    Sanctum::actingAs($user);
    
    $response = $this->getJson('/api/mobile/downloads/check-limit');
    
    $response->assertOk()
        ->assertJson([
            'can_download' => true,
            'is_premium' => true,
            'limit' => null,
            'remaining' => null,
        ]);
});

test('free user download limit enforced after 10 downloads', function () {
    $user = User::factory()->create([
        'subscription_tier' => 'free',
    ]);
    
    $artist = Artist::factory()->create();
    $song = Song::factory()->create(['artist_id' => $artist->id]);
    
    // Create 10 downloads today
    Download::factory()->count(10)->create([
        'user_id' => $user->id,
        'song_id' => $song->id,
        'created_at' => now(),
    ]);
    
    Sanctum::actingAs($user);
    
    $response = $this->getJson('/api/mobile/downloads/check-limit');
    
    $response->assertOk()
        ->assertJson([
            'can_download' => false,
            'is_premium' => false,
            'downloads_today' => 10,
            'limit' => 10,
            'remaining' => 0,
        ]);
});

test('can get download URL for song', function () {
    Storage::fake('digitalocean');
    
    $user = User::factory()->create([
        'subscription_tier' => 'free',
    ]);
    
    $artist = Artist::factory()->create();
    $song = Song::factory()->create([
        'artist_id' => $artist->id,
        'is_downloadable' => true,
        'audio_file_128' => 'songs/test/128kbps/song.mp3',
    ]);
    
    // Create fake file
    Storage::disk('digitalocean')->put($song->audio_file_128, 'fake-audio-content');
    
    Sanctum::actingAs($user);
    
    $response = $this->getJson("/api/mobile/downloads/song/{$song->id}");
    
    $response->assertOk()
        ->assertJsonStructure([
            'success',
            'download_url',
            'quality',
            'file_size',
            'expires_at',
            'song' => ['id', 'title', 'artist', 'artwork', 'duration'],
        ])
        ->assertJson([
            'success' => true,
            'quality' => '128kbps',
        ]);
    
    // Verify download was recorded
    $this->assertDatabaseHas('downloads', [
        'user_id' => $user->id,
        'song_id' => $song->id,
        'quality' => '128kbps',
    ]);
});

test('premium user gets 320kbps quality', function () {
    Storage::fake('digitalocean');
    
    $user = User::factory()->create([
        'subscription_tier' => 'premium',
    ]);
    
    $artist = Artist::factory()->create();
    $song = Song::factory()->create([
        'artist_id' => $artist->id,
        'is_downloadable' => true,
        'audio_file_320' => 'songs/test/320kbps/song.mp3',
        'audio_file_128' => 'songs/test/128kbps/song.mp3',
    ]);
    
    Storage::disk('digitalocean')->put($song->audio_file_320, 'fake-audio-320');
    Storage::disk('digitalocean')->put($song->audio_file_128, 'fake-audio-128');
    
    Sanctum::actingAs($user);
    
    $response = $this->getJson("/api/mobile/downloads/song/{$song->id}");
    
    $response->assertOk()
        ->assertJson([
            'success' => true,
            'quality' => '320kbps',
        ]);
});

test('cannot download non-downloadable song', function () {
    $user = User::factory()->create();
    $artist = Artist::factory()->create();
    $song = Song::factory()->create([
        'artist_id' => $artist->id,
        'is_downloadable' => false,
    ]);
    
    Sanctum::actingAs($user);
    
    $response = $this->getJson("/api/mobile/downloads/song/{$song->id}");
    
    $response->assertStatus(403)
        ->assertJson([
            'error' => 'This song is not available for download',
        ]);
});

test('can batch download multiple songs', function () {
    Storage::fake('digitalocean');
    
    $user = User::factory()->create([
        'subscription_tier' => 'free',
    ]);
    
    $artist = Artist::factory()->create();
    $songs = Song::factory()->count(3)->create([
        'artist_id' => $artist->id,
        'is_downloadable' => true,
        'audio_file_128' => 'songs/test/128kbps/song.mp3',
    ]);
    
    Storage::disk('digitalocean')->put('songs/test/128kbps/song.mp3', 'fake-audio');
    
    Sanctum::actingAs($user);
    
    $response = $this->postJson('/api/mobile/downloads/batch', [
        'song_ids' => $songs->pluck('id')->toArray(),
    ]);
    
    $response->assertOk()
        ->assertJson([
            'success' => true,
            'total_requested' => 3,
            'total_succeeded' => 3,
        ]);
    
    $this->assertEquals(3, Download::where('user_id', $user->id)->count());
});

test('batch download respects free user limit', function () {
    Storage::fake('digitalocean');
    
    $user = User::factory()->create([
        'subscription_tier' => 'free',
    ]);
    
    $artist = Artist::factory()->create();
    
    // Create 8 existing downloads today
    Download::factory()->count(8)->create([
        'user_id' => $user->id,
        'created_at' => now(),
    ]);
    
    // Try to download 5 more songs (should only get 2)
    $songs = Song::factory()->count(5)->create([
        'artist_id' => $artist->id,
        'is_downloadable' => true,
        'audio_file_128' => 'songs/test/128kbps/song.mp3',
    ]);
    
    Storage::disk('digitalocean')->put('songs/test/128kbps/song.mp3', 'fake-audio');
    
    Sanctum::actingAs($user);
    
    $response = $this->postJson('/api/mobile/downloads/batch', [
        'song_ids' => $songs->pluck('id')->toArray(),
    ]);
    
    $response->assertOk()
        ->assertJson([
            'success' => true,
            'total_requested' => 5,
            'total_succeeded' => 2, // Only 2 more allowed (10 - 8 = 2)
        ]);
});

test('can get download history', function () {
    $user = User::factory()->create();
    $artist = Artist::factory()->create();
    $song = Song::factory()->create(['artist_id' => $artist->id]);
    
    Download::factory()->count(5)->create([
        'user_id' => $user->id,
        'song_id' => $song->id,
    ]);
    
    Sanctum::actingAs($user);
    
    $response = $this->getJson('/api/mobile/downloads/history');
    
    $response->assertOk()
        ->assertJsonStructure([
            'success',
            'downloads',
            'pagination' => ['current_page', 'total_pages', 'total', 'per_page'],
        ])
        ->assertJson([
            'success' => true,
        ]);
});

test('unauthenticated user cannot access download endpoints', function () {
    $response = $this->getJson('/api/mobile/downloads/check-limit');
    
    $response->assertStatus(401);
});
