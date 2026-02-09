<?php

namespace App\Modules\Forum\Services;

use App\Models\Modules\Forum\ForumTopic;
use App\Models\Modules\Forum\ForumReply;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ForumModerationService
{
    /**
     * Get topics pending moderation
     */
    public function getPendingTopics(int $perPage = 20)
    {
        return ForumTopic::where('status', 'pending')
            ->with(['category', 'user'])
            ->withCount('replies')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Approve a topic
     */
    public function approveTopic(ForumTopic $topic, User $moderator): ForumTopic
    {
        $topic->update([
            'status' => 'active',
        ]);

        // Log moderation action
        $this->logModerationAction($moderator, 'approve_topic', $topic);

        return $topic->fresh();
    }

    /**
     * Reject/Close a topic
     */
    public function rejectTopic(ForumTopic $topic, User $moderator, string $reason = null): ForumTopic
    {
        $topic->update([
            'status' => 'closed',
        ]);

        // Log moderation action
        $this->logModerationAction($moderator, 'reject_topic', $topic, $reason);

        return $topic->fresh();
    }

    /**
     * Archive a topic
     */
    public function archiveTopic(ForumTopic $topic, User $moderator): ForumTopic
    {
        $topic->update([
            'status' => 'archived',
        ]);

        $this->logModerationAction($moderator, 'archive_topic', $topic);

        return $topic->fresh();
    }

    /**
     * Pin a topic
     */
    public function pinTopic(ForumTopic $topic, User $moderator): ForumTopic
    {
        $topic->update(['is_pinned' => true]);
        $this->logModerationAction($moderator, 'pin_topic', $topic);

        return $topic->fresh();
    }

    /**
     * Unpin a topic
     */
    public function unpinTopic(ForumTopic $topic, User $moderator): ForumTopic
    {
        $topic->update(['is_pinned' => false]);
        $this->logModerationAction($moderator, 'unpin_topic', $topic);

        return $topic->fresh();
    }

    /**
     * Lock a topic
     */
    public function lockTopic(ForumTopic $topic, User $moderator, string $reason = null): ForumTopic
    {
        $topic->update(['is_locked' => true]);
        $this->logModerationAction($moderator, 'lock_topic', $topic, $reason);

        return $topic->fresh();
    }

    /**
     * Unlock a topic
     */
    public function unlockTopic(ForumTopic $topic, User $moderator): ForumTopic
    {
        $topic->update(['is_locked' => false]);
        $this->logModerationAction($moderator, 'unlock_topic', $topic);

        return $topic->fresh();
    }

    /**
     * Feature a topic (show in dashboard feed)
     */
    public function featureTopic(ForumTopic $topic, User $moderator): ForumTopic
    {
        $topic->update(['is_featured' => true]);
        $this->logModerationAction($moderator, 'feature_topic', $topic);

        return $topic->fresh();
    }

    /**
     * Unfeature a topic
     */
    public function unfeatureTopic(ForumTopic $topic, User $moderator): ForumTopic
    {
        $topic->update(['is_featured' => false]);
        $this->logModerationAction($moderator, 'unfeature_topic', $topic);

        return $topic->fresh();
    }

    /**
     * Highlight a reply (moderator pick)
     */
    public function highlightReply(ForumReply $reply, User $moderator): ForumReply
    {
        $reply->update(['is_highlighted' => true]);
        $this->logModerationAction($moderator, 'highlight_reply', $reply);

        return $reply->fresh();
    }

    /**
     * Remove highlight from a reply
     */
    public function unhighlightReply(ForumReply $reply, User $moderator): ForumReply
    {
        $reply->update(['is_highlighted' => false]);
        $this->logModerationAction($moderator, 'unhighlight_reply', $reply);

        return $reply->fresh();
    }

    /**
     * Delete a topic (soft delete)
     */
    public function deleteTopic(ForumTopic $topic, User $moderator, string $reason = null): bool
    {
        DB::beginTransaction();
        try {
            $this->logModerationAction($moderator, 'delete_topic', $topic, $reason);
            
            // Decrement category counts
            $topic->category->decrement('topics_count', 1);
            $topic->category->decrement('replies_count', $topic->replies_count);

            $topic->delete();

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete a reply (soft delete)
     */
    public function deleteReply(ForumReply $reply, User $moderator, string $reason = null): bool
    {
        DB::beginTransaction();
        try {
            $this->logModerationAction($moderator, 'delete_reply', $reply, $reason);

            // Decrement counters
            $reply->topic->decrement('replies_count');
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
     * Get moderation statistics
     */
    public function getStats(): array
    {
        return [
            'pending_topics' => ForumTopic::where('status', 'pending')->count(),
            'active_topics' => ForumTopic::where('status', 'active')->count(),
            'closed_topics' => ForumTopic::where('status', 'closed')->count(),
            'archived_topics' => ForumTopic::where('status', 'archived')->count(),
            'pinned_topics' => ForumTopic::where('is_pinned', true)->count(),
            'featured_topics' => ForumTopic::where('is_featured', true)->count(),
            'locked_topics' => ForumTopic::where('is_locked', true)->count(),
            'total_replies' => ForumReply::count(),
            'deleted_topics' => ForumTopic::onlyTrashed()->count(),
            'deleted_replies' => ForumReply::onlyTrashed()->count(),
        ];
    }

    /**
     * Log moderation action
     */
    protected function logModerationAction(User $moderator, string $action, $subject, ?string $reason = null): void
    {
        // TODO: Integrate with audit log system when available
        // For now, we could log to database or file
        \Log::info("Moderation action: {$action}", [
            'moderator_id' => $moderator->id,
            'moderator_name' => $moderator->name,
            'subject_type' => get_class($subject),
            'subject_id' => $subject->id,
            'reason' => $reason,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Bulk approve topics
     */
    public function bulkApproveTopis(array $topicIds, User $moderator): int
    {
        $count = ForumTopic::whereIn('id', $topicIds)
            ->where('status', 'pending')
            ->update(['status' => 'active']);

        foreach ($topicIds as $topicId) {
            $this->logModerationAction($moderator, 'bulk_approve_topic', (object)['id' => $topicId]);
        }

        return $count;
    }

    /**
     * Bulk delete topics
     */
    public function bulkDeleteTopics(array $topicIds, User $moderator, string $reason = null): int
    {
        DB::beginTransaction();
        try {
            $topics = ForumTopic::whereIn('id', $topicIds)->get();

            foreach ($topics as $topic) {
                $this->deleteTopic($topic, $moderator, $reason);
            }

            DB::commit();
            return $topics->count();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
