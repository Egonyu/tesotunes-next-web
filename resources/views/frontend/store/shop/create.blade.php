@extends('frontend.layouts.store')

@section('title', 'Create Product - My Shop')

@push('styles')
<style>
    .image-preview-container {
        position: relative;
        display: inline-block;
    }
    
    .image-preview-remove {
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 50%;
        padding: 4px;
        cursor: pointer;
    }
</style>
@endpush

@section('content')
<div x-data="createProduct()" class="min-h-screen bg-black text-white py-8">
    
    <div class="max-w-4xl mx-auto px-4">
        
        <!-- Header -->
        <div class="mb-8">
            <a href="{{ route('store.shop.index') }}" class="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-4">
                <span class="material-icons-round">arrow_back</span>
                Back to My Shop
            </a>
            <h1 class="text-3xl font-bold text-white">Create New Product</h1>
            <p class="text-gray-400">Add a new product to your shop</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="submitProduct" class="space-y-6">
            
            <!-- Basic Information -->
            <div class="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span class="material-icons-round text-green-500">info</span>
                    Basic Information
                </h2>

                <!-- Product Name -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                        Product Name <span class="text-red-500">*</span>
                    </label>
                    <input 
                        type="text" 
                        x-model="form.name"
                        required
                        placeholder="e.g., Official Tour T-Shirt"
                        class="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
                    >
                    <p class="text-gray-500 text-sm mt-1">Give your product a clear, descriptive name</p>
                </div>

                <!-- Description -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                        Description <span class="text-red-500">*</span>
                    </label>
                    <textarea 
                        x-model="form.description"
                        required
                        rows="5"
                        placeholder="Describe your product in detail..."
                        class="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition-colors resize-none"
                    ></textarea>
                    <p class="text-gray-500 text-sm mt-1">Include sizing, materials, features, etc.</p>
                </div>

                <!-- Category -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                        Category <span class="text-red-500">*</span>
                    </label>
                    <select 
                        x-model="form.category"
                        required
                        class="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
                    >
                        <option value="">Select a category</option>
                        <option value="merchandise">Merchandise</option>
                        <option value="services">Services</option>
                        <option value="experiences">Experiences</option>
                        <option value="digital">Digital Goods</option>
                        <option value="tickets">Tickets & Events</option>
                    </select>
                </div>

                <!-- Type (Physical/Digital/Service) -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                        Product Type <span class="text-red-500">*</span>
                    </label>
                    <div class="grid grid-cols-3 gap-4">
                        <label class="relative">
                            <input 
                                type="radio" 
                                name="type" 
                                value="physical" 
                                x-model="form.type"
                                class="peer sr-only"
                            >
                            <div class="bg-gray-800 border-2 border-gray-700 peer-checked:border-green-500 peer-checked:bg-green-500/10 rounded-lg p-4 cursor-pointer transition-all text-center">
                                <span class="material-icons-round text-3xl mb-2">inventory_2</span>
                                <p class="font-medium">Physical</p>
                                <p class="text-xs text-gray-400">Ships to customer</p>
                            </div>
                        </label>
                        <label class="relative">
                            <input 
                                type="radio" 
                                name="type" 
                                value="digital" 
                                x-model="form.type"
                                class="peer sr-only"
                            >
                            <div class="bg-gray-800 border-2 border-gray-700 peer-checked:border-green-500 peer-checked:bg-green-500/10 rounded-lg p-4 cursor-pointer transition-all text-center">
                                <span class="material-icons-round text-3xl mb-2">cloud_download</span>
                                <p class="font-medium">Digital</p>
                                <p class="text-xs text-gray-400">Instant delivery</p>
                            </div>
                        </label>
                        <label class="relative">
                            <input 
                                type="radio" 
                                name="type" 
                                value="service" 
                                x-model="form.type"
                                class="peer sr-only"
                            >
                            <div class="bg-gray-800 border-2 border-gray-700 peer-checked:border-green-500 peer-checked:bg-green-500/10 rounded-lg p-4 cursor-pointer transition-all text-center">
                                <span class="material-icons-round text-3xl mb-2">handyman</span>
                                <p class="font-medium">Service</p>
                                <p class="text-xs text-gray-400">Booking required</p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Pricing -->
            <div class="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span class="material-icons-round text-green-500">payments</span>
                    Pricing
                </h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- UGX Price -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Price (UGX) <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                            <span class="absolute left-4 top-3.5 text-gray-400">UGX</span>
                            <input 
                                type="number" 
                                x-model="form.price_ugx"
                                required
                                min="0"
                                step="1000"
                                placeholder="50000"
                                class="w-full bg-gray-800 text-white pl-16 pr-4 py-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
                            >
                        </div>
                    </div>

                    <!-- Credits Price (Optional) -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Price (Credits) <span class="text-gray-500">Optional</span>
                        </label>
                        <div class="relative">
                            <span class="absolute left-4 top-3.5 text-yellow-400 material-icons-round text-sm">stars</span>
                            <input 
                                type="number" 
                                x-model="form.price_credits"
                                min="0"
                                step="100"
                                placeholder="500"
                                class="w-full bg-gray-800 text-white pl-16 pr-4 py-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
                            >
                        </div>
                        <p class="text-gray-500 text-sm mt-1">Allow users to pay with platform credits</p>
                    </div>
                </div>

                <!-- Comparison Price (Optional) -->
                <div class="mt-6">
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                        Compare at Price <span class="text-gray-500">Optional</span>
                    </label>
                    <div class="relative">
                        <span class="absolute left-4 top-3.5 text-gray-400">UGX</span>
                        <input 
                            type="number" 
                            x-model="form.compare_at_price_ugx"
                            min="0"
                            step="1000"
                            placeholder="70000"
                            class="w-full bg-gray-800 text-white pl-16 pr-4 py-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
                        >
                    </div>
                    <p class="text-gray-500 text-sm mt-1">Show original price to display savings</p>
                </div>
            </div>

            <!-- Inventory & Stock -->
            <div class="bg-gray-900 rounded-xl p-6 border border-gray-800" x-show="form.type === 'physical'">
                <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span class="material-icons-round text-green-500">inventory</span>
                    Inventory Management
                </h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Stock Quantity -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Stock Quantity <span class="text-red-500">*</span>
                        </label>
                        <input 
                            type="number" 
                            x-model="form.stock_quantity"
                            required
                            min="0"
                            placeholder="100"
                            class="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
                        >
                    </div>

                    <!-- Low Stock Alert -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Low Stock Alert Threshold
                        </label>
                        <input 
                            type="number" 
                            x-model="form.low_stock_alert"
                            min="0"
                            placeholder="10"
                            class="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
                        >
                        <p class="text-gray-500 text-sm mt-1">Get notified when stock is low</p>
                    </div>
                </div>

                <!-- SKU -->
                <div class="mt-6">
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                        SKU <span class="text-gray-500">Optional</span>
                    </label>
                    <input 
                        type="text" 
                        x-model="form.sku"
                        placeholder="TSHIRT-001"
                        class="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
                    >
                    <p class="text-gray-500 text-sm mt-1">Stock Keeping Unit for inventory tracking</p>
                </div>
            </div>

            <!-- Images -->
            <div class="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span class="material-icons-round text-green-500">image</span>
                    Product Images
                </h2>

                <!-- Image Upload -->
                <div class="mb-4">
                    <label class="block w-full bg-gray-800 border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 transition-colors">
                        <input 
                            type="file" 
                            @change="handleImageUpload($event)"
                            accept="image/*"
                            multiple
                            class="hidden"
                        >
                        <span class="material-icons-round text-5xl text-gray-600 mb-4">cloud_upload</span>
                        <p class="text-white font-medium mb-1">Click to upload images</p>
                        <p class="text-gray-500 text-sm">PNG, JPG, or WEBP (Max 5 images, 5MB each)</p>
                    </label>
                </div>

                <!-- Image Previews -->
                <div x-show="form.images.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <template x-for="(image, index) in form.images" :key="index">
                        <div class="image-preview-container relative">
                            <img 
                                :src="image.preview" 
                                class="w-full aspect-square object-cover rounded-lg border-2 border-gray-700"
                            >
                            <button 
                                type="button"
                                @click="removeImage(index)"
                                class="image-preview-remove hover:bg-red-600 transition-colors"
                            >
                                <span class="material-icons-round text-white text-sm">close</span>
                            </button>
                            <div 
                                x-show="index === 0"
                                class="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold"
                            >
                                Main
                            </div>
                        </div>
                    </template>
                </div>
            </div>

            <!-- Additional Settings -->
            <div class="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span class="material-icons-round text-green-500">settings</span>
                    Additional Settings
                </h2>

                <!-- Featured Product -->
                <label class="flex items-center justify-between p-4 bg-gray-800 rounded-lg mb-4 cursor-pointer">
                    <div class="flex items-center gap-3">
                        <span class="material-icons-round text-yellow-500">star</span>
                        <div>
                            <p class="text-white font-medium">Featured Product</p>
                            <p class="text-gray-400 text-sm">Show this product prominently in your shop</p>
                        </div>
                    </div>
                    <input 
                        type="checkbox" 
                        x-model="form.is_featured"
                        class="w-5 h-5 rounded border-gray-700 bg-gray-700 text-green-600 focus:ring-green-500 focus:ring-offset-0"
                    >
                </label>

                <!-- Requires Shipping -->
                <label class="flex items-center justify-between p-4 bg-gray-800 rounded-lg mb-4 cursor-pointer" x-show="form.type === 'physical'">
                    <div class="flex items-center gap-3">
                        <span class="material-icons-round text-blue-500">local_shipping</span>
                        <div>
                            <p class="text-white font-medium">Requires Shipping</p>
                            <p class="text-gray-400 text-sm">This product needs to be shipped to customers</p>
                        </div>
                    </div>
                    <input 
                        type="checkbox" 
                        x-model="form.requires_shipping"
                        class="w-5 h-5 rounded border-gray-700 bg-gray-700 text-green-600 focus:ring-green-500 focus:ring-offset-0"
                    >
                </label>

                <!-- Taxable -->
                <label class="flex items-center justify-between p-4 bg-gray-800 rounded-lg cursor-pointer">
                    <div class="flex items-center gap-3">
                        <span class="material-icons-round text-purple-500">receipt</span>
                        <div>
                            <p class="text-white font-medium">Taxable Product</p>
                            <p class="text-gray-400 text-sm">Apply taxes to this product</p>
                        </div>
                    </div>
                    <input 
                        type="checkbox" 
                        x-model="form.is_taxable"
                        class="w-5 h-5 rounded border-gray-700 bg-gray-700 text-green-600 focus:ring-green-500 focus:ring-offset-0"
                    >
                </label>
            </div>

            <!-- Submit Buttons -->
            <div class="flex items-center justify-between gap-4">
                <a 
                    href="{{ route('store.shop.index') }}"
                    class="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                    Cancel
                </a>
                <div class="flex gap-4">
                    <button 
                        type="button"
                        @click="submitProduct('draft')"
                        :disabled="submitting"
                        class="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        Save as Draft
                    </button>
                    <button 
                        type="submit"
                        :disabled="submitting"
                        class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        <span x-show="!submitting">Publish Product</span>
                        <span x-show="submitting">Publishing...</span>
                        <span x-show="!submitting" class="material-icons-round">check</span>
                    </button>
                </div>
            </div>

        </form>

    </div>

