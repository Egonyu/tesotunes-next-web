@extends('layouts.auth')

@section('title', 'Artist Registration - Step 3: Payment Setup')

@section('content')
<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl w-full space-y-6">
        <!-- Header -->
        <div class="text-center">
            <a href="{{ route('artist.register.index') }}" class="inline-flex justify-center mb-6">
                <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <span class="material-icons-round text-black text-2xl">credit_card</span>
                </div>
            </a>
            <h2 class="text-3xl font-bold text-white mb-2">
                Almost Done!
            </h2>
            <p class="text-gray-400">
                Step 3 of 3 - Set up payments and create your account
            </p>
        </div>

        <!-- Progress Indicator -->
        @include('frontend.auth.artist.progress', ['current' => 3, 'total' => 3])

        <!-- Card -->
        <div class="bg-gray-800 rounded-lg p-8 border border-gray-700 shadow-2xl">
            <!-- Summary Box -->
            <div class="mb-6 p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                <p class="text-sm font-medium text-gray-300 mb-2">📋 Your Details:</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-400">
                    <p>🎵 Stage Name: <strong class="text-white">{{ $step1Data['stage_name'] ?? 'N/A' }}</strong></p>
                    <p>👤 Full Name: <strong class="text-white">{{ $step2Data['full_name'] ?? 'N/A' }}</strong></p>
                    <p>📱 Phone: <strong class="text-white">{{ $step2Data['phone_number'] ?? 'N/A' }}</strong></p>
                </div>
            </div>

            <!-- Form -->
            <form action="{{ route('artist.register.step3') }}" method="POST" id="step3Form">
                    @csrf

                    <h3 class="text-lg font-medium text-white mb-4">Payment Information</h3>

                    <!-- Mobile Money Provider -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-300 mb-3">
                            Mobile Money Provider *
                        </label>
                        <div class="grid grid-cols-2 gap-4">
                            <label class="relative flex items-center p-4 border-2 border-gray-600 rounded-lg cursor-pointer hover:border-green-500 bg-gray-700/50 transition-colors">
                                <input type="radio" 
                                       name="mobile_money_provider" 
                                       value="mtn" 
                                       required
                                       {{ old('mobile_money_provider', $data['mobile_money_provider'] ?? '') == 'mtn' ? 'checked' : '' }}
                                       class="sr-only">
                                <div class="flex-1 text-center">
                                    <div class="text-3xl mb-2">📱</div>
                                    <div class="font-medium text-white">MTN Mobile Money</div>
                                </div>
                                <div class="absolute top-2 right-2 hidden radio-check">
                                    <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                    </svg>
                                </div>
                            </label>

                            <label class="relative flex items-center p-4 border-2 border-gray-600 rounded-lg cursor-pointer hover:border-green-500 bg-gray-700/50 transition-colors">
                                <input type="radio" 
                                       name="mobile_money_provider" 
                                       value="airtel" 
                                       required
                                       {{ old('mobile_money_provider', $data['mobile_money_provider'] ?? '') == 'airtel' ? 'checked' : '' }}
                                       class="sr-only">
                                <div class="flex-1 text-center">
                                    <div class="text-3xl mb-2">📱</div>
                                    <div class="font-medium text-white">Airtel Money</div>
                                </div>
                                <div class="absolute top-2 right-2 hidden radio-check">
                                    <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                    </svg>
                                </div>
                            </label>
                        </div>
                        @error('mobile_money_provider')
                            <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Mobile Money Number -->
                    <div class="mb-6">
                        <label for="mobile_money_number" class="block text-sm font-medium text-gray-300 mb-2">
                            Mobile Money Number *
                        </label>
                        <div class="flex">
                            <span class="inline-flex items-center px-4 text-gray-300 bg-gray-700 border border-r-0 border-gray-600 rounded-l-lg">
                                +256
                            </span>
                            <input type="tel" 
                                   name="mobile_money_number" 
                                   id="mobile_money_number" 
                                   value="{{ old('mobile_money_number', isset($data['mobile_money_number']) ? substr($data['mobile_money_number'], 3) : '') }}"
                                   required
                                   pattern="[0-9]{9}"
                                   maxlength="9"
                                   class="flex-1 bg-gray-700 text-white px-4 py-3 border border-gray-600 rounded-r-lg focus:border-green-500 focus:outline-none"
                                   placeholder="700123456">
                        </div>
                        @error('mobile_money_number')
                            <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                        @enderror
                        <p class="mt-1 text-sm text-gray-500">
                            💰 Your earnings will be sent to this number monthly
                        </p>
                    </div>

                    <hr class="my-8 border-gray-700">

                    <h3 class="text-lg font-medium text-white mb-4">Account Credentials</h3>

                    <!-- Email -->
                    <div class="mb-6">
                        <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                            Email Address *
                        </label>
                        <input type="email" 
                               name="email" 
                               id="email" 
                               value="{{ old('email', $data['email'] ?? '') }}"
                               required
                               class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:outline-none"
                               placeholder="your.email@example.com">
                        @error('email')
                            <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                        @enderror
                        <p class="mt-1 text-sm text-gray-500">
                            We'll send important updates and payment notifications here
                        </p>
                    </div>

                    <!-- Password -->
                    <div class="mb-6">
                        <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
                            Password *
                        </label>
                        <div class="relative">
                            <input type="password" 
                                   name="password" 
                                   id="password" 
                                   required
                                   minlength="8"
                                   class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:outline-none"
                                   placeholder="At least 8 characters">
                            <button type="button" 
                                    id="togglePassword"
                                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200">
                                👁️
                            </button>
                        </div>
                        @error('password')
                            <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                        @enderror
                        <div class="mt-2 text-sm text-gray-500">
                            <p>Password must contain:</p>
                            <ul class="ml-4 mt-1 space-y-1">
                                <li id="lengthCheck" class="text-gray-500">✗ At least 8 characters</li>
                                <li id="letterCheck" class="text-gray-500">✗ At least one letter</li>
                                <li id="numberCheck" class="text-gray-500">✗ At least one number</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Confirm Password -->
                    <div class="mb-6">
                        <label for="password_confirmation" class="block text-sm font-medium text-gray-300 mb-2">
                            Confirm Password *
                        </label>
                        <input type="password" 
                               name="password_confirmation" 
                               id="password_confirmation" 
                               required
                               minlength="8"
                               class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:outline-none"
                               placeholder="Re-enter your password">
                        <p class="mt-1 text-sm text-gray-500" id="passwordMatch"></p>
                    </div>

                    <!-- Terms & Conditions -->
                    <div class="mb-8">
                        <label class="flex items-start cursor-pointer">
                            <input type="checkbox" 
                                   name="terms" 
                                   id="terms" 
                                   required
                                   value="1"
                                   class="mt-1 mr-3 h-5 w-5 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500">
                            <span class="text-sm text-gray-400">
                                I agree to the 
                                <a href="#" class="text-green-500 hover:text-green-400">Terms of Service</a>
                                and 
                                <a href="#" class="text-green-500 hover:text-green-400">Privacy Policy</a>.
                                I confirm that I have the rights to upload and distribute the music I will share on this platform.
                            </span>
                        </label>
                        @error('terms')
                            <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Actions -->
                    <div class="flex justify-between items-center gap-4">
                        <a href="{{ route('artist.register.step2') }}" 
                           class="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                            <span class="material-icons-round text-sm">arrow_back</span>
                            Back
                        </a>
                        
                        <button type="submit" 
                                id="submitBtn"
                                disabled
                                class="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            Create Account 🎉
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
// Mobile money number formatting
document.getElementById('mobile_money_number').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.startsWith('256')) value = value.substring(3);
    if (value.startsWith('0')) value = value.substring(1);
    e.target.value = value.substring(0, 9);
});

