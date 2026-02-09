@extends('layouts.admin')

@section('title', 'Create New Song')

@section('content')
<div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-2xl font-bold text-slate-800 dark:text-navy-100">Create New Song</h1>
            <p class="text-slate-600 dark:text-navy-300">Add a new song to the platform</p>
        </div>
        <a href="{{ route('admin.music.songs.index') }}" class="btn bg-slate-150 text-slate-800 hover:bg-slate-200 dark:bg-navy-500 dark:text-navy-50 dark:hover:bg-navy-450">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Songs
        </a>
    </div>

    <div class="card">
        <div class="border-b border-slate-200 p-4 dark:border-navy-500">
            <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Song Information</h3>
        </div>

        <form action="{{ route('admin.music.songs.store') }}" method="POST" enctype="multipart/form-data" class="p-6 space-y-6">
            @csrf

            <!-- Basic Information -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                        Song Title <span class="text-red-500">*</span>
                    </label>
                    <input type="text" name="title" value="{{ old('title') }}" required
                           class="form-input w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                    @error('title')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                        Artist <span class="text-red-500">*</span>
                    </label>
                    <select name="artist_id" required
                            class="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">Select Artist</option>
                        @foreach($artists as $artist)
                            <option value="{{ $artist->id }}" {{ old('artist_id') == $artist->id ? 'selected' : '' }}>
                                {{ $artist->name }}
                            </option>
                        @endforeach
                    </select>
                    @error('artist_id')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Genre <span class="text-red-500">*</span></label>
                    <select name="genre_id" required
                            class="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">Select Genre</option>
                        @foreach($genres as $genre)
                            <option value="{{ $genre->id }}" {{ old('genre_id') == $genre->id ? 'selected' : '' }}>
                                {{ $genre->name }}
                            </option>
                        @endforeach
                    </select>
                    @error('genre_id')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Album (Optional)</label>
                    <select name="album_id"
                            class="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">No Album</option>
                        @foreach($albums as $album)
                            <option value="{{ $album->id }}" {{ old('album_id') == $album->id ? 'selected' : '' }}>
                                {{ $album->title }}
                            </option>
                        @endforeach
                    </select>
                    @error('album_id')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Language <span class="text-red-500">*</span></label>
                    <select name="primary_language" required
                            class="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        @foreach($languages as $language)
                            <option value="{{ $language }}" {{ old('primary_language') == $language ? 'selected' : '' }}>
                                {{ $language }}
                            </option>
                        @endforeach
                    </select>
                    @error('primary_language')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Status <span class="text-red-500">*</span></label>
                    <select name="status" required
                            class="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        @foreach($statuses as $status)
                            <option value="{{ $status }}" {{ old('status', 'draft') == $status ? 'selected' : '' }}>
                                {{ ucfirst($status) }}
                            </option>
                        @endforeach
                    </select>
                    @error('status')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <!-- File Uploads -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                        Audio File <span class="text-red-500">*</span>
                    </label>
                    <input type="file" name="audio_file" accept=".mp3,.wav,.flac,.aac" required
                           class="form-input w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-focus">
                    <p class="text-xs text-slate-500 mt-1">Supported formats: MP3, WAV, FLAC, AAC (max 50MB)</p>
                    @error('audio_file')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Artwork (Optional)</label>
                    <input type="file" name="artwork" accept=".jpg,.jpeg,.png,.webp"
                           class="form-input w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-150 file:text-slate-800 hover:file:bg-slate-200">
                    <p class="text-xs text-slate-500 mt-1">Supported formats: JPG, PNG, WebP (max 10MB)</p>
                    @error('artwork')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <!-- Additional Details -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Track Number</label>
                    <input type="number" name="track_number" value="{{ old('track_number') }}" min="1"
                           class="form-input w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                    @error('track_number')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Duration (seconds)</label>
                    <input type="number" name="duration" value="{{ old('duration') }}" min="1"
                           class="form-input w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                    @error('duration')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Price (UGX)</label>
                    <input type="number" name="price" value="{{ old('price', 0) }}" min="0" step="0.01"
                           class="form-input w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                    @error('price')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <!-- Description and Lyrics -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Description</label>
                    <textarea name="description" rows="4"
                              class="form-textarea w-full rounded-lg border border-slate-300 bg-transparent p-2.5 placeholder:text-slate-400 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">{{ old('description') }}</textarea>
                    @error('description')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Lyrics</label>
                    <textarea name="lyrics" rows="4"
                              class="form-textarea w-full rounded-lg border border-slate-300 bg-transparent p-2.5 placeholder:text-slate-400 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">{{ old('lyrics') }}</textarea>
                    @error('lyrics')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <!-- Options -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="space-y-3">
                    <label class="inline-flex items-center">
                        <input type="checkbox" name="is_free" value="1" {{ old('is_free') ? 'checked' : '' }}
                               class="form-checkbox is-basic size-5 rounded border-slate-400/70 checked:bg-primary checked:border-primary hover:border-primary focus:border-primary dark:border-navy-400 dark:checked:bg-accent dark:checked:border-accent dark:hover:border-accent dark:focus:border-accent">
                        <span class="ml-2 text-sm text-slate-700 dark:text-navy-100">Free to stream</span>
                    </label>

                    <label class="inline-flex items-center">
                        <input type="checkbox" name="is_explicit" value="1" {{ old('is_explicit') ? 'checked' : '' }}
                               class="form-checkbox is-basic size-5 rounded border-slate-400/70 checked:bg-primary checked:border-primary hover:border-primary focus:border-primary dark:border-navy-400 dark:checked:bg-accent dark:checked:border-accent dark:hover:border-accent dark:focus:border-accent">
                        <span class="ml-2 text-sm text-slate-700 dark:text-navy-100">Explicit content</span>
                    </label>

                    <label class="inline-flex items-center">
                        <input type="checkbox" name="allow_downloads" value="1" {{ old('allow_downloads', true) ? 'checked' : '' }}
                               class="form-checkbox is-basic size-5 rounded border-slate-400/70 checked:bg-primary checked:border-primary hover:border-primary focus:border-primary dark:border-navy-400 dark:checked:bg-accent dark:checked:border-accent dark:hover:border-accent dark:focus:border-accent">
                        <span class="ml-2 text-sm text-slate-700 dark:text-navy-100">Allow downloads</span>
                    </label>
                </div>

                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Featured Artists</label>
                        <input type="text" name="featured_artists" value="{{ old('featured_artists') }}"
                               class="form-input w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent"
                               placeholder="e.g., Artist 1, Artist 2">
                        @error('featured_artists')
                            <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Producer Credits</label>
                        <input type="text" name="producer_credits" value="{{ old('producer_credits') }}"
                               class="form-input w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent"
                               placeholder="Producer name">
                        @error('producer_credits')
                            <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                        @enderror
                    </div>
                </div>
            </div>

            <!-- Submit Buttons -->
            <div class="flex items-center justify-end space-x-3 pt-6">
                <a href="{{ route('admin.music.songs.index') }}"
                   class="btn bg-slate-150 text-slate-800 hover:bg-slate-200 dark:bg-navy-500 dark:text-navy-50 dark:hover:bg-navy-450">
                    Cancel
                </a>
                <button type="submit"
                        class="btn bg-primary text-white hover:bg-primary-focus">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Song
                </button>
            </div>
        </form>
    </div>
</div>
@endsection