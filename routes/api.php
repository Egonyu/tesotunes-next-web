<?php

use Illuminate\Support\Facades\Route;
use App\Services\AdService;
use Illuminate\Http\Request;
use App\Http\Controllers\HealthCheckController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application.
| These routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Health check endpoints
Route::get('/health', [HealthCheckController::class, 'index']);
Route::get('/health/detailed', [HealthCheckController::class, 'detailed']);
Route::get('/health/system', [HealthCheckController::class, 'system']);

// Wazuh SIEM Integration
require __DIR__ . '/api/wazuh.php';

// Authentication API Routes
require __DIR__ . '/api/auth.php';

// Music API Routes
require __DIR__ . '/api/music.php';

// Engagement API Routes
require __DIR__ . '/api/engagement.php';

// Payment API Routes (Day 4)
require __DIR__ . '/api/payment.php';

// Webhook API Routes (ZengaPay, etc.)
require __DIR__ . '/api/webhooks.php';

// E-commerce API Routes (Day 5)
require __DIR__ . '/api/ecommerce.php';

// Social & Events API Routes (Day 6)
require __DIR__ . '/api/social.php';

// Loyalty (Artist Fan Clubs) API Routes
require __DIR__ . '/api/loyalty.php';

// Ad tracking endpoints (no auth required for impressions)
Route::post('/ads/impression', [\App\Http\Controllers\Api\AdTrackingController::class, 'recordImpression']);
Route::post('/ads/click', [\App\Http\Controllers\Api\AdTrackingController::class, 'recordClick']);

// Theme preference (works for both guests and authenticated users)
Route::post('/theme', [\App\Http\Controllers\ThemeController::class, 'update'])->name('api.theme.update');
Route::get('/theme', [\App\Http\Controllers\ThemeController::class, 'get'])->name('api.theme.get');

// Genres API endpoint for artist registration
Route::get('/genres', [\App\Http\Controllers\Api\GenreController::class, 'index']);

// Slideshow API endpoints
Route::prefix('slideshow')->name('api.slideshow.')->group(function () {
    Route::get('/{section}', [\App\Http\Controllers\Api\SlideshowController::class, 'index'])
        ->where('section', 'home|discover|radio|community|trending|channels|all')
        ->name('section');
    Route::get('/genre/{slug}', [\App\Http\Controllers\Api\SlideshowController::class, 'byGenre'])->name('genre');
    Route::get('/mood/{slug}', [\App\Http\Controllers\Api\SlideshowController::class, 'byMood'])->name('mood');
});

// Player API endpoints
Route::middleware('auth:sanctum')->prefix('player')->name('api.player.')->group(function () {
    Route::post('/update-now-playing', [\App\Http\Controllers\Api\PlayerController::class, 'updateNowPlaying'])->name('now-playing');
    Route::post('/record-play', [\App\Http\Controllers\Api\PlayerController::class, 'recordPlay'])->name('record-play');
});

// Activity Interaction API endpoints
Route::middleware('auth:sanctum')->group(function () {
    // Like/Unlike any entity
    Route::post('/like/{type}/{id}', [\App\Http\Controllers\Api\ActivityInteractionController::class, 'toggleLike'])
        ->name('api.like.toggle');
    
    // Bookmark/Unbookmark any entity
    Route::post('/bookmark/{type}/{id}', [\App\Http\Controllers\Api\ActivityInteractionController::class, 'toggleBookmark'])
        ->name('api.bookmark.toggle');
    
    // Event interest
    Route::post('/events/{id}/interest', [\App\Http\Controllers\Api\ActivityInteractionController::class, 'toggleEventInterest'])
        ->name('api.events.interest');
    
    // Poll voting
    Route::post('/polls/{poll}/vote', [\App\Http\Controllers\Api\PollVoteController::class, 'vote'])
        ->name('api.polls.vote');
});

