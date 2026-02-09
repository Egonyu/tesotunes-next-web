@extends('frontend.layouts.store')

@section('title', 'Edit Store - ' . $store->name)

@section('content')
<div x-data="storeEdit()" class="space-y-6">
    
    <!-- Store Edit Hero -->
    <div class="relative rounded-2xl overflow-hidden">
        <!-- Banner Preview -->
        <div class="h-32 sm:h-48 md:h-56 w-full">
            <template x-if="bannerPreview">
                <div class="absolute inset-0 bg-cover bg-center" :style="'background-image: url(' + bannerPreview + ')'"></div>
            </template>
            <template x-if="!bannerPreview">
                @if($store->banner)
                <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('{{ Storage::url($store->banner) }}');"></div>
                @else
                <div class="absolute inset-0 bg-gradient-to-br from-brand-green/30 via-teal-600/30 to-purple-600/30"></div>
                @endif
            </template>
            <div class="absolute inset-0 bg-gradient-to-t from-gray-100 dark:from-[#0D1117] via-gray-100/60 dark:via-[#0D1117]/60 to-transparent"></div>
            
            <!-- Change Banner Button -->
            <label for="banner-upload" class="absolute top-4 right-4 px-4 py-2 bg-black/50 hover:bg-black/70 text-white rounded-xl cursor-pointer transition-all flex items-center gap-2 backdrop-blur-sm">
                <span class="material-symbols-outlined text-lg">add_photo_alternate</span>
                <span class="hidden sm:inline">Change Banner</span>
            </label>
            <input type="file" @change="handleBannerUpload($event)" accept="image/*" class="hidden" id="banner-upload">
        </div>
        
        <!-- Store Info Overlay -->
        <div class="relative -mt-16 sm:-mt-20 px-4 sm:px-6 pb-4">
            <div class="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                <!-- Store Logo with Upload -->
                <div class="relative group">
                    <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-gray-100 dark:border-[#0D1117] overflow-hidden shadow-xl bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                        <template x-if="logoPreview">
                            <img :src="logoPreview" class="w-full h-full object-cover">
                        </template>
                        <template x-if="!logoPreview">
                            @if($store->logo)
                            <img src="{{ Storage::url($store->logo) }}" alt="{{ $store->name }}" class="w-full h-full object-cover">
                            @else
                            <div class="w-full h-full bg-gradient-to-br from-brand-green to-teal-500 flex items-center justify-center">
                                <span class="text-3xl font-black text-white">{{ substr($store->name, 0, 1) }}</span>
                            </div>
                            @endif
                        </template>
                    </div>
                    <label for="logo-upload" class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-2xl cursor-pointer transition-all">
                        <span class="material-symbols-outlined text-white text-2xl">add_photo_alternate</span>
                    </label>
                    <input type="file" @change="handleLogoUpload($event)" accept="image/*" class="hidden" id="logo-upload">
                </div>
                
                <!-- Store Details -->
                <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2 mb-1">
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                            <span class="material-symbols-outlined text-sm">edit</span>
                            Editing Mode
                        </span>
                        @if($store->is_verified)
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-green text-white text-xs font-bold rounded-full">
                            <span class="material-symbols-outlined text-sm">verified</span>
                            Verified
                        </span>
                        @endif
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white truncate" x-text="form.name || '{{ $store->name }}'"></h1>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Update your store details below</p>
                </div>
                
                <!-- Back Button -->
                <div class="flex gap-2 w-full sm:w-auto">
                    <a href="{{ route('frontend.store.dashboard', $store) }}" 
                       class="flex-1 sm:flex-none px-6 py-2.5 bg-gray-200 dark:bg-[#21262D] hover:bg-gray-300 dark:hover:bg-[#30363D] text-gray-700 dark:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined">arrow_back</span>
                        <span>Dashboard</span>
                    </a>
                </div>
            </div>
        </div>
    </div>

    <form @submit.prevent="submitStore()" class="space-y-6">
        
        <!-- Store Information Card -->
        <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-[#30363D]">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-brand-green">info</span>
                    Store Information
                </h2>
            </div>

            <div class="p-6 space-y-6">
                <!-- Store Name -->
                <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Store Name <span class="text-red-500">*</span>
                    </label>
                    <input 
                        type="text" 
                        x-model="form.name"
                        required
                        class="w-full bg-gray-100 dark:bg-[#21262D] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-300 dark:border-[#30363D] focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 focus:outline-none transition-all"
                        placeholder="Enter store name"
                    >
                </div>

                <!-- Store Slug -->
                <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Store URL <span class="text-red-500">*</span>
                    </label>
                    <div class="flex items-center gap-2">
                        <span class="text-gray-500 dark:text-gray-400 text-sm">{{ url('store/stores') }}/</span>
                        <input 
                            type="text" 
                            x-model="form.slug"
                            required
                            pattern="[a-z0-9-]+"
                            class="flex-1 bg-gray-100 dark:bg-[#21262D] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-300 dark:border-[#30363D] focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 focus:outline-none transition-all"
                            placeholder="your-store-slug"
                        >
                    </div>
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Only lowercase letters, numbers, and hyphens allowed</p>
                </div>

                <!-- Description -->
                <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Description <span class="text-red-500">*</span>
                    </label>
                    <textarea 
                        x-model="form.description"
                        required
                        rows="4"
                        class="w-full bg-gray-100 dark:bg-[#21262D] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-300 dark:border-[#30363D] focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 focus:outline-none transition-all resize-none"
                        placeholder="Describe your store..."
                    ></textarea>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <!-- Contact Email -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Contact Email <span class="text-red-500">*</span>
                        </label>
                        <input 
                            type="email" 
                            x-model="form.contact_email"
                            required
                            class="w-full bg-gray-100 dark:bg-[#21262D] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-300 dark:border-[#30363D] focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 focus:outline-none transition-all"
                            placeholder="contact@example.com"
                        >
                    </div>

                    <!-- Contact Phone -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Contact Phone
                        </label>
                        <input 
                            type="tel" 
                            x-model="form.contact_phone"
                            class="w-full bg-gray-100 dark:bg-[#21262D] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-300 dark:border-[#30363D] focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 focus:outline-none transition-all"
                            placeholder="+256 700 000 000"
                        >
                    </div>
                </div>
            </div>
        </div>

        <!-- Store Settings Card -->
        <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D] overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-[#30363D]">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-brand-green">settings</span>
                    Store Settings
                </h2>
            </div>

            <div class="p-6 space-y-6">
                <!-- Store Status -->
                <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Store Status</label>
                    <select 
                        x-model="form.status"
                        class="w-full bg-gray-100 dark:bg-[#21262D] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-300 dark:border-[#30363D] focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 focus:outline-none transition-all"
                    >
                        <option value="active">Active - Store is live and accepting orders</option>
                        <option value="paused">Paused - Temporarily closed</option>
                        <option value="maintenance">Maintenance - Under construction</option>
                    </select>
                </div>

                <!-- Settings Toggles -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <!-- Accept Credits -->
                    <label class="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#21262D] rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-[#30363D] transition-all border border-gray-200 dark:border-[#30363D]">
                        <input 
                            type="checkbox" 
                            x-model="form.accept_credits"
                            class="w-5 h-5 mt-0.5 rounded bg-gray-200 dark:bg-[#30363D] border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green"
                        >
                        <div>
                            <p class="text-gray-900 dark:text-white font-semibold text-sm">Accept Credits</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Allow payment with credits</p>
                        </div>
                    </label>

                    <!-- Shipping Available -->
                    <label class="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#21262D] rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-[#30363D] transition-all border border-gray-200 dark:border-[#30363D]">
                        <input 
                            type="checkbox" 
                            x-model="form.shipping_available"
                            class="w-5 h-5 mt-0.5 rounded bg-gray-200 dark:bg-[#30363D] border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green"
                        >
                        <div>
                            <p class="text-gray-900 dark:text-white font-semibold text-sm">Offer Shipping</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Ship products to customers</p>
                        </div>
                    </label>

                    <!-- Instant Checkout -->
                    <label class="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#21262D] rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-[#30363D] transition-all border border-gray-200 dark:border-[#30363D]">
                        <input 
                            type="checkbox" 
                            x-model="form.instant_checkout"
                            class="w-5 h-5 mt-0.5 rounded bg-gray-200 dark:bg-[#30363D] border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green"
                        >
                        <div>
                            <p class="text-gray-900 dark:text-white font-semibold text-sm">Instant Checkout</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Process orders immediately</p>
                        </div>
                    </label>
                </div>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-[#30363D]">
            <button 
                type="button"
                @click="deleteStore()"
                class="w-full sm:w-auto px-6 py-3 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold"
            >
                <span class="material-symbols-outlined">delete</span>
                Delete Store
            </button>
            
            <div class="flex gap-3 w-full sm:w-auto">
                <a href="{{ route('frontend.store.dashboard', $store) }}" 
                   class="flex-1 sm:flex-none px-6 py-3 bg-gray-200 dark:bg-[#21262D] hover:bg-gray-300 dark:hover:bg-[#30363D] text-gray-700 dark:text-white rounded-xl transition-all flex items-center justify-center gap-2 font-semibold">
                    <span class="material-symbols-outlined">close</span>
                    Cancel
                </a>
                <button 
                    type="submit"
                    :disabled="submitting"
                    :class="submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'"
                    class="flex-1 sm:flex-none bg-brand-green px-8 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-green/25"
                >
                    <span x-show="!submitting" class="material-symbols-outlined">save</span>
                    <span x-show="submitting" class="material-symbols-outlined animate-spin">refresh</span>
                    <span x-text="submitting ? 'Saving...' : 'Save Changes'"></span>
                </button>
            </div>
        </div>
    </form>

</div>

@push('scripts')
<script>
function storeEdit() {
    return {
        form: {
            name: @json($store->name),
            slug: @json($store->slug),
            description: @json($store->description),
            contact_email: @json($store->contact_email),
            contact_phone: @json($store->contact_phone ?? ''),
            status: @json($store->status),
            accept_credits: {{ $store->accept_credits ? 'true' : 'false' }},
            shipping_available: {{ $store->shipping_available ? 'true' : 'false' }},
            instant_checkout: {{ $store->instant_checkout ? 'true' : 'false' }}
        },
        logoPreview: null,
        bannerPreview: null,
        logoFile: null,
        bannerFile: null,
        submitting: false,

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
            this.submitting = true;

            try {
                const formData = new FormData();
                formData.append('_method', 'PUT');
                Object.keys(this.form).forEach(key => {
                    formData.append(key, this.form[key]);
                });

                if (this.logoFile) {
                    formData.append('logo', this.logoFile);
                }

                if (this.bannerFile) {
                    formData.append('banner', this.bannerFile);
                }

                const response = await fetch('{{ route("frontend.store.update", $store) }}', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    window.location.href = '{{ route("frontend.store.dashboard", $store) }}';
                } else {
                    throw new Error(data.message || 'Failed to update store');
                }
            } catch (error) {
                alert(error.message);
            } finally {
                this.submitting = false;
            }
        },

        async deleteStore() {
            if (!confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
                return;
            }

            try {
                const response = await fetch('{{ route("frontend.store.destroy", $store) }}', {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    }
                });

                if (response.ok) {
                    window.location.href = '{{ route("frontend.store.my-stores") }}';
                } else {
                    throw new Error('Failed to delete store');
                }
            } catch (error) {
                alert(error.message);
            }
        }
    }
}
</script>
@endpush
@endsection
