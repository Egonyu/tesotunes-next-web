<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Rights Routes
|--------------------------------------------------------------------------
|
| These routes handle the rights management in the admin panel.
|
*/

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::middleware('role:admin,super_admin')->prefix('rights')->name('rights.')->group(function () {
        Route::get('/', function () {
            return redirect()->route('frontend.rights.dashboard');
        })->name('index');
        Route::get('/isrc', function () {
            return redirect()->route('frontend.rights.isrc.index');
        })->name('isrc');
        Route::get('/publishing', function () {
            return redirect()->route('frontend.rights.publishing.index');
        })->name('publishing');
        Route::get('/royalties', function () {
            return redirect()->route('frontend.rights.royalty-splits.index');
        })->name('royalties');
        Route::get('/disputes', function () {
            return redirect()->route('frontend.rights.disputes.index');
        })->name('disputes');
        Route::post('/isrc/{isrc}/approve', [\App\Http\Controllers\Frontend\RightsManagementController::class, 'approveISRC'])->name('isrc.approve');
        Route::post('/publishing/{right}/approve', [\App\Http\Controllers\Frontend\RightsManagementController::class, 'approvePublishing'])->name('publishing.approve');
    });
});