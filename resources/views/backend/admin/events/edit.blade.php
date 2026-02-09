@extends('layouts.admin')

@section('title', 'Edit Event')

@section('page-header')
    <div class="flex items-center justify-between py-6">
        <div>
            <h1 class="text-2xl font-bold text-slate-800 dark:text-navy-50">Edit Event</h1>
            <p class="text-slate-500 dark:text-navy-300">{{ $event->title ?? 'Update event information' }}</p>
        </div>
        <div class="flex items-center space-x-2">
            <a href="{{ route('admin.events.show', $event->id ?? 1) }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Event
            </a>
            <a href="{{ route('admin.events.index') }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Events
            </a>
        </div>
    </div>
@endsection

@section('content')
    <div class="card">
        <div class="p-4 sm:p-5">
            <div class="mb-6">
                <h2 class="text-xl font-semibold text-slate-800 dark:text-navy-50">Edit Event Details</h2>
                <p class="text-sm text-slate-500 dark:text-navy-300">Update the information below to modify the event</p>
            </div>

            <form action="{{ route('admin.events.update', $event->id ?? 1) }}" method="POST" enctype="multipart/form-data">
                @csrf
                @method('PUT')

                <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <!-- Event Information -->
                    <div class="space-y-6">
                        <h3 class="section-header">Event Information</h3>

                        <!-- Event Title -->
                        <div>
                            <label for="title" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Event Title <span class="text-error">*</span>
                            </label>
                            <input type="text" id="title" name="title"
                                   class="form-input w-full @error('title') border-error @enderror"
                                   value="{{ old('title', $event->title ?? '') }}" placeholder="Enter event title..." required>
                            @error('title')
                                <p class="text-error text-xs mt-1">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Event Description -->
                        <div>
                            <label for="description" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Description
                            </label>
                            <textarea id="description" name="description" rows="4"
                                      class="form-input w-full @error('description') border-error @enderror" placeholder="Describe your event...">{{ old('description', $event->description ?? '') }}</textarea>
                            @error('description')
                                <p class="text-error text-xs mt-1">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Event Cover Image -->
                        <div>
                            <label for="cover_image" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Event Cover Image
                            </label>
                            
                            <!-- Current Image Preview -->
                            @if($event->cover_image ?? false)
                                <div class="mb-4 image-preview-container">
                                    <p class="text-xs text-slate-500 dark:text-navy-400 mb-2">Current Image:</p>
                                    <div class="relative group">
                                        <img src="{{ asset('storage/' . $event->cover_image) }}" alt="{{ $event->title }}" 
                                             class="w-full max-w-md h-56 object-cover rounded-xl shadow-lg border-2 border-slate-200 dark:border-navy-600 transition-all duration-300 group-hover:shadow-2xl">
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div class="absolute bottom-3 left-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <p class="text-sm font-semibold drop-shadow-lg">Current Event Cover</p>
                                            <p class="text-xs opacity-90">Upload a new image to replace</p>
                                        </div>
                                    </div>
                                </div>
                            @endif
                            
                            <div class="relative">
                                <input type="file" id="cover_image" name="cover_image" accept="image/*"
                                       class="form-file w-full @error('cover_image') border-error @enderror">
                                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            
                            @error('cover_image')
                                <p class="text-error text-xs mt-1">{{ $message }}</p>
                            @enderror
                            <p class="text-xs text-slate-500 dark:text-navy-400 mt-2 flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span><strong>Recommended:</strong> 1920x1080px (16:9 ratio), JPG/PNG format, max 2MB. {{ ($event->cover_image ?? false) ? 'Leave blank to keep current image.' : '' }}</span>
                            </p>
                        </div>
                    </div>

                    <!-- Date, Time & Location -->
                    <div class="space-y-6">
                        <h3 class="section-header">Date, Time & Location</h3>

                        <!-- Event Date -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="starts_at" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                    Event Date <span class="text-error">*</span>
                                </label>
                                <input type="datetime-local" id="starts_at" name="starts_at"
                                       class="form-input w-full @error('starts_at') border-error @enderror"
                                       value="{{ old('starts_at', isset($event->starts_at) ? \Carbon\Carbon::parse($event->starts_at)->format('Y-m-d\TH:i') : now()->format('Y-m-d\TH:i')) }}" required>
                                @error('starts_at')
                                    <p class="text-error text-xs mt-1">{{ $message }}</p>
                                @enderror
                            </div>

                            <div>
                                <label for="ends_at" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                    End Date & Time
                                </label>
                                <input type="datetime-local" id="ends_at" name="ends_at"
                                       class="form-input w-full @error('ends_at') border-error @enderror"
                                       value="{{ old('ends_at', isset($event->ends_at) ? \Carbon\Carbon::parse($event->ends_at)->format('Y-m-d\TH:i') : '') }}">
                                @error('ends_at')
                                    <p class="text-error text-xs mt-1">{{ $message }}</p>
                                @enderror
                            </div>
                        </div>

                        <!-- Venue Name -->
                        <div>
                            <label for="venue_name" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Venue Name <span class="text-error">*</span>
                            </label>
                            <input type="text" id="venue_name" name="venue_name"
                                   class="form-input w-full @error('venue_name') border-error @enderror"
                                   value="{{ old('venue_name', $event->venue_name ?? '') }}" placeholder="e.g. Kampala Serena Hotel" required>
                            @error('venue_name')
                                <p class="text-error text-xs mt-1">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Location / Address -->
                        <div>
                            <label for="venue_address" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Location / Address
                            </label>
                            <textarea id="venue_address" name="venue_address" rows="3"
                                      class="form-input w-full @error('venue_address') border-error @enderror" placeholder="Full address of the venue...">{{ old('venue_address', $event->venue_address ?? '') }}</textarea>
                            @error('venue_address')
                                <p class="text-error text-xs mt-1">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- City -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="city" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                    City <span class="text-error">*</span>
                                </label>
                                <input type="text" id="city" name="city"
                                       class="form-input w-full @error('city') border-error @enderror"
                                       value="{{ old('city', $event->city ?? 'Kampala') }}" placeholder="e.g. Kampala" required>
                                @error('city')
                                    <p class="text-error text-xs mt-1">{{ $message }}</p>
                                @enderror
                            </div>

                            <div>
                                <label for="country" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                    Country
                                </label>
                                <input type="text" id="country" name="country"
                                       class="form-input w-full @error('country') border-error @enderror"
                                       value="{{ old('country', $event->country ?? 'Uganda') }}" placeholder="Uganda">
                                @error('country')
                                    <p class="text-error text-xs mt-1">{{ $message }}</p>
                                @enderror
                            </div>
                        </div>

                        <!-- Event Type -->
                        <div>
                            <label for="event_type" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Event Type <span class="text-error">*</span>
                            </label>
                            <select id="event_type" name="event_type" class="form-select w-full @error('event_type') border-error @enderror" required>
                                <option value="concert" {{ old('event_type', $event->event_type ?? 'concert') == 'concert' ? 'selected' : '' }}>Concert</option>
                                <option value="festival" {{ old('event_type', $event->event_type ?? '') == 'festival' ? 'selected' : '' }}>Festival</option>
                                <option value="meetup" {{ old('event_type', $event->event_type ?? '') == 'meetup' ? 'selected' : '' }}>Meet & Greet</option>
                                <option value="workshop" {{ old('event_type', $event->event_type ?? '') == 'workshop' ? 'selected' : '' }}>Workshop</option>
                                <option value="other" {{ old('event_type', $event->event_type ?? '') == 'other' ? 'selected' : '' }}>Other</option>
                            </select>
                            @error('event_type')
                                <p class="text-error text-xs mt-1">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>
                </div>

                <!-- Pricing & Capacity -->
                <div class="mt-8">
                    <h3 class="section-header">Capacity & Status</h3>
                    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <!-- Capacity -->
                        <div>
                            <label for="total_tickets" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Event Capacity
                            </label>
                            <input type="number" id="total_tickets" name="total_tickets" min="1"
                                   class="form-input w-full @error('total_tickets') border-error @enderror"
                                   value="{{ old('total_tickets', $event->total_tickets ?? '') }}" placeholder="e.g. 500">
                            @error('total_tickets')
                                <p class="text-error text-xs mt-1">{{ $message }}</p>
                            @enderror
                            <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">Maximum number of attendees</p>
                        </div>

                        <!-- Status -->
                        <div>
                            <label for="status" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Event Status <span class="text-error">*</span>
                            </label>
                            <select id="status" name="status" class="form-select w-full @error('status') border-error @enderror" required>
                                <option value="draft" {{ old('status', $event->status ?? 'draft') == 'draft' ? 'selected' : '' }}>Draft</option>
                                <option value="published" {{ old('status', $event->status ?? '') == 'published' ? 'selected' : '' }}>Published</option>
                                <option value="completed" {{ old('status', $event->status ?? '') == 'completed' ? 'selected' : '' }}>Completed</option>
                                <option value="cancelled" {{ old('status', $event->status ?? '') == 'cancelled' ? 'selected' : '' }}>Cancelled</option>
                            </select>
                            @error('status')
                                <p class="text-error text-xs mt-1">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>
                </div>

                <!-- Ticket Tiers Management -->
                <div class="mt-8" x-data="ticketTiers()">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h3 class="section-header mb-0">Ticket Tiers</h3>
                            <p class="text-sm text-slate-500 dark:text-navy-300 mt-1">Define different ticket types and pricing for your event</p>
                        </div>
                        <button type="button" @click="addTier()" class="btn bg-primary text-white hover:bg-primary-focus">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Ticket Tier
                        </button>
                    </div>

                    <!-- Free Event Toggle -->
                    <div class="mb-6 bg-slate-50 dark:bg-navy-800 p-4 rounded-lg border-2 border-slate-200 dark:border-navy-600">
                        <label class="flex items-center cursor-pointer group">
                            <input type="checkbox" x-model="isFreeEvent" @change="handleFreeEventToggle()" 
                                   class="form-checkbox h-5 w-5 text-primary border-2 border-slate-300 dark:border-navy-500 rounded focus:ring-2 focus:ring-primary/20">
                            <div class="ml-3">
                                <span class="block text-sm font-semibold text-slate-700 dark:text-navy-100 group-hover:text-primary dark:group-hover:text-accent">
                                    Free Event (No Ticket Tiers Required)
                                </span>
                                <span class="block text-xs text-slate-500 dark:text-navy-300">
                                    Check this if your event has no admission fee
                                </span>
                            </div>
                        </label>
                    </div>

                    <!-- Ticket Tiers List -->
                    <div x-show="!isFreeEvent" x-transition class="space-y-4">
                        <template x-for="(tier, index) in tiers" :key="index">
                            <div class="bg-white dark:bg-navy-800 border-2 border-slate-200 dark:border-navy-600 rounded-lg p-5 hover:border-primary dark:hover:border-accent transition-colors shadow-sm">
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex items-center">
                                        <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3"
                                             :class="{
                                                 'bg-gradient-to-r from-amber-500 to-amber-600': tier.type === 'vip',
                                                 'bg-gradient-to-r from-purple-500 to-purple-600': tier.type === 'vvip',
                                                 'bg-gradient-to-r from-blue-500 to-blue-600': tier.type === 'table',
                                                 'bg-gradient-to-r from-slate-500 to-slate-600': tier.type === 'ordinary'
                                             }"
                                             x-text="index + 1"></div>
                                        <div>
                                            <h4 class="font-semibold text-slate-800 dark:text-navy-50" x-text="tier.name || 'New Ticket Tier'"></h4>
                                            <p class="text-xs text-slate-500 dark:text-navy-300" x-text="'Tier #' + (index + 1)"></p>
                                        </div>
                                    </div>
                                    <button type="button" @click="removeTier(index)" class="text-error hover:bg-error/10 p-2 rounded-lg transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <!-- Ticket Type -->
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                            Ticket Type <span class="text-error">*</span>
                                        </label>
                                        <select x-model="tier.type" :name="'tickets['+index+'][type]'" class="form-select w-full" required>
                                            <option value="ordinary">Ordinary / General Admission</option>
                                            <option value="vip">VIP</option>
                                            <option value="vvip">VVIP / Premium</option>
                                            <option value="table">Table / Group Booking</option>
                                            <option value="early_bird">Early Bird</option>
                                            <option value="student">Student Discount</option>
                                        </select>
                                    </div>

                                    <!-- Ticket Name -->
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                            Display Name <span class="text-error">*</span>
                                        </label>
                                        <input type="text" x-model="tier.name" :name="'tickets['+index+'][name]'" 
                                               class="form-input w-full" placeholder="e.g. VIP Access" required>
                                    </div>

                                    <!-- Price -->
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                            Price (UGX) <span class="text-error">*</span>
                                        </label>
                                        <input type="number" x-model="tier.price" :name="'tickets['+index+'][price]'" 
                                               class="form-input w-full" placeholder="e.g. 50000" min="0" step="1000" required>
                                    </div>

                                    <!-- Quantity -->
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                            Available Tickets <span class="text-error">*</span>
                                        </label>
                                        <input type="number" x-model="tier.quantity" :name="'tickets['+index+'][quantity]'" 
                                               class="form-input w-full" placeholder="e.g. 100" min="1" required>
                                    </div>

                                    <!-- Description (Full Width) -->
                                    <div class="md:col-span-2">
                                        <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                            Description / Perks
                                        </label>
                                        <textarea x-model="tier.description" :name="'tickets['+index+'][description]'" rows="2"
                                                  class="form-input w-full" placeholder="Describe what's included with this ticket..."></textarea>
                                    </div>

                                    <!-- Max Per Order -->
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                            Max Per Order
                                        </label>
                                        <input type="number" x-model="tier.max_per_order" :name="'tickets['+index+'][max_per_order]'" 
                                               class="form-input w-full" placeholder="e.g. 10" min="1" value="10">
                                    </div>

                                    <!-- Active Status -->
                                    <div class="flex items-center pt-7">
                                        <label class="flex items-center cursor-pointer">
                                            <input type="checkbox" x-model="tier.is_active" :name="'tickets['+index+'][is_active]'" 
                                                   class="form-checkbox h-5 w-5" value="1">
                                            <span class="ml-2 text-sm font-medium text-slate-700 dark:text-navy-100">
                                                Active (On Sale)
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <!-- Preview Badge -->
                                <div class="mt-4 pt-4 border-t border-slate-200 dark:border-navy-600">
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm text-slate-500 dark:text-navy-300">Preview:</span>
                                        <div class="flex items-center space-x-2">
                                            <span class="px-3 py-1 rounded-full text-xs font-semibold"
                                                  :class="{
                                                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': tier.type === 'vip',
                                                      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400': tier.type === 'vvip',
                                                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': tier.type === 'table',
                                                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300': tier.type === 'ordinary',
                                                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': tier.type === 'early_bird',
                                                      'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400': tier.type === 'student'
                                                  }"
                                                  x-text="tier.name"></span>
                                            <span class="text-lg font-bold text-primary dark:text-accent" x-text="'UGX ' + Number(tier.price || 0).toLocaleString()"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <!-- Empty State -->
                        <div x-show="tiers.length === 0" class="text-center py-12 bg-slate-50 dark:bg-navy-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-navy-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto text-slate-400 dark:text-navy-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            <h3 class="text-lg font-semibold text-slate-700 dark:text-navy-100 mb-2">No Ticket Tiers Yet</h3>
                            <p class="text-sm text-slate-500 dark:text-navy-300 mb-4">Add ticket tiers to start selling tickets for your event</p>
                            <button type="button" @click="addTier()" class="btn bg-primary text-white hover:bg-primary-focus">
                                Add First Ticket Tier
                            </button>
                        </div>
                    </div>

                    <!-- Free Event Message -->
                    <div x-show="isFreeEvent" x-transition class="text-center py-12 bg-info/10 border-2 border-info rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto text-info mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                        <h3 class="text-lg font-semibold text-slate-700 dark:text-navy-100 mb-2">Free Event - No Tickets Required</h3>
                        <p class="text-sm text-slate-600 dark:text-navy-300">This event is free to attend. Attendees can register without purchasing tickets.</p>
                    </div>
                </div>

                <!-- Submit Buttons -->
                <div class="mt-8 flex items-center justify-end space-x-3">
                    <a href="{{ route('admin.events.show', $event->id ?? 1) }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-600">
                        Cancel
                    </a>
                    <button type="submit" class="btn bg-primary text-white hover:bg-primary/90">
                        Update Event
                    </button>
                </div>
            </form>
        </div>
    </div>
