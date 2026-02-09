@extends('frontend.layouts.music')

@section('title', 'Registration Complete - Welcome to LineOne Music!')

@section('content')
<div class="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center px-4 py-12">
    <div class="max-w-3xl w-full">
        <div class="bg-white rounded-lg shadow-2xl p-8 md:p-12">
            <!-- Success Icon -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce">
                    <span class="text-6xl">🎉</span>
                </div>
                <h1 class="text-4xl font-bold text-gray-900 mb-3">
                    Welcome to LineOne Music!
                </h1>
                <p class="text-xl text-gray-600">
                    You're one step away from sharing your music with the world
                </p>
            </div>

            <!-- Artist Info Card -->
            <div class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 mb-8 border border-purple-200">
                <div class="flex items-center space-x-4">
                    @if($user->avatar)
                        <img src="{{ Storage::url($user->avatar) }}" alt="{{ $user->stage_name }}" class="w-20 h-20 rounded-full border-4 border-white shadow-lg">
                    @else
                        <div class="w-20 h-20 rounded-full bg-purple-600 text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg">
                            {{ strtoupper(substr($user->stage_name, 0, 1)) }}
                        </div>
                    @endif
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">{{ $user->stage_name }}</h2>
                        <p class="text-gray-600">{{ $user->full_name }}</p>
                        <p class="text-sm text-purple-600 font-medium mt-1">
                            ✓ Phone Verified • ⏳ Pending Admin Approval
                        </p>
                    </div>
                </div>
            </div>

            <!-- What's Next -->
            <div class="mb-8">
                <h3 class="text-2xl font-bold text-gray-900 mb-4">What Happens Next?</h3>
                
                <div class="space-y-4">
                    <!-- Step 1 -->
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <div class="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                                1
                            </div>
                        </div>
                        <div class="ml-4">
                            <h4 class="font-bold text-gray-900">Verification Review</h4>
                            <p class="text-gray-600">
                                Our team will review your application within <strong>24-48 hours</strong>. 
                                We'll verify your identity documents and profile information.
                            </p>
                        </div>
                    </div>

                    <!-- Step 2 -->
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <div class="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                                2
                            </div>
                        </div>
                        <div class="ml-4">
                            <h4 class="font-bold text-gray-900">Email Notification</h4>
                            <p class="text-gray-600">
                                We'll send you an email at <strong>{{ $user->email }}</strong> once your account is approved. 
                                You'll also receive an SMS notification.
                            </p>
                        </div>
                    </div>

                    <!-- Step 3 -->
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <div class="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                                3
                            </div>
                        </div>
                        <div class="ml-4">
                            <h4 class="font-bold text-gray-900">Start Uploading</h4>
                            <p class="text-gray-600">
                                Once approved, you can upload your music, create albums, and start distributing 
                                to Spotify, Apple Music, and other platforms!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Features Preview -->
            <div class="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 class="font-bold text-gray-900 mb-4">What You'll Get Access To:</h3>
                <div class="grid md:grid-cols-2 gap-4">
                    <div class="flex items-start">
                        <span class="text-2xl mr-3">🎵</span>
                        <div>
                            <p class="font-medium text-gray-900">Music Distribution</p>
                            <p class="text-sm text-gray-600">Upload to all major platforms</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <span class="text-2xl mr-3">💰</span>
                        <div>
                            <p class="font-medium text-gray-900">Revenue Tracking</p>
                            <p class="text-sm text-gray-600">Real-time earnings dashboard</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <span class="text-2xl mr-3">📊</span>
                        <div>
                            <p class="font-medium text-gray-900">Analytics</p>
                            <p class="text-sm text-gray-600">Detailed play & download stats</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <span class="text-2xl mr-3">🎤</span>
                        <div>
                            <p class="font-medium text-gray-900">Artist Profile</p>
                            <p class="text-sm text-gray-600">Build your fanbase</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Important Info -->
            <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8">
                <div class="flex items-start">
                    <span class="text-2xl mr-3">⚠️</span>
                    <div>
                        <p class="font-medium text-yellow-900 mb-1">Important:</p>
                        <ul class="text-sm text-yellow-800 space-y-1 ml-4 list-disc">
                            <li>Keep your phone number active - we'll use it for verification</li>
                            <li>Check your email regularly for updates</li>
                            <li>If we need additional information, we'll contact you</li>
                            <li>Average approval time: 24-48 hours</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- CTA Buttons -->
            <div class="space-y-3">
                <a href="{{ route('frontend.discover') }}" 
                   class="block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-center py-4 rounded-lg transition-colors shadow-lg hover:shadow-xl">
                    Explore Platform
                </a>
            </div>

            <!-- Help -->
            <div class="mt-8 text-center">
                <p class="text-sm text-gray-600 mb-2">
                    Questions about your application?
                </p>
                <div class="flex justify-center space-x-4 text-sm">
                    <a href="mailto:artists@lineonemusic.com" class="text-purple-600 hover:underline">
                        📧 artists@lineonemusic.com
                    </a>
                    <span class="text-gray-400">|</span>
                    <a href="tel:+256700000000" class="text-purple-600 hover:underline">
                        📱 +256 700 000 000
                    </a>
                </div>
            </div>
        </div>

        <!-- Social Proof -->
        <div class="mt-8 text-center text-white">
            <p class="text-lg">🎉 Join 1,000+ verified artists earning from their music</p>
        </div>
    </div>
</div>

@push('scripts')
<script>
// Show confetti animation on load (optional - requires canvas-confetti library)
if (typeof confetti !== 'undefined') {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}
</script>
@endpush
@endsection
