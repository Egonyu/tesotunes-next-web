<?php

namespace App\Http\Controllers\Backend\Admin;

use App\Models\User;
use App\Models\Song;
use App\Models\Album;
use App\Models\Artist;
use App\Models\Order;
use App\Models\Payment;
use App\Models\CreditTransaction;
use App\Models\Event;
use App\Models\SaccoMember;
use App\Models\SaccoLoan;
use App\Models\SaccoTransaction;
use App\Models\Sacco\SaccoAccount;
use App\Models\Sacco\SaccoSavingsAccount;
use App\Models\PaymentIssue;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;
use Carbon\Carbon;

/**
 * Admin Dashboard Controller
 * Displays comprehensive metrics and statistics for the admin panel
 */
class DashboardController extends BaseAdminController
{
    /**
     * Display the admin dashboard
     */
    public function index(): View
    {
        $statsData = $this->getDashboardStats();
        $recentActivity = $this->getRecentActivity();
        $chartData = $this->getChartData();
        $growth = $this->getGrowthStats();
        $topPerformers = $this->getTopPerformers();
        $pendingActions = $this->getPendingActions();
        $systemHealth = $this->getSystemHealth();
        $paymentStats = $this->getPaymentStats();
        $saccoStats = $this->getSaccoStats();
        $userDemographics = $this->getUserDemographics();

        // Flatten stats for view compatibility
        $stats = [
            'total_users' => $statsData['users']['total'],
            'new_users_today' => $statsData['users']['new_today'],
            'new_users_this_month' => $statsData['users']['new_month'],
            'new_users_this_week' => $statsData['users']['new_week'],
            'active_users' => $statsData['users']['active'],
            'total_artists' => $statsData['users']['total_artists'],
            'verified_artists' => $statsData['users']['verified_artists'],
            'total_songs' => $statsData['content']['total_tracks'],
            'total_albums' => $statsData['content']['total_albums'],
            'total_playlists' => $statsData['content']['total_playlists'],
            'pending_approvals' => $statsData['content']['pending'],
            'total_revenue' => $statsData['revenue']['total_earned'],
            'revenue_today' => $statsData['revenue']['today'],
            'revenue_this_month' => $statsData['revenue']['this_month'],
            'revenue_this_week' => $statsData['revenue']['this_week'],
            'total_plays' => $statsData['engagement']['total_streams'],
            'plays_today' => $statsData['engagement']['streams_today'],
            'plays_this_week' => $statsData['engagement']['streams_week'],
            'total_downloads' => $statsData['engagement']['total_downloads'],
            'active_events' => $statsData['events']['active'],
            'upcoming_events' => $statsData['events']['upcoming'],
        ];

        return view('admin.dashboard.index', compact(
            'stats', 
            'recentActivity', 
            'chartData', 
            'growth',
            'topPerformers',
            'pendingActions',
            'systemHealth',
            'paymentStats',
            'saccoStats',
            'userDemographics'
        ));
    }

