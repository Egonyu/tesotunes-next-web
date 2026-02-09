@if ($paginator->hasPages())
    <nav role="navigation" aria-label="Pagination Navigation" class="flex justify-center items-center gap-2">
        {{-- Previous Page Link --}}
        @if ($paginator->onFirstPage())
            <span class="px-4 py-2 bg-gray-800 rounded-lg text-gray-500 cursor-not-allowed">
                Previous
            </span>
        @else
            <a href="{{ $paginator->previousPageUrl() }}"
               class="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors">
                Previous
            </a>
        @endif

        {{-- Pagination Elements --}}
        @foreach ($elements as $element)
            {{-- "Three Dots" Separator --}}
            @if (is_string($element))
                <span class="px-4 py-2 bg-gray-800 rounded-lg text-gray-500">{{ $element }}</span>
            @endif

            {{-- Array Of Links --}}
            @if (is_array($element))
                @foreach ($element as $page => $url)
                    @if ($page == $paginator->currentPage())
                        <span class="px-4 py-2 bg-green-600 rounded-lg text-white font-medium">{{ $page }}</span>
                    @else
                        <a href="{{ $url }}" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors">{{ $page }}</a>
                    @endif
                @endforeach
            @endif
        @endforeach

        {{-- Next Page Link --}}
        @if ($paginator->hasMorePages())
            <a href="{{ $paginator->nextPageUrl() }}"
               class="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors">
                Next
            </a>
        @else
            <span class="px-4 py-2 bg-gray-800 rounded-lg text-gray-500 cursor-not-allowed">
                Next
            </span>
        @endif
    </nav>
@endif
