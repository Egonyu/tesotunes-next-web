@props([
    'src',
    'alt' => '',
    'sizes' => null,
    'placeholder' => null,
    'class' => '',
    'eager' => false,
    'width' => null,
    'height' => null
])

@php
    $sizesArray = is_string($sizes) ? json_decode($sizes, true) : $sizes;
    $defaultSrc = $sizesArray['small'] ?? $src;
    $placeholderSrc = $placeholder ?? 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23666" font-size="20"%3ELoading...%3C/text%3E%3C/svg%3E';
@endphp

<img 
    src="{{ $eager ? $defaultSrc : $placeholderSrc }}"
    {{ $eager ? '' : 'data-src="' . $defaultSrc . '"' }}
    @if($sizesArray)
        {{ $eager ? 'srcset' : 'data-srcset' }}="
            {{ $sizesArray['small'] ?? '' }} 320w,
            {{ $sizesArray['medium'] ?? '' }} 640w,
            {{ $sizesArray['large'] ?? '' }} 1024w
        "
        sizes="(max-width: 640px) 320px, (max-width: 1024px) 640px, 1024px"
    @endif
    alt="{{ $alt }}"
    @if($width) width="{{ $width }}" @endif
    @if($height) height="{{ $height }}" @endif
    {{ $attributes->merge(['class' => ($eager ? '' : 'lazy-load ') . $class]) }}
    {{ $eager ? 'loading="eager"' : 'loading="lazy"' }}
>

@once
@push('scripts')
<script>
// Intersection Observer for lazy loading images
(function() {
    if (!('IntersectionObserver' in window)) {
        // Fallback for older browsers
        document.querySelectorAll('.lazy-load').forEach(img => {
            if (img.dataset.src) img.src = img.dataset.src;
            if (img.dataset.srcset) img.srcset = img.dataset.srcset;
        });
        return;
    }
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Load high-res image
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
                
                // Load srcset
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                }
                
                // Add loaded class for animations
                img.classList.remove('lazy-load');
                img.classList.add('lazy-loaded');
                
                // Fade in animation
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s';
                
                img.onload = () => {
                    img.style.opacity = '1';
                };
                
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px', // Start loading 50px before entering viewport
        threshold: 0.01
    });
    
    // Observe all lazy-load images
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.lazy-load').forEach(img => {
            imageObserver.observe(img);
        });
    });
    
    // Re-observe dynamically added images
    if (window.Alpine) {
        document.addEventListener('alpine:initialized', () => {
            const observer = new MutationObserver(() => {
                document.querySelectorAll('.lazy-load:not([data-observed])').forEach(img => {
                    img.dataset.observed = 'true';
                    imageObserver.observe(img);
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }
})();
</script>
@endpush
@endonce
