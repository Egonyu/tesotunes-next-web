@extends('layouts.admin')

@section('title', 'Edit Mood')

@section('content')
<div class="p-6 max-w-4xl mx-auto">
    <div class="mb-6">
        <div class="flex items-center gap-4">
            <a href="{{ route('admin.moods.index') }}" 
               class="btn size-10 rounded-lg p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25 dark:hover:bg-navy-300/20 dark:focus:bg-navy-300/20 dark:active:bg-navy-300/25">
                <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
            </a>
            <div>
                <h1 class="text-2xl font-bold text-slate-800 dark:text-navy-50">Edit Mood</h1>
                <p class="mt-1 text-sm text-slate-600 dark:text-navy-300">Update {{ $mood->name }} information</p>
            </div>
        </div>
    </div>

    <div class="card">
        <form method="POST" action="{{ route('admin.moods.update', $mood) }}">
            @csrf
            @method('PUT')
            <div class="p-6 space-y-6">
                <!-- Basic Info -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="name" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                            Mood Name <span class="text-error">*</span>
                        </label>
                        <input type="text" name="name" id="name" required value="{{ old('name', $mood->name) }}"
                               class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-450 bg-transparent px-3 py-2 placeholder:text-slate-400 hover:border-slate-400 focus:border-primary dark:hover:border-navy-400 dark:focus:border-accent"
                               placeholder="e.g., Energetic">
                        @error('name')
                            <p class="mt-1 text-xs text-error">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="color" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                            Color Code
                        </label>
                        <div class="flex items-center gap-3">
                            <input type="color" name="color" id="color" value="{{ old('color', $mood->color ?? '#3B82F6') }}"
                                   class="h-10 w-20 border border-slate-300 dark:border-navy-450 rounded-lg cursor-pointer">
                            <span class="text-xs text-slate-500 dark:text-navy-300" id="color-display">{{ old('color', $mood->color ?? '#3B82F6') }}</span>
                        </div>
                        @error('color')
                            <p class="mt-1 text-xs text-error">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <div>
                    <label for="description" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                        Description
                    </label>
                    <textarea name="description" id="description" rows="3"
                              class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-450 bg-transparent px-3 py-2 placeholder:text-slate-400 hover:border-slate-400 focus:border-primary dark:hover:border-navy-400 dark:focus:border-accent"
                              placeholder="Brief description of this mood...">{{ old('description', $mood->description) }}</textarea>
                    @error('description')
                        <p class="mt-1 text-xs text-error">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Active Status -->
                <div>
                    <label class="inline-flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" name="is_active" id="is_active" value="1" 
                               {{ old('is_active', $mood->is_active) ? 'checked' : '' }}
                               class="form-checkbox is-outline size-5 rounded border-slate-400/70 before:bg-primary checked:border-primary hover:border-primary focus:border-primary dark:border-navy-400 dark:before:bg-accent dark:checked:border-accent dark:hover:border-accent dark:focus:border-accent">
                        <span class="text-sm text-slate-700 dark:text-navy-100">Active</span>
                    </label>
                    <p class="mt-1 text-xs text-slate-500 dark:text-navy-300">Make this mood available for selection</p>
                </div>
            </div>

            <!-- Form Actions -->
            <div class="px-6 py-4 border-t border-slate-200 dark:border-navy-500 flex justify-end gap-3">
                <a href="{{ route('admin.moods.index') }}"
                   class="btn border border-slate-300 dark:border-navy-450 font-medium text-slate-700 hover:bg-slate-150 focus:bg-slate-150 active:bg-slate-150/80 dark:text-navy-100 dark:hover:bg-navy-500 dark:focus:bg-navy-500 dark:active:bg-navy-500/90">
                    Cancel
                </a>
                <button type="submit"
                        class="btn bg-primary font-medium text-white hover:bg-primary-focus focus:bg-primary-focus active:bg-primary-focus/90 dark:bg-accent dark:hover:bg-accent-focus dark:focus:bg-accent-focus dark:active:bg-accent/90">
                    Update Mood
                </button>
            </div>
        </form>
    </div>
</div>

<script>
    // Update color display
    document.getElementById('color').addEventListener('input', function(e) {
        document.getElementById('color-display').textContent = e.target.value;
    });
</script>
@endsection
