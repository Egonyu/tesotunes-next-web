<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Artist;
use App\Models\ArtistProfile;
use App\Models\ArtistRevenue;
use App\Models\ArtistPayout;
use App\Models\Song;
use App\Models\PlayHistory;
use App\Services\CreditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ArtistBusinessController extends Controller
{
    protected CreditService $creditService;

    public function __construct(CreditService $creditService)
    {
        $this->middleware(['auth', 'verified']);
        $this->creditService = $creditService;
    }

    public function dashboard()
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist) {
            return redirect()->route('frontend.artist.setup')->with('warning', 'Please complete your artist profile first.');
        }

        $profile = $artist->profile ?? $this->createDefaultProfile($artist);

        // Revenue Overview
        $revenueStats = $this->getRevenueStats($artist->id);
        $monthlyRevenue = $this->getMonthlyRevenue($artist->id);
        $topPerformingSongs = $this->getTopPerformingSongs($artist->id);
        $recentTransactions = $this->getRecentTransactions($artist->id);

        // Performance Metrics
        $performanceStats = $this->getPerformanceStats($artist->id);
        $fanDemographics = $this->getFanDemographics($artist->id);

        // Payout Information
        $payoutStats = $this->getPayoutStats($artist->id);
        $nextPayoutEligibility = $this->getNextPayoutEligibility($profile);

        return view('frontend.artist.business.dashboard', compact(
            'artist',
            'profile',
            'revenueStats',
            'monthlyRevenue',
            'topPerformingSongs',
            'recentTransactions',
            'performanceStats',
            'fanDemographics',
            'payoutStats',
            'nextPayoutEligibility'
        ));
    }

    public function analytics(Request $request)
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist) {
            return redirect()->route('frontend.artist.setup');
        }

        $period = $request->get('period', '30'); // days
        $startDate = now()->subDays((int)$period);

        // Detailed Analytics
        $detailedRevenue = $this->getDetailedRevenue($artist->id, $startDate);
        $platformBreakdown = $this->getPlatformBreakdown($artist->id, $startDate);
        $songPerformance = $this->getSongPerformance($artist->id, $startDate);
        $dailyTrends = $this->getDailyTrends($artist->id, $startDate);
        $listenerInsights = $this->getListenerInsights($artist->id, $startDate);

        return view('frontend.artist.business.analytics', compact(
            'artist',
            'period',
            'detailedRevenue',
            'platformBreakdown',
            'songPerformance',
            'dailyTrends',
            'listenerInsights'
        ));
    }

    public function payouts()
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist) {
            return redirect()->route('frontend.artist.setup');
        }

        $profile = $artist->profile;
        $payoutHistory = ArtistPayout::where('artist_id', $artist->id)
            ->orderBy('requested_at', 'desc')
            ->paginate(20);

        $pendingEarnings = $this->getPendingEarnings($artist->id);
        $eligibleForPayout = $this->checkPayoutEligibility($profile, $pendingEarnings);

        return view('frontend.artist.business.payouts', compact(
            'artist',
            'profile',
            'payoutHistory',
            'pendingEarnings',
            'eligibleForPayout'
        ));
    }

    public function requestPayout(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10',
            'payout_method' => 'required|in:mobile_money,bank_transfer,cash',
        ]);

        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();
        $profile = $artist->profile;

        if (!$profile->canReceiveMoneyPayouts()) {
            return back()->with('error', 'You are not eligible for money payouts yet.');
        }

        $pendingEarnings = $this->getPendingEarnings($artist->id);

        if ($request->amount > $pendingEarnings['total']) {
            return back()->with('error', 'Requested amount exceeds available earnings.');
        }

        if ($request->amount < $profile->minimum_payout) {
            return back()->with('error', "Minimum payout amount is {$profile->minimum_payout} UGX.");
        }

        // Create payout request
        $payout = ArtistPayout::create([
            'artist_id' => $artist->id,
            'payout_reference' => 'PAY-' . strtoupper(uniqid()),
            'total_amount' => $request->amount,
            'currency' => 'UGX',
            'payout_type' => 'credit_conversion',
            'period_start' => now()->subMonths(3),
            'period_end' => now(),
            'total_revenues_included' => $pendingEarnings['count'],
            'payout_method' => $request->payout_method,
            'recipient_name' => $profile->real_name ?? $profile->stage_name,
            'recipient_phone' => $profile->mobile_money_number,
            'recipient_account' => $request->payout_method === 'mobile_money'
                ? $profile->mobile_money_number
                : $profile->bank_account,
            'provider_name' => $request->payout_method === 'mobile_money'
                ? $profile->mobile_money_provider
                : $profile->bank_name,
            'net_amount_paid' => $request->amount,
            'kyc_verified' => $profile->isVerified(),
            'requested_at' => now(),
        ]);

        return redirect()->route('frontend.artist.payouts')
            ->with('success', "Payout request submitted successfully. Reference: {$payout->payout_reference}");
    }

    public function setup()
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist) {
            $artist = Artist::create([
                'user_id' => $user->id,
                'stage_name' => $user->name,
                'status' => 'approved',
                'can_upload' => true,
                'monthly_upload_limit' => 10
            ]);
        }

        $profile = $artist->profile ?? $this->createDefaultProfile($artist);

        return view('frontend.artist.business.setup', compact('artist', 'profile'));
    }

    public function saveSetup(Request $request)
    {
        $request->validate([
            'stage_name' => 'required|string|max:255',
            'real_name' => 'required|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'mobile_money_number' => 'required|string|max:15',
            'mobile_money_provider' => 'required|in:MTN,Airtel,Africell',
        ]);

        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist) {
            return redirect()->route('frontend.artist.setup')->with('error', 'Artist profile not found.');
        }

        $profile = $artist->profile ?? $this->createDefaultProfile($artist);

        $profile->update([
            'stage_name' => $request->stage_name,
            'real_name' => $request->real_name,
            'bio' => $request->bio,
            'mobile_money_number' => $request->mobile_money_number,
            'mobile_money_provider' => $request->mobile_money_provider,
            'profile_completed' => true,
        ]);

        return redirect()->route('frontend.artist.dashboard')
            ->with('success', 'Artist profile setup completed successfully!');
    }

    public function verification()
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist) {
            return redirect()->route('frontend.artist.setup')->with('warning', 'Please complete your artist profile first.');
        }

        $profile = $artist->profile ?? $this->createDefaultProfile($artist);

        return view('frontend.artist.business.verification', compact('artist', 'profile'));
    }

    public function submitVerification(Request $request)
    {
        $request->validate([
            'id_document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'id_type' => 'required|in:national_id,passport,driving_license',
            'id_number' => 'required|string|max:50',
            'proof_of_address' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist) {
            return redirect()->route('frontend.artist.setup')->with('error', 'Artist profile not found.');
        }

        $profile = $artist->profile ?? $this->createDefaultProfile($artist);

        // Store documents
        $idDocumentPath = $request->file('id_document')->store('artist_verification', 'private');
        $proofOfAddressPath = $request->hasFile('proof_of_address') 
            ? $request->file('proof_of_address')->store('artist_verification', 'private')
            : null;

        $profile->update([
            'id_document_path' => $idDocumentPath,
            'id_type' => $request->id_type,
            'id_number' => $request->id_number,
            'proof_of_address_path' => $proofOfAddressPath,
            'verification_status' => 'pending',
            'verification_submitted_at' => now(),
        ]);

        return redirect()->route('frontend.artist.business.verification')
            ->with('success', 'Verification documents submitted successfully! We will review them shortly.');
    }

    public function distribution()
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist) {
            return redirect()->route('frontend.artist.setup')->with('warning', 'Please complete your artist profile first.');
        }

        $profile = $artist->profile ?? $this->createDefaultProfile($artist);

        // Get distribution submissions
        $distributions = DB::table('distribution_submissions')
            ->where('artist_id', $artist->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $platforms = [
            'spotify' => 'Spotify',
            'apple_music' => 'Apple Music',
            'youtube_music' => 'YouTube Music',
            'deezer' => 'Deezer',
            'tidal' => 'Tidal',
            'amazon_music' => 'Amazon Music',
        ];

        return view('frontend.artist.business.distribution', compact('artist', 'profile', 'distributions', 'platforms'));
    }

    public function submitDistribution(Request $request)
    {
        $request->validate([
            'song_id' => 'required|exists:songs,id',
            'platforms' => 'required|array|min:1',
            'platforms.*' => 'in:spotify,apple_music,youtube_music,deezer,tidal,amazon_music',
            'release_date' => 'required|date',
        ]);

        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist) {
            return redirect()->route('frontend.artist.setup')->with('error', 'Artist profile not found.');
        }

        $song = Song::findOrFail($request->song_id);

        if ($song->artist_id !== $artist->id) {
            abort(403, 'Unauthorized access to this song.');
        }

        // Create distribution submissions
        foreach ($request->platforms as $platform) {
            DB::table('distribution_submissions')->insert([
                'artist_id' => $artist->id,
                'song_id' => $song->id,
                'platform' => $platform,
                'status' => 'pending',
                'release_date' => $request->release_date,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $song->update(['distribution_status' => 'submitted']);

        return redirect()->route('frontend.artist.business.distribution')
            ->with('success', 'Song submitted for distribution successfully!');
    }

    public function distributionDetails($distributionId)
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist) {
            return redirect()->route('frontend.artist.setup');
        }

        $distribution = DB::table('distribution_submissions')
            ->where('id', $distributionId)
            ->where('artist_id', $artist->id)
            ->first();

        if (!$distribution) {
            abort(404, 'Distribution not found.');
        }

        $song = Song::find($distribution->song_id);

        return view('frontend.artist.business.distribution-details', compact('artist', 'distribution', 'song'));
    }

    // Helper Methods

    private function createDefaultProfile(Artist $artist): ArtistProfile
    {
        return ArtistProfile::create([
            'user_id' => $artist->user_id,
            'artist_id' => $artist->id,
            'stage_name' => $artist->name,
            'career_stage' => 'emerging',
            'payout_method' => 'mobile_money',
            'minimum_payout' => 10000, // 10k UGX minimum
            'distribution_fee_percentage' => 15.00,
        ]);
    }

    private function getRevenueStats(int $artistId): array
    {
        $today = today();
        $thisMonth = now()->startOfMonth();
        $lastMonth = now()->subMonth()->startOfMonth();

        $totalEarnings = ArtistRevenue::forArtist($artistId)->sum('net_amount');
        $todayEarnings = ArtistRevenue::forArtist($artistId)->whereDate('revenue_date', today())->sum('net_amount');
        $thisMonthEarnings = ArtistRevenue::forArtist($artistId)->whereBetween('revenue_date', [$thisMonth, now()])->sum('net_amount');
        $lastMonthEarnings = ArtistRevenue::forArtist($artistId)->whereBetween('revenue_date', [$lastMonth, $thisMonth])->sum('net_amount');

        return [
            'total_earnings' => $totalEarnings,
            'today_earnings' => $todayEarnings,
            'this_month_earnings' => $thisMonthEarnings,
            'last_month_earnings' => $lastMonthEarnings,
            'month_growth' => $lastMonthEarnings > 0
                ? (($thisMonthEarnings - $lastMonthEarnings) / $lastMonthEarnings) * 100
                : 0,
            'total_transactions' => ArtistRevenue::forArtist($artistId)->count(),
        ];
    }

    private function getMonthlyRevenue(int $artistId): array
    {
        return ArtistRevenue::forArtist($artistId)
            ->selectRaw('DATE_FORMAT(revenue_date, "%Y-%m") as month, SUM(net_amount) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->limit(12)
            ->get()
            ->map(function ($item) {
                return [
                    'month' => Carbon::createFromFormat('Y-m', $item->month)->format('M Y'),
                    'total' => (float) $item->total
                ];
            })
            ->toArray();
    }

    private function getTopPerformingSongs(int $artistId): array
    {
        return ArtistRevenue::forArtist($artistId)
            ->selectRaw('revenue_source_id, SUM(net_amount) as total_revenue, COUNT(*) as stream_count')
            ->where('revenue_source_type', 'App\\Models\\Song')
            ->whereNotNull('revenue_source_id')
            ->groupBy('revenue_source_id')
            ->orderBy('total_revenue', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                $song = \App\Models\Song::find($item->revenue_source_id);
                return [
                    'song' => $song?->title ?? 'Unknown Song',
                    'revenue' => (float) $item->total_revenue,
                    'streams' => (int) $item->stream_count,
                    'revenue_per_stream' => $item->stream_count > 0 ? $item->total_revenue / $item->stream_count : 0
                ];
            })
            ->toArray();
    }

    private function getRecentTransactions(int $artistId): array
    {
        return ArtistRevenue::forArtist($artistId)
            ->orderBy('revenue_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($revenue) {
                $song = $revenue->revenue_source_type === 'App\\Models\\Song' 
                    ? \App\Models\Song::find($revenue->revenue_source_id)
                    : null;
                return [
                    'id' => $revenue->id,
                    'type' => $revenue->revenue_type_display,
                    'amount' => $revenue->formatted_amount,
                    'song' => $song?->title,
                    'date' => $revenue->revenue_date->diffForHumans(),
                    'status' => ucfirst($revenue->status)
                ];
            })
            ->toArray();
    }

    private function getPerformanceStats(int $artistId): array
    {
        $totalPlays = PlayHistory::whereHas('song', function ($query) use ($artistId) {
            $query->where('artist_id', $artistId);
        })->count();

        $uniqueListeners = PlayHistory::whereHas('song', function ($query) use ($artistId) {
            $query->where('artist_id', $artistId);
        })->distinct('user_id')->count('user_id');

        $avgCompletion = PlayHistory::whereHas('song', function ($query) use ($artistId) {
            $query->where('artist_id', $artistId);
        })->avg('completion_rate') ?? 0;

        return [
            'total_plays' => $totalPlays,
            'unique_listeners' => $uniqueListeners,
            'avg_completion_rate' => round($avgCompletion, 2),
            'songs_count' => Song::where('artist_id', $artistId)->count(),
        ];
    }

    private function getFanDemographics(int $artistId): array
    {
        // Simplified demographics - would be enhanced with real data
        return [
            'top_regions' => ['Kampala' => 45, 'Entebbe' => 20, 'Gulu' => 15, 'Mbarara' => 12, 'Other' => 8],
            'age_groups' => ['18-24' => 35, '25-34' => 40, '35-44' => 20, '45+' => 5],
            'listening_times' => ['Evening' => 40, 'Afternoon' => 25, 'Night' => 20, 'Morning' => 15],
        ];
    }

    private function getPayoutStats(int $artistId): array
    {
        $totalPaidOut = ArtistPayout::where('artist_id', $artistId)
            ->where('status', 'completed')
            ->sum('net_amount_paid');

        $pendingPayouts = ArtistPayout::where('artist_id', $artistId)
            ->whereIn('status', ['pending', 'processing'])
            ->sum('total_amount');

        $lastPayout = ArtistPayout::where('artist_id', $artistId)
            ->where('status', 'completed')
            ->latest('completed_at')
            ->first();

        return [
            'total_paid_out' => $totalPaidOut,
            'pending_payouts' => $pendingPayouts,
            'last_payout_amount' => $lastPayout?->net_amount_paid ?? 0,
            'last_payout_date' => $lastPayout?->completed_at?->diffForHumans(),
            'payouts_count' => ArtistPayout::where('artist_id', $artistId)->count(),
        ];
    }

    private function getPendingEarnings(int $artistId): array
    {
        $pending = ArtistRevenue::forArtist($artistId)
            ->where('status', 'processed')
            ->selectRaw('COUNT(*) as count, SUM(net_amount) as total')
            ->first();

        return [
            'total' => (float) ($pending->total ?? 0),
            'count' => (int) ($pending->count ?? 0),
        ];
    }

    private function checkPayoutEligibility(ArtistProfile $profile, array $pendingEarnings): bool
    {
        return $profile->canReceiveMoneyPayouts() &&
               $pendingEarnings['total'] >= $profile->minimum_payout;
    }

    private function getNextPayoutEligibility(ArtistProfile $profile): array
    {
        if ($profile->money_payout_enabled) {
            return [
                'eligible' => true,
                'message' => 'You can request payouts anytime.',
            ];
        }

        $creditsNeeded = 10000 - $profile->total_credits_earned;
        $moneyNeeded = 50000 - $profile->total_money_earned;

        if ($creditsNeeded <= 0 || $moneyNeeded <= 0) {
            return [
                'eligible' => true,
                'message' => 'You\'re now eligible for money payouts! Complete verification to unlock.',
            ];
        }

        return [
            'eligible' => false,
            'message' => "Earn " . number_format(min($creditsNeeded, $moneyNeeded)) . " more " .
                        ($creditsNeeded < $moneyNeeded ? 'credits' : 'UGX') . " to unlock money payouts.",
        ];
    }

    // Additional analytics methods would be implemented here...
    private function getDetailedRevenue(int $artistId, Carbon $startDate): array { return []; }
    private function getPlatformBreakdown(int $artistId, Carbon $startDate): array { return []; }
    private function getSongPerformance(int $artistId, Carbon $startDate): array { return []; }
    private function getDailyTrends(int $artistId, Carbon $startDate): array { return []; }
    private function getListenerInsights(int $artistId, Carbon $startDate): array { return []; }
}