// Poll results (public)
Route::get('/polls/{poll}/results', [\App\Http\Controllers\Api\PollVoteController::class, 'results'])
    ->name('api.polls.results');


// Content API (Genres & Moods)
require __DIR__ . '/api/content.php';

Route::prefix('v1')->name('api.v1.')->group(function () {
    require __DIR__ . '/api/v1/api.php';
});

// Store Module API Routes (if enabled)
if (config('store.enabled', false)) {
    Route::prefix('v1/store')->name('api.v1.store.')->group(function () {
        require app_path('Modules/Store/Routes/api.php');
    });
}

// Store API routes
require __DIR__ . '/api/store.php';

// Admin Store Settings API
Route::middleware(['web', 'auth', 'role:admin,super_admin,finance'])->prefix('admin/store')->name('admin.store.api.')->group(function () {
    Route::get('/settings', [\App\Http\Controllers\Backend\Store\StoreSettingsController::class, 'apiIndex'])->name('settings.get');
    Route::post('/settings', [\App\Http\Controllers\Backend\Store\StoreSettingsController::class, 'apiUpdate'])->name('settings.update');
    
    // Store Management API (for admin/store dashboard)
    Route::get('/stats', [\App\Http\Controllers\Api\Admin\StoreApiController::class, 'stats'])->name('stats');
    Route::get('/products', [\App\Http\Controllers\Api\Admin\StoreApiController::class, 'products'])->name('products.index');
    Route::post('/products', [\App\Http\Controllers\Api\Admin\StoreApiController::class, 'createProduct'])->name('products.store');
    Route::put('/products/{product}', [\App\Http\Controllers\Api\Admin\StoreApiController::class, 'updateProduct'])->name('products.update');
    Route::post('/products/{product}/toggle-status', [\App\Http\Controllers\Api\Admin\StoreApiController::class, 'toggleProductStatus'])->name('products.toggle');
    Route::delete('/products/{product}', [\App\Http\Controllers\Api\Admin\StoreApiController::class, 'deleteProduct'])->name('products.delete');
    Route::get('/orders', [\App\Http\Controllers\Api\Admin\StoreApiController::class, 'orders'])->name('orders.index');
    Route::post('/orders/{order}/status', [\App\Http\Controllers\Api\Admin\StoreApiController::class, 'updateOrderStatus'])->name('orders.status');
    
    // Shop management
    Route::get('/shops', [\App\Http\Controllers\Api\Admin\StoreApiController::class, 'shops'])->name('shops.index');
    Route::post('/shops', [\App\Http\Controllers\Api\Admin\StoreApiController::class, 'createShop'])->name('shops.store');
    Route::put('/shops/{store}', [\App\Http\Controllers\Api\Admin\StoreApiController::class, 'updateShop'])->name('shops.update');
    Route::post('/shops/{store}/toggle-status', [\App\Http\Controllers\Api\Admin\StoreApiController::class, 'toggleShopStatus'])->name('shops.toggle');
    Route::post('/shops/{store}/approve', [\App\Http\Controllers\Api\Admin\StoreApiController::class, 'approveShop'])->name('shops.approve');
    Route::post('/shops/{store}/suspend', [\App\Http\Controllers\Api\Admin\StoreApiController::class, 'suspendShop'])->name('shops.suspend');
    Route::post('/shops/{store}/verify', [\App\Http\Controllers\Api\Admin\StoreApiController::class, 'verifyShop'])->name('shops.verify');
    Route::post('/shops/{store}/unverify', [\App\Http\Controllers\Api\Admin\StoreApiController::class, 'unverifyShop'])->name('shops.unverify');
    Route::delete('/shops/{store}', [\App\Http\Controllers\Api\Admin\StoreApiController::class, 'deleteShop'])->name('shops.delete');
    Route::get('/analytics', [\App\Http\Controllers\Api\Admin\StoreApiController::class, 'analytics'])->name('analytics');
    
    // Legacy analytics route (kept for backwards compatibility)
    Route::get('/data', [\App\Http\Controllers\Backend\Store\StoreAnalyticsController::class, 'apiData'])->name('data');
});

