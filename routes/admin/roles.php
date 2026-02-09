<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Role Management Routes
|--------------------------------------------------------------------------
|
| These routes handle the role management in the admin panel.
|
*/

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    // Resource routes for roles (index, create, store, show, edit, update, destroy)
    Route::resource('roles', \App\Http\Controllers\Admin\UserManagement\RoleController::class);
    
    // Custom role actions
    Route::post('roles/{role}/toggle-status', [\App\Http\Controllers\Admin\UserManagement\RoleController::class, 'toggleStatus'])->name('roles.toggle-status');
    Route::post('roles/assign-role', [\App\Http\Controllers\Admin\UserManagement\RoleController::class, 'assignRole'])->name('roles.assign');
    Route::post('roles/remove-role', [\App\Http\Controllers\Admin\UserManagement\RoleController::class, 'removeRole'])->name('roles.remove');
});