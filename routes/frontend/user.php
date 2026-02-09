<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Frontend User Routes
|--------------------------------------------------------------------------
|
| These routes are for authenticated users and handle features like the
| dashboard, player, credits, promotions, profile, playlists, and social features.
|
*/

Route::middleware(['auth'])->name('frontend.')->group(function () {

    // Authenticated Timeline Actions
    Route::post('/timeline/toggle', [\App\Http\Controllers\Frontend\SocialFeedController::class, 'toggleDashboard'])->name('timeline.toggle');
    Route::post('/timeline/not-interested', [\App\Http\Controllers\Frontend\SocialFeedController::class, 'notInterested'])->name('timeline.not-interested');
    
    // User Dashboard (redirects artists to artist dashboard automatically)
    Route::get('/dashboard', [\App\Http\Controllers\Frontend\UserDashboardController::class, 'index'])->name('dashboard');
    
    // User Dashboard API endpoints
    Route::get('/dashboard/api', [\App\Http\Controllers\Frontend\UserDashboardController::class, 'apiData'])->name('dashboard.api');
    Route::post('/dashboard/preferences', [\App\Http\Controllers\Frontend\UserDashboardController::class, 'updatePreferences'])->name('dashboard.preferences');
    
    // Backward compatibility redirects
    Route::get('/home', fn() => redirect()->route('frontend.dashboard'));
    Route::get('/old-dashboard', fn() => redirect()->route('frontend.dashboard'));

    // Music Player Interface
    Route::prefix('player')->name('player.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Frontend\PlayerController::class, 'index'])->name('index');
        Route::get('/library', [\App\Http\Controllers\Frontend\PlayerController::class, 'library'])->name('library');
        Route::get('/queue', [\App\Http\Controllers\Frontend\PlayerController::class, 'queue'])->name('queue');
        Route::get('/history', [\App\Http\Controllers\Frontend\PlayerController::class, 'history'])->name('history');
        Route::get('/downloads', [\App\Http\Controllers\Frontend\PlayerController::class, 'downloads'])->name('downloads');
    });

    // Credit System Interface
    Route::middleware('feature:credits')->prefix('credits')->name('credits.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Frontend\CreditController::class, 'index'])->name('index');
        Route::get('/earn', [\App\Http\Controllers\Frontend\CreditController::class, 'earn'])->name('earn');
        Route::get('/spend', [\App\Http\Controllers\Frontend\CreditController::class, 'spend'])->name('spend');
        Route::get('/history', [\App\Http\Controllers\Frontend\CreditController::class, 'history'])->name('history');
        Route::post('/claim-daily', [\App\Http\Controllers\Frontend\CreditController::class, 'claimDaily'])->name('claim-daily');
        Route::post('/transfer', [\App\Http\Controllers\Frontend\CreditController::class, 'transfer'])->name('transfer');
    });

    // Community Promotions Interface
    Route::middleware('feature:promotions')->prefix('promotions')->name('promotions.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Frontend\PromotionController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\Frontend\PromotionController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\Frontend\PromotionController::class, 'store'])->name('store');
        Route::get('/{promotion}', [\App\Http\Controllers\Frontend\PromotionController::class, 'show'])->name('show');
        Route::post('/{promotion}/participate', [\App\Http\Controllers\Frontend\PromotionController::class, 'participate'])->name('participate');
        Route::get('/my/created', [\App\Http\Controllers\Frontend\PromotionController::class, 'myCreated'])->name('my.created');
        Route::get('/my/participated', [\App\Http\Controllers\Frontend\PromotionController::class, 'myParticipated'])->name('my.participated');
    });

    // User Profile Management
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Frontend\ProfileController::class, 'show'])->name('show');
        Route::get('/edit', [\App\Http\Controllers\Frontend\ProfileController::class, 'edit'])->name('edit');
        Route::get('/settings', [\App\Http\Controllers\Frontend\ProfileController::class, 'settings'])->name('settings');
        Route::put('/', [\App\Http\Controllers\Frontend\ProfileController::class, 'update'])->name('update');
        Route::post('/avatar', [\App\Http\Controllers\Frontend\ProfileController::class, 'updateAvatar'])->name('avatar');
        Route::post('/settings', [\App\Http\Controllers\Frontend\ProfileController::class, 'updateSettings'])->name('settings.update');
        
        // Payment History
        Route::get('/payments', [\App\Http\Controllers\Frontend\ProfileController::class, 'paymentHistory'])->name('payments');
        Route::get('/payments/{uuid}', [\App\Http\Controllers\Frontend\ProfileController::class, 'paymentDetails'])->name('payments.show');
        
        // Note: Public user profile route moved to routes/frontend/public.php for guest access
    });

    // Playlist Management (Auth-protected actions only)
    Route::middleware('feature:playlists')->prefix('playlists')->name('playlists.')->group(function () {
        Route::get('/create', [\App\Http\Controllers\Frontend\PlaylistController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\Frontend\PlaylistController::class, 'store'])->name('store');
        Route::get('/{playlist}/edit', [\App\Http\Controllers\Frontend\PlaylistController::class, 'edit'])->name('edit');
        Route::put('/{playlist}', [\App\Http\Controllers\Frontend\PlaylistController::class, 'update'])->name('update');
        Route::delete('/{playlist}', [\App\Http\Controllers\Frontend\PlaylistController::class, 'destroy'])->name('destroy');
        Route::post('/{playlist}/songs', [\App\Http\Controllers\Frontend\PlaylistController::class, 'addSong'])->name('add-song');
        Route::delete('/{playlist}/songs/{song}', [\App\Http\Controllers\Frontend\PlaylistController::class, 'removeSong'])->name('remove-song');
        Route::post('/{playlist}/follow', [\App\Http\Controllers\Frontend\PlaylistController::class, 'follow'])->name('follow');
        Route::delete('/{playlist}/follow', [\App\Http\Controllers\Frontend\PlaylistController::class, 'unfollow'])->name('unfollow');
    });

    // Social Features
    Route::middleware('feature:social_features')->prefix('social')->name('social.')->group(function () {
        Route::get('/feed', [\App\Http\Controllers\Frontend\SocialFeedController::class, 'index'])->name('feed');
        Route::get('/feed/check-new', [\App\Http\Controllers\Frontend\SocialFeedController::class, 'checkNewPosts'])->name('feed.check-new');
        Route::post('/feed/store', [\App\Http\Controllers\Frontend\SocialFeedController::class, 'store'])->name('feed.store');
        
        // Comments
        Route::get('/activity/{activity}/comments', [\App\Http\Controllers\Frontend\SocialFeedController::class, 'getComments'])->name('activity.comments');
        Route::post('/comments/store', [\App\Http\Controllers\Frontend\SocialFeedController::class, 'storeComment'])->name('comments.store');
        Route::post('/comments/{comment}/like', [\App\Http\Controllers\Frontend\SocialFeedController::class, 'likeComment'])->name('comments.like');
        Route::delete('/comments/{comment}', [\App\Http\Controllers\Frontend\SocialFeedController::class, 'deleteComment'])->name('comments.delete');
        
        Route::get('/followers', [\App\Http\Controllers\Frontend\SocialController::class, 'followers'])->name('followers');
        Route::get('/following', [\App\Http\Controllers\Frontend\SocialController::class, 'following'])->name('following');
        Route::get('/activity', [\App\Http\Controllers\Frontend\SocialController::class, 'activity'])->name('activity');
        Route::post('/follow/{user}', [\App\Http\Controllers\Frontend\SocialController::class, 'follow'])->name('follow');
        Route::post('/like/{type}/{id}', [\App\Http\Controllers\Frontend\SocialController::class, 'like'])->name('like');
        Route::post('/share/{type}/{id}', [\App\Http\Controllers\Frontend\SocialController::class, 'share'])->name('share');
        Route::post('/comment', [\App\Http\Controllers\Frontend\SocialController::class, 'comment'])->name('comment');
    });

    // Notifications
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Frontend\NotificationController::class, 'index'])->name('index');
        Route::post('/{notification}/read', [\App\Http\Controllers\Frontend\NotificationController::class, 'markRead'])->name('read');
        Route::post('/mark-all-read', [\App\Http\Controllers\Frontend\NotificationController::class, 'markAllRead'])->name('mark-all-read');
        Route::delete('/{notification}', [\App\Http\Controllers\Frontend\NotificationController::class, 'destroy'])->name('destroy');
    });

    // Mobile Verification Routes (Authenticated users only)
    Route::middleware(['auth', 'feature:mobile_verification'])->prefix('mobile-verification')->name('mobile-verification.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Frontend\MobileVerificationController::class, 'show'])->name('show');
        Route::post('/send-code', [\App\Http\Controllers\Frontend\MobileVerificationController::class, 'sendCode'])->name('send-code');
        Route::post('/verify', [\App\Http\Controllers\Frontend\MobileVerificationController::class, 'verify'])->name('verify');
        Route::post('/update-phone', [\App\Http\Controllers\Frontend\MobileVerificationController::class, 'updatePhone'])->name('update-phone');
    });

    // Phone verification alias route (for compatibility)
    Route::middleware(['auth', 'feature:mobile_verification'])->group(function () {
        Route::get('/phone-verification', [\App\Http\Controllers\Frontend\MobileVerificationController::class, 'show'])->name('auth.phone-verification');
    });

    // Artist follow/unfollow (requires auth)
    Route::post('/artist/{artist}/follow', [\App\Http\Controllers\Frontend\ArtistController::class, 'follow'])->name('artist.follow');
    Route::post('/artist/{artist}/unfollow', [\App\Http\Controllers\Frontend\ArtistController::class, 'unfollow'])->name('artist.unfollow');
    
    // Music Streaming and Download Routes (requires auth)
    Route::get('/music/stream', [\App\Http\Controllers\Frontend\MusicStreamController::class, 'stream'])->name('music.stream');
    Route::get('/music/download', [\App\Http\Controllers\Frontend\MusicStreamController::class, 'download'])->name('music.download');

    // Address Management
    Route::prefix('addresses')->name('addresses.')->group(function () {
        Route::post('/', [\App\Http\Controllers\Frontend\AddressController::class, 'store'])->name('store');
        Route::put('/{address}', [\App\Http\Controllers\Frontend\AddressController::class, 'update'])->name('update');
        Route::delete('/{address}', [\App\Http\Controllers\Frontend\AddressController::class, 'destroy'])->name('destroy');
        Route::post('/{address}/set-default', [\App\Http\Controllers\Frontend\AddressController::class, 'setDefault'])->name('set-default');
    });
});