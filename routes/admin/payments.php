<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\PaymentIssueController;
use App\Http\Controllers\Backend\Admin\PlatformRevenueController;
use App\Http\Controllers\Backend\Admin\WalletController;

/*
|--------------------------------------------------------------------------
| Admin Payment Management Routes
|--------------------------------------------------------------------------
|
| These routes handle the payment management in the admin panel.
|
*/

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::prefix('payments')->name('payments.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Backend\Admin\PaymentController::class, 'index'])->name('index');
        Route::get('/{payment}', [\App\Http\Controllers\Backend\Admin\PaymentController::class, 'showPayment'])->name('show');
        Route::post('/{payment}/process', [\App\Http\Controllers\Backend\Admin\PaymentController::class, 'processPayment'])->name('process');
        Route::post('/{payment}/retry', [\App\Http\Controllers\Backend\Admin\PaymentController::class, 'retryPayment'])->name('retry');
        Route::post('/{payment}/refund', [\App\Http\Controllers\Backend\Admin\PaymentController::class, 'processRefund'])->name('refund');
        Route::get('/subscriptions', [\App\Http\Controllers\Backend\Admin\PaymentController::class, 'subscriptions'])->name('subscriptions');
        Route::get('/transactions', [\App\Http\Controllers\Backend\Admin\PaymentController::class, 'transactions'])->name('transactions');
        Route::get('/analytics', [\App\Http\Controllers\Backend\Admin\PaymentController::class, 'analytics'])->name('analytics');
        Route::get('/mobile-money', [\App\Http\Controllers\Backend\Admin\PaymentController::class, 'mobileMoney'])->name('mobile-money');
    });
    
    /*
    |--------------------------------------------------------------------------
    | Wallet Management Dashboard
    |--------------------------------------------------------------------------
    |
    | Routes for managing user wallets, balances, and SACCO auto-save settings
    |
    */
    Route::prefix('wallets')->name('wallets.')->middleware('role:finance,admin,super_admin')->group(function () {
        Route::get('/', [WalletController::class, 'index'])->name('index');
        Route::get('/search', [WalletController::class, 'search'])->name('search');
        Route::get('/export', [WalletController::class, 'export'])->name('export');
        Route::get('/auto-save', [WalletController::class, 'autoSave'])->name('auto-save');
        Route::get('/{user}', [WalletController::class, 'show'])->name('show');
        Route::post('/{user}/adjust', [WalletController::class, 'adjust'])->name('adjust');
    });
    
    /*
    |--------------------------------------------------------------------------
    | Platform Revenue Dashboard
    |--------------------------------------------------------------------------
    |
    | Routes for viewing platform revenue from all sources (song purchases,
    | subscriptions, store commissions, tips, etc.)
    |
    */
    Route::prefix('revenue')->name('revenue.')->middleware('role:finance,admin,super_admin')->group(function () {
        Route::get('/', [PlatformRevenueController::class, 'index'])->name('index');
        Route::get('/data', [PlatformRevenueController::class, 'data'])->name('data');
        Route::get('/export', [PlatformRevenueController::class, 'export'])->name('export');
    });
    
    /*
    |--------------------------------------------------------------------------
    | Payment Issues Management
    |--------------------------------------------------------------------------
    |
    | Routes for managing payment issues, reconciliation, and auto-resolution.
    |
    */
    Route::prefix('payment-issues')->name('payment-issues.')->group(function () {
        Route::get('/', [PaymentIssueController::class, 'index'])->name('index');
        Route::get('/statistics', [PaymentIssueController::class, 'statistics'])->name('statistics');
        Route::post('/scan', [PaymentIssueController::class, 'scan'])->name('scan');
        Route::get('/{paymentIssue}', [PaymentIssueController::class, 'show'])->name('show');
        Route::post('/{paymentIssue}/investigate', [PaymentIssueController::class, 'investigate'])->name('investigate');
        Route::post('/{paymentIssue}/note', [PaymentIssueController::class, 'addNote'])->name('add-note');
        Route::post('/{paymentIssue}/resolve', [PaymentIssueController::class, 'resolve'])->name('resolve');
        Route::post('/{paymentIssue}/escalate', [PaymentIssueController::class, 'escalate'])->name('escalate');
        Route::post('/{paymentIssue}/assign', [PaymentIssueController::class, 'assign'])->name('assign');
    });

    Route::middleware('role:finance,admin,super_admin')->prefix('payouts')->name('payouts.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Backend\Admin\PaymentController::class, 'index'])->name('index');
        Route::get('/pending', function () {
            return redirect()->route('admin.payments.index')->with('filter', 'pending');
        })->name('pending');
        Route::get('/{payout}', function ($payout) {
            return redirect()->route('admin.payments.index')->with('payout_id', $payout);
        })->name('show');
        // Payout actions redirected to payment management
        Route::post('/{payout}/approve', function ($payout) {
            return redirect()->route('admin.payments.index')->with('action', 'approve')->with('payout_id', $payout);
        })->name('approve');
        Route::post('/{payout}/reject', function ($payout) {
            return redirect()->route('admin.payments.index')->with('action', 'reject')->with('payout_id', $payout);
        })->name('reject');
        Route::post('/{payout}/process', function ($payout) {
            return redirect()->route('admin.payments.index')->with('action', 'process')->with('payout_id', $payout);
        })->name('process');
        Route::post('/{payout}/complete', function ($payout) {
            return redirect()->route('admin.payments.index')->with('action', 'complete')->with('payout_id', $payout);
        })->name('complete');
        Route::post('/{payout}/fail', function ($payout) {
            return redirect()->route('admin.payments.index')->with('action', 'fail')->with('payout_id', $payout);
        })->name('fail');
    });
});
