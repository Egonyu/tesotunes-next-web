@extends('layouts.auth')

@section('title', 'Apply as Artist')

@section('content')
<div class="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
            <div class="flex justify-center mb-6">
                <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <span class="material-icons-round text-black text-2xl">star</span>
                </div>
            </div>
            <h2 class="text-3xl font-bold text-white mb-2">
                Become an Artist on Tesotunes
            </h2>
            <p class="text-gray-400">
                Complete your application to start sharing your music
            </p>
            <div class="mt-4 inline-flex items-center gap-2 bg-green-900/30 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg">
                <span class="material-icons-round text-sm">info</span>
                <span class="text-sm">Profile Completion: {{ $profileCompletion }}%</span>
            </div>
        </div>

        <!-- Multi-Step Form -->
        <div class="bg-gray-800 rounded-lg p-8 border border-gray-700" x-data="artistApplication()">
            
            <!-- Progress Steps -->
            <div class="mb-8">
                <div class="flex items-center justify-between">
                    <template x-for="(stepName, index) in steps" :key="index">
                        <div class="flex-1 flex items-center" :class="{'justify-end': index > 0}">
                            <div class="flex items-center">
                                <!-- Step Circle -->
                                <div 
                                    class="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all"
                                    :class="{
                                        'bg-green-600 text-white': currentStep > index,
                                        'bg-green-600 text-white ring-4 ring-green-600/30': currentStep === index,
                                        'bg-gray-700 text-gray-400': currentStep < index
                                    }"
                                >
                                    <span x-show="currentStep <= index" x-text="index + 1"></span>
                                    <span x-show="currentStep > index" class="material-icons-round text-lg">check</span>
                                </div>
                                
                                <!-- Step Label -->
                                <span 
                                    class="ml-2 text-sm font-medium"
                                    :class="currentStep >= index ? 'text-white' : 'text-gray-500'"
                                    x-text="stepName"
                                ></span>
                            </div>
                            
                            <!-- Connector Line -->
                            <div 
                                x-show="index < steps.length - 1" 
                                class="flex-1 h-0.5 mx-4 transition-all"
                                :class="currentStep > index ? 'bg-green-600' : 'bg-gray-700'"
                            ></div>
                        </div>
                    </template>
                </div>
            </div>

            <form method="POST" action="{{ route('frontend.artist.application.store') }}" enctype="multipart/form-data" @submit="handleSubmit">
                @csrf

                <!-- Step 1: Basic Info -->
                <div x-show="currentStep === 0" x-transition>
                    <h3 class="text-xl font-semibold text-white mb-6">Basic Information</h3>

                    <!-- Stage Name -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Stage Name <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="stage_name"
                            required
                            value="{{ old('stage_name') }}"
                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:outline-none @error('stage_name') border-red-500 @enderror"
                            placeholder="Your artist name"
                        >
                        @error('stage_name')
                            <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Bio -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Artist Bio
                        </label>
                        <textarea
                            name="bio"
                            rows="4"
                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:outline-none @error('bio') border-red-500 @enderror"
                            placeholder="Tell us about yourself and your music..."
                        >{{ old('bio') }}</textarea>
                        <p class="text-gray-400 text-xs mt-1">Maximum 2000 characters</p>
                        @error('bio')
                            <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Genre -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Primary Genre <span class="text-red-500">*</span>
                        </label>
                        <select
                            name="genre_id"
                            required
                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:outline-none @error('genre_id') border-red-500 @enderror"
                        >
                            <option value="">Select your primary genre</option>
                            @foreach($genres as $genre)
                                <option value="{{ $genre->id }}" {{ old('genre_id') == $genre->id ? 'selected' : '' }}>
                                    {{ $genre->name }}
                                </option>
                            @endforeach
                        </select>
                        @error('genre_id')
                            <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <!-- Step 2: Contact Information -->
                <div x-show="currentStep === 1" x-transition>
                    <h3 class="text-xl font-semibold text-white mb-6">Contact Information</h3>

                    <!-- Phone Number -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Phone Number <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phone_number"
                            required
                            value="{{ old('phone_number', $user->phone_number) }}"
                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:outline-none @error('phone_number') border-red-500 @enderror"
                            placeholder="256XXXXXXXXX"
                            pattern="256[0-9]{9}"
                        >
                        <p class="text-gray-400 text-xs mt-1">Format: 256XXXXXXXXX (Uganda)</p>
                        @error('phone_number')
                            <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Email -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value="{{ old('email', $user->email) }}"
                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:outline-none @error('email') border-red-500 @enderror"
                            placeholder="your@email.com"
                        >
                        @error('email')
                            <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- WhatsApp -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            WhatsApp Number
                        </label>
                        <input
                            type="tel"
                            name="whatsapp_number"
                            value="{{ old('whatsapp_number') }}"
                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:outline-none @error('whatsapp_number') border-red-500 @enderror"
                            placeholder="256XXXXXXXXX"
                            pattern="256[0-9]{9}"
                        >
                        <p class="text-gray-400 text-xs mt-1">Format: 256XXXXXXXXX</p>
                        @error('whatsapp_number')
                            <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Social Links -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Facebook URL</label>
                            <input
                                type="url"
                                name="facebook_url"
                                value="{{ old('facebook_url', $user->facebook_url) }}"
                                class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:outline-none"
                                placeholder="https://facebook.com/yourpage"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Instagram URL</label>
                            <input
                                type="url"
                                name="instagram_url"
                                value="{{ old('instagram_url', $user->instagram_url) }}"
                                class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:outline-none"
                                placeholder="https://instagram.com/yourpage"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Twitter URL</label>
                            <input
                                type="url"
                                name="twitter_url"
                                value="{{ old('twitter_url', $user->twitter_url) }}"
                                class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:outline-none"
                                placeholder="https://twitter.com/yourhandle"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">YouTube URL</label>
                            <input
                                type="url"
                                name="youtube_url"
                                value="{{ old('youtube_url', $user->youtube_url) }}"
                                class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:outline-none"
                                placeholder="https://youtube.com/yourchannel"
                            >
                        </div>
                    </div>
                </div>

                <!-- Step 3: Identity Verification (KYC) -->
                <div x-show="currentStep === 2" x-transition>
                    <h3 class="text-xl font-semibold text-white mb-6">Identity Verification (KYC)</h3>

                    <div class="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6">
                        <div class="flex gap-3">
                            <span class="material-icons-round text-blue-400">info</span>
                            <div class="text-sm text-blue-300">
                                <p class="font-medium mb-1">Why do we need this?</p>
                                <p>Identity verification helps us ensure the security of all artists on our platform and enables payment processing for your earnings.</p>
                            </div>
                        </div>
                    </div>

                    <!-- National ID Number -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            National ID Number (NIN) <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="national_id"
                            required
                            value="{{ old('national_id') }}"
                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:outline-none @error('national_id') border-red-500 @enderror"
                            placeholder="CM00000000000A"
                            maxlength="14"
                            pattern="[A-Z0-9]{14}"
                        >
                        <p class="text-gray-400 text-xs mt-1">14-character Uganda National ID</p>
                        @error('national_id')
                            <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Document Uploads -->
                    <div class="space-y-6">
                        <!-- National ID Front -->
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                National ID (Front) <span class="text-red-500">*</span>
                            </label>
                            <div class="relative">
                                <input
                                    type="file"
                                    name="national_id_front"
                                    required
                                    accept="image/*"
                                    class="hidden"
                                    id="id_front"
                                    @change="previewFile($event, 'preview_front')"
                                >
                                <label
                                    for="id_front"
                                    class="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors"
                                >
                                    <div class="text-center" id="preview_front">
                                        <span class="material-icons-round text-4xl text-gray-400 mb-2">upload_file</span>
                                        <p class="text-sm text-gray-300 mb-1">Click to upload ID front</p>
                                        <p class="text-xs text-gray-500">Max 5MB (JPG, PNG, PDF)</p>
                                    </div>
                                </label>
                            </div>
                            @error('national_id_front')
                                <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- National ID Back -->
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                National ID (Back) <span class="text-red-500">*</span>
                            </label>
                            <div class="relative">
                                <input
                                    type="file"
                                    name="national_id_back"
                                    required
                                    accept="image/*"
                                    class="hidden"
                                    id="id_back"
                                    @change="previewFile($event, 'preview_back')"
                                >
                                <label
                                    for="id_back"
                                    class="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors"
                                >
                                    <div class="text-center" id="preview_back">
                                        <span class="material-icons-round text-4xl text-gray-400 mb-2">upload_file</span>
                                        <p class="text-sm text-gray-300 mb-1">Click to upload ID back</p>
                                        <p class="text-xs text-gray-500">Max 5MB (JPG, PNG, PDF)</p>
                                    </div>
                                </label>
                            </div>
                            @error('national_id_back')
                                <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Selfie with ID -->
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                Selfie with ID <span class="text-red-500">*</span>
                            </label>
                            <div class="relative">
                                <input
                                    type="file"
                                    name="selfie_with_id"
                                    required
                                    accept="image/*"
                                    class="hidden"
                                    id="selfie"
                                    @change="previewFile($event, 'preview_selfie')"
                                >
                                <label
                                    for="selfie"
                                    class="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors"
                                >
                                    <div class="text-center" id="preview_selfie">
                                        <span class="material-icons-round text-4xl text-gray-400 mb-2">portrait</span>
                                        <p class="text-sm text-gray-300 mb-1">Click to upload selfie</p>
                                        <p class="text-xs text-gray-500">Hold your ID next to your face</p>
                                    </div>
                                </label>
                            </div>
                            @error('selfie_with_id')
                                <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>
                </div>

                <!-- Step 4: Payment Method -->
                <div x-show="currentStep === 3" x-transition>
                    <h3 class="text-xl font-semibold text-white mb-6">Payment Information</h3>

                    <div class="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-6">
                        <div class="flex gap-3">
                            <span class="material-icons-round text-green-400">payments</span>
                            <div class="text-sm text-green-300">
                                <p class="font-medium mb-1">How you'll get paid</p>
                                <p>Your earnings will be sent to this mobile money account monthly. Minimum payout: UGX 50,000</p>
                            </div>
                        </div>
                    </div>

                    <!-- Mobile Money Provider -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Mobile Money Provider <span class="text-red-500">*</span>
                        </label>
                        <div class="grid grid-cols-2 gap-4">
                            <label class="relative cursor-pointer">
                                <input
                                    type="radio"
                                    name="mobile_money_provider"
                                    value="mtn"
                                    required
                                    class="peer sr-only"
                                    {{ old('mobile_money_provider') == 'mtn' ? 'checked' : '' }}
                                >
                                <div class="p-4 border-2 border-gray-600 rounded-lg peer-checked:border-yellow-500 peer-checked:bg-yellow-900/20 transition-all">
                                    <div class="text-center">
                                        <div class="text-2xl font-bold text-yellow-500 mb-2">MTN</div>
                                        <p class="text-xs text-gray-400">Mobile Money</p>
                                    </div>
                                </div>
                            </label>

                            <label class="relative cursor-pointer">
                                <input
                                    type="radio"
                                    name="mobile_money_provider"
                                    value="airtel"
                                    required
                                    class="peer sr-only"
                                    {{ old('mobile_money_provider') == 'airtel' ? 'checked' : '' }}
                                >
                                <div class="p-4 border-2 border-gray-600 rounded-lg peer-checked:border-red-500 peer-checked:bg-red-900/20 transition-all">
                                    <div class="text-center">
                                        <div class="text-2xl font-bold text-red-500 mb-2">Airtel</div>
                                        <p class="text-xs text-gray-400">Money</p>
                                    </div>
                                </div>
                            </label>
                        </div>
                        @error('mobile_money_provider')
                            <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Mobile Money Number -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Mobile Money Number <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="mobile_money_number"
                            required
                            value="{{ old('mobile_money_number') }}"
                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:outline-none @error('mobile_money_number') border-red-500 @enderror"
                            placeholder="256XXXXXXXXX"
                            pattern="256[0-9]{9}"
                        >
                        <p class="text-gray-400 text-xs mt-1">This is where you'll receive your earnings</p>
                        @error('mobile_money_number')
                            <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <!-- Navigation Buttons -->
                <div class="flex items-center justify-between mt-8 pt-6 border-t border-gray-700">
                    <button
                        type="button"
                        @click="previousStep"
                        x-show="currentStep > 0"
                        class="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                    >
                        <span class="flex items-center gap-2">
                            <span class="material-icons-round text-sm">arrow_back</span>
                            Previous
                        </span>
                    </button>

                    <div x-show="currentStep === 0"></div>

                    <button
                        type="button"
                        @click="nextStep"
                        x-show="currentStep < 3"
                        class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors ml-auto"
                    >
                        <span class="flex items-center gap-2">
                            Next
                            <span class="material-icons-round text-sm">arrow_forward</span>
                        </span>
                    </button>

                    <button
                        type="submit"
                        x-show="currentStep === 3"
                        :disabled="submitting"
                        class="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors ml-auto"
                    >
                        <span x-show="!submitting" class="flex items-center gap-2">
                            Submit Application
                            <span class="material-icons-round text-sm">check_circle</span>
                        </span>
                        <span x-show="submitting" class="flex items-center gap-2">
                            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Submitting...
                        </span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
function artistApplication() {
    return {
        currentStep: 0,
        submitting: false,
        steps: ['Basic Info', 'Contact', 'Identity', 'Payment'],
        
        nextStep() {
            if (this.currentStep < this.steps.length - 1) {
                this.currentStep++;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },
        
        previousStep() {
            if (this.currentStep > 0) {
                this.currentStep--;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },
        
        handleSubmit(e) {
            this.submitting = true;
        },
        
        previewFile(event, previewId) {
            const file = event.target.files[0];
            const preview = document.getElementById(previewId);
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `
                        <img src="${e.target.result}" class="w-full h-full object-cover rounded-lg" alt="Preview">
                        <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                            <span class="text-white text-sm">Click to change</span>
                        </div>
                    `;
                    preview.parentElement.classList.remove('border-dashed');
                };
                reader.readAsDataURL(file);
            }
        }
    }
}
</script>
@endpush
