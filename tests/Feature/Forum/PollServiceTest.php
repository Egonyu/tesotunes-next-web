<?php

use App\Models\User;
use App\Models\Modules\Forum\Poll;
use App\Models\Modules\Forum\PollOption;
use App\Modules\Forum\Services\PollService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = new PollService();
    $this->user = User::factory()->create();
});

test('service_can_create_poll_with_options', function () {
    $data = [
        'pollable_type' => 'Community',
        'pollable_id' => 1,
        'question' => 'What is your favorite music genre?',
        'description' => 'Help us understand your preferences',
        'options' => ['Afrobeat', 'Hip Hop', 'R&B', 'Reggae'],
        'allow_multiple_choices' => false,
    ];

    $poll = $this->service->createPoll($data, $this->user);

    expect($poll)->toBeInstanceOf(Poll::class)
        ->and($poll->question)->toBe('What is your favorite music genre?')
        ->and($poll->options)->toHaveCount(4)
        ->and($poll->options->first()->option_text)->toBe('Afrobeat');
});

test('service_can_cast_vote', function () {
    $poll = Poll::create([
        'user_id' => $this->user->id,
        'pollable_type' => 'Community',
        'pollable_id' => 1,
        'question' => 'Test poll?',
        'status' => 'active',
    ]);

    $option1 = PollOption::create([
        'poll_id' => $poll->id,
        'option_text' => 'Yes',
        'order' => 1,
    ]);

    $option2 = PollOption::create([
        'poll_id' => $poll->id,
        'option_text' => 'No',
        'order' => 2,
    ]);

    $voter = User::factory()->create();

    $result = $this->service->vote($poll, [$option1->id], $voter);

    expect($result)->toBeTrue()
        ->and($poll->fresh()->total_votes)->toBe(1)
        ->and($option1->fresh()->votes_count)->toBe(1)
        ->and($poll->userHasVoted($voter))->toBeTrue();
});

test('service_prevents_double_voting', function () {
    $poll = Poll::create([
        'user_id' => $this->user->id,
        'pollable_type' => 'Community',
        'pollable_id' => 1,
        'question' => 'Test poll?',
        'status' => 'active',
    ]);

    $option = PollOption::create([
        'poll_id' => $poll->id,
        'option_text' => 'Yes',
        'order' => 1,
    ]);

    $voter = User::factory()->create();

    // First vote succeeds
    $this->service->vote($poll, [$option->id], $voter);

    // Second vote should fail
    expect(fn() => $this->service->vote($poll->fresh(), [$option->id], $voter))
        ->toThrow(\Exception::class, 'already voted');
});

test('service_can_handle_multiple_choice_polls', function () {
    $poll = Poll::create([
        'user_id' => $this->user->id,
        'pollable_type' => 'Community',
        'pollable_id' => 1,
        'question' => 'Select all that apply',
        'allow_multiple_choices' => true,
        'status' => 'active',
    ]);

    $option1 = PollOption::create([
        'poll_id' => $poll->id,
        'option_text' => 'Option 1',
        'order' => 1,
    ]);

    $option2 = PollOption::create([
        'poll_id' => $poll->id,
        'option_text' => 'Option 2',
        'order' => 2,
    ]);

    $voter = User::factory()->create();

    $result = $this->service->vote($poll, [$option1->id, $option2->id], $voter);

    expect($result)->toBeTrue()
        ->and($poll->fresh()->total_votes)->toBe(2)
        ->and($option1->fresh()->votes_count)->toBe(1)
        ->and($option2->fresh()->votes_count)->toBe(1);
});

test('service_prevents_multiple_choices_on_single_choice_poll', function () {
    $poll = Poll::create([
        'user_id' => $this->user->id,
        'pollable_type' => 'Community',
        'pollable_id' => 1,
        'question' => 'Single choice only',
        'allow_multiple_choices' => false,
        'status' => 'active',
    ]);

    $option1 = PollOption::create(['poll_id' => $poll->id, 'option_text' => 'A', 'order' => 1]);
    $option2 = PollOption::create(['poll_id' => $poll->id, 'option_text' => 'B', 'order' => 2]);

    $voter = User::factory()->create();

    expect(fn() => $this->service->vote($poll, [$option1->id, $option2->id], $voter))
        ->toThrow(\Exception::class, 'only allows one choice');
});

