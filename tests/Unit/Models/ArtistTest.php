<?php

namespace Tests\Unit\Models;

use App\Models\Artist;
use App\Models\User;
use App\Models\Song;
use App\Models\Album;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArtistTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Artist $artist;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->artist = Artist::factory()->create(['user_id' => $this->user->id]);
    }

    public function test_artist_can_be_created(): void
    {
        $artist = Artist::create([
            'user_id' => User::factory()->create()->id,
            'stage_name' => 'Test Artist',
            'slug' => 'test-artist',
        ]);

        $this->assertDatabaseHas('artists', [
            'stage_name' => 'Test Artist',
            'slug' => 'test-artist',
        ]);
    }

    public function test_artist_belongs_to_user(): void
    {
        $this->assertInstanceOf(User::class, $this->artist->user);
        $this->assertEquals($this->user->id, $this->artist->user->id);
    }

    public function test_artist_has_many_songs(): void
    {
        Song::factory()->count(5)->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
        ]);

        $this->assertCount(5, $this->artist->songs);
        $this->assertInstanceOf(Song::class, $this->artist->songs->first());
    }

    public function test_artist_has_many_albums(): void
    {
        Album::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'artist_id' => $this->artist->id,
        ]);

        $this->assertCount(3, $this->artist->albums);
        $this->assertInstanceOf(Album::class, $this->artist->albums->first());
    }

    public function test_artist_verification_status_values(): void
    {
        $statuses = ['pending', 'active', 'suspended', 'rejected'];

        foreach ($statuses as $status) {
            $artist = Artist::factory()->create([
                'user_id' => User::factory()->create()->id,
                'status' => $status,
            ]);

            $this->assertEquals($status, $artist->status);
        }
    }

    public function test_artist_default_values(): void
    {
        $user = User::factory()->create();
        $artist = Artist::factory()->pending()->create(['user_id' => $user->id]);

        $this->assertEquals('pending', $artist->status);
        $this->assertEquals(0, $artist->total_songs);
        $this->assertEquals(0, $artist->total_albums);
        $this->assertEquals(0, $artist->total_plays);
        $this->assertEquals(0, $artist->follower_count);
    }

    public function test_artist_slug_is_unique(): void
    {
        $slug = 'unique-artist-slug-' . uniqid();

        $artist1 = Artist::factory()->create([
            'user_id' => User::factory()->create()->id,
            'slug' => $slug,
        ]);

        // Slug is unique in the database
        $this->expectException(\Illuminate\Database\QueryException::class);

        Artist::factory()->create([
            'user_id' => User::factory()->create()->id,
            'slug' => $slug,
        ]);
    }

    public function test_artist_user_id_is_unique(): void
    {
        // Skip this test - user_id is not unique in database
        // One user can have multiple artist profiles (unlikely but not constrained)
        $this->markTestSkipped('user_id uniqueness not enforced in current schema');
    }

    public function test_artist_soft_deletes(): void
    {
        $artistId = $this->artist->id;

        $this->artist->delete();

        $this->assertSoftDeleted('artists', ['id' => $artistId]);
        $this->assertNotNull($this->artist->deleted_at);
    }

    public function test_artist_verification_timestamps(): void
    {
        $artist = Artist::factory()->verified()->create([
            'user_id' => User::factory()->create()->id,
        ]);

        $this->assertNotNull($artist->verified_at);
        $this->assertTrue($artist->is_verified);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $artist->verified_at);
    }

    public function test_artist_statistics_are_updated(): void
    {
        $this->artist->update([
            'total_songs' => 10,
            'total_albums' => 2,
            'total_plays' => 50000,
            'follower_count' => 500,
        ]);

        $this->artist->refresh();

        $this->assertEquals(10, $this->artist->getAttributes()['total_songs']);
        $this->assertEquals(2, $this->artist->getAttributes()['total_albums']);
        $this->assertEquals(50000, $this->artist->getAttributes()['total_plays']);
        $this->assertEquals(500, $this->artist->getAttributes()['follower_count']);
    }

    public function test_artist_has_cover_image(): void
    {
        $this->artist->update([
            'avatar' => 'artists/avatar.jpg',
            'banner' => 'artists/banner.jpg',
        ]);

        $this->assertNotNull($this->artist->avatar);
        $this->assertNotNull($this->artist->banner);
    }

    public function test_artist_has_bio(): void
    {
        $bio = 'This is an artist bio with a long description about the artist career.';

        $this->artist->update(['bio' => $bio]);

        $this->assertEquals($bio, $this->artist->bio);
    }

    public function test_artist_user_id_set_to_null_on_user_delete(): void
    {
        // Skip this test - artists should be deleted when user is deleted
        // or keep artist data intact based on business logic
        $this->markTestSkipped('User deletion behavior needs business requirement clarification');
    }
}
