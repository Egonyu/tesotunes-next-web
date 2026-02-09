<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Backend\Admin\ArtistVerificationController;

/*
|--------------------------------------------------------------------------
| Admin Artist Verification Routes
|--------------------------------------------------------------------------
|
| Routes for managing artist applications and KYC document verification
|
*/

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    
    // Artist Verification Management
    Route::prefix('artist-verification')->name('artist-verification.')->group(function () {
        
        // List applications (with filters)
        Route::get('/', [ArtistVerificationController::class, 'index'])->name('index');
        
        // View specific application
        Route::get('/{artist}', [ArtistVerificationController::class, 'show'])->name('show');
        
        // Approval/Rejection actions
        Route::post('/{artist}/approve', [ArtistVerificationController::class, 'approve'])->name('approve');
        Route::post('/{artist}/reject', [ArtistVerificationController::class, 'reject'])->name('reject');
        Route::post('/{artist}/request-info', [ArtistVerificationController::class, 'requestInfo'])->name('request-info');
        
        // KYC Document actions
        Route::get('/{artist}/document/{document}/view', [ArtistVerificationController::class, 'viewDocument'])->name('document.view');
        Route::get('/{artist}/document/{document}/download', [ArtistVerificationController::class, 'downloadDocument'])->name('document.download');
        
        // Export PDF
        Route::get('/{artist}/export-pdf', [ArtistVerificationController::class, 'exportPdf'])->name('export-pdf');
        
        // Bulk actions
        Route::post('/bulk-action', [ArtistVerificationController::class, 'bulkAction'])->name('bulk-action');
    });
});
