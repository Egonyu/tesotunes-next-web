<?php

use App\Http\Controllers\Backend\Admin\PerformanceDashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Performance Dashboard Routes
|--------------------------------------------------------------------------
|
| Routes for monitoring and optimizing application performance
|
*/

Route::prefix('admin')->name('backend.admin.')->middleware(['auth', 'role:admin,super_admin'])->group(function () {
    
    Route::prefix('performance')->name('performance.')->group(function () {
        // Main dashboard
        Route::get('/', [PerformanceDashboardController::class, 'index'])
            ->name('dashboard');
        
        // Real-time metrics (AJAX)
        Route::get('/metrics', [PerformanceDashboardController::class, 'metrics'])
            ->name('metrics');
        
        // Cache management
        Route::post('/cache/warm', [PerformanceDashboardController::class, 'warmCaches'])
            ->name('warm-caches');
        
        Route::post('/cache/clear', [PerformanceDashboardController::class, 'clearCaches'])
            ->name('clear-caches');
        
        // Query optimization
        Route::get('/query/report', [PerformanceDashboardController::class, 'queryReport'])
            ->name('query-report');
        
        Route::get('/query/indexes', [PerformanceDashboardController::class, 'checkIndexes'])
            ->name('check-indexes');
        
        Route::post('/database/optimize', [PerformanceDashboardController::class, 'optimizeTables'])
            ->name('optimize-tables');
        
        // Memory optimization
        Route::get('/memory/recommendations', [PerformanceDashboardController::class, 'memoryRecommendations'])
            ->name('memory-recommendations');
        
        Route::post('/memory/gc', [PerformanceDashboardController::class, 'forceGarbageCollection'])
            ->name('force-gc');
        
        // Feed analytics
        Route::get('/feed/analytics', [PerformanceDashboardController::class, 'feedAnalytics'])
            ->name('feed-analytics');
        
        // System health
        Route::get('/system/health', [PerformanceDashboardController::class, 'systemHealth'])
            ->name('system-health');
    });
});
