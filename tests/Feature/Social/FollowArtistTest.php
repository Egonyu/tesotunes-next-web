<?php

namespace Tests\Feature\Social;

use App\Models\Artist;
use App\Models\User;
use App\Models\UserFollow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FollowArtistTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Artist $artist;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'is_active' => true
        ]);

        $artistUser = User::factory()->create();
        $this->artist = Artist::factory()->create([
            'user_id' => $artistUser->id,
            'status' => 'active',
            'followers_count' => 0
        ]);
    }

    public function test_user_can_follow_artist(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/artists/{$this->artist->slug}/follow");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'is_following' => true
            ]);

        $this->assertDatabaseHas('user_follows', [
            'follower_id' => $this->user->id,
            'following_id' => $this->artist->user_id,
            'following_type' => 'artist'
        ]);

        $this->assertEquals(1, $this->artist->fresh()->followers_count);
    }

    public function test_user_can_unfollow_artist(): void
    {
        // First follow the artist
        UserFollow::create([
            'follower_id' => $this->user->id,
            'following_id' => $this->artist->user_id,
            'following_type' => 'artist'
        ]);

        $this->artist->update(['followers_count' => 1]);

        // Then unfollow
        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/artists/{$this->artist->slug}/follow");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'is_following' => false
            ]);

        $this->assertDatabaseMissing('user_follows', [
            'follower_id' => $this->user->id,
            'following_id' => $this->artist->user_id,
            'following_type' => 'artist'
        ]);

        $this->assertEquals(0, $this->artist->fresh()->followers_count);
    }

    public function test_cannot_follow_same_artist_twice(): void
    {
        // First follow
        $this->actingAs($this->user)
            ->postJson("/api/v1/artists/{$this->artist->slug}/follow");

        // Try to follow again
        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/artists/{$this->artist->slug}/follow");

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Already following this artist'
            ]);

        // Should only have one follow record
        $this->assertEquals(1, UserFollow::where('follower_id', $this->user->id)
            ->where('following_id', $this->artist->user_id)
            ->where('following_type', 'artist')
            ->count());
    }

    public function test_artist_cannot_follow_themselves(): void
    {
        // Create user who is also an artist
        $artistAsUser = User::factory()->create(['is_active' => true]);
        $selfArtist = Artist::factory()->create([
            'user_id' => $artistAsUser->id,
            'status' => 'active'
        ]);

        $response = $this->actingAs($artistAsUser)
            ->postJson("/api/v1/artists/{$selfArtist->slug}/follow");

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You are not authorized to follow this artist'
            ]);
    }

    public function test_unauthenticated_user_cannot_follow(): void
    {
        $response = $this->postJson("/api/v1/artists/{$this->artist->slug}/follow");

        $response->assertStatus(401);
    }

    public function test_artist_is_followed_by_check_works(): void
    {
        UserFollow::create([
            'follower_id' => $this->user->id,
            'following_id' => $this->artist->user_id,
            'following_type' => 'artist'
        ]);

        $this->assertTrue($this->artist->isFollowedBy($this->user));

        $otherUser = User::factory()->create();
        $this->assertFalse($this->artist->isFollowedBy($otherUser));
    }

    public function test_follower_count_is_accurate(): void
    {
        $users = User::factory()->count(5)->create(['is_active' => true]);

        foreach ($users as $user) {
            UserFollow::create([
                'follower_id' => $user->id,
                'following_id' => $this->artist->user_id,
                'following_type' => 'artist'
            ]);
        }

        $this->artist->update(['followers_count' => 5]);

        $this->assertEquals(5, $this->artist->followers_count);
        $this->assertEquals(5, UserFollow::where('following_id', $this->artist->user_id)
            ->where('following_type', 'artist')
            ->count());
    }
}
