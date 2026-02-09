<?php

namespace App\Http\Controllers\Backend\Podcast;

use App\Http\Controllers\Controller;
use App\Models\Podcast;
use App\Models\PodcastCategory;
use App\Notifications\PodcastStatusNotification;
use App\Services\Podcast\RssFeedService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminPodcastController extends Controller
{
    protected $rssFeedService;

    public function __construct(RssFeedService $rssFeedService)
    {
        $this->rssFeedService = $rssFeedService;
    }

    /**
     * Display a listing of all podcasts.
     */
    public function index(Request $request)
    {
        $query = Podcast::with(['user', 'category'])
            ->withCount('episodes');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $podcasts = $query->paginate(20);

        $stats = [
            'total' => Podcast::count(),
            'draft' => Podcast::where('status', 'draft')->count(),
            'pending' => Podcast::where('status', 'pending')->count(),
            'published' => Podcast::where('status', 'published')->count(),
            'suspended' => Podcast::where('status', 'suspended')->count(),
        ];

        return view('backend.podcast.index', compact('podcasts', 'stats'));
    }

    /**
     * Show podcasts pending review.
     */
    public function pendingReview()
    {
        $podcasts = Podcast::with(['user', 'category'])
            ->where('status', 'pending')
            ->withCount('episodes')
            ->latest()
            ->paginate(20);

        return view('backend.podcast.pending', compact('podcasts'));
    }

    /**
     * Display the specified podcast.
     */
    public function show(Podcast $podcast)
    {
        $podcast->load(['user', 'category', 'episodes' => function ($query) {
            $query->latest()->limit(10);
        }]);

        return view('backend.podcast.show', compact('podcast'));
    }

    /**
     * Approve a podcast.
     */
    public function approve(Podcast $podcast)
    {
        $podcast->update([
            'status' => 'published',
            'created_at' => now(),
        ]);

        // Clear RSS cache
        $this->rssFeedService->clearCache($podcast);

        // Notify owner
        if ($podcast->user) {
            $podcast->user->notify(new PodcastStatusNotification($podcast, 'published'));
        }

        return redirect()->back()->with('success', 'Podcast approved successfully.');
    }

    /**
     * Reject a podcast.
     */
    public function reject(Request $request, Podcast $podcast)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $podcast->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason,
        ]);

        // Notify owner with rejection reason
        if ($podcast->user) {
            $podcast->user->notify(new PodcastStatusNotification($podcast, 'rejected', $request->reason));
        }

        return redirect()->back()->with('success', 'Podcast rejected.');
    }

    /**
     * Suspend a podcast.
     */
    public function suspend(Request $request, Podcast $podcast)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $podcast->update([
            'status' => 'suspended',
            'suspension_reason' => $request->reason,
        ]);

        // Clear RSS cache
        $this->rssFeedService->clearCache($podcast);

        return redirect()->back()->with('success', 'Podcast suspended.');
    }

    /**
     * Restore a suspended podcast.
     */
    public function restore(Podcast $podcast)
    {
        $podcast->update([
            'status' => 'published',
            'suspension_reason' => null,
        ]);

        // Clear RSS cache
        $this->rssFeedService->clearCache($podcast);

        return redirect()->back()->with('success', 'Podcast restored.');
    }

    /**
     * Remove the specified podcast from storage.
     */
    public function destroy(Podcast $podcast)
    {
        // Delete associated files
        if ($podcast->cover_image) {
            Storage::delete($podcast->cover_image);
        }

        // Delete episodes and their files
        foreach ($podcast->episodes as $episode) {
            if ($episode->audio_file_original) {
                Storage::delete($episode->audio_file_original);
            }
            $episode->delete();
        }

        // Delete podcast
        $podcast->delete();

        return redirect()->route('admin.podcasts.index')
            ->with('success', 'Podcast deleted successfully.');
    }

    /**
     * Show form to import podcast from external RSS feed.
     */
    public function importForm()
    {
        return view('backend.podcast.import');
    }

    /**
     * Import podcast from external RSS feed.
     */
    public function importFromRss(Request $request)
    {
        $request->validate([
            'rss_url' => 'required|url',
            'user_id' => 'required|exists:users,id',
        ]);

        try {
            $owner = \App\Models\User::findOrFail($request->user_id);
            $podcast = $this->rssFeedService->importFromUrl($request->rss_url, $owner);

            return redirect()->route('admin.podcasts.show', $podcast)
                ->with('success', "Podcast '{$podcast->title}' imported successfully with {$podcast->episodes->count()} episodes. Review and publish when ready.");
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to import podcast: ' . $e->getMessage());
        }
    }
}
