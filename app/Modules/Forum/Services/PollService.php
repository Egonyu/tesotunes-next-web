<?php

namespace App\Modules\Forum\Services;

use App\Models\Modules\Forum\Poll;
use App\Models\Modules\Forum\PollOption;
use App\Models\Modules\Forum\PollVote;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Request;

class PollService
{
    /**
     * Create a new poll
     */
    public function createPoll(array $data, User $user): Poll
    {
        DB::beginTransaction();
        try {
            $poll = Poll::create([
                'user_id' => $user->id,
                'pollable_type' => $data['pollable_type'],
                'pollable_id' => $data['pollable_id'],
                'title' => $data['question'] ?? $data['title'] ?? '',
                'description' => $data['description'] ?? null,
                'allow_multiple_votes' => $data['allow_multiple_choices'] ?? $data['allow_multiple_votes'] ?? false,
                'show_results_before_vote' => $data['show_results_before_vote'] ?? false,
                'is_anonymous' => $data['is_anonymous'] ?? false,
                'starts_at' => $data['starts_at'] ?? null,
                'ends_at' => $data['ends_at'] ?? null,
                'status' => $data['status'] ?? 'active',
            ]);

            // Create poll options
            if (isset($data['poll_type']) && $data['poll_type'] === 'comparison') {
                // Handle comparison poll options
                $this->createComparisonOptions($poll, $data);
            } else {
                // Handle simple poll options
                if (isset($data['options']) && is_array($data['options'])) {
                    foreach ($data['options'] as $index => $optionText) {
                        PollOption::create([
                            'poll_id' => $poll->id,
                            'option_text' => $optionText,
                            'position' => $index + 1,
                        ]);
                    }
                }
            }

            DB::commit();
            return $poll->fresh(['options', 'user']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update a poll
     */
    public function updatePoll(Poll $poll, array $data): Poll
    {
        $poll->update([
            'question' => $data['question'] ?? $poll->question,
            'description' => $data['description'] ?? $poll->description,
            'ends_at' => $data['ends_at'] ?? $poll->ends_at,
        ]);

        return $poll->fresh(['options']);
    }

    /**
     * Create comparison poll options with rich data
     */
    protected function createComparisonOptions(Poll $poll, array $data): void
    {
        $titles = $data['titles'] ?? [];
        $descriptions = $data['descriptions'] ?? [];
        $subtitles = $data['subtitles'] ?? [];
        $locations = $data['locations'] ?? [];
        $contactInfo = $data['contact_info'] ?? [];
        $prices = $data['prices'] ?? [];
        $comparisonType = $data['comparison_type'] ?? 'other';

        foreach ($titles as $index => $title) {
            $optionData = [
                'poll_id' => $poll->id,
                'option_text' => $title, // Fallback for display compatibility
                'comparison_type' => $comparisonType,
                'title' => $title,
                'description' => $descriptions[$index] ?? null,
                'subtitle' => $subtitles[$index] ?? null,
                'location' => $locations[$index] ?? null,
                'contact_info' => $contactInfo[$index] ?? null,
                'price' => !empty($prices[$index]) ? (float) $prices[$index] : null,
                'position' => $index + 1,
            ];

            // Handle individual option images
            if (request()->hasFile("option_images.{$index}")) {
                $imagePath = request()->file("option_images.{$index}")->store('poll-options', 'public');
                $optionData['image_url'] = $imagePath;
            }

            PollOption::create($optionData);
        }
    }

    /**
     * Cast vote(s) on a poll
     */
    public function vote(Poll $poll, array $optionIds, ?User $user = null): bool
    {
        // Refresh poll to ensure we have latest data
        $poll = $poll->fresh();
        
        // Check if poll is active
        if (!$poll->isActive()) {
            throw new \Exception('This poll is not active.');
        }

        // Check if user already voted (if not anonymous)
        if ($user && $poll->userHasVoted($user)) {
            throw new \Exception('You have already voted on this poll.');
        }

        // Validate options belong to this poll
        $validOptions = $poll->options()->whereIn('id', $optionIds)->pluck('id')->toArray();
        if (count($validOptions) !== count($optionIds)) {
            throw new \Exception('Invalid poll options.');
        }

        // Check multiple choice setting
        if (!$poll->allow_multiple_choices && count($optionIds) > 1) {
            throw new \Exception('This poll only allows one choice.');
        }

        DB::beginTransaction();
        try {
            foreach ($optionIds as $optionId) {
                PollVote::create([
                    'poll_id' => $poll->id,
                    'option_id' => $optionId,
                    'user_id' => $poll->is_anonymous ? null : ($user?->id),
                ]);

                // Increment option vote count
                PollOption::where('id', $optionId)->increment('vote_count');
            }

            // Increment total votes
            $poll->increment('total_votes', count($optionIds));

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get poll results
     */
    public function getResults(Poll $poll): array
    {
        $options = $poll->options()->with('votes')->get();
        
        $results = $options->map(function ($option) use ($poll) {
            return [
                'id' => $option->id,
                'text' => $option->option_text,
                'votes' => $option->votes_count,
                'percentage' => $option->percentage,
            ];
        });

        return [
            'poll_id' => $poll->id,
            'question' => $poll->question,
            'total_votes' => $poll->total_votes,
            'options' => $results->toArray(),
            'is_active' => $poll->isActive(),
            'ends_at' => $poll->ends_at?->toIso8601String(),
        ];
    }

    /**
     * Close a poll
     */
    public function closePoll(Poll $poll): Poll
    {
        $poll->update([
            'status' => 'closed',
            'ends_at' => now(),
        ]);

        return $poll->fresh();
    }

    /**
     * Delete a poll
     */
    public function deletePoll(Poll $poll): bool
    {
        $poll->delete();
        return true;
    }

    /**
     * Get active polls for a user's feed
     */
    public function getActivePolls(?User $user = null, int $limit = 10)
    {
        $query = Poll::active()
            ->with(['user', 'options'])
            ->withCount('votes')
            ->orderBy('created_at', 'desc')
            ->limit($limit);

        // Filter by followed users if user is provided
        if ($user) {
            $followingIds = $user->following()->pluck('following_id')->toArray();
            $query->where(function($q) use ($followingIds) {
                $q->whereIn('user_id', $followingIds)
                  ->orWhere('pollable_type', 'Community');
            });
        }

        return $query->get();
    }

    /**
     * Check if user can vote
     */
    public function canVote(Poll $poll, ?User $user = null): array
    {
        $reasons = [];

        if (!$poll->isActive()) {
            $reasons[] = 'Poll is not active';
        }

        if ($user && $poll->userHasVoted($user)) {
            $reasons[] = 'You have already voted';
        }

        if ($poll->starts_at && now()->isBefore($poll->starts_at)) {
            $reasons[] = 'Poll has not started yet';
        }

        if ($poll->ends_at && now()->isAfter($poll->ends_at)) {
            $reasons[] = 'Poll has ended';
        }

        return [
            'can_vote' => empty($reasons),
            'reasons' => $reasons,
        ];
    }

    /**
     * Get user's vote on a poll
     */
    public function getUserVote(Poll $poll, User $user): ?array
    {
        $votes = PollVote::where('poll_id', $poll->id)
            ->where('user_id', $user->id)
            ->with('pollOption')
            ->get();

        if ($votes->isEmpty()) {
            return null;
        }

        return [
            'voted_at' => $votes->first()->voted_at,
            'options' => $votes->pluck('pollOption.option_text')->toArray(),
        ];
    }

    /**
     * Auto-close expired polls
     */
    public function closeExpiredPolls(): int
    {
        return Poll::where('status', 'active')
            ->whereNotNull('ends_at')
            ->where('ends_at', '<', now())
            ->update([
                'status' => 'closed',
            ]);
    }
}
