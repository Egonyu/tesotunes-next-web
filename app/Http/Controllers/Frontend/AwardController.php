<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Award;
use App\Models\AwardCategory;
use App\Models\AwardNomination;
use App\Models\AwardVote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AwardController extends Controller
{
    public function dashboard()
    {
        // Get current/active awards with nominations
        $currentAwards = Award::active()
            ->with(['nominations' => function($query) {
                $query->where('status', 'approved')
                      ->with(['nominee', 'category'])
                      ->orderBy('created_at', 'desc');
            }])
            ->orderBy('nomination_starts_at', 'desc')
            ->get();

        // Get past awards (completed)
        $pastAwards = Award::where('status', 'completed')
            ->with(['nominations' => function($query) {
                $query->where('status', 'approved')
                      ->with(['nominee', 'category']);
            }])
            ->orderBy('ceremony_date', 'desc')
            ->limit(5)
            ->get();

        // Get upcoming awards
        $upcomingAwards = Award::where('status', 'upcoming')
            ->orderBy('nomination_starts_at', 'asc')
            ->limit(3)
            ->get();

        return view('frontend.awards.dashboard', compact('currentAwards', 'pastAwards', 'upcomingAwards'));
    }

    public function index()
    {
        // Get current/active awards (treating as "seasons" for view compatibility)
        $currentSeasons = Award::active()
            ->with(['nominations' => function($query) {
                $query->where('status', 'approved')
                      ->with(['nominee', 'category']);
            }])
            ->orderBy('nomination_starts_at', 'desc')
            ->get();

        // Get past awards (completed)
        $pastSeasons = Award::where('status', 'completed')
            ->with(['nominations' => function($query) {
                $query->where('status', 'approved')
                      ->with(['nominee', 'category']);
            }])
            ->orderBy('ceremony_date', 'desc')
            ->limit(5)
            ->get();

        // Get upcoming awards
        $upcomingSeasons = Award::where('status', 'upcoming')
            ->orderBy('nomination_starts_at', 'asc')
            ->limit(3)
            ->get();

        // Get categories for the view
        $categories = AwardCategory::active()
            ->with(['nominations' => function($q) {
                $q->where('status', 'approved')
                  ->with('nominee');
            }])
            ->orderBy('sort_order')
            ->get();

        return view('frontend.awards.index', compact('currentSeasons', 'pastSeasons', 'upcomingSeasons', 'categories'));
    }

    public function show(Award $award)
    {
        $award->load([
            'nominations' => function($query) {
                $query->where('status', 'approved')
                      ->with(['nominee', 'category']);
            }
        ]);

        // Check if user has voted in this award
        $userVotes = [];
        if (Auth::check()) {
            $userVotes = AwardVote::where('user_id', Auth::id())
                ->whereHas('nomination', function($q) use ($award) {
                    $q->where('award_id', $award->id);
                })
                ->pluck('award_nomination_id')
                ->toArray();
        }

        return view('frontend.awards.show', compact('award', 'userVotes'));
    }

    public function vote(Request $request, AwardNomination $nomination)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Please log in to vote'
            ], 401);
        }

        $nomination->load('award');

        // Check if voting is open
        if (!$nomination->award->isVotingOpen()) {
            return response()->json([
                'success' => false,
                'message' => 'Voting is not currently open for this award'
            ], 403);
        }

        // Check if user already voted in this category
        $existingVote = AwardVote::where('user_id', Auth::id())
            ->whereHas('nomination', function($q) use ($nomination) {
                $q->where('category_id', $nomination->category_id);
            })
            ->first();

        if ($existingVote) {
            // Update vote
            $existingVote->update([
                'award_nomination_id' => $nomination->id,
                'voted_at' => now()
            ]);
            $message = 'Vote updated successfully';
        } else {
            // Create new vote
            AwardVote::create([
                'user_id' => Auth::id(),
                'award_nomination_id' => $nomination->id,
                'award_id' => $nomination->award_id,
                'voted_at' => now()
            ]);
            $message = 'Vote submitted successfully';
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'vote_count' => $nomination->votes()->count()
        ]);
    }

    public function myVotes()
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $votes = AwardVote::where('user_id', Auth::id())
            ->with([
                'nomination.nominee',
                'nomination.category',
                'nomination.award'
            ])
            ->orderBy('voted_at', 'desc')
            ->paginate(20);

        return view('frontend.awards.my-votes', compact('votes'));
    }

    public function categories()
    {
        // Get all active award categories with nominations
        $categories = AwardCategory::active()
            ->with(['nominations' => function($q) {
                $q->where('status', 'approved');
            }])
            ->orderBy('sort_order')
            ->get();

        return view('frontend.awards.categories', compact('categories'));
    }

    public function category($slug)
    {
        // Find category by slug
        $category = AwardCategory::where('slug', $slug)
            ->with(['nominations' => function($q) {
                $q->where('status', 'approved')
                  ->with(['nominee', 'award']);
            }])
            ->firstOrFail();

        return view('frontend.awards.category', compact('category'));
    }

    public function winners()
    {
        // Get completed awards with winning nominations
        $awards = Award::where('status', 'completed')
            ->with(['nominations' => function($q) {
                $q->where('status', 'approved')
                  ->with(['nominee', 'category']);
            }])
            ->orderBy('ceremony_date', 'desc')
            ->paginate(10);

        return view('frontend.awards.winners', compact('awards'));
    }

    public function votePage()
    {
        // Get current active award with all nominations
        $award = Award::active()
            ->with(['nominations' => function($q) {
                $q->where('status', 'approved')
                  ->with(['nominee', 'category']);
            }])
            ->first();

        if (!$award) {
            return view('frontend.awards.vote', [
                'award' => null,
                'userVotes' => []
            ]);
        }

        // Get user's existing votes
        $userVotes = [];
        if (Auth::check()) {
            $userVotes = AwardVote::where('user_id', Auth::id())
                ->whereHas('nomination', function($q) use ($award) {
                    $q->where('award_id', $award->id);
                })
                ->pluck('award_nomination_id')
                ->toArray();
        }

        return view('frontend.awards.vote', compact('award', 'userVotes'));
    }

    public function currentAward()
    {
        // Get the current active award and redirect to it
        $award = Award::active()->first();
        
        if (!$award) {
            return redirect()->route('frontend.awards.index')
                ->with('info', 'No active award at this time.');
        }

        return redirect()->route('frontend.awards.show', $award);
    }
}
