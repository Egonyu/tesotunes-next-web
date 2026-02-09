<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Backend\Admin\SlideshowController;

// Admin Slideshow Management Routes
Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    // Resource routes for slideshow (create, store, edit, update, destroy)
    Route::resource('slideshow', SlideshowController::class)->except(['show'])->names([
        'index' => 'slideshow.overview',
        'create' => 'slideshow.create',
        'store' => 'slideshow.store',
        'edit' => 'slideshow.edit',
        'update' => 'slideshow.update',
        'destroy' => 'slideshow.destroy',
    ]);
    
    // Custom slideshow action
    Route::post('slideshow/{slide}/toggle', [SlideshowController::class, 'toggle'])->name('slideshow.toggle');
});
