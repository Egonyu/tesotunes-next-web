<?php

use App\Models\User;
use App\Models\Modules\Forum\ForumCategory;
use App\Models\Modules\Forum\ForumTopic;
use App\Models\Modules\Forum\ForumReply;
use App\Modules\Forum\Services\ForumService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = new ForumService();
    $this->user = User::factory()->create();
    $this->category = ForumCategory::create([
        'name' => 'Test Category',
        'slug' => 'test-category',
        'is_active' => true,
    ]);
});

test('service_can_create_topic', function () {
    $data = [
        'category_id' => $this->category->id,
        'title' => 'Test Topic Title',
        'content' => 'This is test content',
    ];

    $topic = $this->service->createTopic($data, $this->user);

    expect($topic)->toBeInstanceOf(ForumTopic::class)
        ->and($topic->title)->toBe('Test Topic Title')
        ->and($topic->slug)->toContain('test-topic-title')
        ->and($topic->user_id)->toBe($this->user->id)
        ->and($topic->status)->toBe('active');

    // Verify category counter incremented
    expect($this->category->fresh()->topics_count)->toBe(1);
});

test('service_can_update_topic', function () {
    $topic = ForumTopic::create([
        'category_id' => $this->category->id,
        'user_id' => $this->user->id,
        'title' => 'Original Title',
        'content' => 'Original content',
        'status' => 'active',
    ]);

    $updated = $this->service->updateTopic($topic, [
        'title' => 'Updated Title',
        'content' => 'Updated content',
    ]);

    expect($updated->title)->toBe('Updated Title')
        ->and($updated->content)->toBe('Updated content');
});

test('service_can_delete_topic', function () {
    $topic = ForumTopic::create([
        'category_id' => $this->category->id,
        'user_id' => $this->user->id,
        'title' => 'To Delete',
        'content' => 'Content',
        'status' => 'active',
    ]);

    $this->category->increment('topics_count');

    $result = $this->service->deleteTopic($topic);

    expect($result)->toBeTrue()
        ->and(ForumTopic::find($topic->id))->toBeNull() // Check via find (excludes soft deleted)
        ->and(ForumTopic::withTrashed()->find($topic->id))->not->toBeNull() // Still exists in trash
        ->and($this->category->fresh()->topics_count)->toBe(0);
});

test('service_can_create_reply', function () {
    $topic = ForumTopic::create([
        'category_id' => $this->category->id,
        'user_id' => $this->user->id,
        'title' => 'Topic',
        'content' => 'Content',
        'status' => 'active',
    ]);

    $reply = $this->service->createReply($topic, [
        'content' => 'This is a reply',
    ], $this->user);

    expect($reply)->toBeInstanceOf(ForumReply::class)
        ->and($reply->content)->toBe('This is a reply')
        ->and($reply->topic_id)->toBe($topic->id);

    // Verify counters updated
    $topic->refresh();
    expect($topic->replies_count)->toBe(1)
        ->and($topic->last_reply_user_id)->toBe($this->user->id)
        ->and($topic->last_activity_at)->not->toBeNull();
});

test('service_can_create_nested_reply', function () {
    $topic = ForumTopic::create([
        'category_id' => $this->category->id,
        'user_id' => $this->user->id,
        'title' => 'Topic',
        'content' => 'Content',
        'status' => 'active',
    ]);

    $parentReply = $this->service->createReply($topic, [
        'content' => 'Parent reply',
    ], $this->user);

    $childReply = $this->service->createReply($topic, [
        'content' => 'Child reply',
        'parent_id' => $parentReply->id,
    ], $this->user);

    expect($childReply->parent_id)->toBe($parentReply->id)
        ->and($topic->fresh()->replies_count)->toBe(2);
});

test('service_can_mark_reply_as_solution', function () {
    $topic = ForumTopic::create([
        'category_id' => $this->category->id,
        'user_id' => $this->user->id,
        'title' => 'Question',
        'content' => 'Content',
        'status' => 'active',
    ]);

    $reply1 = ForumReply::create([
        'topic_id' => $topic->id,
        'user_id' => $this->user->id,
        'content' => 'Reply 1',
    ]);

    $reply2 = ForumReply::create([
        'topic_id' => $topic->id,
        'user_id' => $this->user->id,
        'content' => 'Reply 2',
    ]);

    $this->service->markAsSolution($reply2);

    expect($reply2->fresh()->is_solution)->toBeTrue()
        ->and($reply1->fresh()->is_solution)->toBeFalse();
});

test('service_can_toggle_topic_pin', function () {
    $topic = ForumTopic::create([
        'category_id' => $this->category->id,
        'user_id' => $this->user->id,
        'title' => 'Topic',
        'content' => 'Content',
        'status' => 'active',
        'is_pinned' => false,
    ]);

    $pinned = $this->service->togglePin($topic);
    expect($pinned->is_pinned)->toBeTrue();

    $unpinned = $this->service->togglePin($topic->fresh());
    expect($unpinned->is_pinned)->toBeFalse();
});

test('service_can_toggle_topic_lock', function () {
    $topic = ForumTopic::create([
        'category_id' => $this->category->id,
        'user_id' => $this->user->id,
        'title' => 'Topic',
        'content' => 'Content',
        'status' => 'active',
        'is_locked' => false,
    ]);

    $locked = $this->service->toggleLock($topic);
    expect($locked->is_locked)->toBeTrue();

    $unlocked = $this->service->toggleLock($topic->fresh());
    expect($unlocked->is_locked)->toBeFalse();
});

test('service_can_get_featured_topics', function () {
    // Create featured topic
    ForumTopic::create([
        'category_id' => $this->category->id,
        'user_id' => $this->user->id,
        'title' => 'Featured Topic',
        'content' => 'Content',
        'status' => 'active',
        'is_featured' => true,
    ]);

    // Create non-featured topic
    ForumTopic::create([
        'category_id' => $this->category->id,
        'user_id' => $this->user->id,
        'title' => 'Regular Topic',
        'content' => 'Content',
        'status' => 'active',
        'is_featured' => false,
    ]);

    $featured = $this->service->getFeaturedTopics();

    expect($featured)->toHaveCount(1)
        ->and($featured->first()->is_featured)->toBeTrue();
});

test('service_can_search_topics', function () {
    ForumTopic::create([
        'category_id' => $this->category->id,
        'user_id' => $this->user->id,
        'title' => 'Laravel Best Practices',
        'content' => 'Content about Laravel',
        'status' => 'active',
    ]);

    ForumTopic::create([
        'category_id' => $this->category->id,
        'user_id' => $this->user->id,
        'title' => 'PHP Tips',
        'content' => 'Content about PHP',
        'status' => 'active',
    ]);

    $results = $this->service->searchTopics('Laravel');

    expect($results->total())->toBe(1)
        ->and($results->first()->title)->toContain('Laravel');
});

test('service_generates_unique_slugs', function () {
    $topic1 = $this->service->createTopic([
        'category_id' => $this->category->id,
        'title' => 'Same Title',
        'content' => 'Content 1',
    ], $this->user);

    $topic2 = $this->service->createTopic([
        'category_id' => $this->category->id,
        'title' => 'Same Title',
        'content' => 'Content 2',
    ], $this->user);

    expect($topic1->slug)->not->toBe($topic2->slug)
        ->and($topic1->slug)->toContain('same-title')
        ->and($topic2->slug)->toContain('same-title');
});
