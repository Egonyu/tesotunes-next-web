<?php

namespace Tests\Feature\Player;

use App\Models\PlayHistory;
use App\Models\Song;
use App\Models\User;
use App\Models\Artist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlayerApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Song $song;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $artistUser = User::factory()->create();
        $artist = Artist::factory()->create(['user_id' => $artistUser->id]);

        $this->song = Song::factory()->create([
            'user_id' => $artistUser->id,
            'artist_id' => $artist->id,
            'status' => 'published',
            'duration' => 180, // 3 minutes
            'play_count' => 0
        ]);
    }

    public function test_can_update_now_playing(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/player/update-now-playing', [
                'song_id' => $this->song->id,
                'is_playing' => true,
                'volume' => 80,
                'position' => 0
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Now playing updated'
            ]);
    }

    public function test_can_record_play_with_sufficient_duration(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/player/record-play', [
                'song_id' => $this->song->id,
                'duration_played' => 60, // 1 minute (33% of song)
                'total_duration' => 180,
                'completed' => false,
                'timestamp' => now()->timestamp
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'qualified_play' => true
                ]
            ]);

        $this->assertDatabaseHas('play_histories', [
            'user_id' => $this->user->id,
            'song_id' => $this->song->id,
            'play_duration_seconds' => 60
        ]);

        $this->assertEquals(1, $this->song->fresh()->play_count);
    }

    public function test_play_not_recorded_with_insufficient_duration(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/player/record-play', [
                'song_id' => $this->song->id,
                'duration_played' => 10, // Only 10 seconds (less than 30% or 30s minimum)
                'total_duration' => 180,
                'completed' => false,
                'timestamp' => now()->timestamp
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'qualified_play' => false
                ]
            ]);

        $this->assertEquals(0, $this->song->fresh()->play_count);
    }

    public function test_duplicate_plays_within_one_minute_are_rejected(): void
    {
        // First play
        $this->actingAs($this->user)
            ->postJson('/api/player/record-play', [
                'song_id' => $this->song->id,
                'duration_played' => 60,
                'total_duration' => 180,
                'completed' => false,
                'timestamp' => now()->timestamp
            ]);

        // Second play within 1 minute
        $response = $this->actingAs($this->user)
            ->postJson('/api/player/record-play', [
                'song_id' => $this->song->id,
                'duration_played' => 60,
                'total_duration' => 180,
                'completed' => false,
                'timestamp' => now()->timestamp
            ]);

        $response->assertStatus(429)
            ->assertJson([
                'success' => false,
                'message' => 'Play already recorded recently'
            ]);

        $this->assertEquals(1, $this->song->fresh()->play_count);
    }

    public function test_unauthenticated_user_cannot_access_player_api(): void
    {
        $response = $this->postJson('/api/player/update-now-playing', [
            'song_id' => $this->song->id,
            'is_playing' => true
        ]);

        $response->assertStatus(401);
    }

    public function test_cannot_play_unpublished_song(): void
    {
        $draftSong = Song::factory()->create([
            'status' => 'draft'
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/player/update-now-playing', [
                'song_id' => $draftSong->id,
                'is_playing' => true
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Access denied to this track'
            ]);
    }

    public function test_artist_can_play_own_unpublished_song(): void
    {
        $artistUser = User::factory()->create();
        $artist = Artist::factory()->create(['user_id' => $artistUser->id]);

        $draftSong = Song::factory()->create([
            'user_id' => $artistUser->id,
            'artist_id' => $artist->id,
            'status' => 'draft'
        ]);

        $response = $this->actingAs($artistUser)
            ->postJson('/api/player/update-now-playing', [
                'song_id' => $draftSong->id,
                'is_playing' => true
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true
            ]);
    }

    public function test_play_history_records_device_type(): void
    {
        $this->actingAs($this->user)
            ->withHeaders([
                'User-Agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
            ])
            ->postJson('/api/player/record-play', [
                'song_id' => $this->song->id,
                'duration_played' => 60,
                'total_duration' => 180,
                'completed' => false,
                'timestamp' => now()->timestamp
            ]);

        $this->assertDatabaseHas('play_histories', [
            'user_id' => $this->user->id,
            'song_id' => $this->song->id,
            'device_type' => 'mobile'
        ]);
    }

    public function test_validation_fails_with_invalid_data(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/player/record-play', [
                'song_id' => 99999, // Non-existent song
                'duration_played' => 60,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['song_id']);
    }
}
