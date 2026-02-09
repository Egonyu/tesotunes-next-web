@extends('layouts.app')

@section('title', 'Suggest New Category - Forum')

@section('content')
<div class="min-h-screen">
    {{-- Header --}}
    <div class="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 dark:from-purple-900 dark:via-purple-900 dark:to-indigo-900">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 class="text-2xl md:text-3xl font-bold text-white">Suggest New Category</h1>
                    <p class="text-purple-200 mt-1">Help us improve the forum by suggesting new categories</p>
                </div>
                <a href="{{ route('forum.index') }}"
                   class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium rounded-full transition">
                    <span class="material-symbols-outlined">arrow_back</span>
                    Back to Forum
                </a>
            </div>
        </div>
    </div>

    {{-- Main Content --}}
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {{-- Info Section --}}
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 mb-6">
            <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-blue-500 mt-0.5">info</span>
                <div>
                    <h3 class="font-semibold text-blue-800 dark:text-blue-300 mb-2">How Category Suggestions Work</h3>
                    <ul class="text-blue-700 dark:text-blue-400 text-sm space-y-1">
                        <li>• Your suggestion will be posted for community discussion</li>
                        <li>• Moderators and users can provide feedback</li>
                        <li>• Popular suggestions may be implemented</li>
                        <li>• Please check existing categories first to avoid duplicates</li>
                    </ul>
                </div>
            </div>
        </div>

        {{-- Current Categories --}}
        <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] overflow-hidden shadow-sm mb-6">
            <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117]">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-brand-green">category</span>
                    Current Categories
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Check if your suggested category already exists</p>
            </div>

            <div class="p-4 sm:p-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    @php
                        $categories = App\Models\Modules\Forum\ForumCategory::where('is_active', true)->orderBy('sort_order')->get();
                    @endphp

                    @forelse($categories as $category)
                        <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#0D1117] rounded-xl border border-gray-100 dark:border-[#30363D]">
                            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                                 style="background-color: {{ $category->color }}15; color: {{ $category->color }}">
                                <span class="material-symbols-outlined text-xl">{{ $category->icon }}</span>
                            </div>
                            <div class="min-w-0">
                                <h4 class="font-medium text-gray-900 dark:text-white truncate">{{ $category->name }}</h4>
                                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ Str::limit($category->description, 40) }}</p>
                            </div>
                        </div>
                    @empty
                        <div class="col-span-2 text-center py-4 text-gray-500 dark:text-gray-400">
                            No categories available yet.
                        </div>
                    @endforelse
                </div>
            </div>
        </div>

        {{-- Suggestion Form --}}
        <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] overflow-hidden shadow-sm">
            <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117]">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-purple-500">add_circle</span>
                    Suggest New Category
                </h2>
            </div>

            <form action="{{ route('forum.suggest-category.store') }}" method="POST" class="p-4 sm:p-6 space-y-5">
                @csrf

                {{-- Category Name --}}
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category Name <span class="text-red-500">*</span>
                    </label>
                    <input type="text"
                           id="name"
                           name="name"
                           value="{{ old('name') }}"
                           maxlength="255"
                           class="w-full px-4 py-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-[#30363D] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                           placeholder="e.g., Music Reviews, Live Performances, etc."
                           required>
                    @error('name')
                        <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ $message }}</p>
                    @enderror
                </div>

                {{-- Category Description --}}
                <div>
                    <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category Description <span class="text-red-500">*</span>
                    </label>
                    <textarea id="description"
                              name="description"
                              rows="4"
                              maxlength="1000"
                              class="w-full px-4 py-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-[#30363D] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
                              placeholder="Describe what kind of discussions would belong in this category..."
                              required>{{ old('description') }}</textarea>
                    @error('description')
                        <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ $message }}</p>
                    @enderror
                </div>

                {{-- Reason for Suggestion --}}
                <div>
                    <label for="reason" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Why is this category needed? <span class="text-red-500">*</span>
                    </label>
                    <textarea id="reason"
                              name="reason"
                              rows="3"
                              maxlength="500"
                              class="w-full px-4 py-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-[#30363D] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
                              placeholder="Explain why this category would be valuable to the community..."
                              required>{{ old('reason') }}</textarea>
                    @error('reason')
                        <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ $message }}</p>
                    @enderror
                </div>

                {{-- Submit Buttons --}}
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-5 border-t border-gray-200 dark:border-[#30363D]">
                    <a href="{{ route('forum.index') }}"
                       class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition">
                        Cancel
                    </a>
                    <button type="submit"
                            class="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full transition shadow-lg">
                        <span class="material-symbols-outlined">send</span>
                        Submit Suggestion
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
