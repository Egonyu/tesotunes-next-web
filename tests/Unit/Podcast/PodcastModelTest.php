<?php

namespace Tests\Unit\Podcast;

use App\Models\Podcast;
use App\Models\PodcastCategory;
use App\Models\PodcastEpisode;
use App\Models\PodcastSubscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PodcastModelTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        if (!config('podcast.enabled', false)) {
            $this->markTestSkipped('Podcast module is disabled');
        }

        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\PodcastCategorySeeder']);
    }

    public function test_podcast_belongs_to_creator()
    {
        $user = User::factory()->create();
        $podcast = Podcast::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $podcast->creator);
        $this->assertEquals($user->id, $podcast->creator->id);
    }

    public function test_podcast_belongs_to_category()
    {
        $category = PodcastCategory::first();
        $podcast = Podcast::factory()->create(['podcast_category_id' => $category->id]);

        $this->assertInstanceOf(PodcastCategory::class, $podcast->category);
        $this->assertEquals($category->id, $podcast->category->id);
    }

    public function test_podcast_has_many_episodes()
    {
        $podcast = Podcast::factory()->create();
        PodcastEpisode::factory()->count(3)->create(['podcast_id' => $podcast->id]);

        $this->assertCount(3, $podcast->episodes);
        $this->assertInstanceOf(PodcastEpisode::class, $podcast->episodes->first());
    }

    public function test_podcast_has_many_subscriptions()
    {
        $podcast = Podcast::factory()->create();
        $users = User::factory()->count(3)->create();

        foreach ($users as $user) {
            PodcastSubscription::create([
                'podcast_id' => $podcast->id,
                'user_id' => $user->id,
            ]);
        }

        $this->assertCount(3, $podcast->subscriptions);
    }

    public function test_published_scope_returns_only_published_podcasts()
    {
        Podcast::factory()->create(['status' => 'draft']);
        Podcast::factory()->create(['status' => 'published']);
        Podcast::factory()->create(['status' => 'archived']);

        $published = Podcast::published()->get();

        $this->assertCount(1, $published);
        $this->assertEquals('published', $published->first()->status);
    }

    public function test_draft_scope_returns_only_draft_podcasts()
    {
        Podcast::factory()->create(['status' => 'draft']);
        Podcast::factory()->create(['status' => 'draft']);
        Podcast::factory()->create(['status' => 'published']);

        $drafts = Podcast::draft()->get();

        $this->assertCount(2, $drafts);
    }

    public function test_premium_scope_returns_only_premium_podcasts()
    {
        $this->markTestSkipped('Premium podcasts feature not in current schema');
        
        Podcast::factory()->create(['is_premium' => false]);
        Podcast::factory()->create(['is_premium' => true]);
        Podcast::factory()->create(['is_premium' => true]);

        $premium = Podcast::premium()->get();

        $this->assertCount(2, $premium);
    }

    public function test_is_owned_by_returns_true_for_owner()
    {
        $user = User::factory()->create();
        $podcast = Podcast::factory()->create(['user_id' => $user->id]);

        $this->assertTrue($podcast->isOwnedBy($user));
    }

    public function test_is_owned_by_returns_false_for_non_owner()
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $podcast = Podcast::factory()->create(['user_id' => $owner->id]);

        $this->assertFalse($podcast->isOwnedBy($otherUser));
    }

    public function test_is_published_returns_correct_status()
    {
        $draft = Podcast::factory()->create(['status' => 'draft']);
        $published = Podcast::factory()->create(['status' => 'published']);

        $this->assertFalse($draft->isPublished());
        $this->assertTrue($published->isPublished());
    }

    public function test_increment_episode_count_increases_total()
    {
        $podcast = Podcast::factory()->create(['total_episodes' => 5]);

        $podcast->incrementEpisodeCount();

        $this->assertEquals(6, $podcast->fresh()->total_episodes);
    }

    public function test_decrement_episode_count_decreases_total()
    {
        $podcast = Podcast::factory()->create(['total_episodes' => 5]);

        $podcast->decrementEpisodeCount();

        $this->assertEquals(4, $podcast->fresh()->total_episodes);
    }

    public function test_update_statistics_calculates_correct_values()
    {
        $podcast = Podcast::factory()->create();
        
        PodcastEpisode::factory()->count(3)->create(['podcast_id' => $podcast->id]);
        
        PodcastSubscription::factory()->count(5)->create(['podcast_id' => $podcast->id]);

        $podcast->updateStatistics();

        $this->assertEquals(3, $podcast->fresh()->total_episodes);
        $this->assertEquals(5, $podcast->fresh()->subscriber_count);
    }

    public function test_route_key_name_is_slug()
    {
        $podcast = new Podcast();

        $this->assertEquals('slug', $podcast->getRouteKeyName());
    }

    public function test_tags_are_cast_to_array()
    {
        $this->markTestSkipped('Tags field not in current podcasts schema');
        
        $podcast = Podcast::factory()->create([
            'tags' => ['tech', 'business', 'startup']
        ]);

        $this->assertIsArray($podcast->tags);
        $this->assertCount(3, $podcast->tags);
    }

    public function test_explicit_content_is_cast_to_boolean()
    {
        $podcast = Podcast::factory()->create(['is_explicit' => true]);

        $this->assertIsBool($podcast->is_explicit);
        $this->assertTrue($podcast->is_explicit);
    }

    public function test_published_at_is_cast_to_datetime()
    {
        $this->markTestSkipped('published_at field not in current podcasts schema');
        
        $podcast = Podcast::factory()->create([
            'status' => 'published',
            'published_at' => now()
        ]);

        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $podcast->published_at);
    }
}
