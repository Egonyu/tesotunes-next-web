<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Awards Routes
|--------------------------------------------------------------------------
|
| These routes handle the awards and voting management in the admin panel.
|
*/

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::middleware('role:admin,super_admin')->prefix('awards')->name('awards.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'index'])->name('index');

        // Award Seasons Management
        Route::prefix('seasons')->name('seasons.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'seasons'])->name('index');
            Route::get('/create', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'createSeason'])->name('create');
            Route::post('/', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'storeSeason'])->name('store');
            Route::get('/{season}', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'showSeason'])->name('show');
            Route::get('/{season}/edit', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'editSeason'])->name('edit');
            Route::put('/{season}', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'updateSeason'])->name('update');
            Route::delete('/{season}', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'destroySeason'])->name('destroy');
        });

        // Award Categories Management
        Route::prefix('categories')->name('categories.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'categories'])->name('index');
            Route::get('/create', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'createCategory'])->name('create');
            Route::post('/', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'storeCategory'])->name('store');
            Route::get('/{category}', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'showCategory'])->name('show');
            Route::get('/{category}/edit', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'editCategory'])->name('edit');
            Route::put('/{category}', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'updateCategory'])->name('update');
            Route::delete('/{category}', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'destroyCategory'])->name('destroy');
        });

        // Nominations Management
        Route::prefix('nominations')->name('nominations.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'nominations'])->name('index');
            Route::get('/{nomination}', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'showNomination'])->name('show');
            Route::post('/{nomination}/approve', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'approveNomination'])->name('approve');
            Route::post('/{nomination}/reject', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'rejectNomination'])->name('reject');
            Route::post('/{nomination}/toggle-finalist', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'toggleFinalist'])->name('toggle-finalist');
            Route::delete('/{nomination}', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'destroyNomination'])->name('destroy');
        });

        // Votes Management
        Route::prefix('votes')->name('votes.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'votes'])->name('index');
            Route::get('/analytics', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'voteAnalytics'])->name('analytics');
            Route::delete('/{vote}', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'deleteVote'])->name('destroy');
            Route::get('/audit-logs', [\App\Http\Controllers\Backend\Admin\AwardController::class, 'auditLogs'])->name('audit-logs');
        });

        Route::get('/uploads/pending', function () {
            return redirect()->route('admin.music.songs.index')->with('filter', 'pending');
        })->name('uploads.pending');
        Route::get('/uploads/{upload}', function ($upload) {
            return redirect()->route('admin.music.songs.show', $upload);
        })->name('uploads.show');
    });
});
