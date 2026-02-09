<div class="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <div class="p-4">
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <img src="{{ $activity->user->avatar_url }}" alt="{{ $activity->user->name }}" class="w-11 h-11 rounded-full object-cover">
                <div>
                    <div class="flex items-center space-x-1">
                        <p class="font-bold text-gray-900 dark:text-white">{{ $activity->user->name }}</p>
                        @if($activity->user->is_verified ?? false)
                        <span class="material-symbols-outlined text-blue-500 text-base" style="font-variation-settings: 'FILL' 1">verified</span>
                        @endif
                    </div>
                    <p class="text-xs text-gray-600 dark:text-gray-400">{{ $activity->created_at->diffForHumans() }}</p>
                </div>
            </div>
            <div class="relative" x-data="{ open: false }">
                <button @click="open = !open" class="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                    <span class="material-symbols-outlined text-gray-600 dark:text-gray-400">more_horiz</span>
                </button>
                <div x-show="open" @click.away="open = false" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10" style="display: none;">
                    <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-t-lg text-gray-900 dark:text-white">Save Post</a>
                    <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white">Hide Post</a>
                    <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white">Report</a>
                </div>
            </div>
        </div>
        <p class="mt-4 font-semibold text-lg text-gray-900 dark:text-white">{{ $activity->subject->question ?? $activity->description }}</p>
        
        <!-- Poll Options -->
        @php
            $hasVoted = auth()->check() && method_exists($activity->subject, 'hasUserVoted') 
                ? $activity->subject->hasUserVoted(auth()->id()) 
                : false;
            $totalVotes = $activity->subject->total_votes ?? 0;
        @endphp
        <div class="mt-4 space-y-3" x-data="{ voted: {{ $hasVoted ? 'true' : 'false' }} }">
            @if(isset($activity->subject->options))
                @foreach($activity->subject->options as $option)
                @php
                    $percentage = $totalVotes > 0 ? round(($option->votes_count ?? 0) / $totalVotes * 100, 1) : 0;
                @endphp
                <div 
                    class="relative w-full bg-gray-200 dark:bg-gray-700 rounded-lg p-3 text-sm font-medium transition-colors"
                    :class="voted ? 'cursor-default' : 'cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600'"
                    @click="if (!voted) { votePoll({{ $option->id }}, {{ $activity->subject->id }}); voted = true; }"
                >
                    <div class="absolute top-0 left-0 h-full bg-brand-green rounded-lg transition-all" 
                         style="width: {{ $percentage }}%;" 
                         x-show="voted"></div>
                    <div class="relative flex justify-between">
                        <span class="text-gray-900 dark:text-white" :class="{'text-white mix-blend-difference': voted && {{ $percentage }} > 50}">{{ $option->text ?? $option->option }}</span>
                        <span class="font-semibold text-gray-900 dark:text-white" :class="{'text-white mix-blend-difference': voted && {{ $percentage }} > 50}" x-show="voted">{{ $percentage }}%</span>
                    </div>
                </div>
                @endforeach
            @else
                <p class="text-sm text-gray-400">No poll options available</p>
            @endif
        </div>
        <p class="text-xs text-gray-600 dark:text-gray-400 mt-3">
            {{ number_format($totalVotes) }} {{ Str::plural('vote', $totalVotes) }}
            @if(isset($activity->subject->is_closed) && $activity->subject->is_closed)
            • Poll closed
            @elseif(isset($activity->subject->ends_at))
            • Ends {{ $activity->subject->ends_at->diffForHumans() }}
            @endif
        </p>
    </div>
    
    <div class="flex justify-around p-2 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
        <button class="flex items-center space-x-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
            <span class="material-symbols-outlined">favorite</span>
            <span class="text-sm font-semibold">{{ number_format($activity->likes_count ?? 0) }}</span>
        </button>
        <button class="flex items-center space-x-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
            <span class="material-symbols-outlined">chat_bubble</span>
            <span class="text-sm font-semibold">{{ number_format($activity->comments_count ?? 0) }}</span>
        </button>
        <button class="flex items-center space-x-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
            <span class="material-symbols-outlined">share</span>
            <span class="text-sm font-semibold">{{ number_format($activity->shares_count ?? 0) }}</span>
        </button>
        <button class="flex items-center space-x-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
            <span class="material-symbols-outlined">bookmark</span>
        </button>
    </div>
</div>

<script>
function votePoll(optionId, pollId) {
    fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({ option_id: optionId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Reload page to show updated results
            window.location.reload();
        }
    })
    .catch(error => console.error('Error voting:', error));
}
</script>