@endsection

@push('head')
<style>
    /* Enhanced form input styling for better visibility */
    .form-input, .form-select, .form-textarea {
        @apply bg-white dark:bg-navy-900 border-2 border-slate-300 dark:border-navy-500 rounded-lg px-4 py-3 text-slate-700 dark:text-navy-100 placeholder-slate-400 dark:placeholder-navy-300 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-all duration-200;
        font-size: 14px;
        line-height: 1.5;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
        @apply shadow-lg;
        transform: translateY(-1px);
    }

    /* Section headers */
    .section-header {
        @apply text-lg font-semibold text-slate-800 dark:text-navy-50 pb-3 border-b border-slate-200 dark:border-navy-500 mb-6;
    }

    /* File input styling */
    .form-file, input[type="file"] {
        @apply bg-slate-50 dark:bg-navy-800 border-2 border-dashed border-slate-300 dark:border-navy-500 rounded-lg px-4 py-4 text-slate-600 dark:text-navy-200 hover:border-primary dark:hover:border-accent transition-colors duration-200 cursor-pointer;
        font-size: 14px;
    }
    
    input[type="file"]::file-selector-button {
        @apply mr-4 py-2 px-4 rounded-lg border-0 text-sm font-semibold bg-primary text-white cursor-pointer hover:bg-primary-focus transition-colors;
    }

    /* Checkbox styling */
    .form-checkbox {
        @apply w-5 h-5 text-primary border-2 border-slate-300 dark:border-navy-500 rounded focus:ring-primary dark:focus:ring-accent focus:ring-offset-0 cursor-pointer;
    }
    
    .form-checkbox:checked {
        @apply bg-primary border-primary;
    }

    /* Enhanced error styling */
    .border-error {
        @apply border-red-500 dark:border-red-400 ring-2 ring-red-500/20 dark:ring-red-400/20;
    }

    /* Improved button styling */
    .btn {
        @apply font-semibold transition-all duration-200 transform hover:scale-105 focus:scale-105 shadow-sm hover:shadow-md;
    }
    
    /* Enhanced image preview */
    .card img {
        @apply transition-transform duration-300 hover:scale-105;
    }
    
    /* Ticket Tier Card Animations */
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .animate-fadeIn {
        animation: fadeIn 0.3s ease-in-out;
    }
    
    /* Gradient backgrounds for ticket type badges */
    .ticket-tier-card {
        @apply transition-all duration-300 hover:shadow-xl;
        animation: slideInUp 0.4s ease-out;
    }
    
    /* Custom scrollbar for ticket tiers section */
    .ticket-tiers-container {
        scrollbar-width: thin;
        scrollbar-color: rgba(99, 102, 241, 0.3) transparent;
    }
    
    .ticket-tiers-container::-webkit-scrollbar {
        width: 8px;
    }
    
    .ticket-tiers-container::-webkit-scrollbar-track {
        background: transparent;
    }
    
    .ticket-tiers-container::-webkit-scrollbar-thumb {
        background-color: rgba(99, 102, 241, 0.3);
        border-radius: 20px;
    }
    
    .ticket-tiers-container::-webkit-scrollbar-thumb:hover {
        background-color: rgba(99, 102, 241, 0.5);
    }
    
    /* Improved image preview with overlay effect */
    .image-preview-container {
        position: relative;
        overflow: hidden;
    }
    
    .image-preview-container::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .image-preview-container:hover::after {
        opacity: 1;
    }
