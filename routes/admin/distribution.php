<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Distribution Routes
|--------------------------------------------------------------------------
|
| These routes handle the distribution management in the admin panel.
|
*/

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::middleware('role:admin,super_admin')->prefix('distribution')->name('distribution.')->group(function () {
        Route::get('/', function () {
            return redirect()->route('admin.music.index');
        })->name('index');
        Route::get('/platforms', function () {
            return redirect()->route('admin.music.index')->with('section', 'platforms');
        })->name('platforms');
        Route::get('/requests', function () {
            return redirect()->route('admin.music.index')->with('section', 'distribution_requests');
        })->name('requests');
        Route::post('/requests/{request}/approve', function ($request) {
            return redirect()->route('admin.music.index')->with('action', 'approve_distribution')->with('request_id', $request);
        })->name('requests.approve');
        Route::post('/platforms/{platform}/toggle', function ($platform) {
            return redirect()->route('admin.music.index')->with('action', 'toggle_platform')->with('platform_id', $platform);
        })->name('platforms.toggle');
    });
});