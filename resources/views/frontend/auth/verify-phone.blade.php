@extends('frontend.layouts.music')

@section('title', 'Verify Phone Number')

@section('content')
<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
        <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
            </div>
            <h2 class="text-3xl font-bold text-white">Verify Your Phone Number</h2>
            <p class="mt-2 text-gray-300">
                We need to verify your phone number to complete your registration
            </p>
        </div>

        <!-- Phone Number Display -->
        <div class="bg-gray-800 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <p class="text-sm text-gray-400">Phone Number</p>
                    <p class="text-lg font-semibold text-white">{{ $user->phone_number }}</p>
                </div>
                <button type="button" onclick="showUpdateForm()"
                        class="text-green-400 hover:text-green-300 text-sm font-medium">
                    Change
                </button>
            </div>

            <!-- Update Phone Form (Hidden by default) -->
            <div id="update-phone-form" class="hidden border-t border-gray-700 pt-4">
                <form method="POST" action="{{ route('frontend.mobile-verification.update-phone') }}">
                    @csrf
                    <div class="mb-4">
                        <label for="phone_number" class="block text-sm font-medium text-gray-300 mb-2">
                            New Phone Number
                        </label>
                        <input type="tel"
                               id="phone_number"
                               name="phone_number"
                               value="{{ old('phone_number', $user->phone_number) }}"
                               placeholder="256xxxxxxxxx"
                               required
                               class="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-600">
                    </div>
                    <div class="flex space-x-3">
                        <button type="submit"
                                class="flex-1 bg-green-500 text-black font-medium py-2 px-4 rounded-lg hover:bg-green-400 transition-colors">
                            Update Phone
                        </button>
                        <button type="button" onclick="hideUpdateForm()"
                                class="flex-1 bg-gray-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Verification Code Form -->
        <div class="bg-gray-800 rounded-lg p-6">
            @if(session('code_sent'))
                <div class="mb-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <div class="flex items-center">
                        <svg class="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <p class="text-green-300 text-sm">
                            A verification code has been sent to your phone number.
                        </p>
                    </div>
                </div>
            @endif

            <form method="POST" action="{{ route('frontend.mobile-verification.verify') }}">
                @csrf
                <div class="mb-6">
                    <label for="verification_code" class="block text-sm font-medium text-gray-300 mb-2">
                        Verification Code
                    </label>
                    <input type="text"
                           id="verification_code"
                           name="verification_code"
                           value="{{ old('verification_code') }}"
                           placeholder="Enter 6-digit code"
                           maxlength="6"
                           required
                           class="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-600 text-center text-2xl font-mono tracking-widest">
                    <p class="text-gray-400 text-sm mt-2">
                        Enter the 6-digit code sent to your phone number
                    </p>
                </div>

                <button type="submit"
                        class="w-full bg-green-500 text-black font-medium py-3 px-6 rounded-lg hover:bg-green-400 transition-colors">
                    Verify Phone Number
                </button>
            </form>

            <!-- Send Code Form -->
            <div class="mt-4 pt-4 border-t border-gray-700 text-center">
                <p class="text-gray-400 text-sm mb-3">
                    Didn't receive a code?
                </p>
                <form method="POST" action="{{ route('frontend.mobile-verification.send-code') }}" class="inline">
                    @csrf
                    <button type="submit"
                            class="text-green-400 hover:text-green-300 font-medium">
                        Send Verification Code
                    </button>
                </form>
            </div>
        </div>

        <!-- Help Section -->
        <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <div class="flex items-start">
                <svg class="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                    <h3 class="text-white font-medium mb-1">Need Help?</h3>
                    <ul class="text-blue-300 text-sm space-y-1">
                        <li>• Make sure your phone has network coverage</li>
                        <li>• Check your SMS inbox and spam folder</li>
                        <li>• Verification codes expire after 10 minutes</li>
                        <li>• Contact support if you continue having issues</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Back to Profile -->
        <div class="text-center">
            <a href="{{ route('frontend.profile.edit') }}"
               class="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back to Profile
            </a>
        </div>
    </div>
</div>

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    const codeInput = document.getElementById('verification_code');

    // Auto-format verification code input
    codeInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length > 6) {
            value = value.slice(0, 6);
        }
        e.target.value = value;

        // Auto-submit when 6 digits are entered
        if (value.length === 6) {
            // Small delay to let user see the complete code
            setTimeout(() => {
                e.target.closest('form').submit();
            }, 500);
        }
    });

    // Focus on page load
    codeInput.focus();
});

function showUpdateForm() {
    document.getElementById('update-phone-form').classList.remove('hidden');
}

function hideUpdateForm() {
    document.getElementById('update-phone-form').classList.add('hidden');
}
</script>
@endpush
@endsection