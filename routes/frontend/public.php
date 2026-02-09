<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Frontend Public Routes
|--------------------------------------------------------------------------
|
| These routes are accessible by everyone, including guests.
| They handle marketing pages, public music discovery, and content pages.
|
*/

Route::name('frontend.')->group(function () {

    // Landing and Marketing Pages  
    Route::get('/', [\App\Http\Controllers\Frontend\HomeController::class, 'index'])->name('home');
    Route::get('/about', [\App\Http\Controllers\Frontend\HomeController::class, 'about'])->name('about');
    Route::get('/features', [\App\Http\Controllers\Frontend\HomeController::class, 'features'])->name('features');
    Route::get('/pricing', [\App\Http\Controllers\Frontend\HomeController::class, 'pricing'])->name('pricing');
    Route::get('/contact', [\App\Http\Controllers\Frontend\HomeController::class, 'contact'])->name('contact');
    Route::post('/contact', [\App\Http\Controllers\Frontend\HomeController::class, 'submitContact'])->name('contact.submit');

    // Edula (Community Hub) - Main "For You" Feed (accessible to guests and authenticated users)
    Route::get('/edula', [\App\Http\Controllers\Frontend\EdulaController::class, 'index'])->name('edula');
    Route::get('/edula/api/feed', [\App\Http\Controllers\Frontend\EdulaController::class, 'getFeed'])->name('edula.api.feed');
    Route::post('/edula/api/refresh', [\App\Http\Controllers\Frontend\EdulaController::class, 'refresh'])->name('edula.refresh');
    Route::post('/edula/api/items/{uuid}/not-interested', [\App\Http\Controllers\Frontend\EdulaController::class, 'notInterested'])->name('edula.not-interested');
    Route::post('/edula/api/items/{uuid}/save', [\App\Http\Controllers\Frontend\EdulaController::class, 'saveItem'])->name('edula.save');
    Route::post('/edula/api/items/{uuid}/track', [\App\Http\Controllers\Frontend\EdulaController::class, 'trackInteraction'])->name('edula.track');
    
    // Backward compatibility: timeline as alias for edula (for route() helper)
    Route::get('/timeline', [\App\Http\Controllers\Frontend\EdulaController::class, 'index'])->name('timeline');
    
    // Legacy feed check endpoint (keep for backward compat)
    Route::get('/edula/feed', [\App\Http\Controllers\Frontend\SocialFeedController::class, 'checkNewPosts'])->name('edula.feed');

    // Public Playlists (accessible by everyone, but shows different content based on auth)
    Route::get('/playlists', [\App\Http\Controllers\Frontend\DiscoverController::class, 'playlists'])->name('playlists.index');
    Route::prefix('playlists')->name('playlists.')->group(function () {
        Route::get('/{playlist}', [\App\Http\Controllers\Frontend\PlaylistController::class, 'show'])->name('show');
    });

    // Public Music Discovery (Simplified URLs)
    Route::get('/discover', [\App\Http\Controllers\Frontend\DiscoverController::class, 'index'])->name('discover');
    Route::get('/trending', [\App\Http\Controllers\Frontend\DiscoverController::class, 'trending'])->name('trending');
    Route::get('/genres', [\App\Http\Controllers\Frontend\DiscoverController::class, 'genres'])->name('genres');
    Route::get('/artists', [\App\Http\Controllers\Frontend\DiscoverController::class, 'artists'])->name('artists');
    Route::get('/search', [\App\Http\Controllers\Frontend\DiscoverController::class, 'search'])->name('search');

    // Backward compatibility redirects for old /discover sub-URLs
    Route::redirect('/discover/trending', '/trending', 301);
    Route::redirect('/discover/genres', '/genres', 301);
    Route::redirect('/discover/artists', '/artists', 301);
    Route::redirect('/discover/playlists', '/playlists', 301);
    Route::redirect('/discover/search', '/search', 301);

    // Songs Routes
    Route::prefix('songs')->name('songs.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Frontend\SongController::class, 'index'])->name('index');
        Route::get('/{song}', [\App\Http\Controllers\Frontend\SongController::class, 'show'])->name('show');
    });

    // Public User Profiles (accessible to everyone)
    Route::get('/profile/{user}', [\App\Http\Controllers\Frontend\ProfileController::class, 'showUser'])->name('profile.user');

    // Public content routes (non-wildcard first)
    Route::get('/playlist/{playlist}', [\App\Http\Controllers\Frontend\PlaylistController::class, 'show'])->name('playlist.show');
    Route::get('/playlists/{playlist}', [\App\Http\Controllers\Frontend\PlaylistController::class, 'show'])->name('playlists.show');
    Route::get('/song/{song}', [\App\Http\Controllers\Frontend\SongController::class, 'show'])->name('song.show');
    Route::get('/album/{album}', [\App\Http\Controllers\Frontend\AlbumController::class, 'show'])->name('albums.show');
    Route::get('/albums/{album}', [\App\Http\Controllers\Frontend\AlbumController::class, 'show'])->name('album.show');

    // Public Artist Profiles (Wildcard routes MUST come last to avoid conflicts)
    Route::get('/artist/{artist}', [\App\Http\Controllers\Frontend\ArtistController::class, 'show'])->name('artist.show');
    Route::get('/artists/{artist}', [\App\Http\Controllers\Frontend\ArtistController::class, 'show'])->name('artists.show');
    Route::get('/artist/{artist}/tracks', [\App\Http\Controllers\Frontend\ArtistController::class, 'tracks'])->name('artist.tracks');
    Route::get('/artist/{artist}/albums', [\App\Http\Controllers\Frontend\ArtistController::class, 'albums'])->name('artist.albums');
    Route::get('/artist/{artist}/about', [\App\Http\Controllers\Frontend\ArtistController::class, 'about'])->name('artist.about');
    
    // Slug-based Routes (e.g., /username/dashboard or /artist-slug/dashboard)
    // These use slug directly without prefix for cleaner URLs
    // First checks if it's an artist slug, then falls back to username
    Route::get('/{slug}/dashboard', [\App\Http\Controllers\Frontend\SlugDashboardController::class, 'dashboard'])->name('slug.dashboard');
    Route::get('/{artistSlug}/store', [\App\Http\Controllers\Frontend\ArtistStoreController::class, 'index'])->name('artist.slug.store');
    Route::get('/{artistSlug}/music', [\App\Http\Controllers\Frontend\ArtistController::class, 'tracks'])->name('artist.slug.music');
    Route::get('/{artistSlug}/albums', [\App\Http\Controllers\Frontend\ArtistController::class, 'albums'])->name('artist.slug.albums');
});