@extends('layouts.admin')

@section('title', 'Import Podcast from RSS')

@section('content')
<div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Import Podcast from RSS Feed</h1>
            <p class="mt-1 text-sm text-slate-500 dark:text-navy-300">Import existing podcasts from external RSS feeds</p>
        </div>
        <a href="{{ route('admin.podcasts.index') }}" 
           class="btn bg-slate-150 font-medium text-slate-800 hover:bg-slate-200">
            <svg class="size-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back to Podcasts
        </a>
    </div>

    <!-- Import Form -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Form Card -->
        <div class="lg:col-span-2">
            <div class="card p-6">
                <form method="POST" action="{{ route('admin.podcasts.import.rss') }}" class="space-y-6">
                    @csrf

                    <!-- RSS Feed URL -->
                    <div>
                        <label for="rss_url" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                            RSS Feed URL *
                        </label>
                        <input type="url" 
                               id="rss_url" 
                               name="rss_url" 
                               required
                               value="{{ old('rss_url') }}"
                               placeholder="https://example.com/podcast/feed.xml"
                               class="form-input w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent @error('rss_url') border-error @enderror"/>
                        @error('rss_url')
                            <p class="mt-1 text-xs text-error">{{ $message }}</p>
                        @enderror
                        <p class="mt-1 text-xs text-slate-400">Enter the complete URL of the podcast RSS feed</p>
                    </div>

                    <!-- User Selection -->
                    <div>
                        <label for="user_id" class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                            Assign to User *
                        </label>
                        <select id="user_id" 
                                name="user_id" 
                                required
                                class="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent @error('user_id') border-error @enderror">
                            <option value="">Select a user...</option>
                            {{-- This will be populated via AJAX or you can pass users from controller --}}
                        </select>
                        @error('user_id')
                            <p class="mt-1 text-xs text-error">{{ $message }}</p>
                        @enderror
                        <p class="mt-1 text-xs text-slate-400">The podcast will be assigned to this user</p>
                    </div>

                    <!-- Import Options -->
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold text-slate-700 dark:text-navy-100">Import Options</h3>
                        
                        <div class="flex items-start">
                            <div class="flex items-center h-5">
                                <input id="import_episodes" 
                                       name="import_episodes" 
                                       type="checkbox" 
                                       value="1"
                                       checked
                                       class="size-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-navy-450 dark:bg-navy-700 dark:focus:ring-accent">
                            </div>
                            <div class="ml-3 text-sm">
                                <label for="import_episodes" class="font-medium text-slate-700 dark:text-navy-100">Import Episodes</label>
                                <p class="text-slate-400">Import all episodes from the RSS feed</p>
                            </div>
                        </div>

                        <div class="flex items-start">
                            <div class="flex items-center h-5">
                                <input id="download_audio" 
                                       name="download_audio" 
                                       type="checkbox" 
                                       value="1"
                                       class="size-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-navy-450 dark:bg-navy-700 dark:focus:ring-accent">
                            </div>
                            <div class="ml-3 text-sm">
                                <label for="download_audio" class="font-medium text-slate-700 dark:text-navy-100">Download Audio Files</label>
                                <p class="text-slate-400">Download and host audio files locally (requires storage space)</p>
                            </div>
                        </div>

                        <div class="flex items-start">
                            <div class="flex items-center h-5">
                                <input id="auto_approve" 
                                       name="auto_approve" 
                                       type="checkbox" 
                                       value="1"
                                       class="size-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-navy-450 dark:bg-navy-700 dark:focus:ring-accent">
                            </div>
                            <div class="ml-3 text-sm">
                                <label for="auto_approve" class="font-medium text-slate-700 dark:text-navy-100">Auto-Approve</label>
                                <p class="text-slate-400">Automatically publish the podcast without review</p>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-3 pt-4">
                        <button type="submit" 
                                class="btn bg-primary font-medium text-white hover:bg-primary-focus focus:bg-primary-focus active:bg-primary-focus/90">
                            <svg class="size-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                            </svg>
                            Import Podcast
                        </button>
                        <a href="{{ route('admin.podcasts.index') }}" 
                           class="btn bg-slate-150 font-medium text-slate-800 hover:bg-slate-200">
                            Cancel
                        </a>
                    </div>
                </form>
            </div>
        </div>

        <!-- Help Sidebar -->
        <div class="lg:col-span-1">
            <div class="card p-6 space-y-4">
                <h3 class="text-lg font-semibold text-slate-700 dark:text-navy-100">How It Works</h3>
                
                <div class="space-y-3 text-sm text-slate-600 dark:text-navy-300">
                    <div class="flex gap-3">
                        <div class="flex-shrink-0 flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary">
                            1
                        </div>
                        <p>Enter the RSS feed URL from the external podcast platform</p>
                    </div>
                    
                    <div class="flex gap-3">
                        <div class="flex-shrink-0 flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary">
                            2
                        </div>
                        <p>Assign the podcast to a user on your platform</p>
                    </div>
                    
                    <div class="flex gap-3">
                        <div class="flex-shrink-0 flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary">
                            3
                        </div>
                        <p>Choose whether to download audio files or link to external sources</p>
                    </div>
                    
                    <div class="flex gap-3">
                        <div class="flex-shrink-0 flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary">
                            4
                        </div>
                        <p>Review and approve before publishing (unless auto-approve is enabled)</p>
                    </div>
                </div>

                <div class="pt-4 border-t border-slate-200 dark:border-navy-500">
                    <h4 class="font-semibold text-slate-700 dark:text-navy-100 mb-2">Common RSS Feed URLs</h4>
                    <ul class="space-y-1 text-xs text-slate-500 dark:text-navy-400">
                        <li>• Spotify: Open podcast → Share → Copy RSS feed</li>
                        <li>• Apple Podcasts: Check podcast description for RSS link</li>
                        <li>• Anchor: Settings → Advanced → RSS feed URL</li>
                        <li>• Buzzsprout: My Podcasts → RSS feed</li>
                    </ul>
                </div>

                <div class="pt-4 border-t border-slate-200 dark:border-navy-500">
                    <h4 class="font-semibold text-slate-700 dark:text-navy-100 mb-2">⚠️ Important Notes</h4>
                    <ul class="space-y-1 text-xs text-slate-500 dark:text-navy-400">
                        <li>• Verify you have rights to import the podcast</li>
                        <li>• External audio links may become unavailable</li>
                        <li>• Downloading audio requires storage space</li>
                        <li>• Import may take several minutes for large podcasts</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
// User search functionality
document.addEventListener('DOMContentLoaded', function() {
    const userSelect = document.getElementById('user_id');
    
    // TODO: Implement user search with AJAX
    // For now, you can populate this from the controller
});
</script>
@endpush
@endsection
