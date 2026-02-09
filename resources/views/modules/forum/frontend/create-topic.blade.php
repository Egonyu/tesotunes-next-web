@extends('layouts.app')

@section('title', isset($topic) ? 'Edit Topic' : 'Create New Topic')

@push('styles')
<link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
<style>
    .category-tag {
        @apply inline-flex items-center px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200;
        @apply bg-gray-100 dark:bg-[#21262D] text-gray-700 dark:text-gray-300;
        @apply border-2 border-gray-200 dark:border-[#30363D];
        @apply hover:border-brand-green dark:hover:border-brand-green hover:bg-gray-50 dark:hover:bg-[#30363D];
    }
    .category-tag.selected {
        @apply bg-brand-green/10 dark:bg-brand-green/20 text-brand-green border-brand-green;
    }
    .category-tag:hover {
        transform: translateY(-2px);
    }
    .category-tag .category-icon {
        @apply w-10 h-10 rounded-lg flex items-center justify-center text-lg mr-3;
    }

    /* Quill Editor Theme */
    .ql-toolbar.ql-snow {
        border: 1px solid #e5e7eb !important;
        border-bottom: none !important;
        background: #f9fafb !important;
        border-radius: 12px 12px 0 0 !important;
    }
    .dark .ql-toolbar.ql-snow {
        border-color: #30363D !important;
        background: #0D1117 !important;
    }
    .ql-container.ql-snow {
        border: 1px solid #e5e7eb !important;
        background: #ffffff !important;
        color: #111827 !important;
        border-radius: 0 0 12px 12px !important;
        min-height: 300px;
    }
    .dark .ql-container.ql-snow {
        border-color: #30363D !important;
        background: #161B22 !important;
        color: #f9fafb !important;
    }
    .ql-editor {
        min-height: 250px;
    }
    .dark .ql-editor {
        color: #f9fafb !important;
    }
    .ql-editor.ql-blank::before {
        color: #9ca3af !important;
        font-style: normal !important;
    }
    .dark .ql-editor.ql-blank::before {
        color: #6b7280 !important;
    }
    .ql-toolbar.ql-snow .ql-stroke {
        stroke: #6b7280 !important;
    }
    .dark .ql-toolbar.ql-snow .ql-stroke {
        stroke: #9ca3af !important;
    }
    .ql-toolbar.ql-snow .ql-fill {
        fill: #6b7280 !important;
    }
    .dark .ql-toolbar.ql-snow .ql-fill {
        fill: #9ca3af !important;
    }
    .ql-toolbar.ql-snow button:hover .ql-stroke,
    .ql-toolbar.ql-snow button.ql-active .ql-stroke {
        stroke: #10B981 !important;
    }
    .ql-toolbar.ql-snow button:hover .ql-fill,
    .ql-toolbar.ql-snow button.ql-active .ql-fill {
        fill: #10B981 !important;
    }
    .ql-snow .ql-picker {
        color: #6b7280 !important;
    }
    .dark .ql-snow .ql-picker {
        color: #9ca3af !important;
    }
</style>
@endpush

@section('content')
<div class="min-h-screen">
    {{-- Header --}}
    <div class="bg-gradient-to-br from-brand-green via-emerald-600 to-teal-600 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 class="text-2xl md:text-3xl font-bold text-white">
                        {{ isset($topic) ? 'Edit Topic' : 'Start a New Discussion' }}
                    </h1>
                    <p class="text-emerald-100 mt-1">Share your thoughts with the TesoTunes community</p>
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
        {{-- Validation Errors --}}
        @if($errors->any())
            <div class="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-red-500 text-xl mt-0.5">error</span>
                    <div>
                        <h4 class="text-sm font-medium text-red-800 dark:text-red-300">Please fix the following errors:</h4>
                        <ul class="mt-2 text-sm text-red-700 dark:text-red-400 list-disc list-inside space-y-1">
                            @foreach($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                </div>
            </div>
        @endif

        <form action="{{ isset($topic) ? route('forum.topic.update', $topic->id) : route('forum.topic.store') }}" method="POST" id="topic-form">
            @csrf
            @if(isset($topic))
                @method('PATCH')
            @endif

            <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] overflow-hidden shadow-sm">
                {{-- Category Selection --}}
                @if($category)
                    {{-- Show selected category when coming from category page --}}
                    <div class="p-6 border-b border-gray-200 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117]">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                                     style="background-color: {{ $category->color }}15; color: {{ $category->color }}">
                                    <span class="material-symbols-outlined text-xl">{{ $category->icon }}</span>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-gray-900 dark:text-white">{{ $category->name }}</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Posting in this category</p>
                                </div>
                            </div>
                            <a href="{{ route('forum.topic.create') }}"
                               class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-[#21262D] hover:bg-gray-200 dark:hover:bg-[#30363D] text-gray-600 dark:text-gray-400 text-xs font-medium rounded-lg transition">
                                <span class="material-symbols-outlined text-sm">edit</span>
                                Change
                            </a>
                        </div>
                        <input type="hidden" name="category_id" value="{{ $category->id }}" required>
                    </div>
                @else
                    <div class="p-6 border-b border-gray-200 dark:border-[#30363D]">
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span class="material-symbols-outlined text-brand-green">category</span>
                                    Choose a Category
                                </h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Select the most relevant category for your discussion</p>
                            </div>
                            <a href="{{ route('forum.suggest-category') }}"
                               class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-400 text-xs font-medium rounded-lg transition">
                                <span class="material-symbols-outlined text-sm">add_circle</span>
                                Suggest Category
                            </a>
                        </div>

                        <input type="hidden" name="category_id" id="category-input" value="{{ old('category_id', request('category_id', '')) }}">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" x-data="categorySelector()">
                            @forelse($categories as $cat)
                                <button type="button"
                                        class="group relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left"
                                        :class="selectedCategory == '{{ $cat->id }}' 
                                            ? 'border-brand-green bg-brand-green/5 dark:bg-brand-green/10 shadow-md' 
                                            : 'border-gray-200 dark:border-[#30363D] bg-white dark:bg-[#161B22] hover:border-gray-300 dark:hover:border-[#484F58] hover:shadow-sm'"
                                        @click="selectCategory('{{ $cat->id }}')">
                                    <div class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm"
                                         style="background-color: {{ $cat->color }}20; color: {{ $cat->color }}">
                                        <span class="material-symbols-outlined">{{ $cat->icon }}</span>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <span class="font-semibold block truncate text-gray-900 dark:text-white">{{ $cat->name }}</span>
                                        <span class="text-xs text-gray-500 dark:text-gray-400">{{ $cat->topics_count ?? 0 }} topics</span>
                                        @if($cat->description)
                                            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">{{ $cat->description }}</p>
                                        @endif
                                    </div>
                                    <div class="flex-shrink-0">
                                        <span class="material-symbols-outlined text-xl text-gray-300 dark:text-gray-600" x-show="selectedCategory != '{{ $cat->id }}'">radio_button_unchecked</span>
                                        <span class="material-symbols-outlined text-xl text-brand-green" x-show="selectedCategory == '{{ $cat->id }}'">check_circle</span>
                                    </div>
                                </button>
                            @empty
                                <div class="col-span-full text-center py-8">
                                    <span class="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-2">category</span>
                                    <p class="text-gray-500 dark:text-gray-400">No categories available.</p>
                                </div>
                            @endforelse
                        </div>
                        @error('category_id')
                            <p class="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">error</span>
                                {{ $message }}
                            </p>
                        @enderror
                    </div>
                @endif

                <div class="p-6 space-y-6">
                    {{-- Title --}}
                    <div>
                        <label for="title-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Topic Title <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                            <input type="text"
                                   name="title"
                                   id="title-input"
                                   value="{{ old('title', $topic->title ?? '') }}"
                                   required
                                   maxlength="255"
                                   class="w-full px-4 py-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-[#30363D] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                                   placeholder="Enter a clear, descriptive title">
                            <div class="absolute right-3 top-3.5 text-xs text-gray-400 dark:text-gray-500">
                                <span id="title-count">0</span>/255
                            </div>
                        </div>
                        @error('title')
                            <p class="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">error</span>
                                {{ $message }}
                            </p>
                        @enderror
                    </div>

                    {{-- Content Editor --}}
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Content <span class="text-red-500">*</span>
                        </label>
                        <div id="quill-editor">
                            {!! old('content', $topic->content ?? '') !!}
                        </div>
                        <textarea name="content" id="content-input" style="display:none;" required></textarea>
                        <div class="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>💡 Be respectful and constructive in your discussions</span>
                            <span id="content-count">0/10,000</span>
                        </div>
                        @error('content')
                            <p class="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">error</span>
                                {{ $message }}
                            </p>
                        @enderror
                    </div>

                    {{-- Poll Option --}}
                    <div x-data="{ showPoll: {{ isset($topic) && $topic->poll ? 'true' : 'false' }} }" 
                         class="border border-gray-200 dark:border-[#30363D] rounded-xl overflow-hidden">
                        <div class="p-4 bg-gray-50 dark:bg-[#0D1117] border-b border-gray-200 dark:border-[#30363D]">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <span class="material-symbols-outlined text-blue-500">poll</span>
                                    <div>
                                        <h4 class="font-medium text-gray-900 dark:text-white">Add a Poll</h4>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">Make your topic interactive</p>
                                    </div>
                                </div>
                                <button type="button"
                                        @click="showPoll = !showPoll"
                                        class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-lg transition">
                                    <span class="material-symbols-outlined text-sm" x-text="showPoll ? 'remove' : 'add'"></span>
                                    <span x-text="showPoll ? 'Remove' : 'Add'"></span>
                                </button>
                            </div>
                        </div>
                        <div x-show="showPoll" x-transition class="p-4 space-y-4">
                            <input type="text"
                                   name="poll_question"
                                   placeholder="What would you like to ask?"
                                   value="{{ old('poll_question', $topic->poll->question ?? '') }}"
                                   class="w-full px-4 py-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-[#30363D] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <div id="poll-options" class="space-y-2">
                                <input type="text" name="poll_options[]" placeholder="Option 1"
                                       class="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-[#30363D] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <input type="text" name="poll_options[]" placeholder="Option 2"
                                       class="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-[#30363D] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <button type="button" onclick="addPollOption()" class="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition">
                                <span class="material-symbols-outlined text-sm">add</span>
                                Add Another Option
                            </button>
                            <div class="flex flex-wrap gap-4 pt-2">
                                <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                    <input type="checkbox" name="poll_multiple_choice" class="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-[#0D1117] border-gray-300 dark:border-[#30363D] rounded focus:ring-blue-500">
                                    Allow multiple choices
                                </label>
                                <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                    <input type="checkbox" name="poll_anonymous" class="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-[#0D1117] border-gray-300 dark:border-[#30363D] rounded focus:ring-blue-500">
                                    Anonymous voting
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Actions --}}
                <div class="p-6 bg-gray-50 dark:bg-[#0D1117] border-t border-gray-200 dark:border-[#30363D]">
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div class="flex items-center gap-4">
                            <a href="{{ route('forum.index') }}"
                               class="inline-flex items-center gap-2 px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition">
                                <span class="material-symbols-outlined">close</span>
                                Cancel
                            </a>
                            <span class="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">Follow community guidelines</span>
                        </div>
                        <button type="submit"
                                class="inline-flex items-center gap-2 px-8 py-3 bg-brand-green hover:bg-emerald-600 text-white font-semibold rounded-full transition shadow-lg">
                            <span class="material-symbols-outlined">{{ isset($topic) ? 'save' : 'send' }}</span>
                            {{ isset($topic) ? 'Update Topic' : 'Post Topic' }}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    </div>
</div>
@endsection

@push('scripts')
<script src="https://cdn.quilljs.com/1.3.6/quill.min.js"></script>
<script>
    // Category selector functionality
    function categorySelector() {
        return {
            selectedCategory: '{{ old('category_id', request('category_id', $category->id ?? $topic->category_id ?? '')) }}',
            init() {
                // Sync with hidden input on init
                this.updateHiddenInput();
            },
            selectCategory(categoryId) {
                this.selectedCategory = categoryId;
                this.updateHiddenInput();
            },
            updateHiddenInput() {
                const input = document.getElementById('category-input');
                if (input) {
                    input.value = this.selectedCategory;
                }
            }
        }
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize Quill Editor
        const quill = new Quill('#quill-editor', {
            theme: 'snow',
            placeholder: 'Share your thoughts, ask questions, or start a discussion...',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['blockquote', 'code-block'],
                    ['link'],
                    [{ 'align': [] }],
                    ['clean']
                ]
            }
        });

        // Sync Quill content with hidden textarea
        const contentInput = document.getElementById('content-input');
        const contentCount = document.getElementById('content-count');

        function updateContent() {
            const html = quill.root.innerHTML;
            const text = quill.getText();
            contentInput.value = html;
            const length = text.trim().length;
            contentCount.textContent = `${length}/10,000`;
        }

        quill.on('text-change', updateContent);
        updateContent();

        // Title character counter
        const titleInput = document.getElementById('title-input');
        const titleCount = document.getElementById('title-count');

        function updateTitleCount() {
            titleCount.textContent = titleInput.value.length;
        }

        titleInput.addEventListener('input', updateTitleCount);
        updateTitleCount();

        // Form validation
        const form = document.getElementById('topic-form');
        form.addEventListener('submit', function(e) {
            updateContent();

            const categoryInput = document.getElementById('category-input');
            if (!categoryInput || !categoryInput.value) {
                e.preventDefault();
                alert('Please select a category for your topic.');
                return false;
            }

            const text = quill.getText().trim();
            if (text.length < 10) {
                e.preventDefault();
                alert('Please write at least 10 characters in your topic content.');
                quill.focus();
                return false;
            }
            
            // Allow form to submit
            return true;
        });
    });

    // Poll option management
    function addPollOption() {
        const container = document.getElementById('poll-options');
        const count = container.querySelectorAll('input').length + 1;

        if (count > 10) {
            alert('Maximum 10 poll options allowed.');
            return;
        }

        const div = document.createElement('div');
        div.className = 'relative';
        div.innerHTML = `
            <input type="text"
                   name="poll_options[]"
                   placeholder="Option ${count}"
                   class="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-[#30363D] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10">
            <button type="button"
                    onclick="this.parentElement.remove()"
                    class="absolute right-3 top-2.5 text-gray-400 hover:text-red-500 transition">
                <span class="material-symbols-outlined text-lg">close</span>
            </button>
        `;
        container.appendChild(div);
    }
</script>
@endpush