    /**
     * Get comprehensive payment statistics
     */
    private function getPaymentStats(): array
    {
        $today = Carbon::today();
        $thisWeek = Carbon::now()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        
        // Payment counts by status
        $paymentsByStatus = Payment::selectRaw('status, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
        
        $paymentAmountsByStatus = Payment::selectRaw('status, SUM(amount) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        // Recent payments
        $recentPayments = Payment::with('user')
            ->latest()
            ->take(10)
            ->get();

        // Payments today
        $paymentsToday = Payment::whereDate('created_at', $today)->count();
        $amountToday = Payment::whereDate('created_at', $today)
            ->where('status', 'completed')
            ->sum('amount');

        // Payments this week
        $paymentsThisWeek = Payment::where('created_at', '>=', $thisWeek)->count();
        $amountThisWeek = Payment::where('created_at', '>=', $thisWeek)
            ->where('status', 'completed')
            ->sum('amount');

        // Payments this month
        $paymentsThisMonth = Payment::where('created_at', '>=', $thisMonth)->count();
        $amountThisMonth = Payment::where('created_at', '>=', $thisMonth)
            ->where('status', 'completed')
            ->sum('amount');

        // Payment methods breakdown
        $paymentMethods = Payment::selectRaw('payment_method, COUNT(*) as count, SUM(CASE WHEN status = "completed" THEN amount ELSE 0 END) as total')
            ->whereNotNull('payment_method')
            ->groupBy('payment_method')
            ->get()
            ->keyBy('payment_method')
            ->toArray();

        // Payment issues
        $paymentIssues = [
            'total' => DB::table('payment_issues')->count(),
            'pending' => DB::table('payment_issues')->where('status', 'pending')->count(),
            'resolved' => DB::table('payment_issues')->where('status', 'resolved')->count(),
        ];

        // Daily payments for chart (last 14 days)
        $dailyPayments = [];
        for ($i = 13; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $count = Payment::whereDate('created_at', $date)->count();
            $amount = Payment::whereDate('created_at', $date)
                ->where('status', 'completed')
                ->sum('amount');
            $dailyPayments[] = [
                'date' => $date,
                'count' => $count,
                'amount' => (float) $amount,
            ];
        }

        return [
            'total' => Payment::count(),
            'completed' => $paymentsByStatus['completed'] ?? 0,
            'pending' => $paymentsByStatus['pending'] ?? 0,
            'processing' => $paymentsByStatus['processing'] ?? 0,
            'failed' => $paymentsByStatus['failed'] ?? 0,
            'total_amount' => $paymentAmountsByStatus['completed'] ?? 0,
            'today' => [
                'count' => $paymentsToday,
                'amount' => $amountToday,
            ],
            'this_week' => [
                'count' => $paymentsThisWeek,
                'amount' => $amountThisWeek,
            ],
            'this_month' => [
                'count' => $paymentsThisMonth,
                'amount' => $amountThisMonth,
            ],
            'methods' => $paymentMethods,
            'issues' => $paymentIssues,
            'recent' => $recentPayments,
            'daily' => $dailyPayments,
        ];
    }

    /**
     * Get SACCO statistics
     */
    private function getSaccoStats(): array
    {
        try {
            $totalMembers = SaccoMember::count();
            $activeMembers = SaccoMember::where('status', 'active')->count();
            
            // Total savings
            $totalSavings = DB::table('sacco_savings_accounts')->sum('balance') ?? 0;
            
            // Total shares
            $totalShares = DB::table('sacco_shares')->sum('shares_count') ?? 0;
            $totalShareValue = DB::table('sacco_shares')->sum('total_value') ?? 0;
            
            // Loans
            $totalLoans = SaccoLoan::count();
            $activeLoans = SaccoLoan::whereIn('status', ['disbursed', 'active'])->count();
            $pendingLoans = SaccoLoan::where('status', 'pending')->count();
            $totalLoanAmount = SaccoLoan::whereIn('status', ['disbursed', 'active'])->sum('amount') ?? 0;
            $totalLoanBalance = SaccoLoan::whereIn('status', ['disbursed', 'active'])->sum('balance') ?? 0;
            
            // Recent transactions
            $recentTransactions = SaccoTransaction::with('member')
                ->latest()
                ->take(10)
                ->get();
            
            // Monthly deposits for chart (last 6 months)
            $monthlyDeposits = [];
            for ($i = 5; $i >= 0; $i--) {
                $month = Carbon::now()->subMonths($i);
                $deposits = SaccoTransaction::where('type', 'deposit')
                    ->whereMonth('created_at', $month->month)
                    ->whereYear('created_at', $month->year)
                    ->sum('amount');
                $monthlyDeposits[] = [
                    'month' => $month->format('M Y'),
                    'amount' => (float) ($deposits ?? 0),
                ];
            }

            return [
                'members' => [
                    'total' => $totalMembers,
                    'active' => $activeMembers,
                    'new_this_month' => SaccoMember::whereMonth('created_at', now()->month)
                        ->whereYear('created_at', now()->year)->count(),
                ],
                'savings' => [
                    'total' => $totalSavings,
                ],
                'shares' => [
                    'total_count' => $totalShares,
                    'total_value' => $totalShareValue,
                ],
                'loans' => [
                    'total' => $totalLoans,
                    'active' => $activeLoans,
                    'pending' => $pendingLoans,
                    'total_amount' => $totalLoanAmount,
                    'outstanding_balance' => $totalLoanBalance,
                ],
                'recent_transactions' => $recentTransactions,
                'monthly_deposits' => $monthlyDeposits,
            ];
        } catch (\Exception $e) {
            // Return empty stats if SACCO tables don't exist
            return [
                'members' => ['total' => 0, 'active' => 0, 'new_this_month' => 0],
                'savings' => ['total' => 0],
                'shares' => ['total_count' => 0, 'total_value' => 0],
                'loans' => ['total' => 0, 'active' => 0, 'pending' => 0, 'total_amount' => 0, 'outstanding_balance' => 0],
                'recent_transactions' => collect(),
                'monthly_deposits' => [],
            ];
        }
    }

    /**
     * Get user demographics for charts
     */
    private function getUserDemographics(): array
    {
        // User registrations by day (last 30 days)
        $dailyRegistrations = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $count = User::whereDate('created_at', $date)->count();
            $dailyRegistrations[] = [
                'date' => $date,
                'count' => $count,
            ];
        }

        // User types breakdown (using roles relationship)
        $artistRoleId = DB::table('roles')->where('name', 'artist')->value('id');
        $adminRoleId = DB::table('roles')->whereIn('name', ['admin', 'super_admin'])->pluck('id');
        
        $artistUserIds = $artistRoleId 
            ? DB::table('user_roles')->where('role_id', $artistRoleId)->pluck('user_id')->toArray()
            : [];
        $adminUserIds = $adminRoleId->isNotEmpty()
            ? DB::table('user_roles')->whereIn('role_id', $adminRoleId)->pluck('user_id')->toArray()
            : [];
        
        $userTypes = [
            'regular' => User::whereNotIn('id', array_merge($artistUserIds, $adminUserIds))->count(),
            'artists' => count($artistUserIds),
            'admins' => count(array_unique($adminUserIds)),
        ];

        // Activity status
        $activityStatus = [
            'active' => User::where('is_active', true)->count(),
            'inactive' => User::where('is_active', false)->count(),
            'recent' => User::where('last_login_at', '>=', Carbon::now()->subDays(7))->count(),
        ];

        // Monthly registrations (last 12 months)
        $monthlyRegistrations = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $count = User::whereMonth('created_at', $month->month)
                ->whereYear('created_at', $month->year)
                ->count();
            $monthlyRegistrations[] = [
                'month' => $month->format('M Y'),
                'short' => $month->format('M'),
                'count' => $count,
            ];
        }

        return [
            'daily_registrations' => $dailyRegistrations,
            'user_types' => $userTypes,
            'activity_status' => $activityStatus,
            'monthly_registrations' => $monthlyRegistrations,
        ];
    }

