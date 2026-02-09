@props([
    'src' => null,
    'id' => null,
    'alt' => 'Artwork',
    'icon' => 'music_note',
    'class' => '',
    'style' => 'gradient', // gradient, pixelated, or simple
    'loading' => null, // lazy, eager, or null
])

@php
    use App\Helpers\ArtworkHelper;
    $artworkId = $id ?? uniqid();
    $gradientClass = ArtworkHelper::getTailwindGradient($artworkId);
@endphp

@if($src)
    <img src="{{ $src }}" 
         alt="{{ $alt }}" 
         @if($loading) loading="{{ $loading }}" @endif
         {{ $attributes->merge(['class' => $class]) }}>
@else
    @if($style === 'pixelated')
        {{-- Pixelated Apple Music style --}}
        <div {{ $attributes->merge(['class' => 'relative overflow-hidden ' . $class]) }}>
            <div class="grid grid-cols-8 grid-rows-6 w-full h-full">
                @foreach(ArtworkHelper::getPixelatedGradient($artworkId) as $pixel)
                    <div style="background-color: {{ $pixel['color'] }}"></div>
                @endforeach
            </div>
            @if($icon)
                <div class="absolute inset-0 flex items-center justify-center">
                    <span class="material-icons-round text-white/30 text-4xl">{{ $icon }}</span>
                </div>
            @endif
        </div>
    @else
        {{-- Simple gradient style --}}
        <div {{ $attributes->merge(['class' => 'bg-gradient-to-br ' . $gradientClass . ' flex items-center justify-center ' . $class]) }}>
            @if($icon)
                <span class="material-icons-round text-white text-2xl">{{ $icon }}</span>
            @endif
        </div>
    @endif
@endif
