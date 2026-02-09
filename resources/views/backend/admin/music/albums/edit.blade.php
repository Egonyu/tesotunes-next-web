@extends('layouts.admin')

@section('title', 'Edit Album - ' . $album->title)

@section('content')
<div class="flex flex-col gap-4 sm:gap-6">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-x-2">
        <a href="{{ route('admin.music.albums.index') }}" class="text-slate-600 hover:text-slate-900 dark:text-navy-300 dark:hover:text-navy-100">
            Albums
        </a>
        <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <a href="{{ route('admin.music.albums.show', $album) }}" class="text-slate-600 hover:text-slate-900 dark:text-navy-300 dark:hover:text-navy-100">
            {{ $album->title }}
        </a>
        <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-slate-600 dark:text-navy-300">Edit</span>
    </div>

    <!-- Page Header -->
    <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-slate-700 dark:text-navy-100">Edit Album</h1>
    </div>

    <!-- Form -->
    <div class="card">
        <div class="border-b border-slate-200 p-4 dark:border-navy-500 sm:px-5">
            <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Album Information</h3>
        </div>

        <form action="{{ route('admin.music.albums.update', $album) }}" method="POST" enctype="multipart/form-data" class="p-4 sm:p-5">
            @csrf
            @method('PUT')

            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <!-- Title -->
                <div class="lg:col-span-2">
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">
                        Album Title <span class="text-red-500">*</span>
                    </label>
                    <input name="title" type="text" placeholder="Enter album title"
                           value="{{ old('title', $album->title) }}"
                           class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent @error('title') border-red-500 @enderror">
                    @error('title')
                        <span class="text-xs text-red-500 mt-1">{{ $message }}</span>
                    @enderror
                </div>

                <!-- Artist -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">
                        Artist <span class="text-red-500">*</span>
                    </label>
                    <select name="artist_id" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent @error('artist_id') border-red-500 @enderror">
                        <option value="">Select Artist</option>
                        @foreach($artists as $artist)
                            <option value="{{ $artist->id }}" {{ old('artist_id', $album->artist_id) == $artist->id ? 'selected' : '' }}>
                                {{ $artist->stage_name }}
                            </option>
                        @endforeach
                    </select>
                    @error('artist_id')
                        <span class="text-xs text-red-500 mt-1">{{ $message }}</span>
                    @enderror
                </div>

                <!-- Genre -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">
                        Genre
                    </label>
                    <select name="genre_id" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent @error('genre_id') border-red-500 @enderror">
                        <option value="">Select Genre</option>
                        @foreach($genres as $genre)
                            <option value="{{ $genre->id }}" {{ old('genre_id', $album->genre_id) == $genre->id ? 'selected' : '' }}>
                                {{ $genre->name }}
                            </option>
                        @endforeach
                    </select>
                    @error('genre_id')
                        <span class="text-xs text-red-500 mt-1">{{ $message }}</span>
                    @enderror
                </div>

                <!-- Release Date -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">
                        Release Date <span class="text-red-500">*</span>
                    </label>
                    <input name="release_date" type="date" value="{{ old('release_date', $album->release_date ? $album->release_date->format('Y-m-d') : '') }}"
                           class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent @error('release_date') border-red-500 @enderror">
                    @error('release_date')
                        <span class="text-xs text-red-500 mt-1">{{ $message }}</span>
                    @enderror
                </div>

                <!-- Type -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">
                        Album Type <span class="text-red-500">*</span>
                    </label>
                    <select name="type" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent @error('type') border-red-500 @enderror">
                        <option value="">Select Type</option>
                        <option value="album" {{ old('type', $album->type) === 'album' ? 'selected' : '' }}>Album</option>
                        <option value="ep" {{ old('type', $album->type) === 'ep' ? 'selected' : '' }}>EP</option>
                        <option value="single" {{ old('type', $album->type) === 'single' ? 'selected' : '' }}>Single</option>
                        <option value="compilation" {{ old('type', $album->type) === 'compilation' ? 'selected' : '' }}>Compilation</option>
                    </select>
                    @error('type')
                        <span class="text-xs text-red-500 mt-1">{{ $message }}</span>
                    @enderror
                </div>

                <!-- Status -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">
                        Status <span class="text-red-500">*</span>
                    </label>
                    <select name="status" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent @error('status') border-red-500 @enderror">
                        <option value="">Select Status</option>
                        <option value="draft" {{ old('status', $album->status) === 'draft' ? 'selected' : '' }}>Draft</option>
                        <option value="published" {{ old('status', $album->status) === 'published' ? 'selected' : '' }}>Published</option>
                        <option value="archived" {{ old('status', $album->status) === 'archived' ? 'selected' : '' }}>Archived</option>
                    </select>
                    @error('status')
                        <span class="text-xs text-red-500 mt-1">{{ $message }}</span>
                    @enderror
                </div>

                <!-- Description -->
                <div class="lg:col-span-2">
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">
                        Description
                    </label>
                    <textarea name="description" rows="4" placeholder="Enter album description"
                              class="form-textarea mt-1.5 w-full resize-none rounded-lg border border-slate-300 bg-transparent p-2.5 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent @error('description') border-red-500 @enderror">{{ old('description', $album->description) }}</textarea>
                    @error('description')
                        <span class="text-xs text-red-500 mt-1">{{ $message }}</span>
                    @enderror
                </div>

                <!-- Current Artwork -->
                @if($album->artwork)
                    <div class="lg:col-span-2">
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">
                            Current Artwork
                        </label>
                        <div class="mt-2">
                            <img src="{{ asset('storage/' . $album->artwork) }}" alt="{{ $album->title }}" class="h-32 w-32 rounded-lg object-cover shadow-lg">
                        </div>
                    </div>
                @endif

                <!-- New Artwork -->
                <div class="lg:col-span-2">
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">
                        {{ $album->artwork ? 'Replace Artwork' : 'Album Artwork' }}
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
                <a href="{{ route('admin.music.albums.show', $album) }}"
                   class="btn bg-slate-150 text-slate-800 hover:bg-slate-200 focus:bg-slate-200 dark:bg-navy-500 dark:text-navy-50 dark:hover:bg-navy-450 dark:focus:bg-navy-450">
                    Cancel
                </a>
                <button type="submit"
                        class="btn bg-primary text-white hover:bg-primary-focus focus:bg-primary-focus">
                    Update Album
                </button>
            </div>
        </form>
    </div>
</div>
@endsection