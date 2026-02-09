@extends('layouts.admin')

@section('title', 'Edit Song - ' . $song->title)

@section('content')
<div class="flex items-center justify-between mb-5">
    <h1 class="text-2xl font-semibold text-slate-700 dark:text-navy-100">Edit Song</h1>
    <div class="flex space-x-2">
        <a href="{{ route('admin.music.songs.show', $song) }}" class="btn bg-slate-150 hover:bg-slate-200 text-slate-800 dark:bg-navy-500 dark:hover:bg-navy-450 dark:text-navy-50">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Song
        </a>
        <a href="{{ route('admin.music.songs.index') }}" class="btn bg-slate-150 hover:bg-slate-200 text-slate-800 dark:bg-navy-500 dark:hover:bg-navy-450 dark:text-navy-50">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Songs
        </a>
    </div>
</div>

<form action="{{ route('admin.music.songs.update', $song) }}" method="POST" enctype="multipart/form-data">
    @csrf
    @method('PUT')

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Form -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Basic Information -->
            <div class="card p-6">
                <h2 class="text-lg font-semibold text-slate-700 dark:text-navy-100 mb-4">Basic Information</h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">
                            Song Title <span class="text-error">*</span>
                        </label>
                        <input type="text" name="title" value="{{ old('title', $song->title) }}" required
                               class="form-input w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent @error('title') border-error @enderror">
                        @error('title')
                            <span class="text-error text-sm mt-1">{{ $message }}</span>
                        @enderror
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">
                            Artist <span class="text-error">*</span>
                        </label>
                        <select name="artist_id" required
                                class="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent @error('artist_id') border-error @enderror">
                            @foreach(\App\Models\Artist::all() as $artist)
                                <option value="{{ $artist->id }}" {{ old('artist_id', $song->artist_id) == $artist->id ? 'selected' : '' }}>
                                    {{ $artist->stage_name }}
                                </option>
                            @endforeach
                        </select>
                        @error('artist_id')
                            <span class="text-error text-sm mt-1">{{ $message }}</span>
                        @enderror
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">
                            Genre <span class="text-error">*</span>
                        </label>
                        <select name="genre_id" required
                                class="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent @error('genre_id') border-error @enderror">
                            <option value="">Select Genre</option>
                            @foreach(\App\Models\Genre::all() as $genre)
                                <option value="{{ $genre->id }}" {{ old('genre_id', $song->primary_genre_id) == $genre->id ? 'selected' : '' }}>
                                    {{ $genre->name }}
                                </option>
                            @endforeach
                        </select>
                        @error('genre_id')
                            <span class="text-error text-sm mt-1">{{ $message }}</span>
                        @enderror
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">
                            Duration (seconds) <span class="text-error">*</span>
                        </label>
                        <input type="number" name="duration_seconds" value="{{ old('duration_seconds', $song->duration_seconds) }}" required min="1"
                               class="form-input w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent @error('duration_seconds') border-error @enderror">
                        @error('duration_seconds')
                            <span class="text-error text-sm mt-1">{{ $message }}</span>
                        @enderror
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">
                            Status <span class="text-error">*</span>
                        </label>
                        <select name="status" required
                                class="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent @error('status') border-error @enderror">
                            <option value="draft" {{ old('status', $song->status) === 'draft' ? 'selected' : '' }}>Draft</option>
                            <option value="pending" {{ old('status', $song->status) === 'pending' ? 'selected' : '' }}>Pending Review</option>
                            <option value="published" {{ old('status', $song->status) === 'published' ? 'selected' : '' }}>Published</option>
                            <option value="rejected" {{ old('status', $song->status) === 'rejected' ? 'selected' : '' }}>Rejected</option>
                        </select>
                        @error('status')
                            <span class="text-error text-sm mt-1">{{ $message }}</span>
                        @enderror
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Price (UGX)</label>
                        <input type="number" name="price" value="{{ old('price', $song->price) }}" min="0" step="0.01"
                               class="form-input w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent @error('price') border-error @enderror">
                        @error('price')
                            <span class="text-error text-sm mt-1">{{ $message }}</span>
                        @enderror
                    </div>

                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Description</label>
                        <textarea name="description" rows="4"
                                  class="form-textarea w-full resize-none rounded-lg border border-slate-300 bg-transparent p-2.5 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent @error('description') border-error @enderror">{{ old('description', $song->description) }}</textarea>
                        @error('description')
                            <span class="text-error text-sm mt-1">{{ $message }}</span>
                        @enderror
                    </div>
                </div>
            </div>

            <!-- Additional Details -->
            <div class="card p-6">
                <h2 class="text-lg font-semibold text-slate-700 dark:text-navy-100 mb-4">Additional Details</h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Featured Artists</label>
                        <input type="text" name="featured_artists" value="{{ old('featured_artists', is_array($song->featured_artists) ? implode(', ', $song->featured_artists) : $song->featured_artists) }}"
                               class="form-input w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent"
                               placeholder="Comma-separated list of featured artists">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Primary Language</label>
                        <input type="text" name="primary_language" value="{{ old('primary_language', $song->primary_language) }}"
                               class="form-input w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent"
                               placeholder="e.g., English, Luganda, Swahili">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Release Date</label>
                        <input type="date" name="release_date" value="{{ old('release_date', $song->release_date ? $song->release_date->format('Y-m-d') : '') }}"
                               class="form-input w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">ISRC Code</label>
                        <input type="text" name="isrc_code" value="{{ old('isrc_code', $song->isrc_code) }}"
                               class="form-input w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent"
                               placeholder="e.g., USRC17607839">
                    </div>
                </div>

                <!-- Checkboxes -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <label class="inline-flex items-center space-x-2">
                        <input type="checkbox" name="is_explicit" value="1" {{ old('is_explicit', $song->is_explicit) ? 'checked' : '' }}
                               class="form-checkbox is-basic size-5 rounded border-slate-400/70 bg-slate-100 checked:bg-primary checked:border-primary hover:border-primary focus:border-primary dark:border-navy-400 dark:bg-navy-700 dark:checked:bg-accent dark:checked:border-accent dark:hover:border-accent dark:focus:border-accent">
                        <span class="text-slate-600 dark:text-navy-300">Explicit Content</span>
                    </label>

                    <label class="inline-flex items-center space-x-2">
                        <input type="checkbox" name="is_downloadable" value="1" {{ old('is_downloadable', $song->is_downloadable) ? 'checked' : '' }}
                               class="form-checkbox is-basic size-5 rounded border-slate-400/70 bg-slate-100 checked:bg-primary checked:border-primary hover:border-primary focus:border-primary dark:border-navy-400 dark:bg-navy-700 dark:checked:bg-accent dark:checked:border-accent dark:hover:border-accent dark:focus:border-accent">
                        <span class="text-slate-600 dark:text-navy-300">Allow Downloads</span>
                    </label>

                    <label class="inline-flex items-center space-x-2">
                        <input type="checkbox" name="is_free" value="1" {{ old('is_free', $song->is_free) ? 'checked' : '' }}
                               class="form-checkbox is-basic size-5 rounded border-slate-400/70 bg-slate-100 checked:bg-primary checked:border-primary hover:border-primary focus:border-primary dark:border-navy-400 dark:bg-navy-700 dark:checked:bg-accent dark:checked:border-accent dark:hover:border-accent dark:focus:border-accent">
                        <span class="text-slate-600 dark:text-navy-300">Free Track</span>
                    </label>
                </div>
            </div>

            <!-- Audio File Upload -->
            <div class="card p-6">
                <h2 class="text-lg font-semibold text-slate-700 dark:text-navy-100 mb-4">Audio File</h2>
                
                <div class="mb-4">
                    <div class="bg-info/10 border border-info/30 rounded-lg p-4 mb-4">
                        <p class="text-sm text-info flex items-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                            </svg>
                            <span>Current audio file: <strong>{{ basename($song->audio_file_original ?? 'No file') }}</strong>. Upload a new file to replace it.</span>
                        </p>
                    </div>
                    
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">
                        Upload New Audio File (Optional)
                    </label>
                    <input type="file" name="audio_file_original" accept="audio/mpeg,audio/wav,audio/flac,audio/aac,audio/m4a"
                           class="block w-full text-sm text-slate-500 dark:text-navy-300
                                  file:mr-4 file:py-2.5 file:px-4
                                  file:rounded-lg file:border-0
                                  file:text-sm file:font-medium
                                  file:bg-primary file:text-white
                                  dark:file:bg-accent
                                  hover:file:bg-primary-focus dark:hover:file:bg-accent-focus
                                  file:cursor-pointer cursor-pointer
                                  file:transition-colors">
                    <p class="text-xs text-slate-500 dark:text-navy-300 mt-2">MP3, WAV, FLAC, AAC, M4A - Max 50MB</p>
                    @error('audio_file_original')
                        <span class="text-error text-sm mt-1">{{ $message }}</span>
                    @enderror
                </div>
            </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
            <!-- Current Artwork -->
            <div class="card p-6">
                <h3 class="text-lg font-semibold text-slate-700 dark:text-navy-100 mb-4">Current Artwork</h3>
                <div class="aspect-square bg-slate-150 dark:bg-navy-800 rounded-lg overflow-hidden mb-4">
                    @if($song->artwork_url)
                        <img src="{{ $song->artwork_url }}" alt="{{ $song->title }}" class="w-full h-full object-cover" onerror="this.src='/images/default-track.svg'">
                    @else
                        <div class="w-full h-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-16 text-slate-400 dark:text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                        </div>
                    @endif
                </div>

                <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Upload New Artwork</label>
                <input type="file" name="artwork" accept="image/*"
                       class="form-input file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-focus dark:file:bg-accent dark:hover:file:bg-accent-focus w-full">
                <p class="text-xs text-slate-500 dark:text-navy-300 mt-1">JPG, PNG files. Max size: 2MB. Recommended: 400x400px</p>
            </div>

            <!-- Artist Info -->
            <div class="card p-6">
                <h3 class="text-lg font-semibold text-slate-700 dark:text-navy-100 mb-4">Artist Information</h3>
                <div class="space-y-2">
                    <div>
                        <label class="block text-xs font-medium text-slate-500 dark:text-navy-300">Artist</label>
                        <p class="text-sm text-slate-700 dark:text-navy-100">{{ $song->artist->stage_name ?? $song->artist->name ?? 'Unknown Artist' }}</p>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-slate-500 dark:text-navy-300">Email</label>
                        <p class="text-sm text-slate-700 dark:text-navy-100">{{ $song->artist->user->email ?? 'No email' }}</p>
                    </div>
                </div>
            </div>

            <!-- File Info -->
            <div class="card p-6">
                <h3 class="text-lg font-semibold text-slate-700 dark:text-navy-100 mb-4">File Information</h3>
                <div class="space-y-2">
                    <div>
                        <label class="block text-xs font-medium text-slate-500 dark:text-navy-300">Original Filename</label>
                        <p class="text-sm text-slate-700 dark:text-navy-100">{{ $song->original_filename ?: 'N/A' }}</p>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-slate-500 dark:text-navy-300">File Size</label>
                        <p class="text-sm text-slate-700 dark:text-navy-100">{{ $song->file_size_bytes ? number_format($song->file_size_bytes / 1024 / 1024, 2) . ' MB' : 'N/A' }}</p>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-slate-500 dark:text-navy-300">Duration</label>
                        <p class="text-sm text-slate-700 dark:text-navy-100">{{ $song->duration_formatted ?: 'Unknown' }}</p>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="card p-6">
                <button type="submit" class="btn w-full bg-primary hover:bg-primary-focus text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Update Song
                </button>
            </div>
        </div>
    </div>
</form>
@endsection