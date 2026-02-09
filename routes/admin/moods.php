<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Backend\Admin\MoodController;

// Admin Moods Management Routes
Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    // Resource routes for moods
    Route::resource('moods', MoodController::class)->except(['show']);
});