</div>

@push('scripts')
<script>
function createProduct() {
    return {
        submitting: false,
        form: {
            name: '',
            description: '',
            category: '',
            type: 'physical',
            price_ugx: '',
            price_credits: '',
            compare_at_price_ugx: '',
            stock_quantity: 100,
            low_stock_alert: 10,
            sku: '',
            images: [],
            is_featured: false,
            requires_shipping: true,
            is_taxable: false,
            status: 'published'
        },

        handleImageUpload(event) {
            const files = Array.from(event.target.files);
            
            if (this.form.images.length + files.length > 5) {
                alert('Maximum 5 images allowed');
                return;
            }

            files.forEach(file => {
                if (file.size > 5 * 1024 * 1024) {
                    alert(`${file.name} is too large. Maximum 5MB per image.`);
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    this.form.images.push({
                        file: file,
                        preview: e.target.result
                    });
                };
                reader.readAsDataURL(file);
            });
        },

        removeImage(index) {
            this.form.images.splice(index, 1);
        },

        async submitProduct(status = 'published') {
            if (this.submitting) return;

            this.form.status = status;
            this.submitting = true;

            try {
                const formData = new FormData();
                
                // Append basic fields
                Object.keys(this.form).forEach(key => {
                    if (key !== 'images') {
                        formData.append(key, this.form[key]);
                    }
                });

                // Append images
                this.form.images.forEach((img, index) => {
                    formData.append(`images[${index}]`, img.file);
                });

                const response = await fetch('/api/store/products', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    window.location.href = `/store/shop`;
                } else {
                    alert(data.message || 'Failed to create product');
                }
            } catch (error) {
                console.error('Error creating product:', error);
                alert('An error occurred. Please try again.');
            } finally {
                this.submitting = false;
            }
        }
    }
}
</script>
@endpush
@endsection
