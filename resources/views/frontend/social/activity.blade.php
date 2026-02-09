@extends('frontend.layouts.music')

@section('title', 'My Activity')

@section('content')
<div class="p-6 space-y-6 max-w-4xl mx-auto">
    <div class="flex justify-between items-center">
        <h2 class="text-3xl font-bold text-white">My Activity</h2>
        <div class="flex gap-2">
            <button class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">All</button>
            <button class="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg text-sm">Plays</button>
            <button class="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg text-sm">Likes</button>
            <button class="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg text-sm">Comments</button>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-gray-800 rounded-xl p-6">
            <p class="text-gray-400 mb-2">Total Plays</p>
            <p class="text-3xl font-bold text-white">{{ number_format($totalPlays ?? 0) }}</p>
        </div>
        <div class="bg-gray-800 rounded-xl p-6">
            <p class="text-gray-400 mb-2">Songs Liked</p>
            <p class="text-3xl font-bold text-white">{{ number_format($totalLikes ?? 0) }}</p>
        </div>
        <div class="bg-gray-800 rounded-xl p-6">
            <p class="text-gray-400 mb-2">Comments</p>
            <p class="text-3xl font-bold text-white">{{ number_format($totalComments ?? 0) }}</p>
        </div>
    </div>

    @if(isset($activities) && $activities->count() > 0)
    <div class="bg-gray-800 rounded-xl divide-y divide-gray-700">
        @foreach($activities as $activity)
        <div class="p-4">
            <div class="flex gap-4">
                <div class="w-10 h-10 bg-{{ $activity->color ?? 'blue' }}-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="material-icons-round text-white text-sm">{{ $activity->icon }}</span>
                </div>
                <div class="flex-1">
                    <p class="text-white">{{ $activity->description }}</p>
                    <p class="text-sm text-gray-400 mt-1">{{ $activity->created_at->diffForHumans() }}</p>
                </div>
            </div>
        </div>
        @endforeach
    </div>
    <div class="mt-4">{{ $activities->links() }}</div>
    @else
    <div class="bg-gray-800 rounded-xl p-12 text-center">
        <span class="material-icons-round text-6xl text-gray-600 mb-4 block">event_note</span>
        <p class="text-gray-400 mb-4">No activity recorded yet</p>
        <a href="{{ route('frontend.timeline') }}" class="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">Start Listening</a>
    </div>
    @endif
</div>
@endsection
