{{-- Upload Modal for Admin to Upload Songs/Albums for Artist --}}
<div x-show="showUploadModal"
     x-cloak
     @keydown.escape.window="showUploadModal = false"
     class="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
     role="dialog">
    <!-- Backdrop -->
    <div x-show="showUploadModal"
         @click="showUploadModal = false"
         x-transition:enter="ease-out duration-200"
         x-transition:enter-start="opacity-0"
         x-transition:enter-end="opacity-100"
         x-transition:leave="ease-in duration-100"
         x-transition:leave-start="opacity-100"
         x-transition:leave-end="opacity-0"
         class="fixed inset-0 bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity"></div>

    <!-- Modal -->
    <div x-show="showUploadModal"
         x-transition:enter="ease-out duration-200"
         x-transition:enter-start="opacity-0 scale-95"
         x-transition:enter-end="opacity-100 scale-100"
         x-transition:leave="ease-in duration-100"
         x-transition:leave-start="opacity-100 scale-100"
         x-transition:leave-end="opacity-0 scale-95"
         class="relative w-full max-w-2xl origin-top rounded-lg bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-xl transition-all">
        
        <!-- Modal Header -->
        <div class="flex justify-between items-center rounded-t-lg bg-slate-50 dark:bg-navy-700 px-4 py-3 sm:px-5 border-b border-slate-200 dark:border-navy-600">
            <h3 class="text-base font-semibold text-slate-800 dark:text-navy-50">
                <span x-show="uploadType === 'song'">Upload Song for {{ $artist->stage_name }}</span>
                <span x-show="uploadType === 'album'">Upload Album for {{ $artist->stage_name }}</span>
            </h3>
            <button @click="showUploadModal = false"
                    class="inline-flex items-center justify-center size-8 rounded-full hover:bg-slate-200 dark:hover:bg-navy-600 text-slate-500 dark:text-navy-300 hover:text-slate-700 dark:hover:text-navy-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>

        <!-- Modal Body -->
        <div class="px-4 py-5 sm:px-5 bg-white dark:bg-navy-800">
            <!-- Upload Type Toggle -->
            <div class="mb-6 flex gap-3">
                <button @click="uploadType = 'song'"
                        :class="uploadType === 'song' ? 'bg-primary hover:bg-primary-focus dark:bg-accent dark:hover:bg-accent-focus text-white shadow-sm' : 'bg-slate-100 dark:bg-navy-600 hover:bg-slate-200 dark:hover:bg-navy-500 text-slate-700 dark:text-navy-100'"
                        class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                    </svg>
                    <span>Upload Song</span>
                </button>
                <button @click="uploadType = 'album'"
                        :class="uploadType === 'album' ? 'bg-primary hover:bg-primary-focus dark:bg-accent dark:hover:bg-accent-focus text-white shadow-sm' : 'bg-slate-100 dark:bg-navy-600 hover:bg-slate-200 dark:hover:bg-navy-500 text-slate-700 dark:text-navy-100'"
                        class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                        <path fill-rule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clip-rule="evenodd" />
                    </svg>
                    <span>Upload Album</span>
                </button>
            </div>

            <!-- Song Upload Form -->
            <div x-show="uploadType === 'song'">
                <form action="{{ route('admin.music.songs.store') }}" method="POST" enctype="multipart/form-data">
                    @csrf
                    <input type="hidden" name="artist_id" value="{{ $artist->id }}">
                    <input type="hidden" name="is_free" value="0">
                    <input type="hidden" name="is_downloadable" value="1">
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Song Title *</label>
                            <input type="text" name="title" required
                                   class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 placeholder:text-slate-400 dark:placeholder:text-navy-300 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent transition-colors">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Audio File * (MP3, WAV, FLAC - Max 50MB)</label>
                            <input type="file" name="audio_file_original" required accept="audio/mpeg,audio/wav,audio/flac,audio/aac,audio/m4a"
                                   class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:py-1 file:px-4 file:text-sm file:text-white dark:file:bg-accent file:font-medium hover:file:bg-primary-focus dark:hover:file:bg-accent-focus transition-colors">
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Genre *</label>
                                <select name="genre_id" required class="form-select w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent transition-colors">
                                    <option value="">Select Genre</option>
                                    @foreach(\App\Models\Genre::all() as $genre)
                                        <option value="{{ $genre->id }}">{{ $genre->name }}</option>
                                    @endforeach
                                </select>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Language *</label>
                                <select name="language" required class="form-select w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent transition-colors">
                                    <option value="">Select Language</option>
                                    <option value="English">English</option>
                                    <option value="Luganda">Luganda</option>
                                    <option value="Swahili">Swahili</option>
                                    <option value="Runyankole">Runyankole</option>
                                    <option value="Acholi">Acholi</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Status *</label>
                                <select name="status" required class="form-select w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent transition-colors">
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                    <option value="pending_review">Pending Review</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Release Date</label>
                                <input type="date" name="release_date" value="{{ now()->format('Y-m-d') }}"
                                       class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent transition-colors">
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Artwork (Optional)</label>
                            <input type="file" name="artwork" accept="image/jpeg,image/png,image/jpg,image/webp"
                                   class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 dark:file:bg-navy-600 file:py-1 file:px-4 file:text-sm file:font-medium hover:file:bg-slate-200 dark:hover:file:bg-navy-500 transition-colors">
                        </div>

                        <div>
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" name="is_explicit" value="1"
                                       class="form-checkbox size-5 rounded border-slate-400/70 dark:border-navy-400 bg-slate-100 dark:bg-navy-900">
                                <span class="text-sm text-slate-700 dark:text-navy-100">Explicit Content</span>
                            </label>
                        </div>
                    </div>

                    <div class="mt-6 flex justify-end gap-2">
                        <button type="button" @click="showUploadModal = false"
                                class="btn bg-slate-150 dark:bg-navy-600 font-medium text-slate-800 dark:text-navy-100 hover:bg-slate-200 dark:hover:bg-navy-500 focus:bg-slate-200 dark:focus:bg-navy-500 active:bg-slate-200/80 dark:active:bg-navy-500/80 px-4 py-2.5 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button type="submit"
                                class="btn bg-primary dark:bg-accent font-medium text-white hover:bg-primary-focus dark:hover:bg-accent-focus focus:bg-primary-focus dark:focus:bg-accent-focus active:bg-primary-focus/90 dark:active:bg-accent/90 px-4 py-2.5 rounded-lg transition-colors">
                            Upload Song
                        </button>
                    </div>
                </form>
            </div>

            <!-- Album Upload Form -->
            <div x-show="uploadType === 'album'" style="display: none;">
                <form action="{{ route('admin.music.albums.store') }}" method="POST" enctype="multipart/form-data">
                    @csrf
                    <input type="hidden" name="artist_id" value="{{ $artist->id }}">
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100">Album Title *</label>
                            <input type="text" name="title" required
                                   class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100">Description</label>
                            <textarea name="description" rows="3"
                                      class="form-textarea mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent"></textarea>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-navy-100">Release Date *</label>
                                <input type="date" name="release_date" required value="{{ now()->format('Y-m-d') }}"
                                       class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-navy-100">Type</label>
                                <select name="album_type" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-navy-450 dark:bg-navy-700">
                                    <option value="album">Album</option>
                                    <option value="single">Single</option>
                                    <option value="ep">EP</option>
                                    <option value="compilation">Compilation</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100">Album Artwork *</label>
                            <input type="file" name="cover_image" required accept="image/*"
                                   class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:py-1 file:px-4 file:text-sm file:text-white file:font-medium hover:file:bg-primary-focus">
                            <p class="mt-1 text-xs text-slate-400">Minimum 3000x3000px for best quality</p>
                        </div>

                        <div class="bg-info/10 border border-info/30 rounded-lg p-4">
                            <p class="text-sm text-info">
                                <svg xmlns="http://www.w3.org/2000/svg" class="inline size-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                                </svg>
                                Album created. You can add songs to it from the album details page.
                            </p>
                        </div>
                    </div>

                    <div class="mt-6 flex justify-end gap-2">
                        <button type="button" @click="showUploadModal = false"
                                class="btn bg-slate-150 dark:bg-navy-600 font-medium text-slate-800 dark:text-navy-100 hover:bg-slate-200 dark:hover:bg-navy-500 px-4 py-2.5 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button type="submit"
                                class="btn bg-primary dark:bg-accent font-medium text-white hover:bg-primary-focus dark:hover:bg-accent-focus px-4 py-2.5 rounded-lg transition-colors">
                            Create Album
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
