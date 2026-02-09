@extends('layouts.admin')

@section('title', 'Ads Management')

@section('content')
<div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Ads Management</h1>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Configure Google AdSense and private ads across your platform</p>
            </div>
            <a href="{{ route('admin.settings.index') }}" class="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Back to Settings
            </a>
        </div>
    </div>

    @if(session('success'))
        <div class="mb-6 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded relative" role="alert">
            <span class="block sm:inline">{{ session('success') }}</span>
        </div>
    @endif

    @if(session('error'))
        <div class="mb-6 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded relative" role="alert">
            <span class="block sm:inline">{{ session('error') }}</span>
        </div>
    @endif

    <form method="POST" action="{{ route('admin.settings.ads.update') }}" x-data="adsManager()">
        @csrf

        <!-- Global Ads Toggle -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-lg font-medium text-gray-900 dark:text-white">Global Ads Status</h2>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Master switch for all advertisements</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="ads_enabled" value="1" 
                               x-model="globalAdsEnabled"
                               {{ $settings['ads_enabled'] ? 'checked' : '' }}
                               class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300" x-text="globalAdsEnabled ? 'Enabled' : 'Disabled'">
                            {{ $settings['ads_enabled'] ? 'Enabled' : 'Disabled' }}
                        </span>
                    </label>
                </div>
            </div>
        </div>

        <!-- Google AdSense Configuration -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow mb-6" x-show="globalAdsEnabled">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                            <svg class="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            Google AdSense
                        </h2>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Monetize with Google's advertising network</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="ads_google_adsense_enabled" value="1"
                               {{ $settings['ads_google_adsense_enabled'] ? 'checked' : '' }}
                               class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>
            <div class="p-6">
                <div>
                    <label for="ads_google_adsense_client_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        AdSense Client ID
                        <span class="text-gray-500 text-xs">(Format: ca-pub-XXXXXXXXXXXXXXXX)</span>
                    </label>
                    <input type="text" 
                           id="ads_google_adsense_client_id" 
                           name="ads_google_adsense_client_id" 
                           value="{{ $settings['ads_google_adsense_client_id'] }}"
                           placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                           class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Find this in your AdSense account settings</p>
                </div>
            </div>
        </div>

        <!-- Private Ads Configuration -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow mb-6" x-show="globalAdsEnabled">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                            <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                            </svg>
                            Private/Custom Ads
                        </h2>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Manage your own promotional banners</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="ads_private_ads_enabled" value="1"
                               {{ $settings['ads_private_ads_enabled'] ? 'checked' : '' }}
                               class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>
            <div class="p-6">
                <!-- Existing Private Ads -->
                <div class="space-y-4 mb-4">
                    @forelse($settings['private_ads'] as $index => $ad)
                        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between">
                            <div class="flex items-center space-x-4 flex-1">
                                @if(!empty($ad['image']))
                                    <img src="{{ $ad['image'] }}" alt="{{ $ad['title'] }}" class="w-20 h-20 object-cover rounded">
                                @else
                                    <div class="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                        </svg>
                                    </div>
                                @endif
                                <div class="flex-1">
                                    <h4 class="text-sm font-medium text-gray-900 dark:text-white">{{ $ad['title'] }}</h4>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Placement: <span class="capitalize">{{ $ad['placement'] }}</span></p>
                                    @if(!empty($ad['link']))
                                        <a href="{{ $ad['link'] }}" target="_blank" class="text-xs text-blue-600 dark:text-blue-400 hover:underline">{{ $ad['link'] }}</a>
                                    @endif
                                </div>
                            </div>
                            <div class="flex items-center space-x-3">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $ad['active'] ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' }}">
                                    {{ $ad['active'] ? 'Active' : 'Inactive' }}
                                </span>
                                <button type="button" 
                                        @click="deleteAd('{{ $ad['id'] }}')"
                                        class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    @empty
                        <p class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No private ads configured yet</p>
                    @endforelse
                </div>

                <!-- Add New Ad Button -->
                <button type="button" 
                        @click="addNewAd"
                        class="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Add New Private Ad
                </button>

                <!-- Dynamic Ad Form Template (Hidden, cloned by Alpine.js) -->
                <template x-if="newAds.length > 0">
                    <div class="mt-4 space-y-4">
                        <template x-for="(ad, index) in newAds" :key="index">
                            <div class="border-2 border-blue-300 dark:border-blue-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                                <div class="flex justify-between items-center mb-3">
                                    <h4 class="text-sm font-medium text-gray-900 dark:text-white">New Ad #<span x-text="index + 1"></span></h4>
                                    <button type="button" @click="removeNewAd(index)" class="text-red-600 hover:text-red-800">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Ad Title</label>
                                        <input type="text" 
                                               :name="'ad_title[' + index + ']'" 
                                               x-model="ad.title"
                                               placeholder="Summer Sale 2025"
                                               class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Placement</label>
                                        <select :name="'ad_placement[' + index + ']'" 
                                                x-model="ad.placement"
                                                class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                            <option value="homepage">Homepage Banner</option>
                                            <option value="player">Player Sidebar</option>
                                            <option value="discover">Discover Page</option>
                                            <option value="mobile">Mobile Banner</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
                                        <input type="url" 
                                               :name="'ad_image[' + index + ']'" 
                                               x-model="ad.image"
                                               placeholder="https://example.com/banner.jpg"
                                               class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Destination URL</label>
                                        <input type="url" 
                                               :name="'ad_link[' + index + ']'" 
                                               x-model="ad.link"
                                               placeholder="https://example.com/product"
                                               class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                    </div>
                                    <div class="flex items-center md:col-span-2">
                                        <input type="checkbox" 
                                               :name="'ad_active[' + index + ']'" 
                                               x-model="ad.active"
                                               value="1"
                                               class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                                        <label class="ml-2 block text-sm text-gray-700 dark:text-gray-300">Active</label>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                </template>
            </div>
        </div>

        <!-- Ad Placement Settings -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow mb-6" x-show="globalAdsEnabled">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 class="text-lg font-medium text-gray-900 dark:text-white">Ad Placement Control</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">Choose where ads appear on your platform</p>
            </div>
            <div class="p-6">
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Homepage Banner</label>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Display ads on the homepage hero section</p>
                        </div>
                        <input type="checkbox" name="ads_homepage_banner" value="1"
                               {{ $settings['ads_homepage_banner'] ? 'checked' : '' }}
                               class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                    </div>

                    <div class="flex items-center justify-between">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Player Sidebar</label>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Show ads in the music player sidebar</p>
                        </div>
                        <input type="checkbox" name="ads_player_sidebar" value="1"
                               {{ $settings['ads_player_sidebar'] ? 'checked' : '' }}
                               class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                    </div>

                    <div class="flex items-center justify-between">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Between Songs (Audio Ads)</label>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Play audio ads between songs for free users</p>
                        </div>
                        <input type="checkbox" name="ads_between_songs" value="1"
                               {{ $settings['ads_between_songs'] ? 'checked' : '' }}
                               class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                    </div>

                    <div class="flex items-center justify-between">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Discover Page</label>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Display ads on the music discovery page</p>
                        </div>
                        <input type="checkbox" name="ads_discover_page" value="1"
                               {{ $settings['ads_discover_page'] ? 'checked' : '' }}
                               class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                    </div>

                    <div class="flex items-center justify-between">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Banner</label>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Show mobile-optimized banner ads</p>
                        </div>
                        <input type="checkbox" name="ads_mobile_banner" value="1"
                               {{ $settings['ads_mobile_banner'] ? 'checked' : '' }}
                               class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                    </div>
                </div>
            </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end">
            <button type="submit"
                    class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Save Ads Settings
            </button>
        </div>
    </form>
</div>

@push('scripts')
<script>
function adsManager() {
    return {
        globalAdsEnabled: {{ $settings['ads_enabled'] ? 'true' : 'false' }},
        newAds: [],
        
        addNewAd() {
            this.newAds.push({
                title: '',
                image: '',
                link: '',
                placement: 'homepage',
                active: true
            });
        },
        
        removeNewAd(index) {
            this.newAds.splice(index, 1);
        },
        
        deleteAd(adId) {
            if (confirm('Are you sure you want to delete this ad?')) {
                fetch(`{{ route('admin.settings.ads.delete', '') }}/${adId}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'Accept': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert('Failed to delete ad: ' + data.message);
                    }
                });
            }
        }
    }
}
</script>
@endpush
@endsection
