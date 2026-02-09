<?php

namespace App\Http\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventAttendee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckInController extends Controller
{
    public function index(Event $event)
    {
        $stats = [
            'total_attendees' => $event->confirmed_attendees_count,
            'checked_in' => $event->checked_in_attendees_count,
            'pending_check_in' => $event->attendees()
                                       ->whereIn('status', ['confirmed'])
                                       ->count(),
            'check_in_rate' => $event->confirmed_attendees_count > 0 ?
                ($event->checked_in_attendees_count / $event->confirmed_attendees_count) * 100 : 0
        ];

        $recentCheckIns = $event->attendees()
                               ->with(['user', 'eventTicket', 'checkedInBy'])
                               ->where('status', 'checked_in')
                               ->orderBy('checked_in_at', 'desc')
                               ->limit(20)
                               ->get();

        return view('admin.checkin.index', compact('event', 'stats', 'recentCheckIns'));
    }

    public function scan(Event $event)
    {
        return view('admin.checkin.scan', compact('event'));
    }

    public function validateTicket(Request $request, Event $event)
    {
        $request->validate([
            'ticket_code' => 'required|string'
        ]);

        $validation = EventAttendee::validateTicketCode($request->ticket_code);

        if (!$validation['valid']) {
            return response()->json([
                'success' => false,
                'message' => $validation['message'],
                'type' => 'error'
            ]);
        }

        $attendee = $validation['attendee'];

        // Check if ticket belongs to this event
        if ($attendee->event_id !== $event->id) {
            return response()->json([
                'success' => false,
                'message' => 'This ticket is not valid for this event.',
                'type' => 'error'
            ]);
        }

        // Return ticket information for confirmation
        return response()->json([
            'success' => true,
            'message' => 'Valid ticket - ready for check-in',
            'type' => 'success',
            'attendee' => [
                'id' => $attendee->id,
                'name' => $attendee->user->name,
                'email' => $attendee->user->email,
                'ticket_type' => $attendee->ticket_type,
                'ticket_code' => $attendee->ticket_code,
                'amount_paid' => $attendee->formatted_amount,
                'status' => $attendee->status_text,
                'registration_date' => $attendee->created_at->format('M j, Y g:i A'),
                'special_requirements' => $attendee->attendee_metadata['special_requirements'] ?? null
            ]
        ]);
    }

