<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Frontend\PaymentController;
use App\Models\Event;
use App\Models\EventTicket;
use App\Models\EventAttendee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::query()
            ->published()
            ->with(['tickets' => function($q) {
                $q->active()->orderBy('sort_order')->orderBy('price_ugx');
            }, 'location'])
            ->withCount(['attendees', 'tickets']);

        // Apply tab filters
        $tab = $request->get('tab');
        switch ($tab) {
            case 'upcoming':
                $query->where('starts_at', '>=', now());
                break;
            case 'thisweek':
                $query->where('starts_at', '>=', now())
                      ->where('starts_at', '<=', now()->addWeek());
                break;
            case 'free':
                $query->whereHas('tickets', function($q) {
                    $q->where('price', 0);
                });
                break;
            case 'past':
                $query->where('starts_at', '<', now());
                break;
            // default 'all' - no additional filter
        }

        // Apply filters
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('city')) {
            $query->whereHas('location', function($q) use ($request) {
                $q->where('city', 'LIKE', "%{$request->city}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->where('starts_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('starts_at', '<=', $request->date_to);
        }

        if ($request->filled('price_max')) {
            $query->whereHas('tickets', function($q) use ($request) {
                $q->where('price', '<=', $request->price_max);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%")
                  ->orWhereHas('location', function($loc) use ($search) {
                      $loc->where('name', 'LIKE', "%{$search}%")
                          ->orWhere('city', 'LIKE', "%{$search}%");
                  });
            });
        }

        // Sort options
        switch ($request->get('sort', 'date_asc')) {
            case 'date_desc':
                $query->orderBy('starts_at', 'desc');
                break;
            case 'price_asc':
                $query->leftJoin('event_tickets', 'events.id', '=', 'event_tickets.event_id')
                      ->where('event_tickets.is_active', true)
                      ->orderBy('event_tickets.price', 'asc')
                      ->select('events.*');
                break;
            case 'price_desc':
                $query->leftJoin('event_tickets', 'events.id', '=', 'event_tickets.event_id')
                      ->where('event_tickets.is_active', true)
                      ->orderBy('event_tickets.price', 'desc')
                      ->select('events.*');
                break;
            case 'popularity':
                $query->orderBy('attendees_count', 'desc');
                break;
            default: // date_asc
                $query->orderBy('starts_at', 'asc');
                break;
        }

        $events = $query->paginate(12);

        // Get filter options
        $categories = Event::published()
            ->distinct()
            ->whereNotNull('category')
            ->pluck('category')
            ->sort();

        // Get cities through location relationship
        $cities = \App\Models\EventLocation::whereHas('events', function($q) {
                $q->where('status', 'published');
            })
            ->distinct()
            ->whereNotNull('city')
            ->pluck('city')
            ->sort();

        return view('frontend.events.index', compact('events', 'categories', 'cities'));
    }

    public function show(Event $event)
    {
        if (!$event->is_active) {
            abort(404);
        }

        $event->load([
            'organizer',
            'tickets' => function($q) {
                $q->active()->orderBy('sort_order')->orderBy('price');
            }
        ]);

        // Check if user is already registered
        $userAttendee = null;
        if (Auth::check()) {
            $userAttendee = $event->attendees()
                ->where('user_id', Auth::id())
                ->first();
        }

        // Get related events
        $relatedEvents = Event::published()
            ->where('id', '!=', $event->id)
            ->where(function($q) use ($event) {
                $q->where('category', $event->category)
                  ->orWhere('city', $event->city);
            })
            ->withCount('attendees')
            ->limit(4)
            ->get();

        return view('frontend.events.show', compact('event', 'userAttendee', 'relatedEvents'));
    }

    public function register(Request $request, Event $event)
    {
        if (!Auth::check()) {
            return redirect()->route('frontend.login')
                ->with('message', 'Please log in to register for events.');
        }

        // Check mobile verification requirement for events
        if (\App\Models\Setting::isMobileVerificationRequiredForEvents() && !Auth::user()->isPhoneVerified()) {
            return redirect()->back()
                ->with('error', 'Mobile phone verification is required to purchase event tickets. Please verify your phone number in your profile.');
        }

        if (!$event->canUserRegister(Auth::user())) {
            return redirect()->back()
                ->with('error', 'You cannot register for this event.');
        }

        $request->validate([
            'ticket_id' => 'required|exists:event_tickets,id',
            'quantity' => 'required|integer|min:1|max:10'
        ]);

        $ticket = EventTicket::findOrFail($request->ticket_id);

        // Verify ticket belongs to this event
        if ($ticket->event_id !== $event->id) {
            return redirect()->back()
                ->with('error', 'Invalid ticket selection.');
        }

        // Check ticket availability
        if (!$ticket->canPurchase($request->quantity)) {
            return redirect()->back()
                ->with('error', 'Requested tickets are not available.');
        }

        try {
            DB::transaction(function () use ($request, $event, $ticket) {
                // Create attendee record
                $attendee = $event->attendees()->create([
                    'user_id' => Auth::id(),
                    'event_ticket_id' => $ticket->id,
                    'quantity' => $request->quantity,
                    'amount_paid' => $ticket->price * $request->quantity,
                    'attendance_type' => 'ticket_purchase',
                    'status' => $ticket->price == 0 ? 'confirmed' : 'pending',
                    'payment_status' => $ticket->price == 0 ? 'completed' : 'pending',
                    'attendee_metadata' => [
                        'registration_method' => 'web',
                        'user_agent' => request()->userAgent(),
                        'ip_address' => request()->ip()
                    ]
                ]);

                // Update ticket sales count
                $ticket->increment('quantity_sold', $request->quantity);

                // If free event, automatically confirm
                if ($ticket->price == 0) {
                    $attendee->confirm();
                }
            });

            if ($ticket->price == 0) {
                return redirect()->route('frontend.events.ticket', $event)
                    ->with('success', 'Successfully registered for free event!');
            } else {
                return redirect()->route('frontend.events.checkout', $event)
                    ->with('success', 'Registration initiated. Please complete payment.');
            }

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Registration failed. Please try again.');
        }
    }

    public function checkout(Event $event)
    {
        if (!Auth::check()) {
            return redirect()->route('frontend.login');
        }

        // Get user's pending registration for this event
        $attendee = $event->attendees()
            ->where('user_id', Auth::id())
            ->where('status', 'pending')
            ->where('payment_status', 'pending')
            ->with(['eventTicket'])
            ->first();

        if (!$attendee) {
            return redirect()->route('frontend.events.show', $event)
                ->with('error', 'No pending registration found.');
        }

        return view('frontend.events.checkout', compact('event', 'attendee'));
    }

    public function processPayment(Request $request, Event $event)
    {
        // Redirect to payment controller
        return app(PaymentController::class)->initiate($request, $event);
    }

    public function ticket(Event $event)
    {
        if (!Auth::check()) {
            return redirect()->route('frontend.login');
        }

        // Get user's confirmed ticket for this event
        $attendee = $event->attendees()
            ->where('user_id', Auth::id())
            ->whereIn('status', ['confirmed', 'checked_in'])
            ->with(['eventTicket', 'event'])
            ->first();

        if (!$attendee) {
            return redirect()->route('frontend.events.show', $event)
                ->with('error', 'No ticket found for this event.');
        }

        return view('frontend.events.ticket', compact('event', 'attendee'));
    }

    public function myTickets()
    {
        if (!Auth::check()) {
            return redirect()->route('frontend.login');
        }

        $attendees = EventAttendee::where('user_id', Auth::id())
            ->with(['event', 'eventTicket'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return view('frontend.events.my-tickets', compact('attendees'));
    }

    public function cancelRegistration(Event $event)
    {
        if (!Auth::check()) {
            return redirect()->route('frontend.login');
        }

        $attendee = $event->attendees()
            ->where('user_id', Auth::id())
            ->first();

        if (!$attendee || !$attendee->can_cancel) {
            return redirect()->back()
                ->with('error', 'Cannot cancel this registration.');
        }

        try {
            $attendee->cancel('Cancelled by user');

            return redirect()->back()
                ->with('success', 'Registration cancelled successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to cancel registration.');
        }
    }
}