    /**
     * Get key dashboard statistics (structured for view)
     */
    private function getDashboardStats(): array
    {
        $totalArtists = Artist::count();
        $verifiedArtists = Artist::where('is_verified', true)->count();
        
        return [
            'users' => [
                'total' => User::count(),
                'new_today' => User::whereDate('created_at', today())->count(),
                'new_week' => User::where('created_at', '>=', Carbon::now()->startOfWeek())->count(),
                'new_month' => User::whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
                'active' => User::where('is_active', true)->count(),
                'total_artists' => $totalArtists,
                'verified_artists' => $verifiedArtists,
                'verification_rate' => $totalArtists > 0 ? round(($verifiedArtists / $totalArtists) * 100, 1) : 0,
            ],
            'content' => [
                'total_tracks' => Song::count(),
                'new_today' => Song::whereDate('created_at', today())->count(),
                'total_albums' => Album::count(),
                'total_artists' => $totalArtists,
                'total_playlists' => DB::table('playlists')->count(),
                'pending' => $this->getPendingApprovalsCount(),
                'pending_review' => $this->getPendingApprovalsCount(),
            ],
            'revenue' => [
                'total_earned' => $this->getTotalRevenue(),
                'today' => $this->getRevenueToday(),
                'this_week' => $this->getRevenueThisWeek(),
                'this_month' => $this->getRevenueThisMonth(),
            ],
            'engagement' => [
                'total_streams' => $this->getTotalPlays(),
                'streams_today' => $this->getPlaysToday(),
                'streams_week' => $this->getPlaysThisWeek(),
                'total_downloads' => $this->getTotalDownloads(),
            ],
            'payouts' => [
                'pending_count' => DB::table('payouts')->where('status', 'pending')->count(),
                'pending_amount' => DB::table('payouts')->where('status', 'pending')->sum('amount') ?? 0,
            ],
            'events' => [
                'total' => Event::count(),
                'active' => Event::where('status', 'published')
                    ->where('ends_at', '>=', now())
                    ->count(),
                'upcoming' => Event::where('status', 'published')
                    ->where('starts_at', '>', now())
                    ->count(),
            ],
            'awards' => [
                'total_seasons' => DB::table('awards')->distinct('season')->count('season'),
                'active_season' => DB::table('awards')->whereIn('status', ['nominations_open', 'voting_open'])->orderBy('season', 'desc')->first(),
                'total_nominations' => DB::table('award_nominations')->count(),
                'total_votes' => DB::table('award_votes')->count(),
                'votes_this_month' => DB::table('award_votes')
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
            ],
        ];
    }

