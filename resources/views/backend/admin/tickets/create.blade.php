@extends('layouts.admin')

@section('title', 'Create Ticket Type - ' . $event->title)

@section('page-header')
    <div class="flex items-center justify-between py-6">
        <div>
            <h1 class="text-2xl font-bold text-slate-800 dark:text-navy-50">Create Ticket Type</h1>
            <p class="text-slate-500 dark:text-navy-300">Add a new ticket type for {{ $event->title }}</p>
        </div>
        <div class="flex items-center space-x-2">
            <a href="{{ route('admin.events.tickets.index', $event) }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Tickets
            </a>
        </div>
    </div>
@endsection

@section('content')
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Create Ticket Form -->
        <div class="lg:col-span-2">
            <div class="card">
                <div class="p-4 sm:p-5">
                    <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100 mb-4">Ticket Information</h3>

                    <form action="{{ route('admin.events.tickets.store', $event) }}" method="POST" class="space-y-6">
                        @csrf

                        <!-- Basic Information -->
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                    Ticket Type Name <span class="text-error">*</span>
                                </label>
                                <input type="text" name="ticket_type" value="{{ old('ticket_type') }}"
                                       class="form-input w-full @error('ticket_type') border-error @enderror"
                                       placeholder="e.g., General Admission, VIP, Early Bird"
                                       required>
                                @error('ticket_type')
                                    <p class="text-xs text-error mt-1">{{ $message }}</p>
                                @enderror
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                    Price (UGX) <span class="text-error">*</span>
                                </label>
                                <input type="number" name="price" value="{{ old('price') }}" min="0" step="1000"
                                       class="form-input w-full @error('price') border-error @enderror"
                                       placeholder="0"
                                       required>
                                @error('price')
                                    <p class="text-xs text-error mt-1">{{ $message }}</p>
                                @enderror
                                <p class="text-xs text-slate-400 dark:text-navy-300 mt-1">Enter 0 for free tickets</p>
                            </div>
                        </div>

                        <!-- Description -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Description
                            </label>
                            <textarea name="description" rows="3"
                                      class="form-textarea w-full @error('description') border-error @enderror"
                                      placeholder="Brief description of what this ticket includes...">{{ old('description') }}</textarea>
                            @error('description')
                                <p class="text-xs text-error mt-1">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Quantity and Sales Settings -->
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                    Quantity Available
                                </label>
                                <input type="number" name="quantity_available" value="{{ old('quantity_available') }}" min="1"
                                       class="form-input w-full @error('quantity_available') border-error @enderror"
                                       placeholder="Leave empty for unlimited">
                                @error('quantity_available')
                                    <p class="text-xs text-error mt-1">{{ $message }}</p>
                                @enderror
                                <p class="text-xs text-slate-400 dark:text-navy-300 mt-1">Leave empty for unlimited tickets</p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                    Max Per Order <span class="text-error">*</span>
                                </label>
                                <input type="number" name="max_per_order" value="{{ old('max_per_order', 10) }}" min="1" max="100"
                                       class="form-input w-full @error('max_per_order') border-error @enderror"
                                       required>
                                @error('max_per_order')
                                    <p class="text-xs text-error mt-1">{{ $message }}</p>
                                @enderror
                            </div>
                        </div>

                        <!-- Sales Period -->
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                    Sales Start Date
                                </label>
                                <input type="datetime-local" name="sales_start_at" value="{{ old('sales_start_at') }}"
                                       class="form-input w-full @error('sales_start_at') border-error @enderror">
                                @error('sales_start_at')
                                    <p class="text-xs text-error mt-1">{{ $message }}</p>
                                @enderror
                                <p class="text-xs text-slate-400 dark:text-navy-300 mt-1">Leave empty to start immediately</p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                    Sales End Date
                                </label>
                                <input type="datetime-local" name="sales_end_at" value="{{ old('sales_end_at') }}"
                                       class="form-input w-full @error('sales_end_at') border-error @enderror">
                                @error('sales_end_at')
                                    <p class="text-xs text-error mt-1">{{ $message }}</p>
                                @enderror
                                <p class="text-xs text-slate-400 dark:text-navy-300 mt-1">Leave empty to sell until event</p>
                            </div>
                        </div>

                        <!-- Perks -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Ticket Perks
                            </label>
                            <div id="perks-container" class="space-y-2">
                                @if(old('perks'))
                                    @foreach(old('perks') as $index => $perk)
                                        @if($perk)
                                            <div class="flex items-center space-x-2 perk-item">
                                                <input type="text" name="perks[]" value="{{ $perk }}"
                                                       class="form-input flex-1" placeholder="e.g., Free drink, Priority seating">
                                                <button type="button" class="btn size-8 rounded-full p-0 hover:bg-error/20 text-error remove-perk">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        @endif
                                    @endforeach
                                @else
                                    <div class="flex items-center space-x-2 perk-item">
                                        <input type="text" name="perks[]" value=""
                                               class="form-input flex-1" placeholder="e.g., Free drink, Priority seating">
                                        <button type="button" class="btn size-8 rounded-full p-0 hover:bg-error/20 text-error remove-perk">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                @endif
                            </div>
                            <button type="button" id="add-perk" class="btn border border-dashed border-slate-300 text-slate-600 hover:border-primary hover:text-primary mt-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Perk
                            </button>
                        </div>

                        <!-- Settings -->
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                    Sort Order
                                </label>
                                <input type="number" name="sort_order" value="{{ old('sort_order', 0) }}" min="0"
                                       class="form-input w-full @error('sort_order') border-error @enderror">
                                @error('sort_order')
                                    <p class="text-xs text-error mt-1">{{ $message }}</p>
                                @enderror
                                <p class="text-xs text-slate-400 dark:text-navy-300 mt-1">Lower numbers appear first</p>
                            </div>

                            <div class="flex items-center">
                                <label class="inline-flex items-center mt-6">
                                    <input type="checkbox" name="is_active" value="1"
                                           class="form-checkbox size-5 text-primary border border-slate-400/70 dark:border-navy-400 dark:bg-navy-700 dark:checked:border-accent"
                                           {{ old('is_active', true) ? 'checked' : '' }}>
                                    <span class="ml-2 text-sm text-slate-700 dark:text-navy-100">Active (available for sale)</span>
                                </label>
                            </div>
                        </div>

                        <!-- Submit Buttons -->
                        <div class="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-navy-500">
                            <a href="{{ route('admin.events.tickets.index', $event) }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-600">
                                Cancel
                            </a>
                            <button type="submit" class="btn bg-primary text-white hover:bg-primary/90">
                                Create Ticket Type
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Event Summary -->
        <div class="lg:col-span-1">
            <div class="card">
                <div class="p-4 sm:p-5">
                    <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100 mb-4">Event Summary</h3>

                    <div class="space-y-4">
                        <div class="flex items-center space-x-3">
                            <div class="avatar size-12">
                                <img class="rounded-lg" src="{{ $event->banner_image ? asset('storage/' . $event->banner_image) : asset('images/placeholder-event.jpg') }}" alt="{{ $event->title }}" />
                            </div>
                            <div>
                                <h4 class="font-medium text-slate-700 dark:text-navy-100">{{ $event->title }}</h4>
                                <p class="text-xs text-slate-400 dark:text-navy-300">{{ $event->category }}</p>
                            </div>
                        </div>

                        <div class="space-y-2 text-sm">
                            <div class="flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span class="text-slate-600 dark:text-navy-300">{{ $event->formatted_date }}</span>
                            </div>

                            <div class="flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span class="text-slate-600 dark:text-navy-300">{{ $event->formatted_time }}</span>
                            </div>

                            <div class="flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span class="text-slate-600 dark:text-navy-300">{{ $event->venue_name }}</span>
                            </div>

                            @if($event->capacity)
                                <div class="flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span class="text-slate-600 dark:text-navy-300">Capacity: {{ number_format($event->capacity) }}</span>
                                </div>
                            @endif
                        </div>

                        @if($event->tickets->count() > 0)
                            <div class="pt-4 border-t border-slate-200 dark:border-navy-500">
                                <h5 class="font-medium text-slate-700 dark:text-navy-100 mb-2">Existing Tickets</h5>
                                <div class="space-y-2">
                                    @foreach($event->tickets->take(3) as $ticket)
                                        <div class="flex items-center justify-between text-xs">
                                            <span class="text-slate-600 dark:text-navy-300">{{ $ticket->ticket_type }}</span>
                                            <span class="font-medium">
                                                @if($ticket->price == 0)
                                                    Free
                                                @else
                                                    UGX {{ number_format($ticket->price) }}
                                                @endif
                                            </span>
                                        </div>
                                    @endforeach
                                    @if($event->tickets->count() > 3)
                                        <p class="text-xs text-slate-400 dark:text-navy-300">
                                            +{{ $event->tickets->count() - 3 }} more ticket types
                                        </p>
                                    @endif
                                </div>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Add perk functionality
    const addPerkBtn = document.getElementById('add-perk');
    const perksContainer = document.getElementById('perks-container');

    addPerkBtn.addEventListener('click', function() {
        const perkItem = document.createElement('div');
        perkItem.className = 'flex items-center space-x-2 perk-item';
        perkItem.innerHTML = `
            <input type="text" name="perks[]" value=""
                   class="form-input flex-1" placeholder="e.g., Free drink, Priority seating">
            <button type="button" class="btn size-8 rounded-full p-0 hover:bg-error/20 text-error remove-perk">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        `;
        perksContainer.appendChild(perkItem);
    });

    // Remove perk functionality
    perksContainer.addEventListener('click', function(e) {
        if (e.target.closest('.remove-perk')) {
            const perkItem = e.target.closest('.perk-item');
            if (perksContainer.children.length > 1) {
                perkItem.remove();
            }
        }
    });
});
</script>
@endsection