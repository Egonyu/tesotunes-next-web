<?php

namespace App\Modules\Forum\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Modules\Forum\ForumTopic;
use App\Models\Modules\Forum\ForumCategory;
use App\Modules\Forum\Services\ForumService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class TopicController extends Controller
{
    public function __construct(
        protected ForumService $forumService
    ) {}

    /**
     * Display a single topic with replies
     */
    public function show(string $slug): View
    {
        $topic = ForumTopic::with([
            'category',
            'user',
            'poll.options' => function($query) {
                $query->orderBy('position');
            },
        ])
        ->where('slug', $slug)
        ->where('status', 'active')
        ->firstOrFail();

        // Authorize view
        $this->authorize('view', $topic);

        // Get top-level replies with nested children (threaded)
        $replies = $topic->replies()
            ->with([
                'user',
                'parent.user',
                'children' => function($query) {
                    $query->with([
                        'user',
                        'parent.user',
                        'children' => function($q) {
                            $q->with(['user', 'parent.user'])->latest();
                        }
                    ])->latest();
                }
            ])
            ->whereNull('parent_id')
            ->latest()
            ->paginate(20);

        // Increment view count
        $topic->incrementViews();

        return view('modules.forum.frontend.topic', compact('topic', 'replies'));
    }

    /**
     * Show form to create new topic
     */
    public function create(Request $request): View
    {
        $this->authorize('create', ForumTopic::class);
        
        $categoryId = $request->input('category_id');
        $category = null;
        
        if ($categoryId) {
            $category = ForumCategory::findOrFail($categoryId);
        }
        
        $categories = ForumCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->get();
        
        return view('modules.forum.frontend.create-topic', compact('categories', 'category'));
    }

    /**
     * Store a new topic
     */
    public function store(Request $request): RedirectResponse
    {
        \Log::info('Forum topic store called', [
            'user' => auth()->id(),
            'request_data' => $request->all(),
        ]);
        
        $this->authorize('create', ForumTopic::class);
        
        \Log::info('Authorization passed');
        
        $validated = $request->validate([
            'category_id' => 'required|exists:forum_categories,id',
            'title' => 'required|string|min:5|max:255',
            'content' => 'required|string|min:10|max:10000',
            'is_pinned' => 'sometimes|boolean',
        ]);
        
        \Log::info('Validation passed', ['validated' => $validated]);
        
        // Regular users cannot pin topics
        if (!auth()->user()->hasAnyRole(['moderator', 'admin', 'super_admin'])) {
            unset($validated['is_pinned']);
        }
        
        $topic = $this->forumService->createTopic($validated, auth()->user());
        
        \Log::info('Topic created', ['topic_id' => $topic->id]);
        
        return redirect()
            ->route('forum.topic.show', $topic->slug)
            ->with('success', 'Topic created successfully!');
    }

    /**
     * Show form to edit topic
     */
    public function edit(ForumTopic $topic): View
    {
        $this->authorize('update', $topic);
        
        $categories = ForumCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->get();
        
        return view('modules.forum.frontend.edit-topic', compact('topic', 'categories'));
    }

    /**
     * Update an existing topic
     */
    public function update(Request $request, ForumTopic $topic): RedirectResponse
    {
        $this->authorize('update', $topic);
        
        $validated = $request->validate([
            'category_id' => 'sometimes|exists:forum_categories,id',
            'title' => 'sometimes|string|min:5|max:255',
            'content' => 'sometimes|string|min:10|max:10000',
            'is_pinned' => 'sometimes|boolean',
            'is_locked' => 'sometimes|boolean',
        ]);
        
        // Only moderators can change these
        if (!auth()->user()->hasAnyRole(['moderator', 'admin', 'super_admin'])) {
            unset($validated['is_pinned'], $validated['is_locked']);
        }
        
        $this->forumService->updateTopic($topic, $validated);
        
        return redirect()
            ->route('forum.topic.show', $topic->slug)
            ->with('success', 'Topic updated successfully!');
    }

    /**
     * Delete a topic
     */
    public function destroy(ForumTopic $topic): RedirectResponse
    {
        $this->authorize('delete', $topic);
        
        $categorySlug = $topic->category->slug;
        
        $this->forumService->deleteTopic($topic);
        
        return redirect()
            ->route('forum.category', $categorySlug)
            ->with('success', 'Topic deleted successfully.');
    }

    /**
     * Toggle like on a topic
     */
    public function like(Request $request, ForumTopic $topic)
    {
        $user = auth()->user();
        
        // Check if user already liked (using a simple likes table or cache)
        // For now, toggle likes_count
        $liked = $request->session()->has("topic_liked_{$topic->id}");
        
        if ($liked) {
            $topic->decrement('likes_count');
            $request->session()->forget("topic_liked_{$topic->id}");
            $action = 'unliked';
        } else {
            $topic->increment('likes_count');
            $request->session()->put("topic_liked_{$topic->id}", true);
            $action = 'liked';
        }
        
        // Return JSON for AJAX requests
        if ($request->expectsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'action' => $action,
                'likes_count' => $topic->fresh()->likes_count
            ]);
        }
        
        return back()->with('success', 'Topic ' . $action . '!');
    }

    /**
     * Toggle pin status (moderators only)
     */
    public function togglePin(ForumTopic $topic): RedirectResponse
    {
        $this->authorize('pin', $topic);
        
        $this->forumService->togglePin($topic);
        
        return back()->with('success', $topic->is_pinned ? 'Topic pinned.' : 'Topic unpinned.');
    }

    /**
     * Toggle lock status (moderators only)
     */
    public function toggleLock(ForumTopic $topic): RedirectResponse
    {
        $this->authorize('lock', $topic);
        
        $this->forumService->toggleLock($topic);
        
        return back()->with('success', $topic->is_locked ? 'Topic locked.' : 'Topic unlocked.');
    }

    /**
     * Toggle featured status (moderators only)
     */
    public function toggleFeatured(ForumTopic $topic): RedirectResponse
    {
        $this->authorize('feature', $topic);
        
        $this->forumService->toggleFeatured($topic);
        
        return back()->with('success', $topic->is_featured ? 'Topic featured.' : 'Topic unfeatured.');
    }
}
