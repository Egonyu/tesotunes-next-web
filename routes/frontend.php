<?php

/*
|--------------------------------------------------------------------------
| Frontend Routes
|--------------------------------------------------------------------------
|
| This file includes all the route files for the frontend application.
| This approach keeps the main route file clean and organized.
|
| IMPORTANT: Auth routes MUST load before public.php to prevent
| wildcard routes (/artist/{artist}) from matching specific routes
| like /artist/login.
|
*/

// Load specific routes BEFORE wildcard routes
require __DIR__ . '/frontend/auth.php';
require __DIR__ . '/frontend/user.php';
require __DIR__ . '/frontend/artist.php';
require __DIR__ . '/frontend/moderator.php';
require __DIR__ . '/frontend/events.php';
require __DIR__ . '/frontend/awards.php';
require __DIR__ . '/frontend/payments.php';
require __DIR__ . '/frontend/sacco.php';
require __DIR__ . '/frontend/esokoni.php'; // Marketplace (products + promotions)
require __DIR__ . '/frontend/store.php'; // Legacy store routes (redirects to esokoni)
require __DIR__ . '/frontend/wallet.php'; // Wallet management
require __DIR__ . '/frontend/claims.php'; // Claim request system
require __DIR__ . '/frontend/loyalty.php'; // Artist & Fan loyalty cards

// Content Discovery (Genres & Moods)
require __DIR__ . '/frontend/content.php';

// Podcast routes (with prefix and name as documented in podcast.php)
Route::prefix('podcasts')->name('podcast.')->group(base_path('routes/podcast.php'));

// Load public routes LAST (contains wildcard routes like /artist/{artist})
require __DIR__ . '/frontend/public.php';