    public function processCheckIn(Request $request, Event $event)
    {
        $request->validate([
            'attendee_id' => 'required|exists:event_registrations,id'
        ]);

        $attendee = EventAttendee::find($request->attendee_id);

        // Verify attendee belongs to this event
        if ($attendee->event_id !== $event->id) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid attendee for this event.',
                'type' => 'error'
            ]);
        }

        // Double-check if attendee can be checked in
        if (!$attendee->can_check_in) {
            return response()->json([
                'success' => false,
                'message' => 'This attendee cannot be checked in.',
                'type' => 'error'
            ]);
        }

        $success = $attendee->checkIn(auth()->user());

        if ($success) {
            return response()->json([
                'success' => true,
                'message' => 'Check-in successful!',
                'type' => 'success',
                'attendee' => [
                    'name' => $attendee->user->name,
                    'ticket_type' => $attendee->ticket_type,
                    'checked_in_at' => $attendee->checked_in_at->format('g:i A')
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Check-in failed. Please try again.',
            'type' => 'error'
        ]);
    }

    public function manualCheckIn(Request $request, Event $event)
    {
        $request->validate([
            'search' => 'required|string|min:2'
        ]);

        $search = $request->search;

        $attendees = $event->attendees()
                          ->with(['user', 'eventTicket'])
                          ->whereHas('user', function($q) use ($search) {
                              $q->where('name', 'LIKE', "%{$search}%")
                                ->orWhere('email', 'LIKE', "%{$search}%");
                          })
                          ->orWhere('ticket_code', 'LIKE', "%{$search}%")
                          ->whereIn('status', ['confirmed', 'checked_in'])
                          ->limit(10)
                          ->get();

        $results = $attendees->map(function($attendee) {
            return [
                'id' => $attendee->id,
                'name' => $attendee->user->name,
                'email' => $attendee->user->email,
                'ticket_type' => $attendee->ticket_type,
                'ticket_code' => $attendee->ticket_code,
                'status' => $attendee->status_text,
                'can_check_in' => $attendee->can_check_in,
                'is_checked_in' => $attendee->is_checked_in,
                'checked_in_at' => $attendee->checked_in_at?->format('M j, Y g:i A')
            ];
        });

        return response()->json([
            'success' => true,
            'attendees' => $results
        ]);
    }

    public function checkInStats(Event $event)
    {
        $hourlyStats = DB::table('event_registrations')
                        ->where('event_id', $event->id)
                        ->where('status', 'attended')
                        ->whereNotNull('confirmed_at')
                        ->whereDate('confirmed_at', now()->toDateString())
                        ->selectRaw('HOUR(confirmed_at) as hour, COUNT(*) as count')
                        ->groupBy('hour')
                        ->orderBy('hour')
                        ->get();

        $ticketTypeStats = $event->tickets()
                                ->withCount(['attendees as checked_in_count' => function($query) {
                                    $query->where('status', 'checked_in');
                                }])
                                ->withCount(['attendees as confirmed_count' => function($query) {
                                    $query->whereIn('status', ['confirmed', 'checked_in']);
                                }])
                                ->get()
                                ->map(function($ticket) {
                                    return [
                                        'ticket_type' => $ticket->ticket_type,
                                        'confirmed' => $ticket->confirmed_count,
                                        'checked_in' => $ticket->checked_in_count,
                                        'check_in_rate' => $ticket->confirmed_count > 0 ?
                                            ($ticket->checked_in_count / $ticket->confirmed_count) * 100 : 0
                                    ];
                                });

        $totalStats = [
            'total_confirmed' => $event->confirmed_attendees_count,
            'total_checked_in' => $event->checked_in_attendees_count,
            'overall_rate' => $event->confirmed_attendees_count > 0 ?
                ($event->checked_in_attendees_count / $event->confirmed_attendees_count) * 100 : 0,
            'today_checked_in' => $event->attendees()
                                       ->where('status', 'checked_in')
                                       ->whereDate('checked_in_at', now()->toDateString())
                                       ->count()
        ];

        return response()->json([
            'success' => true,
            'hourly_stats' => $hourlyStats,
            'ticket_type_stats' => $ticketTypeStats,
            'total_stats' => $totalStats
        ]);
    }

    public function dashboard(Event $event)
    {
        $stats = [
            'total_confirmed' => $event->confirmed_attendees_count,
            'checked_in' => $event->checked_in_attendees_count,
            'pending_check_in' => $event->attendees()
                                       ->where('status', 'confirmed')
                                       ->count(),
            'check_in_rate' => $event->confirmed_attendees_count > 0 ?
                round(($event->checked_in_attendees_count / $event->confirmed_attendees_count) * 100, 1) : 0
        ];

        $recentActivity = $event->attendees()
                               ->with(['user', 'eventTicket', 'checkedInBy'])
                               ->where('status', 'checked_in')
                               ->orderBy('checked_in_at', 'desc')
                               ->limit(10)
                               ->get();

        $checkInsByHour = DB::table('event_registrations')
                           ->where('event_id', $event->id)
                           ->where('status', 'attended')
                           ->whereDate('confirmed_at', now()->toDateString())
                           ->selectRaw('HOUR(confirmed_at) as hour, COUNT(*) as count')
                           ->groupBy('hour')
                           ->orderBy('hour')
                           ->pluck('count', 'hour');

        return view('admin.checkin.dashboard', compact(
            'event', 'stats', 'recentActivity', 'checkInsByHour'
        ));
    }

    public function export(Event $event)
    {
        $checkedInAttendees = $event->attendees()
                                   ->with(['user', 'eventTicket', 'checkedInBy'])
                                   ->where('status', 'checked_in')
                                   ->orderBy('checked_in_at', 'asc')
                                   ->get();

        $csvData = [];
        $csvData[] = [
            'Name', 'Email', 'Ticket Type', 'Ticket Code',
            'Check-in Time', 'Checked In By', 'Amount Paid'
        ];

        foreach ($checkedInAttendees as $attendee) {
            $csvData[] = [
                $attendee->user->name,
                $attendee->user->email,
                $attendee->ticket_type,
                $attendee->ticket_code,
                $attendee->checked_in_at->format('Y-m-d H:i:s'),
                $attendee->checkedInBy?->name ?? 'System',
                $attendee->formatted_amount
            ];
        }

        $filename = "checkins-{$event->title}-" . now()->format('Y-m-d') . '.csv';

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