@extends('layouts.admin')

@section('title', 'Edit Playlist - ' . $playlist->name)

@section('content')
<div class="flex flex-col gap-4 sm:gap-6">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-x-2">
        <a href="{{ route('admin.music.playlists.index') }}" class="text-slate-600 hover:text-slate-900 dark:text-navy-300 dark:hover:text-navy-100">
            Playlists
        </a>
        <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <a href="{{ route('admin.music.playlists.show', $playlist) }}" class="text-slate-600 hover:text-slate-900 dark:text-navy-300 dark:hover:text-navy-100">
            {{ $playlist->name }}
        </a>
        <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-slate-600 dark:text-navy-300">Edit</span>
    </div>

    <!-- Page Header -->
    <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-slate-700 dark:text-navy-100">Edit Playlist</h1>
    </div>

    <!-- Form -->
    <div class="card">
        <div class="border-b border-slate-200 p-4 dark:border-navy-500 sm:px-5">
            <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Playlist Information</h3>
        </div>

        <form action="{{ route('admin.music.playlists.update', $playlist) }}" method="POST" enctype="multipart/form-data" class="p-4 sm:p-5">
            @csrf
            @method('PUT')

            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <!-- Name -->
                <div class="lg:col-span-2">
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">
                        Playlist Name <span class="text-red-500">*</span>
                    </label>
                    <input name="name" type="text" placeholder="Enter playlist name"
                           value="{{ old('name', $playlist->name) }}"
                           class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent @error('name') border-red-500 @enderror">
                    @error('name')
                        <span class="text-xs text-red-500 mt-1">{{ $message }}</span>
                    @enderror
                </div>

                <!-- Owner -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">
                        Owner <span class="text-red-500">*</span>
                    </label>
                    <select name="user_id" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent @error('user_id') border-red-500 @enderror">
                        <option value="">Select Owner</option>
                        @foreach($users as $user)
                            <option value="{{ $user->id }}" {{ old('user_id', $playlist->user_id) == $user->id ? 'selected' : '' }}>
                                {{ $user->name }} ({{ $user->email }})
                            </option>
                        @endforeach
                    </select>
                    @error('user_id')
                        <span class="text-xs text-red-500 mt-1">{{ $message }}</span>
                    @enderror
                </div>

                <!-- Privacy -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">
                        Privacy <span class="text-red-500">*</span>
                    </label>
                    <select name="privacy" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent @error('privacy') border-red-500 @enderror">
                        <option value="">Select Privacy</option>
                        <option value="public" {{ old('privacy', $playlist->privacy) === 'public' ? 'selected' : '' }}>Public</option>
                        <option value="private" {{ old('privacy', $playlist->privacy) === 'private' ? 'selected' : '' }}>Private</option>
                        <option value="unlisted" {{ old('privacy', $playlist->privacy) === 'unlisted' ? 'selected' : '' }}>Unlisted</option>
                    </select>
                    @error('privacy')
                        <span class="text-xs text-red-500 mt-1">{{ $message }}</span>
                    @enderror
                </div>

                <!-- Settings -->
                <div class="lg:col-span-2">
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100 mb-3">
                        Settings
                    </label>
                    <div class="space-y-3">
                        <label class="inline-flex items-center">
                            <input type="checkbox" name="is_collaborative" value="1" {{ old('is_collaborative', $playlist->is_collaborative) ? 'checked' : '' }}
                                   class="form-checkbox size-5 rounded border border-slate-400/70 bg-slate-100 before:bg-slate-500 checked:bg-primary checked:border-primary hover:border-primary focus:border-primary dark:border-navy-400 dark:bg-navy-700 dark:before:bg-navy-600 dark:checked:bg-accent dark:checked:border-accent dark:hover:border-accent dark:focus:border-accent">
                            <span class="ml-2 text-slate-600 dark:text-navy-100">Collaborative (others can add songs)</span>
                        </label>
                        <label class="inline-flex items-center">
                            <input type="checkbox" name="allow_comments" value="1" {{ old('allow_comments', $playlist->allow_comments) ? 'checked' : '' }}
                                   class="form-checkbox size-5 rounded border border-slate-400/70 bg-slate-100 before:bg-slate-500 checked:bg-primary checked:border-primary hover:border-primary focus:border-primary dark:border-navy-400 dark:bg-navy-700 dark:before:bg-navy-600 dark:checked:bg-accent dark:checked:border-accent dark:hover:border-accent dark:focus:border-accent">
                            <span class="ml-2 text-slate-600 dark:text-navy-100">Allow comments</span>
                        </label>
                    </div>
                </div>

                <!-- Description -->
                <div class="lg:col-span-2">
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">
                        Description
                    </label>
                    <textarea name="description" rows="4" placeholder="Enter playlist description"
                              class="form-textarea mt-1.5 w-full resize-none rounded-lg border border-slate-300 bg-transparent p-2.5 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent @error('description') border-red-500 @enderror">{{ old('description', $playlist->description) }}</textarea>
                    @error('description')
                        <span class="text-xs text-red-500 mt-1">{{ $message }}</span>
                    @enderror
                </div>

                <!-- Artwork -->
                <div class="lg:col-span-2">
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">
                        Playlist Artwork
                    </label>
                    <input name="artwork" type="file" accept="image/*"
                           class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:py-2 file:px-4 file:text-sm file:text-white hover:file:bg-primary-focus dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent @error('artwork') border-red-500 @enderror">
                    <p class="mt-1 text-xs text-slate-400">JPG, PNG, GIF up to 5MB</p>
                    @error('artwork')
                        <span class="text-xs text-red-500 mt-1">{{ $message }}</span>
                    @enderror
                </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end gap-2 pt-4">
                <a href="{{ route('admin.music.playlists.show', $playlist) }}"
                   class="btn bg-slate-150 text-slate-800 hover:bg-slate-200 focus:bg-slate-200 dark:bg-navy-500 dark:text-navy-50 dark:hover:bg-navy-450 dark:focus:bg-navy-450">
                    Cancel
                </a>
                <button type="submit"
                        class="btn bg-primary text-white hover:bg-primary-focus focus:bg-primary-focus">
                    Update Playlist
                </button>
            </div>
        </form>
    </div>
</div>
@endsection