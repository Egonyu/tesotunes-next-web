<?php

namespace App\Modules\Forum\Services;

use App\Models\Modules\Forum\ForumCategory;
use App\Models\Modules\Forum\ForumTopic;
use App\Models\Modules\Forum\ForumReply;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ForumService
{
    /**
     * Get all active categories with topic counts
     */
    public function getCategories()
    {
        return ForumCategory::active()
            ->ordered()
            ->withCount('topics')
            ->get();
    }

    /**
     * Get recent topics across all categories
     */
    public function getRecentTopics(int $limit = 5)
    {
        return ForumTopic::where('status', 'active')
            ->with(['user', 'category'])
            ->withCount('replies')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get active polls
     */
    public function getActivePolls(int $limit = 3)
    {
        return \App\Models\Modules\Forum\Poll::where('status', 'active')
            ->where(function($query) {
                $query->whereNull('ends_at')
                    ->orWhere('ends_at', '>', now());
            })
            ->withCount('votes')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get topics for a category with pagination
     */
    public function getCategoryTopics(ForumCategory $category, int $perPage = 20)
    {
        return $category->topics()
            ->active()
            ->with(['user', 'lastReplyUser'])
            ->withCount('replies')
            ->orderBy('is_pinned', 'desc')
            ->orderBy('last_activity_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Create a new topic
     */
    public function createTopic(array $data, User $user): ForumTopic
    {
        DB::beginTransaction();
        try {
            $topic = ForumTopic::create([
                'category_id' => $data['category_id'],
                'user_id' => $user->id,
                'title' => $data['title'],
                'content' => $data['content'],
                'slug' => $this->generateUniqueSlug($data['title']),
                'status' => 'active',
            ]);

            // Create poll if poll data is provided
            if (!empty($data['poll_question']) && !empty($data['poll_options'])) {
                $pollService = new PollService();

                // Filter out empty poll options
                $pollOptions = array_filter($data['poll_options'], function($option) {
                    return !empty(trim($option));
                });

                if (count($pollOptions) >= 2) {
                    $pollData = [
                        'pollable_type' => ForumTopic::class,
                        'pollable_id' => $topic->id,
                        'question' => $data['poll_question'],
                        'allow_multiple_choices' => isset($data['poll_multiple_choice']) && $data['poll_multiple_choice'],
                        'is_anonymous' => isset($data['poll_anonymous']) && $data['poll_anonymous'],
                        'options' => array_values($pollOptions), // Re-index array
                        'status' => 'active',
                    ];

                    $pollService->createPoll($pollData, $user);
                }
            }

            // Update category counts
            $topic->category->increment('topics_count');

            DB::commit();
            return $topic->fresh(['category', 'user', 'poll.options']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update a topic
     */
    public function updateTopic(ForumTopic $topic, array $data): ForumTopic
    {
        $topic->update([
            'title' => $data['title'] ?? $topic->title,
            'content' => $data['content'] ?? $topic->content,
            'category_id' => $data['category_id'] ?? $topic->category_id,
        ]);

        return $topic->fresh();
    }

    /**
     * Delete a topic (soft delete)
     */
    public function deleteTopic(ForumTopic $topic): bool
    {
        DB::beginTransaction();
        try {
            // Decrement category counts
            $topic->category->decrement('topics_count', 1);
            
            if ($topic->reply_count > 0) {
                $topic->category->decrement('replies_count', $topic->reply_count);
            }

            $topic->delete();

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Create a reply to a topic
     */
    public function createReply(ForumTopic $topic, array $data, User $user): ForumReply
    {
        DB::beginTransaction();
        try {
            $reply = ForumReply::create([
                'topic_id' => $topic->id,
                'user_id' => $user->id,
                'parent_id' => $data['parent_id'] ?? null,
                'content' => $data['content'],
            ]);

            // Update topic counters
            $topic->increment('reply_count');
            $topic->update([
                'last_reply_user_id' => $user->id,
                'last_activity_at' => now(),
            ]);

            // Update category counter
            $topic->category->increment('replies_count');

            DB::commit();
            return $reply->fresh(['user', 'topic']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update a reply
     */
    public function updateReply(ForumReply $reply, array $data): ForumReply
    {
        $reply->update([
            'content' => $data['content'] ?? $reply->content,
        ]);

        return $reply->fresh();
    }

    /**
     * Delete a reply (soft delete)
     */
    public function deleteReply(ForumReply $reply): bool
    {
        DB::beginTransaction();
        try {
            // Decrement counters
            $reply->topic->decrement('reply_count');
            $reply->topic->category->decrement('replies_count');

            $reply->delete();

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get featured topics for dashboard feed
     */
    public function getFeaturedTopics(int $limit = 10)
    {
        return ForumTopic::featured()
            ->active()
            ->with(['category', 'user'])
            ->withCount('replies')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Search topics
     */
    public function searchTopics(string $query, int $perPage = 20)
    {
        return ForumTopic::active()
            ->where(function($q) use ($query) {
                $q->where('title', 'LIKE', "%{$query}%")
                  ->orWhere('content', 'LIKE', "%{$query}%");
            })
            ->with(['category', 'user'])
            ->withCount('replies')
            ->orderBy('last_activity_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Generate a unique slug for a topic
     */
    protected function generateUniqueSlug(string $title): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $count = 1;

        while (ForumTopic::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . Str::random(6);
            $count++;
            
            if ($count > 10) {
                $slug = $originalSlug . '-' . uniqid();
                break;
            }
        }

        return $slug;
    }

    /**
     * Mark reply as solution
     */
    public function markAsSolution(ForumReply $reply): ForumReply
    {
        DB::beginTransaction();
        try {
            // Unmark other solutions in the same topic
            ForumReply::where('topic_id', $reply->topic_id)
                ->where('id', '!=', $reply->id)
                ->update(['is_solution' => false]);

            $reply->update(['is_solution' => true]);

            DB::commit();
            return $reply->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Toggle topic pin status
     */
    public function togglePin(ForumTopic $topic): ForumTopic
    {
        $topic->update(['is_pinned' => !$topic->is_pinned]);
        return $topic->fresh();
    }

    /**
     * Toggle topic lock status
     */
    public function toggleLock(ForumTopic $topic): ForumTopic
    {
        $topic->update(['is_locked' => !$topic->is_locked]);
        return $topic->fresh();
    }

    /**
     * Toggle topic featured status
     */
    public function toggleFeatured(ForumTopic $topic): ForumTopic
    {
        $topic->update(['is_featured' => !$topic->is_featured]);
        return $topic->fresh();
    }
}