// Backend Store API Routes (for admin dashboard)
Route::middleware(['auth', 'role:admin,super_admin,finance'])->prefix('backend/store')->name('api.backend.store.')->group(function () {
    Route::get('/stats', [\App\Http\Controllers\Backend\Store\StoreManagementController::class, 'getStats'])->name('stats');
    Route::get('/shops', [\App\Http\Controllers\Backend\Store\StoreManagementController::class, 'getShops'])->name('shops');
    Route::get('/products', [\App\Http\Controllers\Backend\Store\StoreManagementController::class, 'getProducts'])->name('products');
    Route::get('/orders', [\App\Http\Controllers\Backend\Store\StoreManagementController::class, 'getOrders'])->name('orders');
    Route::get('/export', [\App\Http\Controllers\Backend\Store\StoreManagementController::class, 'export'])->name('export');
});


// Cross-Module Notification API Routes
Route::middleware('auth:sanctum')->prefix('notifications')->name('api.notifications.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\NotificationController::class, 'index'])->name('index');
    Route::get('/unread-counts', [\App\Http\Controllers\Api\NotificationController::class, 'unreadCounts'])->name('unread-counts');
    Route::get('/recent', [\App\Http\Controllers\Api\NotificationController::class, 'recent'])->name('recent');
    Route::get('/settings', [\App\Http\Controllers\Api\NotificationController::class, 'settings'])->name('settings');
    Route::put('/settings', [\App\Http\Controllers\Api\NotificationController::class, 'updateSettings'])->name('update-settings');
    Route::post('/mark-all-read', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
    Route::post('/{notification}/mark-read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead'])->name('mark-read');
    Route::delete('/{notification}', [\App\Http\Controllers\Api\NotificationController::class, 'destroy'])->name('delete');

    // Admin only routes
    Route::middleware('role:admin')->group(function () {
        // Removed send-test route - use proper notification testing
        Route::get('/analytics', [\App\Http\Controllers\Api\NotificationController::class, 'analytics'])->name('analytics');
        Route::post('/preview', [\App\Http\Controllers\Api\NotificationController::class, 'preview'])->name('preview');
    });
});

// Mobile Content API Routes (for sliders)
Route::prefix('mobile')->name('api.mobile.')->group(function () {
    Route::get('/trending/songs', [\App\Http\Controllers\Api\MobileContentController::class, 'trendingSongs'])->name('trending.songs');
    Route::get('/popular/artists', [\App\Http\Controllers\Api\MobileContentController::class, 'popularArtists'])->name('popular.artists');
    Route::get('/popular/albums', [\App\Http\Controllers\Api\MobileContentController::class, 'popularAlbums'])->name('popular.albums');
    Route::get('/radio/stations', [\App\Http\Controllers\Api\MobileContentController::class, 'radioStations'])->name('radio.stations');
    Route::get('/featured/charts', [\App\Http\Controllers\Api\MobileContentController::class, 'featuredCharts'])->name('featured.charts');
});

// Mobile App API Routes (React Native)
require __DIR__ . '/api/mobile.php';

// Payment API Routes
Route::middleware('auth:sanctum')->prefix('payments')->name('api.payments.')->group(function () {
    Route::post('/subscription', [\App\Http\Controllers\Api\PaymentController::class, 'processSubscription'])->name('subscription');
    Route::post('/{payment}/refund', [\App\Http\Controllers\Api\PaymentController::class, 'refund'])->name('refund');
    Route::post('/artist-payout', [\App\Http\Controllers\Api\PaymentController::class, 'artistPayout'])->name('artist-payout');
});

