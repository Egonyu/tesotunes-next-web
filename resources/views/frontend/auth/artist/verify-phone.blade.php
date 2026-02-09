@extends('frontend.layouts.music')

@section('title', 'Verify Your Phone Number')

@section('content')
<div class="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full">
        <div class="bg-white rounded-lg shadow-2xl p-8">
            <!-- Icon -->
            <div class="text-center mb-6">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                    <span class="text-4xl">📱</span>
                </div>
                <h2 class="text-2xl font-bold text-gray-900 mb-2">Verify Your Phone</h2>
                <p class="text-gray-600">
                    We sent a 6-digit code to
                </p>
                <p class="text-lg font-medium text-purple-600">
                    {{ $phoneNumber }}
                </p>
            </div>

            <!-- Verification Form -->
            <form id="verificationForm" class="mb-6">
                @csrf

                <!-- Code Input -->
                <div class="mb-6">
                    <label for="verification_code" class="block text-sm font-medium text-gray-700 mb-2 text-center">
                        Enter Verification Code
                    </label>
                    <input type="text" 
                           name="verification_code" 
                           id="verification_code" 
                           required
                           maxlength="6"
                           pattern="[0-9]{6}"
                           class="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 tracking-widest"
                           placeholder="000000"
                           autocomplete="one-time-code">
                    <p id="errorMessage" class="mt-2 text-sm text-red-600 hidden"></p>
                    <p id="successMessage" class="mt-2 text-sm text-green-600 hidden"></p>
                </div>

                <!-- Submit Button -->
                <button type="submit" 
                        id="verifyBtn"
                        class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:bg-gray-400">
                    Verify Code
                </button>
            </form>

            <!-- Resend Code -->
            <div class="text-center">
                <p class="text-sm text-gray-600 mb-2">
                    Didn't receive the code?
                </p>
                <button id="resendBtn" 
                        class="text-purple-600 hover:text-purple-700 font-medium text-sm">
                    Resend Code
                </button>
                <p id="resendTimer" class="text-sm text-gray-500 mt-2 hidden">
                    Resend available in <span id="countdown">60</span>s
                </p>
            </div>

            <!-- Help -->
            <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p class="text-sm text-blue-800">
                    <strong>💡 Tip:</strong> Check your SMS inbox. The code expires in 15 minutes.
                </p>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
let resendTimeout = null;
let countdownInterval = null;

// Auto-format code input
document.getElementById('verification_code').addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 6);
});

// Verification form submission
document.getElementById('verificationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const code = document.getElementById('verification_code').value;
    const verifyBtn = document.getElementById('verifyBtn');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    if (code.length !== 6) {
        errorMessage.textContent = 'Please enter a 6-digit code';
        errorMessage.classList.remove('hidden');
        return;
    }
    
    // Disable button and show loading
    verifyBtn.disabled = true;
    verifyBtn.textContent = 'Verifying...';
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');
    
    try {
        const response = await fetch('{{ route("artist.register.verify-phone") }}', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('input[name="_token"]').value,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ verification_code: code })
        });
        
        const data = await response.json();
        
        if (data.success) {
            successMessage.textContent = data.message;
            successMessage.classList.remove('hidden');
            
            // Redirect after 1.5 seconds
            setTimeout(() => {
                window.location.href = data.redirect;
            }, 1500);
        } else {
            errorMessage.textContent = data.message || 'Invalid verification code';
            errorMessage.classList.remove('hidden');
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Verify Code';
        }
    } catch (error) {
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.classList.remove('hidden');
        verifyBtn.disabled = false;
        verifyBtn.textContent = 'Verify Code';
    }
});

// Resend code
document.getElementById('resendBtn').addEventListener('click', async function() {
    const resendBtn = this;
    const resendTimer = document.getElementById('resendTimer');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    resendBtn.disabled = true;
    resendBtn.textContent = 'Sending...';
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');
    
    try {
        const response = await fetch('{{ route("artist.register.resend-code") }}', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('input[name="_token"]').value,
                'Accept': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            successMessage.textContent = data.message;
            successMessage.classList.remove('hidden');
            
            // Start countdown
            startResendCountdown();
        } else {
            errorMessage.textContent = data.message || 'Failed to resend code';
            errorMessage.classList.remove('hidden');
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend Code';
        }
    } catch (error) {
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.classList.remove('hidden');
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend Code';
    }
});

function startResendCountdown() {
    const resendBtn = document.getElementById('resendBtn');
    const resendTimer = document.getElementById('resendTimer');
    const countdown = document.getElementById('countdown');
    
    let seconds = 60;
    
    resendBtn.classList.add('hidden');
    resendTimer.classList.remove('hidden');
    
    countdownInterval = setInterval(() => {
        seconds--;
        countdown.textContent = seconds;
        
        if (seconds <= 0) {
            clearInterval(countdownInterval);
            resendBtn.classList.remove('hidden');
            resendTimer.classList.add('hidden');
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend Code';
        }
    }, 1000);
}

// Auto-focus on code input
document.getElementById('verification_code').focus();
</script>
@endpush
@endsection
