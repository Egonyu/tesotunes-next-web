<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Credit System Routes
|--------------------------------------------------------------------------
|
| These routes handle the credit system management in the admin panel.
|
*/

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::prefix('credits')->name('credits.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Backend\Admin\CreditController::class, 'index'])->name('index');
        Route::get('/rates', [\App\Http\Controllers\Backend\Admin\CreditController::class, 'rates'])->name('rates');
        Route::post('/rates', [\App\Http\Controllers\Backend\Admin\CreditController::class, 'storeRate'])->name('rates.store');
        Route::put('/rates/{rate}', [\App\Http\Controllers\Backend\Admin\CreditController::class, 'updateRate'])->name('rates.update');
        Route::post('/rates/{rate}/toggle', [\App\Http\Controllers\Backend\Admin\CreditController::class, 'toggleRateStatus'])->name('rates.toggle');
        Route::get('/transactions', [\App\Http\Controllers\Backend\Admin\CreditController::class, 'transactions'])->name('transactions');
        Route::get('/analytics', [\App\Http\Controllers\Backend\Admin\CreditController::class, 'analytics'])->name('analytics');
        Route::post('/award-credits', [\App\Http\Controllers\Backend\Admin\CreditController::class, 'awardCredits'])->name('award');
        Route::post('/deduct-credits', [\App\Http\Controllers\Backend\Admin\CreditController::class, 'deductCredits'])->name('deduct');
    });
});