test('service_can_get_poll_results', function () {
    $poll = Poll::create([
        'user_id' => $this->user->id,
        'pollable_type' => 'Community',
        'pollable_id' => 1,
        'question' => 'Test?',
        'status' => 'active',
        'total_votes' => 10,
    ]);

    $option1 = PollOption::create([
        'poll_id' => $poll->id,
        'option_text' => 'Yes',
        'votes_count' => 7,
        'order' => 1,
    ]);

    $option2 = PollOption::create([
        'poll_id' => $poll->id,
        'option_text' => 'No',
        'votes_count' => 3,
        'order' => 2,
    ]);

    $results = $this->service->getResults($poll);

    expect($results['total_votes'])->toBe(10)
        ->and($results['options'][0]['votes'])->toBe(7)
        ->and($results['options'][0]['percentage'])->toBe(70.0)
        ->and($results['options'][1]['percentage'])->toBe(30.0);
});

test('service_can_close_poll', function () {
    $poll = Poll::create([
        'user_id' => $this->user->id,
        'pollable_type' => 'Community',
        'pollable_id' => 1,
        'question' => 'Test?',
        'status' => 'active',
    ]);

    $closed = $this->service->closePoll($poll);

    expect($closed->status)->toBe('closed')
        ->and($closed->ends_at)->not->toBeNull();
});

test('service_prevents_voting_on_expired_poll', function () {
    $poll = Poll::create([
        'user_id' => $this->user->id,
        'pollable_type' => 'Community',
        'pollable_id' => 1,
        'question' => 'Expired poll',
        'status' => 'active',
        'ends_at' => now()->subDay(),
    ]);

    $option = PollOption::create([
        'poll_id' => $poll->id,
        'option_text' => 'Yes',
        'order' => 1,
    ]);

    $voter = User::factory()->create();

    expect(fn() => $this->service->vote($poll, [$option->id], $voter))
        ->toThrow(\Exception::class, 'not active');
});

test('service_can_check_if_user_can_vote', function () {
    $poll = Poll::create([
        'user_id' => $this->user->id,
        'pollable_type' => 'Community',
        'pollable_id' => 1,
        'question' => 'Test?',
        'status' => 'active',
    ]);

    $voter = User::factory()->create();

    // Before voting
    $canVote = $this->service->canVote($poll, $voter);
    expect($canVote['can_vote'])->toBeTrue();

    // After voting
    $option = PollOption::create(['poll_id' => $poll->id, 'option_text' => 'Yes', 'order' => 1]);
    $this->service->vote($poll, [$option->id], $voter);

    $cannotVote = $this->service->canVote($poll->fresh(), $voter);
    expect($cannotVote['can_vote'])->toBeFalse()
        ->and($cannotVote['reasons'])->toContain('You have already voted');
});

test('service_can_auto_close_expired_polls', function () {
    // Create active poll that's expired
    $expiredPoll = Poll::create([
        'user_id' => $this->user->id,
        'pollable_type' => 'Community',
        'pollable_id' => 1,
        'question' => 'Expired',
        'status' => 'active',
        'ends_at' => now()->subHour(),
    ]);

    // Create active poll that's still valid
    $activePoll = Poll::create([
        'user_id' => $this->user->id,
        'pollable_type' => 'Community',
        'pollable_id' => 1,
        'question' => 'Active',
        'status' => 'active',
        'ends_at' => now()->addHour(),
    ]);

    $closed = $this->service->closeExpiredPolls();

    expect($closed)->toBe(1)
        ->and($expiredPoll->fresh()->status)->toBe('closed')
        ->and($activePoll->fresh()->status)->toBe('active');
});

test('service_can_get_user_vote', function () {
    $poll = Poll::create([
        'user_id' => $this->user->id,
        'pollable_type' => 'Community',
        'pollable_id' => 1,
        'question' => 'Test?',
        'status' => 'active',
    ]);

    $option = PollOption::create([
        'poll_id' => $poll->id,
        'option_text' => 'Yes',
        'order' => 1,
    ]);

    $voter = User::factory()->create();

    // Before voting
    expect($this->service->getUserVote($poll, $voter))->toBeNull();

    // After voting
    $this->service->vote($poll, [$option->id], $voter);
    $userVote = $this->service->getUserVote($poll->fresh(), $voter);

    expect($userVote)->not->toBeNull()
        ->and($userVote['options'])->toContain('Yes');
});
