@extends('layouts.app')

@section('title', $topic->title . ' - Forum')

@push('styles')
<style>
    .reply-editor {
        min-height: 150px;
        resize: vertical;
    }
    .nested-replies {
        margin-left: 1.5rem;
        border-left: 2px solid #e5e7eb;
        padding-left: 1rem;
    }
    .dark .nested-replies {
        border-left-color: #30363D;
    }
    @media (max-width: 640px) {
        .nested-replies {
            margin-left: 0.75rem;
            padding-left: 0.75rem;
        }
    }
    .reply-modal-backdrop {
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
    }
</style>
@endpush

@section('content')
<div class="min-h-screen">
    {{-- Topic Header --}}
    <div class="bg-gradient-to-br from-brand-green via-emerald-600 to-teal-600 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {{-- Breadcrumb --}}
            <nav class="mb-4 flex items-center gap-2 text-sm">
                <a href="{{ route('forum.index') }}" class="text-white/70 hover:text-white transition flex items-center gap-1">
                    <span class="material-symbols-outlined text-lg">forum</span>
                    Forum
                </a>
                <span class="material-symbols-outlined text-white/50 text-lg">chevron_right</span>
                <a href="{{ route('forum.category', $topic->category->slug) }}" class="text-white/70 hover:text-white transition">
                    {{ $topic->category->name }}
                </a>
                <span class="material-symbols-outlined text-white/50 text-lg">chevron_right</span>
                <span class="text-white font-medium truncate max-w-[200px]">{{ $topic->title }}</span>
            </nav>

            <div class="flex flex-wrap items-center gap-2 mb-3">
                {{-- Category Badge --}}
                <a href="{{ route('forum.category', $topic->category->slug) }}"
                   class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm">
                    @if($topic->category->icon)
                        <span class="material-symbols-outlined mr-1.5 text-sm">{{ $topic->category->icon }}</span>
                    @endif
                    {{ $topic->category->name }}
                </a>
                
                {{-- Status Badges --}}
                @if($topic->is_pinned)
                    <span class="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-100 text-xs font-medium rounded-full">
                        <span class="material-symbols-outlined text-xs">push_pin</span>
                        Pinned
                    </span>
                @endif
                @if($topic->is_locked)
                    <span class="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-100 text-xs font-medium rounded-full">
                        <span class="material-symbols-outlined text-xs">lock</span>
                        Locked
                    </span>
                @endif
                @if($topic->is_featured)
                    <span class="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-100 text-xs font-medium rounded-full">
                        <span class="material-symbols-outlined text-xs">star</span>
                        Featured
                    </span>
                @endif
            </div>

            <h1 class="text-xl md:text-2xl font-bold text-white">{{ $topic->title }}</h1>
        </div>
    </div>

    {{-- Main Content --}}
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {{-- Topic Card --}}
        <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] overflow-hidden shadow-sm mb-6">
            {{-- Author Header --}}
            <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117]">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <img src="{{ $topic->user->avatar_url ?? asset('images/default-avatar.svg') }}" 
                             alt="{{ $topic->user->name ?? 'User' }}" 
                             class="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 dark:ring-[#30363D]">
                        <div>
                            <div class="font-semibold text-gray-900 dark:text-white">{{ $topic->user->name ?? 'Anonymous' }}</div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">{{ $topic->created_at->diffForHumans() }}</div>
                        </div>
                    </div>

                    {{-- Actions Dropdown --}}
                    @auth
                    <div class="relative" x-data="{ open: false }">
                        <button @click="open = !open" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-[#21262D] transition">
                            <span class="material-symbols-outlined">more_vert</span>
                        </button>
                        <div x-show="open" 
                             @click.away="open = false"
                             x-transition
                             class="absolute right-0 mt-2 w-48 bg-white dark:bg-[#21262D] rounded-xl shadow-xl border border-gray-200 dark:border-[#30363D] z-10 overflow-hidden">
                            @can('update', $topic)
                            <a href="{{ route('forum.topic.edit', $topic) }}" 
                               class="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#30363D] transition">
                                <span class="material-symbols-outlined text-lg">edit</span>
                                Edit Topic
                            </a>
                            @endcan
                            @can('pin', $topic)
                            <form action="{{ route('forum.topic.pin', $topic) }}" method="POST">
                                @csrf
                                <button type="submit" class="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#30363D] transition">
                                    <span class="material-symbols-outlined text-lg">push_pin</span>
                                    {{ $topic->is_pinned ? 'Unpin' : 'Pin' }} Topic
                                </button>
                            </form>
                            @endcan
                            @can('lock', $topic)
                            <form action="{{ route('forum.topic.lock', $topic) }}" method="POST">
                                @csrf
                                <button type="submit" class="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#30363D] transition">
                                    <span class="material-symbols-outlined text-lg">lock</span>
                                    {{ $topic->is_locked ? 'Unlock' : 'Lock' }} Topic
                                </button>
                            </form>
                            @endcan
                            @can('delete', $topic)
                            <form action="{{ route('forum.topic.destroy', $topic) }}" method="POST" 
                                  onsubmit="return confirm('Are you sure you want to delete this topic?')">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                                    <span class="material-symbols-outlined text-lg">delete</span>
                                    Delete Topic
                                </button>
                            </form>
                            @endcan
                        </div>
                    </div>
                    @endauth
                </div>
            </div>

            {{-- Topic Content --}}
            <div class="p-4 sm:p-6">
                <div class="prose prose-gray dark:prose-invert max-w-none">
                    {!! $topic->content !!}
                </div>

                {{-- Poll Section --}}
                @if($topic->poll)
                <div class="mt-6 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <span class="material-symbols-outlined text-blue-500">poll</span>
                        {{ $topic->poll->question }}
                    </h3>

                    @if($topic->poll->description)
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">{{ $topic->poll->description }}</p>
                    @endif

                    @if($topic->poll->isActive())
                        @auth
                            @if($topic->poll->userHasVoted(auth()->user()))
                                {{-- Show results --}}
                                <div class="space-y-3">
                                    @foreach($topic->poll->options as $option)
                                    @php
                                        $percentage = $topic->poll->total_votes > 0
                                            ? round(($option->votes_count / $topic->poll->total_votes) * 100, 1)
                                            : 0;
                                    @endphp
                                    <div class="relative">
                                        <div class="flex justify-between items-center mb-1">
                                            <span class="text-gray-800 dark:text-gray-200 text-sm">{{ $option->option_text }}</span>
                                            <span class="text-gray-500 dark:text-gray-400 text-sm">{{ $option->votes_count }} votes ({{ $percentage }}%)</span>
                                        </div>
                                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                 style="width: {{ $percentage }}%"></div>
                                        </div>
                                    </div>
                                    @endforeach
                                    <p class="text-gray-500 dark:text-gray-400 text-sm mt-3">
                                        Total votes: {{ number_format($topic->poll->total_votes) }}
                                    </p>
                                </div>
                            @else
                                {{-- Voting form --}}
                                <form action="{{ route('forum.poll.vote', $topic->poll->id) }}" method="POST">
                                    @csrf
                                    <div class="space-y-2 mb-4">
                                        @foreach($topic->poll->options as $option)
                                        <label class="flex items-center p-3 bg-white dark:bg-[#161B22] hover:bg-gray-50 dark:hover:bg-[#21262D] rounded-lg cursor-pointer transition border border-gray-200 dark:border-[#30363D]">
                                            <input type="{{ $topic->poll->allow_multiple_choices ? 'checkbox' : 'radio' }}"
                                                   name="{{ $topic->poll->allow_multiple_choices ? 'option_ids[]' : 'option_id' }}"
                                                   value="{{ $option->id }}"
                                                   class="text-blue-500 mr-3">
                                            <span class="text-gray-800 dark:text-gray-200">{{ $option->option_text }}</span>
                                        </label>
                                        @endforeach
                                    </div>
                                    <button type="submit"
                                            class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition">
                                        <span class="material-symbols-outlined text-sm mr-2">how_to_vote</span>
                                        Vote
                                    </button>
                                </form>
                            @endif
                        @else
                            <div class="text-center p-4">
                                <p class="text-gray-500 dark:text-gray-400 mb-3">Login to participate in this poll</p>
                                <a href="{{ route('login') }}"
                                   class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition">
                                    Login to Vote
                                </a>
                            </div>
                        @endauth
                    @else
                        {{-- Poll ended --}}
                        <div class="space-y-3">
                            <div class="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg p-3 mb-4">
                                <p class="text-amber-700 dark:text-amber-400 text-sm flex items-center gap-2">
                                    <span class="material-symbols-outlined text-sm">schedule</span>
                                    This poll has ended
                                    @if($topic->poll->ends_at)
                                        on {{ $topic->poll->ends_at->format('M j, Y \a\t g:i A') }}
                                    @endif
                                </p>
                            </div>

                            @foreach($topic->poll->options as $option)
                            @php
                                $percentage = $topic->poll->total_votes > 0
                                    ? round(($option->votes_count / $topic->poll->total_votes) * 100, 1)
                                    : 0;
                            @endphp
                            <div class="relative">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-gray-800 dark:text-gray-200 text-sm">{{ $option->option_text }}</span>
                                    <span class="text-gray-500 dark:text-gray-400 text-sm">{{ $option->votes_count }} votes ({{ $percentage }}%)</span>
                                </div>
                                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div class="bg-gray-400 dark:bg-gray-500 h-2 rounded-full transition-all duration-300"
                                         style="width: {{ $percentage }}%"></div>
                                </div>
                            </div>
                            @endforeach
                            <p class="text-gray-500 dark:text-gray-400 text-sm mt-3">
                                Total votes: {{ number_format($topic->poll->total_votes) }}
                            </p>
                        </div>
                    @endif
                </div>
                @endif

                {{-- Topic Stats --}}
                <div class="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-[#30363D] text-sm text-gray-500 dark:text-gray-400">
                    <span class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">visibility</span>
                        {{ number_format($topic->views_count) }} views
                    </span>
                    <span class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">chat_bubble</span>
                        {{ $topic->replies_count }} replies
                    </span>
                    <span class="flex items-center gap-1" id="topic-likes-count">
                        <span class="material-symbols-outlined text-sm">favorite</span>
                        <span id="likes-number">{{ $topic->likes_count ?? 0 }}</span> likes
                    </span>
                </div>
            </div>

            {{-- Topic Actions --}}
            <div class="p-4 sm:px-6 border-t border-gray-200 dark:border-[#30363D] flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                    @auth
                    @if(!$topic->is_locked)
                    <button onclick="openReplyModal()" 
                            class="inline-flex items-center gap-2 px-4 py-2 bg-brand-green hover:bg-emerald-600 text-white text-sm font-medium rounded-full transition">
                        <span class="material-symbols-outlined text-lg">reply</span>
                        Reply
                    </button>
                    @endif
                    @else
                    <a href="{{ route('login') }}" 
                       class="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-[#21262D] hover:bg-gray-300 dark:hover:bg-[#30363D] text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full transition">
                        Login to Reply
                    </a>
                    @endauth
                </div>
                <div class="flex items-center gap-2">
                    @auth
                    <button type="button" 
                            onclick="likeTopic('{{ $topic->slug }}')"
                            id="like-btn"
                            class="inline-flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-[#21262D] hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 text-gray-500 dark:text-gray-400 rounded-full transition">
                        <span class="material-symbols-outlined" id="like-icon">favorite</span>
                    </button>
                    @endauth
                    <button onclick="shareContent()" 
                            class="inline-flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-[#21262D] hover:bg-gray-200 dark:hover:bg-[#30363D] text-gray-500 dark:text-gray-400 rounded-full transition">
                        <span class="material-symbols-outlined">share</span>
                    </button>
                </div>
            </div>
        </div>

        {{-- Replies Section --}}
        <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] overflow-hidden shadow-sm mb-6">
            <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117]">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-brand-green">chat_bubble</span>
                    {{ $topic->replies_count }} {{ Str::plural('Reply', $topic->replies_count) }}
                </h2>
            </div>

            {{-- Replies List (Threaded) --}}
            <div id="replies-list">
                @forelse($replies as $reply)
                    @include('modules.forum.frontend.partials.reply-item', ['reply' => $reply, 'topic' => $topic, 'depth' => 0])
                @empty
                    <div class="p-12 text-center">
                        <span class="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4">chat_bubble_outline</span>
                        <p class="text-gray-500 dark:text-gray-400">No replies yet. Be the first to comment!</p>
                    </div>
                @endforelse
            </div>

            {{-- Pagination --}}
            @if($replies->hasPages())
            <div class="p-4 sm:p-6 border-t border-gray-200 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117]">
                {{ $replies->links() }}
            </div>
            @endif
        </div>

        {{-- Locked Topic Notice --}}
        @if($topic->is_locked)
        <div class="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-6 text-center mb-6">
            <span class="material-symbols-outlined text-4xl text-amber-500 mb-2">lock</span>
            <p class="text-amber-700 dark:text-amber-400">This topic has been locked and no longer accepts new replies.</p>
        </div>
        @endif

        {{-- Not logged in notice --}}
        @guest
        <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] p-8 text-center mb-6">
            <span class="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4">account_circle</span>
            <p class="text-gray-500 dark:text-gray-400 mb-4">You must be logged in to post a reply.</p>
            <a href="{{ route('login') }}" 
               class="inline-flex items-center gap-2 px-6 py-3 bg-brand-green hover:bg-emerald-600 text-white font-semibold rounded-full transition shadow-lg">
                <span class="material-symbols-outlined">login</span>
                Login to Reply
            </a>
        </div>
        @endguest

        {{-- Back to Category --}}
        <div class="mt-6">
            <a href="{{ route('forum.category', $topic->category->slug) }}" 
               class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand-green dark:hover:text-brand-green transition">
                <span class="material-symbols-outlined">arrow_back</span>
                Back to {{ $topic->category->name }}
            </a>
        </div>
    </div>
