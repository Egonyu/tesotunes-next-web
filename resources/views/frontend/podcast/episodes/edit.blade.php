@extends('frontend.layouts.music')

@section('title', 'Edit Episode - ' . $episode->title)

@section('content')
<div class="min-h-screen bg-white dark:bg-black">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
            <a href="{{ route('podcast.episode.show', [$podcast->slug, $episode->slug]) }}" 
               class="text-green-500 hover:text-green-400 mb-4 inline-flex items-center">
                <span class="material-icons-round text-sm">arrow_back</span>
                Back to Episode
            </a>
            <h1 class="text-3xl font-bold text-white mt-4">Edit Episode</h1>
            <p class="text-gray-400 mt-2">Update episode details</p>
        </div>

        <!-- Form -->
        <form action="{{ route('podcast.episode.update', [$podcast->slug, $episode->slug]) }}" 
              method="POST" 
              enctype="multipart/form-data"
              class="space-y-6">
            @csrf
            @method('PUT')

            <!-- Episode Title -->
            <div>
                <label for="title" class="block text-sm font-medium text-gray-300 mb-2">
                    Episode Title *
                </label>
                <input type="text" 
                       id="title" 
                       name="title" 
                       value="{{ old('title', $episode->title) }}"
                       class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                       required>
                @error('title')
                    <p class="mt-1 text-sm text-red-500">{{ $message }}</p>
                @enderror
            </div>

            <!-- Description -->
            <div>
                <label for="description" class="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                </label>
                <textarea id="description" 
                          name="description" 
                          rows="6"
                          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          required>{{ old('description', $episode->description) }}</textarea>
                @error('description')
                    <p class="mt-1 text-sm text-red-500">{{ $message }}</p>
                @enderror
            </div>

            <!-- Replace Audio File (Optional) -->
            <div>
                <label for="audio_file" class="block text-sm font-medium text-gray-300 mb-2">
                    Replace Audio File (Optional)
                </label>
                <div class="mb-3 text-sm text-gray-400">
                    <span class="material-icons-round text-xs align-middle">audiotrack</span>
                    Current: {{ $episode->file_name ?? 'episode-audio.mp3' }}
                </div>
                <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-lg hover:border-gray-600 transition-colors">
                    <div class="space-y-1 text-center">
                        <span class="material-icons-round text-gray-400 text-5xl">cloud_upload</span>
                        <div class="flex text-sm text-gray-400">
                            <label for="audio_file" class="relative cursor-pointer rounded-md font-medium text-green-500 hover:text-green-400">
                                <span>Upload a new file</span>
                                <input id="audio_file" name="audio_file" type="file" accept="audio/*" class="sr-only">
                            </label>
                            <p class="pl-1">or drag and drop</p>
                        </div>
                        <p class="text-xs text-gray-500">MP3, WAV, or M4A up to 200MB</p>
                    </div>
                </div>
                @error('audio_file')
                    <p class="mt-1 text-sm text-red-500">{{ $message }}</p>
                @enderror
            </div>

            <!-- Episode Number -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="episode_number" class="block text-sm font-medium text-gray-300 mb-2">
                        Episode Number
                    </label>
                    <input type="number" 
                           id="episode_number" 
                           name="episode_number" 
                           value="{{ old('episode_number', $episode->episode_number) }}"
                           class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                    @error('episode_number')
                        <p class="mt-1 text-sm text-red-500">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="season_number" class="block text-sm font-medium text-gray-300 mb-2">
                        Season Number
                    </label>
                    <input type="number" 
                           id="season_number" 
                           name="season_number" 
                           value="{{ old('season_number', $episode->season_number) }}"
                           class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                    @error('season_number')
                        <p class="mt-1 text-sm text-red-500">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <!-- Published At -->
            <div>
                <label for="published_at" class="block text-sm font-medium text-gray-300 mb-2">
                    Publish Date
                </label>
                <input type="datetime-local" 
                       id="published_at" 
                       name="published_at" 
                       value="{{ old('published_at', $episode->published_at?->format('Y-m-d\TH:i')) }}"
                       class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                @error('published_at')
                    <p class="mt-1 text-sm text-red-500">{{ $message }}</p>
                @enderror
            </div>

            <!-- Options -->
            <div class="space-y-4">
                <div class="flex items-center">
                    <input type="checkbox" 
                           id="is_premium" 
                           name="is_premium" 
                           value="1"
                           {{ old('is_premium', $episode->is_premium) ? 'checked' : '' }}
                           class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800">
                    <label for="is_premium" class="ml-2 block text-sm text-gray-300">
                        Premium episode (requires subscription)
                    </label>
                </div>

                <div class="flex items-center">
                    <input type="checkbox" 
                           id="explicit_content" 
                           name="explicit_content" 
                           value="1"
                           {{ old('explicit_content', $episode->explicit_content) ? 'checked' : '' }}
                           class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800">
                    <label for="explicit_content" class="ml-2 block text-sm text-gray-300">
                        Contains explicit content
                    </label>
                </div>
            </div>

            <!-- Submit Buttons -->
            <div class="flex items-center justify-between pt-6 border-t border-gray-700">
                <button type="button" 
                        onclick="deleteEpisode()"
                        class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors">
                    <span class="material-icons-round text-sm align-middle mr-1">delete</span>
                    Delete Episode
                </button>
                <div class="flex space-x-4">
                    <a href="{{ route('podcast.episode.show', [$podcast->slug, $episode->slug]) }}" 
                       class="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                        Cancel
                    </a>
                    <button type="submit" 
                            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors">
                        <span class="material-icons-round text-sm align-middle mr-1">save</span>
                        Save Changes
                    </button>
                </div>
            </div>
        </form>

        <!-- Delete Form (Hidden) -->
        <form id="delete-form" 
              action="{{ route('podcast.episode.destroy', [$podcast->slug, $episode->slug]) }}" 
              method="POST" 
              class="hidden">
            @csrf
            @method('DELETE')
        </form>
    </div>
</div>

@push('scripts')
<script>
function deleteEpisode() {
    if (confirm('Are you sure you want to delete this episode? This action cannot be undone.')) {
        document.getElementById('delete-form').submit();
    }
}
</script>
@endpush
@endsection
