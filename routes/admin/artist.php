<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Artist Routes
|--------------------------------------------------------------------------
|
| These routes handle the artist management in the admin panel.
| NOTE: The main artist CRUD is now unified under /admin/music/artists
| These routes handle artist approval/verification workflow and redirect
| edit operations to the unified music artists section.
|
*/

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::prefix('artists')->name('artists.')->group(function () {
        // Main listing - redirect to unified music artists
        Route::get('/', fn() => redirect()->route('admin.music.artists.index'))->name('index');
        
        // Static routes MUST come before dynamic {artist} routes
        Route::get('/create', fn() => redirect()->route('admin.music.artists.create'))->name('create');
        Route::post('/', [\App\Http\Controllers\Backend\Admin\Content\ArtistController::class, 'store'])->name('store');
        Route::get('/pending', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'pending'])->name('pending');
        Route::get('/verified', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'verified'])->name('verified');
        Route::get('/rejected', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'rejected'])->name('rejected');
        Route::get('/suspended', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'suspended'])->name('suspended');
        Route::get('/search', [\App\Http\Controllers\Backend\Admin\Content\ArtistController::class, 'search'])->name('search');
        
        // Dynamic routes - redirect show/edit to unified music artists
        Route::get('/{artist}', fn($artist) => redirect()->route('admin.music.artists.show', $artist))->name('show');
        Route::get('/{artist}/edit', fn($artist) => redirect()->route('admin.music.artists.edit', $artist))->name('edit');
        Route::put('/{artist}', [\App\Http\Controllers\Backend\Admin\Content\ArtistController::class, 'update'])->name('update');
        Route::delete('/{artist}', [\App\Http\Controllers\Backend\Admin\Content\ArtistController::class, 'destroy'])->name('destroy');
        Route::post('/{artist}/feature', [\App\Http\Controllers\Backend\Admin\Content\ArtistController::class, 'feature'])->name('feature');
        Route::patch('/{artist}/verify', [\App\Http\Controllers\Backend\Admin\Content\ArtistController::class, 'verify'])->name('verify');
        Route::post('/{artist}/toggle-verification', [\App\Http\Controllers\Backend\Admin\Content\ArtistController::class, 'toggleVerification'])->name('toggle-verification');
        
        // Routes with {user} parameter (application-based)
        Route::post('/{user}/approve', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'approve'])->name('approve');
        Route::post('/{user}/reject', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'reject'])->name('reject');
        Route::post('/{user}/suspend', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'suspend'])->name('suspend');
        Route::post('/{user}/reactivate', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'reactivate'])->name('reactivate');
        Route::get('/{user}/revenue', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'revenue'])->name('revenue');
        Route::get('/{user}/analytics', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'artistAnalytics'])->name('analytics');
    });
});