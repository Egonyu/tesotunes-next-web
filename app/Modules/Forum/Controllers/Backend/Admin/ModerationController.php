<?php

namespace App\Modules\Forum\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use App\Models\Modules\Forum\ForumTopic;
use App\Models\Modules\Forum\ForumReply;
use App\Modules\Forum\Services\ForumModerationService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class ModerationController extends Controller
{
    public function __construct(
        protected ForumModerationService $moderationService
    ) {}

    /**
     * Display moderation dashboard
     */
    public function index(Request $request): View
    {
        $stats = $this->moderationService->getStats();
        
        // Get topics based on status filter
        $status = $request->get('status', 'pending');
        
        $query = ForumTopic::with(['user', 'category'])
            ->withCount('replies');
        
        switch ($status) {
            case 'approved':
                $query->where('status', 'approved');
                break;
            case 'rejected':
                $query->where('status', 'rejected');
                break;
            case 'flagged':
                $query->where('is_flagged', true);
                break;
            case 'pending':
            default:
                $query->where('status', 'pending');
                break;
        }
        
        $topics = $query->latest()->paginate(20);
        
        return view('modules.forum.backend.admin.moderation.index', compact('stats', 'topics'));
    }

    /**
     * Display pending topics awaiting approval
     */
    public function pending(): View
    {
        $pendingTopics = $this->moderationService->getPendingTopics(50);
        
        return view('modules.forum.backend.admin.moderation.pending', compact('pendingTopics'));
    }

    /**
     * Approve a topic
     */
    public function approveTopic(ForumTopic $topic): RedirectResponse
    {
        $this->moderationService->approveTopic($topic, auth()->user());
        
        return back()->with('success', 'Topic approved successfully!');
    }

    /**
     * Reject a topic
     */
    public function rejectTopic(Request $request, ForumTopic $topic): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);
        
        $this->moderationService->rejectTopic($topic, auth()->user(), $validated['reason'] ?? null);
        
        return back()->with('success', 'Topic rejected and closed.');
    }

    /**
     * Archive a topic
     */
    public function archiveTopic(ForumTopic $topic): RedirectResponse
    {
        $this->moderationService->archiveTopic($topic, auth()->user());
        
        return back()->with('success', 'Topic archived.');
    }

    /**
     * Delete a topic (soft delete)
     */
    public function deleteTopic(ForumTopic $topic): RedirectResponse
    {
        $this->moderationService->deleteTopic($topic, auth()->user());
        
        return back()->with('success', 'Topic deleted successfully.');
    }

    /**
     * Delete a reply (soft delete)
     */
    public function deleteReply(ForumReply $reply): RedirectResponse
    {
        $this->moderationService->deleteReply($reply, auth()->user());
        
        return back()->with('success', 'Reply deleted successfully.');
    }

    /**
     * Bulk approve topics
     */
    public function bulkApprove(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'topic_ids' => 'required|array|min:1',
            'topic_ids.*' => 'required|exists:forum_topics,id',
        ]);
        
        $this->moderationService->bulkApproveTopics($validated['topic_ids'], auth()->user());
        
        return back()->with('success', count($validated['topic_ids']) . ' topics approved!');
    }

    /**
     * Bulk delete topics
     */
    public function bulkDelete(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'topic_ids' => 'required|array|min:1',
            'topic_ids.*' => 'required|exists:forum_topics,id',
        ]);
        
        $this->moderationService->bulkDeleteTopics($validated['topic_ids'], auth()->user());
        
        return back()->with('success', count($validated['topic_ids']) . ' topics deleted!');
    }
}
