<!-- Progress Indicator Component -->
@props(['current' => 1, 'total' => 3])

<div class="mb-8">
    <!-- Progress Bar -->
    <div class="relative">
        <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
            <div style="width:{{ ($current / $total) * 100 }}%" 
                 class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-600 transition-all duration-500">
            </div>
        </div>
    </div>

    <!-- Step Indicators -->
    <div class="flex justify-between items-center">
        <!-- Step 1 -->
        <div class="flex flex-col items-center flex-1">
            <div class="w-10 h-10 {{ $current >= 1 ? 'bg-green-600' : 'bg-gray-700' }} 
                        text-white rounded-full flex items-center justify-center font-bold mb-2
                        {{ $current == 1 ? 'ring-4 ring-green-500/30' : '' }}">
                @if($current > 1)
                    ✓
                @else
                    1
                @endif
            </div>
            <span class="text-xs {{ $current >= 1 ? 'text-green-400 font-semibold' : 'text-gray-500' }}">
                Basic Info
            </span>
        </div>

        <!-- Connector Line 1 -->
        <div class="flex-1 h-1 {{ $current >= 2 ? 'bg-green-600' : 'bg-gray-700' }} -mx-2"></div>

        <!-- Step 2 -->
        <div class="flex flex-col items-center flex-1">
            <div class="w-10 h-10 {{ $current >= 2 ? 'bg-green-600' : 'bg-gray-700' }} 
                        text-white rounded-full flex items-center justify-center font-bold mb-2
                        {{ $current == 2 ? 'ring-4 ring-green-500/30' : '' }}">
                @if($current > 2)
                    ✓
                @else
                    2
                @endif
            </div>
            <span class="text-xs {{ $current >= 2 ? 'text-green-400 font-semibold' : 'text-gray-500' }}">
                Verification
            </span>
        </div>

        <!-- Connector Line 2 -->
        <div class="flex-1 h-1 {{ $current >= 3 ? 'bg-green-600' : 'bg-gray-700' }} -mx-2"></div>

        <!-- Step 3 -->
        <div class="flex flex-col items-center flex-1">
            <div class="w-10 h-10 {{ $current >= 3 ? 'bg-green-600' : 'bg-gray-700' }} 
                        text-white rounded-full flex items-center justify-center font-bold mb-2
                        {{ $current == 3 ? 'ring-4 ring-green-500/30' : '' }}">
                @if($current > 3)
                    ✓
                @else
                    3
                @endif
            </div>
            <span class="text-xs {{ $current >= 3 ? 'text-green-400 font-semibold' : 'text-gray-500' }}">
                Payment
            </span>
        </div>
    </div>

    <!-- Step Description -->
    <div class="mt-4 text-center">
        <p class="text-sm text-gray-400">
            Step {{ $current }} of {{ $total }}
            <span class="text-green-400 font-medium">
                ({{ round(($current / $total) * 100) }}% Complete)
            </span>
        </p>
    </div>
</div>