</div>

{{-- Reply Modal --}}
@auth
@if(!$topic->is_locked)
<div id="reply-modal" class="fixed inset-0 z-50 hidden">
    {{-- Backdrop --}}
    <div class="reply-modal-backdrop fixed inset-0" onclick="closeReplyModal()"></div>
    
    {{-- Modal Content --}}
    <div class="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden pointer-events-auto transform transition-all">
            
            {{-- Modal Header --}}
            <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117] flex items-center justify-between">
                <div>
                    <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-green">reply</span>
                        <span id="modal-title">Post a Reply</span>
                    </h2>
                    <p id="replying-to-text" class="text-sm text-gray-500 dark:text-gray-400 mt-1 hidden"></p>
                </div>
                <button onclick="closeReplyModal()" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-[#21262D] transition">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            {{-- Modal Body --}}
            <form action="{{ route('forum.reply.store', $topic) }}" method="POST" id="reply-form">
                @csrf
                <input type="hidden" name="parent_id" id="parent-id-input" value="">
                
                <div class="p-4 sm:p-6">
                    <textarea name="content"
                              id="reply-content"
                              class="reply-editor w-full px-4 py-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-[#30363D] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent resize-y"
                              placeholder="Write your reply here..."
                              required>{{ old('content') }}</textarea>
                    @error('content')
                        <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ $message }}</p>
                    @enderror
                    
                    <div class="mt-3 flex flex-wrap gap-2 text-xs text-gray-400 dark:text-gray-500">
                        <span class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-xs">format_bold</span>
                            **bold**
                        </span>
                        <span class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-xs">format_italic</span>
                            *italic*
                        </span>
                        <span class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-xs">alternate_email</span>
                            @mention
                        </span>
                    </div>
                </div>
                
                {{-- Modal Footer --}}
                <div class="p-4 sm:p-6 border-t border-gray-200 dark:border-[#30363D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50 dark:bg-[#0D1117]">
                    <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">info</span>
                        Be respectful and stay on topic
                    </p>
                    <div class="flex items-center gap-3">
                        <button type="button" onclick="closeReplyModal()" 
                                class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition">
                            Cancel
                        </button>
                        <button type="submit" 
                                class="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-green hover:bg-emerald-600 text-white font-semibold rounded-full transition shadow-lg">
                            <span class="material-symbols-outlined">send</span>
                            Post Reply
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
@endif
@endauth

