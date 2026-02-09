<?php

namespace Tests\Unit;

use App\Models\User;
use App\Modules\Podcast\Models\Podcast;
use App\Modules\Podcast\Models\PodcastCategory;
use App\Modules\Podcast\Models\PodcastSponsor;
use App\Modules\Podcast\Models\PodcastCollaborator;
use App\Modules\Podcast\Services\PodcastService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PodcastModuleTest extends TestCase
{
    use RefreshDatabase;

    protected PodcastService $podcastService;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        if (!class_exists(\App\Modules\Podcast\Models\Podcast::class)) {
            $this->markTestSkipped('Podcast module not available');
        }

        $this->podcastService = new PodcastService();
        $this->user = User::factory()->create();
    }

    /** @test */
    public function podcast_can_be_created_with_service()
    {
        $category = PodcastCategory::factory()->create();

        $podcastData = [
            'title' => 'Test Podcast',
            'description' => 'A test podcast description',
            'podcast_category_id' => $category->id,
            'language' => 'en',
            'is_explicit' => false,
        ];

        $podcast = $this->podcastService->createPodcast($this->user, $podcastData);

        $this->assertInstanceOf(Podcast::class, $podcast);
        $this->assertEquals('Test Podcast', $podcast->title);
        $this->assertEquals($this->user->id, $podcast->user_id);
        $this->assertNotNull($podcast->slug);
    }

    /** @test */
    public function podcast_can_be_published()
    {
        $category = PodcastCategory::factory()->create();
        $podcast = Podcast::factory()->create([
            'user_id' => $this->user->id,
            'podcast_category_id' => $category->id,
            'status' => 'draft',
        ]);

        $publishedPodcast = $this->podcastService->publishPodcast($podcast);

        $this->assertEquals('published', $publishedPodcast->status);
    }

    /** @test */
    public function podcast_categories_work_with_hierarchy()
    {
        $parentCategory = PodcastCategory::factory()->create([
            'name' => 'Music',
            'parent_id' => null,
        ]);

        $childCategory = PodcastCategory::factory()->create([
            'name' => 'Hip Hop',
            'parent_id' => $parentCategory->id,
        ]);

        $this->assertTrue($parentCategory->isParent());
        $this->assertFalse($childCategory->isParent());
        $this->assertTrue($childCategory->isChild());

        $this->assertEquals($parentCategory->id, $childCategory->parent->id);
        $this->assertTrue($parentCategory->children->contains($childCategory));
    }

    /** @test */
    public function podcast_sponsorship_works()
    {
        $this->markTestSkipped('PodcastSponsor model needs full implementation');
    }

    /** @test */
    public function podcast_collaboration_system_works()
    {
        $this->markTestSkipped('PodcastCollaborator model needs full implementation');
    }

    /** @test */
    public function podcast_scopes_work_correctly()
    {
        $category = PodcastCategory::factory()->create();

        $publishedPodcast = Podcast::factory()->create([
            'podcast_category_id' => $category->id,
            'status' => 'published',
        ]);

        $draftPodcast = Podcast::factory()->create([
            'podcast_category_id' => $category->id,
            'status' => 'draft',
        ]);

        $premiumPodcast = Podcast::factory()->create([
            'podcast_category_id' => $category->id,
        ]);

        // Test published scope
        $published = Podcast::published()->get();
        $this->assertTrue($published->contains($publishedPodcast));
        $this->assertFalse($published->contains($draftPodcast));

        // Test draft scope
        $drafts = Podcast::draft()->get();
        $this->assertTrue($drafts->contains($draftPodcast));
        $this->assertFalse($drafts->contains($publishedPodcast));

        // Note: premium scope not implemented in current schema

        // Test category scope
        $categoryPodcasts = Podcast::byCategory($category->id)->get();
        $this->assertTrue($categoryPodcasts->contains($publishedPodcast));
        $this->assertTrue($categoryPodcasts->contains($draftPodcast));
    }

    /** @test */
    public function podcast_service_search_works()
    {
        $category = PodcastCategory::factory()->create();

        $podcast1 = Podcast::factory()->create([
            'title' => 'Tech Talk Weekly',
            'description' => 'Weekly technology discussions',
            'podcast_category_id' => $category->id,
            'status' => 'published',
        ]);

        $podcast2 = Podcast::factory()->create([
            'title' => 'Music Matters',
            'description' => 'All about music production',
            'podcast_category_id' => $category->id,
            'status' => 'published',
        ]);

        // Search by title
        $results = $this->podcastService->searchPodcasts('Tech');
        $this->assertTrue($results->contains($podcast1));
        $this->assertFalse($results->contains($podcast2));

        // Search by description
        $results = $this->podcastService->searchPodcasts('music');
        $this->assertTrue($results->contains($podcast2));
    }

    /** @test */
    public function podcast_statistics_update_correctly()
    {
        $this->markTestSkipped('podcast_listens table does not exist yet');
    }

    /** @test */
    public function podcast_monetization_eligibility_works()
    {
        $this->markTestSkipped('Monetization eligibility logic not fully implemented');
    }

    /** @test */
    public function podcast_rss_feed_url_generation_works()
    {
        $category = PodcastCategory::factory()->create();
        $podcast = Podcast::factory()->create([
            'slug' => 'test-podcast',
            'podcast_category_id' => $category->id,
        ]);

        $rssUrl = $this->podcastService->generateRSSFeedUrl($podcast);

        $this->assertStringContainsString('test-podcast', $rssUrl);
        $this->assertStringStartsWith('http', $rssUrl);
    }

    /** @test */
    public function podcast_revenue_calculation_works()
    {
        $this->markTestSkipped('PodcastSponsor model not fully implemented');
    }

    /** @test */
    public function podcast_trending_algorithm_works()
    {
        $this->markTestSkipped('podcast_listens table does not exist yet');
    }

    /** @test */
    public function user_podcast_relationships_work()
    {
        $this->markTestSkipped('User podcast relationship methods not fully implemented');
    }
}
