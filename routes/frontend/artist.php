<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Frontend Artist Routes
|--------------------------------------------------------------------------
|
| These routes are for authenticated artists and handle features like the
| artist dashboard, music management, analytics, and profile settings.
|
*/

Route::middleware(['auth', 'role:artist,admin'])->prefix('artist')->name('frontend.artist.')->group(function () {
    // Unified Cross-Module Dashboard
    Route::get('/dashboard', [\App\Http\Controllers\Frontend\ArtistDashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/api', [\App\Http\Controllers\Frontend\ArtistDashboardController::class, 'apiData'])->name('dashboard.api');
    Route::post('/dashboard/preferences', [\App\Http\Controllers\Frontend\ArtistDashboardController::class, 'updatePreferences'])->name('dashboard.preferences');
    Route::get('/dashboard/export', [\App\Http\Controllers\Frontend\ArtistDashboardController::class, 'export'])->name('dashboard.export');

    // Legacy dashboard removed - use /artist/dashboard instead
    Route::get('/music', [\App\Http\Controllers\Frontend\Artist\MusicController::class, 'index'])->name('music');
    Route::post('/music', [\App\Http\Controllers\Frontend\Artist\MusicController::class, 'store'])->name('music.store');
    Route::get('/analytics', [\App\Http\Controllers\Frontend\Artist\AnalyticsController::class, 'index'])->name('analytics');
    Route::get('/analytics/export', [\App\Http\Controllers\Frontend\Artist\AnalyticsController::class, 'export'])->name('analytics.export');
    Route::get('/promotions', [\App\Http\Controllers\Frontend\Artist\PromotionController::class, 'index'])->name('promotions');
    Route::get('/profile', [\App\Http\Controllers\Frontend\Artist\ProfileController::class, 'show'])->name('profile');
    Route::put('/profile', [\App\Http\Controllers\Frontend\Artist\ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/password', [\App\Http\Controllers\Frontend\Artist\ProfileController::class, 'updatePassword'])->name('profile.password');

    // Artist Setup Route (redirects to business setup)
    Route::get('/setup', function() {
        return redirect()->route('frontend.artist.business.setup');
    })->name('setup');

    // Artist Business & Revenue Routes
    Route::prefix('business')->name('business.')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Frontend\ArtistBusinessController::class, 'dashboard'])->name('dashboard');
        Route::get('/analytics', [\App\Http\Controllers\Frontend\ArtistBusinessController::class, 'analytics'])->name('analytics');
        Route::get('/payouts', [\App\Http\Controllers\Frontend\ArtistBusinessController::class, 'payouts'])->name('payouts');
        Route::post('/payouts/request', [\App\Http\Controllers\Frontend\ArtistBusinessController::class, 'requestPayout'])->name('payouts.request');

        // Artist Profile Setup & Verification
        Route::get('/setup', [\App\Http\Controllers\Frontend\ArtistBusinessController::class, 'setup'])->name('setup');
        Route::post('/setup', [\App\Http\Controllers\Frontend\ArtistBusinessController::class, 'saveSetup'])->name('setup.save');
        Route::get('/verification', [\App\Http\Controllers\Frontend\ArtistBusinessController::class, 'verification'])->name('verification');
        Route::post('/verification', [\App\Http\Controllers\Frontend\ArtistBusinessController::class, 'submitVerification'])->name('verification.submit');

        // Distribution Management
        Route::get('/distribution', [\App\Http\Controllers\Frontend\ArtistBusinessController::class, 'distribution'])->name('distribution');
        Route::post('/distribution/submit', [\App\Http\Controllers\Frontend\ArtistBusinessController::class, 'submitDistribution'])->name('distribution.submit');
        Route::get('/distribution/{distribution}', [\App\Http\Controllers\Frontend\ArtistBusinessController::class, 'distributionDetails'])->name('distribution.details');
    });

    // Music Upload & Management Routes
    Route::prefix('upload')->name('upload.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Frontend\MusicUploadController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\Frontend\MusicUploadController::class, 'create'])->name('create');
        Route::post('/store', [\App\Http\Controllers\Frontend\MusicUploadController::class, 'store'])
            ->middleware('secure.upload')->name('store');
        Route::get('/{upload}', [\App\Http\Controllers\Frontend\MusicUploadController::class, 'show'])->name('show');
        Route::get('/batch/{batchId}/progress', [\App\Http\Controllers\Frontend\MusicUploadController::class, 'batchProgress'])->name('batch.progress');

        // Song creation from uploads
        Route::get('/{upload}/create-song', [\App\Http\Controllers\Frontend\MusicUploadController::class, 'createSong'])->name('create-song');
        Route::post('/{upload}/store-song', [\App\Http\Controllers\Frontend\MusicUploadController::class, 'storeSong'])->name('store-song');
    });

    // Enhanced Music Management Routes
    Route::prefix('music')->name('music.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Frontend\Artist\MusicController::class, 'index'])->name('index');
        Route::get('/upload', [\App\Http\Controllers\Frontend\Artist\MusicController::class, 'upload'])->name('upload');
        Route::get('/{song}', [\App\Http\Controllers\Frontend\Artist\MusicController::class, 'show'])->name('show');
        Route::get('/{song}/edit', [\App\Http\Controllers\Frontend\Artist\MusicController::class, 'edit'])->name('edit');
        Route::put('/{song}', [\App\Http\Controllers\Frontend\Artist\MusicController::class, 'update'])->name('update');
        Route::delete('/{song}', [\App\Http\Controllers\Frontend\Artist\MusicController::class, 'destroy'])->name('destroy');

        // Distribution management
        Route::post('/{song}/submit-for-review', [\App\Http\Controllers\Frontend\Artist\MusicController::class, 'submitForReview'])->name('submit-review');
        Route::post('/{song}/request-distribution', [\App\Http\Controllers\Frontend\Artist\MusicController::class, 'requestDistribution'])->name('request-distribution');
    });

    // Rights Management Routes
    Route::prefix('rights')->name('rights.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Frontend\RightsManagementController::class, 'index'])->name('index');
        Route::get('/{song}', [\App\Http\Controllers\Frontend\RightsManagementController::class, 'show'])->name('show');

        // ISRC Management
        Route::post('/{song}/generate-isrc', [\App\Http\Controllers\Frontend\RightsManagementController::class, 'generateISRC'])->name('generate-isrc');
        Route::post('/isrc/{isrcCode}/register', [\App\Http\Controllers\Frontend\RightsManagementController::class, 'registerISRC'])->name('register-isrc');
        Route::post('/isrc/{isrcCode}/clear-distribution', [\App\Http\Controllers\Frontend\RightsManagementController::class, 'clearForDistribution'])->name('clear-distribution');

        // Publishing Rights Management
        Route::get('/{song}/publishing-rights/create', [\App\Http\Controllers\Frontend\RightsManagementController::class, 'createPublishingRights'])->name('publishing-rights.create');
        Route::post('/{song}/publishing-rights', [\App\Http\Controllers\Frontend\RightsManagementController::class, 'storePublishingRights'])->name('publishing-rights.store');

        // Royalty Splits Management
        Route::get('/{song}/royalty-splits/create', [\App\Http\Controllers\Frontend\RightsManagementController::class, 'createRoyaltySplit'])->name('royalty-splits.create');
        Route::post('/{song}/royalty-splits', [\App\Http\Controllers\Frontend\RightsManagementController::class, 'storeRoyaltySplit'])->name('royalty-splits.store');
        Route::post('/royalty-splits/{split}/approve', [\App\Http\Controllers\Frontend\RightsManagementController::class, 'approveRoyaltySplit'])->name('royalty-splits.approve');

        // Payouts Dashboard
        Route::get('/payouts', [\App\Http\Controllers\Frontend\RightsManagementController::class, 'payouts'])->name('payouts');
    });
});