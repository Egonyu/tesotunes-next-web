@extends('layouts.admin')

@section('title', 'Edit Award Category')

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
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Edit Award Category</h1>
                <p class="text-slate-600 dark:text-navy-300">Update category details and settings</p>
            </div>
        </div>
    </div>

    <!-- Edit Form -->
    <div class="admin-card max-w-4xl">
        <form action="{{ route('admin.awards.categories.update', $category->id) }}" method="POST">
            @csrf
            @method('PUT')

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
                                <option value="{{ $season->id }}" {{ old('award_season_id', $category->award_season_id) == $season->id ? 'selected' : '' }}>
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
                               value="{{ old('name', $category->name) }}"
                               class="form-input w-full"
                               placeholder="e.g., Best New Artist"
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
                                  rows="4"
                                  class="form-input w-full"
                                  placeholder="Describe what this category represents...">{{ old('description', $category->description) }}</textarea>
                        @error('description')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="nominee_type" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Nominee Type <span class="text-red-500">*</span>
                        </label>
                        <select id="nominee_type"
                                name="nominee_type"
                                class="form-input w-full"
                                required>
                            <option value="">Select Type</option>
                            <option value="artist" {{ old('nominee_type', $category->nominee_type) === 'artist' ? 'selected' : '' }}>Artist</option>
                            <option value="track" {{ old('nominee_type', $category->nominee_type) === 'track' ? 'selected' : '' }}>Track/Song</option>
                            <option value="album" {{ old('nominee_type', $category->nominee_type) === 'album' ? 'selected' : '' }}>Album</option>
                        </select>
                        @error('nominee_type')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="icon" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Icon/Emoji
                        </label>
                        <input type="text"
                               id="icon"
                               name="icon"
                               value="{{ old('icon', $category->icon) }}"
                               class="form-input w-full"
                               placeholder="🏆"
                               maxlength="5">
                        <p class="text-xs text-slate-500 mt-1">Optional emoji or icon to represent this category</p>
                    </div>
                </div>

                <!-- Voting Configuration -->
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Voting Configuration</h3>

                    <div>
                        <label for="max_nominations_per_user" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Max Nominations Per User <span class="text-red-500">*</span>
                        </label>
                        <input type="number"
                               id="max_nominations_per_user"
                               name="max_nominations_per_user"
                               value="{{ old('max_nominations_per_user', $category->max_nominations_per_user) }}"
                               class="form-input w-full"
                               min="1"
                               max="10"
                               required>
                        <p class="text-xs text-slate-500 mt-1">How many times can a user nominate in this category?</p>
                        @error('max_nominations_per_user')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="max_votes_per_user" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Max Votes Per User <span class="text-red-500">*</span>
                        </label>
                        <input type="number"
                               id="max_votes_per_user"
                               name="max_votes_per_user"
                               value="{{ old('max_votes_per_user', $category->max_votes_per_user) }}"
                               class="form-input w-full"
                               min="1"
                               max="5"
                               required>
                        <p class="text-xs text-slate-500 mt-1">How many times can a user vote in this category?</p>
                        @error('max_votes_per_user')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="sort_order" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                            Sort Order <span class="text-red-500">*</span>
                        </label>
                        <input type="number"
                               id="sort_order"
                               name="sort_order"
                               value="{{ old('sort_order', $category->sort_order) }}"
                               class="form-input w-full"
                               min="0"
                               required>
                        <p class="text-xs text-slate-500 mt-1">Categories are displayed in ascending order</p>
                        @error('sort_order')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <div class="border-t pt-4 mt-4">
                        <h4 class="text-md font-semibold text-slate-800 dark:text-navy-50 mb-3">Jury Settings</h4>
                        
                        <div class="flex items-center mb-3">
                            <input type="checkbox"
                                   id="is_jury_category"
                                   name="is_jury_category"
                                   value="1"
                                   {{ old('is_jury_category', $category->is_jury_category) ? 'checked' : '' }}
                                   class="form-checkbox"
                                   onchange="document.getElementById('jury_weight_div').style.display = this.checked ? 'block' : 'none'">
                            <label for="is_jury_category" class="ml-2 text-sm text-slate-700 dark:text-navy-300">
                                Enable Jury Voting
                            </label>
                        </div>

                        <div id="jury_weight_div" style="display: {{ old('is_jury_category', $category->is_jury_category) ? 'block' : 'none' }}">
                            <label for="jury_weight_percentage" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                                Jury Weight Percentage
                            </label>
                            <input type="number"
                                   id="jury_weight_percentage"
                                   name="jury_weight_percentage"
                                   value="{{ old('jury_weight_percentage', $category->jury_weight_percentage ?? 50) }}"
                                   class="form-input w-full"
                                   min="0"
                                   max="100"
                                   step="1">
                            <p class="text-xs text-slate-500 mt-1">Percentage of total score from jury votes (remaining % from public votes)</p>
                        </div>
                    </div>

                    <div class="border-t pt-4 mt-4">
                        <h4 class="text-md font-semibold text-slate-800 dark:text-navy-50 mb-3">Status</h4>
                        
                        <div class="flex items-center">
                            <input type="checkbox"
                                   id="is_active"
                                   name="is_active"
                                   value="1"
                                   {{ old('is_active', $category->is_active) ? 'checked' : '' }}
                                   class="form-checkbox">
                            <label for="is_active" class="ml-2 text-sm text-slate-700 dark:text-navy-300">
                                Category is Active
                            </label>
                        </div>
                        <p class="text-xs text-slate-500 mt-1">Inactive categories won't accept nominations or votes</p>
                    </div>
                </div>
            </div>

            <!-- Form Actions -->
            <div class="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-navy-600">
                <a href="{{ route('admin.awards.categories.index') }}"
                   class="btn bg-slate-100 text-slate-700 hover:bg-slate-200">
                    Cancel
                </a>
                <div class="flex gap-2">
                    <button type="submit"
                            class="btn bg-primary text-white hover:bg-primary-focus">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Update Category
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>
@endsection
