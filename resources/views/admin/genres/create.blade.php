@extends('layouts.admin')

@section('title', 'Create Genre')

@section('content')
<div class="p-6 max-w-4xl mx-auto">
    <div class="mb-6">
        <div class="flex items-center gap-4">
            <a href="{{ route('admin.genres.index') }}" 
               class="btn size-10 rounded-lg p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25 dark:hover:bg-navy-300/20 dark:focus:bg-navy-300/20 dark:active:bg-navy-300/25">
                <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
            </a>
            <div>
                <h1 class="text-2xl font-bold text-slate-800 dark:text-navy-50">Create Genre</h1>
                <p class="mt-1 text-sm text-slate-600 dark:text-navy-300">Add a new music genre category</p>
            </div>
        </div>
    </div>

    <div class="card">
        <form method="POST" action="{{ route('admin.genres.store') }}" enctype="multipart/form-data">
            @csrf
            <div class="p-6 space-y-6">
                <!-- Basic Info -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="name" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                            Genre Name <span class="text-error">*</span>
                        </label>
                        <input type="text" name="name" id="name" required value="{{ old('name') }}"
                               class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-450 bg-transparent px-3 py-2 placeholder:text-slate-400 hover:border-slate-400 focus:border-primary dark:hover:border-navy-400 dark:focus:border-accent"
                               placeholder="e.g., Afrobeat, Dancehall">
                        @error('name')
                            <p class="mt-1 text-xs text-error">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="slug" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                            Slug
                        </label>
                        <input type="text" name="slug" id="slug" value="{{ old('slug') }}"
                               class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-450 bg-transparent px-3 py-2 placeholder:text-slate-400 hover:border-slate-400 focus:border-primary dark:hover:border-navy-400 dark:focus:border-accent"
                               placeholder="Auto-generated if left empty">
                        @error('slug')
                            <p class="mt-1 text-xs text-error">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <div>
                    <label for="description" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Description</label>
                    <textarea name="description" id="description" rows="3"
                              class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-450 bg-transparent px-3 py-2 placeholder:text-slate-400 hover:border-slate-400 focus:border-primary dark:hover:border-navy-400 dark:focus:border-accent"
                              placeholder="Brief description of this genre...">{{ old('description') }}</textarea>
                    @error('description')
                        <p class="mt-1 text-xs text-error">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Visual Styling -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="color" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                            Color
                        </label>
                        <div class="flex gap-2">
                            <input type="color" name="color" id="color" value="{{ old('color', '#6366f1') }}"
                                   class="h-10 w-20 rounded border border-slate-300 dark:border-navy-450 cursor-pointer">
                            <input type="text" id="color_hex" value="{{ old('color', '#6366f1') }}"
                                   class="form-input flex-1 rounded-lg border border-slate-300 dark:border-navy-450 bg-transparent px-3 py-2"
                                   placeholder="#6366f1" readonly>
                        </div>
                        <p class="mt-1 text-xs text-slate-500 dark:text-navy-400">Used for genre cards and badges</p>
                        @error('color')
                            <p class="mt-1 text-xs text-error">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="icon" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                            Icon (Material Icons)
                        </label>
                        <input type="text" name="icon" id="icon" value="{{ old('icon') }}"
                               class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-450 bg-transparent px-3 py-2 placeholder:text-slate-400 hover:border-slate-400 focus:border-primary dark:hover:border-navy-400 dark:focus:border-accent"
                               placeholder="e.g., music_note, headphones">
                        <p class="mt-1 text-xs text-slate-500 dark:text-navy-400">
                            <a href="https://fonts.google.com/icons" target="_blank" class="text-primary hover:underline">Browse icons</a>
                        </p>
                        @error('icon')
                            <p class="mt-1 text-xs text-error">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <!-- Settings -->
                <div class="space-y-4">
                    <div class="flex items-start">
                        <div class="flex items-center h-5">
                            <input id="is_active" name="is_active" type="checkbox" value="1" {{ old('is_active', true) ? 'checked' : '' }}
                                   class="form-checkbox size-5 rounded border-slate-300 dark:border-navy-450 bg-transparent checked:bg-primary checked:border-primary hover:border-slate-400 focus:border-primary dark:hover:border-navy-400 dark:checked:bg-accent dark:checked:border-accent dark:focus:border-accent">
                        </div>
                        <div class="ml-3">
                            <label for="is_active" class="font-medium text-slate-700 dark:text-navy-100">Active</label>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Make this genre available for selection</p>
                        </div>
                    </div>

                    <div class="flex items-start">
                        <div class="flex items-center h-5">
                            <input id="is_featured" name="is_featured" type="checkbox" value="1" {{ old('is_featured') ? 'checked' : '' }}
                                   class="form-checkbox size-5 rounded border-slate-300 dark:border-navy-450 bg-transparent checked:bg-primary checked:border-primary hover:border-slate-400 focus:border-primary dark:hover:border-navy-400 dark:checked:bg-accent dark:checked:border-accent dark:focus:border-accent">
                        </div>
                        <div class="ml-3">
                            <label for="is_featured" class="font-medium text-slate-700 dark:text-navy-100">Featured</label>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Show on homepage and discovery</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-navy-500 px-6 py-4">
                <a href="{{ route('admin.genres.index') }}"
                   class="btn bg-slate-150 font-medium text-slate-800 hover:bg-slate-200 dark:bg-navy-500 dark:text-navy-50 dark:hover:bg-navy-450">
                    Cancel
                </a>
                <button type="submit"
                        class="btn bg-primary font-medium text-white hover:bg-primary-focus dark:bg-accent dark:hover:bg-accent-focus">
                    Create Genre
                </button>
            </div>
        </form>
    </div>
</div>

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Sync color picker with hex input
    const colorPicker = document.getElementById('color');
    const colorHex = document.getElementById('color_hex');
    
    if (colorPicker && colorHex) {
        colorPicker.addEventListener('input', function() {
            colorHex.value = this.value;
        });
    }
    
    // Auto-generate slug from name
    const nameInput = document.getElementById('name');
    const slugInput = document.getElementById('slug');
    
    if (nameInput && slugInput) {
        nameInput.addEventListener('input', function() {
            if (!slugInput.dataset.manual) {
                const slug = this.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                slugInput.value = slug;
            }
        });
        
        slugInput.addEventListener('input', function() {
            this.dataset.manual = 'true';
        });
    }
});
</script>
@endpush
@endsection
