@extends('layouts.admin')

@section('title', 'Create Award Category')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex items-center gap-4">
            <a href="{{ route('admin.awards.categories.index') }}"
               class="btn size-8 rounded-full p-0 hover:bg-slate-300/20">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </a>
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Create Award Category</h1>
                <p class="text-slate-600 dark:text-navy-300">Add a new category to an award season</p>
            </div>
        </div>
    </div>

    <!-- Create Form -->
    <div class="admin-card max-w-4xl">
        <form action="{{ route('admin.awards.categories.store') }}" method="POST">
            @csrf

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Basic Information -->
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Basic Information</h3>

                    <div>
                        <label for="award_season_id" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Award Season <span class="text-red-500">*</span>
                        </label>
                        <select id="award_season_id"
                                name="award_season_id"
                                class="form-input w-full"
                                required>
                            <option value="">Select Award Season</option>
                            @foreach($seasons as $season)
                                <option value="{{ $season->id }}" {{ old('award_season_id') == $season->id ? 'selected' : '' }}>
                                    {{ $season->name }} ({{ $season->year }})
                                </option>
                            @endforeach
                        </select>
                        @error('award_season_id')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="name" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Category Name <span class="text-red-500">*</span>
                        </label>
                        <input type="text"
                               id="name"
                               name="name"
                               value="{{ old('name') }}"
                               class="form-input w-full"
                               placeholder="e.g., Best Song of the Year"
                               required>
                        @error('name')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="description" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Description
                        </label>
                        <textarea id="description"
                                  name="description"
                                  rows="3"
                                  class="form-input w-full"
                                  placeholder="Brief description of this category...">{{ old('description') }}</textarea>
                        @error('description')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="icon" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Icon (Emoji)
                        </label>
                        <input type="text"
                               id="icon"
                               name="icon"
                               value="{{ old('icon') }}"
                               class="form-input w-full"
                               placeholder="🎵"
                               maxlength="4">
                        @error('icon')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <!-- Configuration -->
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Configuration</h3>

                    <div>
                        <label for="nominee_type" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Nominee Type <span class="text-red-500">*</span>
                        </label>
                        <select id="nominee_type"
                                name="nominee_type"
                                class="form-input w-full"
                                required>
                            <option value="">Select Type</option>
                            <option value="song" {{ old('nominee_type') == 'song' ? 'selected' : '' }}>Song</option>
                            <option value="artist" {{ old('nominee_type') == 'artist' ? 'selected' : '' }}>Artist</option>
                            <option value="album" {{ old('nominee_type') == 'album' ? 'selected' : '' }}>Album</option>
                            <option value="playlist" {{ old('nominee_type') == 'playlist' ? 'selected' : '' }}>Playlist</option>
                        </select>
                        @error('nominee_type')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="max_nominations_per_user" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Max Nominations per User <span class="text-red-500">*</span>
                        </label>
                        <input type="number"
                               id="max_nominations_per_user"
                               name="max_nominations_per_user"
                               value="{{ old('max_nominations_per_user', 3) }}"
                               min="1"
                               max="20"
                               class="form-input w-full"
                               required>
                        @error('max_nominations_per_user')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="max_votes_per_user" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Max Votes per User <span class="text-red-500">*</span>
                        </label>
                        <input type="number"
                               id="max_votes_per_user"
                               name="max_votes_per_user"
                               value="{{ old('max_votes_per_user', 1) }}"
                               min="1"
                               max="10"
                               class="form-input w-full"
                               required>
                        @error('max_votes_per_user')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="sort_order" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Sort Order
                        </label>
                        <input type="number"
                               id="sort_order"
                               name="sort_order"
                               value="{{ old('sort_order', 0) }}"
                               min="0"
                               class="form-input w-full">
                        @error('sort_order')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>
                </div>
            </div>

            <!-- Jury Settings -->
            <div class="mt-8 pt-6 border-t border-slate-200 dark:border-navy-600">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Jury Settings</h3>

                <div class="flex items-center gap-3 mb-4">
                    <input type="checkbox"
                           id="is_jury_category"
                           name="is_jury_category"
                           {{ old('is_jury_category') ? 'checked' : '' }}
                           class="form-checkbox"
                           onchange="toggleJuryWeight(this)">
                    <label for="is_jury_category" class="text-sm font-medium text-slate-700 dark:text-navy-300">
                        Jury Category
                    </label>
                </div>

                <div id="jury_weight_container" class="hidden">
                    <label for="jury_weight_percentage" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                        Jury Weight Percentage
                    </label>
                    <input type="number"
                           id="jury_weight_percentage"
                           name="jury_weight_percentage"
                           value="{{ old('jury_weight_percentage', 50) }}"
                           min="0"
                           max="100"
                           step="0.01"
                           class="form-input w-full max-w-xs">
                    <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">
                        The remaining percentage will be public votes
                    </p>
                    @error('jury_weight_percentage')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
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
                        Active Category
                    </label>
                </div>
                <p class="text-sm text-slate-500 dark:text-navy-400 mt-1">Only active categories are visible to users</p>
            </div>

            <!-- Form Actions -->
            <div class="flex gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-navy-600">
                <button type="submit" class="btn bg-primary text-white hover:bg-primary-focus">
                    Create Category
                </button>
                <a href="{{ route('admin.awards.categories.index') }}"
                   class="btn border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-500">
                    Cancel
                </a>
            </div>
        </form>
    </div>
</div>

<script>
function toggleJuryWeight(checkbox) {
    const container = document.getElementById('jury_weight_container');
    if (checkbox.checked) {
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const juryCheckbox = document.getElementById('is_jury_category');
    toggleJuryWeight(juryCheckbox);
});
</script>
@endsection