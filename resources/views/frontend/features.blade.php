@extends('frontend.layouts.music')

@section('title', 'Features')

@section('content')
<div class="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
        <h1 class="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
            Powerful Features
        </h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto">
            Everything you need for the ultimate music experience.
        </p>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div class="bg-gray-900/50 rounded-2xl p-8 hover:bg-gray-900/70 transition-all duration-300">
            <div class="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <span class="material-icons-round text-white">high_quality</span>
            </div>
            <h3 class="text-xl font-bold mb-3">Hi-Fi Audio</h3>
            <p class="text-gray-300">Stream in lossless quality up to 24-bit/192kHz for crystal clear sound.</p>
        </div>

        <div class="bg-gray-900/50 rounded-2xl p-8 hover:bg-gray-900/70 transition-all duration-300">
            <div class="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <span class="material-icons-round text-white">offline_bolt</span>
            </div>
            <h3 class="text-xl font-bold mb-3">Offline Mode</h3>
            <p class="text-gray-300">Download your favorite tracks and listen anywhere, even without internet.</p>
        </div>

        <div class="bg-gray-900/50 rounded-2xl p-8 hover:bg-gray-900/70 transition-all duration-300">
            <div class="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <span class="material-icons-round text-white">psychology</span>
            </div>
            <h3 class="text-xl font-bold mb-3">Smart Discovery</h3>
            <p class="text-gray-300">AI-powered recommendations that learn and adapt to your musical taste.</p>
        </div>

        <div class="bg-gray-900/50 rounded-2xl p-8 hover:bg-gray-900/70 transition-all duration-300">
            <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <span class="material-icons-round text-white">people</span>
            </div>
            <h3 class="text-xl font-bold mb-3">Social Features</h3>
            <p class="text-gray-300">Follow friends, share playlists, and discover what others are listening to.</p>
        </div>

        <div class="bg-gray-900/50 rounded-2xl p-8 hover:bg-gray-900/70 transition-all duration-300">
            <div class="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                <span class="material-icons-round text-white">upload</span>
            </div>
            <h3 class="text-xl font-bold mb-3">Artist Tools</h3>
            <p class="text-gray-300">Upload music, track analytics, and connect directly with your fans.</p>
        </div>

        <div class="bg-gray-900/50 rounded-2xl p-8 hover:bg-gray-900/70 transition-all duration-300">
            <div class="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
                <span class="material-icons-round text-white">star</span>
            </div>
            <h3 class="text-xl font-bold mb-3">Music Awards</h3>
            <p class="text-gray-300">Vote for your favorite artists and tracks in our annual music awards.</p>
        </div>
    </div>
</div>
@endsection