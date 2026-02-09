@extends('layouts.auth')

@section('title', 'Become an Artist - Step 1')

@section('content')
<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
        
        <!-- Header -->
        <div class="text-center">
            <div class="flex justify-center mb-6">
                <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                    </svg>
                </div>
            </div>
            <h2 class="text-3xl font-bold text-white mb-2">
                Artist Registration
            </h2>
            <p class="text-gray-400">
                Step 1 of 3: Basic Information
            </p>
        </div>

        <!-- Progress Bar -->
        <div class="flex items-center justify-between">
            <div class="flex items-center flex-1">
                <div class="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">1</div>
                <div class="flex-1 h-1 bg-green-500 mx-2"></div>
            </div>
            <div class="flex items-center flex-1">
                <div class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold">2</div>
                <div class="flex-1 h-1 bg-gray-700 mx-2"></div>
            </div>
            <div class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold">3</div>
        </div>

        <!-- Registration Form -->
        <div class="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <form method="POST" action="{{ route('artist.register.step1') }}" enctype="multipart/form-data">
                @csrf

                <!-- Info Card -->
                <div class="mb-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <div class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                        </svg>
                        <div class="text-sm">
                            <p class="text-blue-300 font-medium mb-1">Welcome!</p>
                            <p class="text-blue-200/80">Let's set up your artist profile. This will be how fans discover your music.</p>
                        </div>
                    </div>
                </div>

                <!-- Stage Name -->
                <div class="mb-6">
                    <label for="stage_name" class="block text-sm font-medium text-gray-300 mb-2">
                        Artist/Stage Name <span class="text-red-400">*</span>
                    </label>
                    <input
                        id="stage_name"
                        name="stage_name"
                        type="text"
                        required
                        value="{{ old('stage_name', $data['stage_name'] ?? '') }}"
                        class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:outline-none @error('stage_name') border-red-500 @enderror"
                        placeholder="e.g., DJ Awesome"
                    >
                    @error('stage_name')
                        <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                    @enderror
                    <p class="text-gray-500 text-xs mt-1">This is how fans will find you</p>
                </div>

                <!-- Genre -->
                <div class="mb-6">
                    <label for="genre_id" class="block text-sm font-medium text-gray-300 mb-2">
                        Primary Genre <span class="text-red-400">*</span>
                    </label>
                    <select
                        id="genre_id"
                        name="genre_id"
                        required
                        class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:outline-none @error('genre_id') border-red-500 @enderror"
                    >
                        <option value="">Select your genre</option>
                        @foreach($genres as $genre)
                            <option value="{{ $genre->id }}" {{ old('genre_id', $data['genre_id'] ?? '') == $genre->id ? 'selected' : '' }}>
                                {{ $genre->name }}
                            </option>
                        @endforeach
                    </select>
                    @error('genre_id')
                        <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Bio -->
                <div class="mb-6">
                    <label for="bio" class="block text-sm font-medium text-gray-300 mb-2">
                        Bio <span class="text-gray-500">(Optional)</span>
                    </label>
                    <textarea
                        id="bio"
                        name="bio"
                        rows="3"
                        maxlength="500"
                        class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:outline-none @error('bio') border-red-500 @enderror"
                        placeholder="Tell us about your music..."
                    >{{ old('bio', $data['bio'] ?? '') }}</textarea>
                    @error('bio')
                        <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                    @enderror
                    <p class="text-gray-500 text-xs mt-1">Maximum 500 characters</p>
                </div>

                <!-- Profile Photo -->
                <div class="mb-6">
                    <label for="avatar" class="block text-sm font-medium text-gray-300 mb-2">
                        Profile Photo <span class="text-gray-500">(Optional)</span>
                    </label>
                    <input
                        id="avatar"
                        name="avatar"
                        type="file"
                        accept="image/*"
                        class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:outline-none @error('avatar') border-red-500 @enderror"
                    >
                    @error('avatar')
                        <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                    @enderror
                    <p class="text-gray-500 text-xs mt-1">JPG, PNG or GIF. Max 5MB</p>
                </div>

                <!-- Submit Button -->
                <button
                    type="submit"
                    class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                    Continue to Step 2
                </button>
            </form>
        </div>

        <!-- Sign In Link -->
        <div class="text-center mt-4">
            <p class="text-gray-400">
                Already have an account?
                <a href="{{ route('login') }}" class="text-green-500 hover:text-green-400 font-medium">
                    Sign in
                </a>
            </p>
        </div>
    </div>
</div>
@endsection
