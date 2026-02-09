<?php

/*
|--------------------------------------------------------------------------
| Global Authentication Routes
|--------------------------------------------------------------------------
|
| These routes handle authentication for ALL parts of the application.
| They are loaded FIRST in bootstrap/app.php to ensure they take priority
| over any wildcard routes in frontend/admin/backend.
|
| Named routes:
| - 'login' -> /login (used by all middleware)
| - 'register' -> /register
| - 'logout' -> /logout
|
*/

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Frontend\Auth\AuthController;
use App\Http\Controllers\Frontend\Auth\PasswordController;
use App\Http\Controllers\Frontend\Auth\ArtistRegistrationController;
use App\Http\Controllers\Frontend\SocialAuthController;
use App\Http\Controllers\Frontend\Artist\ArtistApplicationController;

// Public authentication routes (no middleware)
Route::middleware('guest')->group(function () {
    // Login Choice Page (select between user/artist login)
    Route::get('/login', [AuthController::class, 'loginChoiceView'])->name('login');
    
    // User Login Routes
    Route::get('/user/login', [AuthController::class, 'userLoginView'])->name('user.login');
    Route::post('/user/login', [AuthController::class, 'login']);
    
    // Artist Login Routes
    Route::get('/artist/login', [AuthController::class, 'artistLoginView'])->name('artist.login');
    Route::post('/artist/login', [AuthController::class, 'login']);
    
    // Register Choice
    Route::get('/register', [AuthController::class, 'registerView'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
    
    // Artist Register Routes (NEW - Multi-step registration for NEW artists)
    // This is the PRIMARY artist registration flow
    Route::prefix('artist/register')->name('artist.register.')->group(function () {
        Route::get('/', [ArtistRegistrationController::class, 'index'])->name('index');
        Route::get('/start', [ArtistRegistrationController::class, 'start'])->name('start');
        
        // Step 1: Basic Information
        Route::get('/step-1', [ArtistRegistrationController::class, 'showStep1'])->name('step1');
        Route::post('/step-1', [ArtistRegistrationController::class, 'submitStep1']);
        
        // Step 2: Identity Verification
        Route::get('/step-2', [ArtistRegistrationController::class, 'showStep2'])->name('step2');
        Route::post('/step-2', [ArtistRegistrationController::class, 'submitStep2']);
        
        // Step 3: Payment Setup
        Route::get('/step-3', [ArtistRegistrationController::class, 'showStep3'])->name('step3');
        Route::post('/step-3', [ArtistRegistrationController::class, 'submitStep3']);
        
        // Navigation
        Route::post('/previous', [ArtistRegistrationController::class, 'previousStep'])->name('previous');
    });
    
    // OLD Artist Register Routes removed - use /artist/register instead
    
    // Password Reset
    Route::get('/password/reset', [PasswordController::class, 'showLinkRequestForm'])->name('password.request');
    Route::post('/password/email', [PasswordController::class, 'sendResetLinkEmail'])->name('password.email');
    Route::get('/password/reset/{token}', [PasswordController::class, 'showResetForm'])->name('password.reset');
    Route::post('/password/reset', [PasswordController::class, 'reset'])->name('password.update');

    // Social Authentication (OAuth)
    Route::prefix('auth')->name('auth.social.')->group(function () {
        Route::get('/{provider}', [SocialAuthController::class, 'redirect'])->name('redirect');
        Route::get('/{provider}/callback', [SocialAuthController::class, 'callback'])->name('callback');
    });
});

// Authenticated routes
Route::middleware('auth')->group(function () {
    // Logout
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // ===========================================
    // EMAIL VERIFICATION ROUTES
    // ===========================================
    Route::get('/email/verify', [AuthController::class, 'verifyEmailNotice'])
        ->name('verification.notice');
    
    Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');
    
    Route::post('/email/verification-notification', [AuthController::class, 'resendVerificationEmail'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    // Social Account Management
    Route::prefix('auth')->name('auth.social.')->group(function () {
        Route::post('/{provider}/disconnect', [SocialAuthController::class, 'disconnect'])->name('disconnect');
        Route::get('/{provider}/link', [SocialAuthController::class, 'link'])->name('link');
        Route::get('/{provider}/link/callback', [SocialAuthController::class, 'linkCallback'])->name('link.callback');
    });

    // Artist Registration - Phone Verification & Completion (after registration)
    Route::prefix('artist/register')->name('artist.register.')->group(function () {
        Route::get('/verify-phone', [ArtistRegistrationController::class, 'showPhoneVerification'])->name('verify-phone');
        Route::post('/verify-phone', [ArtistRegistrationController::class, 'verifyPhone']);
        Route::post('/resend-code', [ArtistRegistrationController::class, 'resendCode'])->name('resend-code');
        Route::get('/complete', [ArtistRegistrationController::class, 'complete'])->name('complete');
    });

    // Artist Application Routes (OLD - For existing users to become artists)
    Route::prefix('artist')->name('artist.application.')->group(function () {
        Route::get('/apply', [ArtistApplicationController::class, 'create'])->name('create');
        Route::post('/apply', [ArtistApplicationController::class, 'store'])->name('store');
        Route::get('/application/status', [ArtistApplicationController::class, 'status'])->name('status');
        Route::get('/application/edit', [ArtistApplicationController::class, 'edit'])->name('edit');
        Route::put('/application', [ArtistApplicationController::class, 'update'])->name('update');
    });
});

/*
|--------------------------------------------------------------------------
| Admin Authentication Routes (Separate Flow)
|--------------------------------------------------------------------------
| Admin login uses a separate route to avoid conflicts
| COMMENTED OUT: Controller not created yet
|
*/

// use App\Http\Controllers\Backend\Auth\AdminLoginController;

// Route::prefix('admin')->name('admin.')->group(function () {
//     Route::middleware('guest')->group(function () {
//         Route::get('/login', [AdminLoginController::class, 'showLoginForm'])->name('login');
//         Route::post('/login', [AdminLoginController::class, 'login']);
//     });
//     
//     Route::middleware('auth')->group(function () {
//         Route::post('/logout', [AdminLoginController::class, 'logout'])->name('logout');
//     });
// });
