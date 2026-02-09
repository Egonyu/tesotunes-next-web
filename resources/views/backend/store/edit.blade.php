@extends('layouts.admin')

@section('title', 'Edit Store')

@section('content')
<div class="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

    <!-- Page Header -->
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span class="material-icons-round text-green-600 dark:text-green-400">edit</span>
                Edit Store
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Edit {{ $store->name }}</p>
        </div>
        <div class="flex gap-3">
            <a href="{{ route('admin.store.show', $store->slug) }}"
               class="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                <span class="material-icons-round text-lg">visibility</span>
                View Store
            </a>
            <a href="{{ route('admin.store.index') }}"
               class="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                <span class="material-icons-round text-lg">arrow_back</span>
                Back to Stores
            </a>
        </div>
    </div>

    <!-- Form -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <form action="{{ route('admin.store.update', $store->slug) }}" method="POST" enctype="multipart/form-data" class="p-6 space-y-6">
            @csrf
            @method('PUT')

            <!-- User Selection -->
            <div>
                <label for="user_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Store Owner
                </label>
                <select name="user_id" id="user_id" required
                        class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
                    <option value="">Select a user...</option>
                    @foreach($users as $user)
                        <option value="{{ $user->id }}" {{ (old('user_id', $store->user_id) == $user->id) ? 'selected' : '' }}>
                            {{ $user->name }} ({{ $user->email }})
                        </option>
                    @endforeach
                </select>
                @error('user_id')
                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Store Name -->
            <div>
                <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Store Name
                </label>
                <input type="text" name="name" id="name" value="{{ old('name', $store->name) }}" required
                       class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                       placeholder="Enter store name">
                @error('name')
                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Description -->
            <div>
                <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                </label>
                <textarea name="description" id="description" rows="4" required
                          class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                          placeholder="Enter store description">{{ old('description', $store->description) }}</textarea>
                @error('description')
                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Phone -->
            <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                </label>
                <input type="text" name="phone" id="phone" value="{{ old('phone', $store->phone) }}"
                       class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                       placeholder="Enter phone number">
                @error('phone')
                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Email -->
            <div>
                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                </label>
                <input type="email" name="email" id="email" value="{{ old('email', $store->email) }}"
                       class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                       placeholder="Enter email address">
                @error('email')
                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Address -->
            <div>
                <label for="address" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                </label>
                <textarea name="address" id="address" rows="3"
                          class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                          placeholder="Enter store address">{{ old('address', $store->address) }}</textarea>
                @error('address')
                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- City -->
            <div>
                <label for="city" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City
                </label>
                <input type="text" name="city" id="city" value="{{ old('city', $store->city) }}"
                       class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                       placeholder="Enter city">
                @error('city')
                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Country -->
            <div>
                <label for="country" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country
                </label>
                <input type="text" name="country" id="country" value="{{ old('country', $store->country) }}"
                       class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                       placeholder="Enter country">
                @error('country')
                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Status -->
            <div>
                <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                </label>
                <select name="status" id="status" required
                        class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
                    <option value="">Select status...</option>
                    <option value="inactive" {{ old('status', $store->status) == 'inactive' ? 'selected' : '' }}>Inactive</option>
                    <option value="active" {{ old('status', $store->status) == 'active' ? 'selected' : '' }}>Active</option>
                    <option value="suspended" {{ old('status', $store->status) == 'suspended' ? 'selected' : '' }}>Suspended</option>
                </select>
                @error('status')
                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Images Section -->
            <div class="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Store Images</h3>

                <!-- Current Logo -->
                @if($store->logo_url)
                    <div class="mb-4">
                        <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Logo:</p>
                        <img src="{{ $store->logo_url }}" alt="{{ $store->name }} Logo" class="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600">
                    </div>
                @endif

                <!-- Logo Upload -->
                <div>
                    <label for="logo" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Store Logo
                    </label>
                    <input type="file" name="logo" id="logo" accept="image/*"
                           class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Recommended size: 400x400px, Max size: 2MB</p>
                    @error('logo')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Current Banner -->
                @if($store->banner_url)
                    <div class="mb-4">
                        <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Banner:</p>
                        <img src="{{ $store->banner_url }}" alt="{{ $store->name }} Banner" class="w-64 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600">
                    </div>
                @endif

                <!-- Banner Upload -->
                <div>
                    <label for="banner" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Store Banner
                    </label>
                    <input type="file" name="banner" id="banner" accept="image/*"
                           class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Recommended size: 1200x400px, Max size: 5MB</p>
                    @error('banner')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Additional Images -->
                <div>
                    <label for="images" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Additional Store Images
                    </label>
                    <input type="file" name="images[]" id="images" accept="image/*" multiple
                           class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">You can select multiple images. Max size: 2MB each</p>
                    @error('images')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <!-- Store Stats (Read-only) -->
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Store Statistics</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Products</p>
                        <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ $store->total_products ?? 0 }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Orders</p>
                        <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ $store->total_orders ?? 0 }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
                        <p class="text-lg font-semibold text-gray-900 dark:text-white">UGX {{ number_format($store->total_revenue ?? 0) }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                        <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ number_format($store->rating ?? 0, 1) }} ⭐</p>
                    </div>
                </div>
            </div>

            <!-- Submit Buttons -->
            <div class="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <a href="{{ route('admin.store.show', $store->slug) }}"
                   class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    Cancel
                </a>
                <button type="submit"
                        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md">
                    Update Store
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
