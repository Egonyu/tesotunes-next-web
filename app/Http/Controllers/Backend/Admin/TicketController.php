<?php

namespace App\Http\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TicketController extends Controller
{
    public function index(Event $event)
    {
        $tickets = $event->tickets()
                         ->withCount('attendees')
                         ->orderBy('sort_order')
                         ->orderBy('price')
                         ->get();

        $salesStats = $event->ticket_sales_stats;

        return view('admin.tickets.index', compact('event', 'tickets', 'salesStats'));
    }

    public function create(Event $event)
    {
        return view('admin.tickets.create', compact('event'));
    }

    public function store(Request $request, Event $event)
    {
        $request->validate([
            'ticket_type' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'quantity_available' => 'nullable|integer|min:1',
            'max_per_order' => 'required|integer|min:1|max:100',
            'sales_start_at' => 'nullable|date|after_or_equal:now',
            'sales_end_at' => 'nullable|date|after:sales_start_at',
            'perks' => 'nullable|array',
            'perks.*' => 'string|max:255',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean'
        ]);

        DB::transaction(function () use ($request, $event) {
            $event->tickets()->create([
                'ticket_type' => $request->ticket_type,
                'description' => $request->description,
                'price' => $request->price,
                'quantity_available' => $request->quantity_available,
                'max_per_order' => $request->max_per_order,
                'sales_start_at' => $request->sales_start_at,
                'sales_end_at' => $request->sales_end_at,
                'perks' => $request->perks ? array_filter($request->perks) : null,
                'sort_order' => $request->sort_order ?? 0,
                'is_active' => $request->boolean('is_active', true)
            ]);
        });

        return redirect()
            ->route('admin.events.tickets.index', $event)
            ->with('success', 'Ticket type created successfully.');
    }

    public function show(Event $event, EventTicket $ticket)
    {
        $ticket->load(['attendees.user', 'attendees' => function($query) {
            $query->orderBy('created_at', 'desc');
        }]);

        $salesData = [
            'total_sold' => $ticket->quantity_sold,
            'total_revenue' => $ticket->total_revenue,
            'remaining' => $ticket->quantity_remaining,
            'sales_progress' => $ticket->sales_progress,
            'recent_sales' => $ticket->attendees()
                                   ->where('payment_status', 'completed')
                                   ->orderBy('created_at', 'desc')
                                   ->limit(10)
                                   ->with('user')
                                   ->get()
        ];

        return view('admin.tickets.show', compact('event', 'ticket', 'salesData'));
    }

    public function edit(Event $event, EventTicket $ticket)
    {
        return view('admin.tickets.edit', compact('event', 'ticket'));
    }

    public function update(Request $request, Event $event, EventTicket $ticket)
    {
        $request->validate([
            'ticket_type' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'quantity_available' => 'nullable|integer|min:' . $ticket->quantity_sold,
            'max_per_order' => 'required|integer|min:1|max:100',
            'sales_start_at' => 'nullable|date',
            'sales_end_at' => 'nullable|date|after:sales_start_at',
            'perks' => 'nullable|array',
            'perks.*' => 'string|max:255',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean'
        ]);

        DB::transaction(function () use ($request, $ticket) {
            $ticket->update([
                'ticket_type' => $request->ticket_type,
                'description' => $request->description,
                'price' => $request->price,
                'quantity_available' => $request->quantity_available,
                'max_per_order' => $request->max_per_order,
                'sales_start_at' => $request->sales_start_at,
                'sales_end_at' => $request->sales_end_at,
                'perks' => $request->perks ? array_filter($request->perks) : null,
                'sort_order' => $request->sort_order ?? 0,
                'is_active' => $request->boolean('is_active', true)
            ]);
        });

        return redirect()
            ->route('admin.events.tickets.index', $event)
            ->with('success', 'Ticket type updated successfully.');
    }

    public function destroy(Event $event, EventTicket $ticket)
    {
        if ($ticket->quantity_sold > 0) {
            return redirect()
                ->route('admin.events.tickets.index', $event)
                ->with('error', 'Cannot delete ticket type with existing sales.');
        }

        $ticket->delete();

        return redirect()
            ->route('admin.events.tickets.index', $event)
            ->with('success', 'Ticket type deleted successfully.');
    }

