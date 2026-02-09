<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Auth Routes
|--------------------------------------------------------------------------
|
| These routes handle the admin panel authentication.
|
*/

Route::prefix('admin')->name('admin.')->group(function () {

    Route::middleware('guest')->group(function () {
        Route::get('/login', [\App\Http\Controllers\Backend\Admin\Auth\AuthController::class, 'loginView'])->name('login');
        Route::post('/login', [\App\Http\Controllers\Backend\Admin\Auth\AuthController::class, 'login'])->name('login.post');

        // Two-Factor Authentication
        Route::get('/2fa-challenge', [\App\Http\Controllers\Backend\Admin\Auth\AuthController::class, 'twoFactorChallenge'])->name('auth.2fa-challenge');
        Route::post('/2fa-verify', [\App\Http\Controllers\Backend\Admin\Auth\AuthController::class, 'verifyTwoFactor'])->name('auth.2fa-verify');
    });

    Route::middleware(['auth', 'admin'])->group(function () {
        Route::post('/logout', [\App\Http\Controllers\Backend\Admin\Auth\AuthController::class, 'logout'])->name('logout');
    });
});
