<aside class="hidden lg:block col-span-2 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide py-8 space-y-8 pl-4">
    <!-- Trending Now -->
    <section class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">Trending Now</h2>
        <div class="space-y-3">
            @if(isset($trendingSongs) && $trendingSongs->count() > 0)
                @foreach($trendingSongs->take(2) as $song)
                <div class="flex items-center space-x-3 group">
                    <img alt="{{ $song->title }}" class="w-12 h-12 rounded object-cover" src="{{ $song->artwork_url ?? asset('images/default-song-artwork.svg') }}"/>
                    <div class="flex-grow">
                        <p class="font-semibold text-sm text-gray-900 dark:text-white">{{ $song->title }}</p>
                        <p class="text-xs text-gray-600 dark:text-gray-400">{{ $song->artist->name ?? 'Unknown Artist' }}</p>
                    </div>
                    <button class="bg-gray-200 dark:bg-gray-700 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-300 dark:hover:bg-gray-600" onclick="playSong({{ $song->id }})">
                        <span class="material-symbols-outlined">play_arrow</span>
                    </button>
                </div>
                @endforeach
            @else
                <p class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No trending songs yet</p>
            @endif
        </div>
    </section>
    
    <!-- Suggested Artists -->
    <section class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">Suggested Artists</h2>
        <div class="space-y-4">
            @if(isset($suggestedArtists) && $suggestedArtists->count() > 0)
                @foreach($suggestedArtists->take(2) as $artist)
                <div class="flex items-center space-x-3">
                    <img alt="{{ $artist->name }}" class="w-10 h-10 rounded-full object-cover" src="{{ $artist->avatar_url ?? asset('images/default-avatar.svg') }}"/>
                    <div class="flex-grow">
                        <p class="font-semibold text-sm text-gray-900 dark:text-white">{{ $artist->name }}</p>
                        <p class="text-xs text-gray-600 dark:text-gray-400">{{ number_format($artist->followers_count ?? 0) }}k followers</p>
                    </div>
                    <button class="bg-brand-green text-white text-xs font-bold py-1.5 px-4 rounded-full hover:bg-green-500" onclick="followArtist({{ $artist->id }})">Follow</button>
                </div>
                @endforeach
            @else
                <div class="flex items-center space-x-3">
                    <img alt="Mark P" class="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAh8CnBPzEP-6bWQyqkugUpOh2xKAHavyU_ZZy9jtvqSWuy42U8OYKUYfsNOIPbf9NOiuOmzqOkZNZY6Qkrk7ou0ir9VSQ6MoCaMqet7yWmNe0AaVB9CNa1r63zKrHiROCjjKBFNwFuc9CGOs7qlvrmWvve4m_lBPWV4s0e-MdxbSwbICgBGifqB5EEWGPNeK0bq8L2ZHNJNw3Tog5RZaQSgK9EY2SqHxiFtjK_1vn-ozYIlTczW5tY9BSAsJio_B54k9ezMcEppNMO"/>
                    <div class="flex-grow">
                        <p class="font-semibold text-sm text-gray-900 dark:text-white">Mark P</p>
                        <p class="text-xs text-gray-600 dark:text-gray-400">23k followers</p>
                    </div>
                    <button class="bg-brand-green text-white text-xs font-bold py-1.5 px-4 rounded-full hover:bg-green-500">Follow</button>
                </div>
                <div class="flex items-center space-x-3">
                    <img alt="Richo Ranking" class="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzFZcOHrvR5SDLDWlDANU-_ONK6jT7kVn266S4rScel3XmrvG9FVAkKMnI6KL5okoejkjmHmTtNqZ6VqP2WcI6_ssf9iLd4oPJ4qwrSgg29puP0Ep21gYERThyKin9KJKyjbx7hfqJv-dh4ld-hMDqRGl0vMsB9zxfbyMMgjkc1xZ4Rv2SPr-Vd_rfjuMPVIcXfgOJK4T-dG0AA63fEKCOa9wk92EGpazjAalEQovxpoUPRUZBNzPmb_Fh0WKXVUGj9spIFG0tlVxh"/>
                    <div class="flex-grow">
                        <p class="font-semibold text-sm text-gray-900 dark:text-white">Richo Ranking</p>
                        <p class="text-xs text-gray-600 dark:text-gray-400">21k followers</p>
                    </div>
                    <button class="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-bold py-1.5 px-4 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">Follow</button>
                </div>
            @endif
        </div>
    </section>
    
    <!-- Upcoming Events -->
    <section class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">Upcoming Events</h2>
        <div class="space-y-4">
            @if(isset($upcomingEvents) && $upcomingEvents->count() > 0)
                @foreach($upcomingEvents->take(1) as $event)
                <div class="flex space-x-3">
                    <div class="flex-shrink-0 text-center bg-white dark:bg-gray-900 p-2 rounded-md border border-gray-200 dark:border-gray-700">
                        <p class="text-xs text-brand-orange font-bold">{{ strtoupper($event->starts_at->format('M')) }}</p>
                        <p class="text-lg font-bold text-gray-900 dark:text-white">{{ $event->starts_at->format('d') }}</p>
                    </div>
                    <div>
                        <p class="font-semibold text-sm text-gray-900 dark:text-white">{{ $event->title }}</p>
                        <p class="text-xs text-gray-600 dark:text-gray-400 flex items-center mt-1">
                            <span class="material-symbols-outlined text-xs mr-1">location_on</span> 
                            {{ $event->venue_name ?? $event->city }}
                        </p>
                    </div>
                </div>
                @endforeach
            @else
                <div class="flex space-x-3">
                    <div class="flex-shrink-0 text-center bg-white dark:bg-gray-900 p-2 rounded-md border border-gray-200 dark:border-gray-700">
                        <p class="text-xs text-brand-orange font-bold">FEB</p>
                        <p class="text-lg font-bold text-gray-900 dark:text-white">05</p>
                    </div>
                    <div>
                        <p class="font-semibold text-sm text-gray-900 dark:text-white">Kampala Music Festival</p>
                        <p class="text-xs text-gray-600 dark:text-gray-400 flex items-center mt-1">
                            <span class="material-symbols-outlined text-xs mr-1">location_on</span> 
                            Kololo Grounds
                        </p>
                    </div>
                </div>
            @endif
        </div>
    </section>
</aside>

<script>
function playSong(songId) {
    console.log('Playing song:', songId);
    // TODO: Integrate with music player
    if (window.musicPlayer && typeof window.musicPlayer.playSong === 'function') {
        window.musicPlayer.playSong(songId);
    } else {
        alert('Music player integration - Coming soon!\nSong ID: ' + songId);
    }
}

function followArtist(artistId) {
    fetch(`/api/artists/${artistId}/follow`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.reload();
        }
    })
    .catch(error => console.error('Error following artist:', error));
}
</script>
