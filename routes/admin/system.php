<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Backend\Admin\SystemHealthController;

/*
|--------------------------------------------------------------------------
| System Health & Monitoring Routes
|--------------------------------------------------------------------------
|
| Routes for system health monitoring, logs viewing, and maintenance commands.
| Only accessible by super admins.
|
*/

Route::prefix('admin/system')->name('admin.system.')->middleware(['auth', 'role:super_admin'])->group(function () {
    
    // Dashboard
    Route::get('/', [SystemHealthController::class, 'index'])->name('index');
    
    // Health Status (AJAX)
    Route::get('/health-status', [SystemHealthController::class, 'healthStatus'])->name('health.status');
    
    // System Logs
    Route::get('/logs', [SystemHealthController::class, 'logs'])->name('logs');
    
    // Run Health Tests
    Route::post('/tests', [SystemHealthController::class, 'runTests'])->name('tests.run');
    
    // Execute Maintenance Commands
    Route::post('/command', [SystemHealthController::class, 'executeCommand'])->name('command.execute');
    
    // Clear Cache
    Route::post('/cache/clear', [SystemHealthController::class, 'clearCache'])->name('cache.clear');
    
    // System Statistics
    Route::get('/statistics', [SystemHealthController::class, 'statistics'])->name('statistics');
    
    // Terminal (Safe Commands Only)
    Route::post('/terminal', [SystemHealthController::class, 'terminal'])->name('terminal');
    
    // Backup & Recovery Routes
    Route::prefix('backups')->name('backups.')->group(function () {
        Route::get('/', [SystemHealthController::class, 'listBackups'])->name('list');
        Route::get('/settings', [SystemHealthController::class, 'backupSettings'])->name('settings');
        Route::post('/settings', [SystemHealthController::class, 'updateBackupSettings'])->name('settings.update');
        Route::post('/run', [SystemHealthController::class, 'runBackup'])->name('run');
        Route::get('/{id}/download', [SystemHealthController::class, 'downloadBackup'])->name('download');
        Route::post('/{id}/restore', [SystemHealthController::class, 'restoreBackup'])->name('restore');
        Route::delete('/{id}', [SystemHealthController::class, 'deleteBackup'])->name('delete');
    });
});
