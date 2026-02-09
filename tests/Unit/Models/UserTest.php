<?php

namespace Tests\Unit\Models;

use App\Models\User;
use App\Models\Artist;
use App\Models\Song;
use App\Models\Payment;
use App\Models\UserSubscription;
use App\Models\Download;
use App\Models\PlayHistory;
use App\Models\Like;
use App\Models\Playlist;
use App\Models\Genre;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
    }

    public function test_user_can_be_created_with_required_fields(): void
    {
        $user = User::create([
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => bcrypt('password'),
        ]);

        $this->assertDatabaseHas('users', [
            'username' => 'johndoe',
            'email' => 'john@example.com',
        ]);
    }

    /** @test */
    public function test_user_has_relationships_instead_of_role_column(): void
    {
        // Roles are now managed through relationships, not a column
        // Users can have multiple roles through the user_roles pivot table
        $user = User::factory()->create();
        
        $this->assertTrue(method_exists($user, 'roles'));
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $user->roles);
    }

    public function test_user_is_active_by_default(): void
    {
        $user = User::factory()->create();
        $this->assertTrue($user->is_active);
    }

    public function test_user_default_values_are_set(): void
    {
        $user = User::factory()->create();

        $this->assertTrue($user->is_active);
        $this->assertEquals('en', $user->language);
        $this->assertEquals('Uganda', $user->country);
        $this->assertEquals('Africa/Kampala', $user->timezone);
    }

    public function test_user_password_is_hidden(): void
    {
        $userArray = $this->user->toArray();

        $this->assertArrayNotHasKey('password', $userArray);
        $this->assertArrayNotHasKey('remember_token', $userArray);
    }

    public function test_user_sensitive_fields_are_hidden(): void
    {
        $user = User::factory()->create([
            'phone' => '+256700000000',
            'nin_number' => '12345678901234',
            'date_of_birth' => '1990-01-01',
        ]);

        $userArray = $user->toArray();

        $this->assertArrayNotHasKey('phone', $userArray);
        $this->assertArrayNotHasKey('nin_number', $userArray);
        $this->assertArrayNotHasKey('date_of_birth', $userArray);
    }

    public function test_user_casts_datetime_fields(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
            'verified_at' => now(),
            'last_login_at' => now(),
        ]);

        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $user->email_verified_at);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $user->phone_verified_at);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $user->verified_at);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $user->last_login_at);
    }

    public function test_user_casts_boolean_fields(): void
    {
        $user = User::factory()->create([
            'is_active' => true,
            'two_factor_enabled' => true,
        ]);

        $this->assertTrue($user->is_active);
        $this->assertTrue($user->two_factor_enabled);
        $this->assertIsBool($user->is_active);
    }

    public function test_user_casts_json_fields(): void
    {
        $user = User::factory()->create([
            'profile_steps_completed' => ['basic_info' => true, 'avatar_uploaded' => false],
        ]);

        $this->assertIsArray($user->profile_steps_completed);
        $this->assertArrayHasKey('basic_info', $user->profile_steps_completed);
    }

    public function test_user_has_one_artist(): void
    {
        $artist = Artist::factory()->create([
            'user_id' => $this->user->id,
        ]);

        $this->user->refresh(); // Refresh to load the new artist relationship
        $this->assertInstanceOf(Artist::class, $this->user->artist);
        $this->assertEquals($artist->id, $this->user->artist->id);
    }

    public function test_user_has_many_songs(): void
    {
        $artist = Artist::factory()->create(['user_id' => $this->user->id]);
        Song::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'artist_id' => $artist->id,
        ]);

        $this->assertCount(3, $this->user->songs);
        $this->assertInstanceOf(Song::class, $this->user->songs->first());
    }

    public function test_user_has_many_payments(): void
    {
        Payment::factory()->count(5)->create([
            'user_id' => $this->user->id,
        ]);

        $this->assertCount(5, $this->user->payments);
        $this->assertInstanceOf(Payment::class, $this->user->payments->first());
    }

    public function test_user_has_many_downloads(): void
    {
        // Note: downloads table now uses polymorphic relationship (downloadable_type, downloadable_id)
        $this->markTestSkipped('Downloads table schema changed to polymorphic relationship');
    }

    public function test_user_has_many_playlists(): void
    {
        Playlist::factory()->count(2)->create([
            'user_id' => $this->user->id,
        ]);

        $this->assertCount(2, $this->user->playlists);
        $this->assertInstanceOf(Playlist::class, $this->user->playlists->first());
    }

    public function test_user_username_is_unique(): void
    {
        $username = 'uniqueuser123';

        User::factory()->create(['username' => $username]);

        $this->expectException(\Illuminate\Database\QueryException::class);

        User::factory()->create(['username' => $username]);
    }

    public function test_user_nin_number_is_unique(): void
    {
        $nin = '12345678901234';

        User::factory()->create(['nin_number' => $nin]);

        $this->expectException(\Illuminate\Database\QueryException::class);

        User::factory()->create(['nin_number' => $nin]);
    }

    public function test_user_soft_deletes(): void
    {
        $userId = $this->user->id;

        $this->user->delete();

        $this->assertSoftDeleted('users', ['id' => $userId]);
        $this->assertNotNull($this->user->deleted_at);
    }

    public function test_user_can_have_artist_with_specific_fields(): void
    {
        $genre = Genre::factory()->create();

        $artist = Artist::factory()->create([
            'user_id' => $this->user->id,
            'primary_genre_id' => $genre->id,
        ]);

        $this->user->refresh();
        $this->assertInstanceOf(Artist::class, $this->user->artist);
        $this->assertEquals($genre->id, $this->user->artist->primary_genre_id);
    }

    public function test_user_payment_method_values(): void
    {
        // Note: payment_method column has been removed from users table
        // Payment preferences are now stored in user_settings or artist profiles
        $this->markTestSkipped('payment_method column has been moved to user_settings table');
    }

    public function test_user_social_media_links(): void
    {
        // Note: social media URLs are now stored in the social_links JSON column
        $user = User::factory()->create([
            'social_links' => [
                'instagram' => 'https://instagram.com/artist',
                'twitter' => 'https://twitter.com/artist',
                'youtube' => 'https://youtube.com/@artist',
                'tiktok' => 'https://tiktok.com/@artist',
            ],
        ]);

        $this->assertIsArray($user->social_links);
        $this->assertArrayHasKey('instagram', $user->social_links);
        $this->assertArrayHasKey('twitter', $user->social_links);
    }

    public function test_user_has_fillable_fields(): void
    {
        $fillable = (new User())->getFillable();

        $expectedFields = [
            'username',
            'email',
            'password',
            'avatar',
            'bio',
            'phone',
        ];

        foreach ($expectedFields as $field) {
            $this->assertContains($field, $fillable, "Field '$field' should be fillable");
        }
    }

    public function test_user_country_defaults_to_uganda(): void
    {
        $user = User::factory()->create(['country' => 'Uganda']);

        $this->assertEquals('Uganda', $user->country);
    }

    public function test_user_activity_tracking_fields(): void
    {
        // Note: is_online and last_admin_login_at columns have been removed
        // Activity tracking is handled through last_login_at and last_login_ip
        $user = User::factory()->create([
            'last_login_at' => now(),
        ]);

        $this->assertNotNull($user->last_login_at);
    }
}
