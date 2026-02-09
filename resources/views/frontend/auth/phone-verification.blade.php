@extends('layouts.auth')

@section('title', 'Phone Verification')

@section('content')
<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
        <!-- Header -->
        <div class="text-center">
            <div class="flex justify-center mb-6">
                <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <span class="material-icons-round text-black text-2xl">phone</span>
                </div>
            </div>
            <h2 class="text-3xl font-bold text-white mb-2">
                Verify Your Phone Number
            </h2>
            <p class="text-gray-400 mb-4">
                We've sent a 6-digit verification code to
            </p>
            <p class="text-green-400 font-medium">
                {{ auth()->user()->phone_number }}
            </p>
        </div>

        <!-- Verification Form -->
        <div class="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <form method="POST" action="{{ route('frontend.auth.verify-phone') }}" x-data="verificationForm()">
                @csrf

                <!-- Verification Code Field -->
                <div class="mb-6">
                    <label for="verification_code" class="block text-sm font-medium text-gray-300 mb-2">
                        Verification Code
                    </label>
                    <input
                        id="verification_code"
                        name="verification_code"
                        type="text"
                        required
                        maxlength="6"
                        pattern="[0-9]{6}"
                        value="{{ old('verification_code') }}"
                        class="w-full bg-gray-700 text-white text-center text-2xl tracking-widest rounded-lg px-4 py-4 border border-gray-600 focus:border-green-500 focus:outline-none @error('verification_code') border-red-500 @enderror"
                        placeholder="000000"
                        x-ref="codeInput"
                        @input="formatCode($event)"
                    >
                    @error('verification_code')
                        <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                    @enderror
                    @error('general')
                        <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Timer and Resend -->
                <div class="mb-6 text-center">
                    <div x-show="timeLeft > 0" class="text-gray-400 text-sm mb-2">
                        Resend code in <span x-text="timeLeft"></span> seconds
                    </div>
                    <button
                        type="button"
                        x-show="timeLeft === 0"
                        @click="resendCode"
                        :disabled="resending"
                        class="text-green-500 hover:text-green-400 text-sm font-medium disabled:opacity-50"
                    >
                        <span x-show="!resending">Resend verification code</span>
                        <span x-show="resending">Sending...</span>
                    </button>
                </div>

                <!-- Submit Button -->
                <button
                    type="submit"
                    :disabled="loading || $refs.codeInput.value.length !== 6"
                    class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                    <span x-show="!loading">Verify Phone Number</span>
                    <span x-show="loading" class="flex items-center justify-center gap-2">
                        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Verifying...
                    </span>
                </button>
            </form>
        </div>

        <!-- Help Section -->
        <div class="text-center">
            <p class="text-gray-400 text-sm mb-2">
                Didn't receive the code?
            </p>
            <p class="text-gray-500 text-sm">
                Check your SMS messages or try resending the code.
                Need help? <a href="#" class="text-green-500 hover:text-green-400">Contact Support</a>
            </p>
        </div>

        <!-- Back to Registration -->
        <div class="text-center">
            <form method="POST" action="{{ route('logout') }}" class="inline">
                @csrf
                <button type="submit" class="text-gray-400 hover:text-white text-sm">
                    Use a different phone number
                </button>
            </form>
        </div>
    </div>
</div>

@push('scripts')
<script>
function verificationForm() {
    return {
        loading: false,
        resending: false,
        timeLeft: 60, // 60 seconds countdown

        init() {
            // Start countdown timer
            this.startTimer();

            // Auto-focus the code input
            this.$refs.codeInput.focus();

            // Auto-submit when 6 digits are entered
            this.$refs.codeInput.addEventListener('input', (e) => {
                if (e.target.value.length === 6) {
                    setTimeout(() => {
                        if (e.target.value.length === 6) {
                            this.submitForm();
                        }
                    }, 500); // Small delay to allow user to see the complete code
                }
            });
        },

        startTimer() {
            const timer = setInterval(() => {
                if (this.timeLeft > 0) {
                    this.timeLeft--;
                } else {
                    clearInterval(timer);
                }
            }, 1000);
        },

        formatCode(event) {
            // Only allow digits
            let value = event.target.value.replace(/\D/g, '');

            // Limit to 6 digits
            if (value.length > 6) {
                value = value.slice(0, 6);
            }

            event.target.value = value;
        },

        async submitForm() {
            if (this.loading) return;

            this.loading = true;

            const form = this.$el.querySelector('form');
            const formData = new FormData(form);

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    }
                });

                const data = await response.json();

                if (data.success) {
                    // Show success and redirect
                    if (data.redirect) {
                        window.location.href = data.redirect;
                    }
                } else {
                    // Handle errors
                    this.handleErrors(data.errors || {});

                    // Clear the input for retry
                    this.$refs.codeInput.value = '';
                    this.$refs.codeInput.focus();
                }
            } catch (error) {
                console.error('Verification error:', error);
                alert('Verification failed. Please try again.');

                // Clear the input for retry
                this.$refs.codeInput.value = '';
                this.$refs.codeInput.focus();
            } finally {
                this.loading = false;
            }
        },

        async resendCode() {
            if (this.resending) return;

            this.resending = true;

            try {
                const response = await fetch('{{ route("frontend.auth.resend-verification") }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'X-Requested-With': 'XMLHttpRequest',
                    }
                });

                const data = await response.json();

                if (data.success) {
                    // Reset timer
                    this.timeLeft = 60;
                    this.startTimer();

                    // Clear current input
                    this.$refs.codeInput.value = '';
                    this.$refs.codeInput.focus();

                    // Show success message (you could add a toast notification here)
                    console.log('Verification code sent successfully');
                } else {
                    alert(data.message || 'Failed to resend code. Please try again.');
                }
            } catch (error) {
                console.error('Resend error:', error);
                alert('Failed to resend code. Please try again.');
            } finally {
                this.resending = false;
            }
        },

        handleErrors(errors) {
            // Clear previous errors
            document.querySelectorAll('.text-red-400').forEach(el => el.remove());
            document.querySelectorAll('.border-red-500').forEach(el => {
                el.classList.remove('border-red-500');
                el.classList.add('border-gray-600');
            });

            // Display new errors
            Object.keys(errors).forEach(field => {
                const input = document.querySelector(`[name="${field}"]`) || this.$refs.codeInput;
                if (input) {
                    input.classList.add('border-red-500');
                    const error = document.createElement('p');
                    error.className = 'text-red-400 text-sm mt-1';
                    error.textContent = errors[field][0];
                    input.parentNode.appendChild(error);
                }
            });
        }
    }
}
</script>
@endpush
@endsection