// Radio button visual feedback
document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', function() {
        document.querySelectorAll('label.relative').forEach(label => {
            label.classList.remove('border-green-500', 'bg-green-900/20');
            label.querySelector('.radio-check').classList.add('hidden');
        });
        
        if (this.checked) {
            const label = this.closest('label');
            label.classList.add('border-green-500', 'bg-green-900/20');
            label.querySelector('.radio-check').classList.remove('hidden');
        }
        
        validateForm();
    });
    
    // Initialize checked state
    if (radio.checked) {
        const label = radio.closest('label');
        label.classList.add('border-green-500', 'bg-green-900/20');
        label.querySelector('.radio-check').classList.remove('hidden');
    }
});

// Toggle password visibility
document.getElementById('togglePassword').addEventListener('click', function() {
    const password = document.getElementById('password');
    password.type = password.type === 'password' ? 'text' : 'password';
    this.textContent = password.type === 'password' ? '👁️' : '🙈';
});

// Password validation
document.getElementById('password').addEventListener('input', function(e) {
    const password = e.target.value;
    
    // Length check
    const lengthCheck = document.getElementById('lengthCheck');
    if (password.length >= 8) {
        lengthCheck.textContent = '✓ At least 8 characters';
        lengthCheck.classList.remove('text-gray-500');
        lengthCheck.classList.add('text-green-400');
    } else {
        lengthCheck.textContent = '✗ At least 8 characters';
        lengthCheck.classList.remove('text-green-400');
        lengthCheck.classList.add('text-gray-500');
    }
    
    // Letter check
    const letterCheck = document.getElementById('letterCheck');
    if (/[a-zA-Z]/.test(password)) {
        letterCheck.textContent = '✓ At least one letter';
        letterCheck.classList.remove('text-gray-500');
        letterCheck.classList.add('text-green-400');
    } else {
        letterCheck.textContent = '✗ At least one letter';
        letterCheck.classList.remove('text-green-400');
        letterCheck.classList.add('text-gray-500');
    }
    
    // Number check
    const numberCheck = document.getElementById('numberCheck');
    if (/[0-9]/.test(password)) {
        numberCheck.textContent = '✓ At least one number';
        numberCheck.classList.remove('text-gray-500');
        numberCheck.classList.add('text-green-400');
    } else {
        numberCheck.textContent = '✗ At least one number';
        numberCheck.classList.remove('text-green-400');
        numberCheck.classList.add('text-gray-500');
    }
    
    validateForm();
});

