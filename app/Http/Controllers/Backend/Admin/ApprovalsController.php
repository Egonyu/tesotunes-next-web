<?php

namespace App\Http\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Unified Approvals Dashboard Controller
 *
 * Centralized controller for managing all pending approvals across the platform
 * - Artist verification requests
 * - Store creation requests
 * - SACCO membership requests
 */
class ApprovalsController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:admin,super_admin,moderator']);
    }

    /**
     * Display unified approvals dashboard
     */
    public function index(Request $request)
    {
        $filter = $request->get('filter', 'all'); // all, artists, stores, sacco
        $status = $request->get('status', 'pending');

        $approvals = collect();

        // Artist Applications
        // Use the artists table which has proper status tracking
        if ($filter === 'all' || $filter === 'artists') {
            $artistApplications = \App\Models\Artist::where('status', 'pending')
                ->with(['user'])
                ->get()
                ->map(function ($artist) {
                    return [
                        'id' => $artist->id,
                        'type' => 'artist_verification',
                        'title' => 'Artist Registration: ' . $artist->stage_name,
                        'subtitle' => $artist->user->email ?? 'No email',
                        'submitted_at' => $artist->application_submitted_at ?? $artist->created_at,
                        'status' => $artist->status,
                        'priority' => 'high',
                        'user' => $artist->user,
                        'artist' => $artist,
                        'action_url' => route('admin.users.show', $artist->user_id),
                        'approve_url' => route('admin.artists.approve', $artist->id),
                        'reject_url' => route('admin.artists.reject', $artist->id),
                    ];
                });

            $approvals = $approvals->concat($artistApplications);
        }

        // Store Applications (if store module enabled)
        if ((config('store.enabled', false)) && ($filter === 'all' || $filter === 'stores')) {
            $storeApplications = \App\Modules\Store\Models\Store::where('status', $status)
                ->with(['owner'])
                ->get()
                ->map(function ($store) {
                    return [
                        'id' => $store->id,
                        'type' => 'store_approval',
                        'title' => 'Store Registration: ' . $store->name,
                        'subtitle' => 'Owner: ' . $store->owner->name,
                        'submitted_at' => $store->created_at,
                        'status' => $store->status,
                        'priority' => 'medium',
                        'store' => $store,
                        'action_url' => route('admin.store.show', $store),
                        'approve_url' => route('admin.store.approve', $store),
                        'reject_url' => route('admin.store.suspend', $store),
                    ];
                });

            $approvals = $approvals->concat($storeApplications);
        }

        // SACCO Member Applications (if sacco module enabled)
        if ((config('sacco.enabled', false)) && ($filter === 'all' || $filter === 'sacco')) {
            $saccoApplications = \App\Models\SaccoMember::where('status', $status)
                ->with(['user'])
                ->get()
                ->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'type' => 'sacco_membership',
                        'title' => 'SACCO Membership: ' . $member->user->name,
                        'subtitle' => 'Application for membership',
                        'submitted_at' => $member->created_at,
                        'status' => $member->status,
                        'priority' => 'low',
                        'member' => $member,
                        'action_url' => route('admin.sacco.members.show', $member),
                        'approve_url' => route('admin.sacco.members.approve', $member),
                        'reject_url' => route('admin.sacco.members.reject', $member),
                    ];
                });

            $approvals = $approvals->concat($saccoApplications);
        }

        // Sort by priority and submission date
        $approvals = $approvals->sortBy([
            ['priority', 'asc'], // high, medium, low
            ['submitted_at', 'desc'] // newest first within priority
        ]);

        // Get summary stats
        $stats = $this->getApprovalStats();

        return view('admin.approvals.index', compact('approvals', 'stats', 'filter', 'status'));
    }

    /**
     * Get approval statistics for dashboard
     */
    private function getApprovalStats()
    {
        $stats = [
            'total_pending' => 0,
            'artists' => [
                'pending' => \App\Models\Artist::where('status', 'pending')->count(),
                'approved' => \App\Models\Artist::where('status', 'active')->count(),
                'rejected' => \App\Models\Artist::where('status', 'rejected')->count(),
            ],
            'stores' => [
                'pending' => 0,
                'approved' => 0,
                'rejected' => 0,
            ],
            'sacco' => [
                'pending' => 0,
                'approved' => 0,
                'rejected' => 0,
            ],
        ];

        // Store stats (if enabled)
        if (config('store.enabled', false)) {
            $stats['stores'] = [
                'pending' => \App\Modules\Store\Models\Store::where('status', 'pending')->count(),
                'approved' => \App\Modules\Store\Models\Store::where('status', 'approved')->count(),
                'rejected' => \App\Modules\Store\Models\Store::where('status', 'suspended')->count(),
            ];
        }

        // SACCO stats (if enabled)
        if (config('sacco.enabled', false)) {
            $stats['sacco'] = [
                'pending' => \App\Models\SaccoMember::where('status', 'pending')->count(),
                'approved' => \App\Models\SaccoMember::where('status', 'approved')->count(),
                'rejected' => \App\Models\SaccoMember::where('status', 'rejected')->count(),
            ];
        }

        $stats['total_pending'] = $stats['artists']['pending'] + $stats['stores']['pending'] + $stats['sacco']['pending'];

        return $stats;
    }

    /**
     * Bulk approve multiple items
     */
    public function bulkApprove(Request $request)
    {
        $request->validate([
            'approvals' => 'required|array',
            'approvals.*.type' => 'required|in:artist_verification,store_approval,sacco_membership',
            'approvals.*.id' => 'required|integer',
        ]);

        $results = ['success' => 0, 'failed' => 0, 'errors' => []];

        foreach ($request->approvals as $approval) {
            try {
                switch ($approval['type']) {
                    case 'artist_verification':
                        $user = User::findOrFail($approval['id']);
                        $user->update(['status' => 'approved', 'verified_at' => now(), 'verified_by' => auth()->id()]);
                        $results['success']++;
                        break;

                    case 'store_approval':
                        if (config('store.enabled', false)) {
                            $store = \App\Modules\Store\Models\Store::findOrFail($approval['id']);
                            $store->update(['status' => 'approved']);
                            $results['success']++;
                        }
                        break;

                    case 'sacco_membership':
                        if (config('sacco.enabled', false)) {
                            $member = \App\Models\SaccoMember::findOrFail($approval['id']);
                            $member->update(['status' => 'approved']);
                            $results['success']++;
                        }
                        break;
                }
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = "Failed to approve {$approval['type']} ID {$approval['id']}: " . $e->getMessage();
            }
        }

        return response()->json($results);
    }

    /**
     * Get pending approvals count for header notification
     */
    public function getPendingCount()
    {
        $stats = $this->getApprovalStats();
        return response()->json(['count' => $stats['total_pending']]);
    }
}