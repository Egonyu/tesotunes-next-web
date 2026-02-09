<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Backend\Podcast\AdminPodcastController;

/*
|--------------------------------------------------------------------------
| Admin Podcast Routes
|--------------------------------------------------------------------------
|
| These routes handle podcast management in the admin panel.
|
*/

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::prefix('podcasts')->name('podcasts.')->group(function () {
        // List and management
        Route::get('/', [AdminPodcastController::class, 'index'])->name('index');
        Route::get('/pending-review', [AdminPodcastController::class, 'pendingReview'])->name('pending');
        Route::get('/{podcast}', [AdminPodcastController::class, 'show'])->name('show');
        
        // Actions
        Route::post('/{podcast}/approve', [AdminPodcastController::class, 'approve'])->name('approve');
        Route::post('/{podcast}/reject', [AdminPodcastController::class, 'reject'])->name('reject');
        Route::post('/{podcast}/suspend', [AdminPodcastController::class, 'suspend'])->name('suspend');
        Route::post('/{podcast}/restore', [AdminPodcastController::class, 'restore'])->name('restore');
        Route::delete('/{podcast}', [AdminPodcastController::class, 'destroy'])->name('destroy');
        
        // RSS Import
        Route::get('/import/rss', [AdminPodcastController::class, 'importForm'])->name('import.form');
        Route::post('/import/rss', [AdminPodcastController::class, 'importFromRss'])->name('import.rss');
    });
});