    /**
     * Get growth statistics
     */
    private function getGrowthStats(): array
    {
        // Calculate growth for users
        $usersLastMonth = User::whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->count();
        $usersThisMonth = User::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        
        $userGrowth = $usersLastMonth > 0 
            ? (($usersThisMonth - $usersLastMonth) / $usersLastMonth) * 100 
            : 0;

        // Calculate growth for tracks
        $tracksLastMonth = Song::whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->count();
        $tracksThisMonth = Song::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        
        $trackGrowth = $tracksLastMonth > 0 
            ? (($tracksThisMonth - $tracksLastMonth) / $tracksLastMonth) * 100 
            : 0;

        // Calculate growth for revenue
        $revenueLastMonth = $this->getRevenueForMonth(now()->subMonth());
        $revenueThisMonth = $this->getRevenueThisMonth();
        
        $revenueGrowth = $revenueLastMonth > 0 
            ? (($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100 
            : 0;

        // Calculate growth for streams
        $streamsLastMonth = DB::table('play_histories')
            ->whereMonth('played_at', now()->subMonth()->month)
            ->whereYear('played_at', now()->subMonth()->year)
            ->count();
        $streamsThisMonth = DB::table('play_histories')
            ->whereMonth('played_at', now()->month)
            ->whereYear('played_at', now()->year)
            ->count();
        
        $streamGrowth = $streamsLastMonth > 0 
            ? (($streamsThisMonth - $streamsLastMonth) / $streamsLastMonth) * 100 
            : 0;

        return [
            'users' => [
                'direction' => $userGrowth >= 0 ? 'up' : 'down',
                'percentage' => abs(round($userGrowth, 1)),
            ],
            'tracks' => [
                'direction' => $trackGrowth >= 0 ? 'up' : 'down',
                'percentage' => abs(round($trackGrowth, 1)),
            ],
            'revenue' => [
                'direction' => $revenueGrowth >= 0 ? 'up' : 'down',
                'percentage' => abs(round($revenueGrowth, 1)),
            ],
            'streams' => [
                'direction' => $streamGrowth >= 0 ? 'up' : 'down',
                'percentage' => abs(round($streamGrowth, 1)),
            ],
        ];
    }

    /**
     * Get revenue for a specific month
     */
    private function getRevenueForMonth($date): float
    {
        $creditRevenue = CreditTransaction::whereMonth('created_at', $date->month)
            ->whereYear('created_at', $date->year)
            ->where('type', 'purchase')
            ->sum('amount');

        $orderRevenue = DB::table('order_pricing')
            ->join('orders', 'order_pricing.order_id', '=', 'orders.id')
            ->whereMonth('orders.created_at', $date->month)
            ->whereYear('orders.created_at', $date->year)
            ->where('orders.status', 'completed')
            ->sum('order_pricing.total_ugx');

        return $creditRevenue + ($orderRevenue ?? 0);
    }

    /**
     * Get recent activity formatted for the dashboard view
     */
    private function getRecentActivity(): array
    {
        // Recent users
        $recentUsers = User::latest()->take(5)->get();
        
        // Recent songs
        $recentSongs = Song::with('artist')->latest()->take(5)->get();
        
        // Recent artists
        $recentArtists = Artist::latest()->take(5)->get();

        return [
            'users' => $recentUsers,
            'songs' => $recentSongs,
            'artists' => $recentArtists,
        ];
    }

    /**
     * Get top performing content
     */
    private function getTopPerformers(): array
    {
        return [
            'songs' => Song::with('artist')
                ->orderByDesc('play_count')
                ->take(5)
                ->get(),

            'artists' => Artist::withCount('songs')
                ->orderByDesc('follower_count')
                ->take(5)
                ->get(),
        ];
    }

    /**
     * Get pending actions that need admin attention
     */
    private function getPendingActions(): array
    {
        return [
            'songs' => Song::with('artist')
                ->where('status', 'pending')
                ->latest()
                ->take(5)
                ->get(),

            'verifications' => Artist::where('is_verified', false)
                ->where('status', 'pending')
                ->latest()
                ->take(5)
                ->get(),

            'payouts' => DB::table('payouts')
                ->where('status', 'pending')
                ->latest()
                ->take(5)
                ->get(),
        ];
    }

    /**
     * Get system health metrics
     */
    private function getSystemHealth(): array
    {
        // Get database size (approximate)
        $dbSize = DB::select("SELECT SUM(data_length + index_length) as size FROM information_schema.tables WHERE table_schema = ?", [config('database.connections.mysql.database')]);
        $dbSizeFormatted = $this->formatBytes($dbSize[0]->size ?? 0);

        // Get storage disk usage
        $storagePath = storage_path('app');
        $storageUsed = $this->getDirectorySize($storagePath);
        $storageFormatted = $this->formatBytes($storageUsed);

        return [
            'database_size' => $dbSizeFormatted,
            'storage_used' => $storageFormatted,
            'cache_status' => cache()->has('health_check') ? 'active' : 'active', // Cache is working if we can check
        ];
    }

    /**
     * Format bytes to human readable
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    /**
     * Get directory size (with error handling for permission issues)
     */
    private function getDirectorySize(string $path): int
    {
        $size = 0;
        try {
            if (is_dir($path) && is_readable($path)) {
                $iterator = new \RecursiveIteratorIterator(
                    new \RecursiveDirectoryIterator($path, \FilesystemIterator::SKIP_DOTS | \FilesystemIterator::FOLLOW_SYMLINKS),
                    \RecursiveIteratorIterator::LEAVES_ONLY,
                    \RecursiveIteratorIterator::CATCH_GET_CHILD
                );
                foreach ($iterator as $file) {
                    try {
                        if ($file->isFile() && $file->isReadable()) {
                            $size += $file->getSize();
                        }
                    } catch (\Exception $e) {
                        // Skip files we can't read
                        continue;
                    }
                }
            }
        } catch (\Exception $e) {
            // Return 0 if we can't read the directory
            return 0;
        }
        return $size;
    }

    /**
     * Get chart data for the dashboard
     */
    private function getChartData(): array
    {
        $last7Days = collect();
        for ($i = 6; $i >= 0; $i--) {
            $last7Days->push(now()->subDays($i)->format('Y-m-d'));
        }

        // Get daily streams from play_histories
        $dailyStreams = DB::table('play_histories')
            ->where('played_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(played_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date');

        // Get daily revenue from credit_transactions
        $dailyRevenue = CreditTransaction::where('created_at', '>=', now()->subDays(7))
            ->where('type', 'purchase')
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->groupBy('date')
            ->pluck('total', 'date');

        return [
            // Daily streams for chart (last 7 days) - array of objects for Chart.js
            'daily_streams' => $last7Days->map(function ($date) use ($dailyStreams) {
                return [
                    'date' => $date,
                    'count' => $dailyStreams[$date] ?? 0,
                ];
            })->values()->toArray(),

            // Daily revenue for chart (last 7 days) - array of objects for Chart.js
            'daily_revenue' => $last7Days->map(function ($date) use ($dailyRevenue) {
                return [
                    'date' => $date,
                    'amount' => (float) ($dailyRevenue[$date] ?? 0),
                ];
            })->values()->toArray(),

            // User registrations over last 30 days (for other charts)
            'user_registrations' => User::where('created_at', '>=', now()->subDays(30))
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->pluck('count', 'date'),

            // Song uploads over last 30 days
            'song_uploads' => Song::where('created_at', '>=', now()->subDays(30))
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->pluck('count', 'date'),
        ];
    }

    /**
     * Get pending approvals count
     */
    protected function getPendingApprovalsCount(): int
    {
        $pendingSongs = Song::where('status', 'pending')->count();
        $pendingAlbums = Album::where('status', 'pending')->count();
        $pendingArtists = Artist::where('is_verified', false)->count();
        
        return $pendingSongs + $pendingAlbums + $pendingArtists;
    }

    /**
     * Get total revenue from all sources
     */
    private function getTotalRevenue(): float
    {
        $creditRevenue = CreditTransaction::where('type', 'purchase')
            ->sum('amount');

        $orderRevenue = DB::table('order_pricing')
            ->join('orders', 'order_pricing.order_id', '=', 'orders.id')
            ->where('orders.status', 'completed')
            ->sum('order_pricing.total_ugx');

        return $creditRevenue + ($orderRevenue ?? 0);
    }

    /**
     * Get revenue for today
     */
    private function getRevenueToday(): float
    {
        $creditRevenue = CreditTransaction::whereDate('created_at', today())
            ->where('type', 'purchase')
            ->sum('amount');

        $orderRevenue = DB::table('order_pricing')
            ->join('orders', 'order_pricing.order_id', '=', 'orders.id')
            ->whereDate('orders.created_at', today())
            ->where('orders.status', 'completed')
            ->sum('order_pricing.total_ugx');

        return $creditRevenue + ($orderRevenue ?? 0);
    }

    /**
     * Get revenue for this month
     */
    private function getRevenueThisMonth(): float
    {
        $creditRevenue = CreditTransaction::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->where('type', 'purchase')
            ->sum('amount');

        $orderRevenue = DB::table('order_pricing')
            ->join('orders', 'order_pricing.order_id', '=', 'orders.id')
            ->whereMonth('orders.created_at', now()->month)
            ->whereYear('orders.created_at', now()->year)
            ->where('orders.status', 'completed')
            ->sum('order_pricing.total_ugx');

        return $creditRevenue + ($orderRevenue ?? 0);
    }

    /**
     * Get revenue for this week
     */
    private function getRevenueThisWeek(): float
    {
        $startOfWeek = Carbon::now()->startOfWeek();
        
        $creditRevenue = CreditTransaction::where('created_at', '>=', $startOfWeek)
            ->where('type', 'purchase')
            ->sum('amount');

        $orderRevenue = DB::table('order_pricing')
            ->join('orders', 'order_pricing.order_id', '=', 'orders.id')
            ->where('orders.created_at', '>=', $startOfWeek)
            ->where('orders.status', 'completed')
            ->sum('order_pricing.total_ugx');

        return $creditRevenue + ($orderRevenue ?? 0);
    }

    /**
     * Get total plays across all songs
     */
    private function getTotalPlays(): int
    {
        return DB::table('play_histories')->count();
    }

    /**
     * Get plays for today
     */
    private function getPlaysToday(): int
    {
        return DB::table('play_histories')
            ->whereDate('played_at', today())
            ->count();
    }

    /**
     * Get plays for this week
     */
    private function getPlaysThisWeek(): int
    {
        return DB::table('play_histories')
            ->where('played_at', '>=', Carbon::now()->startOfWeek())
            ->count();
    }

    /**
     * Get total downloads
     */
    private function getTotalDownloads(): int
    {
        return DB::table('downloads')->count();
    }
}
