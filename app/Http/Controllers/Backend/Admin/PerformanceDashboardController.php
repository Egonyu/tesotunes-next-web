<?php

namespace App\Http\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use App\Services\CacheWarmingService;
use App\Services\QueryOptimizationService;
use App\Services\MemoryOptimizationService;
use App\Services\PerformanceMonitoringService;
use App\Services\FeedAnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

/**
 * Performance Dashboard Controller
 * 
 * Provides comprehensive performance monitoring and optimization interface
 */
class PerformanceDashboardController extends Controller
{
    private CacheWarmingService $cacheWarming;
    private QueryOptimizationService $queryOptimization;
    private MemoryOptimizationService $memoryOptimization;
    private PerformanceMonitoringService $performanceMonitoring;
    private FeedAnalyticsService $feedAnalytics;
    
    public function __construct(
        CacheWarmingService $cacheWarming,
        QueryOptimizationService $queryOptimization,
        MemoryOptimizationService $memoryOptimization,
        PerformanceMonitoringService $performanceMonitoring,
        FeedAnalyticsService $feedAnalytics
    ) {
        $this->middleware(['auth', 'role:admin,super_admin']);
        
        $this->cacheWarming = $cacheWarming;
        $this->queryOptimization = $queryOptimization;
        $this->memoryOptimization = $memoryOptimization;
        $this->performanceMonitoring = $performanceMonitoring;
        $this->feedAnalytics = $feedAnalytics;
    }
    
    /**
     * Display performance dashboard
     */
    public function index()
    {
        $this->memoryOptimization->snapshot('dashboard_start');
        
        // Get performance metrics
        $metrics = $this->performanceMonitoring->getCurrentMetrics();
        
        // Get cache statistics
        $cacheStats = $this->cacheWarming->getStats();
        
        // Get database statistics
        $dbStats = $this->queryOptimization->getDatabaseStats();
        
        // Get memory report
        $memoryReport = $this->memoryOptimization->getMemoryReport();
        
        // Get feed analytics summary
        $feedStats = [
            'total_activities' => DB::table('activities')->count(),
            'avg_feed_load_time' => $this->feedAnalytics->getAverageLoadTime(),
            'cache_hit_rate' => $this->feedAnalytics->getCacheHitRate(),
        ];
        
        $this->memoryOptimization->snapshot('dashboard_end');
        
        return view('admin.performance.dashboard', compact(
            'metrics',
            'cacheStats',
            'dbStats',
            'memoryReport',
            'feedStats'
        ));
    }
    
    /**
     * Get real-time performance metrics (AJAX)
     */
    public function metrics()
    {
        return response()->json([
            'metrics' => $this->performanceMonitoring->getCurrentMetrics(),
            'memory' => $this->memoryOptimization->getMemoryReport(),
            'timestamp' => now()->toISOString(),
        ]);
    }
    
    /**
     * Warm caches
     */
    public function warmCaches(Request $request)
    {
        $result = $this->cacheWarming->warmAll();
        
        if ($request->input('warm_users')) {
            $limit = (int) $request->input('user_limit', 100);
            $userCaches = $this->cacheWarming->warmActiveUserCaches($limit);
            $result['user_caches_warmed'] = $userCaches;
        }
        
        return response()->json($result);
    }
    
    /**
     * Clear all caches
     */
    public function clearCaches()
    {
        $success = $this->cacheWarming->clearAll();
        Cache::flush();
        
        return response()->json([
            'success' => $success,
            'message' => $success ? 'All caches cleared successfully' : 'Failed to clear caches'
        ]);
    }
    
