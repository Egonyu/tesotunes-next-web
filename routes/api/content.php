<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\GenreController;
use App\Http\Controllers\Api\MoodController;

// Content API Routes (Genres & Moods)
Route::prefix('content')->name('api.content.')->group(function () {
    // Genres
    Route::get('/genres', [GenreController::class, 'index'])->name('genres.index');
    Route::get('/genres/{genre}', [GenreController::class, 'show'])->name('genres.show');
    
    // Moods
    Route::get('/moods', [MoodController::class, 'index'])->name('moods.index');
    Route::get('/moods/{mood}', [MoodController::class, 'show'])->name('moods.show');
});
