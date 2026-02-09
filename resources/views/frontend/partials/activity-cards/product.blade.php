<div class="bg-gray-800 rounded-lg shadow-md border border-gray-700">
    <div class="p-4">
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
                @if($activity->subject && $activity->subject->store)
                <img src="{{ $activity->subject->store->logo_url ?? asset('images/default-avatar.svg') }}" 
                     alt="{{ $activity->subject->store->name }}" 
                     class="w-11 h-11 rounded-full object-cover">
                <div>
                    <p class="font-bold text-white">{{ $activity->subject->store->name }}</p>
                    <p class="text-xs text-gray-400">Sponsored</p>
                </div>
                @else
                <img src="{{ $activity->user->avatar_url ?? asset('images/default-avatar.svg') }}" 
                     alt="{{ $activity->user->name }}" 
                     class="w-11 h-11 rounded-full object-cover">
                <div>
                    <p class="font-bold text-white">{{ $activity->user->name }}</p>
                    <p class="text-xs text-gray-400">{{ $activity->created_at->diffForHumans() }}</p>
                </div>
                @endif
            </div>
            <button class="p-2 rounded-full hover:bg-white/10 text-gray-400">
                <span class="material-icons-round">more_horiz</span>
            </button>
        </div>
        <p class="mt-4 text-white">{{ $activity->description }}</p>
    </div>
    
    <!-- Product Image with Overlay -->
    @if($activity->subject)
    <div class="px-4 pb-4">
        <div class="relative">
            <img src="{{ $activity->subject->featured_image_url ?? asset('images/default-product.png') }}" 
                 alt="{{ $activity->subject->name }}" 
                 class="w-full h-auto object-cover rounded-lg">
            <div class="absolute bottom-0 left-0 w-full h-2/5 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg"></div>
            <div class="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                    <h3 class="font-bold text-lg text-white">{{ $activity->subject->name }}</h3>
                    <p class="text-brand-green font-semibold">
                        UGX {{ number_format($activity->subject->price_ugx) }}
                        @if($activity->subject->price_credits > 0)
                        <span class="text-sm text-yellow-400 ml-2">or {{ $activity->subject->price_credits }} credits</span>
                        @endif
                    </p>
                </div>
                <a href="{{ route('frontend.store.products.show', $activity->subject->slug ?? $activity->subject->id) }}" 
                   class="bg-brand-green text-white font-semibold py-2 px-5 rounded-full hover:bg-green-500 transition-colors shrink-0">
                    Shop Now
                </a>
            </div>
        </div>
    </div>
    @endif
    
    @include('frontend.partials.activity-actions', ['activity' => $activity])
</div>