// Payout API Routes
Route::middleware('auth:sanctum')->prefix('payouts')->name('api.payouts.')->group(function () {
    Route::post('/request', [\App\Http\Controllers\Api\PayoutController::class, 'requestPayout'])->name('request');
});

// Subscription API Routes
Route::middleware('auth:sanctum')->prefix('subscriptions')->name('api.subscriptions.')->group(function () {
    Route::post('/{subscription}/cancel', [\App\Http\Controllers\Api\SubscriptionController::class, 'cancel'])->name('cancel');
    Route::post('/{subscription}/extend', [\App\Http\Controllers\Api\SubscriptionController::class, 'extend'])->name('extend')->middleware('role:admin');
});

// Admin Payment Analytics
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->name('api.admin.')->group(function () {
    Route::get('/payment-analytics', [\App\Http\Controllers\Api\PaymentController::class, 'analytics'])->name('payment-analytics');
});

// Payment Webhooks (Public - no auth required)
Route::post('/webhooks/payment/{provider}', [\App\Http\Controllers\Api\PaymentController::class, 'webhook'])->name('api.webhooks.payment');
Route::post('/payments/webhook', [\App\Http\Controllers\Api\PaymentController::class, 'webhook'])->name('api.payments.webhook');
Route::post('/webhooks/mobile-money', [\App\Http\Controllers\Api\MobileMoneyWebhookController::class, 'handle'])->name('webhooks.mobile-money');

// ISRC Generation Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/songs/{song}/generate-isrc', [\App\Http\Controllers\Api\ISRCController::class, 'generateForSong'])->name('api.isrc.generate');
    Route::post('/albums/{album}/generate-isrc', [\App\Http\Controllers\Api\ISRCController::class, 'generateForAlbum'])->name('api.isrc.generate-album');
    Route::post('/albums/{album}/generate-isrc-batch', [\App\Http\Controllers\Api\ISRCController::class, 'generateBatchForAlbum'])->name('api.isrc.generate-batch');
    Route::post('/isrc/{isrc}/register', [\App\Http\Controllers\Api\ISRCController::class, 'register'])->name('api.isrc.register');
    Route::post('/isrc/{isrc}/clearance', [\App\Http\Controllers\Api\ISRCController::class, 'clearance'])->name('api.isrc.clearance');
    Route::post('/isrc/{isrc}/clear-for-distribution', [\App\Http\Controllers\Api\ISRCController::class, 'clearance'])->name('api.isrc.clear-distribution');
    Route::post('/isrc/bulk', [\App\Http\Controllers\Api\ISRCController::class, 'bulkOperation'])->name('api.isrc.bulk');
    Route::post('/isrc/bulk-register', [\App\Http\Controllers\Api\ISRCController::class, 'bulkRegister'])->name('api.isrc.bulk-register');
    Route::post('/isrc/bulk-clear-distribution', [\App\Http\Controllers\Api\ISRCController::class, 'bulkClearDistribution'])->name('api.isrc.bulk-clear-distribution');
    Route::get('/isrc', [\App\Http\Controllers\Api\ISRCController::class, 'index'])->name('api.isrc.index');
    Route::get('/isrc/search', [\App\Http\Controllers\Api\ISRCController::class, 'search'])->name('api.isrc.search');
    Route::get('/isrc/export', [\App\Http\Controllers\Api\ISRCController::class, 'export'])->name('api.isrc.export');
    Route::post('/isrc/check-duplicate', [\App\Http\Controllers\Api\ISRCController::class, 'checkDuplicate'])->name('api.isrc.check-duplicate');
    Route::get('/isrc/analytics', [\App\Http\Controllers\Api\ISRCController::class, 'analytics'])->name('api.isrc.analytics');
});

