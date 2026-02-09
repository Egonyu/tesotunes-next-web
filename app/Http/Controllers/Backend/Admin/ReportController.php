<?php

namespace App\Http\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Song;
use App\Models\Artist;
use App\Modules\Store\Models\Order;
use App\Models\Transaction;
use App\Models\PromotionCampaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index()
    {
        $stats = [
            'total_users' => User::count(),
            'total_songs' => Song::count(),
            'total_revenue' => Order::where('status', 'completed')->count() * 50000, // Estimated
            'total_promotions' => PromotionCampaign::count(),
        ];

        $recentActivity = [
            'new_users_today' => User::whereDate('created_at', today())->count(),
            'songs_uploaded_today' => Song::whereDate('created_at', today())->count(),
            'revenue_today' => Order::where('status', 'completed')->whereDate('created_at', today())->count() * 50000,
        ];

        return view('admin.reports.index', compact('stats', 'recentActivity'));
    }

    public function users(Request $request)
    {
        $period = $request->get('period', '30d');
        $days = match($period) {
            '7d' => 7,
            '30d' => 30,
            '90d' => 90,
            '365d' => 365,
            default => 30
        };

        $dateFrom = now()->subDays($days);

        $stats = [
            'total_users' => User::count(),
            'new_users' => User::where('created_at', '>=', $dateFrom)->count(),
            'active_users' => User::where('is_active', true)->count(),
            'verified_users' => User::whereNotNull('email_verified_at')->count(),
            'artists' => Artist::count(),
        ];

        $userGrowth = User::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', $dateFrom)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $topUsers = User::withCount('orders')
            ->orderBy('orders_count', 'desc')
            ->limit(10)
            ->get();

        return view('admin.reports.users', compact('stats', 'userGrowth', 'topUsers', 'period'));
    }

    public function music(Request $request)
    {
        $period = $request->get('period', '30d');
        $days = match($period) {
            '7d' => 7,
            '30d' => 30,
            '90d' => 90,
            '365d' => 365,
            default => 30
        };

        $dateFrom = now()->subDays($days);

        $stats = [
            'total_songs' => Song::count(),
            'published_songs' => Song::where('status', 'published')->count(),
            'pending_songs' => Song::where('status', 'pending_review')->count(),
            'total_artists' => Artist::count(),
            'total_plays' => Song::sum('play_count'),
            'total_downloads' => Song::sum('download_count'),
        ];

        $songsByGenre = DB::table('songs')
            ->join('genre_song', 'songs.id', '=', 'genre_song.song_id')
            ->join('genres', 'genre_song.genre_id', '=', 'genres.id')
            ->select('genres.name', DB::raw('COUNT(songs.id) as count'))
            ->where('songs.status', 'published')
            ->groupBy('genres.id', 'genres.name')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        $topSongs = Song::withCount('plays')
            ->with('artist')
            ->orderBy('play_count', 'desc')
            ->limit(10)
            ->get();

        $topArtists = Artist::withCount('songs')
            ->orderBy('songs_count', 'desc')
            ->limit(10)
            ->get();

        return view('admin.reports.music', compact('stats', 'songsByGenre', 'topSongs', 'topArtists', 'period'));
    }

    public function credits(Request $request)
    {
        $period = $request->get('period', '30d');
        $days = match($period) {
            '7d' => 7,
            '30d' => 30,
            '90d' => 90,
            '365d' => 365,
            default => 30
        };

        $dateFrom = now()->subDays($days);

        $stats = [
            'total_transactions' => Transaction::count(),
            'total_credits_purchased' => Transaction::where('type', 'credit_purchase')->sum('amount'),
            'total_credits_spent' => Transaction::where('type', 'credit_spent')->sum('amount'),
            'revenue_from_credits' => Transaction::where('type', 'credit_purchase')->where('created_at', '>=', $dateFrom)->sum('amount'),
        ];

        $creditTransactions = Transaction::with('user')
            ->where('created_at', '>=', $dateFrom)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        $topBuyers = User::withSum(['transactions as credits_purchased' => function($query) use ($dateFrom) {
            $query->where('type', 'credit_purchase')->where('created_at', '>=', $dateFrom);
        }], 'amount')
            ->orderBy('credits_purchased', 'desc')
            ->limit(10)
            ->get();

        return view('admin.reports.credits', compact('stats', 'creditTransactions', 'topBuyers', 'period'));
    }

    public function promotions(Request $request)
    {
        $period = $request->get('period', '30d');
        $days = match($period) {
            '7d' => 7,
            '30d' => 30,
            '90d' => 90,
            '365d' => 365,
            default => 30
        };

        $dateFrom = now()->subDays($days);

        $stats = [
            'total_promotions' => PromotionCampaign::count(),
            'active_promotions' => PromotionCampaign::where('status', 'active')
                ->where('starts_at', '<=', now())
                ->where('ends_at', '>=', now())
                ->count(),
            'expired_promotions' => PromotionCampaign::where('ends_at', '<', now())->count(),
            'revenue_from_promotions' => 0, // Calculated separately if needed
        ];

        $topPromotions = PromotionCampaign::orderBy('usage_count', 'desc')
            ->limit(10)
            ->get();

        $recentPromotions = PromotionCampaign::with('creator')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return view('admin.reports.promotions', compact('stats', 'topPromotions', 'recentPromotions', 'period'));
    }

    public function export($type, Request $request)
    {
        $period = $request->get('period', '30d');
        $days = match($period) {
            '7d' => 7,
            '30d' => 30,
            '90d' => 90,
            '365d' => 365,
            default => 30
        };

        $dateFrom = now()->subDays($days);
        $filename = $type . '_report_' . now()->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($type, $dateFrom) {
            $file = fopen('php://output', 'w');

            switch ($type) {
                case 'users':
                    fputcsv($file, ['ID', 'Name', 'Email', 'Role', 'Registered', 'Status']);
                    User::with('roles')->where('created_at', '>=', $dateFrom)->chunk(100, function($users) use ($file) {
                        foreach ($users as $user) {
                            $role = $user->roles->pluck('display_name')->join(', ') ?: 'User';
                            fputcsv($file, [
                                $user->id,
                                $user->name,
                                $user->email,
                                $role,
                                $user->created_at,
                                $user->is_active ? 'Active' : 'Inactive'
                            ]);
                        }
                    });
                    break;

                case 'music':
                    fputcsv($file, ['ID', 'Title', 'Artist', 'Plays', 'Downloads', 'Status', 'Created']);
                    Song::with('artist')->where('created_at', '>=', $dateFrom)->chunk(100, function($songs) use ($file) {
                        foreach ($songs as $song) {
                            fputcsv($file, [
                                $song->id,
                                $song->title,
                                $song->artist->stage_name ?? 'N/A',
                                $song->play_count,
                                $song->download_count,
                                $song->status,
                                $song->created_at
                            ]);
                        }
                    });
                    break;

                case 'credits':
                    fputcsv($file, ['ID', 'User', 'Type', 'Amount', 'Status', 'Date']);
                    Transaction::with('user')->where('created_at', '>=', $dateFrom)->chunk(100, function($transactions) use ($file) {
                        foreach ($transactions as $transaction) {
                            fputcsv($file, [
                                $transaction->id,
                                $transaction->user->name ?? 'N/A',
                                $transaction->type,
                                $transaction->amount,
                                $transaction->status,
                                $transaction->created_at
                            ]);
                        }
                    });
                    break;

                case 'promotions':
                    fputcsv($file, ['ID', 'Title', 'Code', 'Discount', 'Status', 'Orders', 'Created']);
                    Promotion::withCount('orders')->where('created_at', '>=', $dateFrom)->chunk(100, function($promotions) use ($file) {
                        foreach ($promotions as $promotion) {
                            fputcsv($file, [
                                $promotion->id,
                                $promotion->title,
                                $promotion->code,
                                $promotion->discount_value . ($promotion->discount_type == 'percentage' ? '%' : ' UGX'),
                                $promotion->status,
                                $promotion->orders_count,
                                $promotion->created_at
                            ]);
                        }
                    });
                    break;
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}