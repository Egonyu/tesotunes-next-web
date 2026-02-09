<?php

namespace App\Http\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AwardController extends Controller
{
    public function index()
    {
        // Use awards table (represents seasons/shows)
        $awards = DB::table('awards')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        // Seasons is an alias for awards (for view compatibility)
        $seasons = DB::table('awards')
            ->orderBy('year', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $categories = DB::table('award_categories')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Stats
        $stats = [
            'total_seasons' => DB::table('awards')->count(),
            'total_categories' => DB::table('award_categories')->count(),
            'total_nominations' => DB::table('award_nominations')->count(),
            'total_votes' => DB::table('award_votes')->count(),
        ];

        return view('admin.awards.index', compact('awards', 'categories', 'seasons', 'stats'));
    }

    public function seasons()
    {
        $seasons = DB::table('awards')
            ->orderBy('year', 'desc')
            ->paginate(15);

        return view('admin.awards.seasons.index', compact('seasons'));
    }

    public function createSeason()
    {
        return view('admin.awards.seasons.create');
    }

    public function storeSeason(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'year' => 'required|integer|min:2020|max:2030',
            'nominations_start_at' => 'nullable|date',
            'nominations_end_at' => 'nullable|date|after:nominations_start_at',
            'voting_start_at' => 'nullable|date',
            'voting_end_at' => 'nullable|date|after:voting_start_at',
            'ceremony_at' => 'nullable|date',
            'description' => 'nullable|string|max:1000',
        ]);

        DB::table('awards')->insert([
            'uuid' => (string) Str::uuid(),
            'title' => $request->name,
            'slug' => Str::slug($request->name . '-' . $request->year),
            'year' => $request->year,
            'nomination_starts_at' => $request->nominations_start_at,
            'nomination_ends_at' => $request->nominations_end_at,
            'voting_starts_at' => $request->voting_start_at,
            'voting_ends_at' => $request->voting_end_at,
            'ceremony_date' => $request->ceremony_at,
            'description' => $request->description,
            'status' => 'upcoming',
            'visibility' => 'public',
            'allow_public_nominations' => true,
            'allow_public_voting' => true,
            'votes_per_category' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('admin.awards.seasons.index')
            ->with('success', 'Award season created successfully');
    }

    public function showSeason($id)
    {
        $season = DB::table('awards')->find($id);
        if (!$season) {
            abort(404);
        }

        // Categories are global, not tied to season
        $categories = DB::table('award_categories')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $stats = [
            'total_categories' => $categories->count(),
            'total_nominations' => DB::table('award_nominations')
                ->where('award_id', $id)
                ->count(),
            'pending_nominations' => DB::table('award_nominations')
                ->where('award_id', $id)
                ->where('status', 'pending')
                ->count(),
            'approved_nominations' => DB::table('award_nominations')
                ->where('award_id', $id)
                ->where('status', 'approved')
                ->count(),
            'total_votes' => DB::table('award_votes')
                ->where('award_season_id', $id)
                ->count(),
        ];

        return view('admin.awards.seasons.show', compact('season', 'categories', 'stats'));
    }

    public function editSeason($id)
    {
        $season = DB::table('awards')->find($id);
        if (!$season) {
            abort(404);
        }

        return view('admin.awards.seasons.edit', compact('season'));
    }

    public function updateSeason(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'year' => 'required|integer|min:2020|max:2030',
            'nominations_start_at' => 'nullable|date',
            'nominations_end_at' => 'nullable|date',
            'voting_start_at' => 'nullable|date',
            'voting_end_at' => 'nullable|date',
            'ceremony_at' => 'nullable|date',
            'description' => 'nullable|string|max:1000',
            'status' => 'nullable|in:upcoming,nominations_open,voting_open,voting_closed,completed',
        ]);

        DB::table('awards')
            ->where('id', $id)
            ->update([
                'title' => $request->name,
                'year' => $request->year,
                'nomination_starts_at' => $request->nominations_start_at,
                'nomination_ends_at' => $request->nominations_end_at,
                'voting_starts_at' => $request->voting_start_at,
                'voting_ends_at' => $request->voting_end_at,
                'ceremony_date' => $request->ceremony_at,
                'description' => $request->description,
                'status' => $request->status ?? 'upcoming',
                'updated_at' => now(),
            ]);