    /**
     * Get query optimization report
     */
    public function queryReport()
    {
        $this->queryOptimization->enableQueryLogging();
        
        // Perform some test queries
        DB::table('songs')->where('status', 'approved')->limit(10)->get();
        DB::table('users')
            ->join('user_roles', 'users.id', '=', 'user_roles.user_id')
            ->join('roles', 'user_roles.role_id', '=', 'roles.id')
            ->where('roles.name', 'artist')
            ->limit(10)
            ->get();
        
        $analysis = $this->queryOptimization->analyzeQueryPerformance();
        $slowQueries = $this->queryOptimization->getSlowQueries();
        
        return response()->json([
            'analysis' => $analysis,
            'slow_queries' => $slowQueries,
        ]);
    }
    
    /**
     * Check for missing indexes
     */
    public function checkIndexes()
    {
        $result = $this->queryOptimization->checkMissingIndexes();
        
        return response()->json($result);
    }
    
    /**
     * Optimize database tables
     */
    public function optimizeTables()
    {
        $result = $this->queryOptimization->optimizeTables();
        
        return response()->json($result);
    }
    
    /**
     * Get memory optimization recommendations
     */
    public function memoryRecommendations()
    {
        $recommendations = $this->memoryOptimization->getOptimizationRecommendations();
        $leaks = $this->memoryOptimization->detectMemoryLeaks();
        
        return response()->json([
            'recommendations' => $recommendations,
            'potential_leaks' => $leaks,
            'report' => $this->memoryOptimization->getMemoryReport(),
        ]);
    }
    
    /**
     * Force garbage collection
     */
    public function forceGarbageCollection()
    {
        $result = $this->memoryOptimization->forceGarbageCollection();
        
        return response()->json($result);
    }
    
    /**
     * Get feed performance analytics
     */
    public function feedAnalytics()
    {
        $analytics = [
            'avg_load_time' => $this->feedAnalytics->getAverageLoadTime(),
            'cache_hit_rate' => $this->feedAnalytics->getCacheHitRate(),
            'personalization_usage' => $this->feedAnalytics->getPersonalizationUsage(),
            'activity_distribution' => $this->feedAnalytics->getActivityTypeDistribution(),
            'trending_content' => $this->feedAnalytics->getTrendingContent(10),
        ];
        
        return response()->json($analytics);
    }
    
    /**
     * Get system health overview
     */
    public function systemHealth()
    {
        $health = [
            'database' => $this->checkDatabaseHealth(),
            'cache' => $this->checkCacheHealth(),
            'queue' => $this->checkQueueHealth(),
            'storage' => $this->checkStorageHealth(),
        ];
        
        return response()->json($health);
    }
    
    /**
     * Check database health
     */
    private function checkDatabaseHealth(): array
    {
        try {
            DB::connection()->getPdo();
            
            $stats = $this->queryOptimization->getDatabaseStats();
            
            return [
                'status' => 'healthy',
                'driver' => $stats['driver'],
                'database' => $stats['database'],
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
            ];
        }
    }
    
    /**
     * Check cache health
     */
    private function checkCacheHealth(): array
    {
        try {
            Cache::put('health_check', true, 60);
            $canWrite = Cache::get('health_check') === true;
            Cache::forget('health_check');
            
            $stats = $this->cacheWarming->getStats();
            
            return [
                'status' => $canWrite ? 'healthy' : 'degraded',
                'driver' => $stats['cache_driver'],
                'tags_support' => $stats['tags_support'],
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
            ];
        }
    }
    
    /**
     * Check queue health
     */
    private function checkQueueHealth(): array
    {
        try {
            $driver = config('queue.default');
            $failedJobs = DB::table('failed_jobs')->count();
            
            return [
                'status' => $failedJobs > 100 ? 'degraded' : 'healthy',
                'driver' => $driver,
                'failed_jobs' => $failedJobs,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unknown',
                'error' => $e->getMessage(),
            ];
        }
    }
    
    /**
     * Check storage health
     */
    private function checkStorageHealth(): array
    {
        try {
            $disk = config('filesystems.default');
            $storageExists = \Storage::exists('.');
            
            return [
                'status' => $storageExists ? 'healthy' : 'unhealthy',
                'driver' => $disk,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
            ];
        }
    }
}
