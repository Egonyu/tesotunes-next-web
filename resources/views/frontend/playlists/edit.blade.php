@extends('frontend.layouts.music')

@section('title', 'Edit Playlist')

@section('content')
<div class="p-6 space-y-6 max-w-4xl mx-auto">
    <div class="flex justify-between items-center">
        <h2 class="text-3xl font-bold text-white">Edit Playlist</h2>
        <a href="{{ route('playlists.show', $playlist) }}" class="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <span class="material-icons-round text-sm">arrow_back</span>
            Back
        </a>
    </div>

    <form action="{{ route('playlists.update', $playlist) }}" method="POST" enctype="multipart/form-data" class="bg-gray-800 rounded-xl p-6 space-y-6">
        @csrf
        @method('PUT')

        <div class="flex gap-6">
            <div class="flex-shrink-0">
                <img src="{{ $playlist->cover_image ?? asset('images/default-playlist.png') }}" alt="Cover" class="w-48 h-48 rounded-lg object-cover" id="coverPreview">
                <input type="file" name="cover_image" accept="image/*" class="mt-3 w-full text-sm text-gray-400" onchange="previewCover(event)">
            </div>

            <div class="flex-1 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Playlist Name</label>
                    <input type="text" name="name" value="{{ $playlist->name }}" required class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-600">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea name="description" rows="4" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-600">{{ $playlist->description }}</textarea>
                </div>

                <div>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="is_public" value="1" {{ $playlist->is_public ? 'checked' : '' }} class="rounded">
                        <span class="text-white">Make playlist public</span>
                    </label>
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <a href="{{ route('playlists.show', $playlist) }}" class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">Cancel</a>
            <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">Save Changes</button>
        </div>
    </form>
</div>

<script>
function previewCover(event) {
    const reader = new FileReader();
    reader.onload = function() {
        document.getElementById('coverPreview').src = reader.result;
    }
    reader.readAsDataURL(event.target.files[0]);
}
</script>
@endsection
