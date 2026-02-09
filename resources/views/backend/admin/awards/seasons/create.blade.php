@extends('layouts.admin')

@section('title', 'Create Award Season')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex items-center gap-4">
            <a href="{{ route('admin.awards.seasons.index') }}"
               class="btn size-8 rounded-full p-0 hover:bg-slate-300/20">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </a>
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Create Award Season</h1>
                <p class="text-slate-600 dark:text-navy-300">Set up a new award season with nomination and voting periods</p>
            </div>
        </div>
    </div>

    <!-- Create Form -->
    <div class="admin-card max-w-4xl">
        <form action="{{ route('admin.awards.seasons.store') }}" method="POST">
            @csrf

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Basic Information -->
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Basic Information</h3>

                    <div>
                        <label for="name" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Season Name <span class="text-red-500">*</span>
                        </label>
                        <input type="text"
                               id="name"
                               name="name"
                               value="{{ old('name') }}"
                               class="form-input w-full"
                               placeholder="e.g., Uganda Music Awards 2024"
                               required>
                        @error('name')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="year" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Year <span class="text-red-500">*</span>
                        </label>
                        <input type="number"
                               id="year"
                               name="year"
                               value="{{ old('year', date('Y')) }}"
                               min="2020"
                               max="2030"
                               class="form-input w-full"
                               required>
                        @error('year')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="description" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Description
                        </label>
                        <textarea id="description"
                                  name="description"
                                  rows="4"
                                  class="form-input w-full"
                                  placeholder="Brief description of this award season...">{{ old('description') }}</textarea>
                        @error('description')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <!-- Timeline -->
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Timeline</h3>

                    <div>
                        <label for="nominations_start_at" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Nominations Start <span class="text-red-500">*</span>
                        </label>
                        <input type="datetime-local"
                               id="nominations_start_at"
                               name="nominations_start_at"
                               value="{{ old('nominations_start_at') }}"
                               class="form-input w-full"
                               required>
                        @error('nominations_start_at')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="nominations_end_at" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Nominations End <span class="text-red-500">*</span>
                        </label>
                        <input type="datetime-local"
                               id="nominations_end_at"
                               name="nominations_end_at"
                               value="{{ old('nominations_end_at') }}"
                               class="form-input w-full"
                               required>
                        @error('nominations_end_at')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="voting_start_at" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Voting Start <span class="text-red-500">*</span>
                        </label>
                        <input type="datetime-local"
                               id="voting_start_at"
                               name="voting_start_at"
                               value="{{ old('voting_start_at') }}"
                               class="form-input w-full"
                               required>
                        @error('voting_start_at')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="voting_end_at" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Voting End <span class="text-red-500">*</span>
                        </label>
                        <input type="datetime-local"
                               id="voting_end_at"
                               name="voting_end_at"
                               value="{{ old('voting_end_at') }}"
                               class="form-input w-full"
                               required>
                        @error('voting_end_at')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="ceremony_at" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Ceremony Date
                        </label>
                        <input type="datetime-local"
                               id="ceremony_at"
                               name="ceremony_at"
                               value="{{ old('ceremony_at') }}"
                               class="form-input w-full">
                        @error('ceremony_at')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>
                </div>
            </div>

            <!-- Settings -->
            <div class="mt-8 pt-6 border-t border-slate-200 dark:border-navy-600">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Settings</h3>

                <div class="flex items-center gap-3">
                    <input type="checkbox"
                           id="is_active"
                           name="is_active"
                           {{ old('is_active', true) ? 'checked' : '' }}
                           class="form-checkbox">
                    <label for="is_active" class="text-sm font-medium text-slate-700 dark:text-navy-300">
                        Active Season
                    </label>
                </div>
                <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">Only active seasons are visible to users</p>
            </div>

            <!-- Form Actions -->
            <div class="flex gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-navy-600">
                <button type="submit" class="btn bg-primary text-white hover:bg-primary-focus">
                    Create Season
                </button>
                <a href="{{ route('admin.awards.seasons.index') }}"
                   class="btn border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-500">
                    Cancel
                </a>
            </div>
        </form>
    </div>
</div>
@endsection
