<?php

namespace App\Http\Controllers\Frontend\Artist;

use App\Http\Controllers\Controller;
use App\Models\Artist;
use App\Models\ArtistRevenue;
use App\Models\CreditTransaction;
use App\Models\Song;
use App\Models\PlayHistory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist) {
            return redirect()->route('frontend.artist.setup')->with('warning', 'Please complete your artist profile first.');
        }

        // Date ranges for analytics
        $today = Carbon::today();
        $lastWeek = Carbon::now()->subWeek();
        $lastMonth = Carbon::now()->subMonth();
        $last3Months = Carbon::now()->subMonths(3);

        // Calculate streaming revenue from plays
        $totalPlays = Song::where('artist_id', $artist->id)->sum('play_count');
        
        // Streaming revenue calculation: 
        // Premium streams: UGX 15 * 70% = UGX 10.5 per stream
        // Free streams: UGX 5 * 70% = UGX 3.5 per stream
        // Average: UGX 7 per stream (assuming 50/50 split)
        $avgRevenuePerStream = 7; // UGX
        $estimatedStreamingRevenue = $totalPlays * $avgRevenuePerStream;
        
        // Get actual revenue from artist_revenues table
        $actualRevenue = ArtistRevenue::where('artist_id', $artist->id)
            ->where('revenue_type', 'stream')
            ->sum('net_amount');
        
        // Use actual revenue if available, otherwise estimate
        $streamingRevenueUGX = $actualRevenue > 0 ? $actualRevenue : $estimatedStreamingRevenue;

        // Overview Stats
        $stats = [
            'total_songs' => Song::where('artist_id', $artist->id)->count(),
            'total_plays' => $totalPlays,
            'total_revenue' => Song::where('artist_id', $artist->id)->sum('total_revenue'),
            'streaming_revenue_ugx' => $streamingRevenueUGX,
            'wallet_balance' => $user->ugx_balance ?? 0,
            'followers' => DB::table('user_follows')
                ->where('following_id', $artist->user_id)
                ->where('following_type', 'artist')
                ->count(),

            // This week vs last week
            'plays_this_week' => PlayHistory::whereIn('song_id',
                Song::where('artist_id', $artist->id)->pluck('id')
            )->where('played_at', '>=', $lastWeek)->count(),

            'plays_last_week' => PlayHistory::whereIn('song_id',
                Song::where('artist_id', $artist->id)->pluck('id')
            )->whereBetween('played_at', [$lastMonth, $lastWeek])->count(),
            
            // Revenue this month (using revenue_date column)
            'revenue_this_month' => ArtistRevenue::where('artist_id', $artist->id)
                ->whereMonth('revenue_date', now()->month)
                ->whereYear('revenue_date', now()->year)
                ->sum('net_amount'),
        ];

        // Recent earnings transactions
        $recentEarnings = CreditTransaction::where('user_id', $user->id)
            ->where('type', 'stream')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Top performing songs
        $topSongs = Song::where('artist_id', $artist->id)
            ->with('genres')
            ->orderBy('play_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($song) use ($avgRevenuePerStream) {
                return [
                    'id' => $song->id,
                    'title' => $song->title,
                    'play_count' => $song->play_count,
                    'revenue' => $song->revenue_generated ?? 0,
                    'revenue_ugx' => $song->play_count * $avgRevenuePerStream,
                    'genre' => $song->genres->first()?->name ?? 'Unknown',
                    'artwork' => $song->artwork_url,
                ];
            });

        // Play history for charts (last 30 days)
        $playHistoryData = PlayHistory::whereIn('song_id',
                Song::where('artist_id', $artist->id)->pluck('id')
            )
            ->where('played_at', '>=', $last3Months)
            ->selectRaw('DATE(played_at) as date, COUNT(*) as plays')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->date => $item->plays];
            });

        // Fill in missing dates with 0 plays
        $chartData = [];
        for ($date = $last3Months->copy(); $date <= $today; $date->addDay()) {
            $dateStr = $date->format('Y-m-d');
            $chartData[] = [
                'date' => $dateStr,
                'plays' => $playHistoryData[$dateStr] ?? 0,
                'formatted_date' => $date->format('M d'),
            ];
        }

        // Genre performance
        $genreStats = Song::where('artist_id', $artist->id)
            ->join('song_genres', 'songs.id', '=', 'song_genres.song_id')
            ->join('genres', 'song_genres.genre_id', '=', 'genres.id')
            ->select('genres.name',
                DB::raw('SUM(songs.play_count) as total_plays'),
                DB::raw('SUM(songs.total_revenue) as total_revenue'),
                DB::raw('COUNT(songs.id) as song_count')
            )
            ->groupBy('genres.id', 'genres.name')
            ->orderBy('total_plays', 'desc')
            ->get();

        // Recent listeners locations (if available)
        $listenerLocations = PlayHistory::whereIn('song_id',
                Song::where('artist_id', $artist->id)->pluck('id')
            )
            ->where('played_at', '>=', $lastMonth)
            ->join('users', 'play_histories.user_id', '=', 'users.id')
            ->whereNotNull('users.country')
            ->select('users.country', DB::raw('COUNT(*) as plays'))
            ->groupBy('users.country')
            ->orderBy('plays', 'desc')
            ->limit(10)
            ->get();

        return view('frontend.artist.analytics', compact(
            'artist',
            'stats',
            'topSongs',
            'chartData',
            'genreStats',
            'listenerLocations',
            'recentEarnings'
        ));
    }

    /**
     * Export analytics report as CSV
     */
    public function export(Request $request)
    {
        $user = Auth::user();
        $artist = $user->artist ?? Artist::where('user_id', $user->id)->first();

        if (!$artist) {
            return redirect()->route('frontend.artist.setup')->with('warning', 'Please complete your artist profile first.');
        }

        $range = $request->get('range', '30');
        $startDate = Carbon::now()->subDays((int) $range);

        // Get songs with stats
        $songs = Song::where('artist_id', $artist->id)
            ->select('title', 'play_count', 'total_revenue', 'created_at')
            ->orderBy('play_count', 'desc')
            ->get();

        // Generate CSV
        $filename = 'analytics_' . $artist->stage_name . '_' . now()->format('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($songs, $artist, $range) {
            $file = fopen('php://output', 'w');
            
            // Header info
            fputcsv($file, ['Artist Analytics Report']);
            fputcsv($file, ['Artist:', $artist->stage_name]);
            fputcsv($file, ['Generated:', now()->format('Y-m-d H:i:s')]);
            fputcsv($file, ['Period:', 'Last ' . $range . ' days']);
            fputcsv($file, []);
            
            // Column headers
            fputcsv($file, ['Song Title', 'Play Count', 'Revenue (UGX)', 'Released']);
            
            // Data rows
            foreach ($songs as $song) {
                fputcsv($file, [
                    $song->title,
                    $song->play_count,
                    number_format($song->total_revenue ?? 0),
                    $song->created_at->format('Y-m-d'),
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}