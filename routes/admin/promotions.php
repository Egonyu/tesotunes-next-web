<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Community Promotions Routes
|--------------------------------------------------------------------------
|
| These routes handle the community promotions management in the admin panel.
|
*/

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    // Resource routes for promotions (index, create, store, show, edit, update, destroy)
    Route::resource('promotions', \App\Http\Controllers\Backend\Admin\PromotionController::class);
    
    // Custom promotion actions
    Route::post('promotions/{promotion}/approve', [\App\Http\Controllers\Backend\Admin\PromotionController::class, 'approve'])->name('promotions.approve');
    Route::post('promotions/{promotion}/reject', [\App\Http\Controllers\Backend\Admin\PromotionController::class, 'reject'])->name('promotions.reject');
    Route::get('promotions/{promotion}/participants', [\App\Http\Controllers\Backend\Admin\PromotionController::class, 'participants'])->name('promotions.participants');
});