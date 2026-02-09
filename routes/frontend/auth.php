<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Frontend Auth-Related Routes
|--------------------------------------------------------------------------
|
| IMPORTANT: Core auth routes (login, register, logout) are now in
| global routes/auth.php to avoid conflicts between frontend/admin.
|
| This file only contains:
| 1. Social auth (Google, Facebook) callbacks
| 2. Artist application workflows
| 3. Profile completion flows
|
*/

Route::name('frontend.')->group(function () {
    // Social Authentication Routes (NEW)
    Route::prefix('auth/{provider}')->group(function () {
        Route::get('redirect', [\App\Http\Controllers\Auth\SocialAuthController::class, 'redirect'])->name('social.redirect');
        Route::get('callback', [\App\Http\Controllers\Auth\SocialAuthController::class, 'callback'])->name('social.callback');
    });
    
    // Unlink social account (requires auth)
    Route::post('/auth/unlink', [\App\Http\Controllers\Auth\SocialAuthController::class, 'unlink'])
        ->middleware('auth')
        ->name('social.unlink');
    
    // Artist Application Routes (NEW - Requires authentication)
    Route::middleware('auth')->prefix('become-artist')->name('artist.application.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Frontend\Artist\ArtistApplicationController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\Frontend\Artist\ArtistApplicationController::class, 'store'])->name('store');
        Route::get('/status', [\App\Http\Controllers\Frontend\Artist\ArtistApplicationController::class, 'status'])->name('status');
        Route::get('/edit', [\App\Http\Controllers\Frontend\Artist\ArtistApplicationController::class, 'edit'])->name('edit');
        Route::put('/update', [\App\Http\Controllers\Frontend\Artist\ArtistApplicationController::class, 'update'])->name('update');
    });
    
    // Artist Application Shortcut Route
    Route::get('/artist/apply', function() {
        if (auth()->check()) {
            // Check if user already has artist profile
            if (auth()->user()->artist) {
                return redirect()->route('frontend.artist.dashboard');
            }
            return redirect()->route('frontend.artist.application.create');
        }
        // Not logged in - redirect to register with artist intent
        return redirect()->route('register')->with('intent', 'artist');
    })->name('artist.apply');
    
    // Profile Completion Routes (NEW - Controllers not created yet)
    // Route::middleware('auth')->prefix('profile')->name('profile.')->group(function () {
    //     Route::get('/complete', [\App\Http\Controllers\Frontend\Profile\ProfileCompletionController::class, 'show'])->name('complete');
    //     Route::post('/step/{step}', [\App\Http\Controllers\Frontend\Profile\ProfileCompletionController::class, 'completeStep'])->name('complete.step');
    // });
    
    // Phone Verification (NEW - Controllers not created yet)
    // Route::middleware('auth')->prefix('phone')->name('phone.')->group(function () {
    //     Route::get('/verify', [\App\Http\Controllers\Frontend\Auth\PhoneVerificationController::class, 'show'])->name('verify.show');
    //     Route::post('/send-code', [\App\Http\Controllers\Frontend\Auth\PhoneVerificationController::class, 'sendCode'])->name('send');
    //     Route::post('/verify-code', [\App\Http\Controllers\Frontend\Auth\PhoneVerificationController::class, 'verifyCode'])->name('verify');
    // });
});