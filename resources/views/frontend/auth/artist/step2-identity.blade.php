@extends('layouts.auth')

@section('title', 'Artist Registration - Step 2: Identity Verification')

@section('content')
<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl w-full space-y-6">
        <!-- Header -->
        <div class="text-center">
            <a href="{{ route('artist.register.index') }}" class="inline-flex justify-center mb-6">
                <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <span class="material-icons-round text-black text-2xl">verified_user</span>
                </div>
            </a>
            <h2 class="text-3xl font-bold text-white mb-2">
                Verify Your Identity
            </h2>
            <p class="text-gray-400">
                Step 2 of 3 - We need to confirm you're a real person
            </p>
        </div>

        <!-- Progress Indicator -->
        @include('frontend.auth.artist.progress', ['current' => 2, 'total' => 3])

        <!-- Card -->
        <div class="bg-gray-800 rounded-lg p-8 border border-gray-700 shadow-2xl">
            <!-- Security Notice -->
            <div class="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div class="flex items-start gap-3">
                    <div class="text-2xl">🔒</div>
                    <div>
                        <p class="text-sm font-medium text-green-300">Your information is secure</p>
                        <p class="text-sm text-gray-400 mt-1">
                            We use bank-level encryption. Your ID is only used for verification and never shared.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Form -->
            <form action="{{ route('artist.register.step2') }}" method="POST" enctype="multipart/form-data" id="step2Form">
                    @csrf

                    <!-- Full Legal Name -->
                    <div class="mb-6">
                        <label for="full_name" class="block text-sm font-medium text-gray-300 mb-2">
                            Full Legal Name *
                        </label>
                        <input type="text" 
                               name="full_name" 
                               id="full_name" 
                               value="{{ old('full_name', $data['full_name'] ?? '') }}"
                               required
                               class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:outline-none"
                               placeholder="As it appears on your National ID">
                        @error('full_name')
                            <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- National ID Number (NIN) -->
                    <div class="mb-6">
                        <label for="nin_number" class="block text-sm font-medium text-gray-300 mb-2">
                            National ID Number (NIN) *
                        </label>
                        <input type="text" 
                               name="nin_number" 
                               id="nin_number" 
                               value="{{ old('nin_number', $data['nin_number'] ?? '') }}"
                               required
                               maxlength="14"
                               pattern="[A-Z0-9]{14}"
                               class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:outline-none uppercase font-mono"
                               placeholder="CM12345678901AB">
                        @error('nin_number')
                            <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                        @enderror
                        <p class="mt-1 text-sm text-gray-500">
                            14 characters - found on your Uganda National ID card
                        </p>
                    </div>

                    <!-- Phone Number -->
                    <div class="mb-6">
                        <label for="phone_number" class="block text-sm font-medium text-gray-300 mb-2">
                            Phone Number *
                        </label>
                        <div class="flex">
                            <span class="inline-flex items-center px-4 text-gray-300 bg-gray-700 border border-r-0 border-gray-600 rounded-l-lg">
                                +256
                            </span>
                            <input type="tel" 
                                   name="phone_number" 
                                   id="phone_number" 
                                   value="{{ old('phone_number', isset($data['phone_number']) ? substr($data['phone_number'], 3) : '') }}"
                                   required
                                   pattern="[0-9]{9}"
                                   maxlength="9"
                                   class="flex-1 bg-gray-700 text-white px-4 py-3 border border-gray-600 rounded-r-lg focus:border-green-500 focus:outline-none"
                                   placeholder="700123456">
                        </div>
                        @error('phone_number')
                            <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                        @enderror
                        <p class="mt-1 text-sm text-gray-500">
                            We'll send a verification code to this number
                        </p>
                    </div>

                    <!-- Document Uploads -->
                    <div class="mb-6">
                        <h3 class="text-lg font-medium text-white mb-4">Upload ID Documents</h3>
                        <p class="text-sm text-gray-400 mb-4">
                            Please upload clear photos of your National ID card and a selfie
                        </p>

                        <!-- ID Front -->
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                National ID (Front) *
                            </label>
                            <div class="border-2 border-dashed border-gray-600 rounded-lg p-4 bg-gray-700/50 hover:bg-gray-600/50 transition-colors">
                                <input type="file" 
                                       name="national_id_front" 
                                       id="national_id_front" 
                                       required
                                       accept="image/*"
                                       class="hidden">
                                <label for="national_id_front" class="cursor-pointer">
                                    <div id="frontPreview" class="hidden mb-3">
                                        <img id="frontImage" src="#" alt="ID Front" class="max-w-full h-48 object-contain mx-auto">
                                    </div>
                                    <div class="text-center">
                                        <div class="text-4xl mb-2">📄</div>
                                        <p class="text-sm text-gray-300">
                                            Click to upload front of National ID
                                        </p>
                                        <p class="text-xs text-gray-500 mt-1">
                                            Max 5MB • JPG, PNG
                                        </p>
                                    </div>
                                </label>
                            </div>
                            @error('national_id_front')
                                <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- ID Back -->
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                National ID (Back) *
                            </label>
                            <div class="border-2 border-dashed border-gray-600 rounded-lg p-4 bg-gray-700/50 hover:bg-gray-600/50 transition-colors">
                                <input type="file" 
                                       name="national_id_back" 
                                       id="national_id_back" 
                                       required
                                       accept="image/*"
                                       class="hidden">
                                <label for="national_id_back" class="cursor-pointer">
                                    <div id="backPreview" class="hidden mb-3">
                                        <img id="backImage" src="#" alt="ID Back" class="max-w-full h-48 object-contain mx-auto">
                                    </div>
                                    <div class="text-center">
                                        <div class="text-4xl mb-2">📄</div>
                                        <p class="text-sm text-gray-300">
                                            Click to upload back of National ID
                                        </p>
                                        <p class="text-xs text-gray-500 mt-1">
                                            Max 5MB • JPG, PNG
                                        </p>
                                    </div>
                                </label>
                            </div>
                            @error('national_id_back')
                                <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Selfie with ID -->
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                Selfie Holding ID *
                            </label>
                            <div class="border-2 border-dashed border-gray-600 rounded-lg p-4 bg-gray-700/50 hover:bg-gray-600/50 transition-colors">
                                <input type="file" 
                                       name="selfie_with_id" 
                                       id="selfie_with_id" 
                                       required
                                       accept="image/*"
                                       class="hidden">
                                <label for="selfie_with_id" class="cursor-pointer">
                                    <div id="selfiePreview" class="hidden mb-3">
                                        <img id="selfieImage" src="#" alt="Selfie" class="max-w-full h-48 object-contain mx-auto">
                                    </div>
                                    <div class="text-center">
                                        <div class="text-4xl mb-2">🤳</div>
                                        <p class="text-sm text-gray-300">
                                            Click to upload selfie holding your ID
                                        </p>
                                        <p class="text-xs text-gray-500 mt-1">
                                            Max 5MB • Make sure your face and ID are clearly visible
                                        </p>
                                    </div>
                                </label>
                            </div>
                            @error('selfie_with_id')
                                <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>

                    <!-- Tips -->
                    <div class="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                        <p class="text-sm font-medium text-yellow-300 mb-2">📸 Photo Tips:</p>
                        <ul class="text-sm text-gray-400 space-y-1 ml-4 list-disc">
                            <li>Ensure good lighting - avoid shadows</li>
                            <li>All text on ID must be readable</li>
                            <li>For selfie: hold ID next to your face</li>
                            <li>No filters or editing</li>
                        </ul>
                    </div>

                    <!-- Actions -->
                    <div class="flex justify-between items-center gap-4">
                        <a href="{{ route('artist.register.step1') }}" 
                           class="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                            <span class="material-icons-round text-sm">arrow_back</span>
                            Back
                        </a>
                        
                        <button type="submit" 
                                class="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center justify-center gap-2">
                            Continue
                            <span class="material-icons-round text-sm">arrow_forward</span>
                        </button>
                    </div>
                </form>
            </div>

            <!-- Help Text -->
            <div class="text-center mt-6">
                <p class="text-gray-500 text-sm">
                    Need help? 
                    <a href="#" class="text-green-500 hover:text-green-400">Contact Support</a>
                </p>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
// Auto-format phone number
document.getElementById('phone_number').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.startsWith('256')) {
        value = value.substring(3);
    }
    if (value.startsWith('0')) {
        value = value.substring(1);
    }
    e.target.value = value.substring(0, 9);
});

// NIN auto-uppercase
document.getElementById('nin_number').addEventListener('input', function(e) {
    e.target.value = e.target.value.toUpperCase();
});

// Image previews
function setupImagePreview(inputId, previewContainerId, previewImageId) {
    document.getElementById(inputId).addEventListener('change', function(e) {
        const file = e.target.files[0];
        const previewContainer = document.getElementById(previewContainerId);
        const previewImage = document.getElementById(previewImageId);
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });
}

setupImagePreview('national_id_front', 'frontPreview', 'frontImage');
setupImagePreview('national_id_back', 'backPreview', 'backImage');
setupImagePreview('selfie_with_id', 'selfiePreview', 'selfieImage');

// Form submission - combine phone number
document.getElementById('step2Form').addEventListener('submit', function(e) {
    const phoneInput = document.getElementById('phone_number');
    phoneInput.value = '256' + phoneInput.value;
});
</script>
@endpush
@endsection