{{-- Share Modal --}}
<div id="share-modal" class="fixed inset-0 z-50 hidden">
    {{-- Backdrop --}}
    <div class="reply-modal-backdrop fixed inset-0" onclick="closeShareModal()"></div>
    
    {{-- Modal Content --}}
    <div class="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto">
            
            {{-- Modal Header --}}
            <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117] flex items-center justify-between">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-brand-green">share</span>
                    Share this topic
                </h2>
                <button onclick="closeShareModal()" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-[#21262D] transition">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            {{-- Modal Body --}}
            <div class="p-4 sm:p-6 space-y-4">
                {{-- Copy Link --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Copy Link</label>
                    <div class="flex gap-2">
                        <input type="text" 
                               id="share-url" 
                               value="{{ url()->current() }}" 
                               readonly
                               class="flex-1 px-3 py-2 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-[#30363D] rounded-lg text-gray-900 dark:text-white text-sm">
                        <button onclick="copyShareLink()" 
                                class="px-4 py-2 bg-brand-green hover:bg-emerald-600 text-white font-medium rounded-lg transition flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">content_copy</span>
                            Copy
                        </button>
                    </div>
                </div>
                
                {{-- Social Share --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Share on</label>
                    <div class="flex gap-3">
                        <a href="https://twitter.com/intent/tweet?text={{ urlencode($topic->title) }}&url={{ urlencode(url()->current()) }}" 
                           target="_blank"
                           class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-black hover:bg-gray-800 text-white rounded-xl transition">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            X
                        </a>
                        <a href="https://www.facebook.com/sharer/sharer.php?u={{ urlencode(url()->current()) }}" 
                           target="_blank"
                           class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl transition">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            Facebook
                        </a>
                        <a href="https://wa.me/?text={{ urlencode($topic->title . ' ' . url()->current()) }}" 
                           target="_blank"
                           class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#22c55e] text-white rounded-xl transition">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                            WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    // Reply Modal Functions
    function openReplyModal(parentId = null, replyingToUser = null) {
        const modal = document.getElementById('reply-modal');
        const parentInput = document.getElementById('parent-id-input');
        const replyingToText = document.getElementById('replying-to-text');
        const modalTitle = document.getElementById('modal-title');
        
        if (parentId && replyingToUser) {
            parentInput.value = parentId;
            replyingToText.textContent = `Replying to ${replyingToUser}`;
            replyingToText.classList.remove('hidden');
            modalTitle.textContent = 'Reply to Comment';
        } else {
            parentInput.value = '';
            replyingToText.classList.add('hidden');
            modalTitle.textContent = 'Post a Reply';
        }
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Focus textarea
        setTimeout(() => {
            document.getElementById('reply-content').focus();
        }, 100);
    }
    
    function closeReplyModal() {
        const modal = document.getElementById('reply-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }
    
    // Share Modal Functions
    function shareContent() {
        // Try native share first
        if (navigator.share) {
            navigator.share({
                title: '{{ addslashes($topic->title) }}',
                url: window.location.href
            }).catch(() => {
                // If native share fails, show modal
                openShareModal();
            });
        } else {
            openShareModal();
        }
    }
    
    function openShareModal() {
        document.getElementById('share-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    function closeShareModal() {
        document.getElementById('share-modal').classList.add('hidden');
        document.body.style.overflow = '';
    }
    
    function copyShareLink() {
        const input = document.getElementById('share-url');
        input.select();
        document.execCommand('copy');
        
        // Show feedback
        const btn = event.target.closest('button');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span class="material-symbols-outlined text-sm">check</span> Copied!';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
        }, 2000);
    }
    
    // Like Topic Function (AJAX)
    function likeTopic(topicSlug) {
        const btn = document.getElementById('like-btn');
        const icon = document.getElementById('like-icon');
        const likesNumber = document.getElementById('likes-number');
        
        // Disable button temporarily
        btn.disabled = true;
        
        fetch(`/forum/topic/${topicSlug}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': '{{ csrf_token() }}',
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update UI
                const currentLikes = parseInt(likesNumber.textContent);
                if (data.action === 'liked') {
                    likesNumber.textContent = currentLikes + 1;
                    btn.classList.add('bg-red-100', 'dark:bg-red-900/30', 'text-red-500');
                    btn.classList.remove('bg-gray-100', 'dark:bg-[#21262D]', 'text-gray-500', 'dark:text-gray-400');
                    icon.style.fontVariationSettings = "'FILL' 1";
                } else {
                    likesNumber.textContent = Math.max(0, currentLikes - 1);
                    btn.classList.remove('bg-red-100', 'dark:bg-red-900/30', 'text-red-500');
                    btn.classList.add('bg-gray-100', 'dark:bg-[#21262D]', 'text-gray-500', 'dark:text-gray-400');
                    icon.style.fontVariationSettings = "'FILL' 0";
                }
            }
        })
        .catch(error => console.error('Error:', error))
        .finally(() => {
            btn.disabled = false;
        });
    }
    
    // Like Reply Function (AJAX)
    function likeReply(replyId, btn) {
        const icon = btn.querySelector('.material-symbols-outlined');
        const countSpan = btn.querySelector('span:last-child');
        
        btn.disabled = true;
        
        fetch(`/forum/reply/${replyId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': '{{ csrf_token() }}',
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const currentLikes = parseInt(countSpan.textContent);
                if (data.action === 'liked') {
                    countSpan.textContent = currentLikes + 1;
                    btn.classList.add('text-red-500');
                    btn.classList.remove('text-gray-400', 'dark:text-gray-500');
                    icon.style.fontVariationSettings = "'FILL' 1";
                } else {
                    countSpan.textContent = Math.max(0, currentLikes - 1);
                    btn.classList.remove('text-red-500');
                    btn.classList.add('text-gray-400', 'dark:text-gray-500');
                    icon.style.fontVariationSettings = "'FILL' 0";
                }
            }
        })
        .catch(error => console.error('Error:', error))
        .finally(() => {
            btn.disabled = false;
        });
    }
    
    // Close modals on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeReplyModal();
            closeShareModal();
        }
    });
    
    // Auto-resize textarea
    const textarea = document.getElementById('reply-content');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.max(150, this.scrollHeight) + 'px';
        });
    }
</script>
@endpush
