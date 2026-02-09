@props([
    'size' => 'medium', // small, medium, large
    'color' => 'green', // green, white, gray
    'text' => null
])

@php
$sizeClasses = [
    'small' => 'w-4 h-4',
    'medium' => 'w-8 h-8',
    'large' => 'w-12 h-12'
];

$colorClasses = [
    'green' => 'border-green-500',
    'white' => 'border-white',
    'gray' => 'border-gray-400'
];
@endphp

<div class="flex items-center justify-center gap-3">
    <div class="{{ $sizeClasses[$size] }} border-2 {{ $colorClasses[$color] }} border-t-transparent rounded-full animate-spin"></div>
    @if($text)
        <span class="text-sm {{ $color === 'white' ? 'text-white' : ($color === 'green' ? 'text-green-500' : 'text-gray-400') }}">
            {{ $text }}
        </span>
    @endif
</div>