// Artist Follow API Routes
Route::middleware('auth:sanctum')->prefix('artists')->name('api.artists.')->group(function () {
    Route::post('/{artist}/follow', [\App\Http\Controllers\Api\Social\ArtistFollowController::class, 'follow'])->name('follow');
    Route::delete('/{artist}/follow', [\App\Http\Controllers\Api\Social\ArtistFollowController::class, 'unfollow'])->name('unfollow');
    Route::get('/{artist}/follow/status', [\App\Http\Controllers\Api\Social\ArtistFollowController::class, 'status'])->name('follow.status');
});

// Song Management API Routes
Route::middleware('auth:sanctum')->prefix('songs')->name('api.songs.')->group(function () {
    // CRUD operations
    Route::post('/', [\App\Http\Controllers\Frontend\Artist\MusicController::class, 'store'])->name('store');
    Route::put('/{song}', [\App\Http\Controllers\Frontend\Artist\MusicController::class, 'update'])->name('update');
    Route::delete('/{song}', [\App\Http\Controllers\Frontend\Artist\MusicController::class, 'destroy'])->name('destroy');
    
    // Distribution
    Route::post('/{song}/distribute', [\App\Http\Controllers\DistributionController::class, 'submitSongDistribution'])->name('distribute');
    Route::get('/{song}/distributions', [\App\Http\Controllers\DistributionController::class, 'getSongDistributions'])->name('distributions');
    Route::post('/{song}/distributions/{distribution}/remove', [\App\Http\Controllers\DistributionController::class, 'requestRemoval'])->name('distribution.remove');
});

Route::middleware('auth:sanctum')->prefix('albums')->name('api.albums.')->group(function () {
    Route::post('/{album}/distribute', [\App\Http\Controllers\DistributionController::class, 'distributeAlbum'])->name('distribute');
});

Route::middleware('auth:sanctum')->prefix('distributions')->name('api.distributions.')->group(function () {
    Route::post('/bulk-submit', [\App\Http\Controllers\DistributionController::class, 'bulkSubmit'])->name('bulk-submit');
    Route::get('/{distribution}/status', [\App\Http\Controllers\DistributionController::class, 'getStatus'])->name('status');
    Route::post('/{distribution}/remove', [\App\Http\Controllers\DistributionController::class, 'requestRemoval'])->name('remove');
    Route::post('/{distribution}/retry', [\App\Http\Controllers\DistributionController::class, 'retryDistribution'])->name('retry');
    Route::get('/{distribution}/royalty-report', [\App\Http\Controllers\DistributionController::class, 'getRoyaltyReport'])->name('royalty-report');
});

Route::middleware('auth:sanctum')->prefix('artist')->name('api.artist.')->group(function () {
    Route::get('/distribution-analytics', [\App\Http\Controllers\DistributionController::class, 'getAnalytics'])->name('distribution-analytics');
});

Route::prefix('webhooks/distribution')->name('api.webhooks.distribution.')->group(function () {
    Route::post('/{platform}', [\App\Http\Controllers\DistributionWebhookController::class, 'handle'])->name('handle');
});

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin/distribution-performance')->name('api.admin.distribution.')->group(function () {
    Route::get('/', [\App\Http\Controllers\AdminDistributionController::class, 'performanceMetrics'])->name('performance');
});

// Activity Interaction Routes
Route::prefix('activities')->name('api.activities.')->group(function () {
    // Like/Unlike activity (requires auth)
    Route::middleware('auth:sanctum')->post('/{activity}/like', [\App\Http\Controllers\Api\ActivityController::class, 'like'])->name('like');
    Route::middleware('auth:sanctum')->delete('/{activity}/like', [\App\Http\Controllers\Api\ActivityController::class, 'unlike'])->name('unlike');
    
    // Comments (requires auth for creating)
    Route::get('/{activity}/comments', [\App\Http\Controllers\Api\ActivityController::class, 'getComments'])->name('comments');
    Route::middleware('auth:sanctum')->post('/{activity}/comments', [\App\Http\Controllers\Api\ActivityController::class, 'addComment'])->name('comments.add');
});

