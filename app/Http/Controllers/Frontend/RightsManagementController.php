<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Song;
use App\Models\ISRCCode;
use App\Models\PublishingRights;
use App\Models\RoyaltySplit;
use App\Models\Artist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RightsManagementController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
    }

    public function index()
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist) {
            return redirect()->route('frontend.artist.setup')->with('warning', 'Please complete your artist profile first.');
        }

        // Get all songs with rights information
        $songs = Song::where('artist_id', $artist->id)
            ->with(['isrcCode', 'publishingRights', 'royaltySplits'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        // Rights statistics
        $stats = [
            'total_songs' => Song::where('artist_id', $artist->id)->count(),
            'songs_with_isrc' => Song::where('artist_id', $artist->id)->whereHas('isrcCode')->count(),
            'pending_rights' => PublishingRights::whereHas('song', function($q) use ($artist) {
                $q->where('artist_id', $artist->id);
            })->count(),
            'active_splits' => RoyaltySplit::whereHas('song', function($q) use ($artist) {
                $q->where('artist_id', $artist->id);
            })->where('is_verified', true)->count(),
            'pending_payouts' => 0, // Pending payouts feature not yet implemented
        ];

        return view('frontend.artist.rights.index', compact('songs', 'stats', 'artist'));
    }

    public function show(Song $song)
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist || $song->artist_id !== $artist->id) {
            abort(403);
        }

        $song->load(['isrcCode', 'publishingRights.owner', 'royaltySplits.recipient']);

        return view('frontend.artist.rights.show', compact('song', 'artist'));
    }

    public function generateISRC(Song $song)
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist || $song->artist_id !== $artist->id) {
            abort(403);
        }

        if ($song->isrcCode) {
            return back()->with('error', 'This song already has an ISRC code.');
        }

        try {
            $isrcCode = ISRCCode::generateForSong($song);

            return back()->with('success', "ISRC code {$isrcCode->formatted_isrc} generated successfully!");
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to generate ISRC code: ' . $e->getMessage());
        }
    }

    public function createPublishingRights(Song $song)
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist || $song->artist_id !== $artist->id) {
            abort(403);
        }

        $rightsTypes = [
            'mechanical' => 'Mechanical Rights',
            'performance' => 'Performance Rights',
            'synchronization' => 'Sync Rights',
            'print' => 'Print Rights',
            'digital' => 'Digital Rights',
        ];

        $territories = [
            'Uganda' => 'Uganda',
            'Kenya' => 'Kenya',
            'Tanzania' => 'Tanzania',
            'Rwanda' => 'Rwanda',
            'Global' => 'Worldwide',
        ];

        return view('frontend.artist.rights.create-publishing', compact('song', 'artist', 'rightsTypes', 'territories'));
    }

    public function storePublishingRights(Request $request, Song $song)
    {
        $request->validate([
            'rights_type' => 'required|in:mechanical,performance,synchronization,print,digital',
            'ownership_percentage' => 'required|numeric|min:0|max:100',
            'royalty_split_percentage' => 'required|numeric|min:0|max:100',
            'rights_holder_name' => 'required|string|max:255',
            'rights_holder_type' => 'required|string|max:255',
            'territorial_scope' => 'required|array|min:1',
            'exclusive_rights' => 'boolean',
            'rights_start_date' => 'required|date',
            'rights_end_date' => 'nullable|date|after:rights_start_date',
            'contract_reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist || $song->artist_id !== $artist->id) {
            abort(403);
        }

        // Check if ownership percentage is valid
        if (!PublishingRights::validateOwnershipPercentage(
            $song->id,
            $request->rights_type,
            $request->ownership_percentage
        )) {
            return back()->with('error', 'Total ownership percentage would exceed 100% for this rights type.')
                        ->withInput();
        }

        try {
            DB::beginTransaction();

            $publishingRights = PublishingRights::create([
                'song_id' => $song->id,
                'owner_id' => $user->id,
                'rights_type' => $request->rights_type,
                'ownership_percentage' => $request->ownership_percentage,
                'royalty_split_percentage' => $request->royalty_split_percentage,
                'rights_holder_name' => $request->rights_holder_name,
                'rights_holder_type' => $request->rights_holder_type,
                'territorial_scope' => $request->territorial_scope,
                'exclusive_rights' => $request->boolean('exclusive_rights'),
                'rights_start_date' => $request->rights_start_date,
                'rights_end_date' => $request->rights_end_date,
                'contract_reference' => $request->contract_reference,
                'notes' => $request->notes,
                'status' => 'active', // Auto-approve for artist's own rights
                'activated_at' => now(),
                'created_by_type' => 'artist',
                'created_by_id' => $user->id,
            ]);

            DB::commit();

            return redirect()->route('frontend.artist.rights.show', $song)
                ->with('success', 'Publishing rights created successfully!');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->with('error', 'Failed to create publishing rights: ' . $e->getMessage())
                        ->withInput();
        }
    }

    public function createRoyaltySplit(Song $song)
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist || $song->artist_id !== $artist->id) {
            abort(403);
        }

        $roles = [
            'songwriter' => 'Songwriter',
            'producer' => 'Producer',
            'feature' => 'Featured Artist',
            'mixer' => 'Mixing Engineer',
            'mastering' => 'Mastering Engineer',
            'composer' => 'Composer',
            'lyricist' => 'Lyricist',
            'publisher' => 'Publisher',
        ];

        $territories = [
            'Uganda' => 'Uganda',
            'Kenya' => 'Kenya',
            'Tanzania' => 'Tanzania',
            'Rwanda' => 'Rwanda',
            'Global' => 'Worldwide',
        ];

        $availablePercentage = RoyaltySplit::getAvailablePercentage($song->id);

        return view('frontend.artist.rights.create-split', compact('song', 'artist', 'roles', 'territories', 'availablePercentage'));
    }

    public function storeRoyaltySplit(Request $request, Song $song)
    {
        $request->validate([
            'recipient_name' => 'required|string|max:255',
            'recipient_email' => 'required|email|max:255',
            'recipient_phone' => 'nullable|string|max:20',
            'recipient_role' => 'required|string|max:255',
            'percentage' => 'required|numeric|min:0|max:100',
            'territorial_scope' => 'required|array|min:1',
            'applies_to_streaming' => 'boolean',
            'applies_to_downloads' => 'boolean',
            'applies_to_physical' => 'boolean',
            'applies_to_sync' => 'boolean',
            'applies_to_performance' => 'boolean',
            'applies_to_mechanical' => 'boolean',
            'effective_from' => 'required|date',
            'effective_until' => 'nullable|date|after:effective_from',
            'minimum_plays' => 'nullable|integer|min:0',
            'minimum_revenue' => 'nullable|numeric|min:0',
            'payout_frequency' => 'required|in:realtime,daily,weekly,monthly,quarterly',
            'minimum_payout_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist || $song->artist_id !== $artist->id) {
            abort(403);
        }

        // Check if percentage is valid
        if (!RoyaltySplit::validateTotalPercentage($song->id, $request->percentage)) {
            return back()->with('error', 'Total split percentages would exceed 100%.')
                        ->withInput();
        }

        try {
            DB::beginTransaction();

            $royaltySplit = RoyaltySplit::create([
                'song_id' => $song->id,
                'recipient_id' => null, // Will be linked when recipient creates account
                'recipient_role' => $request->recipient_role,
                'percentage' => $request->percentage,
                'split_type' => 'percentage',
                'applies_to_streaming' => $request->boolean('applies_to_streaming', true),
                'applies_to_downloads' => $request->boolean('applies_to_downloads', true),
                'applies_to_physical' => $request->boolean('applies_to_physical', true),
                'applies_to_sync' => $request->boolean('applies_to_sync', false),
                'applies_to_performance' => $request->boolean('applies_to_performance', true),
                'applies_to_mechanical' => $request->boolean('applies_to_mechanical', true),
                'territorial_scope' => $request->territorial_scope,
                'worldwide' => in_array('Global', $request->territorial_scope),
                'effective_from' => $request->effective_from,
                'effective_until' => $request->effective_until,
                'minimum_plays' => $request->minimum_plays ?? 0,
                'minimum_revenue' => $request->minimum_revenue ?? 0,
                'recipient_name' => $request->recipient_name,
                'recipient_email' => $request->recipient_email,
                'recipient_phone' => $request->recipient_phone,
                'payout_frequency' => $request->payout_frequency,
                'minimum_payout_amount' => $request->minimum_payout_amount,
                'auto_payout_enabled' => false, // Require approval
                'status' => 'pending_approval',
                'notes' => $request->notes,
            ]);

            DB::commit();

            return redirect()->route('frontend.artist.rights.show', $song)
                ->with('success', 'Royalty split created successfully and pending approval!');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->with('error', 'Failed to create royalty split: ' . $e->getMessage())
                        ->withInput();
        }
    }

    public function approveRoyaltySplit(RoyaltySplit $split)
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist || $split->song->artist_id !== $artist->id) {
            abort(403);
        }

        if (!$split->isPending()) {
            return back()->with('error', 'Only pending splits can be approved.');
        }

        $split->approve($user);

        return back()->with('success', 'Royalty split approved successfully!');
    }

    public function registerISRC(ISRCCode $isrcCode)
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist || $isrcCode->artist_id !== $artist->id) {
            abort(403);
        }

        if ($isrcCode->isRegistered()) {
            return back()->with('error', 'This ISRC code is already registered.');
        }

        try {
            // Simulate registration with Uganda Music Rights Organization
            $registrationReference = 'UMRO-' . date('Y') . '-' . str_pad($isrcCode->id, 6, '0', STR_PAD_LEFT);

            $isrcCode->markAsRegistered($registrationReference);

            return back()->with('success', "ISRC code registered successfully! Reference: {$registrationReference}");

        } catch (\Exception $e) {
            return back()->with('error', 'Failed to register ISRC code: ' . $e->getMessage());
        }
    }

    public function clearForDistribution(ISRCCode $isrcCode)
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist || $isrcCode->artist_id !== $artist->id) {
            abort(403);
        }

        if (!$isrcCode->isRegistered()) {
            return back()->with('error', 'ISRC code must be registered before clearing for distribution.');
        }

        if ($isrcCode->isClearedForDistribution()) {
            return back()->with('error', 'This song is already cleared for distribution.');
        }

        try {
            // Check if all rights are properly assigned
            $totalPublishingOwnership = PublishingRights::getTotalOwnership($isrcCode->song_id, 'mechanical');
            $totalRoyaltySplits = RoyaltySplit::getTotalSplitPercentage($isrcCode->song_id);

            if ($totalPublishingOwnership < 100) {
                return back()->with('error', 'Publishing rights ownership must total 100% before clearing for distribution.');
            }

            if ($totalRoyaltySplits < 100) {
                return back()->with('error', 'Royalty splits must total 100% before clearing for distribution.');
            }

            $isrcCode->clearForDistribution();

            return back()->with('success', 'Song cleared for distribution successfully!');

        } catch (\Exception $e) {
            return back()->with('error', 'Failed to clear for distribution: ' . $e->getMessage());
        }
    }

    public function payouts()
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist) {
            return redirect()->route('frontend.artist.setup');
        }

        // Get all royalty splits for this artist's songs
        $splits = RoyaltySplit::whereHas('song', function($q) use ($artist) {
            $q->where('artist_id', $artist->id);
        })
        ->with(['song', 'recipient'])
        ->where('pending_payout', '>', 0)
        ->orderBy('pending_payout', 'desc')
        ->paginate(20);

        $payoutStats = [
            'total_pending' => RoyaltySplit::whereHas('song', function($q) use ($artist) {
                $q->where('artist_id', $artist->id);
            })->sum('pending_payout'),
            'total_paid' => RoyaltySplit::whereHas('song', function($q) use ($artist) {
                $q->where('artist_id', $artist->id);
            })->sum('total_paid_out'),
            'due_for_payout' => RoyaltySplit::whereHas('song', function($q) use ($artist) {
                $q->where('artist_id', $artist->id);
            })->dueForPayout()->count(),
            'overdue_payouts' => RoyaltySplit::whereHas('song', function($q) use ($artist) {
                $q->where('artist_id', $artist->id);
            })->overduePayouts()->count(),
        ];

        return view('frontend.artist.rights.payouts', compact('splits', 'payoutStats', 'artist'));
    }
}