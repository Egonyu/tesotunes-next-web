<?php

use App\Models\ModuleSetting;
use App\Models\Modules\Forum\ForumCategory;
use App\Models\Modules\Forum\ForumTopic;
use App\Models\Modules\Forum\ForumReply;
use App\Models\Modules\Forum\Poll;
use App\Models\Modules\Forum\PollOption;
use App\Models\Modules\Forum\PollVote;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('module_settings_table_exists', function () {
    expect(ModuleSetting::count())->toBeInt();
});

test('can_create_module_setting', function () {
    $setting = ModuleSetting::create([
        'module_name' => 'forum',
        'is_enabled' => true,
        'configuration' => ['allow_guest_viewing' => true],
        'enabled_at' => now(),
    ]);

    expect($setting)->toBeInstanceOf(ModuleSetting::class)
        ->and($setting->module_name)->toBe('forum')
        ->and($setting->is_enabled)->toBeTrue();
});

test('can_check_if_module_is_enabled', function () {
    ModuleSetting::create([
        'module_name' => 'forum',
        'is_enabled' => true,
    ]);

    expect(ModuleSetting::isEnabled('forum'))->toBeTrue()
        ->and(ModuleSetting::isEnabled('nonexistent'))->toBeFalse();
});

test('can_create_forum_category', function () {
    $category = ForumCategory::create([
        'name' => 'General Discussion',
        'slug' => 'general-discussion',
        'description' => 'Talk about anything',
        'icon' => '💬',
        'color' => '#6366f1',
        'is_active' => true,
    ]);

    expect($category)->toBeInstanceOf(ForumCategory::class)
        ->and($category->name)->toBe('General Discussion')
        ->and($category->is_active)->toBeTrue();
});

test('can_create_forum_topic_with_auto_slug', function () {
    $user = User::factory()->create();
    $category = ForumCategory::create([
        'name' => 'Music Talk',
        'slug' => 'music-talk',
        'is_active' => true,
    ]);

    $topic = ForumTopic::create([
        'category_id' => $category->id,
        'user_id' => $user->id,
        'title' => 'Best Ugandan Artists 2025',
        'content' => 'Let\'s discuss the best artists',
        'status' => 'active',
    ]);

    expect($topic)->toBeInstanceOf(ForumTopic::class)
        ->and($topic->slug)->toContain('best-ugandan-artists-2025')
        ->and($topic->last_activity_at)->not->toBeNull();
});

test('forum_topic_has_relationships', function () {
    $user = User::factory()->create();
    $category = ForumCategory::create([
        'name' => 'Test Category',
        'slug' => 'test-category',
        'is_active' => true,
    ]);

    $topic = ForumTopic::create([
        'category_id' => $category->id,
        'user_id' => $user->id,
        'title' => 'Test Topic',
        'content' => 'Test content',
        'status' => 'active',
    ]);

    expect($topic->category)->toBeInstanceOf(ForumCategory::class)
        ->and($topic->user)->toBeInstanceOf(User::class)
        ->and($topic->category->id)->toBe($category->id)
        ->and($topic->user->id)->toBe($user->id);
});

test('can_create_forum_reply', function () {
    $user = User::factory()->create();
    $category = ForumCategory::create([
        'name' => 'Test',
        'slug' => 'test',
        'is_active' => true,
    ]);

    $topic = ForumTopic::create([
        'category_id' => $category->id,
        'user_id' => $user->id,
        'title' => 'Test Topic',
        'content' => 'Test content',
        'status' => 'active',
    ]);

    $reply = ForumReply::create([
        'topic_id' => $topic->id,
        'user_id' => $user->id,
        'content' => 'Great discussion!',
    ]);

    expect($reply)->toBeInstanceOf(ForumReply::class)
        ->and($reply->topic_id)->toBe($topic->id)
        ->and($reply->content)->toBe('Great discussion!');
});

