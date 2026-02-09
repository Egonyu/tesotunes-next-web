<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Frontend Moderator Routes
|--------------------------------------------------------------------------
|
| These routes are for authenticated moderators and handle features like the
| moderator dashboard, content moderation, and reports.
|
*/

Route::middleware(['auth', 'role:moderator,admin'])->prefix('moderator')->name('frontend.moderator.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Frontend\Moderator\DashboardController::class, 'index'])->name('dashboard');
    Route::get('/content', [\App\Http\Controllers\Frontend\Moderator\ContentController::class, 'index'])->name('content');
    Route::get('/reports', [\App\Http\Controllers\Frontend\Moderator\ReportController::class, 'index'])->name('reports');
    Route::post('/content/{type}/{id}/approve', [\App\Http\Controllers\Frontend\Moderator\ContentController::class, 'approve'])->name('content.approve');
    Route::post('/content/{type}/{id}/reject', [\App\Http\Controllers\Frontend\Moderator\ContentController::class, 'reject'])->name('content.reject');
});