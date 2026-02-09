<?php

namespace App\Http\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventAttendee;
use App\Models\EventTicket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendeeController extends Controller
{
    public function index(Event $event, Request $request)
    {
        $query = $event->attendees()->with(['user', 'eventTicket']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('attendance_type')) {
            $query->where('attendance_type', $request->attendance_type);
        }

        if ($request->filled('ticket_type')) {
            $query->whereHas('eventTicket', function($q) use ($request) {
                $q->where('id', $request->ticket_type);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            })->orWhere('ticket_code', 'LIKE', "%{$search}%");
        }

        $attendees = $query->orderBy('created_at', 'desc')->paginate(25);

        $stats = [
            'total' => $event->attendees()->count(),
            'confirmed' => $event->confirmed_attendees_count,
            'pending' => $event->pending_attendees_count,
            'checked_in' => $event->checked_in_attendees_count,
            'cancelled' => $event->attendees()->cancelled()->count(),
            'revenue' => $event->total_revenue
        ];

        $ticketTypes = $event->tickets()->get();

        return view('admin.attendees.index', compact(
            'event', 'attendees', 'stats', 'ticketTypes'
        ));
    }

    public function show(Event $event, EventAttendee $attendee)
    {
        $attendee->load(['user', 'eventTicket', 'checkedInBy']);

        $ticketDetails = $attendee->getTicketDetails();

        return view('admin.attendees.show', compact('event', 'attendee', 'ticketDetails'));
    }

    public function create(Event $event)
    {
        $users = User::orderBy('name')->get();
        $tickets = $event->tickets()->active()->get();

        return view('admin.attendees.create', compact('event', 'users', 'tickets'));
    }

    public function store(Request $request, Event $event)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'event_ticket_id' => 'nullable|exists:event_ticket_types,id',
            'attendance_type' => 'required|in:ticket_purchase,rsvp,guest_list',
            'status' => 'required|in:confirmed,pending',
            'amount_paid' => 'nullable|numeric|min:0',
            'payment_reference' => 'nullable|string|max:255',
            'payment_status' => 'required|in:pending,completed',
            'notes' => 'nullable|string|max:1000'
        ]);

        // Check if user is already registered
        $existingAttendee = $event->attendees()
                                  ->where('user_id', $request->user_id)
                                  ->first();

        if ($existingAttendee) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'This user is already registered for this event.');
        }

        DB::transaction(function () use ($request, $event) {
            $attendee = $event->attendees()->create([
                'user_id' => $request->user_id,
                'event_ticket_id' => $request->event_ticket_id,
                'attendance_type' => $request->attendance_type,
                'status' => $request->status,
                'amount_paid' => $request->amount_paid ?? 0,
                'payment_reference' => $request->payment_reference,
                'payment_status' => $request->payment_status,
                'attendee_metadata' => [
                    'admin_created' => true,
                    'notes' => $request->notes,
                    'created_by' => auth()->id()
                ]
            ]);

            // Update ticket sales count if applicable
            if ($request->event_ticket_id) {
                $ticket = EventTicket::find($request->event_ticket_id);
                $ticket->increment('quantity_sold');
            }
        });

        return redirect()
            ->route('admin.events.attendees.index', $event)
            ->with('success', 'Attendee added successfully.');
    }

    public function edit(Event $event, EventAttendee $attendee)
    {
        $users = User::orderBy('name')->get();
        $tickets = $event->tickets()->get();

        return view('admin.attendees.edit', compact('event', 'attendee', 'users', 'tickets'));
    }

    public function update(Request $request, Event $event, EventAttendee $attendee)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'event_ticket_id' => 'nullable|exists:event_ticket_types,id',
            'attendance_type' => 'required|in:ticket_purchase,rsvp,guest_list',
            'status' => 'required|in:confirmed,pending,cancelled',
            'amount_paid' => 'nullable|numeric|min:0',
            'payment_reference' => 'nullable|string|max:255',
            'payment_status' => 'required|in:pending,completed,failed,refunded',
            'notes' => 'nullable|string|max:1000'
        ]);

        DB::transaction(function () use ($request, $attendee) {
            $oldTicketId = $attendee->event_ticket_id;
            $newTicketId = $request->event_ticket_id;

            $attendee->update([
                'user_id' => $request->user_id,
                'event_ticket_id' => $request->event_ticket_id,
                'attendance_type' => $request->attendance_type,
                'status' => $request->status,
                'amount_paid' => $request->amount_paid ?? 0,
                'payment_reference' => $request->payment_reference,
                'payment_status' => $request->payment_status,
                'attendee_metadata' => array_merge(
                    $attendee->attendee_metadata ?? [],
                    [
                        'notes' => $request->notes,
                        'last_updated_by' => auth()->id(),
                        'last_updated_at' => now()->toISOString()
                    ]
                )
            ]);

            // Update ticket counts if ticket changed
            if ($oldTicketId !== $newTicketId) {
                if ($oldTicketId) {
                    EventTicket::find($oldTicketId)->decrement('quantity_sold');
                }
                if ($newTicketId) {
                    EventTicket::find($newTicketId)->increment('quantity_sold');
                }
            }
        });

        return redirect()
            ->route('admin.events.attendees.show', [$event, $attendee])
            ->with('success', 'Attendee updated successfully.');
    }

    public function destroy(Event $event, EventAttendee $attendee)
    {
        DB::transaction(function () use ($attendee) {
            // Return ticket to inventory if applicable
            if ($attendee->eventTicket) {
                $attendee->eventTicket->decrement('quantity_sold', $attendee->quantity);
            }

            $attendee->delete();
        });

        return redirect()
            ->route('admin.events.attendees.index', $event)
            ->with('success', 'Attendee removed successfully.');
    }

    public function checkIn(Event $event, EventAttendee $attendee)
    {
        if (!$attendee->can_check_in) {
            return redirect()
                ->back()
                ->with('error', 'This attendee cannot be checked in.');
        }

        $attendee->checkIn(auth()->user());

        return redirect()
            ->back()
            ->with('success', 'Attendee checked in successfully.');
    }

    public function checkInByCode(Request $request, Event $event)
    {
        $request->validate([
            'ticket_code' => 'required|string'
        ]);

        $validation = EventAttendee::validateTicketCode($request->ticket_code);

        if (!$validation['valid']) {
            return response()->json([
                'success' => false,
                'message' => $validation['message']
            ], 400);
        }

        $attendee = $validation['attendee'];

        if ($attendee->event_id !== $event->id) {
            return response()->json([
                'success' => false,
                'message' => 'This ticket is not valid for this event.'
            ], 400);
        }

        $attendee->checkIn(auth()->user());

        return response()->json([
            'success' => true,
            'message' => 'Check-in successful!',
            'attendee' => [
                'name' => $attendee->user->name,
                'ticket_type' => $attendee->ticket_type,
                'ticket_code' => $attendee->ticket_code
            ]
        ]);
    }

    public function cancel(Event $event, EventAttendee $attendee, Request $request)
    {
        $request->validate([
            'reason' => 'nullable|string|max:500'
        ]);

        if (!$attendee->can_cancel) {
            return redirect()
                ->back()
                ->with('error', 'This attendee cannot be cancelled.');
        }

        $attendee->cancel($request->reason);

        return redirect()
            ->back()
            ->with('success', 'Attendee cancelled successfully.');
    }

    public function refund(Event $event, EventAttendee $attendee, Request $request)
    {
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        if (!$attendee->is_paid) {
            return redirect()
                ->back()
                ->with('error', 'Cannot refund unpaid ticket.');
        }

        $attendee->refund($request->reason);

        return redirect()
            ->back()
            ->with('success', 'Attendee refunded successfully.');
    }

    public function resendTicket(Event $event, EventAttendee $attendee)
    {
        if (!$attendee->is_confirmed) {
            return redirect()
                ->back()
                ->with('error', 'Can only resend tickets for confirmed attendees.');
        }

        $attendee->sendTicketEmail();

        return redirect()
            ->back()
            ->with('success', 'Ticket email sent successfully.');
    }

    public function bulkAction(Request $request, Event $event)
    {
        $request->validate([
            'action' => 'required|in:check_in,confirm,cancel,delete',
            'attendees' => 'required|array|min:1',
            'attendees.*' => 'exists:event_registrations,id'
        ]);

        $attendees = EventAttendee::whereIn('id', $request->attendees)
                                 ->where('event_id', $event->id)
                                 ->get();

        $count = 0;

        DB::transaction(function () use ($request, $attendees, &$count) {
            foreach ($attendees as $attendee) {
                switch ($request->action) {
                    case 'check_in':
                        if ($attendee->can_check_in) {
                            $attendee->checkIn(auth()->user());
                            $count++;
                        }
                        break;
                    case 'confirm':
                        if ($attendee->status === 'pending') {
                            $attendee->confirm();
                            $count++;
                        }
                        break;
                    case 'cancel':
                        if ($attendee->can_cancel) {
                            $attendee->cancel('Bulk cancellation by admin');
                            $count++;
                        }
                        break;
                    case 'delete':
                        if ($attendee->eventTicket) {
                            $attendee->eventTicket->decrement('quantity_sold', $attendee->quantity);
                        }
                        $attendee->delete();
                        $count++;
                        break;
                }
            }
        });

        $action = match($request->action) {
            'check_in' => 'checked in',
            'confirm' => 'confirmed',
            'cancel' => 'cancelled',
            'delete' => 'deleted'
        };

        return redirect()
            ->route('admin.events.attendees.index', $event)
            ->with('success', "{$count} attendees {$action} successfully.");
    }

    public function export(Event $event, Request $request)
    {
        $query = $event->attendees()->with(['user', 'eventTicket']);

        // Apply same filters as index
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $attendees = $query->get();

        $csvData = [];
        $csvData[] = [
            'Name', 'Email', 'Ticket Type', 'Ticket Code', 'Status',
            'Payment Status', 'Amount Paid', 'Registration Date',
            'Check-in Date', 'Attendance Type'
        ];

        foreach ($attendees as $attendee) {
            $csvData[] = [
                $attendee->user->name,
                $attendee->user->email,
                $attendee->ticket_type,
                $attendee->ticket_code,
                $attendee->status_text,
                $attendee->payment_status_text,
                $attendee->formatted_amount,
                $attendee->created_at->format('Y-m-d H:i'),
                $attendee->checked_in_at?->format('Y-m-d H:i'),
                $attendee->attendance_type_text
            ];
        }

        $filename = "attendees-{$event->title}-" . now()->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($csvData) {
            $file = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}