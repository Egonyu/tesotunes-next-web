@extends('layouts.admin')

@section('title', 'Edit Promotion')

@section('content')
<div class="p-6">
    <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-6">
            <a href="{{ route('admin.promotions.show', $promotion) }}" class="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center">
                <span class="material-icons-round text-sm mr-1">arrow_back</span>
                Back to Promotion
            </a>
            <h1 class="text-2xl font-bold text-gray-900 mt-2">Edit Promotion</h1>
        </div>

        <!-- Form -->
        <form action="{{ route('admin.promotions.update', $promotion) }}" method="POST" class="bg-white rounded-lg shadow p-6 space-y-6">
            @csrf
            @method('PUT')

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Promotion Title</label>
                <input type="text" name="title" value="{{ $promotion['title'] ?? '' }}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea name="description" rows="4" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">{{ $promotion['description'] ?? '' }}</textarea>
            </div>

            <div class="grid grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input type="date" name="start_date" value="{{ $promotion['start_date'] ?? '' }}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input type="date" name="end_date" value="{{ $promotion['end_date'] ?? '' }}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Budget (UGX)</label>
                <input type="number" name="budget" value="{{ $promotion['budget'] ?? '' }}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>

            <div class="flex justify-between pt-6 border-t">
                <button type="button" onclick="deletePromotion()" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Delete Promotion
                </button>
                <div class="flex space-x-4">
                    <a href="{{ route('admin.promotions.show', $promotion) }}" class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                        Cancel
                    </a>
                    <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Save Changes
                    </button>
                </div>
            </div>
        </form>

        <form id="delete-form" action="{{ route('admin.promotions.destroy', $promotion) }}" method="POST" class="hidden">
            @csrf
            @method('DELETE')
        </form>
    </div>
</div>

@push('scripts')
<script>
function deletePromotion() {
    if (confirm('Are you sure you want to delete this promotion? This action cannot be undone.')) {
        document.getElementById('delete-form').submit();
    }
}
</script>
@endpush
@endsection
