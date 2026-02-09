@extends('layouts.admin')

@section('title', 'Edit Artist - ' . $artist->stage_name)

@section('content')
<div class="p-6 bg-slate-50 dark:bg-navy-900 min-h-screen" x-data="{ 
    activeTab: 'profile',
    showUploadModal: false,
    uploadType: 'song'
}">
    <!-- Success/Error Messages -->
    @if(session('success'))
        <div class="mb-6 bg-success/10 dark:bg-success/20 border border-success/50 text-success dark:text-success-light px-4 py-3 rounded-lg flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="font-medium">{{ session('success') }}</span>
        </div>
    @endif

    @if(session('error'))
        <div class="mb-6 bg-error/10 dark:bg-error/20 border border-error/50 text-error dark:text-error-light px-4 py-3 rounded-lg flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span class="font-medium">{{ session('error') }}</span>
        </div>
    @endif

    @if($errors->any())
        <div class="mb-6 bg-error/10 dark:bg-error/20 border border-error/50 text-error dark:text-error-light px-4 py-3 rounded-lg">
            <div class="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
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

    <!-- Header -->
    <div class="mb-6">
        <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
                <div class="flex items-center gap-3 mb-2">
                    <a href="{{ route('admin.music.artists.index') }}" 
                       class="inline-flex items-center justify-center size-10 rounded-lg bg-white dark:bg-navy-700 border border-slate-200 dark:border-navy-600 hover:bg-slate-100 dark:hover:bg-navy-600 text-slate-600 dark:text-navy-100 transition-colors shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                        </svg>
                    </a>
                    <div>
                        <h1 class="text-2xl font-bold text-slate-800 dark:text-navy-50">Edit Artist</h1>
                        <p class="text-sm text-slate-500 dark:text-navy-300 mt-0.5">{{ $artist->stage_name }}</p>
                    </div>
                </div>
            </div>
            
            <!-- Quick Action Buttons -->
            <div class="flex gap-2">
                <a href="{{ route('frontend.artist.show', $artist->slug ?? $artist->id) }}" target="_blank"
                   class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-navy-700 border border-slate-200 dark:border-navy-600 hover:bg-slate-50 dark:hover:bg-navy-600 text-slate-700 dark:text-navy-100 transition-colors font-medium shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                    </svg>
                    <span class="hidden sm:inline">View Profile</span>
                </a>
                <button @click="showUploadModal = true; uploadType = 'song'"
                        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-success hover:bg-success-focus dark:bg-success-light dark:hover:bg-success-light/90 text-white transition-colors font-medium shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
                    </svg>
                    <span class="hidden sm:inline">Upload Content</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="mb-6 bg-white dark:bg-navy-800 rounded-lg shadow-sm border border-slate-200 dark:border-navy-700">
        <div class="flex overflow-x-auto border-b border-slate-200 dark:border-navy-600">
            <button @click="activeTab = 'profile'"
                    :class="activeTab === 'profile' ? 'border-primary dark:border-accent text-primary dark:text-accent' : 'border-transparent text-slate-600 dark:text-navy-300 hover:text-slate-800 dark:hover:text-navy-100'"
                    class="flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
                <span>Artist Profile</span>
            </button>
            @if($artist->user)
            <button @click="activeTab = 'account'"
                    :class="activeTab === 'account' ? 'border-primary dark:border-accent text-primary dark:text-accent' : 'border-transparent text-slate-600 dark:text-navy-300 hover:text-slate-800 dark:hover:text-navy-100'"
                    class="flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd" />
                </svg>
                <span>User Account</span>
            </button>
            @endif
            <button @click="activeTab = 'uploads'"
                    :class="activeTab === 'uploads' ? 'border-primary dark:border-accent text-primary dark:text-accent' : 'border-transparent text-slate-600 dark:text-navy-300 hover:text-slate-800 dark:hover:text-navy-100'"
                    class="flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                    <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
                </svg>
                <span>Quick Upload</span>
            </button>
        </div>
    </div>

    <!-- Artist Profile Tab -->
    <div x-show="activeTab === 'profile'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 transform translate-y-2" x-transition:enter-end="opacity-100 transform translate-y-0">
    <!-- Edit Form -->
    <form method="POST" action="{{ route('admin.music.artists.update', $artist) }}" enctype="multipart/form-data" class="space-y-6">
        @csrf
        @method('PUT')

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Column: Main Info -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Basic Information Card -->
                <div class="card bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-lg p-6 shadow-sm">
                    <div class="flex items-center gap-3 mb-5">
                        <div class="flex items-center justify-center size-10 rounded-lg bg-primary/10 dark:bg-primary-light/10">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-primary dark:text-primary-light" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Basic Information</h3>
                    </div>

                    <div class="space-y-5">
                        <!-- User Selection -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                User Account <span class="text-error">*</span>
                            </label>
                            <select name="user_id" required
                                    class="form-select w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-4 py-2.5 text-slate-700 dark:text-navy-100 placeholder-slate-400 dark:placeholder-navy-300 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors @error('user_id') border-error dark:border-error @enderror">
                                @foreach($users as $user)
                                    <option value="{{ $user->id }}" {{ old('user_id', $artist->user_id) == $user->id ? 'selected' : '' }}>
                                        {{ $user->name }} ({{ $user->email }})
                                    </option>
                                @endforeach
                            </select>
                            @error('user_id')
                                <p class="text-error text-sm mt-1.5 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                    </svg>
                                    {{ $message }}
                                </p>
                            @enderror
                        </div>

                        <!-- Stage Name -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Stage Name <span class="text-error">*</span>
                            </label>
                            <input type="text" name="stage_name" required
                                   value="{{ old('stage_name', $artist->stage_name) }}"
                                   placeholder="Enter artist stage name"
                                   class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-4 py-2.5 text-slate-700 dark:text-navy-100 placeholder-slate-400 dark:placeholder-navy-300 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors @error('stage_name') border-error dark:border-error @enderror">
                            @error('stage_name')
                                <p class="text-error text-sm mt-1.5 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                    </svg>
                                    {{ $message }}
                                </p>
                            @enderror
                        </div>

                        <!-- Slug -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Slug (URL)
                            </label>
                            <input type="text" name="slug"
                                   value="{{ old('slug', $artist->slug) }}"
                                   placeholder="artist-url-slug"
                                   class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-4 py-2.5 text-slate-700 dark:text-navy-100 placeholder-slate-400 dark:placeholder-navy-300 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors @error('slug') border-error dark:border-error @enderror">
                            <p class="text-slate-500 dark:text-navy-300 text-xs mt-1.5">Leave empty to auto-generate from stage name</p>
                            @error('slug')
                                <p class="text-error text-sm mt-1.5 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                    </svg>
                                    {{ $message }}
                                </p>
                            @enderror
                        </div>

                        <!-- Bio -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Bio
                            </label>
                            <textarea name="bio" rows="4"
                                      placeholder="Tell us about the artist..."
                                      class="form-textarea w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-4 py-2.5 text-slate-700 dark:text-navy-100 placeholder-slate-400 dark:placeholder-navy-300 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors resize-none @error('bio') border-error dark:border-error @enderror">{{ old('bio', $artist->bio) }}</textarea>
                            @error('bio')
                                <p class="text-error text-sm mt-1.5 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                    </svg>
                                    {{ $message }}
                                </p>
                            @enderror
                        </div>

                        <!-- Country -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Country
                            </label>
                            <select name="country"
                                    class="form-select w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-4 py-2.5 text-slate-700 dark:text-navy-100 placeholder-slate-400 dark:placeholder-navy-300 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors">
                                <option value="">Select Country</option>
                                @foreach($countries as $country)
                                    <option value="{{ $country }}" {{ old('country', $artist->user->country ?? '') == $country ? 'selected' : '' }}>
                                        {{ $country }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Media Card -->
                <div class="card bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-lg p-6 shadow-sm">
                    <div class="flex items-center gap-3 mb-5">
                        <div class="flex items-center justify-center size-10 rounded-lg bg-info/10 dark:bg-info-light/10">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-info dark:text-info-light" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Media</h3>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Avatar -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-3">
                                Avatar
                            </label>
                            <div class="mb-3">
                                <img src="{{ $artist->avatar_url }}" 
                                     alt="Current Avatar" 
                                     class="w-24 h-24 rounded-full object-cover border-2 border-slate-200 dark:border-navy-600 shadow-sm">
                            </div>
                            <input type="file" name="avatar" accept="image/*"
                                   class="block w-full text-sm text-slate-500 dark:text-navy-300
                                          file:mr-4 file:py-2.5 file:px-4
                                          file:rounded-lg file:border-0
                                          file:text-sm file:font-medium
                                          file:bg-primary/10 file:text-primary
                                          dark:file:bg-primary-light/10 dark:file:text-primary-light
                                          hover:file:bg-primary/20 dark:hover:file:bg-primary-light/20
                                          file:cursor-pointer cursor-pointer
                                          file:transition-colors">
                            <p class="text-slate-500 dark:text-navy-300 text-xs mt-2">Max 2MB (JPG, PNG)</p>
                        </div>

                        <!-- Cover Image -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-3">
                                Cover Image
                            </label>
                            @if($artist->cover_image)
                                <div class="mb-3">
                                    <img src="{{ Storage::url($artist->cover_image) }}" 
                                         alt="Current Cover" 
                                         class="w-full h-24 rounded-lg object-cover border border-slate-200 dark:border-navy-600 shadow-sm">
                                </div>
                            @endif
                            <input type="file" name="banner" accept="image/*"
                                   class="block w-full text-sm text-slate-500 dark:text-navy-300
                                          file:mr-4 file:py-2.5 file:px-4
                                          file:rounded-lg file:border-0
                                          file:text-sm file:font-medium
                                          file:bg-primary/10 file:text-primary
                                          dark:file:bg-primary-light/10 dark:file:text-primary-light
                                          hover:file:bg-primary/20 dark:hover:file:bg-primary-light/20
                                          file:cursor-pointer cursor-pointer
                                          file:transition-colors">
                            <p class="text-slate-500 dark:text-navy-300 text-xs mt-2">Max 5MB (JPG, PNG)</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column: Status & Settings -->
            <div class="space-y-6">
                <!-- Status Card -->
                <div class="card bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-lg p-6 shadow-sm">
                    <div class="flex items-center gap-3 mb-5">
                        <div class="flex items-center justify-center size-10 rounded-lg bg-warning/10 dark:bg-warning-light/10">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-warning dark:text-warning-light" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Status</h3>
                    </div>

                    <div class="space-y-5">
                        <!-- Verification Status -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Verification Status
                            </label>
                            <select name="verification_status"
                                    class="form-select w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-4 py-2.5 text-slate-700 dark:text-navy-100 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors">
                                <option value="pending" {{ old('verification_status', $artist->verification_status) == 'pending' ? 'selected' : '' }}>
                                    ⏳ Pending
                                </option>
                                <option value="verified" {{ old('verification_status', $artist->verification_status) == 'verified' ? 'selected' : '' }}>
                                    ✓ Verified
                                </option>
                                <option value="rejected" {{ old('verification_status', $artist->verification_status) == 'rejected' ? 'selected' : '' }}>
                                    ✗ Rejected
                                </option>
                            </select>
                        </div>

                        <!-- Account Status -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Account Status
                            </label>
                            <select name="status"
                                    class="form-select w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-4 py-2.5 text-slate-700 dark:text-navy-100 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors">
                                <option value="active" {{ old('status', $artist->status) == 'active' ? 'selected' : '' }}>
                                    🟢 Active
                                </option>
                                <option value="suspended" {{ old('status', $artist->status) == 'suspended' ? 'selected' : '' }}>
                                    🟡 Suspended
                                </option>
                                <option value="banned" {{ old('status', $artist->status) == 'banned' ? 'selected' : '' }}>
                                    🔴 Banned
                                </option>
                            </select>
                        </div>

                        <!-- Checkboxes -->
                        <div class="space-y-3 pt-2 border-t border-slate-200 dark:border-navy-600">
                            <label class="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" name="is_verified" value="1" {{ old('is_verified', $artist->is_verified) ? 'checked' : '' }}
                                       class="size-5 rounded border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 text-primary dark:text-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors cursor-pointer">
                                <span class="text-sm text-slate-700 dark:text-navy-100 font-medium group-hover:text-primary dark:group-hover:text-accent transition-colors">
                                    Verified Badge
                                </span>
                            </label>

                            <label class="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" name="is_trusted" value="1" {{ old('is_trusted', $artist->is_trusted) ? 'checked' : '' }}
                                       class="size-5 rounded border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 text-primary dark:text-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors cursor-pointer">
                                <span class="text-sm text-slate-700 dark:text-navy-100 font-medium group-hover:text-primary dark:group-hover:text-accent transition-colors">
                                    Trusted Artist
                                </span>
                            </label>

                            <label class="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" name="can_upload" value="1" {{ old('can_upload', $artist->can_upload) ? 'checked' : '' }}
                                       class="size-5 rounded border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 text-primary dark:text-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors cursor-pointer">
                                <span class="text-sm text-slate-700 dark:text-navy-100 font-medium group-hover:text-primary dark:group-hover:text-accent transition-colors">
                                    Can Upload Music
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Settings Card -->
                <div class="card bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-lg p-6 shadow-sm">
                    <div class="flex items-center gap-3 mb-5">
                        <div class="flex items-center justify-center size-10 rounded-lg bg-secondary/10 dark:bg-secondary-light/10">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-secondary dark:text-secondary-light" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Settings</h3>
                    </div>

                    <div class="space-y-5">
                        <!-- Monthly Upload Limit -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Monthly Upload Limit
                            </label>
                            <div class="relative">
                                <input type="number" name="monthly_upload_limit" min="0"
                                       value="{{ old('monthly_upload_limit', $artist->monthly_upload_limit ?? 10) }}"
                                       class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 pl-4 pr-16 py-2.5 text-slate-700 dark:text-navy-100 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors">
                                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <span class="text-slate-500 dark:text-navy-300 text-sm font-medium">songs</span>
                                </div>
                            </div>
                            <p class="text-slate-500 dark:text-navy-300 text-xs mt-1.5">Number of songs allowed per month</p>
                        </div>

                        <!-- Commission Rate -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                                Commission Rate
                            </label>
                            <div class="relative">
                                <input type="number" name="commission_rate" min="0" max="100" step="0.01"
                                       value="{{ old('commission_rate', $artist->commission_rate ?? 30) }}"
                                       class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 pl-4 pr-12 py-2.5 text-slate-700 dark:text-navy-100 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors">
                                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <span class="text-slate-500 dark:text-navy-300 text-sm font-medium">%</span>
                                </div>
                            </div>
                            <p class="text-slate-500 dark:text-navy-300 text-xs mt-1.5">Platform commission on artist earnings</p>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex flex-col gap-3">
                    <button type="submit" 
                            class="w-full bg-success hover:bg-success-focus active:bg-success-focus/90 dark:bg-success-light dark:hover:bg-success-light/90 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                        </svg>
                        <span>Save Changes</span>
                    </button>
                    <a href="{{ route('admin.music.artists.index') }}" 
                       class="w-full bg-slate-200 hover:bg-slate-300 dark:bg-navy-700 dark:hover:bg-navy-600 text-slate-700 dark:text-navy-100 font-medium py-3 px-4 rounded-lg transition-colors text-center">
                        Cancel
                    </a>
                </div>
            </div>
        </div>
    </form>
    </div>

    <!-- User Account Tab -->
    @if($artist->user)
    <div x-show="activeTab === 'account'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 transform translate-y-2" x-transition:enter-end="opacity-100 transform translate-y-0" style="display: none;">
        <form method="POST" action="{{ route('admin.users.update', $artist->user) }}" class="space-y-6">
            @csrf
            @method('PUT')

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- User Information Card -->
                <div class="card bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-lg p-6 shadow-sm">
                    <div class="flex items-center gap-3 mb-5">
                        <div class="flex items-center justify-center size-10 rounded-lg bg-primary/10 dark:bg-primary-light/10">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-primary dark:text-primary-light" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">User Information</h3>
                    </div>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Full Name</label>
                            <input type="text" name="name" value="{{ old('name', $artist->user->name) }}" required
                                   class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-4 py-2.5 text-slate-700 dark:text-navy-100 placeholder-slate-400 dark:placeholder-navy-300 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Email</label>
                            <input type="email" name="email" value="{{ old('email', $artist->user->email) }}" required
                                   class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-4 py-2.5 text-slate-700 dark:text-navy-100 placeholder-slate-400 dark:placeholder-navy-300 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Phone</label>
                            <input type="text" name="phone" value="{{ old('phone', $artist->user->phone) }}"
                                   class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-4 py-2.5 text-slate-700 dark:text-navy-100 placeholder-slate-400 dark:placeholder-navy-300 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Role</label>
                            <select name="role" class="form-select w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-4 py-2.5 text-slate-700 dark:text-navy-100 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors">
                                <option value="user" {{ $artist->user->role === 'user' ? 'selected' : '' }}>User</option>
                                <option value="artist" {{ $artist->user->role === 'artist' ? 'selected' : '' }}>Artist</option>
                                <option value="moderator" {{ $artist->user->role === 'moderator' ? 'selected' : '' }}>Moderator</option>
                                <option value="admin" {{ $artist->user->role === 'admin' ? 'selected' : '' }}>Admin</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Security Card -->
                <div class="card bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-lg p-6 shadow-sm">
                    <div class="flex items-center gap-3 mb-5">
                        <div class="flex items-center justify-center size-10 rounded-lg bg-warning/10 dark:bg-warning-light/10">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-warning dark:text-warning-light" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Security</h3>
                    </div>

                    <div class="space-y-4">
                        <div class="bg-info/10 dark:bg-info/20 border border-info/30 dark:border-info/40 rounded-lg p-3 mb-4">
                            <p class="text-sm text-info dark:text-info-light flex items-start gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                                </svg>
                                <span>Leave password fields empty to keep current password</span>
                            </p>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">New Password</label>
                            <input type="password" name="password" autocomplete="new-password"
                                   placeholder="Enter new password (min 8 characters)"
                                   class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-4 py-2.5 text-slate-700 dark:text-navy-100 placeholder-slate-400 dark:placeholder-navy-300 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Confirm Password</label>
                            <input type="password" name="password_confirmation" autocomplete="new-password"
                                   placeholder="Confirm new password"
                                   class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-4 py-2.5 text-slate-700 dark:text-navy-100 placeholder-slate-400 dark:placeholder-navy-300 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors">
                        </div>

                        <div class="pt-3 border-t border-slate-200 dark:border-navy-600">
                            <label class="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" name="email_verified" value="1" {{ $artist->user->email_verified_at ? 'checked' : '' }}
                                       class="size-5 rounded border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 text-primary dark:text-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors cursor-pointer">
                                <span class="text-sm text-slate-700 dark:text-navy-100 font-medium group-hover:text-primary dark:group-hover:text-accent transition-colors">
                                    Email Verified
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Save Button -->
            <div class="flex justify-end gap-3">
                <button type="submit" 
                        class="inline-flex items-center gap-2 px-6 py-3 bg-success hover:bg-success-focus dark:bg-success-light dark:hover:bg-success-light/90 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                    </svg>
                    <span>Update User Account</span>
                </button>
            </div>
        </form>
    </div>
    @endif

    <!-- Quick Upload Tab -->
    <div x-show="activeTab === 'uploads'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 transform translate-y-2" x-transition:enter-end="opacity-100 transform translate-y-0" style="display: none;">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Upload Song Card -->
            <div class="card bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-lg p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-5">
                    <div class="flex items-center justify-center size-12 rounded-lg bg-primary/10 dark:bg-primary-light/10">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-primary dark:text-primary-light" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Upload Song</h3>
                        <p class="text-sm text-slate-500 dark:text-navy-300">Add a new track</p>
                    </div>
                </div>

                <form action="{{ route('admin.music.songs.store') }}" method="POST" enctype="multipart/form-data" class="space-y-4">
                    @csrf
                    <input type="hidden" name="artist_id" value="{{ $artist->id }}">
                    <input type="hidden" name="is_free" value="0">
                    <input type="hidden" name="is_downloadable" value="1">
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Song Title *</label>
                        <input type="text" name="title" required placeholder="Enter song title"
                               class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-4 py-2.5 text-slate-700 dark:text-navy-100 placeholder-slate-400 dark:placeholder-navy-300 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Audio File * (MP3, WAV, FLAC)</label>
                        <input type="file" name="audio_file_original" required accept="audio/mpeg,audio/wav,audio/flac,audio/aac,audio/m4a"
                               class="block w-full text-sm text-slate-500 dark:text-navy-300
                                      file:mr-4 file:py-2.5 file:px-4
                                      file:rounded-lg file:border-0
                                      file:text-sm file:font-medium
                                      file:bg-primary file:text-white
                                      dark:file:bg-primary-light
                                      hover:file:bg-primary-focus dark:hover:file:bg-primary-light/90
                                      file:cursor-pointer cursor-pointer
                                      file:transition-colors">
                        <p class="text-xs text-slate-500 dark:text-navy-300 mt-1.5">Maximum file size: 50MB</p>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Genre *</label>
                            <select name="genre_id" required class="form-select w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 text-sm text-slate-700 dark:text-navy-100 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors">
                                <option value="">Select Genre</option>
                                @foreach(\App\Models\Genre::all() as $genre)
                                    <option value="{{ $genre->id }}">{{ $genre->name }}</option>
                                @endforeach
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Language *</label>
                            <select name="language" required class="form-select w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 text-sm text-slate-700 dark:text-navy-100 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors">
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

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Status *</label>
                            <select name="status" required class="form-select w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 text-sm text-slate-700 dark:text-navy-100 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors">
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                                <option value="pending_review">Pending Review</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Release Date</label>
                            <input type="date" name="release_date" value="{{ now()->format('Y-m-d') }}"
                                   class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 text-sm text-slate-700 dark:text-navy-100 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Artwork (Optional)</label>
                        <input type="file" name="artwork" accept="image/jpeg,image/png,image/jpg,image/webp"
                               class="block w-full text-sm text-slate-500 dark:text-navy-300
                                      file:mr-4 file:py-2 file:px-3
                                      file:rounded-lg file:border-0
                                      file:text-sm file:font-medium
                                      file:bg-slate-100 file:text-slate-700
                                      dark:file:bg-navy-600 dark:file:text-navy-100
                                      hover:file:bg-slate-200 dark:hover:file:bg-navy-500
                                      file:cursor-pointer cursor-pointer
                                      file:transition-colors">
                        <p class="text-xs text-slate-500 dark:text-navy-300 mt-1.5">JPG, PNG, WEBP - Max 10MB</p>
                    </div>

                    <div class="flex items-center gap-4">
                        <label class="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" name="is_explicit" value="1"
                                   class="size-4 rounded border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 text-primary dark:text-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors cursor-pointer">
                            <span class="text-sm text-slate-700 dark:text-navy-100">Explicit Content</span>
                        </label>
                    </div>

                    <button type="submit"
                            class="w-full bg-primary hover:bg-primary-focus dark:bg-accent dark:hover:bg-accent-focus text-white font-medium py-2.5 px-4 rounded-lg transition-colors">
                        Upload Song
                    </button>
                </form>
            </div>

            <!-- Upload Album Card -->
            <div class="card bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-lg p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-5">
                    <div class="flex items-center justify-center size-12 rounded-lg bg-info/10 dark:bg-info-light/10">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-info dark:text-info-light" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                            <path fill-rule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Upload Album</h3>
                        <p class="text-sm text-slate-500 dark:text-navy-300">Create a new album</p>
                    </div>
                </div>

                <form action="{{ route('admin.music.albums.store') }}" method="POST" enctype="multipart/form-data" class="space-y-4">
                    @csrf
                    <input type="hidden" name="artist_id" value="{{ $artist->id }}">
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Album Title *</label>
                        <input type="text" name="title" required placeholder="Enter album title"
                               class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-4 py-2.5 text-slate-700 dark:text-navy-100 placeholder-slate-400 dark:placeholder-navy-300 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Description</label>
                        <textarea name="description" rows="3" placeholder="Describe the album..."
                                  class="form-textarea w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-4 py-2.5 text-slate-700 dark:text-navy-100 placeholder-slate-400 dark:placeholder-navy-300 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors resize-none"></textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Release Date *</label>
                            <input type="date" name="release_date" required value="{{ now()->format('Y-m-d') }}"
                                   class="form-input w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 text-sm text-slate-700 dark:text-navy-100 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Type</label>
                            <select name="album_type" class="form-select w-full rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 text-sm text-slate-700 dark:text-navy-100 hover:border-slate-400 dark:hover:border-navy-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors">
                                <option value="album">Album</option>
                                <option value="single">Single</option>
                                <option value="ep">EP</option>
                                <option value="compilation">Compilation</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Album Artwork * (Min 3000x3000px)</label>
                        <input type="file" name="cover_image" required accept="image/*"
                               class="block w-full text-sm text-slate-500 dark:text-navy-300
                                      file:mr-4 file:py-2.5 file:px-4
                                      file:rounded-lg file:border-0
                                      file:text-sm file:font-medium
                                      file:bg-info file:text-white
                                      dark:file:bg-info-light
                                      hover:file:bg-info-focus dark:hover:file:bg-info-light/90
                                      file:cursor-pointer cursor-pointer
                                      file:transition-colors">
                    </div>

                    <div class="bg-info/10 dark:bg-info/20 border border-info/30 dark:border-info/40 rounded-lg p-3">
                        <p class="text-xs text-info dark:text-info-light flex items-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                            </svg>
                            <span>Album will be created. Add songs from the album details page.</span>
                        </p>
                    </div>

                    <button type="submit"
                            class="w-full bg-info hover:bg-info-focus dark:bg-info-light dark:hover:bg-info-light/90 text-white font-medium py-2.5 px-4 rounded-lg transition-colors">
                        Create Album
                    </button>
                </form>
            </div>
        </div>
    </div>

    {{-- Upload Modal --}}
    @include('backend.admin.music.artists._upload-modal')
</div>
@endsection
