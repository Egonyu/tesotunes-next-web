<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin API Routes
|--------------------------------------------------------------------------
|
| These routes handle the API endpoints for the admin panel.
|
*/

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::prefix('api')->name('api.')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\Backend\Api\StatsController::class, 'overview'])->name('stats');
        Route::get('/recent-activity', function () {
            return redirect()->route('admin.api.stats.overview');
        })->name('recent-activity');
        Route::get('/pending-counts', function () {
            return redirect()->route('admin.api.stats.overview');
        })->name('pending-counts');
        Route::get('/revenue-chart', function () {
            return redirect()->route('admin.api.stats.overview');
        })->name('revenue-chart');
    });
});