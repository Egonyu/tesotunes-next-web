@props(['placement', 'page', 'class' => ''])

@php
    $adService = app(\App\Services\AdService::class);
    $userAgent = request()->userAgent();
    $device = (str_contains(strtolower($userAgent ?? ''), 'mobile') || 
               str_contains(strtolower($userAgent ?? ''), 'android') ||
               str_contains(strtolower($userAgent ?? ''), 'iphone')) ? 'mobile' : 'desktop';
    $ad = $adService->getAd($placement, $page, $device);
@endphp

@if($ad)
    <div {{ $attributes->merge(['class' => "ad-slot ad-placement-{$placement} {$class}"]) }} 
         data-ad-id="{{ $ad->id }}"
         x-data="adSlot({{ $ad->id }}, '{{ $placement }}')"
         x-init="init()">
        
        @if($ad->type === 'google_adsense')
            {{-- Google AdSense --}}
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="{{ config('services.adsense.client_id') }}"
                 data-ad-slot="{{ $ad->adsense_slot_id }}"
                 data-ad-format="{{ $ad->adsense_format ?? 'auto' }}"
                 data-full-width-responsive="true"></ins>
            
            @once
            @push('scripts')
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ config('services.adsense.client_id') }}"
                    crossorigin="anonymous"></script>
            <script>
                (adsbygoogle = window.adsbygoogle || []).push({});
            </script>
            @endpush
            @endonce
            
        @elseif($ad->type === 'direct')
            {{-- Direct Ad (Custom HTML) --}}
            @if($ad->html_code)
                <div class="direct-ad-content">
                    {!! $ad->html_code !!}
                </div>
            @elseif($ad->image_url && $ad->link_url)
                <a href="{{ $ad->link_url }}" 
                   target="_blank" 
                   rel="noopener sponsored nofollow"
                   class="block w-full overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
                   @click="recordClick()"
                   aria-label="Advertisement from {{ $ad->advertiser_name ?? 'sponsor' }}">
                    <img src="{{ $ad->image_url }}" 
                         alt="{{ $ad->advertiser_name ?? 'Advertisement' }}" 
                         class="w-full h-auto">
                </a>
            @endif
            
        @elseif($ad->type === 'affiliate')
            {{-- Affiliate Link --}}
            <div class="affiliate-ad-content">
                {!! $ad->html_code !!}
            </div>
        @endif
        
        {{-- Ad Label (FTC Compliance & Transparency) --}}
        <div class="text-xs text-gray-500 text-center mt-2 flex items-center justify-center gap-1">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
            <span>Advertisement</span>
        </div>
    </div>
    
    @once
    @push('scripts')
    <script>
    function adSlot(adId, placement) {
        return {
            recorded: false,
            
            init() {
                // Record impression when 50% visible for 1 second
                this.observeVisibility();
            },
            
            observeVisibility() {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && !this.recorded) {
                            setTimeout(() => {
                                if (entry.isIntersecting && !this.recorded) {
                                    this.recordImpression();
                                }
                            }, 1000);
                        }
                    });
                }, { threshold: 0.5 });
                
                observer.observe(this.$el);
            },
            
            async recordImpression() {
                if (this.recorded) return;
                this.recorded = true;
                
                try {
                    await fetch('/api/ads/impression', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                        },
                        body: JSON.stringify({
                            ad_id: adId,
                            page_url: window.location.href
                        })
                    });
                } catch (error) {
                    console.error('Failed to record ad impression:', error);
                }
            },
            
            async recordClick() {
                try {
                    await fetch('/api/ads/click', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                        },
                        body: JSON.stringify({
                            ad_id: adId
                        })
                    });
                } catch (error) {
                    console.error('Failed to record ad click:', error);
                }
            }
        }
    }
    </script>
    @endpush
    @endonce
@endif
