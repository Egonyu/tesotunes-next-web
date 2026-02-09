<?php

namespace App\Modules\Forum\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Modules\Forum\ForumCategory;
use App\Modules\Forum\Services\ForumService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use Illuminate\Support\Facades\Mail;

class ForumController extends Controller
{
    public function __construct(
        protected ForumService $forumService
    ) {}

    /**
     * Display forum index with all categories
     */
    public function index(): View
    {
        $categories = $this->forumService->getCategories();
        
        // Get recent topics
        $recentTopics = $this->forumService->getRecentTopics(5);
        
        // Get active polls
        $activePolls = $this->forumService->getActivePolls(3);
        
        // Get overall stats
        $stats = [
            'total_topics' => $categories->sum('topics_count'),
            'total_replies' => $categories->sum('replies_count'),
            'total_categories' => $categories->count(),
            'active_polls' => $activePolls->count(),
            'total_members' => \App\Models\User::count(),
        ];
        
        return view('modules.forum.frontend.index', compact('categories', 'stats', 'recentTopics', 'activePolls'));
    }

    /**
     * Display topics for a specific category
     */
    public function category(string $slug): View
    {
        $category = ForumCategory::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();
        
        $topics = $this->forumService->getCategoryTopics($category, 20);
        
        return view('modules.forum.frontend.category', compact('category', 'topics'));
    }

    /**
     * Search forum topics
     */
    public function search(Request $request): View
    {
        $request->validate([
            'q' => 'required|string|min:2|max:100',
        ]);

        $query = $request->input('q');
        $topics = $this->forumService->searchTopics($query);

        return view('modules.forum.frontend.search', compact('topics', 'query'));
    }

    /**
     * Show category suggestion form
     */
    public function suggestCategory(): View
    {
        return view('modules.forum.frontend.suggest-category');
    }

    /**
     * Store category suggestion
     */
    public function storeCategorySuggestion(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'reason' => 'required|string|max:500',
        ]);

        // Create a topic in the Feedback & Suggestions category for admin review
        $feedbackCategory = ForumCategory::where('slug', 'feedback')
            ->orWhere('slug', 'feedback-suggestions')
            ->orWhere('name', 'like', '%feedback%')
            ->first();

        if (!$feedbackCategory) {
            // Fallback to Support category if Feedback doesn't exist
            $feedbackCategory = ForumCategory::where('slug', 'support')
                ->orWhere('name', 'like', '%support%')
                ->first();
        }

        if (!$feedbackCategory) {
            // Last resort - use any active category
            $feedbackCategory = ForumCategory::where('is_active', true)->first();
        }

        if ($feedbackCategory) {
            $topicTitle = "📁 Category Suggestion: {$validated['name']}";
            $topicContent = "
                <div style='background: #f0fdf4; padding: 16px; border-radius: 8px; margin-bottom: 16px;'>
                    <h3 style='margin: 0 0 12px 0; color: #166534;'>📁 New Category Suggestion</h3>
                    <p><strong>Suggested Name:</strong> {$validated['name']}</p>
                    <p><strong>Description:</strong> {$validated['description']}</p>
                    <p><strong>Reason:</strong> {$validated['reason']}</p>
                </div>
                <p><em>Suggested by: " . auth()->user()->name . "</em></p>
                <hr>
                <p>💬 <strong>Community members:</strong> Please vote and comment if you'd like to see this category added!</p>
            ";

            $this->forumService->createTopic([
                'category_id' => $feedbackCategory->id,
                'title' => $topicTitle,
                'content' => $topicContent,
            ], auth()->user());

            return redirect()
                ->route('forum.category', $feedbackCategory->slug)
                ->with('success', 'Your category suggestion has been posted in the Feedback section! The community and moderators will review it.');
        }

        return redirect()
            ->route('forum.index')
            ->with('error', 'Unable to submit suggestion. Please try again later.');
    }
}