// Confirm password matching
document.getElementById('password_confirmation').addEventListener('input', function(e) {
    const password = document.getElementById('password').value;
    const confirmation = e.target.value;
    const matchText = document.getElementById('passwordMatch');
    
    if (confirmation.length > 0) {
        if (password === confirmation) {
            matchText.textContent = '✓ Passwords match';
            matchText.classList.remove('text-red-400');
            matchText.classList.add('text-green-400');
        } else {
            matchText.textContent = '✗ Passwords do not match';
            matchText.classList.remove('text-green-400');
            matchText.classList.add('text-red-400');
        }
    } else {
        matchText.textContent = '';
    }
    
    validateForm();
});

// Terms checkbox
document.getElementById('terms').addEventListener('change', validateForm);

// Email validation
document.getElementById('email').addEventListener('input', validateForm);

// Mobile money number validation
document.getElementById('mobile_money_number').addEventListener('input', validateForm);

// Form validation
function validateForm() {
    const password = document.getElementById('password').value;
    const confirmation = document.getElementById('password_confirmation').value;
    const terms = document.getElementById('terms').checked;
    const provider = document.querySelector('input[name="mobile_money_provider"]:checked');
    const email = document.getElementById('email').value;
    const mobileMoneyNumber = document.getElementById('mobile_money_number').value;
    const submitBtn = document.getElementById('submitBtn');
    
    const validPassword = password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
    const passwordsMatch = password === confirmation && confirmation.length > 0;
    const validEmail = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validMobileNumber = mobileMoneyNumber.length === 9;
    
    if (validPassword && passwordsMatch && terms && provider && validEmail && validMobileNumber) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
}

// Form submission
document.getElementById('step3Form').addEventListener('submit', function(e) {
    const mobileMoneyInput = document.getElementById('mobile_money_number');
    mobileMoneyInput.value = '256' + mobileMoneyInput.value;
});

// Run validation on page load in case fields are pre-filled
document.addEventListener('DOMContentLoaded', function() {
    validateForm();
});
</script>
@endpush
@endsection
