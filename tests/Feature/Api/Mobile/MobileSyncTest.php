<?php

use App\Models\User;
use App\Models\Song;
use App\Models\Artist;
use App\Models\Download;
use App\Models\Playlist;
use App\Models\PlayHistory;
use App\Models\Like;
use App\Models\UserFollow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

test('can perform full sync', function () {
    $user = User::factory()->create([
        'subscription_tier' => 'premium',
    ]);
    
    $artist = Artist::factory()->create();
    $song = Song::factory()->create(['artist_id' => $artist->id]);
    
    // Create user data
    Download::factory()->create(['user_id' => $user->id, 'song_id' => $song->id]);
    Playlist::factory()->create(['user_id' => $user->id]);
    Like::factory()->create([
        'user_id' => $user->id,
        'likeable_type' => Song::class,
        'likeable_id' => $song->id,
    ]);
    PlayHistory::factory()->create(['user_id' => $user->id, 'song_id' => $song->id]);
    
    Sanctum::actingAs($user);
    
    $response = $this->postJson('/api/mobile/sync/full');
    
    $response->assertOk()
        ->assertJsonStructure([
            'success',
            'sync_data' => [
                'sync_timestamp',
                'sync_type',
                'user' => ['id', 'name', 'email', 'subscription_tier'],
                'downloaded_songs',
                'playlists',
                'liked_songs',
                'play_history',
                'following',
                'statistics',
            ],
        ])
        ->assertJson([
            'success' => true,
            'sync_data' => [
                'sync_type' => 'full',
            ],
        ]);
});

test('can perform incremental sync', function () {
    $user = User::factory()->create();
    $artist = Artist::factory()->create();
    $song = Song::factory()->create(['artist_id' => $artist->id]);
    
    $lastSyncAt = now()->subHours(2);
    
    // Create data after last sync
    Download::factory()->create([
        'user_id' => $user->id,
        'song_id' => $song->id,
        'created_at' => now()->subHour(),
    ]);
    
    Sanctum::actingAs($user);
    
    $response = $this->postJson('/api/mobile/sync/incremental', [
        'last_sync_at' => $lastSyncAt->toISOString(),
        'include' => ['downloads', 'playlists', 'favorites'],
    ]);
    
    $response->assertOk()
        ->assertJsonStructure([
            'success',
            'sync_data' => [
                'sync_timestamp',
                'last_sync_at',
                'downloaded_songs',
                'playlists',
                'liked_songs',
            ],
        ]);
});

test('can sync play history from mobile', function () {
    $user = User::factory()->create();
    $artist = Artist::factory()->create();
    $songs = Song::factory()->count(3)->create([
        'artist_id' => $artist->id,
        'play_count' => 0,
    ]);
    
    Sanctum::actingAs($user);
    
    $plays = $songs->map(fn($song) => [
        'song_id' => $song->id,
        'played_at' => now()->subMinutes(rand(10, 60))->toISOString(),
        'duration_played' => rand(30, 180),
        'completed' => true,
    ])->toArray();
    
    $response = $this->postJson('/api/mobile/sync/play-history', [
        'plays' => $plays,
    ]);
    
    $response->assertOk()
        ->assertJson([
            'success' => true,
            'synced' => 3,
            'total' => 3,
        ]);
    
    $this->assertEquals(3, PlayHistory::where('user_id', $user->id)->count());
    
    // Verify song play counts were incremented
    foreach ($songs as $song) {
        $this->assertDatabaseHas('songs', [
            'id' => $song->id,
            'play_count' => 1,
        ]);
    }
});

test('sync play history prevents duplicates', function () {
    $user = User::factory()->create();
    $artist = Artist::factory()->create();
    $song = Song::factory()->create(['artist_id' => $artist->id]);
    
    $playedAt = now()->subHour();
    
    // Create existing play history
    PlayHistory::create([
        'user_id' => $user->id,
        'song_id' => $song->id,
        'played_at' => $playedAt,
    ]);
    
    Sanctum::actingAs($user);
    
    // Try to sync same play again
    $response = $this->postJson('/api/mobile/sync/play-history', [
        'plays' => [
            [
                'song_id' => $song->id,
                'played_at' => $playedAt->toISOString(),
                'completed' => true,
            ],
        ],
    ]);
    
    $response->assertOk()
        ->assertJson([
            'success' => true,
            'synced' => 0, // Should not create duplicate
            'total' => 1,
        ]);
    
    $this->assertEquals(1, PlayHistory::where('user_id', $user->id)->count());
});

