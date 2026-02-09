<?php

namespace App\Http\Controllers\Frontend\Moderator;

use App\Http\Controllers\Controller;
use App\Models\ContentReview;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->get('status', 'open');

        // Get counts for filter tabs
        $counts = [
            'open' => ContentReview::whereIn('status', ['pending', 'escalated'])->count(),
            'under_review' => ContentReview::where('status', 'in_review')->count(),
            'resolved' => ContentReview::where('status', 'approved')->count(),
            'dismissed' => ContentReview::where('status', 'rejected')->count(),
        ];

        // Build query based on status
        $query = ContentReview::with(['reviewable', 'assignedTo'])
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc');

        switch ($status) {
            case 'open':
                $query->whereIn('status', ['pending', 'escalated']);
                break;
            case 'under_review':
                $query->where('status', 'in_review');
                break;
            case 'resolved':
                $query->where('status', 'approved');
                break;
            case 'dismissed':
                $query->where('status', 'rejected');
                break;
        }

        $reviewsCollection = $query->paginate(20);

        // Format reports for the view
        $reports = $reviewsCollection->map(function ($review) {
            $content = $review->reviewable;
            
            return [
                'id' => $review->id,
                'type' => $review->content_type,
                'reason' => $this->getReasonFromFlags($review),
                'description' => $review->automated_reason ?? 'Content flagged for review',
                'severity_color' => $this->getSeverityColor($review->priority),
                'reported_at' => $review->submitted_at->diffForHumans(),
                'report_count' => 1, // Can be enhanced with actual report aggregation
                'content' => $content ? [
                    'title' => $content->title ?? 'Content',
                    'author' => $this->getContentAuthor($content),
                    'artwork' => $this->getContentArtwork($content),
                    'excerpt' => $content->description ?? null,
                ] : null,
                'reporter' => [
                    'name' => 'System', // Can be enhanced with actual reporter info
                    'verified' => false,
                ],
                'actions' => $this->getReviewActions($review),
            ];
        })->filter();

        return view('frontend.moderator.reports', compact('counts', 'reports'));
    }

    private function getReasonFromFlags($review): string
    {
        $flags = $review->getAllFlags();
        
        if (empty($flags)) {
            return 'Content Violation';
        }

        $flagLabels = [
            'copyright_violation' => 'Copyright Violation',
            'explicit_content' => 'Explicit Content',
            'spam' => 'Spam',
            'harassment' => 'Harassment',
            'hate_speech' => 'Hate Speech',
            'misinformation' => 'Misinformation',
            'inappropriate' => 'Inappropriate Content',
        ];

        $firstFlag = $flags[0] ?? 'unknown';
        return $flagLabels[$firstFlag] ?? ucfirst(str_replace('_', ' ', $firstFlag));
    }

    private function getSeverityColor(string $priority): string
    {
        return match($priority) {
            'urgent' => 'bg-red-500',
            'high' => 'bg-orange-500',
            'medium' => 'bg-yellow-500',
            'low' => 'bg-blue-500',
            default => 'bg-gray-500',
        };
    }

    private function getContentAuthor($content): string
    {
        if (isset($content->user)) {
            return $content->user->name;
        }
        if (isset($content->artist)) {
            return $content->artist->name;
        }
        return 'Unknown';
    }

    private function getContentArtwork($content): string
    {
        return $content->artwork_url ?? $content->artwork ?? $content->cover_image ?? '/images/default-song-artwork.svg';
    }

    private function getReviewActions($review): array
    {
        $actions = [];
        
        if ($review->assignedTo) {
            $actions[] = [
                'moderator' => $review->assignedTo->name,
                'action' => 'assigned to review',
                'time' => $review->assigned_at->diffForHumans(),
            ];
        }

        if ($review->isCompleted()) {
            $actions[] = [
                'moderator' => $review->assignedTo->name ?? 'System',
                'action' => $review->decision === 'approve' ? 'approved' : 'rejected',
                'time' => $review->completed_at->diffForHumans(),
            ];
        }

        return $actions;
    }
}