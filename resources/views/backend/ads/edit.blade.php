@extends('layouts.admin')

@section('title', 'Edit Ad')

@section('content')
<div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Edit Ad</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Update advertising campaign</p>
        </div>
        <div class="flex gap-3">
            <a href="{{ route('backend.ads.show', $ad) }}" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white flex items-center gap-2">
                <span class="material-icons-round text-sm">visibility</span>
                View Ad
            </a>
            <a href="{{ route('backend.ads.index') }}" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white flex items-center gap-2">
                <span class="material-icons-round text-sm">arrow_back</span>
                Back to Ads
            </a>
        </div>
    </div>

    <!-- Form -->
    <form method="POST" action="{{ route('backend.ads.update', $ad) }}" enctype="multipart/form-data" 
          x-data="{ type: '{{ $ad->type }}', placement: '{{ $ad->placement }}' }" 
          class="max-w-4xl mx-auto">
        @csrf
        @method('PUT')

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <!-- Basic Info -->
            <div class="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Basic Information</h2>
                
                <div class="space-y-4">
                    <!-- Ad Name -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ad Name *</label>
                        <input type="text" name="name" value="{{ old('name', $ad->name) }}" required 
                               class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500">
                        @error('name')
                            <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Ad Type -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ad Type *</label>
                        <select name="type" x-model="type" required
                                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                            <option value="google_adsense">Google AdSense</option>
                            <option value="direct">Direct Ad (Custom HTML/Image)</option>
                            <option value="affiliate">Affiliate Link</option>
                        </select>
                    </div>

                    <!-- Placement -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Placement *</label>
                        <select name="placement" x-model="placement" required
                                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                            <option value="header">Header (Top Banner)</option>
                            <option value="sidebar">Sidebar (Desktop Only)</option>
                            <option value="inline">Inline (Between Content)</option>
                            <option value="footer">Footer (Bottom Banner)</option>
                            <option value="interstitial">Interstitial (Full Screen)</option>
                        </select>
                    </div>

                    <!-- Format -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format *</label>
                        <select name="format" required
                                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                            <option value="banner" {{ $ad->format === 'banner' ? 'selected' : '' }}>Banner</option>
                            <option value="square" {{ $ad->format === 'square' ? 'selected' : '' }}>Square</option>
                            <option value="rectangle" {{ $ad->format === 'rectangle' ? 'selected' : '' }}>Rectangle</option>
                            <option value="native" {{ $ad->format === 'native' ? 'selected' : '' }}>Native</option>
                            <option value="video" {{ $ad->format === 'video' ? 'selected' : '' }}>Video</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Google AdSense Fields -->
            <div x-show="type === 'google_adsense'" class="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Google AdSense Settings</h2>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">AdSense Slot ID *</label>
                        <input type="text" name="adsense_slot_id" value="{{ old('adsense_slot_id', $ad->adsense_slot_id) }}"
                               class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ad Format</label>
                        <select name="adsense_format"
                                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                            <option value="auto" {{ $ad->adsense_format === 'auto' ? 'selected' : '' }}>Auto (Responsive)</option>
                            <option value="rectangle" {{ $ad->adsense_format === 'rectangle' ? 'selected' : '' }}>Rectangle (336x280)</option>
                            <option value="horizontal" {{ $ad->adsense_format === 'horizontal' ? 'selected' : '' }}>Horizontal (728x90)</option>
                            <option value="vertical" {{ $ad->adsense_format === 'vertical' ? 'selected' : '' }}>Vertical (120x600)</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Direct Ad Fields -->
            <div x-show="type === 'direct' || type === 'affiliate'" class="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Direct Ad Settings</h2>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom HTML Code</label>
                        <textarea name="html_code" rows="6" 
                                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono text-sm">{{ old('html_code', $ad->html_code) }}</textarea>
                    </div>

                    @if($ad->image_url)
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Image</label>
                        <img src="{{ $ad->image_url }}" alt="{{ $ad->name }}" class="w-64 rounded-lg border border-gray-300 dark:border-gray-600">
                    </div>
                    @endif

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $ad->image_url ? 'Replace Image' : 'Ad Image' }}</label>
                        <input type="file" name="image" accept="image/*"
                               class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Link URL</label>
                        <input type="url" name="link_url" value="{{ old('link_url', $ad->link_url) }}"
                               class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Advertiser Name</label>
                        <input type="text" name="advertiser_name" value="{{ old('advertiser_name', $ad->advertiser_name) }}"
                               class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    </div>
                </div>
            </div>

            <!-- Targeting -->
            <div class="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Targeting</h2>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Show on Pages</label>
                        <div class="space-y-2">
                            @php $pages = $ad->pages ?? []; @endphp
                            <label class="flex items-center gap-2">
                                <input type="checkbox" name="pages[]" value="home" {{ in_array('home', $pages) ? 'checked' : '' }} class="rounded">
                                <span class="text-sm">Homepage</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" name="pages[]" value="discover" {{ in_array('discover', $pages) ? 'checked' : '' }} class="rounded">
                                <span class="text-sm">Discover</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" name="pages[]" value="artist" {{ in_array('artist', $pages) ? 'checked' : '' }} class="rounded">
                                <span class="text-sm">Artist Pages</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" name="pages[]" value="genres" {{ in_array('genres', $pages) ? 'checked' : '' }} class="rounded">
                                <span class="text-sm">Genres</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" name="pages[]" value="playlists" {{ in_array('playlists', $pages) ? 'checked' : '' }} class="rounded">
                                <span class="text-sm">Playlists</span>
                            </label>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <label class="flex items-center gap-2">
                            <input type="checkbox" name="mobile_only" value="1" {{ $ad->mobile_only ? 'checked' : '' }} class="rounded">
                            <span class="text-sm">Mobile Only</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="checkbox" name="desktop_only" value="1" {{ $ad->desktop_only ? 'checked' : '' }} class="rounded">
                            <span class="text-sm">Desktop Only</span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Scheduling -->
            <div class="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Scheduling</h2>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                        <input type="date" name="start_date" value="{{ $ad->start_date ? $ad->start_date->format('Y-m-d') : '' }}"
                               class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                        <input type="date" name="end_date" value="{{ $ad->end_date ? $ad->end_date->format('Y-m-d') : '' }}"
                               class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    </div>
                </div>
            </div>

            <!-- Settings -->
            <div>
                <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Settings</h2>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                        <input type="number" name="priority" value="{{ $ad->priority }}" min="0" max="100"
                               class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    </div>

                    <label class="flex items-center gap-2">
                        <input type="checkbox" name="is_active" value="1" {{ $ad->is_active ? 'checked' : '' }} class="rounded">
                        <span class="text-sm font-medium">Active</span>
                    </label>
                </div>
            </div>

            <!-- Submit Buttons -->
            <div class="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                    Update Ad
                </button>
                <a href="{{ route('backend.ads.show', $ad) }}" class="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white font-medium">
                    Cancel
                </a>
            </div>
        </div>
    </form>
</div>
@endsection
