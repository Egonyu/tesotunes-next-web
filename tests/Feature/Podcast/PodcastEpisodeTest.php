<?php

namespace Tests\Feature\Podcast;

use App\Models\Podcast;
use App\Models\PodcastEpisode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PodcastEpisodeTest extends TestCase
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

    public function test_episode_creation_increments_podcast_episode_count()
    {
        $podcast = Podcast::factory()->create(['total_episodes' => 0]);

        PodcastEpisode::factory()->create(['podcast_id' => $podcast->id]);

        $this->assertEquals(1, $podcast->fresh()->total_episodes);
    }

    public function test_episode_deletion_decrements_podcast_episode_count()
    {
        $podcast = Podcast::factory()->create(['total_episodes' => 0]);
        $episode = PodcastEpisode::factory()->create(['podcast_id' => $podcast->id]);

        $this->assertEquals(1, $podcast->fresh()->total_episodes);

        $episode->delete();

        $this->assertEquals(0, $podcast->fresh()->total_episodes);
    }

    public function test_episode_belongs_to_podcast()
    {
        $podcast = Podcast::factory()->create();
        $episode = PodcastEpisode::factory()->create(['podcast_id' => $podcast->id]);

        $this->assertInstanceOf(Podcast::class, $episode->podcast);
        $this->assertEquals($podcast->id, $episode->podcast->id);
    }

    public function test_published_scope_returns_only_published_episodes()
    {
        $podcast = Podcast::factory()->create();
        
        PodcastEpisode::factory()->create([
            'podcast_id' => $podcast->id,
            'status' => 'draft'
        ]);
        
        PodcastEpisode::factory()->create([
            'podcast_id' => $podcast->id,
            'status' => 'published',
            'published_at' => now()
        ]);

        $published = PodcastEpisode::published()->get();

        $this->assertCount(1, $published);
        $this->assertEquals('published', $published->first()->status);
    }

    public function test_episode_can_be_published()
    {
        $episode = PodcastEpisode::factory()->create([
            'status' => 'draft',
            'published_at' => null
        ]);

        $this->assertFalse($episode->isPublished());

        $episode->publish();

        $this->assertTrue($episode->isPublished());
        $this->assertEquals('published', $episode->status);
        $this->assertNotNull($episode->published_at);
    }

    public function test_scheduled_episode_should_publish_returns_true_when_time_passed()
    {
        $episode = PodcastEpisode::factory()->create([
            'status' => 'scheduled',
            'scheduled_for' => now()->subHour()
        ]);

        $this->assertTrue($episode->shouldPublish());
    }

    public function test_scheduled_episode_should_publish_returns_false_when_time_not_passed()
    {
        $episode = PodcastEpisode::factory()->create([
            'status' => 'scheduled',
            'scheduled_for' => now()->addHour()
        ]);

        $this->assertFalse($episode->shouldPublish());
    }

    public function test_duration_formatted_returns_correct_format()
    {
        $episode = PodcastEpisode::factory()->create(['duration' => 3725]); // 1h 2m 5s

        $this->assertEquals('1:02:05', $episode->duration_formatted);
    }

    public function test_duration_formatted_omits_hours_when_less_than_one_hour()
    {
        $episode = PodcastEpisode::factory()->create(['duration' => 125]); // 2m 5s

        $this->assertEquals('2:05', $episode->duration_formatted);
    }

    public function test_file_size_formatted_returns_human_readable_size()
    {
        $episode = PodcastEpisode::factory()->create(['file_size' => 52428800]); // 50MB

        $this->assertEquals('50 MB', $episode->file_size_formatted);
    }

    public function test_episode_increment_listen_count_works()
    {
        $episode = PodcastEpisode::factory()->create(['listen_count' => 100]);

        $episode->incrementListenCount();

        $this->assertEquals(101, $episode->fresh()->listen_count);
    }

    public function test_episode_increment_download_count_works()
    {
        $episode = PodcastEpisode::factory()->create(['download_count' => 50]);

        $episode->incrementDownloadCount();

        $this->assertEquals(51, $episode->fresh()->download_count);
    }

    public function test_premium_scope_returns_only_premium_episodes()
    {
        $podcast = Podcast::factory()->create();
        
        PodcastEpisode::factory()->create([
            'podcast_id' => $podcast->id,
            'is_premium' => false
        ]);
        
        PodcastEpisode::factory()->create([
            'podcast_id' => $podcast->id,
            'is_premium' => true
        ]);

        $premium = PodcastEpisode::premium()->get();

        $this->assertCount(1, $premium);
        $this->assertTrue($premium->first()->is_premium);
    }

    public function test_episode_route_key_name_is_slug()
    {
        $episode = new PodcastEpisode();

        $this->assertEquals('slug', $episode->getRouteKeyName());
    }
}