        return redirect()->route('admin.awards.seasons.show', $id)
            ->with('success', 'Award season updated successfully');
    }

    public function destroySeason($id)
    {
        // Check if season has nominations
        $nominationsCount = DB::table('award_nominations')
            ->where('award_id', $id)
            ->count();

        if ($nominationsCount > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete season with existing nominations');
        }

        DB::table('awards')->where('id', $id)->delete();

        return redirect()->route('admin.awards.seasons.index')
            ->with('success', 'Award season deleted successfully');
    }

    public function categories(Request $request)
    {
        $query = DB::table('award_categories');

        // Apply filters
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        if ($request->filled('type')) {
            $query->where('category_type', $request->type);
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $categories = $query->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(20)
            ->appends($request->only(['status', 'type', 'search']));

        return view('admin.awards.categories.index', compact('categories'));
    }

    public function createCategory()
    {
        $seasons = DB::table('awards')
            ->orderBy('year', 'desc')
            ->get();

        return view('admin.awards.categories.create', compact('seasons'));
    }

    public function storeCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:150',
            'description' => 'nullable|string|max:1000',
            'category_type' => 'required|in:music,artist,album,song,video,podcast,general',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        DB::table('award_categories')->insert([
            'uuid' => (string) Str::uuid(),
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'category_type' => $request->category_type,
            'is_active' => $request->has('is_active'),
            'sort_order' => $request->sort_order ?? 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('admin.awards.categories.index')
            ->with('success', 'Award category created successfully');
    }

    public function showCategory($id)
    {
        $category = DB::table('award_categories')
            ->where('id', $id)
            ->first();

        if (!$category) {
            abort(404);
        }

        // Get nominations for this category across all seasons
        $nominations = DB::table('award_nominations')
            ->leftJoin('awards', 'award_nominations.award_id', '=', 'awards.id')
            ->leftJoin('users as nominators', 'award_nominations.nominated_by_id', '=', 'nominators.id')
            ->where('award_nominations.category_id', $id)
            ->select(
                'award_nominations.*',
                'awards.title as season_name',
                'awards.year',
                'nominators.name as nominator_name'
            )
            ->orderBy('award_nominations.created_at', 'desc')
            ->paginate(20);

        // Get statistics
        $stats = [
            'total_nominations' => DB::table('award_nominations')
                ->where('category_id', $id)
                ->count(),
            'pending_nominations' => DB::table('award_nominations')
                ->where('category_id', $id)
                ->where('status', 'pending')
                ->count(),
            'approved_nominations' => DB::table('award_nominations')
                ->where('category_id', $id)
                ->where('status', 'approved')
                ->count(),
            'total_votes' => DB::table('award_votes')
                ->whereIn('award_nomination_id', function($query) use ($id) {
                    $query->select('id')
                        ->from('award_nominations')
                        ->where('category_id', $id);
                })
                ->count(),
        ];

        return view('admin.awards.categories.show', compact('category', 'nominations', 'stats'));
    }

    public function editCategory($id)
    {
        $category = DB::table('award_categories')->find($id);
        if (!$category) {
            abort(404);
        }

        return view('admin.awards.categories.edit', compact('category'));
    }

    public function updateCategory(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:150',
            'description' => 'nullable|string|max:1000',
            'category_type' => 'required|in:music,artist,album,song,video,podcast,general',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        DB::table('award_categories')
            ->where('id', $id)
            ->update([
                'name' => $request->name,
                'slug' => Str::slug($request->name),
                'description' => $request->description,
                'category_type' => $request->category_type,
                'is_active' => $request->has('is_active'),
                'sort_order' => $request->sort_order ?? 0,
                'updated_at' => now(),
            ]);

        return redirect()->route('admin.awards.categories.show', $id)
            ->with('success', 'Award category updated successfully');
    }

    public function destroyCategory($id)
    {
        // Check if category has nominations
        $nominationsCount = DB::table('award_nominations')
            ->where('category_id', $id)
            ->count();

        if ($nominationsCount > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete category with existing nominations');
        }

        DB::table('award_categories')->where('id', $id)->delete();

        return redirect()->route('admin.awards.categories.index')
            ->with('success', 'Award category deleted successfully');
    }

    public function nominations(Request $request)
    {
        $query = DB::table('award_nominations')
            ->leftJoin('award_categories', 'award_nominations.category_id', '=', 'award_categories.id')
            ->leftJoin('awards', 'award_nominations.award_id', '=', 'awards.id')
            ->leftJoin('users', 'award_nominations.nominated_by_id', '=', 'users.id')
            ->select(
                'award_nominations.*',
                'award_categories.name as category_name',
                'awards.title as season_name',
                'awards.year',
                'users.name as nominated_by_name'
            );

        // Filter by status
        if ($request->filled('status')) {
            $query->where('award_nominations.status', $request->status);
        }

        // Filter by season
        if ($request->filled('season')) {
            $query->where('award_nominations.award_id', $request->season);
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->where('award_nominations.category_id', $request->category);
        }

        // Search
        if ($request->filled('search')) {
            $query->where('award_nominations.nominee_name', 'like', '%' . $request->search . '%');
        }

        $nominations = $query->orderBy('award_nominations.created_at', 'desc')
            ->paginate(20)
            ->appends($request->only(['status', 'season', 'category', 'search']));

        // Get filter options
        $seasons = DB::table('awards')->orderBy('year', 'desc')->get();
        $categories = DB::table('award_categories')->orderBy('name')->get();

        return view('admin.awards.nominations.index', compact('nominations', 'seasons', 'categories'));
    }

    public function approveNomination($id)
    {
        DB::table('award_nominations')
            ->where('id', $id)
            ->update([
                'status' => 'approved',
                'approved_at' => now(),
                'updated_at' => now(),
            ]);

        return redirect()->back()
            ->with('success', 'Nomination approved successfully');
    }

    public function rejectNomination(Request $request, $id)
    {
        DB::table('award_nominations')
            ->where('id', $id)
            ->update([
                'status' => 'rejected',
                'updated_at' => now(),
            ]);

        return redirect()->back()
            ->with('success', 'Nomination rejected');
    }

    public function showNomination($id)
    {
        $nomination = DB::table('award_nominations')
            ->leftJoin('award_categories', 'award_nominations.category_id', '=', 'award_categories.id')
            ->leftJoin('awards', 'award_nominations.award_id', '=', 'awards.id')
            ->leftJoin('users as nominators', 'award_nominations.nominated_by_id', '=', 'nominators.id')
            ->where('award_nominations.id', $id)
            ->select(
                'award_nominations.*',
                'award_categories.name as category_name',
                'award_categories.category_type',
                'awards.title as season_name',
                'awards.year',
                'nominators.name as nominator_name'
            )
            ->first();

        if (!$nomination) {
            abort(404);
        }

        // Get votes for this nomination
        $votes = DB::table('award_votes')
            ->leftJoin('users', 'award_votes.user_id', '=', 'users.id')
            ->where('award_votes.award_nomination_id', $id)
            ->select('award_votes.*', 'users.name as voter_name')
            ->orderBy('award_votes.voted_at', 'desc')
            ->paginate(20);

        $voteCount = DB::table('award_votes')
            ->where('award_nomination_id', $id)
            ->count();

        return view('admin.awards.nominations.show', compact('nomination', 'votes', 'voteCount'));
    }

    public function setWinner($id)
    {
        $nomination = DB::table('award_nominations')->find($id);
        if (!$nomination) {
            abort(404);
        }

        // Set as winner
        DB::table('award_nominations')
            ->where('id', $id)
            ->update([
                'status' => 'winner',
                'updated_at' => now(),
            ]);

        // Also add to award_winners table if it exists
        try {
            DB::table('award_winners')->insert([
                'award_id' => $nomination->award_id,
                'category_id' => $nomination->category_id,
                'nomination_id' => $id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            // Table might not exist or have different schema
        }

        return redirect()->back()
            ->with('success', 'Winner set successfully');
    }

    public function votes(Request $request)
    {
        $query = DB::table('award_votes')
            ->leftJoin('award_nominations', 'award_votes.award_nomination_id', '=', 'award_nominations.id')
            ->leftJoin('award_categories', 'award_nominations.category_id', '=', 'award_categories.id')
            ->leftJoin('awards', 'award_nominations.award_id', '=', 'awards.id')
            ->leftJoin('users', 'award_votes.user_id', '=', 'users.id')
            ->select(
                'award_votes.*',
                'award_categories.name as category_name',
                'awards.title as season_name',
                'awards.year',
                'users.name as voter_name',
                'award_nominations.nominee_name'
            );

        // Filter by season
        if ($request->filled('season')) {
            $query->where('awards.id', $request->season);
        }

        $votes = $query->orderBy('award_votes.voted_at', 'desc')
            ->paginate(25)
            ->appends($request->only(['season']));

        $seasons = DB::table('awards')->orderBy('year', 'desc')->get();

        return view('admin.awards.votes.index', compact('votes', 'seasons'));
    }

    public function voteAnalytics()
    {
        $analytics = [
            'total_votes' => DB::table('award_votes')->count(),
            'unique_voters' => DB::table('award_votes')->distinct('user_id')->count('user_id'),
            'votes_by_season' => DB::table('award_votes')
                ->leftJoin('awards', 'award_votes.award_season_id', '=', 'awards.id')
                ->select('awards.title as name', 'awards.year', DB::raw('count(*) as total'))
                ->groupBy('awards.id', 'awards.title', 'awards.year')
                ->orderBy('awards.year', 'desc')
                ->get(),
            'votes_by_category' => DB::table('award_votes')
                ->leftJoin('award_nominations', 'award_votes.award_nomination_id', '=', 'award_nominations.id')
                ->leftJoin('award_categories', 'award_nominations.category_id', '=', 'award_categories.id')
                ->select('award_categories.name', DB::raw('count(*) as total'))
                ->groupBy('award_categories.id', 'award_categories.name')
                ->orderBy('total', 'desc')
                ->limit(10)
                ->get(),
            'recent_votes' => DB::table('award_votes')
                ->leftJoin('users', 'award_votes.user_id', '=', 'users.id')
                ->leftJoin('award_nominations', 'award_votes.award_nomination_id', '=', 'award_nominations.id')
                ->select('award_votes.*', 'users.name as voter_name', 'award_nominations.nominee_name')
                ->orderBy('award_votes.voted_at', 'desc')
                ->limit(10)
                ->get(),
        ];

        return view('admin.awards.analytics', compact('analytics'));
    }

    public function deleteVote($id)
    {
        $vote = DB::table('award_votes')->find($id);
        if (!$vote) {
            abort(404);
        }

        DB::table('award_votes')->where('id', $id)->delete();

        return redirect()->back()
            ->with('success', 'Vote deleted successfully');
    }

    public function winners(Request $request)
    {
        $query = DB::table('award_nominations')
            ->leftJoin('award_categories', 'award_nominations.category_id', '=', 'award_categories.id')
            ->leftJoin('awards', 'award_nominations.award_id', '=', 'awards.id')
            ->where('award_nominations.status', 'winner')
            ->select(
                'award_nominations.*',
                'award_categories.name as category_name',
                'awards.title as season_name',
                'awards.year'
            );

        if ($request->filled('season')) {
            $query->where('award_nominations.award_id', $request->season);
        }

        $winners = $query->orderBy('awards.year', 'desc')
            ->orderBy('award_categories.sort_order')
            ->paginate(20)
            ->appends($request->only(['season']));

        $seasons = DB::table('awards')->orderBy('year', 'desc')->get();

        return view('admin.awards.winners.index', compact('winners', 'seasons'));
    }
}
