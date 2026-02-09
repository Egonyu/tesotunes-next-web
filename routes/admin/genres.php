<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Backend\Admin\GenreController;

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    // Resource routes for genres
    Route::resource('genres', GenreController::class)->except(['show']);
});
