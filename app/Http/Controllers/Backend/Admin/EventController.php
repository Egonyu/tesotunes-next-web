<?php

namespace App\Http\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventAttendee;
use App\Models\EventLocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::with(['location', 'statistics', 'organizer'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        // Calculate stats using Eloquent
        $upcomingEvents = Event::where('starts_at', '>=', now())
            ->where('status', 'published')
            ->count();

        $monthlyEvents = Event::whereMonth('starts_at', now()->month)
            ->whereYear('starts_at', now()->year)
            ->count();

        $totalAttendees = EventAttendee::whereIn('status', ['confirmed', 'attended'])
            ->count();

        return view('admin.events.index', compact('events', 'upcomingEvents', 'monthlyEvents', 'totalAttendees'));
    }

    public function create(Request $request)
    {
        // Get preselected artist if provided
        $preselectedArtist = null;
        if ($request->has('artist_id')) {
            $preselectedArtist = \App\Models\User::find($request->artist_id);
        }

        return view('admin.events.create', compact('preselectedArtist'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'starts_at' => 'required|date|after:now',
            'ends_at' => 'nullable|date|after:starts_at',
            'venue_name' => 'required|string|max:255',
            'venue_address' => 'nullable|string',
            'city' => 'required|string|max:255',
            'total_tickets' => 'nullable|integer|min:1',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required|in:draft,published,cancelled,completed',
            'event_type' => 'required|in:concert,festival,meetup,workshop,other',
        ]);

        $imagePath = null;
        if ($request->hasFile('cover_image')) {
            $imagePath = $request->file('cover_image')->store('events', 'public');
        }

        DB::table('events')->insert([
            'uuid' => \Illuminate\Support\Str::uuid(),
            'title' => $request->title,
            'slug' => \Illuminate\Support\Str::slug($request->title) . '-' . time(),
            'description' => $request->description,
            'starts_at' => $request->starts_at,
            'ends_at' => $request->ends_at ?? $request->starts_at,
            'event_type' => $request->event_type ?? 'concert',
            'venue_name' => $request->venue_name,
            'venue_address' => $request->venue_address,
            'city' => $request->city ?? 'Kampala',
            'country' => $request->country ?? 'Uganda',
            'total_tickets' => $request->total_tickets ?? 0,
            'artwork' => $imagePath,
            'status' => $request->status,
            'organizer_id' => auth()->id(),
            'organizer_type' => 'user',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('admin.events.index')
            ->with('success', 'Event created successfully.');
    }

    public function show($id)
    {
        $event = DB::table('events')->where('id', $id)->first();

        if (!$event) {
            return redirect()->route('admin.events.index')
                ->with('error', 'Event not found.');
        }

        // Get attendees count
        $attendeesCount = DB::table('event_registrations')
            ->where('event_id', $id)
            ->count();

        // Get tickets for this event
        $tickets = DB::table('event_ticket_types')
            ->where('event_id', $id)
            ->orderBy('sort_order', 'asc')
            ->orderBy('price_ugx', 'asc')
            ->get();

        // Get organizer information
        $organizer = DB::table('users')
            ->where('id', $event->user_id)
            ->first();

        return view('admin.events.show', compact('event', 'attendeesCount', 'tickets', 'organizer'));
    }

    public function edit($id)
    {
        $event = DB::table('events')->where('id', $id)->first();

        if (!$event) {
            return redirect()->route('admin.events.index')
                ->with('error', 'Event not found.');
        }

        // Load existing tickets for this event
        $tickets = DB::table('event_ticket_types')
            ->where('event_id', $id)
            ->orderBy('price_ugx', 'asc')
            ->get();
        
        $event->tickets = $tickets;

        return view('admin.events.edit', compact('event'));
    }

    public function update(Request $request, $id)
    {
        $event = DB::table('events')->where('id', $id)->first();

        if (!$event) {
            return redirect()->route('admin.events.index')
                ->with('error', 'Event not found.');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'starts_at' => 'required|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'venue_name' => 'required|string|max:255',
            'venue_address' => 'nullable|string',
            'city' => 'required|string|max:255',
            'total_tickets' => 'nullable|integer|min:1',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required|in:draft,published,cancelled,completed',
            'event_type' => 'required|in:concert,festival,meetup,workshop,other',
            'tickets' => 'nullable|array',
            'tickets.*.type' => 'required_with:tickets|string',
            'tickets.*.name' => 'required_with:tickets|string|max:255',
            'tickets.*.price' => 'required_with:tickets|numeric|min:0',
            'tickets.*.quantity' => 'required_with:tickets|integer|min:1',
            'tickets.*.description' => 'nullable|string',
            'tickets.*.max_per_order' => 'nullable|integer|min:1',
        ]);

        $updateData = [
            'title' => $request->title,
            'slug' => \Illuminate\Support\Str::slug($request->title) . '-' . $id,
            'description' => $request->description,
            'starts_at' => $request->starts_at,
            'ends_at' => $request->ends_at ?? $request->starts_at,
            'event_type' => $request->event_type,
            'venue_name' => $request->venue_name,
            'venue_address' => $request->venue_address,
            'city' => $request->city,
            'country' => $request->country ?? 'Uganda',
            'total_tickets' => $request->total_tickets ?? 0,
            'status' => $request->status,
            'updated_at' => now(),
        ];

        if ($request->hasFile('cover_image')) {
            // Delete old image if exists
            if ($event->artwork) {
                Storage::disk('public')->delete($event->artwork);
            }
            $updateData['artwork'] = $request->file('cover_image')->store('events', 'public');
        }

        DB::table('events')->where('id', $id)->update($updateData);

        // Handle Ticket Tiers
        if ($request->has('tickets') && is_array($request->tickets)) {
            // Delete existing tickets for this event
            DB::table('event_ticket_types')->where('event_id', $id)->delete();
            
            // Insert new tickets
            $now = now();
            foreach ($request->tickets as $index => $ticketData) {
                DB::table('event_ticket_types')->insert([
                    'event_id' => $id,
                    'name' => $ticketData['name'],
                    'description' => $ticketData['description'] ?? null,
                    'price_ugx' => $ticketData['price'],
                    'price_credits' => $ticketData['price_credits'] ?? 0,
                    'quantity_total' => $ticketData['quantity'],
                    'max_per_order' => $ticketData['max_per_order'] ?? 10,
                    'is_active' => isset($ticketData['is_active']) ? 1 : 0,
                    'is_available' => 1,
                    'sort_order' => $index + 1,
                    'perks' => json_encode([
                        'type' => $ticketData['type'],
                        'description' => $ticketData['description'] ?? ''
                    ]),
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        return redirect()->route('admin.events.edit', $id)
            ->with('success', 'Event and ticket tiers updated successfully.');
    }

    public function destroy($id)
    {
        $event = DB::table('events')->where('id', $id)->first();

        if (!$event) {
            return redirect()->route('admin.events.index')
                ->with('error', 'Event not found.');
        }

        // Delete associated image
        if ($event->cover_image) {
            Storage::disk('public')->delete($event->cover_image);
        }

        // Delete associated attendees
        DB::table('event_registrations')->where('event_id', $id)->delete();

        // Delete the event
        DB::table('events')->where('id', $id)->delete();

        return redirect()->route('admin.events.index')
            ->with('success', 'Event deleted successfully.');
    }

    public function publish($id)
    {
        $event = DB::table('events')->where('id', $id)->first();

        if (!$event) {
            return redirect()->route('admin.events.index')
                ->with('error', 'Event not found.');
        }

        DB::table('events')->where('id', $id)->update([
            'status' => 'published',
            'updated_at' => now(),
        ]);

        return redirect()->route('admin.events.show', $id)
            ->with('success', 'Event published successfully.');
    }

    public function unpublish($id)
    {
        $event = DB::table('events')->where('id', $id)->first();

        if (!$event) {
            return redirect()->route('admin.events.index')
                ->with('error', 'Event not found.');
        }

        DB::table('events')->where('id', $id)->update([
            'status' => 'draft',
            'updated_at' => now(),
        ]);

        return redirect()->route('admin.events.show', $id)
            ->with('success', 'Event unpublished successfully.');
    }

    public function attendees($id)
    {
        $event = Event::with(['tickets'])->findOrFail($id);

        $attendees = EventAttendee::with(['user', 'ticketType'])
            ->where('event_id', $id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return view('admin.events.attendees', compact('event', 'attendees'));
    }

    public function report($id)
    {
        $event = DB::table('events')->where('id', $id)->first();

        if (!$event) {
            return redirect()->route('admin.events.index')
                ->with('error', 'Event not found.');
        }

        // Get event data for report
        $attendees = DB::table('event_registrations')
            ->join('users', 'event_registrations.user_id', '=', 'users.id')
            ->where('event_registrations.event_id', $id)
            ->select('users.name', 'users.email', 'event_registrations.confirmation_code', 'event_registrations.created_at')
            ->get();

        $tickets = DB::table('event_ticket_types')
            ->where('event_id', $id)
            ->get();

        // Generate CSV
        $filename = 'event-report-' . $id . '-' . now()->format('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($event, $attendees, $tickets) {
            $file = fopen('php://output', 'w');
            
            // Event summary
            fputcsv($file, ['EVENT REPORT']);
            fputcsv($file, ['Event', $event->title]);
            fputcsv($file, ['Date', \Carbon\Carbon::parse($event->starts_at)->format('M j, Y g:i A')]);
            fputcsv($file, ['Venue', $event->venue_name . ', ' . $event->city]);
            fputcsv($file, ['']);
            
            // Ticket summary
            fputcsv($file, ['TICKET SUMMARY']);
            fputcsv($file, ['Ticket Type', 'Price', 'Total', 'Sold', 'Available']);
            foreach ($tickets as $ticket) {
                fputcsv($file, [
                    $ticket->ticket_type,
                    'UGX ' . number_format($ticket->price, 0),
                    $ticket->quantity_total,
                    $ticket->quantity_sold ?? 0,
                    $ticket->quantity_available ?? 0
                ]);
            }
            fputcsv($file, ['']);
            
            // Attendees list
            fputcsv($file, ['ATTENDEES']);
            fputcsv($file, ['Name', 'Email', 'Ticket Code', 'Registered At']);
            foreach ($attendees as $attendee) {
                fputcsv($file, [
                    $attendee->name,
                    $attendee->email,
                    $attendee->ticket_code ?? 'N/A',
                    \Carbon\Carbon::parse($attendee->created_at)->format('M j, Y g:i A')
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function notify(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string|max:500'
        ]);

        $event = DB::table('events')->where('id', $id)->first();

        if (!$event) {
            return redirect()->route('admin.events.index')
                ->with('error', 'Event not found.');
        }

        // Get all attendees
        $attendees = DB::table('event_registrations')
            ->where('event_id', $id)
            ->pluck('user_id');

        // Send notification to all attendees
        foreach ($attendees as $userId) {
            DB::table('notifications')->insert([
                'user_id' => $userId,
                'notification_type' => 'event_update',
                'title' => 'Event Update: ' . $event->title,
                'message' => $request->message,
                'action_url' => route('frontend.events.show', $id),
                'is_read' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return redirect()->route('admin.events.show', $id)
            ->with('success', 'Notification sent to ' . count($attendees) . ' attendees.');
    }
}