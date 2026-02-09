@extends('frontend.layouts.store')

@section('title', 'My Eduka')

@section('content')
<div class="min-h-screen bg-gray-50 dark:bg-[#0D1117] py-8">
    
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
        
        <!-- Header -->
        <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">My Eduka</h1>
                <p class="text-gray-500 dark:text-gray-400">Manage all your eduka in one place</p>
            </div>
            @if(!$store)
            <a href="{{ route('frontend.store.create') }}" 
               class="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2 font-semibold shadow-lg shadow-emerald-500/20">
                <span class="material-symbols-outlined">add_business</span>
                Create New Eduka
            </a>
            @endif
        </div>

        @if($stores->count() > 0)
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                @foreach($stores as $store)
                <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] overflow-hidden hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-sm hover:shadow-lg group">
                    <!-- Store Banner with overlapping logo -->
                    <div class="relative">
                        <div class="h-32 sm:h-36 bg-gradient-to-r from-emerald-500 to-teal-600 relative overflow-hidden">
                            @if($store->banner_url)
                                <img src="{{ $store->banner_url }}" class="w-full h-full object-cover">
                            @endif
                            <!-- Status Badge - Solid colors for visibility -->
                            <div class="absolute top-3 right-3">
                                <span class="px-3 py-1 rounded-full text-xs font-bold shadow-lg
                                    @if($store->status === 'active') bg-emerald-500 text-white
                                    @elseif($store->status === 'paused') bg-amber-500 text-white
                                    @else bg-gray-500 text-white @endif">
                                    {{ ucfirst($store->status) }}
                                </span>
                            </div>
                        </div>
                        
                        <!-- Store Logo - Overlapping the banner -->
                        <div class="absolute -bottom-10 left-6">
                            <img src="{{ $store->logo_url ?? asset('images/default-store.png') }}" 
                                 alt="{{ $store->name }}"
                                 class="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-4 border-white dark:border-[#161B22] bg-gray-100 dark:bg-[#21262D] object-cover shadow-lg">
                        </div>
                    </div>

                    <!-- Store Info - with padding for overlapping logo -->
                    <div class="p-6 pt-14">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">{{ $store->name }}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mb-5 line-clamp-2">{{ $store->description ?? 'No description provided' }}</p>

                        <!-- Stats -->
                        <div class="grid grid-cols-3 gap-4 mb-5 pb-5 border-b border-gray-200 dark:border-[#30363D]">
                            <div class="text-center">
                                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $store->products_count ?? 0 }}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Products</p>
                            </div>
                            <div class="text-center">
                                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $store->total_sales ?? 0 }}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Sales</p>
                            </div>
                            <div class="text-center">
                                @if($store->rating_average)
                                    <div class="flex items-center justify-center gap-1">
                                        <span class="material-symbols-outlined text-amber-400 text-lg filled">star</span>
                                        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($store->rating_average, 1) }}</p>
                                    </div>
                                @else
                                    <p class="text-2xl font-bold text-gray-400 dark:text-gray-500">—</p>
                                @endif
                                <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Rating</p>
                            </div>
                        </div>

                        <!-- Actions - Fixed visibility for both modes -->
                        <div class="flex items-center gap-3">
                            <a href="{{ route('frontend.store.dashboard', $store) }}" 
                               class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl transition-colors text-center font-semibold flex items-center justify-center gap-2">
                                <span class="material-symbols-outlined text-lg">dashboard</span>
                                Dashboard
                            </a>
                            <a href="{{ route('frontend.store.show', $store) }}" 
                               target="_blank"
                               class="px-4 py-2.5 bg-gray-200 dark:bg-[#30363D] hover:bg-emerald-500 hover:text-white text-gray-700 dark:text-white rounded-xl transition-colors flex items-center justify-center"
                               title="View Store">
                                <span class="material-symbols-outlined text-lg">open_in_new</span>
                            </a>
                            <a href="{{ route('frontend.store.edit', $store) }}" 
                               class="px-4 py-2.5 bg-gray-200 dark:bg-[#30363D] hover:bg-emerald-500 hover:text-white text-gray-700 dark:text-white rounded-xl transition-colors flex items-center justify-center"
                               title="Settings">
                                <span class="material-symbols-outlined text-lg">settings</span>
                            </a>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>
        @else
            <!-- Empty State -->
            <div class="bg-white dark:bg-[#161B22] rounded-2xl p-12 text-center border border-gray-200 dark:border-[#30363D] shadow-sm">
                <div class="inline-flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-[#21262D] rounded-full mb-6">
                    <span class="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600">storefront</span>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Eduka Yet</h3>
                <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    Create your first eduka and start selling products to your fans
                </p>
                <a href="{{ route('frontend.store.create') }}" 
                   class="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-8 py-4 rounded-xl font-bold text-white transition-colors shadow-lg shadow-emerald-500/20">
                    <span class="material-symbols-outlined">add_business</span>
                    Create Your First Eduka
                </a>
            </div>
        @endif

    </div>

</div>
@endsection
