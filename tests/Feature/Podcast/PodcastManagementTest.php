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

class PodcastManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        if (!config('podcast.enabled', false)) {
            $this->markTestSkipped('Podcast module is disabled');
        }

        // Seed podcast categories if they don't exist
        if (PodcastCategory::count() === 0) {
            $categories = [
                ['name' => 'Technology', 'slug' => 'technology'],
                ['name' => 'Music', 'slug' => 'music'],
                ['name' => 'Business', 'slug' => 'business'],
                ['name' => 'Entertainment', 'slug' => 'entertainment'],
                ['name' => 'Education', 'slug' => 'education'],
            ];

            foreach ($categories as $category) {
                PodcastCategory::create([
                    'name' => $category['name'],
                    'slug' => $category['slug'],
                    'description' => 'Sample description for ' . $category['name'],
                    'is_active' => true,
                    'sort_order' => 1,
                    'display_order' => 1,
                    'podcast_count' => 0,
                ]);
            }
        }
    }

    public function test_podcast_can_be_updated()
    {
        $user = User::factory()->create();
        $category = PodcastCategory::first();
        $service = app(PodcastService::class);

        $podcast = $service->create([
            'title' => 'Original Title',
            'description' => 'Original Description',
            'podcast_category_id' => $category->id,
        ], $user);

        $updated = $service->update($podcast, [
            'title' => 'Updated Title',
            'description' => 'Updated Description',
        ]);

        $this->assertEquals('Updated Title', $updated->title);
        $this->assertEquals('Updated Description', $updated->description);
    }

    public function test_podcast_category_can_be_changed()
    {
        $user = User::factory()->create();
        $category1 = PodcastCategory::where('slug', 'technology')->first();
        $category2 = PodcastCategory::where('slug', 'music')->first();
        $service = app(PodcastService::class);

        $category1Count = $category1->podcast_count;
        $category2Count = $category2->podcast_count;

        $podcast = $service->create([
            'title' => 'Test Podcast',
            'description' => 'Description',
            'podcast_category_id' => $category1->id,
        ], $user);

        // After creation, category1 should have +1
        $category1->refresh();
        $this->assertEquals($category1Count + 1, $category1->podcast_count);

        $service->update($podcast, [
            'podcast_category_id' => $category2->id,
        ]);

        $category1->refresh();
        $category2->refresh();

        // After moving podcast, category1 back to original, category2 +1
        $this->assertEquals($category1Count, $category1->podcast_count);
        $this->assertEquals($category2Count + 1, $category2->podcast_count);
    }

    public function test_podcast_can_be_published()
    {
        $user = User::factory()->create();
        $category = PodcastCategory::first();
        $service = app(PodcastService::class);

        $podcast = $service->create([
            'title' => 'Test Podcast',
            'description' => 'Description',
            'podcast_category_id' => $category->id,
        ], $user);

        $this->assertEquals('draft', $podcast->status);

        $published = $service->publish($podcast);

        $this->assertEquals('published', $published->status);
    }

    public function test_publishing_published_podcast_is_idempotent()
    {
        $user = User::factory()->create();
        $category = PodcastCategory::first();
        $service = app(PodcastService::class);

        $podcast = $service->create([
            'title' => 'Test Podcast',
            'description' => 'Description',
            'podcast_category_id' => $category->id,
        ], $user);

        $service->publish($podcast);
        $firstStatus = $podcast->fresh()->status;

        $service->publish($podcast->fresh());
        $secondStatus = $podcast->fresh()->status;

        $this->assertEquals('published', $firstStatus);
        $this->assertEquals('published', $secondStatus);
    }

    public function test_podcast_can_be_archived()
    {
        $user = User::factory()->create();
        $category = PodcastCategory::first();
        $service = app(PodcastService::class);

        $podcast = $service->create([
            'title' => 'Test Podcast',
            'description' => 'Description',
            'podcast_category_id' => $category->id,
        ], $user);

        $service->publish($podcast);
        $archived = $service->archive($podcast->fresh());

        $this->assertEquals('archived', $archived->status);
    }

    public function test_podcast_can_be_deleted()
    {
        $user = User::factory()->create();
        $category = PodcastCategory::first();
        $service = app(PodcastService::class);

        $podcast = $service->create([
            'title' => 'Test Podcast',
            'description' => 'Description',
            'podcast_category_id' => $category->id,
        ], $user);

        $podcastId = $podcast->id;

        $service->delete($podcast);

        $this->assertSoftDeleted('podcasts', ['id' => $podcastId]);
    }

    public function test_podcast_artwork_can_be_updated()
    {
        $user = User::factory()->create();
        $category = PodcastCategory::first();
        $service = app(PodcastService::class);

        $podcast = $service->create([
            'title' => 'Test Podcast',
            'description' => 'Description',
            'podcast_category_id' => $category->id,
        ], $user);

        $service->update($podcast, [
            'artwork' => 'podcasts/new-artwork.jpg',
        ]);

        $podcast->refresh();

        $this->assertEquals('podcasts/new-artwork.jpg', $podcast->artwork);
    }
}