    public function activate(Event $event, EventTicket $ticket)
    {
        $ticket->update(['is_active' => true]);

        return redirect()
            ->route('admin.events.tickets.index', $event)
            ->with('success', 'Ticket type activated successfully.');
    }

    public function deactivate(Event $event, EventTicket $ticket)
    {
        $ticket->update(['is_active' => false]);

        return redirect()
            ->route('admin.events.tickets.index', $event)
            ->with('success', 'Ticket type deactivated successfully.');
    }

    public function duplicate(Event $event, EventTicket $ticket)
    {
        $newTicket = $ticket->replicate();
        $newTicket->ticket_type = $ticket->ticket_type . ' (Copy)';
        $newTicket->quantity_sold = 0;
        $newTicket->is_active = false;
        $newTicket->save();

        return redirect()
            ->route('admin.events.tickets.edit', [$event, $newTicket])
            ->with('success', 'Ticket type duplicated successfully. Please review and activate.');
    }

    public function bulkAction(Request $request, Event $event)
    {
        $request->validate([
            'action' => 'required|in:activate,deactivate,delete',
            'tickets' => 'required|array|min:1',
            'tickets.*' => 'exists:event_ticket_types,id'
        ]);

        $tickets = EventTicket::whereIn('id', $request->tickets)
                             ->where('event_id', $event->id)
                             ->get();

        $count = 0;

        DB::transaction(function () use ($request, $tickets, &$count) {
            foreach ($tickets as $ticket) {
                switch ($request->action) {
                    case 'activate':
                        $ticket->update(['is_active' => true]);
                        $count++;
                        break;
                    case 'deactivate':
                        $ticket->update(['is_active' => false]);
                        $count++;
                        break;
                    case 'delete':
                        if ($ticket->quantity_sold == 0) {
                            $ticket->delete();
                            $count++;
                        }
                        break;
                }
            }
        });

        $action = match($request->action) {
            'activate' => 'activated',
            'deactivate' => 'deactivated',
            'delete' => 'deleted'
        };

        return redirect()
            ->route('admin.events.tickets.index', $event)
            ->with('success', "{$count} ticket types {$action} successfully.");
    }

    public function analytics(Event $event)
    {
        $tickets = $event->tickets()
                         ->withCount(['attendees as confirmed_count' => function($query) {
                             $query->whereIn('status', ['confirmed', 'checked_in']);
                         }])
                         ->withCount(['attendees as pending_count' => function($query) {
                             $query->where('status', 'pending');
                         }])
                         ->get();

        $salesByDay = DB::table('event_registrations')
                       ->where('event_id', $event->id)
                       ->where('status', 'confirmed')
                       ->selectRaw('DATE(created_at) as date, COUNT(*) as tickets_sold, SUM(price_paid_ugx) as revenue')
                       ->groupBy('date')
                       ->orderBy('date')
                       ->get();

        $salesByTicketType = $tickets->map(function($ticket) {
            return [
                'ticket_type' => $ticket->ticket_type,
                'sold' => $ticket->quantity_sold,
                'revenue' => $ticket->total_revenue,
                'remaining' => $ticket->quantity_remaining
            ];
        });

        return view('admin.tickets.analytics', compact(
            'event', 'tickets', 'salesByDay', 'salesByTicketType'
        ));
    }

    public function export(Event $event)
    {
        $tickets = $event->tickets()
                         ->with(['attendees.user'])
                         ->get();

        $csvData = [];
        $csvData[] = [
            'Ticket Type', 'Price', 'Quantity Available', 'Quantity Sold',
            'Revenue', 'Status', 'Sales Start', 'Sales End'
        ];

        foreach ($tickets as $ticket) {
            $csvData[] = [
                $ticket->ticket_type,
                $ticket->price,
                $ticket->quantity_available ?? 'Unlimited',
                $ticket->quantity_sold,
                $ticket->total_revenue,
                $ticket->is_active ? 'Active' : 'Inactive',
                $ticket->sales_start_at?->format('Y-m-d H:i'),
                $ticket->sales_end_at?->format('Y-m-d H:i')
            ];
        }

        $filename = "tickets-{$event->title}-" . now()->format('Y-m-d') . '.csv';

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