<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Backend\Admin\FrontendDesignController;

// Frontend Design Management Routes
Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::prefix('frontend-design')->name('frontend-design.')->group(function () {
        Route::get('/', [FrontendDesignController::class, 'index'])->name('index');
        Route::post('/update', [FrontendDesignController::class, 'update'])->name('update');
        Route::post('/reset', [FrontendDesignController::class, 'reset'])->name('reset');
    });
});