test('can_create_poll_with_options', function () {
    $user = User::factory()->create();
    $category = ForumCategory::create([
        'name' => 'Polls',
        'slug' => 'polls',
        'is_active' => true,
    ]);

    $topic = ForumTopic::create([
        'category_id' => $category->id,
        'user_id' => $user->id,
        'title' => 'Poll Topic',
        'content' => 'Vote for your favorite',
        'status' => 'active',
    ]);

    $poll = Poll::create([
        'user_id' => $user->id,
        'pollable_type' => ForumTopic::class,
        'pollable_id' => $topic->id,
        'question' => 'What is your favorite genre?',
        'status' => 'active',
    ]);

    $option1 = PollOption::create([
        'poll_id' => $poll->id,
        'option_text' => 'Afrobeat',
        'order' => 1,
    ]);

    $option2 = PollOption::create([
        'poll_id' => $poll->id,
        'option_text' => 'Hip Hop',
        'order' => 2,
    ]);

    expect($poll)->toBeInstanceOf(Poll::class)
        ->and($poll->options->count())->toBe(2)
        ->and($poll->options->first()->option_text)->toBe('Afrobeat');
});

test('user_can_vote_on_poll', function () {
    $user = User::factory()->create();
    
    $poll = Poll::create([
        'user_id' => $user->id,
        'pollable_type' => 'Community',
        'pollable_id' => 1,
        'question' => 'Favorite artist?',
        'status' => 'active',
    ]);

    $option = PollOption::create([
        'poll_id' => $poll->id,
        'option_text' => 'Jose Chameleone',
        'order' => 1,
    ]);

    $vote = PollVote::create([
        'poll_id' => $poll->id,
        'poll_option_id' => $option->id,
        'user_id' => $user->id,
    ]);

    expect($vote)->toBeInstanceOf(PollVote::class)
        ->and($poll->userHasVoted($user))->toBeTrue()
        ->and($vote->voted_at)->not->toBeNull();
});

test('poll_can_check_if_active', function () {
    $user = User::factory()->create();
    
    $activePoll = Poll::create([
        'user_id' => $user->id,
        'pollable_type' => 'Community',
        'pollable_id' => 1,
        'question' => 'Active poll?',
        'status' => 'active',
        'starts_at' => now()->subDay(),
        'ends_at' => now()->addWeek(),
    ]);

    $expiredPoll = Poll::create([
        'user_id' => $user->id,
        'pollable_type' => 'Community',
        'pollable_id' => 1,
        'question' => 'Expired poll?',
        'status' => 'active',
        'ends_at' => now()->subDay(),
    ]);

    expect($activePoll->isActive())->toBeTrue()
        ->and($expiredPoll->isActive())->toBeFalse();
});

test('forum_category_has_topics_relationship', function () {
    $user = User::factory()->create();
    $category = ForumCategory::create([
        'name' => 'Music',
        'slug' => 'music',
        'is_active' => true,
    ]);

    ForumTopic::create([
        'category_id' => $category->id,
        'user_id' => $user->id,
        'title' => 'Topic 1',
        'content' => 'Content 1',
        'status' => 'active',
    ]);

    ForumTopic::create([
        'category_id' => $category->id,
        'user_id' => $user->id,
        'title' => 'Topic 2',
        'content' => 'Content 2',
        'status' => 'active',
    ]);

    expect($category->topics()->count())->toBe(2)
        ->and($category->activeTopics()->count())->toBe(2);
});

test('forum_reply_can_have_nested_replies', function () {
    $user = User::factory()->create();
    $category = ForumCategory::create([
        'name' => 'Test',
        'slug' => 'test',
        'is_active' => true,
    ]);

    $topic = ForumTopic::create([
        'category_id' => $category->id,
        'user_id' => $user->id,
        'title' => 'Test',
        'content' => 'Test',
        'status' => 'active',
    ]);

    $parentReply = ForumReply::create([
        'topic_id' => $topic->id,
        'user_id' => $user->id,
        'content' => 'Parent reply',
    ]);

    $childReply = ForumReply::create([
        'topic_id' => $topic->id,
        'user_id' => $user->id,
        'parent_id' => $parentReply->id,
        'content' => 'Child reply',
    ]);

    expect($parentReply->children()->count())->toBe(1)
        ->and($childReply->parent->id)->toBe($parentReply->id);
});
