<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Events Routes
|--------------------------------------------------------------------------
|
| These routes handle the event management in the admin panel.
|
*/

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::middleware('role:admin,super_admin,moderator')->group(function () {
        // Resource routes for events (index, create, store, show, edit, update, destroy)
        Route::resource('events', \App\Http\Controllers\Backend\Admin\EventController::class);
        
        // Custom event actions
        Route::post('events/{event}/publish', [\App\Http\Controllers\Backend\Admin\EventController::class, 'publish'])->name('events.publish');
        Route::post('events/{event}/unpublish', [\App\Http\Controllers\Backend\Admin\EventController::class, 'unpublish'])->name('events.unpublish');
        Route::get('events/{event}/attendees-list', [\App\Http\Controllers\Backend\Admin\EventController::class, 'attendees'])->name('events.attendees');
        Route::get('events/{event}/download-report', [\App\Http\Controllers\Backend\Admin\EventController::class, 'report'])->name('events.report');
        Route::post('events/{event}/send-notification', [\App\Http\Controllers\Backend\Admin\EventController::class, 'notify'])->name('events.notify');

        // Nested resource for tickets
        Route::resource('events.tickets', \App\Http\Controllers\Backend\Admin\TicketController::class);
        
        // Custom ticket actions
        Route::post('events/{event}/tickets/{ticket}/activate', [\App\Http\Controllers\Backend\Admin\TicketController::class, 'activate'])->name('events.tickets.activate');
        Route::post('events/{event}/tickets/{ticket}/deactivate', [\App\Http\Controllers\Backend\Admin\TicketController::class, 'deactivate'])->name('events.tickets.deactivate');
        Route::post('events/{event}/tickets/{ticket}/duplicate', [\App\Http\Controllers\Backend\Admin\TicketController::class, 'duplicate'])->name('events.tickets.duplicate');
        Route::post('events/{event}/tickets/bulk-action', [\App\Http\Controllers\Backend\Admin\TicketController::class, 'bulkAction'])->name('events.tickets.bulk-action');
        Route::get('events/{event}/tickets-analytics', [\App\Http\Controllers\Backend\Admin\TicketController::class, 'analytics'])->name('events.tickets.analytics');
        Route::get('events/{event}/tickets-export', [\App\Http\Controllers\Backend\Admin\TicketController::class, 'export'])->name('events.tickets.export');

        // Attendee Management
        Route::prefix('{event}/attendees')->name('attendees.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Backend\Admin\AttendeeController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\Backend\Admin\AttendeeController::class, 'create'])->name('create');
            Route::post('/', [\App\Http\Controllers\Backend\Admin\AttendeeController::class, 'store'])->name('store');
            Route::get('/{attendee}', [\App\Http\Controllers\Backend\Admin\AttendeeController::class, 'show'])->name('show');
            Route::get('/{attendee}/edit', [\App\Http\Controllers\Backend\Admin\AttendeeController::class, 'edit'])->name('edit');
            Route::put('/{attendee}', [\App\Http\Controllers\Backend\Admin\AttendeeController::class, 'update'])->name('update');
            Route::delete('/{attendee}', [\App\Http\Controllers\Backend\Admin\AttendeeController::class, 'destroy'])->name('destroy');
            Route::post('/{attendee}/check-in', [\App\Http\Controllers\Backend\Admin\AttendeeController::class, 'checkIn'])->name('check-in');
            Route::post('/{attendee}/cancel', [\App\Http\Controllers\Backend\Admin\AttendeeController::class, 'cancel'])->name('cancel');
            Route::post('/{attendee}/refund', [\App\Http\Controllers\Backend\Admin\AttendeeController::class, 'refund'])->name('refund');
            Route::post('/{attendee}/resend-ticket', [\App\Http\Controllers\Backend\Admin\AttendeeController::class, 'resendTicket'])->name('resend-ticket');
            Route::post('/bulk-action', [\App\Http\Controllers\Backend\Admin\AttendeeController::class, 'bulkAction'])->name('bulk-action');
            Route::get('/export', [\App\Http\Controllers\Backend\Admin\AttendeeController::class, 'export'])->name('export');
        });

        // Check-in Management
        Route::prefix('{event}/checkin')->name('checkin.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Backend\Admin\CheckInController::class, 'dashboard'])->name('dashboard');
            Route::get('/scanner', [\App\Http\Controllers\Backend\Admin\CheckInController::class, 'scanner'])->name('scanner');
            Route::get('/manual', [\App\Http\Controllers\Backend\Admin\CheckInController::class, 'manual'])->name('manual');
            Route::post('/validate', [\App\Http\Controllers\Backend\Admin\CheckInController::class, 'validateTicket'])->name('validate');
            Route::post('/checkin', [\App\Http\Controllers\Backend\Admin\CheckInController::class, 'checkIn'])->name('checkin');
            Route::post('/{attendee}/manual-checkin', [\App\Http\Controllers\Backend\Admin\CheckInController::class, 'manualCheckIn'])->name('manual-checkin');
            Route::post('/{attendee}/undo-checkin', [\App\Http\Controllers\Backend\Admin\CheckInController::class, 'undoCheckIn'])->name('undo-checkin');
            Route::get('/export', [\App\Http\Controllers\Backend\Admin\CheckInController::class, 'exportCheckins'])->name('export');
            Route::get('/search', [\App\Http\Controllers\Backend\Admin\CheckInController::class, 'searchAttendees'])->name('search');
        });
    });
});