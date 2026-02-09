@extends('layouts.admin')

@section('title', 'Create Mood')

@section('content')
<div class="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="mb-8">
        <div class="flex items-center">
            <a href="{{ route('admin.moods.index') }}" class="mr-4 text-gray-600 hover:text-gray-900">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
            </a>
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Create Mood</h1>
                <p class="mt-1 text-sm text-gray-600">Add a new mood category</p>
            </div>
        </div>
    </div>

    <div class="bg-white shadow-md rounded-lg">
        <form method="POST" action="{{ route('admin.moods.store') }}">
            @csrf
            <div class="p-6 space-y-6">
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-700">Mood Name *</label>
                    <input type="text" name="name" id="name" required value="{{ old('name') }}"
                           class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                           placeholder="e.g., Energetic">
                    @error('name')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" id="description" rows="3"
                              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              placeholder="Brief description of this mood...">{{ old('description') }}</textarea>
                    @error('description')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="color" class="block text-sm font-medium text-gray-700">Color Code</label>
                    <div class="mt-1 flex items-center space-x-3">
                        <input type="color" name="color" id="color" value="{{ old('color', '#3B82F6') }}"
                               class="h-10 w-20 border-gray-300 rounded cursor-pointer">
                        <input type="text" name="color_hex" id="color_hex" value="{{ old('color', '#3B82F6') }}"
                               class="block w-32 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-mono"
                               placeholder="#3B82F6">
                    </div>
                    <p class="mt-1 text-xs text-gray-500">Color for visual representation</p>
                    @error('color')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <div class="flex items-start">
                        <div class="flex items-center h-5">
                            <input id="is_active" name="is_active" type="checkbox" value="1" {{ old('is_active', true) ? 'checked' : '' }}
                                   class="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded">
                        </div>
                        <div class="ml-3 text-sm">
                            <label for="is_active" class="font-medium text-gray-700">Active</label>
                            <p class="text-gray-500">Make this mood available for selection</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <a href="{{ route('admin.moods.index') }}"
                   class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Cancel
                </a>
                <button type="submit"
                        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                    Create Mood
                </button>
            </div>
        </form>
    </div>
</div>

<script>
    // Sync color picker with text input
    document.getElementById('color').addEventListener('input', function(e) {
        document.getElementById('color_hex').value = e.target.value;
    });
    document.getElementById('color_hex').addEventListener('input', function(e) {
        document.getElementById('color').value = e.target.value;
    });
</script>
@endsection
