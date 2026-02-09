<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Dashboard Route
|--------------------------------------------------------------------------
|
| This route handles the admin panel dashboard.
|
*/

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Backend\Admin\DashboardController::class, 'index'])->name('dashboard');
    
    // Global Search
    Route::get('/search', [\App\Http\Controllers\Backend\Admin\SearchController::class, 'index'])->name('search');
    Route::get('/search/quick', [\App\Http\Controllers\Backend\Admin\SearchController::class, 'quick'])->name('search.quick');
    
    // Notifications
    Route::post('/notifications/mark-all-read', function () {
        auth()->user()->unreadNotifications->markAsRead();
        return response()->json(['success' => true]);
    })->name('notifications.mark-all-read');
});