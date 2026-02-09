<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Backend\Admin\ApprovalsController;

/*
|--------------------------------------------------------------------------
| Admin Approvals Routes
|--------------------------------------------------------------------------
|
| Unified approvals dashboard for managing all platform approval workflows
| Consolidates artist verification, store approvals, and SACCO applications
|
*/

Route::middleware(['auth', 'role:admin,super_admin,moderator'])->prefix('admin')->name('admin.')->group(function () {

    Route::prefix('approvals')->name('approvals.')->group(function () {

        // Main approvals dashboard
        Route::get('/', [ApprovalsController::class, 'index'])->name('index');

        // Bulk actions
        Route::post('/bulk-approve', [ApprovalsController::class, 'bulkApprove'])->name('bulk-approve');

        // API endpoints for AJAX
        Route::get('/api/pending-count', [ApprovalsController::class, 'getPendingCount'])->name('api.pending-count');
    });

});