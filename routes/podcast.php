<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Frontend\Podcast\PodcastController;
use App\Http\Controllers\Frontend\Podcast\EpisodeController;
use App\Http\Controllers\Frontend\Podcast\SubscriptionController;

/*
|--------------------------------------------------------------------------
| Podcast Frontend Routes
|--------------------------------------------------------------------------
|
| These routes handle the public-facing podcast functionality.
| All routes are prefixed with '/podcasts' and named with 'podcast.' prefix.
|
*/

// Public discovery routes
Route::get('/', [PodcastController::class, 'index'])->name('index');
Route::get('/discover', [PodcastController::class, 'discover'])->name('discover');
Route::get('/categories', [PodcastController::class, 'categories'])->name('categories');
Route::get('/category/{slug}', [PodcastController::class, 'category'])->name('category');
Route::get('/trending', [PodcastController::class, 'trending'])->name('trending');
Route::get('/search', [PodcastController::class, 'search'])->name('search');

// Authenticated routes (MUST be before dynamic {podcast} routes to avoid conflicts)
Route::middleware('auth')->group(function () {
    // Create & manage podcasts (specific routes before dynamic)
    Route::get('/create', [PodcastController::class, 'create'])->name('create');
    Route::post('/create', [PodcastController::class, 'store'])->name('store');
    
    // My podcasts dashboard
    Route::get('/my/podcasts', [PodcastController::class, 'myPodcasts'])->name('my.index');
    Route::get('/my/subscriptions', [SubscriptionController::class, 'index'])->name('my.subscriptions');
    Route::get('/my/listening-history', [PodcastController::class, 'listeningHistory'])->name('my.history');
    Route::get('/my/downloads', [PodcastController::class, 'myDownloads'])->name('my.downloads');
    
    // Episode management (prefix routes before podcast detail routes)
    Route::prefix('/{podcast:slug}/episodes')->name('episode.')->group(function () {
        Route::get('/create', [EpisodeController::class, 'create'])
            ->middleware('can:update,podcast')
            ->name('create');
        
        Route::post('/', [EpisodeController::class, 'store'])
            ->middleware('can:update,podcast')
            ->name('store');
        
        Route::get('/{episode:slug}/edit', [EpisodeController::class, 'edit'])
            ->middleware('can:update,episode')
            ->name('edit');
        
        Route::put('/{episode:slug}', [EpisodeController::class, 'update'])
            ->middleware('can:update,episode')
            ->name('update');
        
        Route::delete('/{episode:slug}', [EpisodeController::class, 'destroy'])
            ->middleware('can:delete,episode')
            ->name('destroy');
        
        Route::get('/{episode:slug}/download', [EpisodeController::class, 'download'])
            ->middleware('throttle:10,1') // 10 downloads per minute
            ->name('download');
    });
    
    // Podcast management routes with dynamic parameter
    Route::get('/{podcast:slug}/edit', [PodcastController::class, 'edit'])
        ->middleware('can:update,podcast')
        ->name('edit');
    
    Route::put('/{podcast:slug}', [PodcastController::class, 'update'])
        ->middleware('can:update,podcast')
        ->name('update');
    
    Route::delete('/{podcast:slug}', [PodcastController::class, 'destroy'])
        ->middleware('can:delete,podcast')
        ->name('destroy');
    
    // Podcast analytics
    Route::get('/{podcast:slug}/analytics', [PodcastController::class, 'analytics'])
        ->middleware('can:update,podcast')
        ->name('analytics');
    
    // Subscription actions
    Route::post('/{podcast}/subscribe', [SubscriptionController::class, 'subscribe'])->name('subscribe');
    Route::delete('/{podcast}/unsubscribe', [SubscriptionController::class, 'unsubscribe'])->name('unsubscribe');
});

// Podcast detail routes (MUST be last - contains wildcard routes)
Route::get('/{podcast:slug}', [PodcastController::class, 'show'])->name('show');
Route::get('/{podcast:slug}/episodes', [PodcastController::class, 'episodes'])->name('episodes');
Route::get('/{podcast:slug}/about', [PodcastController::class, 'about'])->name('about');

// Episode detail route
Route::get('/{podcast:slug}/episode/{episode:slug}', [EpisodeController::class, 'show'])->name('episode.show');
