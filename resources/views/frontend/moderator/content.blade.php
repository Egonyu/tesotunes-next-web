@extends('frontend.layouts.music')

@section('title', 'Content Review')

@section('content')
<div class="min-h-screen bg-white dark:bg-black">
    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-white mb-2">Content Review</h1>
                    <p class="text-gray-400">Review and moderate pending content submissions</p>
                </div>
                <a href="{{ route('frontend.moderator.dashboard') }}" 
                   class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                    <span class="material-icons-round align-middle">arrow_back</span>
                    Back to Dashboard
                </a>
            </div>
        </div>

        <!-- Filter Tabs -->
        <div class="mb-6">
            <div class="border-b border-gray-700">
                <nav class="-mb-px flex space-x-8">
                    <button class="border-b-2 border-green-500 py-4 px-1 text-sm font-medium text-green-500">
                        All Pending ({{ $counts['all'] ?? 0 }})
                    </button>
                    <button class="border-transparent text-gray-400 hover:text-white py-4 px-1 text-sm font-medium">
                        Songs ({{ $counts['songs'] ?? 0 }})
                    </button>
                    <button class="border-transparent text-gray-400 hover:text-white py-4 px-1 text-sm font-medium">
                        Albums ({{ $counts['albums'] ?? 0 }})
                    </button>
                    <button class="border-transparent text-gray-400 hover:text-white py-4 px-1 text-sm font-medium">
                        Podcasts ({{ $counts['podcasts'] ?? 0 }})
                    </button>
                    <button class="border-transparent text-gray-400 hover:text-white py-4 px-1 text-sm font-medium">
                        Comments ({{ $counts['comments'] ?? 0 }})
                    </button>
                </nav>
            </div>
        </div>

        <!-- Content List -->
        <div class="space-y-4">
            @forelse($pendingContent ?? [] as $content)
            <div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div class="flex items-start justify-between">
                    <!-- Content Info -->
                    <div class="flex items-start space-x-4 flex-1">
                        <!-- Thumbnail/Icon -->
                        <div class="flex-shrink-0">
                            @if($content['type'] === 'song' || $content['type'] === 'album')
                                <img src="{{ $content['artwork'] ?? '/images/default-song-artwork.svg' }}" 
                                     alt="{{ $content['title'] ?? 'Content' }}"
                                     class="w-20 h-20 rounded-lg object-cover">
                            @else
                                <div class="w-20 h-20 rounded-lg bg-gray-700 flex items-center justify-center">
                                    <span class="material-icons-round text-gray-400 text-3xl">
                                        {{ $content['icon'] ?? 'music_note' }}
                                    </span>
                                </div>
                            @endif
                        </div>

                        <!-- Details -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center space-x-2 mb-2">
                                <span class="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                                    {{ ucfirst($content['type'] ?? 'Content') }}
                                </span>
                                <span class="text-gray-500 text-sm">•</span>
                                <span class="text-gray-400 text-sm">
                                    {{ $content['submitted_at'] ?? 'Recently' }}
                                </span>
                            </div>
                            <h3 class="text-lg font-semibold text-white mb-1">
                                {{ $content['title'] ?? 'Untitled' }}
                            </h3>
                            <p class="text-gray-400 text-sm mb-2">
                                by {{ $content['artist'] ?? 'Unknown Artist' }}
                            </p>
                            @if(isset($content['description']))
                            <p class="text-gray-500 text-sm">
                                {{ Str::limit($content['description'], 150) }}
                            </p>
                            @endif

                            <!-- Metadata -->
                            <div class="flex items-center space-x-4 mt-3 text-sm text-gray-400">
                                @if(isset($content['genre']))
                                <span>
                                    <span class="material-icons-round text-xs align-middle">category</span>
                                    {{ $content['genre'] }}
                                </span>
                                @endif
                                @if(isset($content['duration']))
                                <span>
                                    <span class="material-icons-round text-xs align-middle">schedule</span>
                                    {{ $content['duration'] }}
                                </span>
                                @endif
                                @if(isset($content['explicit']) && $content['explicit'])
                                <span class="px-2 py-0.5 bg-red-900 text-red-300 text-xs rounded">
                                    EXPLICIT
                                </span>
                                @endif
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center space-x-2 ml-4">
                        @if(in_array($content['type'], ['song', 'podcast']))
                        <button class="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                title="Preview">
                            <span class="material-icons-round">play_arrow</span>
                        </button>
                        @endif
                        <button class="p-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
                                onclick="approveContent('{{ $content['type'] }}', '{{ $content['id'] }}')"
                                title="Approve">
                            <span class="material-icons-round">check</span>
                        </button>
                        <button class="p-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                                onclick="rejectContent('{{ $content['type'] }}', '{{ $content['id'] }}')"
                                title="Reject">
                            <span class="material-icons-round">close</span>
                        </button>
                    </div>
                </div>
            </div>
            @empty
            <div class="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
                <span class="material-icons-round text-gray-600 text-6xl mb-4">check_circle</span>
                <h3 class="text-xl font-semibold text-white mb-2">All caught up!</h3>
                <p class="text-gray-400">No pending content to review at the moment.</p>
            </div>
            @endforelse
        </div>

        <!-- Pagination -->
        @if(isset($pendingContent) && count($pendingContent) > 0)
        <div class="mt-8 flex justify-center">
            <nav class="flex items-center space-x-2">
                <button class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                    Previous
                </button>
                <button class="px-4 py-2 bg-green-600 text-white rounded-lg">1</button>
                <button class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">2</button>
                <button class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">3</button>
                <button class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                    Next
                </button>
            </nav>
        </div>
        @endif
    </div>
</div>

@push('scripts')
<script>
function approveContent(type, id) {
    if (!confirm('Are you sure you want to approve this content?')) return;
    
    fetch(`/moderator/content/${type}/${id}/approve`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            alert('Failed to approve content');
        }
    });
}

function rejectContent(type, id) {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    fetch(`/moderator/content/${type}/${id}/reject`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({ reason })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            alert('Failed to reject content');
        }
    });
}
</script>
@endpush
@endsection
