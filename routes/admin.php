<?php

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| This file includes all the route files for the admin application.
| This approach keeps the main route file clean and organized.
|
*/

require __DIR__ . '/admin/auth.php';
require __DIR__ . '/admin/dashboard.php';
require __DIR__ . '/admin/approvals.php'; // NEW: Unified approvals dashboard
require __DIR__ . '/admin/artist.php';
require __DIR__ . '/admin/artist-verification.php'; // NEW: Artist verification routes
require __DIR__ . '/admin/payments.php';
require __DIR__ . '/admin/content.php'; // NEW: Admin Content Management (Songs, Albums, Artists, Playlists)
require __DIR__ . '/admin/music.php';
require __DIR__ . '/admin/genres.php'; // Genres management
require __DIR__ . '/admin/moods.php'; // Moods management
require __DIR__ . '/admin/slideshow.php'; // Slideshow management
// require __DIR__ . '/admin/playlists.php'; // OLD: Deprecated - use admin/music.php playlists routes instead
require __DIR__ . '/admin/events.php';
require __DIR__ . '/admin/awards.php';
require __DIR__ . '/admin/rights.php';
require __DIR__ . '/admin/distribution.php';
require __DIR__ . '/admin/reports.php';
require __DIR__ . '/admin/settings.php';
require __DIR__ . '/admin/frontend-design.php'; // Frontend design management
require __DIR__ . '/admin/api.php';
require __DIR__ . '/admin/users.php';
require __DIR__ . '/admin/roles.php';
require __DIR__ . '/admin/credits.php';
require __DIR__ . '/admin/promotions.php';
require __DIR__ . '/admin/ads.php';
require __DIR__ . '/admin/podcasts.php';
require __DIR__ . '/admin/store.php';
require __DIR__ . '/admin/system.php';
require __DIR__ . '/admin/performance.php';
require __DIR__ . '/admin/logs.php'; // Audit logging & security dashboard
require __DIR__ . '/admin/security.php'; // Security monitoring & threat detection
require __DIR__ . '/admin/claims.php'; // Claim request management
require __DIR__ . '/admin/loyalty.php'; // Loyalty card management
require __DIR__ . '/admin/labels.php'; // Record label applications
// Move sacco to end to prevent it from breaking other routes
require __DIR__ . '/admin/sacco.php';
require __DIR__ . '/admin/frontend-sections.php';
