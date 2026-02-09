@php
$alertClasses = [
    'success' => 'bg-green-900/50 border-green-500 text-green-100',
    'error' => 'bg-red-900/50 border-red-500 text-red-100',
    'warning' => 'bg-yellow-900/50 border-yellow-500 text-yellow-100',
    'info' => 'bg-blue-900/50 border-blue-500 text-blue-100'
];

$iconMap = [
    'success' => 'check_circle',
    'error' => 'error',
    'warning' => 'warning',
    'info' => 'info'
];
@endphp

<div
    data-alert="{{ $type }}"
    class="fixed top-6 right-6 z-50 max-w-md border-l-4 rounded-lg p-4 shadow-lg backdrop-blur-sm {{ $alertClasses[$type] ?? $alertClasses['info'] }}"
    x-data="{ show: true }"
    x-show="show"
    x-transition:enter="transition ease-out duration-300"
    x-transition:enter-start="opacity-0 transform translate-x-8"
    x-transition:enter-end="opacity-100 transform translate-x-0"
    x-transition:leave="transition ease-in duration-200"
    x-transition:leave-start="opacity-100 transform translate-x-0"
    x-transition:leave-end="opacity-0 transform translate-x-8"
>
    <div class="flex items-start gap-3">
        <span class="material-icons-round text-lg mt-0.5">{{ $iconMap[$type] ?? $iconMap['info'] }}</span>
        <div class="flex-1">
            <p class="text-sm font-medium">{{ $message }}</p>
        </div>
        <button
            @click="show = false"
            class="text-current opacity-70 hover:opacity-100 transition-opacity"
        >
            <span class="material-icons-round text-sm">close</span>
        </button>
    </div>
</div>