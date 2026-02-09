@extends('frontend.layouts.music')

@section('title', 'Following')

@section('content')
<div class="min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-primary mb-2">Following</h1>
            <p class="text-secondary">People and artists you follow</p>
        </div>

        <!-- Following List / Empty State -->
        <div class="card">
            <div class="p-6">
                <div class="text-center py-12">
                    <div class="w-24 h-24 mx-auto bg-gray-700/30 rounded-full flex items-center justify-center mb-4">
                        <span class="material-icons-round text-gray-600 icon-xl">people</span>
                    </div>
                    <p class="text-secondary mb-2">You're not following anyone yet</p>
                    <p class="text-muted text-sm mb-6">Discover and follow your favorite artists</p>
                    <a href="{{ route('frontend.artists') }}" class="btn-primary inline-flex items-center gap-2">
                        <span class="material-icons-round icon-sm">explore</span>
                        Discover Artists
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection