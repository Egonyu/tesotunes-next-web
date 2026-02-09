<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GenreController;
use App\Http\Controllers\MoodController;

// Content Discovery Routes (Genres & Moods)
Route::middleware(['web'])->group(function () {
    // Genres
    Route::get('/genres', [GenreController::class, 'index'])->name('genres.index');
    Route::get('/genre/{genre}', [GenreController::class, 'show'])->name('genre.show');
    
    // Moods
    Route::get('/moods', [MoodController::class, 'index'])->name('moods.index');
    Route::get('/mood/{mood}', [MoodController::class, 'show'])->name('mood.show');
});
