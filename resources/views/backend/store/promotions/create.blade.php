<x-backend-layout>
    <div class="max-w-4xl mx-auto py-8">
        <!-- Header -->
        <div class="mb-8">
            <div class="flex items-center gap-4 mb-4">
                <a href="{{ route('admin.store.promotions.index') }}" 
                   class="text-gray-400 hover:text-white transition-colors">
                    <span class="material-icons-round">arrow_back</span>
                </a>
                <div>
                    <h1 class="text-3xl font-bold text-white">Create Promotion</h1>
                    <p class="text-gray-400 mt-1">Set up a new promotional campaign for stores or products</p>
                </div>
            </div>
        </div>

        <!-- Form -->
        <form action="{{ route('admin.store.promotions.store') }}" method="POST" class="space-y-6">
            @csrf

            <!-- Basic Information -->
            <div class="bg-gray-900 rounded-lg p-6">
                <h2 class="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <span class="material-icons-round text-green-500">campaign</span>
                    Basic Information
                </h2>

                <div class="space-y-4">
                    <!-- Promotion Name -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Promotion Name <span class="text-red-500">*</span>
                        </label>
                        <input type="text" 
                               name="name" 
                               value="{{ old('name') }}" 
                               required
                               class="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                               placeholder="Summer Sale 2025">
                        @error('name')
                            <p class="mt-1 text-sm text-red-500">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Description -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea name="description" 
                                  rows="3"
                                  class="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                  placeholder="Special summer discounts on all merchandise">{{ old('description') }}</textarea>
                        @error('description')
                            <p class="mt-1 text-sm text-red-500">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Promotion Type -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                Promotion Type <span class="text-red-500">*</span>
                            </label>
                            <select name="type" 
                                    required
                                    class="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500">
                                <option value="percentage" {{ old('type') === 'percentage' ? 'selected' : '' }}>Percentage Discount</option>
                                <option value="fixed" {{ old('type') === 'fixed' ? 'selected' : '' }}>Fixed Amount Off</option>
                                <option value="bogo" {{ old('type') === 'bogo' ? 'selected' : '' }}>Buy One Get One</option>
                                <option value="free_shipping" {{ old('type') === 'free_shipping' ? 'selected' : '' }}>Free Shipping</option>
                            </select>
                            @error('type')
                                <p class="mt-1 text-sm text-red-500">{{ $message }}</p>
                            @enderror
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                Discount Value <span class="text-red-500">*</span>
                            </label>
                            <input type="number" 
                                   name="value" 
                                   value="{{ old('value') }}" 
                                   required
                                   min="0"
                                   step="0.01"
                                   class="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                   placeholder="10">
                            <p class="mt-1 text-xs text-gray-400">For percentage: 10 = 10%, For fixed: amount in UGX</p>
                            @error('value')
                                <p class="mt-1 text-sm text-red-500">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>

                    <!-- Date Range -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                Start Date <span class="text-red-500">*</span>
                            </label>
                            <input type="datetime-local" 
                                   name="starts_at" 
                                   value="{{ old('starts_at') }}" 
                                   required
                                   class="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500">
                            @error('starts_at')
                                <p class="mt-1 text-sm text-red-500">{{ $message }}</p>
                            @enderror
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                End Date <span class="text-red-500">*</span>
                            </label>
                            <input type="datetime-local" 
                                   name="ends_at" 
                                   value="{{ old('ends_at') }}" 
                                   required
                                   class="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500">
                            @error('ends_at')
                                <p class="mt-1 text-sm text-red-500">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>
                </div>
            </div>

            <!-- Eligibility Criteria -->
            <div class="bg-gray-900 rounded-lg p-6">
                <h2 class="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <span class="material-icons-round text-blue-500">filter_list</span>
                    Eligibility Criteria
                </h2>

                <div class="space-y-4">
                    <!-- Minimum Purchase -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Minimum Purchase Amount (UGX)
                        </label>
                        <input type="number" 
                               name="min_purchase" 
                               value="{{ old('min_purchase', 0) }}" 
                               min="0"
                               class="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                               placeholder="0">
                        <p class="mt-1 text-xs text-gray-400">Leave at 0 for no minimum</p>
                    </div>

                    <!-- Maximum Uses -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Maximum Total Uses
                        </label>
                        <input type="number" 
                               name="max_uses" 
                               value="{{ old('max_uses') }}" 
                               min="1"
                               class="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                               placeholder="Unlimited">
                        <p class="mt-1 text-xs text-gray-400">Leave empty for unlimited uses</p>
                    </div>

                    <!-- Max Uses Per User -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Maximum Uses Per User
                        </label>
                        <input type="number" 
                               name="max_uses_per_user" 
                               value="{{ old('max_uses_per_user', 1) }}" 
                               min="1"
                               class="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                               placeholder="1">
                    </div>

                    <!-- Applies To -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Applies To
                        </label>
                        <select name="applies_to" 
                                class="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option value="all" {{ old('applies_to') === 'all' ? 'selected' : '' }}>All Products</option>
                            <option value="specific_stores" {{ old('applies_to') === 'specific_stores' ? 'selected' : '' }}>Specific Stores</option>
                            <option value="specific_products" {{ old('applies_to') === 'specific_products' ? 'selected' : '' }}>Specific Products</option>
                            <option value="categories" {{ old('applies_to') === 'categories' ? 'selected' : '' }}>Specific Categories</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Settings -->
            <div class="bg-gray-900 rounded-lg p-6">
                <h2 class="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <span class="material-icons-round text-purple-500">settings</span>
                    Settings
                </h2>

                <div class="space-y-4">
                    <!-- Status -->
                    <div class="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div>
                            <h3 class="text-white font-medium">Active</h3>
                            <p class="text-sm text-gray-400">Make promotion immediately active</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" 
                                   name="is_active" 
                                   value="1"
                                   {{ old('is_active', true) ? 'checked' : '' }}
                                   class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>

                    <!-- Require Approval -->
                    <div class="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div>
                            <h3 class="text-white font-medium">Require Admin Approval</h3>
                            <p class="text-sm text-gray-400">Promotion must be approved before going live</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" 
                                   name="require_approval" 
                                   value="1"
                                   {{ old('require_approval', false) ? 'checked' : '' }}
                                   class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-between gap-4">
                <a href="{{ route('admin.store.promotions.index') }}" 
                   class="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    Cancel
                </a>
                <button type="submit" 
                        class="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                    <span class="material-icons-round">check</span>
                    Create Promotion
                </button>
            </div>
        </form>
    </div>
</x-backend-layout>