// ============================================================================
// PODCAST API ROUTES (Consolidated from routes/podcast-api.php)
// ============================================================================
// Public API endpoints
Route::prefix('podcasts')->name('api.podcast.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\Podcast\PodcastApiController::class, 'index']);
    Route::get('/{podcast:uuid}', [\App\Http\Controllers\Api\Podcast\PodcastApiController::class, 'show']);
    Route::get('/{podcast:uuid}/episodes', [\App\Http\Controllers\Api\Podcast\EpisodeApiController::class, 'index']);
    Route::get('/{podcast:uuid}/rss', [\App\Http\Controllers\Api\Podcast\PodcastApiController::class, 'rssFeed'])->name('rss');
    
    // Authenticated endpoints
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/{podcast:uuid}/subscribe', [\App\Http\Controllers\Api\Podcast\PodcastApiController::class, 'subscribe']);
        Route::delete('/{podcast:uuid}/unsubscribe', [\App\Http\Controllers\Api\Podcast\PodcastApiController::class, 'unsubscribe']);
    });
});

// Podcast episodes
Route::get('/episodes/{episode:uuid}', [\App\Http\Controllers\Api\Podcast\EpisodeApiController::class, 'show']);

// Podcast search & discovery
Route::get('/podcasts-search', [\App\Http\Controllers\Api\Podcast\PodcastApiController::class, 'search']);
Route::get('/podcasts-trending', [\App\Http\Controllers\Api\Podcast\PodcastApiController::class, 'trending']);
Route::get('/podcast-categories', [\App\Http\Controllers\Api\Podcast\PodcastApiController::class, 'categories']);

// Podcast player & analytics (authenticated)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/episodes/{episode:uuid}/play', [\App\Http\Controllers\Api\Podcast\PlayerApiController::class, 'play']);
    Route::post('/episodes/{episode:uuid}/progress', [\App\Http\Controllers\Api\Podcast\PlayerApiController::class, 'updateProgress']);
    Route::post('/episodes/{episode:uuid}/complete', [\App\Http\Controllers\Api\Podcast\PlayerApiController::class, 'markComplete']);
    
    Route::get('/my-podcast-subscriptions', [\App\Http\Controllers\Api\Podcast\PodcastApiController::class, 'mySubscriptions']);
    Route::get('/my-listening-queue', [\App\Http\Controllers\Api\Podcast\PlayerApiController::class, 'listeningQueue']);
    Route::get('/my-recent-podcasts', [\App\Http\Controllers\Api\Podcast\PlayerApiController::class, 'recentlyPlayed']);
});

