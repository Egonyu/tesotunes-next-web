@extends('layouts.admin')

@section('title', 'Add New Slide')

@section('content')
<div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
        <div class="flex items-center">
            <a href="{{ route('admin.slideshow.overview') }}" class="mr-4 text-gray-600 hover:text-gray-900">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
            </a>
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Add New Slide</h1>
                <p class="mt-1 text-sm text-gray-600">Create a new slide for homepage sections</p>
            </div>
        </div>
    </div>

    <!-- Form -->
    <div class="bg-white shadow-md rounded-lg">
        <form method="POST" action="{{ route('admin.slideshow.store') }}" enctype="multipart/form-data">
            @csrf

            <div class="p-6 space-y-6">
                <!-- Object Selection -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Content Object *</label>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="object_type" class="block text-sm text-gray-600 mb-1">Type</label>
                            <select name="object_type" id="object_type" required
                                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                                <option value="">Select type...</option>
                                <option value="song">Song</option>
                                <option value="album">Album</option>
                                <option value="artist">Artist</option>
                                <option value="playlist">Playlist</option>
                                <option value="station">Radio Station</option>
                            </select>
                            @error('object_type')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                        <div>
                            <label for="object_id" class="block text-sm text-gray-600 mb-1">Object ID</label>
                            <input type="number" name="object_id" id="object_id" required
                                   class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                   placeholder="Enter ID">
                            @error('object_id')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>
                </div>

                <!-- Title and Link -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-700">Title (Optional)</label>
                        <input type="text" name="title" id="title" value="{{ old('title') }}"
                               class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                               placeholder="Custom title">
                        @error('title')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>
                    <div>
                        <label for="title_link" class="block text-sm font-medium text-gray-700">Title Link (Optional)</label>
                        <input type="url" name="title_link" id="title_link" value="{{ old('title_link') }}"
                               class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                               placeholder="https://">
                        @error('title_link')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <!-- Description -->
                <div>
                    <label for="description" class="block text-sm font-medium text-gray-700">Description (Optional)</label>
                    <textarea name="description" id="description" rows="3"
                              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              placeholder="Brief description...">{{ old('description') }}</textarea>
                    @error('description')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Artwork -->
                <div>
                    <label for="artwork" class="block text-sm font-medium text-gray-700">Artwork (Optional)</label>
                    <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div class="space-y-1 text-center">
                            <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <div class="flex text-sm text-gray-600">
                                <label for="artwork" class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                                    <span>Upload a file</span>
                                    <input id="artwork" name="artwork" type="file" class="sr-only" accept="image/*">
                                </label>
                                <p class="pl-1">or drag and drop</p>
                            </div>
                            <p class="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                        </div>
                    </div>
                    @error('artwork')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Priority -->
                <div>
                    <label for="priority" class="block text-sm font-medium text-gray-700">Priority</label>
                    <input type="number" name="priority" id="priority" value="{{ old('priority', 0) }}"
                           class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                           placeholder="0">
                    <p class="mt-1 text-xs text-gray-500">Higher priority slides appear first</p>
                    @error('priority')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Section Permissions -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Display Sections *</label>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div class="flex items-start">
                            <div class="flex items-center h-5">
                                <input id="allow_home" name="allow_home" type="checkbox" value="1" {{ old('allow_home') ? 'checked' : '' }}
                                       class="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded">
                            </div>
                            <div class="ml-3 text-sm">
                                <label for="allow_home" class="font-medium text-gray-700">Home</label>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <div class="flex items-center h-5">
                                <input id="allow_discover" name="allow_discover" type="checkbox" value="1" {{ old('allow_discover') ? 'checked' : '' }}
                                       class="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded">
                            </div>
                            <div class="ml-3 text-sm">
                                <label for="allow_discover" class="font-medium text-gray-700">Discover</label>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <div class="flex items-center h-5">
                                <input id="allow_radio" name="allow_radio" type="checkbox" value="1" {{ old('allow_radio') ? 'checked' : '' }}
                                       class="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded">
                            </div>
                            <div class="ml-3 text-sm">
                                <label for="allow_radio" class="font-medium text-gray-700">Radio</label>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <div class="flex items-center h-5">
                                <input id="allow_community" name="allow_community" type="checkbox" value="1" {{ old('allow_community') ? 'checked' : '' }}
                                       class="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded">
                            </div>
                            <div class="ml-3 text-sm">
                                <label for="allow_community" class="font-medium text-gray-700">Community</label>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <div class="flex items-center h-5">
                                <input id="allow_trending" name="allow_trending" type="checkbox" value="1" {{ old('allow_trending') ? 'checked' : '' }}
                                       class="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded">
                            </div>
                            <div class="ml-3 text-sm">
                                <label for="allow_trending" class="font-medium text-gray-700">Trending</label>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <div class="flex items-center h-5">
                                <input id="allow_channels" name="allow_channels" type="checkbox" value="1" {{ old('allow_channels') ? 'checked' : '' }}
                                       class="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded">
                            </div>
                            <div class="ml-3 text-sm">
                                <label for="allow_channels" class="font-medium text-gray-700">Channels</label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Genre and Mood Filters -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="genre" class="block text-sm font-medium text-gray-700">Genre Filter (Optional)</label>
                        <input type="text" name="genre" id="genre" value="{{ old('genre') }}"
                               class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                               placeholder="e.g., afrobeat">
                        @error('genre')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>
                    <div>
                        <label for="mood" class="block text-sm font-medium text-gray-700">Mood Filter (Optional)</label>
                        <input type="text" name="mood" id="mood" value="{{ old('mood') }}"
                               class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                               placeholder="e.g., energetic">
                        @error('mood')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <!-- Visibility -->
                <div>
                    <div class="flex items-start">
                        <div class="flex items-center h-5">
                            <input id="visibility" name="visibility" type="checkbox" value="1" {{ old('visibility', true) ? 'checked' : '' }}
                                   class="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded">
                        </div>
                        <div class="ml-3 text-sm">
                            <label for="visibility" class="font-medium text-gray-700">Visible</label>
                            <p class="text-gray-500">Make this slide visible to users</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <a href="{{ route('admin.slideshow.overview') }}"
                   class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    Cancel
                </a>
                <button type="submit"
                        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    Create Slide
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
