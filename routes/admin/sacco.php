<?php

use App\Http\Controllers\Backend\Admin\SaccoController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin SACCO Routes
|--------------------------------------------------------------------------
|
| Backend admin routes for managing the SACCO module
|
*/

Route::middleware(['auth', 'role:admin,super_admin,finance'])->prefix('admin/sacco')->name('admin.sacco.')->group(function () {
    
    // Dashboard
    Route::get('/', [SaccoController::class, 'index'])->name('index');
    Route::get('/dashboard', [SaccoController::class, 'dashboard'])->name('dashboard');
    
    // Members Management
    Route::prefix('members')->name('members.')->group(function () {
        Route::get('/', [SaccoController::class, 'members'])->name('index');
        Route::get('/pending', [SaccoController::class, 'pendingMembers'])->name('pending');
        Route::get('/enroll', [SaccoController::class, 'showEnrollForm'])->name('enroll');
        Route::post('/enroll', [SaccoController::class, 'enrollUser'])->name('enroll.store');
        Route::get('/{member}', [SaccoController::class, 'showMember'])->name('show');
        Route::post('/{member}/approve', [SaccoController::class, 'approveMember'])->name('approve');
        Route::post('/{member}/reject', [SaccoController::class, 'rejectMember'])->name('reject');
        Route::post('/{member}/suspend', [SaccoController::class, 'suspendMember'])->name('suspend');
        Route::post('/{member}/activate', [SaccoController::class, 'activateMember'])->name('activate');
        Route::put('/{member}/update-credit-score', [SaccoController::class, 'updateCreditScore'])->name('update-credit-score');
    });
    
    // Loans Management
    Route::prefix('loans')->name('loans.')->group(function () {
        Route::get('/', [SaccoController::class, 'loans'])->name('index');
        Route::get('/pending', [SaccoController::class, 'pendingLoans'])->name('pending');
        Route::get('/active', [SaccoController::class, 'activeLoans'])->name('active');
        Route::get('/overdue', [SaccoController::class, 'overdueLoans'])->name('overdue');
        Route::get('/defaulted', [SaccoController::class, 'defaultedLoans'])->name('defaulted');
        Route::get('/{loan}', [SaccoController::class, 'showLoan'])->name('show');
        Route::post('/{loan}/approve', [SaccoController::class, 'approveLoan'])->name('approve');
        Route::post('/{loan}/reject', [SaccoController::class, 'rejectLoan'])->name('reject');
        Route::post('/{loan}/disburse', [SaccoController::class, 'disburseLoan'])->name('disburse');
        Route::post('/{loan}/restructure', [SaccoController::class, 'restructureLoan'])->name('restructure');
        Route::post('/{loan}/write-off', [SaccoController::class, 'writeOffLoan'])->name('write-off');
    });
    
    // Loan Products Management
    Route::prefix('loan-products')->name('loan-products.')->group(function () {
        Route::get('/', [SaccoController::class, 'loanProducts'])->name('index');
        Route::get('/create', [SaccoController::class, 'createLoanProduct'])->name('create');
        Route::post('/', [SaccoController::class, 'storeLoanProduct'])->name('store');
        Route::get('/{product}/edit', [SaccoController::class, 'editLoanProduct'])->name('edit');
        Route::put('/{product}', [SaccoController::class, 'updateLoanProduct'])->name('update');
        Route::delete('/{product}', [SaccoController::class, 'deleteLoanProduct'])->name('delete');
        Route::post('/{product}/toggle', [SaccoController::class, 'toggleLoanProduct'])->name('toggle');
    });
    
    // Transactions Management
    Route::prefix('transactions')->name('transactions.')->group(function () {
        Route::get('/', [SaccoController::class, 'transactions'])->name('index');
        Route::get('/deposits', [SaccoController::class, 'deposits'])->name('deposits');
        Route::get('/withdrawals', [SaccoController::class, 'withdrawals'])->name('withdrawals');
        Route::get('/pending', [SaccoController::class, 'pendingTransactions'])->name('pending');
        Route::get('/{transaction}', [SaccoController::class, 'showTransaction'])->name('show');
        Route::post('/{transaction}/approve', [SaccoController::class, 'approveTransaction'])->name('approve');
        Route::post('/{transaction}/reject', [SaccoController::class, 'rejectTransaction'])->name('reject');
    });
    
    // Dividends Management
    Route::prefix('dividends')->name('dividends.')->group(function () {
        Route::get('/', [SaccoController::class, 'dividends'])->name('index');
        Route::post('/calculate', [SaccoController::class, 'calculateDividend'])->name('calculate');
        Route::get('/{dividend}', [SaccoController::class, 'showDividend'])->name('show');
        Route::post('/{dividend}/approve', [SaccoController::class, 'approveDividend'])->name('approve');
        Route::post('/{dividend}/distribute', [SaccoController::class, 'distributeDividend'])->name('distribute');
        Route::post('/{dividend}/cancel', [SaccoController::class, 'cancelDividend'])->name('cancel');
        Route::get('/{dividend}/export', [SaccoController::class, 'exportDividend'])->name('export');
    });
    
    // Reports
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [SaccoController::class, 'reports'])->name('index');
        Route::get('/financial', [SaccoController::class, 'financialReport'])->name('financial');
        Route::get('/loans', [SaccoController::class, 'loansReport'])->name('loans');
        Route::get('/members', [SaccoController::class, 'membersReport'])->name('members');
        Route::get('/transactions', [SaccoController::class, 'transactionsReport'])->name('transactions');
        Route::get('/savings', [SaccoController::class, 'savingsReport'])->name('savings');
        Route::get('/shares', [SaccoController::class, 'sharesReport'])->name('shares');
        Route::get('/dividends', [SaccoController::class, 'dividendsReport'])->name('dividends');
        Route::get('/performance', [SaccoController::class, 'performanceReport'])->name('performance');
        Route::get('/audit', [SaccoController::class, 'auditReport'])->name('audit');
        Route::get('/compliance', [SaccoController::class, 'complianceReport'])->name('compliance');
        Route::post('/generate', [SaccoController::class, 'generateReport'])->name('generate');
    });
    
    // Settings
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [SaccoController::class, 'settings'])->name('index');
        Route::put('/', [SaccoController::class, 'updateSettings'])->name('update');
        Route::post('/toggle-module', [SaccoController::class, 'toggleModule'])->name('toggle-module');
    });
    
    // Account Types Management
    Route::prefix('account-types')->name('account-types.')->group(function () {
        Route::get('/', [SaccoController::class, 'accountTypes'])->name('index');
        Route::post('/', [SaccoController::class, 'storeAccountType'])->name('store');
        Route::put('/{accountType}', [SaccoController::class, 'updateAccountType'])->name('update');
        Route::delete('/{accountType}', [SaccoController::class, 'deleteAccountType'])->name('delete');
    });
    
    // Member Accounts Management (admin creates accounts for members)
    Route::prefix('member-accounts')->name('member-accounts.')->group(function () {
        Route::get('/{member}', [SaccoController::class, 'memberAccounts'])->name('index');
        Route::post('/{member}', [SaccoController::class, 'createMemberAccount'])->name('store');
        Route::put('/{account}', [SaccoController::class, 'updateMemberAccount'])->name('update');
        Route::delete('/{account}', [SaccoController::class, 'deleteMemberAccount'])->name('delete');
    });
    
    // Board Management
    Route::prefix('board')->name('board.')->group(function () {
        Route::get('/', [SaccoController::class, 'boardMembers'])->name('index');
        Route::post('/add', [SaccoController::class, 'addBoardMember'])->name('add');
        Route::delete('/{member}', [SaccoController::class, 'removeBoardMember'])->name('remove');
    });
    
    // Audit Logs
    Route::get('/audit-logs', [SaccoController::class, 'auditLogs'])->name('audit-logs');
    
    // API Endpoints for AJAX
    Route::prefix('api')->name('api.')->group(function () {
        Route::get('/stats', [SaccoController::class, 'getStats'])->name('stats');
        Route::get('/member/{member}/accounts', [SaccoController::class, 'getMemberAccounts'])->name('member-accounts');
        Route::get('/member/{member}/loans', [SaccoController::class, 'getMemberLoans'])->name('member-loans');
        Route::get('/member/{member}/transactions', [SaccoController::class, 'getMemberTransactions'])->name('member-transactions');
        Route::get('/loan/{loan}/repayments', [SaccoController::class, 'getLoanRepayments'])->name('loan-repayments');
    });
});
