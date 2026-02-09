<header class="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
            <!-- Left Section -->
            <div class="flex items-center space-x-8">
                <!-- Logo -->
                <a class="flex items-center space-x-2" href="{{ route('frontend.home') }}">
                    <img alt="TesoTunes Logo" class="h-8 w-8" src="{{ asset('images/logo.png') }}" onerror="this.src='https://lh3.googleusercontent.com/aida-public/AB6AXuBF1PLBIvBVSuwKLNou7iduGwd6cjSc3HEvffD1UUyvbLpzb9dC5TFu9OEvJfoyzyhtTnYFrfY02vYkO71Kz27JRGOcjYoT16cnoBUT59tHjKP5wo-yEmlE1IlpDgazyBhz6iIFRw5ew54l2XHhWTPaODHsoNObVC9H3MWDUKNTb3WK5H_AodmEoSLuq6l-Kci1JPyRQ6-KN_CCUd0NVLusqq8KHcN0DKM8bpwuubGPvtrg4URI363_4bAuTzJLo9LNYf5xEFnov2OY'"/>
                    <h1 class="text-xl font-bold text-brand-green">TesoTunes</h1>
                </a>
                
                <!-- Search Bar -->
                <div class="relative hidden sm:block">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">search</span>
                    <input 
                        class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full w-72 pl-10 pr-4 py-2 text-sm focus:ring-brand-green focus:border-brand-green placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white" 
                        placeholder="Search..." 
                        type="text"
                    />
                </div>
                
                <!-- Desktop Navigation -->
                <nav class="hidden lg:flex items-center space-x-6 text-sm font-semibold">
                    <a class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center space-x-1" href="{{ route('frontend.timeline') }}">
                        <span class="material-symbols-outlined text-base">schedule</span>
                        <span>Timeline</span>
                    </a>
                    <a class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center space-x-1" href="{{ route('frontend.trending') }}">
                        <span class="material-symbols-outlined text-base">trending_up</span>
                        <span>Trending</span>
                    </a>
                    <a class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center space-x-1" href="{{ route('frontend.artists') }}">
                        <span class="material-symbols-outlined text-base">mic_external_on</span>
                        <span>Artists</span>
                    </a>
                    <a class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center space-x-1" href="{{ route('frontend.genres') }}">
                        <span class="material-symbols-outlined text-base">music_note</span>
                        <span>Genres</span>
                    </a>
                    <a class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center space-x-1" href="{{ route('frontend.playlists.index') }}">
                        <span class="material-symbols-outlined text-base">queue_music</span>
                        <span>Playlists</span>
                    </a>
                </nav>
            </div>
            
            <!-- Right Section -->
            <div class="flex items-center space-x-4">
                <!-- Theme Toggle -->
                <button onclick="toggleTheme()" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Toggle theme">
                    <span class="material-symbols-outlined text-gray-600 dark:text-gray-400 dark:hidden">dark_mode</span>
                    <span class="material-symbols-outlined text-gray-400 hidden dark:inline">light_mode</span>
                </button>
                
                @auth
                    @if(auth()->user()->artist)
                    <a class="hidden sm:flex items-center space-x-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" href="{{ route('frontend.artist.profile') }}">
                        <span class="material-symbols-outlined text-lg">equalizer</span>
                        <span>Artist Dashboard</span>
                    </a>
                    @endif
                    
                    <button class="flex items-center space-x-2" onclick="toggleUserMenu()">
                        <img alt="{{ auth()->user()->name }}" class="w-9 h-9 rounded-full object-cover" src="{{ auth()->user()->avatar_url ?? asset('images/default-avatar.svg') }}"/>
                        <span class="hidden md:inline text-sm font-semibold text-gray-900 dark:text-white">{{ auth()->user()->name }}</span>
                        <span class="material-symbols-outlined text-lg text-gray-500">expand_more</span>
                    </button>
                @else
                    <a href="{{ route('login') }}" class="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Login</a>
                    <a href="{{ route('register') }}" class="bg-brand-green text-white font-semibold py-2 px-4 rounded-full hover:bg-green-500 transition-colors text-sm">Sign Up</a>
                @endauth
            </div>
        </div>
    </div>
</header>

<script>
function toggleUserMenu() {
    // TODO: Implement user menu dropdown
    console.log('User menu toggle');
}
</script>
