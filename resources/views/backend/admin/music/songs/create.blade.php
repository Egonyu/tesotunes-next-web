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

    <!-- Error Messages -->
    @if(session('error'))
        <div class="alert mb-6 flex items-center gap-3 rounded-lg border border-error bg-error/10 px-4 py-3 text-error dark:border-error/50 dark:bg-error/20">
            <svg class="size-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{{ session('error') }}</span>
        </div>
    @endif

    @if($errors->any())
        <div class="alert mb-6 rounded-lg border border-error bg-error/10 px-4 py-3 text-error dark:border-error/50 dark:bg-error/20">
            <div class="flex items-start gap-3">
                <svg class="size-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div class="flex-1">
                    <p class="font-semibold mb-2">Please fix the following errors:</p>
                    <ul class="space-y-1 text-sm">
                        @foreach($errors->all() as $error)
                            <li class="flex items-start gap-2">
                                <span class="text-error/70">•</span>
                                <span>{{ $error }}</span>
                            </li>
                        @endforeach
                    </ul>
                </div>
            </div>
        </div>
    @endif

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
                    <select name="artist_id" id="artist-select" required
                            class="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">Search for an artist...</option>
                        @if(old('artist_id'))
                            @php
                                $selectedArtist = $artists->firstWhere('id', old('artist_id'));
                            @endphp
                            @if($selectedArtist)
                                <option value="{{ $selectedArtist->id }}" selected>
                                    {{ $selectedArtist->stage_name ?? $selectedArtist->name }}
                                </option>
                            @endif
                        @elseif(isset($preselectedArtist))
                            <option value="{{ $preselectedArtist->id }}" selected>
                                {{ $preselectedArtist->stage_name ?? $preselectedArtist->name }}
                            </option>
                        @endif
                    </select>
                    <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">
                        <svg class="inline size-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Start typing to search for an artist
                    </p>
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
                    <select name="language" required
                            class="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        @foreach($languages as $language)
                            <option value="{{ $language }}" {{ old('language') == $language ? 'selected' : '' }}>
                                {{ $language }}
                            </option>
                        @endforeach
                    </select>
                    @error('language')
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
                    <input type="file" name="audio_file_original" accept=".mp3,.wav,.flac,.aac,.m4a" required
                           class="form-input w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-focus">
                    <p class="text-xs text-slate-500 mt-1">Supported formats: MP3, WAV, FLAC, AAC, M4A (max 50MB)</p>
                    @error('audio_file_original')
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
                    <input type="number" name="track_number" value="{{ old('track_number') }}" min="1" placeholder="Optional"
                           class="form-input w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                    @error('track_number')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                        Duration (seconds)
                        <span class="text-xs font-normal text-slate-500 dark:text-navy-400">(Optional)</span>
                    </label>
                    <input type="number" name="duration" value="{{ old('duration') }}" min="1" placeholder="Auto-detected"
                           class="form-input w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                    <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">
                        <svg class="inline size-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Auto-detected from audio file
                    </p>
                    @error('duration')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Price (UGX)</label>
                    <input type="number" name="price" value="{{ old('price', 0) }}" min="0" step="100" placeholder="0 for free"
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

@push('head')
<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
<style>
    /* Select2 Custom Styling */
    .select2-container--default .select2-selection--single {
        height: 42px !important;
        padding: 6px 12px !important;
        border: 1px solid rgb(203 213 225) !important;
        border-radius: 0.5rem !important;
        background-color: white !important;
    }

    .select2-container--default .select2-selection--single .select2-selection__rendered {
        line-height: 30px !important;
        color: rgb(51 65 85) !important;
        padding-left: 0 !important;
    }

    .select2-container--default .select2-selection--single .select2-selection__arrow {
        height: 40px !important;
        right: 8px !important;
    }

    .select2-container--default .select2-selection--single .select2-selection__placeholder {
        color: rgb(148 163 184) !important;
    }

    /* Dropdown styling */
    .select2-dropdown {
        border-radius: 0.5rem !important;
        border: 1px solid rgb(203 213 225) !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
    }

    .select2-container--default .select2-search--dropdown .select2-search__field {
        border: 1px solid rgb(203 213 225) !important;
        border-radius: 0.375rem !important;
        padding: 6px 12px !important;
    }

    .select2-container--default .select2-results__option {
        padding: 8px 12px !important;
    }

    .select2-container--default .select2-results__option--highlighted[aria-selected] {
        background-color: rgb(99 102 241) !important;
        color: white !important;
    }

    .select2-container--default .select2-results__option[aria-selected=true] {
        background-color: rgb(224 231 255) !important;
        color: rgb(79 70 229) !important;
    }

    /* Dark mode support */
    .dark .select2-container--default .select2-selection--single {
        background-color: rgb(30 41 59) !important;
        border-color: rgb(71 85 105) !important;
    }

    .dark .select2-container--default .select2-selection--single .select2-selection__rendered {
        color: rgb(226 232 240) !important;
    }

    .dark .select2-dropdown {
        background-color: rgb(30 41 59) !important;
        border-color: rgb(71 85 105) !important;
    }

    .dark .select2-container--default .select2-search--dropdown .select2-search__field {
        background-color: rgb(51 65 85) !important;
        border-color: rgb(71 85 105) !important;
        color: rgb(226 232 240) !important;
    }

    .dark .select2-container--default .select2-results__option {
        color: rgb(226 232 240) !important;
    }

    .dark .select2-container--default .select2-results__option--highlighted[aria-selected] {
        background-color: rgb(99 102 241) !important;
    }

    .dark .select2-container--default .select2-results__option[aria-selected=true] {
        background-color: rgb(55 65 81) !important;
    }

    /* Loading state */
    .select2-container--default .select2-results__option--loading {
        padding: 12px !important;
    }
</style>
@endpush

@push('scripts')
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
<script>
    $(document).ready(function() {
        console.log('Initializing Select2 for artist selection...');

        $('#artist-select').select2({
            placeholder: 'Search for an artist...',
            allowClear: true,
            width: '100%',
            minimumInputLength: 0,
            language: {
                inputTooShort: function() {
                    return 'Start typing to search...';
                },
                searching: function() {
                    return 'Searching artists...';
                },
                noResults: function() {
                    return 'No artists found';
                },
                errorLoading: function() {
                    return 'Error loading artists. Please try again.';
                }
            },
            ajax: {
                url: '{{ route("admin.music.ajax.search-artists") }}',
                dataType: 'json',
                delay: 250,
                headers: {
                    'X-CSRF-TOKEN': '{{ csrf_token() }}'
                },
                data: function (params) {
                    console.log('Search term:', params.term);
                    return {
                        q: params.term || '',
                        page: params.page || 1
                    };
                },
                processResults: function (data, params) {
                    console.log('API response:', data);
                    params.page = params.page || 1;

                    return {
                        results: data.results,
                        pagination: {
                            more: data.pagination.more
                        }
                    };
                },
                error: function(xhr, status, error) {
                    console.error('AJAX Error:', {xhr, status, error});
                    console.error('Response:', xhr.responseText);
                },
                cache: true
            },
            templateResult: function(artist) {
                if (artist.loading) {
                    return artist.text;
                }
                return $('<span>' + artist.text + '</span>');
            },
            templateSelection: function(artist) {
                return artist.text || artist.stage_name || 'Select an artist';
            }
        });

        // Log when dropdown opens
        $('#artist-select').on('select2:open', function() {
            console.log('Select2 dropdown opened');
        });

        // Log when selection changes
        $('#artist-select').on('select2:select', function(e) {
            console.log('Artist selected:', e.params.data);
        });
    });
</script>
@endpush