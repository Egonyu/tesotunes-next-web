<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Music Routes
|--------------------------------------------------------------------------
|
| These routes handle the music and content management in the admin panel.
|
*/

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::middleware('role:moderator,admin,super_admin')->prefix('music')->name('music.')->group(function () {
        // Main Music Dashboard
        Route::get('/', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'index'])->name('index');

        // Songs Management
        Route::prefix('songs')->name('songs.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'songs'])->name('index');
            Route::get('/create', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'createSong'])->name('create');
            Route::post('/', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'storeSong'])->name('store');
            Route::get('/{song}', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'showSong'])->name('show');
            Route::get('/{song}/edit', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'editSong'])->name('edit');
            Route::put('/{song}', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'updateSong'])->name('update');
            Route::delete('/{song}', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'deleteSong'])->name('destroy');
            Route::post('/{song}/approve', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'approveSong'])->name('approve');
            Route::post('/{song}/reject', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'rejectSong'])->name('reject');
            Route::post('/{song}/feature', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'featureSong'])->name('feature');
        });

        // AJAX search endpoint for artist selection
        Route::get('/ajax/search-artists', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'searchArtists'])->name('ajax.search-artists');

        // Albums Management
        Route::prefix('albums')->name('albums.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'albums'])->name('index');
            Route::get('/create', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'createAlbum'])->name('create');
            Route::post('/', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'storeAlbum'])->name('store');
            Route::get('/{album}', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'showAlbum'])->name('show');
            Route::get('/{album}/edit', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'editAlbum'])->name('edit');
            Route::put('/{album}', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'updateAlbum'])->name('update');
            Route::delete('/{album}', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'destroyAlbum'])->name('destroy');
            Route::post('/{album}/feature', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'featureAlbum'])->name('feature');
        });

        // Artists Management
        Route::prefix('artists')->name('artists.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'artists'])->name('index');
            Route::get('/create', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'createArtist'])->name('create');
            Route::post('/', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'storeArtist'])->name('store');
            Route::get('/{artist}', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'showArtist'])->name('show');
            Route::get('/{artist}/edit', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'editArtist'])->name('edit');
            Route::put('/{artist}', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'updateArtist'])->name('update');
            Route::delete('/{artist}', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'destroyArtist'])->name('destroy');
            Route::patch('/{artist}/verify', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'verifyArtist'])->name('verify');
            Route::post('/{artist}/feature', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'featureArtist'])->name('feature');
        });

        // Playlists Management
        Route::prefix('playlists')->name('playlists.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'playlists'])->name('index');
            Route::get('/create', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'createPlaylist'])->name('create');
            Route::post('/', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'storePlaylist'])->name('store');
            Route::get('/{playlist}', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'showPlaylist'])->name('show');
            Route::get('/{playlist}/edit', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'editPlaylist'])->name('edit');
            Route::put('/{playlist}', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'updatePlaylist'])->name('update');
            Route::delete('/{playlist}', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'destroyPlaylist'])->name('destroy');
            Route::post('/{playlist}/feature', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'featurePlaylist'])->name('feature');
        });

        // Genres Management
        Route::prefix('genres')->name('genres.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'genres'])->name('index');
            Route::get('/create', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'createGenre'])->name('create');
            Route::post('/', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'storeGenre'])->name('store');
            Route::get('/{genre}', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'showGenre'])->name('show');
            Route::get('/{genre}/edit', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'editGenre'])->name('edit');
            Route::put('/{genre}', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'updateGenre'])->name('update');
            Route::delete('/{genre}', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'destroyGenre'])->name('destroy');
        });

        // Content Moderation
        Route::prefix('moderation')->name('moderation.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'contentModeration'])->name('index');
            Route::post('/moderate', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'moderateContent'])->name('moderate');
            Route::get('/logs', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'moderationLogs'])->name('logs');
        });

        // Advanced Features
        Route::get('/analytics', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'analytics'])->name('analytics');
        Route::get('/featured', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'featuredContent'])->name('featured');
        Route::post('/bulk-actions', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'bulkActions'])->name('bulk-actions');
        Route::get('/export', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'exportData'])->name('export');
        Route::get('/reports', [\App\Http\Controllers\Backend\Admin\MusicController::class, 'reportedContent'])->name('reports');
    });
});
