@extends('frontend.layouts.music')

@section('title', 'About')

@section('content')
<div class="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
        <h1 class="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
            About Tesotunes
        </h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto">
            The future of music streaming, built for artists and music lovers alike.
        </p>
    </div>

    <div class="space-y-12">
        <div class="bg-gray-900/50 rounded-2xl p-8">
            <h2 class="text-2xl font-bold mb-4">Our Mission</h2>
            <p class="text-gray-300 text-lg leading-relaxed">
                We believe music is the universal language that connects us all. Our mission is to create a platform where artists can share their creativity and listeners can discover their next favorite song, while ensuring fair compensation and transparent relationships.
            </p>
        </div>

        <div class="bg-gray-900/50 rounded-2xl p-8">
            <h2 class="text-2xl font-bold mb-4">For Artists</h2>
            <p class="text-gray-300 text-lg leading-relaxed">
                Upload your music, connect with fans, and get paid fairly. Our platform provides powerful analytics, promotional tools, and direct fan engagement features to help you grow your audience and your career.
            </p>
        </div>

        <div class="bg-gray-900/50 rounded-2xl p-8">
            <h2 class="text-2xl font-bold mb-4">For Listeners</h2>
            <p class="text-gray-300 text-lg leading-relaxed">
                Discover new music, support your favorite artists, and enjoy high-quality streaming. Create playlists, follow artists, and be part of a community that celebrates musical diversity.
            </p>
        </div>
    </div>
</div>
@endsection