// SACCO API Routes
Route::prefix('sacco')
    ->middleware(['auth:sanctum'])
    ->name('api.sacco.')
    ->group(function () {
        
        // Membership
        Route::get('members', [\App\Http\Controllers\Api\Sacco\SaccoMembershipController::class, 'index'])->name('members.index');
        Route::post('members', [\App\Http\Controllers\Api\Sacco\SaccoMembershipController::class, 'store'])->name('members.store');
        Route::get('members/{member}', [\App\Http\Controllers\Api\Sacco\SaccoMembershipController::class, 'show'])->name('members.show');
        Route::put('members/{member}', [\App\Http\Controllers\Api\Sacco\SaccoMembershipController::class, 'update'])->name('members.update');
        Route::patch('members/{member}/status', [\App\Http\Controllers\Api\Sacco\SaccoMembershipController::class, 'updateStatus'])->name('members.status');
        
        // Savings
        Route::prefix('savings')->name('savings.')->group(function () {
            Route::post('accounts', [\App\Http\Controllers\Api\Sacco\SaccoSavingsController::class, 'openAccount'])->name('accounts.open');
            Route::post('deposit', [\App\Http\Controllers\Api\Sacco\SaccoSavingsController::class, 'deposit'])->name('deposit');
            Route::post('withdraw', [\App\Http\Controllers\Api\Sacco\SaccoSavingsController::class, 'withdraw'])->name('withdraw');
            Route::get('accounts/{account}', [\App\Http\Controllers\Api\Sacco\SaccoSavingsController::class, 'show'])->name('accounts.show');
            Route::get('transactions/{account}', [\App\Http\Controllers\Api\Sacco\SaccoSavingsController::class, 'transactions'])->name('transactions');
            Route::get('balance/{account}', [\App\Http\Controllers\Api\Sacco\SaccoSavingsController::class, 'balance'])->name('balance');
        });
        
        // Loans
        Route::prefix('loans')->name('loans.')->group(function () {
            Route::post('apply', [\App\Http\Controllers\Api\Sacco\SaccoLoanController::class, 'apply'])->name('apply');
            Route::post('{loan}/approve', [\App\Http\Controllers\Api\Sacco\SaccoLoanController::class, 'approve'])->name('approve');
            Route::post('{loan}/disburse', [\App\Http\Controllers\Api\Sacco\SaccoLoanController::class, 'disburse'])->name('disburse');
            Route::post('{loan}/repay', [\App\Http\Controllers\Api\Sacco\SaccoLoanController::class, 'repay'])->name('repay');
            Route::get('{loan}', [\App\Http\Controllers\Api\Sacco\SaccoLoanController::class, 'show'])->name('show');
            Route::get('member/{member}', [\App\Http\Controllers\Api\Sacco\SaccoLoanController::class, 'memberLoans'])->name('member');
            Route::get('{loan}/schedule', [\App\Http\Controllers\Api\Sacco\SaccoLoanController::class, 'schedule'])->name('schedule');
            Route::get('{loan}/balance', [\App\Http\Controllers\Api\Sacco\SaccoLoanController::class, 'balance'])->name('balance');
        });
        
        // Shares
        Route::prefix('shares')->name('shares.')->group(function () {
            Route::post('purchase', [\App\Http\Controllers\Api\Sacco\SaccoSharesController::class, 'purchase'])->name('purchase');
            Route::post('transfer', [\App\Http\Controllers\Api\Sacco\SaccoSharesController::class, 'transfer'])->name('transfer');
            Route::get('member/{member}', [\App\Http\Controllers\Api\Sacco\SaccoSharesController::class, 'memberShares'])->name('member');
            Route::get('value', [\App\Http\Controllers\Api\Sacco\SaccoSharesController::class, 'currentValue'])->name('value');
        });
        
        // Reports
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('membership', [\App\Http\Controllers\Api\Sacco\SaccoReportsController::class, 'membership'])->name('membership');
            Route::get('loans', [\App\Http\Controllers\Api\Sacco\SaccoReportsController::class, 'loans'])->name('loans');
            Route::get('savings', [\App\Http\Controllers\Api\Sacco\SaccoReportsController::class, 'savings'])->name('savings');
            Route::get('shares', [\App\Http\Controllers\Api\Sacco\SaccoReportsController::class, 'shares'])->name('shares');
            Route::get('financial', [\App\Http\Controllers\Api\Sacco\SaccoReportsController::class, 'financial'])->name('financial');
            Route::get('member/{member}', [\App\Http\Controllers\Api\Sacco\SaccoReportsController::class, 'memberStatement'])->name('member');
            Route::get('overdue', [\App\Http\Controllers\Api\Sacco\SaccoReportsController::class, 'overdue'])->name('overdue');
        });
        
        // Analytics
        Route::prefix('analytics')->name('analytics.')->group(function () {
            Route::get('dashboard', [\App\Http\Controllers\Api\Sacco\SaccoAnalyticsController::class, 'dashboard'])->name('dashboard');
            Route::get('trends/membership', [\App\Http\Controllers\Api\Sacco\SaccoAnalyticsController::class, 'membershipTrends'])->name('trends.membership');
            Route::get('performance/loans', [\App\Http\Controllers\Api\Sacco\SaccoAnalyticsController::class, 'loanPerformance'])->name('performance.loans');
            Route::get('savings', [\App\Http\Controllers\Api\Sacco\SaccoAnalyticsController::class, 'savings'])->name('savings');
            Route::get('repayments', [\App\Http\Controllers\Api\Sacco\SaccoAnalyticsController::class, 'repayments'])->name('repayments');
            Route::get('portfolio', [\App\Http\Controllers\Api\Sacco\SaccoAnalyticsController::class, 'portfolio'])->name('portfolio');
            Route::get('activity', [\App\Http\Controllers\Api\Sacco\SaccoAnalyticsController::class, 'activity'])->name('activity');
            Route::get('top-performers', [\App\Http\Controllers\Api\Sacco\SaccoAnalyticsController::class, 'topPerformers'])->name('top-performers');
            Route::get('risk', [\App\Http\Controllers\Api\Sacco\SaccoAnalyticsController::class, 'risk'])->name('risk');
        });
    });

