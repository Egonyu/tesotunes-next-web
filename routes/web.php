<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Main route file that includes both frontend and backend route files.
| This provides a clean separation between user-facing and admin routes.
|
*/

// Handle favicon requests explicitly to prevent 302 redirects
Route::get('/favicon.ico', function () {
    $path = public_path('favicon.ico');
    if (file_exists($path)) {
        return response()->file($path);
    }
    return response('', 404);
});

// Countdown/Coming Soon Routes (excluded from countdown middleware)
Route::get('/countdown', function () {
    // If countdown is disabled or user is authenticated, redirect to home
    if (!config('app.countdown_enabled') || auth()->check()) {
        return redirect('/');
    }
    return view('countdown');
})->name('countdown');

Route::post('/countdown/notify', function (\Illuminate\Http\Request $request) {
    $request->validate(['email' => 'required|email']);
    
    // Store the email for notification (you can create a model for this)
    // For now, we'll just log it or store in cache
    $emails = cache()->get('countdown_notify_emails', []);
    if (!in_array($request->email, $emails)) {
        $emails[] = $request->email;
        cache()->put('countdown_notify_emails', $emails, now()->addYear());
    }
    
    return response()->json(['success' => true, 'message' => 'You will be notified when we launch!']);
})->name('countdown.notify');

// Include Global Auth Routes FIRST (prevents conflicts with wildcard routes)
require __DIR__.'/auth.php';

// WebSocket Test Routes (authenticated users only)
Route::prefix('test')->name('test.')->middleware('auth')->group(function () {
    Route::get('/websocket', [\App\Http\Controllers\Test\WebSocketTestController::class, 'index'])
        ->name('websocket');
    Route::post('/websocket/broadcast', [\App\Http\Controllers\Test\WebSocketTestController::class, 'broadcast'])
        ->name('websocket.broadcast');
});

// Include Forum & Polls Module Routes
if (file_exists(__DIR__.'/modules/forum.php')) {
    require __DIR__.'/modules/forum.php';
}

// Include Record Label Routes
if (file_exists(__DIR__.'/label.php')) {
    require __DIR__.'/label.php';
}

// Global route aliases (for backwards compatibility)
Route::get('/home', function() {
    return redirect()->route('frontend.home');
})->name('home');

// Include Admin Routes (Admin Panel) - MUST come BEFORE frontend
// to prevent wildcard routes like /{artistSlug}/dashboard from
// matching /admin/dashboard
require __DIR__.'/admin.php';

// Include Frontend Routes (User Interface)
require __DIR__.'/frontend.php';

// Fallback route for undefined paths
Route::fallback(function () {
    return view('errors.404');
});
