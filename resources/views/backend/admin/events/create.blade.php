@extends('layouts.admin')

@section('title', 'Create Event')

@section('page-header')
    <div class="flex items-center justify-between py-6">
        <div>
            <h1 class="text-2xl font-bold text-slate-800 dark:text-navy-50">Create Event</h1>
            <p class="text-slate-500 dark:text-navy-300">Add a new music event or concert</p>
        </div>
        <div class="flex items-center space-x-2">
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
                <h2 class="text-xl font-semibold text-slate-800 dark:text-navy-50">Event Details</h2>
                <p class="text-sm text-slate-500 dark:text-navy-300">Fill in the information below to create a new event</p>
            </div>
            <form action="{{ route('admin.events.store') }}" method="POST" enctype="multipart/form-data">
                @csrf

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
                                   value="{{ old('title') }}" placeholder="Enter event title..." required>
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
                                      class="form-input w-full @error('description') border-error @enderror" placeholder="Describe your event...">{{ old('description') }}</textarea>
                            @error('description')
                                <p class="text-error text-xs mt-1">{{ $message }}</p>
                            @enderror
                        </div>


                        <!-- Event Cover Image -->
                        <div>
                            <label for="cover_image" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Event Cover Image
                            </label>
                            <div class="relative">
                                <input type="file" id="cover_image" name="cover_image" accept="image/*"
                                       class="form-input w-full @error('cover_image') border-error @enderror">
                                <div class="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-500 dark:text-navy-300">
                                    <div class="text-center">
                                        <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                        </svg>
                                        <span class="text-sm">Click to upload cover image</span>
                                    </div>
                                </div>
                            </div>
                            @error('cover_image')
                                <p class="text-error text-xs mt-1">{{ $message }}</p>
                            @enderror
                            <p class="text-xs text-slate-400 dark:text-navy-300 mt-1">
                                <strong>Recommended:</strong> 800x600px, JPG/PNG format, max 2MB
                            </p>
                        </div>
                    </div>

                    <!-- Date, Time & Location -->
                    <div class="space-y-6">
                        <h3 class="section-header">Date, Time & Location</h3>

                        <!-- Event Date -->
                        <div>
                            <label for="event_date" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Event Date <span class="text-error">*</span>
                            </label>
                            <input type="date" id="event_date" name="event_date"
                                   class="form-input w-full @error('event_date') border-error @enderror"
                                   value="{{ old('event_date') }}" required>
                            @error('event_date')
                                <p class="text-error text-xs mt-1">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Event Time -->
                        <div>
                            <label for="event_time" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Event Time <span class="text-error">*</span>
                            </label>
                            <input type="time" id="event_time" name="event_time"
                                   class="form-input w-full @error('event_time') border-error @enderror"
                                   value="{{ old('event_time') }}" required>
                            @error('event_time')
                                <p class="text-error text-xs mt-1">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Venue Name -->
                        <div>
                            <label for="venue_name" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Venue Name <span class="text-error">*</span>
                            </label>
                            <input type="text" id="venue_name" name="venue_name"
                                   class="form-input w-full @error('venue_name') border-error @enderror"
                                   value="{{ old('venue_name') }}" placeholder="e.g. Kampala Serena Hotel" required>
                            @error('venue_name')
                                <p class="text-error text-xs mt-1">{{ $message }}</p>
                            @enderror
                        </div>


                        <!-- Venue Address -->
                        <div>
                            <label for="venue_address" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Venue Address
                            </label>
                            <textarea id="venue_address" name="venue_address" rows="3"
                                      class="form-input w-full @error('venue_address') border-error @enderror" placeholder="Full address of the venue...">{{ old('venue_address') }}</textarea>
                            @error('venue_address')
                                <p class="text-error text-xs mt-1">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>
                </div>

                <!-- Pricing & Capacity -->
                <div class="mt-8">
                    <h3 class="section-header">Pricing & Capacity</h3>
                    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <!-- Base Price -->
                    <div>
                        <label for="base_price" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                            Base Price (UGX)
                        </label>
                        <input type="number" id="base_price" name="base_price" min="0" step="1000"
                               class="form-input w-full @error('base_price') border-error @enderror"
                               value="{{ old('base_price') }}" placeholder="e.g. 50000">
                        @error('base_price')
                            <p class="text-error text-xs mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Capacity -->
                    <div>
                        <label for="capacity" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                            Capacity
                        </label>
                        <input type="number" id="capacity" name="capacity" min="1"
                               class="form-input w-full @error('capacity') border-error @enderror"
                               value="{{ old('capacity') }}" placeholder="e.g. 500">
                        @error('capacity')
                            <p class="text-error text-xs mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Status -->
                    <div>
                        <label for="status" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                            Status <span class="text-error">*</span>
                        </label>
                        <select id="status" name="status" class="form-select w-full @error('status') border-error @enderror" required>
                            <option value="draft" {{ old('status', 'draft') == 'draft' ? 'selected' : '' }}>Draft</option>
                            <option value="published" {{ old('status') == 'published' ? 'selected' : '' }}>Published</option>
                            <option value="completed" {{ old('status') == 'completed' ? 'selected' : '' }}>Completed</option>
                            <option value="cancelled" {{ old('status') == 'cancelled' ? 'selected' : '' }}>Cancelled</option>
                        </select>
                        @error('status')
                            <p class="text-error text-xs mt-1">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <!-- Additional Options -->
                <div class="mt-8">
                    <h3 class="section-header">Additional Options</h3>

                    <div class="grid grid-cols-1 gap-4">
                        <!-- Is Free Event -->
                        <div class="flex items-center">
                            <input type="checkbox" id="is_free" name="is_free" value="1"
                                   class="form-checkbox" {{ old('is_free') ? 'checked' : '' }}>
                            <label for="is_free" class="ml-2 text-sm text-slate-700 dark:text-navy-100">
                                Free Event (No admission fee)
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Submit Buttons -->
                <div class="mt-8 flex items-center justify-end space-x-3">
                    <a href="{{ route('admin.events.index') }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-600">
                        Cancel
                    </a>
                    <button type="submit" class="btn bg-primary text-white hover:bg-primary/90">
                        Create Event
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

    /* Enhanced labels */
    .form-label {
        @apply block text-sm font-semibold text-slate-700 dark:text-navy-100 mb-3;
    }

    /* Section headers */
    .section-header {
        @apply text-lg font-semibold text-slate-800 dark:text-navy-50 pb-3 border-b border-slate-200 dark:border-navy-500 mb-6;
    }

    /* File input styling */
    input[type="file"] {
        @apply bg-slate-50 dark:bg-navy-800 border-2 border-dashed border-slate-300 dark:border-navy-500 rounded-lg px-4 py-6 text-slate-600 dark:text-navy-200 hover:border-primary dark:hover:border-accent transition-colors duration-200;
    }

    /* Checkbox styling */
    .form-checkbox {
        @apply w-5 h-5 text-primary border-2 border-slate-300 dark:border-navy-500 rounded focus:ring-primary dark:focus:ring-accent focus:ring-offset-0;
    }

    /* Better spacing for form groups */
    .form-group {
        @apply space-y-3;
    }

    /* Enhanced error styling */
    .border-error {
        @apply border-red-500 dark:border-red-400 ring-2 ring-red-500/20 dark:ring-red-400/20;
    }

    /* Improved button styling */
    .btn {
        @apply font-semibold transition-all duration-200 transform hover:scale-105 focus:scale-105;
    }
</style>
@endpush