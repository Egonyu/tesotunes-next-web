<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin User Management Routes
|--------------------------------------------------------------------------
|
| These routes handle the user management in the admin panel.
|
*/

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    // Resource routes for users (index, create, store, show, edit, update, destroy)
    Route::resource('users', \App\Http\Controllers\Admin\UserManagement\UserController::class);
    
    // Custom user actions
    Route::post('users/{user}/activate', [\App\Http\Controllers\Admin\UserManagement\UserController::class, 'activate'])->name('users.activate');
    Route::post('users/{user}/deactivate', [\App\Http\Controllers\Admin\UserManagement\UserController::class, 'deactivate'])->name('users.deactivate');
    Route::post('users/{user}/ban', [\App\Http\Controllers\Admin\UserManagement\UserController::class, 'ban'])->name('users.ban');
    Route::post('users/{user}/unban', [\App\Http\Controllers\Admin\UserManagement\UserController::class, 'unban'])->name('users.unban');
    Route::post('users/{user}/toggle-status', [\App\Http\Controllers\Admin\UserManagement\UserController::class, 'toggleStatus'])->name('users.toggle-status');
    Route::post('users/{user}/verify-email', [\App\Http\Controllers\Admin\UserManagement\UserController::class, 'verifyEmail'])->name('users.verify-email');
    Route::post('users/{user}/toggle-two-factor', [\App\Http\Controllers\Admin\UserManagement\UserController::class, 'toggleTwoFactor'])->name('users.toggle-two-factor');
    Route::post('users/{user}/impersonate', [\App\Http\Controllers\Admin\UserManagement\UserController::class, 'impersonate'])->name('users.impersonate');
    Route::post('users/stop-impersonating', [\App\Http\Controllers\Admin\UserManagement\UserController::class, 'stopImpersonating'])->name('users.stop-impersonating');
    Route::post('users/assign-role', [\App\Http\Controllers\Admin\UserManagement\UserController::class, 'assignRole'])->name('users.assign-role');
    Route::post('users/remove-role', [\App\Http\Controllers\Admin\UserManagement\UserController::class, 'removeRole'])->name('users.remove-role');
    Route::get('users/{user}/export-data', [\App\Http\Controllers\Admin\UserManagement\UserController::class, 'exportData'])->name('users.export-data');
});