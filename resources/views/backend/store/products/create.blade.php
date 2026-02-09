@extends('layouts.admin')

@section('title', 'Add Product - ' . $store->name)

@section('content')
<div class="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

    <!-- Page Header -->
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span class="material-icons-round text-green-600 dark:text-green-400">add_box</span>
                Add Product to {{ $store->name }}
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Create a new product for this store</p>
        </div>
        <a href="{{ route('admin.store.products.index', $store) }}"
           class="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            <span class="material-icons-round text-lg">arrow_back</span>
            Back to Products
        </a>
    </div>

    <!-- Form -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <form action="{{ route('admin.store.products.store', $store) }}" method="POST" class="p-6 space-y-6">
            @csrf

            <!-- Basic Information -->
            <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>

                <!-- Product Name -->
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Product Name <span class="text-red-500">*</span>
                    </label>
                    <input type="text" name="name" id="name" value="{{ old('name') }}" required
                           class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                           placeholder="Enter product name">
                    @error('name')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Description -->
                <div>
                    <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description <span class="text-red-500">*</span>
                    </label>
                    <textarea name="description" id="description" rows="4" required
                              class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                              placeholder="Enter product description">{{ old('description') }}</textarea>
                    @error('description')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Category -->
                <div>
                    <label for="category_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category <span class="text-red-500">*</span>
                    </label>
                    <select name="category_id" id="category_id" required
                            class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
                        <option value="">Select a category...</option>
                        @foreach($categories as $category)
                            <option value="{{ $category->id }}" {{ old('category_id') == $category->id ? 'selected' : '' }}>
                                {{ $category->name }}
                            </option>
                        @endforeach
                    </select>
                    @error('category_id')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <!-- Pricing -->
            <div class="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Pricing</h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Price UGX -->
                    <div>
                        <label for="price" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Price (UGX) <span class="text-red-500">*</span>
                        </label>
                        <input type="number" name="price" id="price" value="{{ old('price') }}" required min="0" step="0.01"
                               class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                               placeholder="0.00">
                        @error('price')
                            <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Price Credits -->
                    <div>
                        <label for="price_credits" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Price (Credits)
                        </label>
                        <input type="number" name="price_credits" id="price_credits" value="{{ old('price_credits') }}" min="0"
                               class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                               placeholder="0">
                        @error('price_credits')
                            <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Compare at Price -->
                    <div>
                        <label for="compare_at_price" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Compare at Price (UGX)
                        </label>
                        <input type="number" name="compare_at_price" id="compare_at_price" value="{{ old('compare_at_price') }}" min="0" step="0.01"
                               class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                               placeholder="0.00">
                        @error('compare_at_price')
                            <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- SKU -->
                    <div>
                        <label for="sku" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            SKU
                        </label>
                        <input type="text" name="sku" id="sku" value="{{ old('sku') }}"
                               class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                               placeholder="Product SKU">
                        @error('sku')
                            <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <!-- Allow Credit Payment -->
                <div class="flex items-center">
                    <input type="checkbox" name="allow_credit_payment" id="allow_credit_payment" value="1" {{ old('allow_credit_payment') ? 'checked' : '' }}
                           class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <label for="allow_credit_payment" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Allow payment with credits
                    </label>
                </div>
            </div>

            <!-- Inventory -->
            <div class="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Inventory</h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Stock Quantity -->
                    <div>
                        <label for="stock_quantity" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Stock Quantity <span class="text-red-500">*</span>
                        </label>
                        <input type="number" name="stock_quantity" id="stock_quantity" value="{{ old('stock_quantity', 0) }}" required min="0"
                               class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                               placeholder="0">
                        @error('stock_quantity')
                            <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Weight -->
                    <div>
                        <label for="weight" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Weight (kg)
                        </label>
                        <input type="number" name="weight" id="weight" value="{{ old('weight') }}" min="0" step="0.01"
                               class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                               placeholder="0.00">
                        @error('weight')
                            <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <!-- Checkboxes -->
                <div class="space-y-3">
                    <div class="flex items-center">
                        <input type="checkbox" name="track_inventory" id="track_inventory" value="1" {{ old('track_inventory', true) ? 'checked' : '' }}
                               class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <label for="track_inventory" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Track inventory
                        </label>
                    </div>

                    <div class="flex items-center">
                        <input type="checkbox" name="allow_backorders" id="allow_backorders" value="1" {{ old('allow_backorders') ? 'checked' : '' }}
                               class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <label for="allow_backorders" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Allow backorders
                        </label>
                    </div>

                    <div class="flex items-center">
                        <input type="checkbox" name="requires_shipping" id="requires_shipping" value="1" {{ old('requires_shipping', true) ? 'checked' : '' }}
                               class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <label for="requires_shipping" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Requires shipping
                        </label>
                    </div>

                    <div class="flex items-center">
                        <input type="checkbox" name="is_digital" id="is_digital" value="1" {{ old('is_digital') ? 'checked' : '' }}
                               class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <label for="is_digital" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Digital product
                        </label>
                    </div>

                    <div class="flex items-center">
                        <input type="checkbox" name="is_featured" id="is_featured" value="1" {{ old('is_featured') ? 'checked' : '' }}
                               class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <label for="is_featured" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Featured product
                        </label>
                    </div>
                </div>
            </div>

            <!-- Status -->
            <div class="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Status</h3>

                <div>
                    <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Product Status <span class="text-red-500">*</span>
                    </label>
                    <select name="status" id="status" required
                            class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
                        <option value="">Select status...</option>
                        <option value="draft" {{ old('status') == 'draft' ? 'selected' : '' }}>Draft</option>
                        <option value="active" {{ old('status') == 'active' ? 'selected' : '' }}>Active</option>
                        <option value="inactive" {{ old('status') == 'inactive' ? 'selected' : '' }}>Inactive</option>
                    </select>
                    @error('status')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <!-- Submit Buttons -->
            <div class="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <a href="{{ route('admin.store.products.index', $store) }}"
                   class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    Cancel
                </a>
                <button type="submit"
                        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md">
                    Create Product
                </button>
            </div>
        </form>
    </div>
</div>
@endsection