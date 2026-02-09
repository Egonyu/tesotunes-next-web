@extends('layouts.auth')

@section('title', 'Become an Artist - Join Tesotunes')

@section('content')
<script>
    // Redirect to step 1 immediately for minimal UX
    window.location.href = "{{ route('artist.register.step1') }}";
</script>

<!-- Show loading while redirecting -->
<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
    <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4 animate-pulse">
            <span class="material-icons-round text-black text-2xl">music_note</span>
        </div>
        <p class="text-gray-400">Redirecting...</p>
    </div>
</div>
<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
    <div class="container mx-auto px-4 py-12 relative z-10 max-w-6xl">
        <!-- Hero Section with Enhanced Animation -->
        <div class="text-center mb-16 animate-fade-in">
            <!-- Floating Icon with Glow -->
            <div class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-3xl mb-8 shadow-2xl shadow-green-500/50 transform hover:scale-110 transition-all duration-300 hover:rotate-3">
                <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                </svg>
            </div>
            
            <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                <span class="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Become a Verified Artist
                </span>
            </h1>
            <p class="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Join Uganda's leading music platform. Distribute your music to 
                <span class="text-green-400 font-semibold">Spotify</span>, 
                <span class="text-green-400 font-semibold">Apple Music</span>, and more.
                Get paid for your streams. Build your fanbase.
            </p>
            
            <!-- Quick Stats -->
            <div class="flex flex-wrap justify-center gap-8 mt-8 text-sm">
                <div class="flex items-center gap-2 text-gray-300">
                    <div class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                    </div>
                    <span><strong class="text-white">1,000+</strong> Verified Artists</span>
                </div>
                <div class="flex items-center gap-2 text-gray-300">
                    <div class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                        </svg>
                    </div>
                    <span><strong class="text-white">70%</strong> Artist Share</span>
                </div>
                <div class="flex items-center gap-2 text-gray-300">
                    <div class="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <svg class="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                        </svg>
                    </div>
                    <span><strong class="text-white">24-48h</strong> Fast Approval</span>
                </div>
            </div>
        </div>

        <!-- Benefits Grid - Modern Cards -->
        <div class="grid md:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto">
            <div class="group bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 hover:border-green-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20">
                <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 transform group-hover:rotate-6 transition-transform">
                    <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clip-rule="evenodd"/>
                    </svg>
                </div>
                <h3 class="text-2xl font-bold text-white mb-3">Global Distribution</h3>
                <p class="text-gray-400 leading-relaxed">
                    Your music on <span class="text-green-400">Spotify</span>, <span class="text-green-400">Apple Music</span>, YouTube Music, Boomplay, Audiomack, and more platforms worldwide
                </p>
            </div>

            <div class="group bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 transform group-hover:rotate-6 transition-transform">
                    <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
                    </svg>
                </div>
                <h3 class="text-2xl font-bold text-white mb-3">Fair Royalties</h3>
                <p class="text-gray-400 leading-relaxed">
                    <span class="text-blue-400 font-semibold">70% artist share</span>. Track your earnings in real-time. Monthly payouts via mobile money directly to your account
                </p>
            </div>

            <div class="group bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 transform group-hover:rotate-6 transition-transform">
                    <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                    </svg>
                </div>
                <h3 class="text-2xl font-bold text-white mb-3">Advanced Analytics</h3>
                <p class="text-gray-400 leading-relaxed">
                    Detailed insights on plays, downloads, demographics, and revenue. Make data-driven decisions for your music career
                </p>
            </div>
        </div>

        <!-- Process Overview - Modern Dark Card -->
        <div class="max-w-5xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl p-10 mb-12 border border-gray-800">
            <h2 class="text-4xl font-bold text-white mb-10 text-center bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                3 Simple Steps to Get Started
            </h2>

            <div class="space-y-8">
                <!-- Step 1 -->
                <div class="group flex items-start gap-6 p-6 rounded-2xl bg-gray-800/50 border border-gray-700 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
                    <div class="flex-shrink-0">
                        <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-green-500/50 transform group-hover:scale-110 transition-transform">
                            1
                        </div>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                            Basic Information
                            <span class="text-sm font-normal px-3 py-1 bg-green-500/20 text-green-400 rounded-full">⏱️ 2 min</span>
                        </h3>
                        <p class="text-gray-400 text-lg leading-relaxed">
                            Stage name, music genre, and bio. Upload your profile photo to showcase your artis brand.
                        </p>
                    </div>
                </div>

                <!-- Step 2 -->
                <div class="group flex items-start gap-6 p-6 rounded-2xl bg-gray-800/50 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                    <div class="flex-shrink-0">
                        <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/50 transform group-hover:scale-110 transition-transform">
                            2
                        </div>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                            Identity Verification
                            <span class="text-sm font-normal px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">⏱️ 3 min</span>
                        </h3>
                        <p class="text-gray-400 text-lg leading-relaxed">
                            Verify your identity with National ID (NIN). Upload ID photos and selfie for security and compliance.
                        </p>
                    </div>
                </div>

                <!-- Step 3 -->
                <div class="group flex items-start gap-6 p-6 rounded-2xl bg-gray-800/50 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                    <div class="flex-shrink-0">
                        <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-purple-500/50 transform group-hover:scale-110 transition-transform">
                            3
                        </div>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                            Payment Setup
                            <span class="text-sm font-normal px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">⏱️ 1 min</span>
                        </h3>
                        <p class="text-gray-400 text-lg leading-relaxed">
                            Set up mobile money for payments. Create your account password and you're ready to upload!
                        </p>
                    </div>
                </div>
            </div>

            <!-- Total Time Badge -->
            <div class="mt-10 p-6 bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-2xl border-2 border-green-500/30">
                <p class="text-center">
                    <span class="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent block mb-2">
                        Total Time: ~6 minutes
                    </span>
                    <span class="text-gray-300 text-lg">
                        Get approved within <span class="text-green-400 font-semibold">24-48 hours</span> and start uploading your music!
                    </span>
                </p>
            </div>

            <!-- Requirements Box -->
            <div class="mt-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-l-4 border-blue-500 rounded-r-2xl p-6">
                <h4 class="font-bold text-blue-300 mb-4 text-xl flex items-center gap-2">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                        <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
                    </svg>
                    What You'll Need:
                </h4>
                <ul class="space-y-3 text-gray-300">
                    <li class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        <span>Uganda National ID (NIN) - 14 characters</span>
                    </li>
                    <li class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        <span>Valid phone number (MTN or Airtel Mobile Money)</span>
                    </li>
                    <li class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        <span>Mobile money account for receiving payments</span>
                    </li>
                    <li class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        <span>Photos: ID front, ID back, selfie with ID</span>
                    </li>
                    <li class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        <span>Valid email address</span>
                    </li>
                </ul>
            </div>

            <!-- CTA Button - Large and Prominent -->
            <div class="mt-10 text-center">
                <a href="{{ route('artist.register.start') }}" 
                   class="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold text-xl px-12 py-5 rounded-2xl shadow-2xl shadow-green-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                    </svg>
                    Start Registration Now
                </a>
                <p class="text-gray-400 text-sm mt-4">
                    Already have an account? 
                    <a href="{{ route('artist.login') }}" class="text-green-400 hover:text-green-300 font-medium underline">
                        Login here
                    </a>
                </p>
            </div>
        </div>

        <!-- Social Proof - Enhanced -->
        <div class="text-center">
            <p class="text-2xl text-white mb-6 font-semibold">Join 1,000+ verified artists on Tesotunes</p>
            <div class="flex flex-wrap justify-center items-center gap-8">
                <div class="flex items-center gap-3 text-gray-300 bg-gray-900/50 px-6 py-3 rounded-full border border-gray-800">
                    <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    Fast approval
                </div>
                <div class="flex items-center gap-3 text-gray-300 bg-gray-900/50 px-6 py-3 rounded-full border border-gray-800">
                    <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    Fair payments
                </div>
                <div class="flex items-center gap-3 text-gray-300 bg-gray-900/50 px-6 py-3 rounded-full border border-gray-800">
                    <svg class="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    24/7 support
                </div>
            </div>
        </div>
        <!-- Back to Login -->
        <div class="text-center mt-8">
            <p class="text-gray-400">
                Not an artist? 
                <a href="{{ route('login') }}" class="text-green-500 hover:text-green-400 font-medium">
                    Go back to login selection
                </a>
            </p>
        </div>
    </div>
</div>

<style>
    @keyframes fade-in {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .animate-fade-in {
        animation: fade-in 0.8s ease-out;
    }
</style>
@endsection
