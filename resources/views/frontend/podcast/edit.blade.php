@extends('frontend.layouts.music')

@section('title', 'Edit ' . $podcast->title . ' - Tesotunes')

@section('content')
<div class="min-h-screen bg-black text-white py-8">
    <div class="max-w-4xl mx-auto px-4">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-white mb-2">Edit Podcast</h1>
            <p class="text-gray-400">Update your podcast information</p>
        </div>

        <!-- Edit Form -->
        <form action="{{ route('podcast.update', $podcast->slug) }}" method="POST" enctype="multipart/form-data" class="bg-[#181818] rounded-lg p-6">
            @csrf
            @method('PUT')

            <!-- Podcast Cover -->
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-300 mb-2">Podcast Cover</label>
                <div class="flex items-center space-x-4">
                    <div id="coverPreview" class="w-32 h-32 bg-[#282828] rounded-lg flex items-center justify-center overflow-hidden">
                        @if($podcast->cover_image)
                            <img src="{{ $podcast->cover_image }}" alt="{{ $podcast->title }}" class="w-full h-full object-cover">
                        @else
                            <svg class="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        @endif
                    </div>
                    <div>
                        <input type="file" name="cover_image" id="coverImage" accept="image/*" class="hidden">
                        <button type="button" onclick="document.getElementById('coverImage').click()" class="px-4 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition">
                            Change Image
                        </button>
                        <p class="text-xs text-gray-500 mt-2">Minimum 1400x1400px, JPG or PNG</p>
                    </div>
                </div>
                @error('cover_image')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Podcast Title -->
            <div class="mb-6">
                <label for="title" class="block text-sm font-medium text-gray-300 mb-2">Podcast Title *</label>
                <input type="text" name="title" id="title" value="{{ old('title', $podcast->title) }}" required
                       class="w-full bg-[#282828] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-green-600 focus:outline-none">
                @error('title')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Description -->
            <div class="mb-6">
                <label for="description" class="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                <textarea name="description" id="description" rows="5" required
                          class="w-full bg-[#282828] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-green-600 focus:outline-none">{{ old('description', $podcast->description) }}</textarea>
                @error('description')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Category -->
            <div class="mb-6">
                <label for="category_id" class="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                <select name="category_id" id="category_id" required
                        class="w-full bg-[#282828] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-green-600 focus:outline-none">
                    <option value="">Select a category</option>
                    @foreach($categories as $category)
                        <option value="{{ $category->id }}" {{ old('category_id', $podcast->category_id) == $category->id ? 'selected' : '' }}>
                            {{ $category->name }}
                        </option>
                    @endforeach
                </select>
                @error('category_id')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Language -->
            <div class="mb-6">
                <label for="language" class="block text-sm font-medium text-gray-300 mb-2">Language *</label>
                <select name="language" id="language" required
                        class="w-full bg-[#282828] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-green-600 focus:outline-none">
                    <option value="en" {{ old('language', $podcast->language) == 'en' ? 'selected' : '' }}>English</option>
                    <option value="lg" {{ old('language', $podcast->language) == 'lg' ? 'selected' : '' }}>Luganda</option>
                    <option value="sw" {{ old('language', $podcast->language) == 'sw' ? 'selected' : '' }}>Swahili</option>
                </select>
                @error('language')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Explicit Content -->
            <div class="mb-6">
                <label class="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" name="explicit" value="1" {{ old('explicit', $podcast->explicit) ? 'checked' : '' }}
                           class="w-5 h-5 bg-[#282828] border-gray-700 rounded focus:ring-[#1db954]">
                    <span class="text-gray-300">This podcast contains explicit content</span>
                </label>
            </div>

            <!-- Submit Buttons -->
            <div class="flex items-center justify-between pt-6 border-t border-gray-800">
                <a href="{{ route('podcast.show', $podcast->slug) }}" class="px-6 py-2 text-gray-400 hover:text-white transition">
                    Cancel
                </a>
                <div class="flex items-center space-x-4">
                    @if($podcast->status !== 'published')
                        <form action="{{ route('podcast.publish', $podcast->slug) }}" method="POST" class="inline">
                            @csrf
                            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition">
                                Publish
                            </button>
                        </form>
                    @endif
                    <button type="submit" class="px-8 py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition">
                        Save Changes
                    </button>
                </div>
            </div>
        </form>

        <!-- Episodes Management -->
        <div class="mt-8 bg-[#181818] rounded-lg p-6">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-white">Episodes</h2>
                <a href="{{ route('podcast.episode.create', $podcast->slug) }}" class="px-6 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition">
                    Add Episode
                </a>
            </div>

            @if($podcast->episodes->count() > 0)
                <div class="space-y-3">
                    @foreach($podcast->episodes as $episode)
                        <div class="flex items-center justify-between bg-[#282828] rounded-lg p-4">
                            <div class="flex-1">
                                <h3 class="text-white font-medium">{{ $episode->title }}</h3>
                                <p class="text-sm text-gray-400 mt-1">{{ $episode->published_at?->format('M d, Y') }} • {{ gmdate('H:i:s', $episode->duration ?? 0) }}</p>
                            </div>
                            <div class="flex items-center space-x-2">
                                <a href="{{ route('podcast.episode.edit', [$podcast->slug, $episode->slug]) }}" class="px-4 py-2 text-gray-400 hover:text-white transition">
                                    Edit
                                </a>
                                <form action="{{ route('podcast.episode.destroy', [$podcast->slug, $episode->slug]) }}" method="POST" 
                                      onsubmit="return confirm('Are you sure you want to delete this episode?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="px-4 py-2 text-red-400 hover:text-red-300 transition">
                                        Delete
                                    </button>
                                </form>
                            </div>
                        </div>
                    @endforeach
                </div>
            @else
                <p class="text-gray-400 text-center py-8">No episodes yet. Add your first episode to get started!</p>
            @endif
        </div>
    </div>
</div>

@push('scripts')
<script>
    // Preview cover image
    document.getElementById('coverImage').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('coverPreview').innerHTML = 
                    `<img src="${e.target.result}" class="w-full h-full object-cover">`;
            }
            reader.readAsDataURL(file);
        }
    });
</script>
@endpush
@endsection
