<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Reports Routes
|--------------------------------------------------------------------------
|
| These routes handle the reports and analytics in the admin panel.
|
*/

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Backend\Admin\ReportController::class, 'index'])->name('index');
        Route::get('/users', [\App\Http\Controllers\Backend\Admin\ReportController::class, 'users'])->name('users');
        Route::get('/music', [\App\Http\Controllers\Backend\Admin\ReportController::class, 'music'])->name('music');
        Route::get('/credits', [\App\Http\Controllers\Backend\Admin\ReportController::class, 'credits'])->name('credits');
        Route::get('/promotions', [\App\Http\Controllers\Backend\Admin\ReportController::class, 'promotions'])->name('promotions');
        Route::get('/export/{type}', [\App\Http\Controllers\Backend\Admin\ReportController::class, 'export'])->name('export');
    });

    Route::middleware('role:admin,super_admin')->prefix('analytics')->name('analytics.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Backend\Admin\ReportController::class, 'index'])->name('index');
        Route::get('/users', [\App\Http\Controllers\Backend\Admin\ReportController::class, 'users'])->name('users');
        Route::get('/revenue', function () {
            return redirect()->route('admin.payments.analytics');
        })->name('revenue');
        Route::get('/content', [\App\Http\Controllers\Backend\Admin\ReportController::class, 'music'])->name('content');
        Route::get('/export', function () {
            return redirect()->route('admin.reports.export', 'analytics');
        })->name('export');
    });
});
