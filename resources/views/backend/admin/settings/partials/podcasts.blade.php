<div class="settings-card">
    <!-- Card Header -->
    <div class="flex justify-between items-start mb-6">
        <div>
            <h2 class="text-xl font-bold text-slate-800 dark:text-navy-50">🎙️ Podcast Settings</h2>
            <p class="text-slate-500 dark:text-navy-300 mt-1">Configure podcast module, uploads, monetization, and distribution</p>
        </div>
    </div>

    <div x-data="{ activeTab: 'general' }">
    <div class="tabs flex flex-col">
        <div class="is-scrollbar-hidden overflow-x-auto">
            <div class="border-b-2 border-slate-150 dark:border-navy-500">
                <div class="tabs-list flex">
                    <button @click="activeTab = 'general'" :class="{ 'border-primary dark:border-accent text-primary dark:text-accent-light': activeTab === 'general' }"
                            class="btn shrink-0 space-x-2 rounded-none border-b-2 border-transparent px-3 py-2 font-medium text-slate-600 hover:text-slate-800 dark:text-navy-200 dark:hover:text-navy-50">
                        <svg class="size-4.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>General</span>
                    </button>
                    <button @click="activeTab = 'uploads'" :class="{ 'border-primary dark:border-accent text-primary dark:text-accent-light': activeTab === 'uploads' }"
                            class="btn shrink-0 space-x-2 rounded-none border-b-2 border-transparent px-3 py-2 font-medium text-slate-600 hover:text-slate-800 dark:text-navy-200 dark:hover:text-navy-50">
                        <svg class="size-4.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Upload Restrictions</span>
                    </button>
                    <button @click="activeTab = 'monetization'" :class="{ 'border-primary dark:border-accent text-primary dark:text-accent-light': activeTab === 'monetization' }"
                            class="btn shrink-0 space-x-2 rounded-none border-b-2 border-transparent px-3 py-2 font-medium text-slate-600 hover:text-slate-800 dark:text-navy-200 dark:hover:text-navy-50">
                        <svg class="size-4.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Monetization</span>
                    </button>
                    <button @click="activeTab = 'features'" :class="{ 'border-primary dark:border-accent text-primary dark:text-accent-light': activeTab === 'features' }"
                            class="btn shrink-0 space-x-2 rounded-none border-b-2 border-transparent px-3 py-2 font-medium text-slate-600 hover:text-slate-800 dark:text-navy-200 dark:hover:text-navy-50">
                        <svg class="size-4.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                        </svg>
                        <span>Features & Distribution</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- General Settings Tab -->
        <div class="tab-content p-4 sm:p-5" x-show="activeTab === 'general'" x-transition>
            <form id="podcast-general-form" @submit.prevent="updatePodcastSettings('general')">
                <div class="space-y-6">
                    <div class="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-navy-500">
                        <div class="flex items-center space-x-4">
                            <div class="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-accent/10 dark:text-accent-light">
                                <svg class="size-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-medium text-slate-700 dark:text-navy-100">Podcast Module</h3>
                                <p class="text-xs text-slate-400 dark:text-navy-300">
                                    Enable or disable the entire podcast system
                                </p>
                            </div>
                        </div>
                        <label class="inline-flex items-center">
                            <input type="checkbox" name="podcast_module_enabled" 
                                   class="form-switch is-success size-5 rounded-full bg-slate-300 before:rounded-full before:bg-slate-50 checked:bg-success checked:before:bg-white dark:bg-navy-900 dark:before:bg-navy-300 dark:checked:bg-success dark:checked:before:bg-white"
                                   {{ $podcastSettings['podcast_module_enabled'] ? 'checked' : '' }} />
                        </label>
                    </div>

                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <!-- Allow Public Submissions -->
                        <label class="inline-flex items-center justify-between space-x-2 rounded-lg border border-slate-200 p-4 dark:border-navy-500">
                            <div>
                                <span class="font-medium text-slate-700 dark:text-navy-100">Public Submissions</span>
                                <p class="text-xs text-slate-400 dark:text-navy-300">Allow anyone to submit podcasts</p>
                            </div>
                            <input type="checkbox" name="podcast_allow_public_submissions"
                                   class="form-switch is-success size-5 rounded-full bg-slate-300 before:rounded-full before:bg-slate-50 checked:bg-success checked:before:bg-white dark:bg-navy-900 dark:before:bg-navy-300 dark:checked:bg-success dark:checked:before:bg-white"
                                   {{ $podcastSettings['podcast_allow_public_submissions'] ? 'checked' : '' }} />
                        </label>

                        <!-- Require Approval -->
                        <label class="inline-flex items-center justify-between space-x-2 rounded-lg border border-slate-200 p-4 dark:border-navy-500">
                            <div>
                                <span class="font-medium text-slate-700 dark:text-navy-100">Require Approval</span>
                                <p class="text-xs text-slate-400 dark:text-navy-300">Admin must approve episodes</p>
                            </div>
                            <input type="checkbox" name="podcast_require_approval"
                                   class="form-switch is-success size-5 rounded-full bg-slate-300 before:rounded-full before:bg-slate-50 checked:bg-success checked:before:bg-white dark:bg-navy-900 dark:before:bg-navy-300 dark:checked:bg-success dark:checked:before:bg-white"
                                   {{ $podcastSettings['podcast_require_approval'] ? 'checked' : '' }} />
                        </label>

                        <!-- Auto Publish -->
                        <label class="inline-flex items-center justify-between space-x-2 rounded-lg border border-slate-200 p-4 dark:border-navy-500">
                            <div>
                                <span class="font-medium text-slate-700 dark:text-navy-100">Auto Publish</span>
                                <p class="text-xs text-slate-400 dark:text-navy-300">Automatically publish approved episodes</p>
                            </div>
                            <input type="checkbox" name="podcast_auto_publish"
                                   class="form-switch is-success size-5 rounded-full bg-slate-300 before:rounded-full before:bg-slate-50 checked:bg-success checked:before:bg-white dark:bg-navy-900 dark:before:bg-navy-300 dark:checked:bg-success dark:checked:before:bg-white"
                                   {{ $podcastSettings['podcast_auto_publish'] ? 'checked' : '' }} />
                        </label>

                        <!-- Allow Multiple Series -->
                        <label class="inline-flex items-center justify-between space-x-2 rounded-lg border border-slate-200 p-4 dark:border-navy-500">
                            <div>
                                <span class="font-medium text-slate-700 dark:text-navy-100">Multiple Series</span>
                                <p class="text-xs text-slate-400 dark:text-navy-300">Allow creators to have multiple shows</p>
                            </div>
                            <input type="checkbox" name="podcast_allow_multiple_series"
                                   class="form-switch is-success size-5 rounded-full bg-slate-300 before:rounded-full before:bg-slate-50 checked:bg-success checked:before:bg-white dark:bg-navy-900 dark:before:bg-navy-300 dark:checked:bg-success dark:checked:before:bg-white"
                                   {{ $podcastSettings['podcast_allow_multiple_series'] ? 'checked' : '' }} />
                        </label>
                    </div>

                    <div class="flex justify-end space-x-2">
                        <button type="submit" class="btn bg-primary font-medium text-white hover:bg-primary-focus focus:bg-primary-focus active:bg-primary-focus/90 dark:bg-accent dark:hover:bg-accent-focus dark:focus:bg-accent-focus dark:active:bg-accent/90">
                            Save General Settings
                        </button>
                    </div>
                </div>
            </form>
        </div>

        <!-- Upload Restrictions Tab -->
        <div class="tab-content p-4 sm:p-5" x-show="activeTab === 'uploads'" x-transition>
            <form id="podcast-uploads-form" @submit.prevent="updatePodcastSettings('uploads')">
                <div class="space-y-6">
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <!-- Max Episode Size -->
                        <label class="block">
                            <span class="font-medium text-slate-700 dark:text-navy-100">Max Episode Size (MB)</span>
                            <input type="number" name="podcast_max_episode_size_mb" value="{{ $podcastSettings['podcast_max_episode_size_mb'] }}"
                                   class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent"
                                   min="100" max="2000" />
                            <p class="mt-1 text-xs text-slate-400 dark:text-navy-300">Maximum file size for podcast episodes</p>
                        </label>

                        <!-- Max Episodes Per Series -->
                        <label class="block">
                            <span class="font-medium text-slate-700 dark:text-navy-100">Max Episodes Per Series</span>
                            <input type="number" name="podcast_max_episodes_per_series" value="{{ $podcastSettings['podcast_max_episodes_per_series'] }}"
                                   class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent"
                                   min="10" max="10000" />
                            <p class="mt-1 text-xs text-slate-400 dark:text-navy-300">Maximum episodes per podcast series</p>
                        </label>

                        <!-- Min Duration -->
                        <label class="block">
                            <span class="font-medium text-slate-700 dark:text-navy-100">Min Duration (Seconds)</span>
                            <input type="number" name="podcast_min_duration_seconds" value="{{ $podcastSettings['podcast_min_duration_seconds'] }}"
                                   class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent"
                                   min="30" max="600" />
                            <p class="mt-1 text-xs text-slate-400 dark:text-navy-300">Minimum episode duration in seconds</p>
                        </label>

                        <!-- Max Duration -->
                        <label class="block">
                            <span class="font-medium text-slate-700 dark:text-navy-100">Max Duration (Hours)</span>
                            <input type="number" name="podcast_max_duration_hours" value="{{ $podcastSettings['podcast_max_duration_hours'] }}"
                                   class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent"
                                   min="1" max="12" />
                            <p class="mt-1 text-xs text-slate-400 dark:text-navy-300">Maximum episode duration in hours</p>
                        </label>

                        <!-- Cover Art Min Size -->
                        <label class="block">
                            <span class="font-medium text-slate-700 dark:text-navy-100">Cover Art Min Size (px)</span>
                            <input type="number" name="podcast_cover_art_min_size" value="{{ $podcastSettings['podcast_cover_art_min_size'] }}"
                                   class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent"
                                   min="500" max="3000" step="100" />
                            <p class="mt-1 text-xs text-slate-400 dark:text-navy-300">Minimum cover art dimensions (square)</p>
                        </label>

                        <!-- Allowed Formats -->
                        <label class="block">
                            <span class="font-medium text-slate-700 dark:text-navy-100">Allowed Formats</span>
                            <input type="text" name="podcast_allowed_formats" value="{{ $podcastSettings['podcast_allowed_formats'] }}"
                                   class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent"
                                   placeholder="mp3,m4a,wav" />
                            <p class="mt-1 text-xs text-slate-400 dark:text-navy-300">Comma-separated file extensions</p>
                        </label>
                    </div>

                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <!-- Require Cover Art -->
                        <label class="inline-flex items-center justify-between space-x-2 rounded-lg border border-slate-200 p-4 dark:border-navy-500">
                            <div>
                                <span class="font-medium text-slate-700 dark:text-navy-100">Require Cover Art</span>
                                <p class="text-xs text-slate-400 dark:text-navy-300">Mandatory cover art for series</p>
                            </div>
                            <input type="checkbox" name="podcast_require_cover_art"
                                   class="form-switch is-success size-5 rounded-full bg-slate-300 before:rounded-full before:bg-slate-50 checked:bg-success checked:before:bg-white dark:bg-navy-900 dark:before:bg-navy-300 dark:checked:bg-success dark:checked:before:bg-white"
                                   {{ $podcastSettings['podcast_require_cover_art'] ? 'checked' : '' }} />
                        </label>

                        <!-- Require Category -->
                        <label class="inline-flex items-center justify-between space-x-2 rounded-lg border border-slate-200 p-4 dark:border-navy-500">
                            <div>
                                <span class="font-medium text-slate-700 dark:text-navy-100">Require Category</span>
                                <p class="text-xs text-slate-400 dark:text-navy-300">Episodes must have a category</p>
                            </div>
                            <input type="checkbox" name="podcast_require_category"
                                   class="form-switch is-success size-5 rounded-full bg-slate-300 before:rounded-full before:bg-slate-50 checked:bg-success checked:before:bg-white dark:bg-navy-900 dark:before:bg-navy-300 dark:checked:bg-success dark:checked:before:bg-white"
                                   {{ $podcastSettings['podcast_require_category'] ? 'checked' : '' }} />
                        </label>
                    </div>

                    <div class="flex justify-end space-x-2">
                        <button type="submit" class="btn bg-primary font-medium text-white hover:bg-primary-focus focus:bg-primary-focus active:bg-primary-focus/90 dark:bg-accent dark:hover:bg-accent-focus dark:focus:bg-accent-focus dark:active:bg-accent/90">
                            Save Upload Settings
                        </button>
                    </div>
                </div>
            </form>
        </div>

        <!-- Monetization Tab -->
        <div class="tab-content p-4 sm:p-5" x-show="activeTab === 'monetization'" x-transition>
            <form id="podcast-monetization-form" @submit.prevent="updatePodcastSettings('monetization')">
                <div class="space-y-6">
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <!-- Monetization Enabled -->
                        <label class="inline-flex items-center justify-between space-x-2 rounded-lg border border-slate-200 p-4 dark:border-navy-500">
                            <div>
                                <span class="font-medium text-slate-700 dark:text-navy-100">Monetization</span>
                                <p class="text-xs text-slate-400 dark:text-navy-300">Enable podcast monetization</p>
                            </div>
                            <input type="checkbox" name="podcast_monetization_enabled"
                                   class="form-switch is-success size-5 rounded-full bg-slate-300 before:rounded-full before:bg-slate-50 checked:bg-success checked:before:bg-white dark:bg-navy-900 dark:before:bg-navy-300 dark:checked:bg-success dark:checked:before:bg-white"
                                   {{ $podcastSettings['podcast_monetization_enabled'] ? 'checked' : '' }} />
                        </label>

                        <!-- Ads Enabled -->
                        <label class="inline-flex items-center justify-between space-x-2 rounded-lg border border-slate-200 p-4 dark:border-navy-500">
                            <div>
                                <span class="font-medium text-slate-700 dark:text-navy-100">Ads</span>
                                <p class="text-xs text-slate-400 dark:text-navy-300">Allow ads in podcasts</p>
                            </div>
                            <input type="checkbox" name="podcast_ads_enabled"
                                   class="form-switch is-success size-5 rounded-full bg-slate-300 before:rounded-full before:bg-slate-50 checked:bg-success checked:before:bg-white dark:bg-navy-900 dark:before:bg-navy-300 dark:checked:bg-success dark:checked:before:bg-white"
                                   {{ $podcastSettings['podcast_ads_enabled'] ? 'checked' : '' }} />
                        </label>

                        <!-- Sponsorships -->
                        <label class="inline-flex items-center justify-between space-x-2 rounded-lg border border-slate-200 p-4 dark:border-navy-500">
                            <div>
                                <span class="font-medium text-slate-700 dark:text-navy-100">Sponsorships</span>
                                <p class="text-xs text-slate-400 dark:text-navy-300">Allow sponsorship deals</p>
                            </div>
                            <input type="checkbox" name="podcast_sponsorship_enabled"
                                   class="form-switch is-success size-5 rounded-full bg-slate-300 before:rounded-full before:bg-slate-50 checked:bg-success checked:before:bg-white dark:bg-navy-900 dark:before:bg-navy-300 dark:checked:bg-success dark:checked:before:bg-white"
                                   {{ $podcastSettings['podcast_sponsorship_enabled'] ? 'checked' : '' }} />
                        </label>

                        <!-- Premium Episodes -->
                        <label class="inline-flex items-center justify-between space-x-2 rounded-lg border border-slate-200 p-4 dark:border-navy-500">
                            <div>
                                <span class="font-medium text-slate-700 dark:text-navy-100">Premium Episodes</span>
                                <p class="text-xs text-slate-400 dark:text-navy-300">Allow paid premium content</p>
                            </div>
                            <input type="checkbox" name="podcast_premium_episodes_enabled"
                                   class="form-switch is-success size-5 rounded-full bg-slate-300 before:rounded-full before:bg-slate-50 checked:bg-success checked:before:bg-white dark:bg-navy-900 dark:before:bg-navy-300 dark:checked:bg-success dark:checked:before:bg-white"
                                   {{ $podcastSettings['podcast_premium_episodes_enabled'] ? 'checked' : '' }} />
                        </label>
                    </div>

                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <!-- Creator Revenue Share -->
                        <label class="block">
                            <span class="font-medium text-slate-700 dark:text-navy-100">Creator Revenue Share (%)</span>
                            <input type="number" name="podcast_creator_revenue_share" value="{{ $podcastSettings['podcast_creator_revenue_share'] }}"
                                   class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent"
                                   min="0" max="100" />
                            <p class="mt-1 text-xs text-slate-400 dark:text-navy-300">Percentage of revenue given to creators</p>
                        </label>
                    </div>

                    <div class="flex justify-end space-x-2">
                        <button type="submit" class="btn bg-primary font-medium text-white hover:bg-primary-focus focus:bg-primary-focus active:bg-primary-focus/90 dark:bg-accent dark:hover:bg-accent-focus dark:focus:bg-accent-focus dark:active:bg-accent/90">
                            Save Monetization Settings
                        </button>
                    </div>
                </div>
            </form>
        </div>

        <!-- Features & Distribution Tab -->
        <div class="tab-content p-4 sm:p-5" x-show="activeTab === 'features'" x-transition>
            <form id="podcast-features-form" @submit.prevent="updatePodcastSettings('features')">
                <div class="space-y-6">
                    <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Features</h3>
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <!-- Analytics -->
                        <label class="inline-flex items-center justify-between space-x-2 rounded-lg border border-slate-200 p-4 dark:border-navy-500">
                            <div>
                                <span class="font-medium text-slate-700 dark:text-navy-100">Analytics</span>
                                <p class="text-xs text-slate-400 dark:text-navy-300">Enable podcast analytics</p>
                            </div>
                            <input type="checkbox" name="podcast_analytics_enabled"
                                   class="form-switch is-success size-5 rounded-full bg-slate-300 before:rounded-full before:bg-slate-50 checked:bg-success checked:before:bg-white dark:bg-navy-900 dark:before:bg-navy-300 dark:checked:bg-success dark:checked:before:bg-white"
                                   {{ $podcastSettings['podcast_analytics_enabled'] ? 'checked' : '' }} />
                        </label>

                        <!-- Comments -->
                        <label class="inline-flex items-center justify-between space-x-2 rounded-lg border border-slate-200 p-4 dark:border-navy-500">
                            <div>
                                <span class="font-medium text-slate-700 dark:text-navy-100">Comments</span>
                                <p class="text-xs text-slate-400 dark:text-navy-300">Allow episode comments</p>
                            </div>
                            <input type="checkbox" name="podcast_comments_enabled"
                                   class="form-switch is-success size-5 rounded-full bg-slate-300 before:rounded-full before:bg-slate-50 checked:bg-success checked:before:bg-white dark:bg-navy-900 dark:before:bg-navy-300 dark:checked:bg-success dark:checked:before:bg-white"
                                   {{ $podcastSettings['podcast_comments_enabled'] ? 'checked' : '' }} />
                        </label>

                        <!-- Ratings -->
                        <label class="inline-flex items-center justify-between space-x-2 rounded-lg border border-slate-200 p-4 dark:border-navy-500">
                            <div>
                                <span class="font-medium text-slate-700 dark:text-navy-100">Ratings</span>
                                <p class="text-xs text-slate-400 dark:text-navy-300">Allow episode ratings</p>
                            </div>
                            <input type="checkbox" name="podcast_ratings_enabled"
                                   class="form-switch is-success size-5 rounded-full bg-slate-300 before:rounded-full before:bg-slate-50 checked:bg-success checked:before:bg-white dark:bg-navy-900 dark:before:bg-navy-300 dark:checked:bg-success dark:checked:before:bg-white"
                                   {{ $podcastSettings['podcast_ratings_enabled'] ? 'checked' : '' }} />
                        </label>

                        <!-- Transcriptions -->
                        <label class="inline-flex items-center justify-between space-x-2 rounded-lg border border-slate-200 p-4 dark:border-navy-500">
                            <div>
                                <span class="font-medium text-slate-700 dark:text-navy-100">Transcriptions</span>
                                <p class="text-xs text-slate-400 dark:text-navy-300">Enable automatic transcriptions</p>
                            </div>
                            <input type="checkbox" name="podcast_transcriptions_enabled"
                                   class="form-switch is-success size-5 rounded-full bg-slate-300 before:rounded-full before:bg-slate-50 checked:bg-success checked:before:bg-white dark:bg-navy-900 dark:before:bg-navy-300 dark:checked:bg-success dark:checked:before:bg-white"
                                   {{ $podcastSettings['podcast_transcriptions_enabled'] ? 'checked' : '' }} />
                        </label>

                        <!-- Chapters -->
                        <label class="inline-flex items-center justify-between space-x-2 rounded-lg border border-slate-200 p-4 dark:border-navy-500">
                            <div>
                                <span class="font-medium text-slate-700 dark:text-navy-100">Chapters</span>
                                <p class="text-xs text-slate-400 dark:text-navy-300">Allow episode chapters</p>
                            </div>
                            <input type="checkbox" name="podcast_chapters_enabled"
                                   class="form-switch is-success size-5 rounded-full bg-slate-300 before:rounded-full before:bg-slate-50 checked:bg-success checked:before:bg-white dark:bg-navy-900 dark:before:bg-navy-300 dark:checked:bg-success dark:checked:before:bg-white"
                                   {{ $podcastSettings['podcast_chapters_enabled'] ? 'checked' : '' }} />
                        </label>

                        <!-- RSS Feeds -->
                        <label class="inline-flex items-center justify-between space-x-2 rounded-lg border border-slate-200 p-4 dark:border-navy-500">
                            <div>
                                <span class="font-medium text-slate-700 dark:text-navy-100">RSS Feeds</span>
                                <p class="text-xs text-slate-400 dark:text-navy-300">Enable RSS feed generation</p>
                            </div>
                            <input type="checkbox" name="podcast_rss_feeds_enabled"
                                   class="form-switch is-success size-5 rounded-full bg-slate-300 before:rounded-full before:bg-slate-50 checked:bg-success checked:before:bg-white dark:bg-navy-900 dark:before:bg-navy-300 dark:checked:bg-success dark:checked:before:bg-white"
                                   {{ $podcastSettings['podcast_rss_feeds_enabled'] ? 'checked' : '' }} />
                        </label>
                    </div>

                    <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Platform Distribution</h3>
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <!-- Apple Podcasts -->
                        <label class="inline-flex items-center justify-between space-x-2 rounded-lg border border-slate-200 p-4 dark:border-navy-500">
                            <div>
                                <span class="font-medium text-slate-700 dark:text-navy-100">Apple Podcasts</span>
                                <p class="text-xs text-slate-400 dark:text-navy-300">Submit to Apple Podcasts</p>
                            </div>
                            <input type="checkbox" name="podcast_apple_podcasts_integration"
                                   class="form-switch is-success size-5 rounded-full bg-slate-300 before:rounded-full before:bg-slate-50 checked:bg-success checked:before:bg-white dark:bg-navy-900 dark:before:bg-navy-300 dark:checked:bg-success dark:checked:before:bg-white"
                                   {{ $podcastSettings['podcast_apple_podcasts_integration'] ? 'checked' : '' }} />
                        </label>

                        <!-- Spotify -->
                        <label class="inline-flex items-center justify-between space-x-2 rounded-lg border border-slate-200 p-4 dark:border-navy-500">
                            <div>
                                <span class="font-medium text-slate-700 dark:text-navy-100">Spotify</span>
                                <p class="text-xs text-slate-400 dark:text-navy-300">Submit to Spotify</p>
                            </div>
                            <input type="checkbox" name="podcast_spotify_integration"
                                   class="form-switch is-success size-5 rounded-full bg-slate-300 before:rounded-full before:bg-slate-50 checked:bg-success checked:before:bg-white dark:bg-navy-900 dark:before:bg-navy-300 dark:checked:bg-success dark:checked:before:bg-white"
                                   {{ $podcastSettings['podcast_spotify_integration'] ? 'checked' : '' }} />
                        </label>

                        <!-- Google Podcasts -->
                        <label class="inline-flex items-center justify-between space-x-2 rounded-lg border border-slate-200 p-4 dark:border-navy-500">
                            <div>
                                <span class="font-medium text-slate-700 dark:text-navy-100">Google Podcasts</span>
                                <p class="text-xs text-slate-400 dark:text-navy-300">Submit to Google Podcasts</p>
                            </div>
                            <input type="checkbox" name="podcast_google_podcasts_integration"
                                   class="form-switch is-success size-5 rounded-full bg-slate-300 before:rounded-full before:bg-slate-50 checked:bg-success checked:before:bg-white dark:bg-navy-900 dark:before:bg-navy-300 dark:checked:bg-success dark:checked:before:bg-white"
                                   {{ $podcastSettings['podcast_google_podcasts_integration'] ? 'checked' : '' }} />
                        </label>
                    </div>

                    <div class="flex justify-end space-x-2">
                        <button type="submit" class="btn bg-primary font-medium text-white hover:bg-primary-focus focus:bg-primary-focus active:bg-primary-focus/90 dark:bg-accent dark:hover:bg-accent-focus dark:focus:bg-accent-focus dark:active:bg-accent/90">
                            Save Features Settings
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
    </div>
</div>

@push('scripts')
<script>
function updatePodcastSettings(tab) {
    const formId = `podcast-${tab}-form`;
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    formData.append('tab', tab);

    // Convert checkboxes to boolean values
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        formData.set(checkbox.name, checkbox.checked ? '1' : '0');
    });

    fetch('{{ route("admin.settings.update-podcasts") }}', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
            'Accept': 'application/json',
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
        } else {
            showNotification(data.message || 'Failed to update settings', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred while updating settings', 'error');
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `alert mb-6 flex items-center space-x-2 rounded-lg border ${
        type === 'success' 
            ? 'border-success/20 bg-success/10 text-success' 
            : 'border-error/20 bg-error/10 text-error'
    } px-4 py-3`;
    
    notification.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span>${message}</span>
    `;

    const container = document.querySelector('main');
    container.insertBefore(notification, container.firstChild);

    setTimeout(() => notification.remove(), 3000);
}
</script>
@endpush
