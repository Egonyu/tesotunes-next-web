@extends('layouts.app')

@section('title', 'Add Product')

@section('header')
    <x-navigation.main-header />
@endsection

@section('left-sidebar')
    @include('frontend.partials.modern-left-sidebar')
    
    {{-- Store Quick Actions Card --}}
    <div class="p-4 border-t border-gray-200 dark:border-[#30363D]">
        <div class="bg-gray-100 dark:bg-[#161B22] rounded-xl p-4 border border-gray-200 dark:border-[#30363D]">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Store Quick Actions</h3>
                <span class="material-symbols-outlined text-emerald-500 text-lg">bolt</span>
            </div>
            
            <div class="space-y-2">
                <a href="{{ route('frontend.store.dashboard', $store) }}" 
                   class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#21262D] hover:bg-gray-50 dark:hover:bg-[#30363D] rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors border border-gray-200 dark:border-[#30363D]">
                    <span class="material-symbols-outlined text-lg text-blue-500">dashboard</span>
                    Dashboard
                </a>
                
                <a href="{{ route('frontend.store.products.create', $store) }}" 
                   class="flex items-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium text-white transition-colors">
                    <span class="material-symbols-outlined text-lg">add</span>
                    Add Product
                </a>
                
                <a href="{{ route('frontend.store.seller.promotions.index') }}" 
                   class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#21262D] hover:bg-gray-50 dark:hover:bg-[#30363D] rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors border border-gray-200 dark:border-[#30363D]">
                    <span class="material-symbols-outlined text-lg text-purple-500">campaign</span>
                    Promotions
                </a>
                
                <a href="{{ route('frontend.store.show', $store) }}" target="_blank"
                   class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#21262D] hover:bg-gray-50 dark:hover:bg-[#30363D] rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors border border-gray-200 dark:border-[#30363D]">
                    <span class="material-symbols-outlined text-lg text-amber-500">visibility</span>
                    View Store
                </a>
            </div>
        </div>
    </div>
@endsection

@section('main-class', 'p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-[#0D1117]')

