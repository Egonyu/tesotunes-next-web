<?php

namespace App\Http\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use App\Services\FeedAnalyticsService;
use App\Services\FeedPreferenceService;
use Illuminate\Http\Request;

class FeedAnalyticsController extends Controller
{
    public function __construct(
        protected FeedAnalyticsService $analyticsService,
        protected FeedPreferenceService $preferenceService
    ) {
        $this->middleware(['auth', 'role:admin,super_admin']);
    }

    /**
     * Display feed analytics dashboard
     */
    public function index(Request $request)
    {
        $days = $request->get('days', 7);
        
        $data = [
            'analytics' => $this->analyticsService->getDashboardData($days),
            'feedback' => $this->preferenceService->getFeedbackAnalytics($days),
            'days' => $days,
        ];

        if ($request->expectsJson()) {
            return response()->json($data);
        }

        return view('admin.feed-analytics', $data);
    }

    /**
     * Get A/B test results
     */
    public function abTestResults(Request $request)
    {
        $results = $this->analyticsService->getABTestResults();

        return response()->json($results);
    }

    /**
     * Export analytics data
     */
    public function export(Request $request)
    {
        $days = $request->get('days', 30);
        $data = $this->analyticsService->getDashboardData($days);

        $filename = "feed-analytics-" . now()->format('Y-m-d') . ".json";

        return response()->json($data)
            ->header('Content-Type', 'application/json')
            ->header('Content-Disposition', "attachment; filename={$filename}");
    }

    /**
     * Clear analytics cache
     */
    public function clearCache()
    {
        $this->analyticsService->clearCache();

        return response()->json([
            'success' => true,
            'message' => 'Analytics cache cleared successfully.',
        ]);
    }
}
