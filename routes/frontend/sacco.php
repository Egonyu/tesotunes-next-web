<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Frontend\SaccoController;
use App\Http\Controllers\Frontend\SaccoMemberController;

// SACCO Landing/About Page (public, no auth required)
// Redirects to dashboard if user is already a SACCO member
Route::get('/sacco', [SaccoMemberController::class, 'about'])->name('sacco.landing.redirect');
Route::get('/sacco/about', [SaccoMemberController::class, 'about'])->name('frontend.sacco.landing');

// SACCO Member Routes (requires auth)
Route::middleware(['auth'])->prefix('sacco')->name('sacco.')->group(function () {
    // Registration / Join
    Route::get('/register', [SaccoController::class, 'register'])->name('register');
    Route::post('/enroll', [SaccoController::class, 'enroll'])->name('enroll');
    Route::get('/join', [SaccoMemberController::class, 'join'])->name('join');
    Route::post('/apply', [SaccoMemberController::class, 'apply'])->name('apply');
    
    // Note: About page is defined as a PUBLIC route above (frontend.sacco.landing)
    
    // Dashboard
    Route::get('/dashboard', [SaccoMemberController::class, 'dashboard'])->name('dashboard');
    Route::get('/financials', [SaccoMemberController::class, 'financials'])->name('financials');
    
    // Profile
    Route::get('/profile', [SaccoMemberController::class, 'profile'])->name('profile');
    Route::post('/profile', [SaccoMemberController::class, 'updateProfile'])->name('profile.update');
    
    // Accounts
    Route::get('/accounts', [SaccoMemberController::class, 'accounts'])->name('accounts.index');
    Route::get('/accounts/{account}', [SaccoMemberController::class, 'showAccount'])->name('accounts.show');
    Route::get('/accounts/{account}/statement', [SaccoMemberController::class, 'accountStatement'])->name('accounts.statement');
    
    // Deposits
    Route::get('/deposits', [SaccoMemberController::class, 'deposits'])->name('deposits.index');
    Route::get('/deposits/create', [SaccoMemberController::class, 'createDeposit'])->name('deposits.create');
    Route::post('/deposits', [SaccoMemberController::class, 'storeDeposit'])->name('deposits.store');
    
    // Withdrawals
    Route::get('/withdrawals/create', [SaccoMemberController::class, 'createWithdrawal'])->name('withdrawals.create');
    Route::post('/withdrawals', [SaccoMemberController::class, 'storeWithdrawal'])->name('withdrawals.store');
    
    // Loans
    Route::get('/loans', [SaccoMemberController::class, 'loans'])->name('loans.index');
    Route::get('/loans/products', [SaccoMemberController::class, 'loanProducts'])->name('loans.products');
    Route::get('/loans/apply', [SaccoMemberController::class, 'applyLoan'])->name('loans.apply');
    Route::post('/loans/submit', [SaccoMemberController::class, 'submitLoanApplication'])->name('loans.submit');
    Route::get('/loans/{loan}', [SaccoMemberController::class, 'showLoan'])->name('loans.show');
    Route::get('/loans/{loan}/payment', [SaccoMemberController::class, 'showPayment'])->name('loans.payment');
    Route::get('/loans/{loan}/payment-method', [SaccoMemberController::class, 'showPaymentMethod'])->name('loans.payment-method');
    Route::post('/loans/{loan}/repay', [SaccoMemberController::class, 'processRepayment'])->name('loans.repay');
    
    // Transactions
    Route::get('/transactions', [SaccoMemberController::class, 'transactions'])->name('transactions');
    
    // Dividends
    Route::get('/dividends', [SaccoMemberController::class, 'dividends'])->name('dividends');
    
    // Credits
    Route::get('/credits/deposit', [SaccoMemberController::class, 'depositCreditsForm'])->name('credits.deposit');
    Route::post('/credits/deposit', [SaccoMemberController::class, 'depositCredits'])->name('credits.deposit.store');
});

// Note: We standardized on sacco.* route naming convention.
// Views should use sacco.loans.index, sacco.dashboard, etc.
// The frontend.sacco.* naming was deprecated and removed to avoid conflicts.