@section('content')
<div class="max-w-4xl mx-auto" x-data="productForm()">
    {{-- Breadcrumb --}}
    <nav class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <a href="{{ route('frontend.store.index') }}" class="hover:text-emerald-500 transition-colors">Store</a>
        <span class="material-symbols-outlined text-sm">chevron_right</span>
        <a href="{{ route('frontend.store.dashboard', $store) }}" class="hover:text-emerald-500 transition-colors">{{ $store->name }}</a>
        <span class="material-symbols-outlined text-sm">chevron_right</span>
        <span class="text-gray-900 dark:text-white">Add Product</span>
    </nav>
    
    {{-- Page Header --}}
    <div class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span class="material-symbols-outlined text-emerald-500 text-3xl">add_box</span>
            Add New Product
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-2">Create a product for your store - physical items, digital downloads, services, experiences, or tickets</p>
    </div>

    {{-- Product Type Cards --}}
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <button type="button" @click="productType = 'physical'" 
                :class="productType === 'physical' ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20' : 'border-gray-200 dark:border-[#30363D] bg-white dark:bg-[#161B22] hover:border-gray-300 dark:hover:border-[#484F58]'"
                class="p-4 rounded-xl border-2 text-center transition-all group">
            <span class="material-symbols-outlined text-3xl mb-2 transition-colors"
                  :class="productType === 'physical' ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'">inventory_2</span>
            <div class="font-semibold text-sm" :class="productType === 'physical' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'">Physical</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">T-shirts, merch</div>
        </button>
        
        <button type="button" @click="productType = 'digital'"
                :class="productType === 'digital' ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20' : 'border-gray-200 dark:border-[#30363D] bg-white dark:bg-[#161B22] hover:border-gray-300 dark:hover:border-[#484F58]'"
                class="p-4 rounded-xl border-2 text-center transition-all group">
            <span class="material-symbols-outlined text-3xl mb-2 transition-colors"
                  :class="productType === 'digital' ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'">download</span>
            <div class="font-semibold text-sm" :class="productType === 'digital' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'">Digital</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Beats, samples</div>
        </button>
        
        <button type="button" @click="productType = 'service'"
                :class="productType === 'service' ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20' : 'border-gray-200 dark:border-[#30363D] bg-white dark:bg-[#161B22] hover:border-gray-300 dark:hover:border-[#484F58]'"
                class="p-4 rounded-xl border-2 text-center transition-all group">
            <span class="material-symbols-outlined text-3xl mb-2 transition-colors"
                  :class="productType === 'service' ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'">handyman</span>
            <div class="font-semibold text-sm" :class="productType === 'service' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'">Service</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Production, mixing</div>
        </button>
        
        <button type="button" @click="productType = 'experience'"
                :class="productType === 'experience' ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20' : 'border-gray-200 dark:border-[#30363D] bg-white dark:bg-[#161B22] hover:border-gray-300 dark:hover:border-[#484F58]'"
                class="p-4 rounded-xl border-2 text-center transition-all group">
            <span class="material-symbols-outlined text-3xl mb-2 transition-colors"
                  :class="productType === 'experience' ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'">star</span>
            <div class="font-semibold text-sm" :class="productType === 'experience' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'">Experience</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Meet & greet</div>
        </button>
        
        <button type="button" @click="productType = 'ticket'"
                :class="productType === 'ticket' ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20' : 'border-gray-200 dark:border-[#30363D] bg-white dark:bg-[#161B22] hover:border-gray-300 dark:hover:border-[#484F58]'"
                class="p-4 rounded-xl border-2 text-center transition-all group">
            <span class="material-symbols-outlined text-3xl mb-2 transition-colors"
                  :class="productType === 'ticket' ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'">confirmation_number</span>
            <div class="font-semibold text-sm" :class="productType === 'ticket' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'">Ticket</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Event access</div>
        </button>
        
        <a href="{{ route('frontend.store.seller.promotions.create') }}"
           class="p-4 rounded-xl border-2 border-purple-300 dark:border-purple-500/50 bg-purple-50 dark:bg-purple-500/10 text-center transition-all hover:border-purple-400 dark:hover:border-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/20 group">
            <span class="material-symbols-outlined text-3xl mb-2 text-purple-500">campaign</span>
            <div class="font-semibold text-sm text-purple-600 dark:text-purple-400">Promotion</div>
            <div class="text-xs text-purple-500/70 dark:text-purple-400/70 mt-0.5">Radio/playlist</div>
        </a>
    </div>

    {{-- Form --}}
    <form action="{{ route('frontend.store.products.store', $store) }}" method="POST" enctype="multipart/form-data" class="space-y-6">
        @csrf
        <input type="hidden" name="product_type" x-model="productType">

        {{-- Basic Information --}}
        <div class="bg-white dark:bg-[#161B22] rounded-xl border border-gray-200 dark:border-[#30363D] overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117]">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-emerald-500">info</span>
                    Basic Information
                </h2>
            </div>
            <div class="p-6 space-y-5">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name *</label>
                    <input type="text" name="name" required maxlength="255" value="{{ old('name') }}"
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-colors"
                        placeholder="e.g., Custom Beat Package, Artist T-Shirt, Studio Session">
                    @error('name') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Short Description</label>
                    <input type="text" name="short_description" maxlength="255" value="{{ old('short_description') }}"
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-colors"
                        placeholder="Brief one-line description">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Description *</label>
                    <textarea name="description" required rows="5"
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-colors resize-none"
                        placeholder="Describe your product in detail...">{{ old('description') }}</textarea>
                    @error('description') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                    <select name="category_id" class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-colors">
                        <option value="">-- Select Category --</option>
                        @foreach($categories ?? [] as $category)
                            <option value="{{ $category->id }}" {{ old('category_id') == $category->id ? 'selected' : '' }}>{{ $category->name }}</option>
                        @endforeach
                    </select>
                </div>
            </div>
        </div>

        {{-- Pricing --}}
        <div class="bg-white dark:bg-[#161B22] rounded-xl border border-gray-200 dark:border-[#30363D] overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117]">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-emerald-500">payments</span>
                    Pricing
                </h2>
            </div>
            <div class="p-6">
                <div class="grid sm:grid-cols-2 gap-5">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price (UGX) *</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium text-sm">UGX</span>
                            <input type="number" name="price_ugx" required min="0" step="0.01" value="{{ old('price_ugx') }}"
                                class="w-full pl-14 pr-4 py-3 rounded-lg border border-gray-300 dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-colors"
                                placeholder="10000">
                        </div>
                        @error('price_ugx') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price (Credits) - Optional</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-lg">💎</span>
                            <input type="number" name="price_credits" min="0" value="{{ old('price_credits') }}"
                                class="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-colors"
                                placeholder="100">
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Allow customers to pay with platform credits</p>
                    </div>
                </div>
                <div class="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="allow_credit_payment" value="1" checked 
                               class="w-4 h-4 rounded border-gray-300 dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0">
                        <span class="text-sm text-gray-700 dark:text-gray-300">Allow credit payments</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="allow_hybrid_payment" value="1" checked 
                               class="w-4 h-4 rounded border-gray-300 dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0">
                        <span class="text-sm text-gray-700 dark:text-gray-300">Allow hybrid (UGX + Credits)</span>
                    </label>
                </div>
            </div>
        </div>

        {{-- Product Images --}}
        <div class="bg-white dark:bg-[#161B22] rounded-xl border border-gray-200 dark:border-[#30363D] overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117]">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-emerald-500">image</span>
                    Product Images *
                </h2>
            </div>
            <div class="p-6" x-data="imageUploader()">
                <div class="border-2 border-dashed border-gray-300 dark:border-[#30363D] hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-8 text-center transition-colors cursor-pointer"
                     @click="$refs.fileInput.click()">
                    <input type="file" name="images[]" multiple accept="image/*" required
                           x-ref="fileInput" @change="handleFiles($event)" class="hidden">
                    <span class="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-500 mb-3 block">cloud_upload</span>
                    <p class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">Click to upload images</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">PNG, JPG up to 5MB each. First image will be the featured image.</p>
                </div>
                <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4" x-show="previews.length > 0" x-cloak>
                    <template x-for="(preview, index) in previews" :key="index">
                        <div class="relative group rounded-lg overflow-hidden">
                            <img :src="preview" class="w-full h-28 object-cover">
                            <div class="absolute top-2 left-2 bg-emerald-500 rounded-full px-2 py-0.5 text-xs font-medium text-white" x-show="index === 0">Featured</div>
                        </div>
                    </template>
                </div>
                @error('images') <p class="text-red-500 text-sm mt-2">{{ $message }}</p> @enderror
            </div>
        </div>

        {{-- Inventory (Physical/Ticket) --}}
        <div x-show="['physical', 'ticket'].includes(productType)" x-cloak
             class="bg-white dark:bg-[#161B22] rounded-xl border border-gray-200 dark:border-[#30363D] overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117]">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-emerald-500">inventory</span>
                    Inventory & Shipping
                </h2>
            </div>
            <div class="p-6 space-y-5">
                <div class="grid sm:grid-cols-2 gap-5">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock Quantity</label>
                        <input type="number" name="inventory_quantity" min="0" value="{{ old('inventory_quantity', 0) }}"
                            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-colors">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SKU (Optional)</label>
                        <input type="text" name="sku" value="{{ old('sku') }}"
                            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-colors"
                            placeholder="Auto-generated if empty">
                    </div>
                </div>
                <div class="space-y-3" x-show="productType === 'physical'">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="track_inventory" value="1" checked 
                               class="w-4 h-4 rounded border-gray-300 dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-emerald-500 focus:ring-emerald-500">
                        <span class="text-sm text-gray-700 dark:text-gray-300">Track inventory quantity</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="requires_shipping" value="1" checked 
                               class="w-4 h-4 rounded border-gray-300 dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-emerald-500 focus:ring-emerald-500">
                        <span class="text-sm text-gray-700 dark:text-gray-300">Requires shipping</span>
                    </label>
                    <div class="pt-3">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Weight (kg)</label>
                        <input type="number" name="weight" step="0.01" min="0" value="{{ old('weight') }}"
                            class="w-full sm:w-48 px-4 py-3 rounded-lg border border-gray-300 dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-colors"
                            placeholder="0.5">
                    </div>
                </div>
            </div>
        </div>

        {{-- Digital File --}}
        <div x-show="productType === 'digital'" x-cloak
             class="bg-white dark:bg-[#161B22] rounded-xl border border-gray-200 dark:border-[#30363D] overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-[#30363D] bg-gray-50 dark:bg-[#0D1117]">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-emerald-500">folder_zip</span>
                    Digital File
                </h2>
            </div>
            <div class="p-6 space-y-5">
                <input type="hidden" name="is_digital" :value="productType === 'digital' ? '1' : '0'">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Digital File</label>
                    <input type="file" name="digital_file"
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 file:cursor-pointer transition-colors">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Max 50MB - ZIP, MP3, WAV, PDF, etc.</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Download Limit (Optional)</label>
                    <input type="number" name="download_limit" min="1" value="{{ old('download_limit') }}"
                        class="w-full sm:w-48 px-4 py-3 rounded-lg border border-gray-300 dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-colors"
                        placeholder="Unlimited if empty">
                </div>
            </div>
        </div>

        {{-- Form Actions --}}
        <div class="flex items-center justify-end gap-4 pt-4">
            <a href="{{ route('frontend.store.dashboard', $store) }}" 
               class="px-6 py-3 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#21262D] transition-colors">
                Cancel
            </a>
            <button type="submit" 
                    class="px-8 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 flex items-center gap-2">
                <span class="material-symbols-outlined">add</span>
                Create Product
            </button>
        </div>
    </form>
</div>

@push('scripts')
<script>
function productForm() {
    return {
        productType: 'physical'
    }
}

function imageUploader() {
    return {
        previews: [],
        handleFiles(event) {
            const files = Array.from(event.target.files);
            this.previews = [];
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.previews.push(e.target.result);
                };
                reader.readAsDataURL(file);
            });
        }
    }
}
</script>
@endpush
@endsection