/*
|--------------------------------------------------------------------------
| Feed API V2 Routes
|--------------------------------------------------------------------------
| 
| These routes use the new FeedItem model and FeedService for the
| unified discovery feed at tesotunes.com/edula
|
*/
Route::prefix('v2/feed')->name('api.v2.feed.')->group(function () {
    // Public feed endpoints (guests can browse)
    Route::get('/', [\App\Http\Controllers\Api\V2\FeedController::class, 'index'])->name('index');
    Route::get('/for-you', [\App\Http\Controllers\Api\V2\FeedController::class, 'forYou'])->name('for-you');
    Route::get('/discover', [\App\Http\Controllers\Api\V2\FeedController::class, 'discover'])->name('discover');
    Route::get('/module/{module}', [\App\Http\Controllers\Api\V2\FeedController::class, 'module'])->name('module');
    Route::get('/tabs', [\App\Http\Controllers\Api\V2\FeedController::class, 'tabs'])->name('tabs');
    
    // Authenticated feed endpoints (MUST be before /{uuid} to avoid route conflicts)
    Route::middleware('auth:sanctum')->group(function () {
        // Personalized feeds
        Route::get('/following', [\App\Http\Controllers\Api\V2\FeedController::class, 'following'])->name('following');
        Route::get('/saved', [\App\Http\Controllers\Api\V2\FeedController::class, 'saved'])->name('saved');
        
        // Interaction endpoints
        Route::post('/{uuid}/not-interested', [\App\Http\Controllers\Api\V2\FeedController::class, 'notInterested'])->name('not-interested');
        Route::post('/{uuid}/hide', [\App\Http\Controllers\Api\V2\FeedController::class, 'hide'])->name('hide');
        Route::post('/{uuid}/save', [\App\Http\Controllers\Api\V2\FeedController::class, 'save'])->name('save');
        Route::delete('/{uuid}/save', [\App\Http\Controllers\Api\V2\FeedController::class, 'unsave'])->name('unsave');
        
        // Analytics tracking
        Route::post('/{uuid}/click', [\App\Http\Controllers\Api\V2\FeedController::class, 'trackClick'])->name('track-click');
        Route::post('/{uuid}/engage', [\App\Http\Controllers\Api\V2\FeedController::class, 'trackEngagement'])->name('track-engagement');
        
        // Utility endpoints
        Route::post('/refresh', [\App\Http\Controllers\Api\V2\FeedController::class, 'refresh'])->name('refresh');
        Route::get('/preferences', [\App\Http\Controllers\Api\V2\FeedController::class, 'preferences'])->name('preferences');
        Route::put('/preferences', [\App\Http\Controllers\Api\V2\FeedController::class, 'updatePreferences'])->name('update-preferences');
    });
    
    // Single item view (MUST be after named routes like /following, /saved)
    Route::get('/{uuid}', [\App\Http\Controllers\Api\V2\FeedController::class, 'show'])->name('show');
});
