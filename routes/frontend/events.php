<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Frontend Events Routes
|--------------------------------------------------------------------------
|
| These routes handle public event listings and authenticated user actions
| like event registration, ticket purchasing, and viewing tickets.
|
*/

// Public Events Routes
Route::middleware('feature:events')->prefix('events')->name('frontend.events.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Frontend\EventController::class, 'index'])->name('index');
    Route::get('/{event}', [\App\Http\Controllers\Frontend\EventController::class, 'show'])->name('show');
});

// Authenticated Event Routes
Route::middleware(['auth', 'feature:events'])->prefix('events')->name('frontend.events.')->group(function () {
    Route::middleware('feature:tickets')->group(function () {
        Route::post('/{event}/register', [\App\Http\Controllers\Frontend\EventController::class, 'register'])->name('register');
        Route::get('/{event}/checkout', [\App\Http\Controllers\Frontend\EventController::class, 'checkout'])->name('checkout');
        Route::post('/{event}/payment', [\App\Http\Controllers\Frontend\EventController::class, 'processPayment'])->name('payment');
        Route::get('/{event}/ticket', [\App\Http\Controllers\Frontend\EventController::class, 'ticket'])->name('ticket');
        Route::post('/{event}/cancel', [\App\Http\Controllers\Frontend\EventController::class, 'cancelRegistration'])->name('cancel');
        Route::get('/my-tickets', [\App\Http\Controllers\Frontend\EventController::class, 'myTickets'])->name('my-tickets');
    });
});