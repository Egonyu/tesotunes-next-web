@extends('frontend.layouts.awards')

@section('title', $season->name . ' - Music Awards')

@push('styles')
<style>
    .nomination-card {
        transition: all 0.3s ease;
    }
    .nomination-card:hover {
        transform: translateY(-2px);
    }
    .vote-button {
        transition: all 0.2s ease;
    }
    .vote-button:hover {
        transform: scale(1.05);
    }
    .category-section {
        scroll-margin-top: 100px;
    }
</style>
@endpush

@section('content')
<div class="min-h-screen bg-black text-white p-4 md:p-6">
    <!-- Header Section -->
    <div class="mb-8">
        <div class="flex items-center gap-4 mb-6">
            <a href="{{ route('frontend.awards.index') }}" class="text-gray-400 hover:text-white transition-colors">
                <span class="material-icons-round">arrow_back</span>
            </a>
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                    <span class="material-icons-round text-yellow-400 text-5xl">emoji_events</span>
                    <div>
                        <h1 class="text-4xl md:text-5xl font-bold text-white">{{ $season->name }}</h1>
                        @if($season->year)
                            <p class="text-yellow-400 text-lg font-medium">{{ $season->year }}</p>
                        @endif
                    </div>
                </div>
                @if($season->description)
                    <p class="text-gray-400 text-lg">{{ $season->description }}</p>
                @endif
            </div>
        </div>

        <!-- Season Info -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-xl p-4 border border-purple-700/50">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
                        <span class="material-icons-round text-purple-400">category</span>
                    </div>
                    <div>
                        <p class="text-purple-300 text-xs font-medium uppercase tracking-wide">Categories</p>
                        <p class="text-2xl font-bold text-white">{{ $season->categories->count() }}</p>
                    </div>
                </div>
            </div>

            <div class="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-xl p-4 border border-blue-700/50">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                        <span class="material-icons-round text-blue-400">how_to_vote</span>
                    </div>
                    <div>
                        <p class="text-blue-300 text-xs font-medium uppercase tracking-wide">Nominations</p>
                        <p class="text-2xl font-bold text-white">{{ $season->categories->sum(fn($c) => $c->nominations->count()) }}</p>
                    </div>
                </div>
            </div>

            <div class="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-xl p-4 border border-green-700/50">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
                        <span class="material-icons-round text-green-400">schedule</span>
                    </div>
                    <div>
                        <p class="text-green-300 text-xs font-medium uppercase tracking-wide">Voting Ends</p>
                        <p class="text-sm font-bold text-white">{{ $season->voting_end_at ? $season->voting_end_at->format('M j, Y') : 'TBA' }}</p>
                    </div>
                </div>
            </div>

            @if($season->status === 'active')
            <div class="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 rounded-xl p-4 border border-yellow-700/50">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-yellow-600/20 rounded-full flex items-center justify-center">
                        <span class="material-icons-round text-yellow-400">pending_actions</span>
                    </div>
                    <div>
                        <p class="text-yellow-300 text-xs font-medium uppercase tracking-wide">Status</p>
                        <p class="text-sm font-bold text-white">Voting Open</p>
                    </div>
                </div>
            </div>
            @else
            <div class="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-xl p-4 border border-gray-600/50">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gray-600/20 rounded-full flex items-center justify-center">
                        <span class="material-icons-round text-gray-400">verified</span>
                    </div>
                    <div>
                        <p class="text-gray-300 text-xs font-medium uppercase tracking-wide">Status</p>
                        <p class="text-sm font-bold text-white">{{ ucfirst($season->status) }}</p>
                    </div>
                </div>
            </div>
            @endif
        </div>

        <!-- Category Navigation -->
        @if($season->categories->count() > 0)
        <div class="bg-gray-900 rounded-xl p-4 border border-gray-800 overflow-x-auto">
            <div class="flex gap-2 min-w-max">
                @foreach($season->categories as $category)
                <a href="#category-{{ $category->id }}" 
                   class="px-4 py-2 bg-gray-800 hover:bg-purple-900/50 text-gray-300 hover:text-white rounded-lg transition-colors whitespace-nowrap">
                    {{ $category->name }}
                </a>
                @endforeach
            </div>
        </div>
        @endif
    </div>

    <!-- Categories and Nominations -->
    @if($season->categories->count() > 0)
        <div class="space-y-12">
            @foreach($season->categories as $category)
            <div id="category-{{ $category->id }}" class="category-section">
                <!-- Category Header -->
                <div class="mb-6">
                    <div class="flex items-center gap-3 mb-2">
                        @if($category->icon)
                            <span class="material-icons-round text-purple-400 text-3xl">{{ $category->icon }}</span>
                        @endif
                        <h2 class="text-3xl font-bold text-white">{{ $category->name }}</h2>
                    </div>
                    @if($category->description)
                        <p class="text-gray-400 ml-9">{{ $category->description }}</p>
                    @endif
                </div>

                <!-- Nominations Grid -->
                @if($category->nominations->count() > 0)
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    @foreach($category->nominations as $nomination)
                    <div class="nomination-card bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50">
                        <!-- Nominee Content -->
                        <div class="p-6">
                            @if($nomination->nominee_type === 'artist' && $nomination->artist)
                                <!-- Artist Nomination -->
                                <div class="flex items-center gap-4 mb-4">
                                    @if($nomination->artist->avatar)
                                        <img src="{{ Storage::url($nomination->artist->avatar) }}" 
                                             alt="{{ $nomination->artist->stage_name }}" 
                                             class="w-20 h-20 rounded-full object-cover border-2 border-purple-500">
                                    @else
                                        <div class="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-purple-500">
                                            {{ strtoupper(substr($nomination->artist->stage_name, 0, 1)) }}
                                        </div>
                                    @endif
                                    <div class="flex-1">
                                        <h3 class="text-xl font-bold text-white mb-1">{{ $nomination->artist->stage_name }}</h3>
                                        <p class="text-sm text-gray-400">Artist</p>
                                    </div>
                                </div>
                            @elseif($nomination->nominee_type === 'song' && $nomination->song)
                                <!-- Song Nomination -->
                                <div class="flex items-center gap-4 mb-4">
                                    @if($nomination->song->artwork)
                                        <img src="{{ Storage::url($nomination->song->artwork) }}" 
                                             alt="{{ $nomination->song->title }}" 
                                             class="w-20 h-20 rounded-lg object-cover">
                                    @else
                                        <div class="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                                            <span class="material-icons-round text-white text-3xl">music_note</span>
                                        </div>
                                    @endif
                                    <div class="flex-1">
                                        <h3 class="text-xl font-bold text-white mb-1">{{ $nomination->song->title }}</h3>
                                        <p class="text-sm text-gray-400">{{ $nomination->song->artist->stage_name ?? 'Unknown Artist' }}</p>
                                    </div>
                                </div>
                            @elseif($nomination->nominee_type === 'album' && $nomination->album)
                                <!-- Album Nomination -->
                                <div class="flex items-center gap-4 mb-4">
                                    @if($nomination->album->artwork)
                                        <img src="{{ Storage::url($nomination->album->artwork) }}" 
                                             alt="{{ $nomination->album->title }}" 
                                             class="w-20 h-20 rounded-lg object-cover">
                                    @else
                                        <div class="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                                            <span class="material-icons-round text-white text-3xl">album</span>
                                        </div>
                                    @endif
                                    <div class="flex-1">
                                        <h3 class="text-xl font-bold text-white mb-1">{{ $nomination->album->title }}</h3>
                                        <p class="text-sm text-gray-400">{{ $nomination->album->artist->stage_name ?? 'Various Artists' }}</p>
                                    </div>
                                </div>
                            @endif

                            @if($nomination->reason)
                                <p class="text-sm text-gray-400 mb-4 line-clamp-2">{{ $nomination->reason }}</p>
                            @endif

                            <!-- Vote Count -->
                            <div class="flex items-center gap-2 text-gray-400 mb-4">
                                <span class="material-icons-round text-[18px]">favorite</span>
                                <span class="text-sm">{{ number_format($nomination->votes_count ?? 0) }} votes</span>
                            </div>
                        </div>

                        <!-- Vote Button -->
                        @auth
                            @if($season->status === 'active')
                            <div class="px-6 py-4 bg-black/30 border-t border-gray-800">
                                @if(in_array($nomination->id, $userVotes))
                                    <button disabled class="w-full py-3 bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                                        <span class="material-icons-round text-[20px]">check_circle</span>
                                        <span>Voted</span>
                                    </button>
                                @else
                                    <button onclick="vote({{ $nomination->id }})" 
                                            class="vote-button w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                                        <span class="material-icons-round text-[20px]">how_to_vote</span>
                                        <span>Vote Now</span>
                                    </button>
                                @endif
                            </div>
                            @endif
                        @else
                            <div class="px-6 py-4 bg-black/30 border-t border-gray-800">
                                <a href="{{ route('login') }}" 
                                   class="block w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-center rounded-lg font-medium">
                                    Login to Vote
                                </a>
                            </div>
                        @endauth

                        <!-- Winner Badge -->
                        @if($nomination->is_winner)
                        <div class="absolute top-4 right-4">
                            <div class="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <span class="material-icons-round text-[16px]">emoji_events</span>
                                <span>WINNER</span>
                            </div>
                        </div>
                        @endif
                    </div>
                    @endforeach
                </div>
                @else
                <div class="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
                    <span class="material-icons-round text-gray-600 text-5xl mb-3">inbox</span>
                    <p class="text-gray-400">No nominations in this category yet</p>
                </div>
                @endif
            </div>
            @endforeach
        </div>
    @else
        <!-- Empty State -->
        <div class="text-center py-20">
            <div class="w-32 h-32 mx-auto mb-6 rounded-full bg-gray-900 border-4 border-gray-800 flex items-center justify-center">
                <span class="material-icons-round text-gray-600 text-6xl">category</span>
            </div>
            <h3 class="text-2xl font-bold text-white mb-2">No Categories Yet</h3>
            <p class="text-gray-400">Award categories will appear here once they're set up.</p>
        </div>
    @endif
</div>

@auth
@push('scripts')
<script>
async function vote(nominationId) {
    try {
        const response = await fetch(`/awards/vote/${nominationId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Accept': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            // Show success message
            alert(data.message || 'Vote recorded successfully!');
            // Reload page to update UI
            window.location.reload();
        } else {
            alert(data.message || 'Failed to record vote. Please try again.');
        }
    } catch (error) {
        console.error('Vote error:', error);
        alert('An error occurred. Please try again.');
    }
}
</script>
@endpush
@endauth
@endsection
