@extends('frontend.layouts.music')

@section('title', 'Your Library')

@section('content')
<div class="min-h-screen py-8">
    <div class="container mx-auto px-4 sm:px-6">
        <div class="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
            <div>
                <h1 class="text-3xl font-bold text-primary">Your Library</h1>
                <p class="text-secondary mt-1">All your saved music in one place</p>
            </div>
            <div class="flex space-x-4">
                <button class="btn-secondary w-10 h-10 p-0 flex items-center justify-center">
                    <span class="material-icons-round icon-md">search</span>
                </button>
                <button class="btn-secondary w-10 h-10 p-0 flex items-center justify-center">
                    <span class="material-icons-round icon-md">sort</span>
                </button>
            </div>
        </div>

        <!-- Filter tabs -->
        <div class="flex space-x-6 mb-8 border-b border-gray-700/50">
            <button class="text-primary font-semibold border-b-2 border-brand pb-2">All</button>
            <button class="text-secondary hover:text-primary transition-colors pb-2">Playlists</button>
            <button class="text-secondary hover:text-primary transition-colors pb-2">Artists</button>
            <button class="text-secondary hover:text-primary transition-colors pb-2">Albums</button>
        </div>

        <!-- Recently played -->
        <div class="mb-8">
            <h2 class="text-xl font-semibold text-primary mb-4">Recently played</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div class="card-hover p-4 cursor-pointer">
                    <div class="w-full aspect-square bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg mb-3 flex items-center justify-center">
                        <span class="material-icons-round text-3xl text-white">favorite</span>
                    </div>
                    <p class="font-medium truncate text-primary">Liked Songs</p>
                    <p class="text-secondary text-sm">Playlist</p>
                </div>
            </div>
        </div>

        <!-- Made for you / Empty State -->
        <div class="mb-8">
            <h2 class="text-xl font-semibold text-primary mb-4">Made for you</h2>
            <div class="card text-center py-16">
                <span class="material-icons-round text-gray-600 icon-xl mb-4 block">library_music</span>
                <h3 class="text-xl font-semibold text-primary mb-2">Your library is empty</h3>
                <p class="text-secondary mb-6">Start by following artists and creating playlists</p>
                <a href="{{ route('frontend.timeline') }}" class="btn-primary inline-block">
                    Browse music
                </a>
            </div>
        </div>
    </div>
</div>
@endsection