@extends('frontend.layouts.music')

@section('title', 'Play Queue')

@section('content')
<div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-3xl font-bold text-white">Play Queue</h2>
            <p class="text-gray-400">{{ $queue->count() }} songs in queue</p>
        </div>
        <div class="flex gap-3">
            <button onclick="shuffleQueue()" class="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <span class="material-icons-round text-sm">shuffle</span>
                Shuffle
            </button>
            <button onclick="clearQueue()" class="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <span class="material-icons-round text-sm">clear_all</span>
                Clear Queue
            </button>
        </div>
    </div>

    <!-- Now Playing -->
    @if(isset($currentSong))
    <div class="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6">
        <div class="flex items-center gap-6">
            <img src="{{ $currentSong->artwork_url ?? asset('images/default-song-artwork.svg') }}" 
                 alt="{{ $currentSong->title }}" 
                 class="w-24 h-24 rounded-lg shadow-lg">
            <div class="flex-1">
                <p class="text-sm text-white opacity-75 mb-1">Now Playing</p>
                <h3 class="text-2xl font-bold text-white mb-2">{{ $currentSong->title }}</h3>
                <p class="text-white opacity-90">{{ $currentSong->artist->name }}</p>
            </div>
            <div class="flex gap-3">
                <button class="w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-colors">
                    <span class="material-icons-round text-white">skip_previous</span>
                </button>
                <button class="w-12 h-12 bg-white hover:bg-opacity-90 rounded-full flex items-center justify-center transition-colors">
                    <span class="material-icons-round text-green-600">pause</span>
                </button>
                <button class="w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-colors">
                    <span class="material-icons-round text-white">skip_next</span>
                </button>
            </div>
        </div>
    </div>
    @endif

    <!-- Queue List -->
    <div class="bg-gray-800 rounded-xl overflow-hidden">
        <div class="p-6 border-b border-gray-700 flex justify-between items-center">
            <h3 class="text-xl font-bold text-white">Up Next</h3>
            <button class="text-blue-400 hover:text-blue-300 text-sm">Save as Playlist</button>
        </div>

        @if(isset($queue) && $queue->count() > 0)
        <div id="queueList" class="divide-y divide-gray-700">
            @foreach($queue as $index => $song)
            <div class="p-4 hover:bg-gray-700 transition-colors cursor-pointer group" 
                 data-song-id="{{ $song->id }}"
                 draggable="true">
                <div class="flex items-center gap-4">
                    <!-- Drag Handle -->
                    <div class="text-gray-600 group-hover:text-gray-400 cursor-grab">
                        <span class="material-icons-round">drag_indicator</span>
                    </div>

                    <!-- Position -->
                    <div class="text-gray-400 font-medium w-8 text-center">
                        {{ $index + 1 }}
                    </div>

                    <!-- Artwork -->
                    <img src="{{ $song->artwork_url ?? asset('images/default-song-artwork.svg') }}" 
                         alt="{{ $song->title }}" 
                         class="w-12 h-12 rounded shadow">

                    <!-- Song Info -->
                    <div class="flex-1 min-w-0">
                        <h4 class="text-white font-medium truncate">{{ $song->title }}</h4>
                        <p class="text-sm text-gray-400 truncate">{{ $song->artist->name }}</p>
                    </div>

                    <!-- Duration -->
                    <div class="text-gray-400 text-sm hidden md:block">
                        {{ gmdate('i:s', $song->duration ?? 0) }}
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="playNow({{ $song->id }})" class="p-2 hover:bg-gray-600 rounded-full transition-colors" title="Play now">
                            <span class="material-icons-round text-white text-sm">play_arrow</span>
                        </button>
                        <button onclick="removeFromQueue({{ $song->id }})" class="p-2 hover:bg-gray-600 rounded-full transition-colors" title="Remove">
                            <span class="material-icons-round text-white text-sm">close</span>
                        </button>
                        <button onclick="addToPlaylist({{ $song->id }})" class="p-2 hover:bg-gray-600 rounded-full transition-colors" title="Add to playlist">
                            <span class="material-icons-round text-white text-sm">playlist_add</span>
                        </button>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
        @else
        <div class="p-12 text-center">
            <span class="material-icons-round text-6xl text-gray-600 mb-4 block">queue_music</span>
            <h3 class="text-xl font-bold text-white mb-2">Queue is Empty</h3>
            <p class="text-gray-400 mb-6">Add songs to start listening</p>
            <a href="{{ route('frontend.timeline') }}" class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                <span class="material-icons-round text-sm">search</span>
                Discover Music
            </a>
        </div>
        @endif
    </div>

    <!-- Queue Actions -->
    @if(isset($queue) && $queue->count() > 0)
    <div class="flex gap-4">
        <button onclick="saveQueue()" class="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
            <span class="material-icons-round text-sm">save</span>
            Save Queue as Playlist
        </button>
        <button onclick="shareQueue()" class="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
            <span class="material-icons-round text-sm">share</span>
            Share Queue
        </button>
    </div>
    @endif
</div>

<script>
// Drag and drop for queue reordering
let draggedElement = null;

document.addEventListener('DOMContentLoaded', function() {
    const queueItems = document.querySelectorAll('#queueList > div[draggable="true"]');
    
    queueItems.forEach(item => {
        item.addEventListener('dragstart', function(e) {
            draggedElement = this;
            this.classList.add('opacity-50');
        });

        item.addEventListener('dragend', function(e) {
            this.classList.remove('opacity-50');
        });

        item.addEventListener('dragover', function(e) {
            e.preventDefault();
            const afterElement = getDragAfterElement(this.parentElement, e.clientY);
            if (afterElement == null) {
                this.parentElement.appendChild(draggedElement);
            } else {
                this.parentElement.insertBefore(draggedElement, afterElement);
            }
        });
    });
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('div[draggable="true"]:not(.opacity-50)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function shuffleQueue() {
    if (confirm('Shuffle queue?')) {
        // Implement shuffle logic
        location.reload();
    }
}

function clearQueue() {
    if (confirm('Clear entire queue?')) {
        // Implement clear logic
        window.location.href = '{{ route("player.library") }}';
    }
}

function playNow(songId) {
    // Implement play now logic
    console.log('Playing song:', songId);
}

function removeFromQueue(songId) {
    // Implement remove logic
    document.querySelector(`[data-song-id="${songId}"]`).remove();
}

function addToPlaylist(songId) {
    // Implement add to playlist logic
    alert('Add to playlist functionality');
}

function saveQueue() {
    const name = prompt('Enter playlist name:');
    if (name) {
        // Implement save queue as playlist
        alert('Queue saved as: ' + name);
    }
}

function shareQueue() {
    // Implement share queue logic
    alert('Share queue functionality');
}
</script>
@endsection
