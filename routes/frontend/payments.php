<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Frontend Payments Routes
|--------------------------------------------------------------------------
|
| These routes handle payment webhooks, status checks, and subscriptions.
|
*/

Route::name('frontend.')->group(function () {
    // Payment Webhooks (Public - no auth required)
    Route::post('/payment/webhook', [\App\Http\Controllers\Frontend\PaymentController::class, 'webhook'])->name('payment.webhook');

    // Authenticated Payment Routes
    Route::middleware(['auth'])->group(function () {
        // Song Purchase Routes (Web Auth)
        Route::prefix('song')->name('song.')->group(function () {
            Route::post('/{song}/purchase', [\App\Http\Controllers\API\Payment\SongPurchaseController::class, 'purchase'])->name('purchase');
            Route::get('/{song}/purchase/status/{payment}', [\App\Http\Controllers\API\Payment\SongPurchaseController::class, 'status'])->name('purchase.status');
            Route::get('/{song}/ownership', [\App\Http\Controllers\API\Payment\SongPurchaseController::class, 'checkOwnership'])->name('ownership');
            Route::get('/{song}/download', [\App\Http\Controllers\API\Payment\SongPurchaseController::class, 'download'])->name('download');
        });
        
        // Song Purchase Status (legacy/alternative route)
        Route::get('/song-purchase/status/{payment}', [\App\Http\Controllers\API\Payment\SongPurchaseController::class, 'status'])
            ->name('song.purchase.status');
        
        // Payment Routes
        Route::prefix('payments')->name('payments.')->group(function () {
            Route::get('/{event}/status/{payment?}', [\App\Http\Controllers\Frontend\PaymentController::class, 'status'])->name('status');
            Route::post('/{event}/{payment}/check-status', [\App\Http\Controllers\Frontend\PaymentController::class, 'checkStatus'])->name('check-status');
        });

        // Subscriptions & Payments
        Route::middleware('feature:subscriptions')->prefix('subscription')->name('subscription.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Frontend\SubscriptionController::class, 'index'])->name('index');
            Route::get('/plans', [\App\Http\Controllers\Frontend\SubscriptionController::class, 'plans'])->name('plans');
            Route::post('/subscribe/{plan}', [\App\Http\Controllers\Frontend\SubscriptionController::class, 'subscribe'])->name('subscribe');
            Route::post('/cancel', [\App\Http\Controllers\Frontend\SubscriptionController::class, 'cancel'])->name('cancel');
            Route::get('/history', [\App\Http\Controllers\Frontend\SubscriptionController::class, 'history'])->name('history');
            Route::get('/mobile-money', [\App\Http\Controllers\Frontend\SubscriptionController::class, 'mobileMoney'])->name('mobile-money');
        });
    });
});