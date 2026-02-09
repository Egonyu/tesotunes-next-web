<?php

use App\Http\Controllers\Backend\AdController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Ads Routes
|--------------------------------------------------------------------------
|
| Routes for managing advertising campaigns
|
*/

Route::prefix('admin')->middleware(['auth', 'role:admin,super_admin,finance'])->group(function () {
    // Resource routes for ads (index, create, store, show, edit, update, destroy)
    Route::resource('ads', AdController::class)->names('backend.ads');
    
    // Additional custom routes
    Route::get('ads/analytics', [AdController::class, 'analytics'])->name('backend.ads.analytics');
    Route::patch('ads/{ad}/toggle', [AdController::class, 'toggle'])->name('backend.ads.toggle');
});
