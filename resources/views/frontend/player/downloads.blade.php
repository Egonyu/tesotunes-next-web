@extends('frontend.layouts.music')

@section('title', 'Downloads')

@section('content')
<div class="min-h-screen bg-gray-900 text-white">
    <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold">Downloads</h1>
            <div class="flex space-x-4">
                <button class="text-gray-400 hover:text-white transition-colors">
                    <span class="material-icons-round">settings</span>
                </button>
                <button class="text-gray-400 hover:text-white transition-colors">
                    <span class="material-icons-round">delete</span>
                </button>
            </div>
        </div>

        <!-- Download info -->
        <div class="bg-gray-800 rounded-lg p-6 mb-8">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-lg font-semibold mb-2">Storage usage</h3>
                    <p class="text-gray-400">0 MB of downloaded music</p>
                </div>
                <div class="text-right">
                    <div class="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                        <span class="material-icons-round text-2xl">download</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Download quality settings -->
        <div class="bg-gray-800 rounded-lg p-6 mb-8">
            <h3 class="text-lg font-semibold mb-4">Download quality</h3>
            <div class="space-y-3">
                <label class="flex items-center cursor-pointer">
                    <input type="radio" name="quality" value="normal" class="text-green-500 mr-3" checked>
                    <div>
                        <p class="font-medium">Normal</p>
                        <p class="text-gray-400 text-sm">96 kbps • Good for saving data</p>
                    </div>
                </label>
                <label class="flex items-center cursor-pointer">
                    <input type="radio" name="quality" value="high" class="text-green-500 mr-3">
                    <div>
                        <p class="font-medium">High</p>
                        <p class="text-gray-400 text-sm">160 kbps • Good quality</p>
                    </div>
                </label>
                <label class="flex items-center cursor-pointer">
                    <input type="radio" name="quality" value="very_high" class="text-green-500 mr-3">
                    <div>
                        <p class="font-medium">Very high</p>
                        <p class="text-gray-400 text-sm">320 kbps • Best quality</p>
                    </div>
                </label>
            </div>
        </div>

        <!-- Downloaded content -->
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Downloaded music</h3>

            <!-- Empty state -->
            <div class="text-center py-16">
                <span class="material-icons-round text-6xl text-gray-600 mb-4">download</span>
                <h2 class="text-2xl font-semibold mb-4">No downloads yet</h2>
                <p class="text-gray-400 mb-8">Download music to listen offline</p>
                <button class="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-semibold transition-colors">
                    Browse music
                </button>
            </div>
        </div>
    </div>
</div>
@endsection