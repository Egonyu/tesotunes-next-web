@extends('layouts.app')

@section('title', 'Create New Poll')

@section('content')
<div class="min-h-screen">
    {{-- Header --}}
    <div class="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 dark:from-blue-900 dark:via-blue-900 dark:to-indigo-900">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 class="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <span class="material-symbols-outlined text-3xl">poll</span>
                        Create New Poll
                    </h1>
                    <p class="text-blue-200 mt-1">Ask the community a question and gather opinions</p>
                </div>
                <a href="{{ route('polls.index') }}"
                   class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium rounded-full transition">
                    <span class="material-symbols-outlined">arrow_back</span>
                    Back to Polls
                </a>
            </div>
        </div>
    </div>

    {{-- Main Content --}}
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] overflow-hidden shadow-sm">
            <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117]">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-blue-500">edit</span>
                    Poll Details
                </h2>
            </div>

            <form action="{{ route('polls.store') }}" method="POST" enctype="multipart/form-data" class="p-4 sm:p-6 space-y-6">
                @csrf
                <input type="hidden" name="poll_type" value="simple">

                {{-- Validation Errors --}}
                @if($errors->any())
                    <div class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
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

                {{-- Poll Question --}}
                <div>
                    <label for="question" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Poll Question <span class="text-red-500">*</span>
                    </label>
                    <input type="text"
                           id="question"
                           name="question"
                           value="{{ old('question') }}"
                           maxlength="255"
                           class="w-full px-4 py-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-[#30363D] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           placeholder="What would you like to ask the community?"
                           required>
                    @error('question')
                        <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ $message }}</p>
                    @enderror
                </div>

                {{-- Poll Description --}}
                <div>
                    <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description (Optional)
                    </label>
                    <textarea id="description"
                              name="description"
                              rows="3"
                              maxlength="1000"
                              class="w-full px-4 py-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-[#30363D] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                              placeholder="Provide additional context for your poll...">{{ old('description') }}</textarea>
                    @error('description')
                        <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ $message }}</p>
                    @enderror
                </div>

                {{-- Poll Image --}}
                <div>
                    <label for="image" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Poll Image (Optional)
                    </label>
                    <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 dark:border-[#30363D] border-dashed rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-gray-50 dark:bg-[#0D1117]">
                        <div class="space-y-1 text-center">
                            <span class="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-500">image</span>
                            <div class="flex text-sm text-gray-500 dark:text-gray-400">
                                <label for="image" class="relative cursor-pointer font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                                    <span>Upload an image</span>
                                    <input id="image" name="image" type="file" class="sr-only" accept="image/*">
                                </label>
                                <p class="pl-1">or drag and drop</p>
                            </div>
                            <p class="text-xs text-gray-400 dark:text-gray-500">PNG, JPG, GIF up to 2MB</p>
                        </div>
                    </div>
                    @error('image')
                        <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ $message }}</p>
                    @enderror
                </div>

                {{-- Poll Options --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Poll Options <span class="text-red-500">*</span>
                    </label>
                    <div id="poll-options" class="space-y-2">
                        <input type="text" name="options[]" placeholder="Option 1" required
                               class="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-[#30363D] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <input type="text" name="options[]" placeholder="Option 2" required
                               class="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-[#30363D] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <button type="button" onclick="addOption()" class="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition">
                        <span class="material-symbols-outlined text-sm">add</span>
                        Add Another Option
                    </button>
                    @error('options')
                        <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ $message }}</p>
                    @enderror
                </div>

                {{-- Poll Settings --}}
                <div class="border border-gray-200 dark:border-[#30363D] rounded-xl overflow-hidden">
                    <div class="p-4 bg-gray-50 dark:bg-[#0D1117] border-b border-gray-200 dark:border-[#30363D]">
                        <h3 class="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            <span class="material-symbols-outlined text-gray-400">settings</span>
                            Poll Settings
                        </h3>
                    </div>
                    <div class="p-4 space-y-4">
                        <label class="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" name="allow_multiple_choices" class="w-5 h-5 text-blue-600 bg-gray-100 dark:bg-[#0D1117] border-gray-300 dark:border-[#30363D] rounded focus:ring-blue-500">
                            <div>
                                <span class="font-medium text-gray-900 dark:text-white">Allow multiple choices</span>
                                <p class="text-sm text-gray-500 dark:text-gray-400">Users can select more than one option</p>
                            </div>
                        </label>
                        <label class="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" name="is_anonymous" class="w-5 h-5 text-blue-600 bg-gray-100 dark:bg-[#0D1117] border-gray-300 dark:border-[#30363D] rounded focus:ring-blue-500">
                            <div>
                                <span class="font-medium text-gray-900 dark:text-white">Anonymous voting</span>
                                <p class="text-sm text-gray-500 dark:text-gray-400">Votes will not show who voted</p>
                            </div>
                        </label>
                    </div>
                </div>

                {{-- End Date --}}
                <div>
                    <label for="ends_at" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Date (Optional)
                    </label>
                    <input type="datetime-local"
                           id="ends_at"
                           name="ends_at"
                           value="{{ old('ends_at') }}"
                           class="w-full px-4 py-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-[#30363D] rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">Leave empty for no end date</p>
                    @error('ends_at')
                        <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ $message }}</p>
                    @enderror
                </div>

                {{-- Submit Buttons --}}
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-5 border-t border-gray-200 dark:border-[#30363D]">
                    <a href="{{ route('polls.index') }}"
                       class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition">
                        Cancel
                    </a>
                    <button type="submit"
                            class="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition shadow-lg">
                        <span class="material-symbols-outlined">poll</span>
                        Create Poll
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
function addOption() {
    const container = document.getElementById('poll-options');
    const count = container.querySelectorAll('input').length + 1;
    
    if (count > 10) {
        alert('Maximum 10 options allowed.');
        return;
    }
    
    const div = document.createElement('div');
    div.className = 'relative';
    div.innerHTML = `
        <input type="text" name="options[]" placeholder="Option ${count}"
               class="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-[#30363D] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10">
        <button type="button" onclick="this.parentElement.remove()" class="absolute right-3 top-2.5 text-gray-400 hover:text-red-500 transition">
            <span class="material-symbols-outlined text-lg">close</span>
        </button>
    `;
    container.appendChild(div);
}
</script>
@endsection