</style>
@endpush

@push('scripts')
<script>
// Alpine.js Ticket Tiers Management
function ticketTiers() {
    return {
        isFreeEvent: {{ old('is_free', $event->is_free ?? 0) ? 'true' : 'false' }},
        tiers: [
            @if(isset($event->tickets) && count($event->tickets) > 0)
                @foreach($event->tickets as $ticket)
                {
                    id: {{ $ticket->id ?? 0 }},
                    type: '{{ strtolower(str_replace(' ', '_', $ticket->ticket_type ?? 'ordinary')) }}',
                    name: '{{ $ticket->ticket_type ?? '' }}',
                    price: {{ $ticket->price ?? 0 }},
                    quantity: {{ $ticket->quantity_available ?? $ticket->quantity_total ?? 0 }},
                    description: '{{ addslashes($ticket->description ?? '') }}',
                    max_per_order: {{ $ticket->max_per_order ?? 10 }},
                    is_active: {{ $ticket->is_active ?? false ? 'true' : 'false' }}
                },
                @endforeach
            @endif
        ],
        
        init() {
            // If event has tickets, not free
            if (this.tiers.length > 0) {
                this.isFreeEvent = false;
            }
            
            // If no tiers and not free, add default tiers
            if (this.tiers.length === 0 && !this.isFreeEvent) {
                this.addDefaultTiers();
            }
        },
        
        addTier() {
            this.tiers.push({
                type: 'ordinary',
                name: 'General Admission',
                price: 10000,
                quantity: 100,
                description: '',
                max_per_order: 10,
                is_active: true
            });
        },
        
        removeTier(index) {
            if (confirm('Are you sure you want to remove this ticket tier?')) {
                this.tiers.splice(index, 1);
            }
        },
        
        addDefaultTiers() {
            this.tiers = [
                {
                    type: 'ordinary',
                    name: 'Ordinary',
                    price: 10000,
                    quantity: 200,
                    description: 'General admission access to the event',
                    max_per_order: 10,
                    is_active: true
                },
                {
                    type: 'vip',
                    name: 'VIP',
                    price: 25000,
                    quantity: 50,
                    description: 'VIP access with reserved seating and complimentary drink',
                    max_per_order: 5,
                    is_active: true
                },
                {
                    type: 'vvip',
                    name: 'VVIP',
                    price: 50000,
                    quantity: 20,
                    description: 'Premium VVIP experience with backstage access and meet & greet',
                    max_per_order: 4,
                    is_active: true
                }
            ];
        },
        
        handleFreeEventToggle() {
            if (this.isFreeEvent) {
                if (this.tiers.length > 0) {
                    if (!confirm('Marking this as a free event will remove all ticket tiers. Continue?')) {
                        this.isFreeEvent = false;
                        return;
                    }
                }
                this.tiers = [];
            } else {
                if (this.tiers.length === 0) {
                    this.addDefaultTiers();
                }
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Image preview functionality
    const coverImageInput = document.getElementById('cover_image');
    if (coverImageInput) {
        coverImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Create or update preview
                    let preview = document.getElementById('imagePreview');
                    if (!preview) {
                        preview = document.createElement('div');
                        preview.id = 'imagePreview';
                        preview.className = 'mt-4';
                        coverImageInput.parentElement.appendChild(preview);
                    }
                    preview.innerHTML = `
                        <p class="text-xs text-slate-500 dark:text-navy-400 mb-2">New Image Preview:</p>
                        <img src="${e.target.result}" class="w-full max-w-md h-48 object-cover rounded-lg shadow-md border-2 border-primary/50 animate-fadeIn">
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Form submission validation
    document.querySelector('form').addEventListener('submit', function(e) {
        const tiersData = window.Alpine && window.Alpine.$data(document.querySelector('[x-data*="ticketTiers"]'));
        if (tiersData && !tiersData.isFreeEvent && tiersData.tiers.length === 0) {
            e.preventDefault();
            alert('Please add at least one ticket tier or mark the event as free.');
            return false;
        }
    });
});
</script>
@endpush