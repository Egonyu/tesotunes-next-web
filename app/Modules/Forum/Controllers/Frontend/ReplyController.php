<?php

namespace App\Modules\Forum\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Modules\Forum\ForumTopic;
use App\Models\Modules\Forum\ForumReply;
use App\Modules\Forum\Services\ForumService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class ReplyController extends Controller
{
    public function __construct(
        protected ForumService $forumService
    ) {}

    /**
     * Store a new reply to a topic
     */
    public function store(Request $request, ForumTopic $topic): RedirectResponse
    {
        $this->authorize('reply', $topic);
        
        $validated = $request->validate([
            'content' => 'required|string|min:5|max:5000',
            'parent_id' => 'sometimes|nullable|exists:forum_replies,id',
        ]);
        
        // If replying to a reply, verify it belongs to this topic
        if (isset($validated['parent_id'])) {
            $parentReply = ForumReply::findOrFail($validated['parent_id']);
            if ($parentReply->topic_id !== $topic->id) {
                return back()->withErrors(['parent_id' => 'Invalid parent reply.']);
            }
        }
        
        $reply = $this->forumService->createReply(
            $topic,
            [
                'content' => $validated['content'],
                'parent_id' => $validated['parent_id'] ?? null
            ],
            auth()->user()
        );
        
        return redirect()
            ->route('forum.topic.show', $topic->slug)
            ->with('success', 'Reply posted successfully!')
            ->withFragment('reply-' . $reply->id);
    }

    /**
     * Show form to edit a reply
     */
    public function edit(ForumReply $reply): View
    {
        $this->authorize('update', $reply);
        
        return view('modules.forum.frontend.edit-reply', compact('reply'));
    }

    /**
     * Update a reply
     */
    public function update(Request $request, ForumReply $reply): RedirectResponse
    {
        $this->authorize('update', $reply);
        
        $validated = $request->validate([
            'content' => 'required|string|min:5|max:5000',
        ]);
        
        $this->forumService->updateReply($reply, ['content' => $validated['content']]);
        
        return redirect()
            ->route('forum.topic.show', $reply->topic->slug)
            ->with('success', 'Reply updated successfully!')
            ->withFragment('reply-' . $reply->id);
    }

    /**
     * Delete a reply
     */
    public function destroy(ForumReply $reply): RedirectResponse
    {
        $this->authorize('delete', $reply);
        
        $topicSlug = $reply->topic->slug;
        
        $this->forumService->deleteReply($reply);
        
        return redirect()
            ->route('forum.topic.show', $topicSlug)
            ->with('success', 'Reply deleted successfully.');
    }

    /**
     * Toggle like on a reply
     */
    public function like(Request $request, ForumReply $reply)
    {
        // Check if user already liked (using session for simple toggle)
        $liked = $request->session()->has("reply_liked_{$reply->id}");
        
        if ($liked) {
            $reply->decrement('likes_count');
            $request->session()->forget("reply_liked_{$reply->id}");
            $action = 'unliked';
        } else {
            $reply->increment('likes_count');
            $request->session()->put("reply_liked_{$reply->id}", true);
            $action = 'liked';
        }
        
        // Return JSON for AJAX requests
        if ($request->expectsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'action' => $action,
                'likes_count' => $reply->fresh()->likes_count
            ]);
        }
        
        return back()->with('success', 'Reply ' . $action . '!');
    }

    /**
     * Mark reply as solution (topic owner or moderator)
     */
    public function markAsSolution(ForumTopic $topic, ForumReply $reply): RedirectResponse
    {
        // Check authorization (owner or moderator)
        if (auth()->id() !== $topic->user_id && !auth()->user()->hasAnyRole(['moderator', 'admin', 'super_admin'])) {
            abort(403, 'Unauthorized');
        }
        
        // Verify reply belongs to topic
        if ($reply->topic_id !== $topic->id) {
            return back()->withErrors(['reply' => 'Reply does not belong to this topic.']);
        }
        
        $this->forumService->markAsSolution($reply);
        
        return back()->with('success', 'Reply marked as solution!');
    }
}
