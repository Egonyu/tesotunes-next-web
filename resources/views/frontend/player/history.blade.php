@extends('frontend.layouts.music')

@section('title', 'Listening History')

@section('content')
<div class="min-h-screen bg-gray-900 text-white">
    <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold">Listening History</h1>
            <button class="text-gray-400 hover:text-white transition-colors">
                <span class="material-icons-round">delete</span>
                Clear all
            </button>
        </div>

        <!-- Filter options -->
        <div class="flex space-x-4 mb-8">
            <select class="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none">
                <option>All time</option>
                <option>Today</option>
                <option>Yesterday</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
            </select>
            <button class="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                <span class="material-icons-round text-sm mr-2">filter_list</span>
                Filter
            </button>
        </div>

        <!-- History list -->
        <div class="space-y-4">
            <!-- Sample history item -->
            <div class="flex items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <div class="w-12 h-12 bg-gray-600 rounded-lg mr-4 flex items-center justify-center">
                    <span class="material-icons-round text-gray-400">music_note</span>
                </div>
                <div class="flex-1">
                    <h3 class="font-medium">Sample Track</h3>
                    <p class="text-gray-400 text-sm">Artist Name • Album</p>
                </div>
                <div class="text-gray-400 text-sm mr-4">
                    2 hours ago
                </div>
                <button class="text-gray-400 hover:text-white transition-colors">
                    <span class="material-icons-round">more_vert</span>
                </button>
            </div>
        </div>

        <!-- Empty state -->
        <div class="text-center py-16">
            <span class="material-icons-round text-6xl text-gray-600 mb-4">history</span>
            <h2 class="text-2xl font-semibold mb-4">No listening history yet</h2>
            <p class="text-gray-400 mb-8">Start listening to music to see your history here</p>
            <button class="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-semibold transition-colors">
                Discover music
            </button>
        </div>
    </div>
</div>
@endsection