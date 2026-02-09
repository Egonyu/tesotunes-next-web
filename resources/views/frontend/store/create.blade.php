@extends('frontend.layouts.store')

@section('title', 'Create Your Store')

@section('content')
<div x-data="storeCreate()" class="min-h-screen bg-black text-white py-8">
    
    <div class="max-w-4xl mx-auto px-4">
        
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <span class="material-icons-round text-4xl text-green-500">storefront</span>
                Create Your Store
            </h1>
            <p class="text-gray-400">Start selling your products and services to fans</p>
        </div>

        <form @submit.prevent="submitStore()" class="space-y-6">
            
            <!-- Store Information Card -->
            <div class="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span class="material-icons-round text-green-500">info</span>
                    Store Information
                </h2>

                <div class="space-y-6">
                    <!-- Store Name -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Store Name <span class="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            x-model="form.name"
                            required
                            placeholder="e.g., John's Merch Store"
                            class="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
                        >
                        <p class="text-xs text-gray-500 mt-1">This will be your store's display name</p>
                    </div>

                    <!-- Store Slug -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Store URL <span class="text-red-500">*</span>
                        </label>
                        <div class="flex items-center gap-2">
                            <span class="text-gray-400">{{ url('store/shops') }}/</span>
                            <input 
                                type="text" 
                                x-model="form.slug"
                                required
                                pattern="[a-z0-9-]+"
                                placeholder="john-merch-store"
                                class="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
                            >
                        </div>
                        <p class="text-xs text-gray-500 mt-1">Only lowercase letters, numbers, and hyphens</p>
                    </div>

                    <!-- Description -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Description <span class="text-red-500">*</span>
                        </label>
                        <textarea 
                            x-model="form.description"
                            required
                            rows="4"
                            placeholder="Tell customers about your store..."
                            class="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition-colors resize-none"
                        ></textarea>
                        <p class="text-xs text-gray-500 mt-1"><span x-text="form.description.length"></span>/500 characters</p>
                    </div>

                    <!-- Contact Email -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Contact Email <span class="text-red-500">*</span>
                        </label>
                        <input 
                            type="email" 
                            x-model="form.contact_email"
                            required
                            placeholder="support@example.com"
                            class="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
                        >
                    </div>

                    <!-- Contact Phone -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Contact Phone
                        </label>
                        <input 
                            type="tel" 
                            x-model="form.contact_phone"
                            placeholder="+256 700 000 000"
                            class="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
                        >
                    </div>
                </div>
            </div>

            <!-- Store Branding Card -->
            <div class="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span class="material-icons-round text-green-500">palette</span>
                    Store Branding
                </h2>

                <div class="space-y-6">
                    <!-- Logo Upload -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Store Logo
                        </label>
                        <div class="flex items-center gap-4">
                            <div class="w-24 h-24 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                                <img x-show="logoPreview" :src="logoPreview" class="w-full h-full object-cover">
                                <span x-show="!logoPreview" class="material-icons-round text-4xl text-gray-600">store</span>
                            </div>
                            <div>
                                <input 
                                    type="file" 
                                    @change="handleLogoUpload($event)"
                                    accept="image/*"
                                    class="hidden"
                                    id="logo-upload"
                                >
                                <label 
                                    for="logo-upload"
                                    class="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg cursor-pointer transition-colors"
                                >
                                    <span class="material-icons-round text-sm">upload</span>
                                    Choose Logo
                                </label>
                                <p class="text-xs text-gray-500 mt-2">Recommended: 500x500px, max 2MB</p>
                            </div>
                        </div>
                    </div>

                    <!-- Banner Upload -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Store Banner
                        </label>
                        <div class="space-y-4">
                            <div class="w-full h-32 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                                <img x-show="bannerPreview" :src="bannerPreview" class="w-full h-full object-cover">
                                <span x-show="!bannerPreview" class="material-icons-round text-4xl text-gray-600">image</span>
                            </div>
                            <div>
                                <input 
                                    type="file" 
                                    @change="handleBannerUpload($event)"
                                    accept="image/*"
                                    class="hidden"
                                    id="banner-upload"
                                >
                                <label 
                                    for="banner-upload"
                                    class="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg cursor-pointer transition-colors"
                                >
                                    <span class="material-icons-round text-sm">upload</span>
                                    Choose Banner
                                </label>
                                <p class="text-xs text-gray-500 mt-2">Recommended: 1920x400px, max 5MB</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Store Settings Card -->
            <div class="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span class="material-icons-round text-green-500">settings</span>
                    Store Settings
                </h2>

                <div class="space-y-6">
                    <!-- Accept Credits -->
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            x-model="form.accept_credits"
                            class="w-5 h-5 rounded bg-gray-800 border-gray-700 text-green-600 focus:ring-green-500"
                        >
                        <div>
                            <p class="text-white font-medium">Accept Platform Credits</p>
                            <p class="text-sm text-gray-400">Allow customers to pay with credits instead of cash</p>
                        </div>
                    </label>

                    <!-- Shipping Available -->
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            x-model="form.shipping_available"
                            class="w-5 h-5 rounded bg-gray-800 border-gray-700 text-green-600 focus:ring-green-500"
                        >
                        <div>
                            <p class="text-white font-medium">Offer Shipping</p>
                            <p class="text-sm text-gray-400">Ship products to customers (you'll set shipping rates later)</p>
                        </div>
                    </label>

                    <!-- Instant Checkout -->
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            x-model="form.instant_checkout"
                            class="w-5 h-5 rounded bg-gray-800 border-gray-700 text-green-600 focus:ring-green-500"
                        >
                        <div>
                            <p class="text-white font-medium">Instant Checkout</p>
                            <p class="text-sm text-gray-400">Process orders immediately without manual approval</p>
                        </div>
                    </label>
                </div>
            </div>

            <!-- Terms Agreement -->
            <div class="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <label class="flex items-start gap-3 cursor-pointer">
                    <input 
                        type="checkbox" 
                        x-model="form.agree_terms"
                        required
                        class="w-5 h-5 rounded bg-gray-800 border-gray-700 text-green-600 focus:ring-green-500 mt-1"
                    >
                    <div>
                        <p class="text-white font-medium">I agree to the Store Terms & Conditions <span class="text-red-500">*</span></p>
                        <p class="text-sm text-gray-400 mt-1">
                            By creating a store, you agree to our 
                            <a href="#" class="text-green-500 hover:text-green-400">Store Seller Agreement</a> and 
                            <a href="#" class="text-green-500 hover:text-green-400">Payment Processing Terms</a>
                        </p>
                    </div>
                </label>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-between pt-6">
                <a href="{{ route('frontend.dashboard') }}" 
                   class="px-6 py-3 text-gray-400 hover:text-white transition-colors">
                    Cancel
                </a>
                
                <button 
                    type="submit"
                    :disabled="submitting"
                    :class="submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'"
                    class="bg-green-600 px-8 py-3 rounded-lg font-bold text-white transition-colors flex items-center gap-2"
                >
                    <span x-show="!submitting" class="material-icons-round">add_business</span>
                    <span x-show="submitting" class="material-icons-round animate-spin">refresh</span>
                    <span x-text="submitting ? 'Creating Store...' : 'Create Store'"></span>
                </button>
            </div>
        </form>

    </div>

</div>

@push('scripts')
<script>
function storeCreate() {
    return {
        form: {
            name: '',
            slug: '',
            description: '',
            contact_email: '{{ auth()->user()->email }}',
            contact_phone: '',
            accept_credits: true,
            shipping_available: true,
            instant_checkout: false,
            agree_terms: false
        },
        logoPreview: null,
        bannerPreview: null,
        logoFile: null,
        bannerFile: null,
        submitting: false,

        init() {
            // Auto-generate slug from name
            this.$watch('form.name', (value) => {
                if (!this.form.slug) {
                    this.form.slug = value.toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .trim();
                }
            });
        },

        handleLogoUpload(event) {
            const file = event.target.files[0];
            if (file) {
                this.logoFile = file;
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.logoPreview = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        },

        handleBannerUpload(event) {
            const file = event.target.files[0];
            if (file) {
                this.bannerFile = file;
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.bannerPreview = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        },

        async submitStore() {
            if (!this.form.agree_terms) {
                alert('Please agree to the terms and conditions');
                return;
            }

            this.submitting = true;

            try {
                const formData = new FormData();
                Object.keys(this.form).forEach(key => {
                    // Convert booleans to 1/0 for Laravel
                    if (typeof this.form[key] === 'boolean') {
                        formData.append(key, this.form[key] ? '1' : '0');
                    } else {
                        formData.append(key, this.form[key]);
                    }
                });

                if (this.logoFile) {
                    formData.append('logo', this.logoFile);
                }

                if (this.bannerFile) {
                    formData.append('banner', this.bannerFile);
                }

                const response = await fetch('{{ route("esokoni.my-store.store") }}', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'Accept': 'application/json'
                    },
                    body: formData
                });

                // Check if response is JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    console.error('Non-JSON response:', text);
                    throw new Error('Server error. Please try again.');
                }

                const data = await response.json();

                if (response.ok) {
                    window.location.href = data.redirect || '{{ route("frontend.store.my-stores") }}';
                } else {
                    // Handle validation errors
                    if (data.errors) {
                        const errorMessages = Object.values(data.errors).flat().join('\n');
                        throw new Error(errorMessages || 'Validation failed');
                    }
                    throw new Error(data.message || 'Failed to create store');
                }
            } catch (error) {
                alert(error.message);
                console.error('Error creating store:', error);
            } finally {
                this.submitting = false;
            }
        }
    }
}
</script>
@endpush
@endsection
