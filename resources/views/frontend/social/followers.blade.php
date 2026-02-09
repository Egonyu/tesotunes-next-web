@extends('frontend.layouts.music')

@section('title', 'Followers')

@section('content')
<div class="p-6 space-y-6 max-w-4xl mx-auto">
    <h2 class="text-3xl font-bold text-white">Followers ({{ $followers->total() }})</h2>

    @if($followers->count() > 0)
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @foreach($followers as $follower)
        <div class="bg-gray-800 rounded-xl p-6 text-center">
            <img src="{{ $follower->avatar_url ?? asset('images/default-avatar.svg') }}" alt="{{ $follower->name }}" class="w-20 h-20 rounded-full mx-auto mb-3">
            <h3 class="font-semibold text-white mb-1">{{ $follower->name }}</h3>
            <p class="text-sm text-gray-400 mb-4">{{ $follower->followers_count }} followers</p>
            <div class="flex gap-2">
                <a href="{{ route('profile.show', $follower) }}" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">View</a>
                @if(auth()->user()->isFollowing($follower))
                <button onclick="unfollow({{ $follower->id }})" class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Unfollow</button>
                @else
                <button onclick="follow({{ $follower->id }})" class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Follow Back</button>
                @endif
            </div>
        </div>
        @endforeach
    </div>
    <div class="mt-4">{{ $followers->links() }}</div>
    @else
    <div class="bg-gray-800 rounded-xl p-12 text-center">
        <span class="material-icons-round text-6xl text-gray-600 mb-4 block">people_outline</span>
        <p class="text-gray-400">No followers yet</p>
    </div>
    @endif
</div>

<script>
function follow(userId) {
    fetch(`/api/users/${userId}/follow`, { method: 'POST', headers: { 'X-CSRF-TOKEN': '{{ csrf_token() }}' } })
        .then(() => location.reload());
}

function unfollow(userId) {
    fetch(`/api/users/${userId}/unfollow`, { method: 'POST', headers: { 'X-CSRF-TOKEN': '{{ csrf_token() }}' } })
        .then(() => location.reload());
}
</script>
@endsection
