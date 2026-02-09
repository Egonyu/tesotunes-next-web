<div class="bg-gray-800 rounded-lg shadow-md border border-gray-700">
    <div class="p-4">
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <a href="{{ route('frontend.artist.show', $activity->user->id) }}">
                    <img src="{{ $activity->user->avatar_url ?? asset('images/default-avatar.svg') }}" 
                         alt="{{ $activity->user->name }}" 
                         class="w-11 h-11 rounded-full object-cover">
                </a>
                <div>
                    <a href="{{ route('frontend.artist.show', $activity->user->id) }}" 
                       class="font-bold text-white hover:underline">
                        {{ $activity->user->name }}
                    </a>
                    <p class="text-xs text-gray-400">{{ $activity->created_at->diffForHumans() }}</p>
                </div>
            </div>
            <button class="p-2 rounded-full hover:bg-white/10 text-gray-400">
                <span class="material-icons-round">more_horiz</span>
            </button>
        </div>
        <p class="mt-4 text-white">{{ $activity->description }}</p>
    </div>
    
    <!-- Event Card -->
    @if($activity->subject)
    <div class="mx-4 mb-4 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
        @if($activity->subject->banner_url)
        <img src="{{ $activity->subject->banner_url }}" 
             alt="{{ $activity->subject->title }}" 
             class="w-full h-48 object-cover">
        @endif
        <div class="p-4">
            <div class="flex gap-3">
                <div class="flex-shrink-0 text-center bg-gray-800 p-2 rounded-md">
                    <p class="text-xs text-brand-orange font-bold uppercase">{{ $activity->subject->event_date->format('M') }}</p>
                    <p class="text-lg font-bold text-white">{{ $activity->subject->event_date->format('d') }}</p>
                </div>
                <div class="flex-1">
                    <h3 class="font-bold text-lg text-white">{{ $activity->subject->title }}</h3>
                    <p class="text-sm text-gray-400 flex items-center mt-1">
                        <span class="material-icons-round text-xs mr-1">location_on</span>
                        {{ $activity->subject->location }}
                    </p>
                    <p class="text-sm text-gray-400 flex items-center mt-1">
                        <span class="material-icons-round text-xs mr-1">schedule</span>
                        {{ $activity->subject->event_date->format('g:i A') }}
                    </p>
                </div>
            </div>
            <a href="{{ route('frontend.events.show', $activity->subject->id) }}" 
               class="mt-4 w-full bg-brand-green text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-green-500 transition-colors block text-center">
                Get Tickets
            </a>
        </div>
    </div>
    @endif
    
    @include('frontend.partials.activity-actions', ['activity' => $activity])
</div>
