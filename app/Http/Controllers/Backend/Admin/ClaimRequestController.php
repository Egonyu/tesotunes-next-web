<?php

namespace App\Http\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClaimRequest;
use App\Models\Artist;
use App\Models\Song;
use App\Models\Album;
use App\Notifications\ClaimStatusChanged;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ClaimRequestController extends Controller
{
    /**
     * Display a listing of claim requests
     */
    public function index(Request $request)
    {
        $query = ClaimRequest::with(['claimant', 'originalUser', 'claimable', 'reviewer'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by claim type
        if ($request->filled('claim_type')) {
            $query->where('claim_type', $request->claim_type);
        }

        // Filter by priority
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        // Search by claimant name or reason
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('reason', 'LIKE', "%{$search}%")
                  ->orWhereHas('claimant', function($q) use ($search) {
                      $q->where('name', 'LIKE', "%{$search}%")
                        ->orWhere('email', 'LIKE', "%{$search}%");
                  });
            });
        }

        $claims = $query->paginate(20);

        // Get statistics
        $stats = [
            'pending' => ClaimRequest::where('status', 'pending')->count(),
            'under_review' => ClaimRequest::where('status', 'under_review')->count(),
            'approved' => ClaimRequest::where('status', 'approved')->count(),
            'rejected' => ClaimRequest::where('status', 'rejected')->count(),
            'total' => ClaimRequest::count(),
        ];

        return view('admin.claims.index', compact('claims', 'stats'));
    }

    /**
     * Display the specified claim request
     */
    public function show(ClaimRequest $claim)
    {
        $claim->load(['claimant', 'originalUser', 'claimable', 'reviewer']);

        return view('admin.claims.show', compact('claim'));
    }

    /**
     * Mark claim as under review
     */
    public function markUnderReview(ClaimRequest $claim)
    {
        $oldStatus = $claim->status;
        $claim->markAsUnderReview();

        // Send notification to claimant
        $claim->claimant->notify(new \App\Notifications\ClaimStatusChanged($claim, $oldStatus));

        return redirect()->back()->with('success', 'Claim request marked as under review.');
    }

    /**
     * Approve a claim request
     */
    public function approve(Request $request, ClaimRequest $claim)
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:1000',
            'transfer_notes' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();
        try {
            // Approve the claim
            $claim->approve(auth()->user(), $request->admin_notes);

            // Transfer ownership based on claim type
            $this->transferOwnership($claim, $request->transfer_notes);

            // Mark as transferred
            $claim->markAsTransferred($request->transfer_notes);

            DB::commit();

            // Send notification to claimant
            $claim->claimant->notify(new \App\Notifications\ClaimStatusChanged($claim, 'under_review'));

            return redirect()->route('admin.claims.show', $claim)
                ->with('success', 'Claim request approved and ownership transferred successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Failed to approve claim: ' . $e->getMessage());
        }
    }

    /**
     * Reject a claim request
     */
    public function reject(Request $request, ClaimRequest $claim)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $oldStatus = $claim->status;
        $claim->reject(auth()->user(), $request->rejection_reason);

        // Send notification to claimant
        $claim->claimant->notify(new \App\Notifications\ClaimStatusChanged($claim, $oldStatus));

        return redirect()->route('admin.claims.show', $claim)
            ->with('success', 'Claim request rejected.');
    }

    /**
     * Cancel a claim request
     */
    public function cancel(ClaimRequest $claim)
    {
        $claim->cancel();

        return redirect()->back()->with('success', 'Claim request cancelled.');
    }

    /**
     * Update priority of a claim request
     */
    public function updatePriority(Request $request, ClaimRequest $claim)
    {
        $request->validate([
            'priority' => 'required|in:low,normal,high,urgent',
        ]);

        $claim->update(['priority' => $request->priority]);

        return redirect()->back()->with('success', 'Priority updated successfully.');
    }

    /**
     * Toggle legal review requirement
     */
    public function toggleLegalReview(ClaimRequest $claim)
    {
        $claim->update([
            'requires_legal_review' => !$claim->requires_legal_review
        ]);

        $message = $claim->requires_legal_review 
            ? 'Legal review marked as required.' 
            : 'Legal review marked as not required.';

        return redirect()->back()->with('success', $message);
    }

    /**
     * Transfer ownership based on claim type
     */
    protected function transferOwnership(ClaimRequest $claim, ?string $notes = null)
    {
        $claimable = $claim->claimable;
        $newOwnerId = $claim->claimant_user_id;

        switch ($claim->claim_type) {
            case 'artist_profile':
                $this->transferArtistProfile($claimable, $newOwnerId, $claim, $notes);
                break;
            
            case 'song':
                $this->transferSong($claimable, $newOwnerId, $claim, $notes);
                break;
            
            case 'album':
                $this->transferAlbum($claimable, $newOwnerId, $claim, $notes);
                break;
        }
    }

    /**
     * Transfer artist profile ownership
     */
    protected function transferArtistProfile(Artist $artist, int $newOwnerId, ClaimRequest $claim, ?string $notes)
    {
        $originalUserId = $artist->user_id;
        
        // Update artist profile
        $artist->update([
            'user_id' => $newOwnerId,
            'is_claimable' => false,
            'claimed_at' => now(),
            'claimed_by_user_id' => $newOwnerId,
            'claim_notes' => $notes,
        ]);

        // Update user's artist_id
        \App\Models\User::where('id', $newOwnerId)->update(['artist_id' => $artist->id]);

        // Optionally transfer all songs and albums to the new owner
        $artist->songs()->update(['user_id' => $newOwnerId]);
        $artist->albums()->update(['user_id' => $newOwnerId]);

        // Send notification to claimant
        if ($claim->claimant) {
            $claim->claimant->notify(new ClaimStatusChanged($claim));
        }
        
        // Send notification to original owner if exists
        if ($originalUserId && $originalUserId !== $newOwnerId) {
            $originalOwner = \App\Models\User::find($originalUserId);
            if ($originalOwner) {
                $originalOwner->notify(new ClaimStatusChanged($claim));
            }
        }
    }

    /**
     * Transfer song ownership
     */
    protected function transferSong(Song $song, int $newOwnerId, ClaimRequest $claim, ?string $notes)
    {
        $originalUserId = $song->user_id;

        // Get or create artist profile for the new owner
        $newOwner = \App\Models\User::find($newOwnerId);
        $artistId = $newOwner->artist_id;

        if (!$artistId) {
            // Create artist profile if user doesn't have one
            $artist = Artist::create([
                'user_id' => $newOwnerId,
                'stage_name' => $newOwner->display_name ?? $newOwner->username,
                'slug' => \Illuminate\Support\Str::slug($newOwner->display_name ?? $newOwner->username),
                'bio' => 'Artist profile created via claim request',
                'status' => 'active',
                'can_upload' => true,
            ]);
            $artistId = $artist->id;
            $newOwner->update(['artist_id' => $artistId]);
        }

        // Transfer the song
        $song->update([
            'user_id' => $newOwnerId,
            'artist_id' => $artistId,
        ]);

        // Send notification to claimant
        if ($claim->claimant) {
            $claim->claimant->notify(new ClaimStatusChanged($claim));
        }
        
        // Send notification to original owner
        if ($originalUserId && $originalUserId !== $newOwnerId) {
            $originalOwner = \App\Models\User::find($originalUserId);
            if ($originalOwner) {
                $originalOwner->notify(new ClaimStatusChanged($claim));
            }
        }
    }

    /**
     * Transfer album ownership
     */
    protected function transferAlbum(Album $album, int $newOwnerId, ClaimRequest $claim, ?string $notes)
    {
        $originalUserId = $album->user_id;

        // Get or create artist profile for the new owner
        $newOwner = \App\Models\User::find($newOwnerId);
        $artistId = $newOwner->artist_id;

        if (!$artistId) {
            // Create artist profile if user doesn't have one
            $artist = Artist::create([
                'user_id' => $newOwnerId,
                'stage_name' => $newOwner->display_name ?? $newOwner->username,
                'slug' => \Illuminate\Support\Str::slug($newOwner->display_name ?? $newOwner->username),
                'bio' => 'Artist profile created via claim request',
                'status' => 'active',
                'can_upload' => true,
            ]);
            $artistId = $artist->id;
            $newOwner->update(['artist_id' => $artistId]);
        }

        // Transfer the album and all its songs
        $album->update([
            'user_id' => $newOwnerId,
            'artist_id' => $artistId,
        ]);

        $album->songs()->update([
            'user_id' => $newOwnerId,
            'artist_id' => $artistId,
        ]);

        // Send notification to claimant
        if ($claim->claimant) {
            $claim->claimant->notify(new ClaimStatusChanged($claim));
        }
        
        // Send notification to original owner
        if ($originalUserId && $originalUserId !== $newOwnerId) {
            $originalOwner = \App\Models\User::find($originalUserId);
            if ($originalOwner) {
                $originalOwner->notify(new ClaimStatusChanged($claim));
            }
        }
    }
}
