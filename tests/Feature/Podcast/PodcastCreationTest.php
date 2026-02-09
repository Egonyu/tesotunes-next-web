<?php

namespace Tests\Feature\Podcast;

use App\Models\Podcast;
use App\Models\PodcastCategory;
use App\Models\User;
use App\Services\Podcast\PodcastService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PodcastCreationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Only run if podcast module is enabled
        if (!config('podcast.enabled', false)) {
            $this->markTestSkipped('Podcast module is disabled');
        }

        // Seed categories
        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\PodcastCategorySeeder']);
    }

    public function test_user_can_create_podcast_with_minimal_data()
    {
        $user = User::factory()->create();
        $category = PodcastCategory::first();

        $service = app(PodcastService::class);
        $podcast = $service->create([
            'title' => 'Tech Talk Uganda',
            'description' => 'A technology podcast from Kampala',
            'category_id' => $category->id,
        ], $user);

        $this->assertInstanceOf(Podcast::class, $podcast);
        $this->assertEquals('Tech Talk Uganda', $podcast->title);
        $this->assertEquals($user->id, $podcast->user_id);
        $this->assertEquals('draft', $podcast->status);
        $this->assertNotNull($podcast->uuid);
        $this->assertNotNull($podcast->rss_guid);
        $this->assertNotNull($podcast->slug);
    }

    public function test_podcast_slug_is_generated_automatically()
    {
        $user = User::factory()->create();
        $category = PodcastCategory::first();

        $service = app(PodcastService::class);
        $podcast = $service->create([
            'title' => 'My Awesome Podcast',
            'description' => 'Description',
            'category_id' => $category->id,
        ], $user);

        $this->assertEquals('my-awesome-podcast', $podcast->slug);
    }

    public function test_duplicate_slugs_are_handled_automatically()
    {
        $user = User::factory()->create();
        $category = PodcastCategory::first();
        $service = app(PodcastService::class);

        $podcast1 = $service->create([
            'title' => 'Tech Talk',
            'description' => 'First podcast',
            'category_id' => $category->id,
        ], $user);

        $podcast2 = $service->create([
            'title' => 'Tech Talk',
            'description' => 'Second podcast',
            'category_id' => $category->id,
        ], $user);

        $this->assertEquals('tech-talk', $podcast1->slug);
        $this->assertEquals('tech-talk-1', $podcast2->slug);
    }

    public function test_podcast_creation_increments_category_count()
    {
        $user = User::factory()->create();
        $category = PodcastCategory::first();
        $initialCount = $category->podcast_count;

        $service = app(PodcastService::class);
        $service->create([
            'title' => 'Test Podcast',
            'description' => 'Description',
            'category_id' => $category->id,
        ], $user);

        $category->refresh();
        $this->assertEquals($initialCount + 1, $category->podcast_count);
    }

    public function test_podcast_can_be_created_with_artwork()
    {
        Storage::fake('digitalocean');
        
        $user = User::factory()->create();
        $category = PodcastCategory::first();
        $service = app(PodcastService::class);

        $artwork = UploadedFile::fake()->image('podcast-cover.jpg', 3000, 3000);

        $podcast = $service->create([
            'title' => 'Test Podcast',
            'description' => 'Description',
            'category_id' => $category->id,
            'cover_image' => $artwork,
        ], $user);

        $this->assertNotNull($podcast->cover_image);
        Storage::disk('digitalocean')->assertExists($podcast->cover_image);
    }

    public function test_rss_feed_url_is_generated_on_creation()
    {
        $user = User::factory()->create();
        $category = PodcastCategory::first();
        $service = app(PodcastService::class);

        $podcast = $service->create([
            'title' => 'Test Podcast',
            'description' => 'Description',
            'category_id' => $category->id,
        ], $user);

        $this->assertNotNull($podcast->rss_feed_url);
        $this->assertStringContainsString($podcast->uuid, $podcast->rss_feed_url);
    }

    public function test_podcast_has_default_values()
    {
        $user = User::factory()->create();
        $category = PodcastCategory::first();
        $service = app(PodcastService::class);

        $podcast = $service->create([
            'title' => 'Test Podcast',
            'description' => 'Description',
            'category_id' => $category->id,
        ], $user);

        $this->assertEquals('en', $podcast->language);
        $this->assertEquals('draft', $podcast->status);
        $this->assertFalse($podcast->explicit_content);
        $this->assertFalse($podcast->is_premium);
        $this->assertEquals(0, $podcast->total_episodes);
        $this->assertEquals(0, $podcast->total_listens);
        $this->assertEquals(0, $podcast->subscriber_count);
    }

    public function test_author_name_defaults_to_user_name()
    {
        $user = User::factory()->create(['name' => 'John Doe']);
        $category = PodcastCategory::first();
        $service = app(PodcastService::class);

        $podcast = $service->create([
            'title' => 'Test Podcast',
            'description' => 'Description',
            'category_id' => $category->id,
        ], $user);

        $this->assertEquals('John Doe', $podcast->author_name);
    }

    public function test_copyright_is_auto_generated()
    {
        $user = User::factory()->create(['name' => 'John Doe']);
        $category = PodcastCategory::first();
        $service = app(PodcastService::class);

        $podcast = $service->create([
            'title' => 'Test Podcast',
            'description' => 'Description',
            'category_id' => $category->id,
        ], $user);

        $this->assertStringContainsString((string) now()->year, $podcast->copyright);
        $this->assertStringContainsString('John Doe', $podcast->copyright);
    }

    public function test_podcast_can_be_created_with_tags()
    {
        $user = User::factory()->create();
        $category = PodcastCategory::first();
        $service = app(PodcastService::class);

        $podcast = $service->create([
            'title' => 'Test Podcast',
            'description' => 'Description',
            'category_id' => $category->id,
            'tags' => ['technology', 'business', 'startup'],
        ], $user);

        $this->assertIsArray($podcast->tags);
        $this->assertCount(3, $podcast->tags);
        $this->assertContains('technology', $podcast->tags);
    }
}
