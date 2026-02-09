@props(['active' => 'for-you'])

<div x-data="{ activeTab: '{{ $active }}' }" class="w-full">
    <!-- Tab Navigation -->
    <div class="border-b border-gray-700 mb-6">
        <nav class="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            <!-- For You Tab -->
            <button @click="activeTab = 'for-you'" 
                    :class="activeTab === 'for-you' ? 'border-green-500 text-green-500' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'"
                    class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2">
                <span class="material-icons-round text-lg">home</span>
                <span>For You</span>
            </button>
            
            <!-- Following Tab -->
            <button @click="activeTab = 'following'" 
                    :class="activeTab === 'following' ? 'border-green-500 text-green-500' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'"
                    class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2">
                <span class="material-icons-round text-lg">people</span>
                <span>Following</span>
            </button>
            
            <!-- Events Tab -->
            <button @click="activeTab = 'events'" 
                    :class="activeTab === 'events' ? 'border-green-500 text-green-500' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'"
                    class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2">
                <span class="material-icons-round text-lg">event</span>
                <span>Events</span>
            </button>
            
            <!-- Discover Tab -->
            <button @click="activeTab = 'discover'" 
                    :class="activeTab === 'discover' ? 'border-green-500 text-green-500' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'"
                    class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2">
                <span class="material-icons-round text-lg">explore</span>
                <span>Discover</span>
            </button>
        </nav>
    </div>
    
    <!-- Tab Content -->
    <div class="space-y-4">
        <!-- For You Content -->
        <div x-show="activeTab === 'for-you'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
            {{ $forYou ?? '' }}
        </div>
        
        <!-- Following Content -->
        <div x-show="activeTab === 'following'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100" x-cloak>
            {{ $following ?? '' }}
        </div>
        
        <!-- Events Content -->
        <div x-show="activeTab === 'events'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100" x-cloak>
            {{ $events ?? '' }}
        </div>
        
        <!-- Discover Content -->
        <div x-show="activeTab === 'discover'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100" x-cloak>
            {{ $discover ?? '' }}
        </div>
    </div>
</div>
