<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Frontend\AwardController;

Route::middleware(['web'])->group(function () {
    // Awards dashboard (new standalone page)
    Route::get('/awards/dashboard', [AwardController::class, 'dashboard'])->name('frontend.awards.dashboard');
    
    // Awards listing
    Route::get('/awards', [AwardController::class, 'index'])->name('frontend.awards.index');
    
    // Categories
    Route::get('/awards/categories', [AwardController::class, 'categories'])->name('frontend.awards.categories');
    
    // Category detail
    Route::get('/awards/category/{slug}', [AwardController::class, 'category'])->name('frontend.awards.category');
    
    // Winners
    Route::get('/awards/winners', [AwardController::class, 'winners'])->name('frontend.awards.winners');
    
    // Current season (redirects to active season)
    Route::get('/awards/current-season', [AwardController::class, 'currentSeason'])->name('frontend.awards.current-season');
    
    // Award season detail
    Route::get('/awards/{season}', [AwardController::class, 'season'])->name('frontend.awards.season');
    
    // Vote page (requires auth)
    Route::get('/awards/vote', [AwardController::class, 'votePage'])
        ->middleware('auth')
        ->name('frontend.awards.vote');
    
    // Voting (requires auth)
    Route::post('/awards/nominations/{nomination}/vote', [AwardController::class, 'vote'])
        ->middleware('auth')
        ->name('frontend.awards.submit-vote');
    
    // User's votes
    Route::get('/awards/my-votes', [AwardController::class, 'myVotes'])
        ->middleware('auth')
        ->name('frontend.awards.my-votes');
});
