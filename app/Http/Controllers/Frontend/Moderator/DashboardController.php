<?php

namespace App\Http\Controllers\Frontend\Moderator;

use App\Http\Controllers\Controller;
use App\Models\ContentReview;
use App\Models\Song;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Get stats for moderator dashboard
        $stats = [
            'pending_count' => ContentReview::pending()->count(),
            'approved_today' => ContentReview::where('decision', 'approve')
                ->whereDate('completed_at', today())
                ->count(),
            'open_reports' => ContentReview::whereIn('status', ['pending', 'escalated'])->count(),
            'avg_response_time' => $this->getAverageResponseTime(),
        ];

        // Get recent activity for the moderator
        $recentActivity = ContentReview::with(['reviewable', 'assignedTo'])
            ->where('assigned_to', $user->id)
            ->orWhereNull('assigned_to')
            ->latest('updated_at')
            ->limit(10)
            ->get()
            ->map(function ($review) {
                return [
                    'icon' => $this->getIconForContentType($review->content_type),
                    'title' => $this->getActivityTitle($review),
                    'description' => $this->getActivityDescription($review),
                    'time' => $review->updated_at->diffForHumans(),
                ];
            });

        return view('frontend.moderator.dashboard', compact('stats', 'recentActivity'));
    }

    private function getAverageResponseTime(): string
    {
        $avgMinutes = ContentReview::whereNotNull('completed_at')
            ->whereDate('completed_at', '>=', now()->subDays(7))
            ->avg('review_duration_minutes');

        if (!$avgMinutes) {
            return 'N/A';
        }

        if ($avgMinutes < 60) {
            return round($avgMinutes) . 'm';
        }

        return round($avgMinutes / 60, 1) . 'h';
    }

    private function getIconForContentType(string $type): string
    {
        return match($type) {
            'music' => 'music_note',
            'comment' => 'comment',
            'album' => 'album',
            'podcast' => 'podcasts',
            default => 'flag',
        };
    }

    private function getActivityTitle($review): string
    {
        $status = ucfirst($review->status);
        return "{$status}: " . ($review->reviewable->title ?? 'Content');
    }

    private function getActivityDescription($review): string
    {
        if ($review->isCompleted()) {
            return "Reviewed by " . ($review->assignedTo->name ?? 'System');
        }
        return "Waiting for review";
    }
}