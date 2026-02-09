<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Settings Routes
|--------------------------------------------------------------------------
|
| These routes handle the system settings in the admin panel.
|
*/

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'index'])->name('index');
        Route::post('/update', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'update'])->name('update');
        Route::post('/initialize-defaults', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'initializeDefaults'])->name('initialize-defaults');
        Route::post('/general', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'updateGeneral'])->name('general');
        Route::post('/users', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'updateUsers'])->name('users');
        Route::post('/credit-system', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'updateCreditSystem'])->name('credit-system');
        Route::post('/mobile-money', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'updateMobileMoney'])->name('mobile-money');
        Route::post('/notifications', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'updateNotifications'])->name('notifications');
        Route::post('/mobile-verification', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'updateMobileVerification'])->name('mobile-verification');
        Route::post('/security', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'updateSecurity'])->name('security');

        // New settings modules
        Route::post('/awards', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'updateAwards'])->name('awards');
        Route::post('/events', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'updateEvents'])->name('events');
        Route::post('/artists', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'updateArtists'])->name('artists');
        Route::post('/storage', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'updateStorage'])->name('storage');
        Route::post('/authentication', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'updateAuthentication'])->name('authentication');
        Route::post('/podcasts', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'updatePodcasts'])->name('update-podcasts');

        // Storage management endpoints
        Route::post('/storage/test-connection', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'testStorageConnection'])->name('storage.test-connection');
        Route::post('/storage/cleanup', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'cleanupStorage'])->name('storage.cleanup');
        Route::get('/storage/stats', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'getStorageStats'])->name('storage.stats');

        // User search and verification endpoints
        Route::get('/search-users', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'searchUsers'])->name('search-users');
        Route::post('/users/{user}/verify', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'verifyUser'])->name('verify-user');
        
        // Google Analytics settings
        Route::get('/google-analytics', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'googleAnalytics'])->name('google-analytics');
        Route::post('/google-analytics', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'updateGoogleAnalytics'])->name('google-analytics.update');
        
        // Ads Management settings
        Route::get('/ads', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'adsManagement'])->name('ads');
        Route::post('/ads', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'updateAdsManagement'])->name('ads.update');
        Route::post('/ads/toggle', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'toggleAd'])->name('ads.toggle');
        Route::delete('/ads/{id}', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'deleteAd'])->name('ads.delete');

        // Frontend Design settings
        Route::post('/frontend-design', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'updateFrontendDesign'])->name('frontend-design');
        Route::post('/frontend-design/reset', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'resetFrontendDesign'])->name('frontend-design.reset');
        
        // Module management
        Route::post('/modules/update', [\App\Http\Controllers\Backend\Admin\SettingsController::class, 'updateModules'])->name('modules.update');
    });

    // Theme Settings Management (WordPress-like)
    Route::prefix('settings/theme')->name('settings.theme.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\ThemeSettingsController::class, 'index'])->name('index');
        Route::put('/update', [\App\Http\Controllers\Admin\ThemeSettingsController::class, 'update'])->name('update');
        Route::post('/reset', [\App\Http\Controllers\Admin\ThemeSettingsController::class, 'reset'])->name('reset');
        Route::get('/export', [\App\Http\Controllers\Admin\ThemeSettingsController::class, 'export'])->name('export');
        Route::post('/import', [\App\Http\Controllers\Admin\ThemeSettingsController::class, 'import'])->name('import');
    });

    // Frontend Design Management Routes - DEPRECATED: Now integrated into settings
    // Route::prefix('frontend-design')->name('frontend-design.')->group(function () {
    //     Route::get('/', [\App\Http\Controllers\Admin\FrontendDesignController::class, 'index'])->name('index');
    //     Route::post('/update', [\App\Http\Controllers\Admin\FrontendDesignController::class, 'update'])->name('update');
    //     Route::post('/reset', [\App\Http\Controllers\Admin\FrontendDesignController::class, 'reset'])->name('reset');
    // });

    // Geographic Access Control Routes
    Route::prefix('settings/geo-access')->name('geo-access.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\GeoAccessController::class, 'index'])->name('index');
        Route::put('/settings', [\App\Http\Controllers\Admin\GeoAccessController::class, 'updateSettings'])->name('settings');
        
        // Whitelisted IPs
        Route::post('/whitelist', [\App\Http\Controllers\Admin\GeoAccessController::class, 'addWhitelistedIp'])->name('whitelist.add');
        Route::delete('/whitelist/{geoWhitelistedIp}', [\App\Http\Controllers\Admin\GeoAccessController::class, 'removeWhitelistedIp'])->name('whitelist.remove');
        
        // Countries
        Route::post('/country', [\App\Http\Controllers\Admin\GeoAccessController::class, 'addCountry'])->name('country.add');
        Route::patch('/country/{geoAllowedCountry}', [\App\Http\Controllers\Admin\GeoAccessController::class, 'toggleCountry'])->name('country.toggle');
        
        // IP Lookup & Logs
        Route::post('/lookup', [\App\Http\Controllers\Admin\GeoAccessController::class, 'lookupIp'])->name('lookup');
        Route::get('/export', [\App\Http\Controllers\Admin\GeoAccessController::class, 'exportBlockedLogs'])->name('export');
        Route::delete('/logs/clear', [\App\Http\Controllers\Admin\GeoAccessController::class, 'clearOldLogs'])->name('logs.clear');
    });
});