test('can sync user actions likes and follows', function () {
    $user = User::factory()->create();
    $artist = Artist::factory()->create();
    $songs = Song::factory()->count(2)->create(['artist_id' => $artist->id]);
    
    Sanctum::actingAs($user);
    
    $response = $this->postJson('/api/mobile/sync/user-actions', [
        'likes' => [
            [
                'song_id' => $songs[0]->id,
                'action' => 'like',
                'timestamp' => now()->toISOString(),
            ],
            [
                'song_id' => $songs[1]->id,
                'action' => 'like',
                'timestamp' => now()->toISOString(),
            ],
        ],
        'follows' => [
            [
                'artist_id' => $artist->id,
                'action' => 'follow',
                'timestamp' => now()->toISOString(),
            ],
        ],
    ]);
    
    $response->assertOk()
        ->assertJson([
            'success' => true,
            'results' => [
                'likes_synced' => 2,
                'follows_synced' => 1,
            ],
        ]);
    
    $this->assertEquals(2, Like::where('user_id', $user->id)->count());
    $this->assertEquals(1, UserFollow::where('follower_id', $user->id)->count());
});

test('can sync unlike action', function () {
    $user = User::factory()->create();
    $artist = Artist::factory()->create();
    $song = Song::factory()->create(['artist_id' => $artist->id]);
    
    // Create existing like
    Like::create([
        'user_id' => $user->id,
        'likeable_type' => Song::class,
        'likeable_id' => $song->id,
    ]);
    
    Sanctum::actingAs($user);
    
    $response = $this->postJson('/api/mobile/sync/user-actions', [
        'likes' => [
            [
                'song_id' => $song->id,
                'action' => 'unlike',
                'timestamp' => now()->toISOString(),
            ],
        ],
    ]);
    
    $response->assertOk()
        ->assertJson([
            'success' => true,
            'results' => [
                'likes_synced' => 1,
            ],
        ]);
    
    $this->assertEquals(0, Like::where('user_id', $user->id)->count());
});

test('incremental sync returns only new data', function () {
    $user = User::factory()->create();
    $artist = Artist::factory()->create();
    $song = Song::factory()->create(['artist_id' => $artist->id]);
    
    $lastSyncAt = now()->subDays(2);
    
    // Old download (before last sync)
    Download::factory()->create([
        'user_id' => $user->id,
        'song_id' => $song->id,
        'created_at' => $lastSyncAt->copy()->subHour(),
    ]);
    
    // New download (after last sync)
    Download::factory()->create([
        'user_id' => $user->id,
        'song_id' => $song->id,
        'created_at' => now()->subHour(),
    ]);
    
    Sanctum::actingAs($user);
    
    $response = $this->postJson('/api/mobile/sync/incremental', [
        'last_sync_at' => $lastSyncAt->toISOString(),
        'include' => ['downloads'],
    ]);
    
    $response->assertOk();
    
    $syncData = $response->json('sync_data');
    
    // Should only return 1 download (the new one)
    expect($syncData['downloaded_songs'])->toHaveCount(1);
});

test('sync returns new songs from followed artists', function () {
    $user = User::factory()->create();
    $artist = Artist::factory()->create();
    
    // Follow artist using the artist's user_id (foreign key constraint)
    UserFollow::create([
        'follower_id' => $user->id,
        'following_type' => 'App\\Models\\Artist',
        'following_id' => $artist->user_id,
    ]);
    
    $lastSyncAt = now()->subDay();
    
    // New song from followed artist
    $newSong = Song::factory()->create([
        'artist_id' => $artist->id,
        'status' => 'approved',
        'created_at' => now()->subHour(),
    ]);
    
    Sanctum::actingAs($user);
    
    $response = $this->postJson('/api/mobile/sync/incremental', [
        'last_sync_at' => $lastSyncAt->toISOString(),
        'include' => ['songs'],
    ]);
    
    $response->assertOk();
    
    $syncData = $response->json('sync_data');
    
    expect($syncData['new_songs_from_artists'])->toHaveCount(1);
    expect($syncData['new_songs_from_artists'][0]['id'])->toBe($newSong->id);
});

test('unauthenticated user cannot sync', function () {
    $response = $this->postJson('/api/mobile/sync/full');
    
    $response->assertStatus(401);
});
