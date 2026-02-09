@extends('layouts.auth')

@section('title', 'Become an Artist - Tesotunes')

@section('content')
<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
        
        <!-- Header -->
        <div class="text-center">
            <div class="flex justify-center mb-6">
                <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <span class="material-icons-round text-black text-2xl">music_note</span>
                </div>
            </div>
            <h2 class="text-3xl font-bold text-white mb-2">
                Join Tesotunes as an Artist
            </h2>
            <p class="text-gray-400">
                Share your music, build your fanbase, and earn from your craft
            </p>
        </div>

        <!-- Progress Indicator - Modern Design -->
        <div class="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 mb-8 border border-gray-800" x-data="registrationForm()">
            <!-- Modern Progress Bar -->
            <div class="mb-6">
                <div class="flex items-center justify-between mb-4">
                    <template x-for="(step, index) in steps" :key="index">
                        <div class="flex items-center flex-1">
                            <!-- Step Circle with Glow -->
                            <div class="relative">
                                <div
                                    :class="{
                                        'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/50': index <= currentStep,
                                        'bg-gray-800 border-2 border-gray-700': index > currentStep
                                    }"
                                    class="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 transform"
                                    :style="index === currentStep ? 'transform: scale(1.1);' : ''"
                                >
                                    <!-- Check Icon for Completed Steps -->
                                    <svg x-show="index < currentStep" class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                    <!-- Step Number -->
                                    <span x-show="index >= currentStep" class="text-white" x-text="index + 1"></span>
                                </div>
                                
                                <!-- Active Pulse Animation -->
                                <div x-show="index === currentStep" class="absolute inset-0 rounded-xl bg-green-500 animate-ping opacity-20"></div>
                            </div>

                            <!-- Progress Line -->
                            <div
                                x-show="index < steps.length - 1"
                                :class="{
                                    'bg-gradient-to-r from-green-500 to-blue-500': index < currentStep,
                                    'bg-gray-800': index >= currentStep
                                }"
                                class="hidden sm:block flex-1 h-1 mx-3 rounded-full transition-all duration-500"
                            ></div>
                        </div>
                    </template>
                </div>

                <!-- Step Labels with Icons -->
                <div class="grid grid-cols-5 gap-2 text-center">
                    <div :class="currentStep === 0 ? 'text-green-400' : currentStep > 0 ? 'text-gray-500' : 'text-gray-600'" class="transition-colors">
                        <div class="flex flex-col items-center gap-1">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                            </svg>
                            <span class="text-xs font-medium">Personal</span>
                        </div>
                    </div>
                    <div :class="currentStep === 1 ? 'text-green-400' : currentStep > 1 ? 'text-gray-500' : 'text-gray-600'" class="transition-colors">
                        <div class="flex flex-col items-center gap-1">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                            </svg>
                            <span class="text-xs font-medium">Contact</span>
                        </div>
                    </div>
                    <div :class="currentStep === 2 ? 'text-green-400' : currentStep > 2 ? 'text-gray-500' : 'text-gray-600'" class="transition-colors">
                        <div class="flex flex-col items-center gap-1">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                            </svg>
                            <span class="text-xs font-medium">Identity</span>
                        </div>
                    </div>
                    <div :class="currentStep === 3 ? 'text-green-400' : currentStep > 3 ? 'text-gray-500' : 'text-gray-600'" class="transition-colors">
                        <div class="flex flex-col items-center gap-1">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                            </svg>
                            <span class="text-xs font-medium">Security</span>
                        </div>
                    </div>
                    <div :class="currentStep === 4 ? 'text-green-400' : currentStep > 4 ? 'text-gray-500' : 'text-gray-600'" class="transition-colors">
                        <div class="flex flex-col items-center gap-1">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                            <span class="text-xs font-medium">Finish</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Registration Form - Modern Card Design -->
            <form method="POST" action="{{ route('frontend.artist.register.post') }}" @submit="submitForm" class="bg-gray-900/50 backdrop-blur-md rounded-2xl p-8 border border-gray-800 shadow-2xl">
                @csrf

                <!-- Step 1: Personal Information -->
                <div x-show="currentStep === 0" 
                     x-transition:enter="transition ease-out duration-300"
                     x-transition:enter-start="opacity-0 transform translate-x-4"
                     x-transition:enter-end="opacity-100 transform translate-x-0"
                     x-transition:leave="transition ease-in duration-200"
                     x-transition:leave-start="opacity-100"
                     x-transition:leave-end="opacity-0 transform -translate-x-4">
                    
                    <!-- Step Header -->
                    <div class="mb-8">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-2xl font-bold text-white">Personal Information</h3>
                                <p class="text-sm text-gray-400">Let's start with the basics</p>
                            </div>
                        </div>
                    </div>

                    <!-- Full Name Field - Enhanced -->
                    <div class="mb-6 group">
                        <label for="full_name" class="block text-sm font-semibold text-gray-300 mb-2">
                            Full Legal Name <span class="text-red-400">*</span>
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg class="w-5 h-5 text-gray-500 group-focus-within:text-green-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <input
                                id="full_name"
                                name="full_name"
                                type="text"
                                required
                                value="{{ old('full_name') }}"
                                x-model="formData.full_name"
                                class="w-full bg-gray-800/50 text-white rounded-xl pl-12 pr-4 py-3.5 border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all @error('full_name') border-red-500 @enderror"
                                placeholder="e.g., John Doe"
                            >
                        </div>
                        @error('full_name')
                            <p class="text-red-400 text-sm mt-2 flex items-center gap-1">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                                </svg>
                                {{ $message }}
                            </p>
                        @enderror
                        <p class="text-gray-500 text-xs mt-2">Your legal name as it appears on official documents</p>
                    </div>

                    <!-- Stage Name Field - Enhanced -->
                    <div class="mb-6 group">
                        <label for="stage_name" class="block text-sm font-semibold text-gray-300 mb-2">
                            Artist/Stage Name <span class="text-red-400">*</span>
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg class="w-5 h-5 text-gray-500 group-focus-within:text-green-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                                </svg>
                            </div>
                            <input
                                id="stage_name"
                                name="stage_name"
                                type="text"
                                required
                                value="{{ old('stage_name') }}"
                                x-model="formData.stage_name"
                                class="w-full bg-gray-800/50 text-white rounded-xl pl-12 pr-4 py-3.5 border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all @error('stage_name') border-red-500 @enderror"
                                placeholder="e.g., DJ Awesome"
                            >
                        </div>
                        @error('stage_name')
                            <p class="text-red-400 text-sm mt-2 flex items-center gap-1">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                                </svg>
                                {{ $message }}
                            </p>
                        @enderror
                        <p class="text-gray-500 text-xs mt-2">This is how fans will know you on Tesotunes</p>
                    </div>
                </div>

                <!-- Step 2: Contact Information -->
                <div x-show="currentStep === 1"
                     x-transition:enter="transition ease-out duration-300"
                     x-transition:enter-start="opacity-0 transform translate-x-4"
                     x-transition:enter-end="opacity-100 transform translate-x-0"
                     x-transition:leave="transition ease-in duration-200"
                     x-transition:leave-start="opacity-100"
                     x-transition:leave-end="opacity-0 transform -translate-x-4">
                    
                    <!-- Step Header -->
                    <div class="mb-8">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-2xl font-bold text-white">Contact Information</h3>
                                <p class="text-sm text-gray-400">How can we reach you?</p>
                            </div>
                        </div>
                    </div>

                    <!-- Email Field - Enhanced -->
                    <div class="mb-6 group">
                        <label for="email" class="block text-sm font-semibold text-gray-300 mb-2">
                            Email Address <span class="text-red-400">*</span>
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg class="w-5 h-5 text-gray-500 group-focus-within:text-green-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                </svg>
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value="{{ old('email') }}"
                                x-model="formData.email"
                                class="w-full bg-gray-800/50 text-white rounded-xl pl-12 pr-4 py-3.5 border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all @error('email') border-red-500 @enderror"
                                placeholder="your.email@example.com"
                            >
                            <!-- Email Validation Indicator -->
                            <div x-show="formData.email" class="absolute inset-y-0 right-0 pr-4 flex items-center">
                                <svg x-show="isValidEmail(formData.email)" class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                        </div>
                        @error('email')
                            <p class="text-red-400 text-sm mt-2 flex items-center gap-1">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                                </svg>
                                {{ $message }}
                            </p>
                        @enderror
                    </div>

                    <!-- Phone Number Field - Enhanced -->
                    <div class="mb-6 group">
                        <label for="phone_number" class="block text-sm font-semibold text-gray-300 mb-2">
                            Phone Number <span class="text-red-400">*</span>
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg class="w-5 h-5 text-gray-500 group-focus-within:text-green-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                                </svg>
                            </div>
                            <input
                                id="phone_number"
                                name="phone_number"
                                type="tel"
                                required
                                value="{{ old('phone_number') }}"
                                x-model="formData.phone_number"
                                class="w-full bg-gray-800/50 text-white rounded-xl pl-12 pr-4 py-3.5 border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all @error('phone_number') border-red-500 @enderror"
                                placeholder="256700000000"
                            >
                        </div>
                        @error('phone_number')
                            <p class="text-red-400 text-sm mt-2 flex items-center gap-1">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                                </svg>
                                {{ $message }}
                            </p>
                        @enderror
                        <p class="text-gray-500 text-xs mt-2">Format: Country code + number (e.g., 256700000000)</p>
                    </div>
                </div>

                <!-- Step 3: Identity Verification -->
                <div x-show="currentStep === 2"
                     x-transition:enter="transition ease-out duration-300"
                     x-transition:enter-start="opacity-0 transform translate-x-4"
                     x-transition:enter-end="opacity-100 transform translate-x-0"
                     x-transition:leave="transition ease-in duration-200"
                     x-transition:leave-start="opacity-100"
                     x-transition:leave-end="opacity-0 transform -translate-x-4">
                    
                    <!-- Step Header -->
                    <div class="mb-8">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-2xl font-bold text-white">Identity Verification</h3>
                                <p class="text-sm text-gray-400">Required for artist verification</p>
                            </div>
                        </div>
                    </div>

                    <!-- NIN Number Field - Enhanced -->
                    <div class="mb-6 group">
                        <label for="nin_number" class="block text-sm font-semibold text-gray-300 mb-2">
                            National ID Number (NIN) <span class="text-red-400">*</span>
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg class="w-5 h-5 text-gray-500 group-focus-within:text-green-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <input
                                id="nin_number"
                                name="nin_number"
                                type="text"
                                required
                                value="{{ old('nin_number') }}"
                                maxlength="14"
                                x-model="formData.nin_number"
                                @input="formData.nin_number = formData.nin_number.replace(/[^0-9A-Z]/gi, '').toUpperCase()"
                                class="w-full bg-gray-800/50 text-white rounded-xl pl-12 pr-4 py-3.5 border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all font-mono @error('nin_number') border-red-500 @enderror"
                                placeholder="CM00000000000A"
                            >
                            <!-- NIN Length Indicator -->
                            <div x-show="formData.nin_number" class="absolute inset-y-0 right-0 pr-4 flex items-center">
                                <span class="text-xs font-mono" :class="formData.nin_number.length === 14 ? 'text-green-500' : 'text-gray-500'" x-text="formData.nin_number.length + '/14'"></span>
                            </div>
                        </div>
                        @error('nin_number')
                            <p class="text-red-400 text-sm mt-2 flex items-center gap-1">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                                </svg>
                                {{ $message }}
                            </p>
                        @enderror
                        
                        <!-- Info Box -->
                        <div class="mt-4 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                            <div class="flex gap-3">
                                <svg class="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                                </svg>
                                <div class="text-sm">
                                    <p class="text-blue-300 font-medium mb-1">Why we need this</p>
                                    <p class="text-blue-200/80">Your NIN is required for artist verification and compliance with Uganda's regulations. Your data is encrypted and secure.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Step 4: Account Security -->
                <div x-show="currentStep === 3"
                     x-transition:enter="transition ease-out duration-300"
                     x-transition:enter-start="opacity-0 transform translate-x-4"
                     x-transition:enter-end="opacity-100 transform translate-x-0"
                     x-transition:leave="transition ease-in duration-200"
                     x-transition:leave-start="opacity-100"
                     x-transition:leave-end="opacity-0 transform -translate-x-4">
                    
                    <!-- Step Header -->
                    <div class="mb-8">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-2xl font-bold text-white">Account Security</h3>
                                <p class="text-sm text-gray-400">Choose a strong password</p>
                            </div>
                        </div>
                    </div>

                    <!-- Password Field - Enhanced with Strength Indicator -->
                    <div class="mb-6 group">
                        <label for="password" class="block text-sm font-semibold text-gray-300 mb-2">
                            Password <span class="text-red-400">*</span>
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg class="w-5 h-5 text-gray-500 group-focus-within:text-green-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <input
                                id="password"
                                name="password"
                                :type="showPassword ? 'text' : 'password'"
                                required
                                x-model="formData.password"
                                class="w-full bg-gray-800/50 text-white rounded-xl pl-12 pr-12 py-3.5 border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all @error('password') border-red-500 @enderror"
                                placeholder="Enter a strong password"
                            >
                            <button
                                type="button"
                                @click="showPassword = !showPassword"
                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                <svg x-show="!showPassword" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                                </svg>
                                <svg x-show="showPassword" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/>
                                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                                </svg>
                            </button>
                        </div>
                        
                        <!-- Password Strength Indicator -->
                        <div x-show="formData.password" class="mt-3">
                            <div class="flex gap-1 mb-2">
                                <div class="h-1 flex-1 rounded-full" :class="formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-700'"></div>
                                <div class="h-1 flex-1 rounded-full" :class="formData.password.length >= 10 && /[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-700'"></div>
                                <div class="h-1 flex-1 rounded-full" :class="formData.password.length >= 12 && /[A-Z]/.test(formData.password) && /[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-700'"></div>
                                <div class="h-1 flex-1 rounded-full" :class="formData.password.length >= 14 && /[A-Z]/.test(formData.password) && /[0-9]/.test(formData.password) && /[^A-Za-z0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-700'"></div>
                            </div>
                            <div class="grid grid-cols-2 gap-2 text-xs">
                                <div :class="formData.password.length >= 8 ? 'text-green-400' : 'text-gray-500'" class="flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                    </svg>
                                    At least 8 characters
                                </div>
                                <div :class="/[A-Z]/.test(formData.password) ? 'text-green-400' : 'text-gray-500'" class="flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                    </svg>
                                    Uppercase letter
                                </div>
                                <div :class="/[0-9]/.test(formData.password) ? 'text-green-400' : 'text-gray-500'" class="flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                    </svg>
                                    Number
                                </div>
                                <div :class="/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-400' : 'text-gray-500'" class="flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                    </svg>
                                    Special character
                                </div>
                            </div>
                        </div>

                        @error('password')
                            <p class="text-red-400 text-sm mt-2 flex items-center gap-1">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                                </svg>
                                {{ $message }}
                            </p>
                        @enderror
                    </div>

                    <!-- Confirm Password Field - Enhanced -->
                    <div class="mb-6 group">
                        <label for="password_confirmation" class="block text-sm font-semibold text-gray-300 mb-2">
                            Confirm Password <span class="text-red-400">*</span>
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg class="w-5 h-5 text-gray-500 group-focus-within:text-green-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <input
                                id="password_confirmation"
                                name="password_confirmation"
                                :type="showConfirmPassword ? 'text' : 'password'"
                                required
                                x-model="formData.password_confirmation"
                                class="w-full bg-gray-800/50 text-white rounded-xl pl-12 pr-12 py-3.5 border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                                placeholder="Confirm your password"
                            >
                            <button
                                type="button"
                                @click="showConfirmPassword = !showConfirmPassword"
                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                <svg x-show="!showConfirmPassword" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                                </svg>
                                <svg x-show="showConfirmPassword" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/>
                                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                                </svg>
                            </button>
                        </div>
                        
                        <!-- Password Match Indicator -->
                        <div x-show="formData.password && formData.password_confirmation" class="mt-3">
                            <div x-show="formData.password === formData.password_confirmation" class="flex items-center gap-2 text-green-400 text-sm">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                </svg>
                                Passwords match perfectly!
                            </div>
                            <div x-show="formData.password !== formData.password_confirmation" class="flex items-center gap-2 text-red-400 text-sm">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                                </svg>
                                Passwords do not match
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Step 5: Terms & Conditions -->
                <div x-show="currentStep === 4"
                     x-transition:enter="transition ease-out duration-300"
                     x-transition:enter-start="opacity-0 transform translate-x-4"
                     x-transition:enter-end="opacity-100 transform translate-x-0"
                     x-transition:leave="transition ease-in duration-200"
                     x-transition:leave-start="opacity-100"
                     x-transition:leave-end="opacity-0 transform -translate-x-4">
                    
                    <!-- Step Header -->
                    <div class="mb-8">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-2xl font-bold text-white">Review & Confirm</h3>
                                <p class="text-sm text-gray-400">Almost there! Review your information</p>
                            </div>
                        </div>
                    </div>

                    <!-- Summary Card with Animation -->
                    <div class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-2xl p-6 mb-6 border border-gray-700/50 shadow-xl">
                        <h4 class="text-white font-semibold mb-4 flex items-center gap-2">
                            <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                            </svg>
                            Registration Summary
                        </h4>
                        <div class="space-y-3">
                            <div class="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                                <svg class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                                </svg>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-gray-500 mb-0.5">Full Name</p>
                                    <p class="text-white font-medium truncate" x-text="formData.full_name || 'Not provided'"></p>
                                </div>
                            </div>
                            
                            <div class="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                                <svg class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                                </svg>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-gray-500 mb-0.5">Stage Name</p>
                                    <p class="text-white font-medium truncate" x-text="formData.stage_name || 'Not provided'"></p>
                                </div>
                            </div>
                            
                            <div class="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                                <svg class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                </svg>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-gray-500 mb-0.5">Email</p>
                                    <p class="text-white font-medium truncate" x-text="formData.email || 'Not provided'"></p>
                                </div>
                            </div>
                            
                            <div class="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                                <svg class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                                </svg>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-gray-500 mb-0.5">Phone</p>
                                    <p class="text-white font-medium truncate" x-text="formData.phone_number || 'Not provided'"></p>
                                </div>
                            </div>
                            
                            <div class="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                                <svg class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                                </svg>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-gray-500 mb-0.5">NIN</p>
                                    <p class="text-white font-medium font-mono truncate" x-text="formData.nin_number ? '***********' + formData.nin_number.slice(-3) : 'Not provided'"></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Terms & Conditions - Enhanced -->
                    <div class="mb-6">
                        <label class="flex items-start gap-4 p-4 rounded-xl bg-gray-800/30 border-2 border-gray-700 hover:border-green-500/50 cursor-pointer transition-all group">
                            <input
                                type="checkbox"
                                name="terms"
                                required
                                x-model="formData.terms"
                                class="w-5 h-5 mt-0.5 rounded border-gray-600 bg-gray-700 text-green-600 focus:ring-green-500 focus:ring-offset-0 focus:ring-2 transition-all @error('terms') border-red-500 @enderror"
                            >
                            <span class="text-gray-300 text-sm flex-1">
                                I agree to Tesotunes
                                <a href="#" class="text-green-500 hover:text-green-400 font-medium underline">Terms of Service</a>
                                and
                                <a href="#" class="text-green-500 hover:text-green-400 font-medium underline">Privacy Policy</a>.
                                I understand that my information will be used for artist verification and platform services.
                            </span>
                        </label>
                        @error('terms')
                            <p class="text-red-400 text-sm mt-2 flex items-center gap-1">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                                </svg>
                                {{ $message }}
                            </p>
                        @enderror
                    </div>
                </div>

                <!-- Navigation Buttons - Modern Design -->
                <div class="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-800">
                    <!-- Previous Button -->
                    <button
                        type="button"
                        @click="previousStep"
                        x-show="currentStep > 0"
                        class="group flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-all transform hover:scale-105 active:scale-95"
                    >
                        <svg class="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
                        </svg>
                        Previous
                    </button>

                    <!-- Spacer for first step -->
                    <div x-show="currentStep === 0"></div>

                    <!-- Next Button -->
                    <button
                        type="button"
                        @click="nextStep"
                        x-show="currentStep < steps.length - 1"
                        :disabled="!canProceed"
                        class="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform hover:scale-105 active:scale-95 disabled:scale-100 shadow-lg disabled:shadow-none ml-auto"
                    >
                        Continue
                        <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                    </button>

                    <!-- Submit Button -->
                    <button
                        type="submit"
                        x-show="currentStep === steps.length - 1"
                        :disabled="loading || !canProceed"
                        class="group flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 disabled:scale-100 shadow-lg shadow-green-500/50 disabled:shadow-none ml-auto"
                    >
                        <span x-show="!loading" class="flex items-center gap-2">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                            Create Artist Account
                        </span>
                        <span x-show="loading" class="flex items-center gap-2">
                            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating Your Account...
                        </span>
                    </button>
                </div>
            </form>
        </div>

        <!-- Sign In Link - Enhanced -->
        <div class="text-center mt-8">
            <p class="text-gray-400">
                Already have an artist account?
                <a
                    href="{{ route('login') }}"
                    class="text-green-500 hover:text-green-400 font-semibold transition-colors"
                >
                    Sign in here →
                </a>
            </p>
        </div>

        <!-- Help Section - Enhanced -->
        <div class="text-center mt-4">
            <div class="inline-flex items-center gap-2 text-gray-500 text-sm">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
                </svg>
                Need help?
                <a href="#" class="text-green-500 hover:text-green-400 font-medium">Contact Support</a>
            </div>
        </div>
    </div>
</div>


@push('styles')
<style>
    /* Custom animations for artist registration */
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes pulse-slow {
        0%, 100% {
            opacity: 0.3;
        }
        50% {
            opacity: 0.6;
        }
    }

    @keyframes gradient-shift {
        0%, 100% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
    }

    /* Smooth scroll behavior */
    html {
        scroll-behavior: smooth;
    }

    /* Custom focus styles */
    input:focus, textarea:focus, select:focus {
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    /* Animated gradient background */
    .animate-gradient {
        background-size: 200% 200%;
        animation: gradient-shift 10s ease infinite;
    }

    /* Glassmorphism effect */
    .glass-effect {
        background: rgba(31, 41, 55, 0.7);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    }

    /* Progress line animation */
    .progress-line {
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Step circle hover effect */
    .step-circle:hover {
        transform: scale(1.1);
        transition: transform 0.2s ease;
    }

    /* Custom scrollbar for dark theme */
    ::-webkit-scrollbar {
        width: 10px;
        height: 10px;
    }

    ::-webkit-scrollbar-track {
        background: #1f2937;
    }

    ::-webkit-scrollbar-thumb {
        background: #374151;
        border-radius: 5px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #4b5563;
    }
</style>
@endpush

@push('scripts')
<script>
function registrationForm() {
    return {
        currentStep: 0,
        steps: ['Personal', 'Contact', 'Identity', 'Security', 'Terms'],
        showPassword: false,
        showConfirmPassword: false,
        loading: false,
        formData: {
            full_name: '{{ old('full_name') }}',
            stage_name: '{{ old('stage_name') }}',
            email: '{{ old('email') }}',
            phone_number: '{{ old('phone_number') }}',
            nin_number: '{{ old('nin_number') }}',
            password: '',
            password_confirmation: '',
            terms: false
        },

        init() {
            // Auto-focus first field when component loads
            this.$nextTick(() => {
                const firstInput = this.$el.querySelector('input[type="text"]');
                if (firstInput) {
                    firstInput.focus();
                }
            });
        },

        get canProceed() {
            switch (this.currentStep) {
                case 0: // Personal Information
                    return this.formData.full_name.trim() && this.formData.stage_name.trim();

                case 1: // Contact Information
                    return this.formData.email.trim() && this.formData.phone_number.trim() &&
                           this.isValidEmail(this.formData.email);

                case 2: // Identity Verification
                    return this.formData.nin_number.trim() && this.formData.nin_number.length === 14;

                case 3: // Account Security
                    return this.formData.password && this.formData.password_confirmation &&
                           this.formData.password === this.formData.password_confirmation &&
                           this.formData.password.length >= 8;

                case 4: // Terms & Conditions
                    return this.formData.terms;

                default:
                    return false;
            }
        },

        nextStep() {
            if (this.currentStep < this.steps.length - 1 && this.canProceed) {
                this.currentStep++;
                this.focusFirstInput();
            }
        },

        previousStep() {
            if (this.currentStep > 0) {
                this.currentStep--;
                this.focusFirstInput();
            }
        },

        focusFirstInput() {
            this.$nextTick(() => {
                const visibleInputs = this.$el.querySelectorAll('input:not([type="checkbox"]):not([type="hidden"])');
                const currentStepInputs = Array.from(visibleInputs).filter(input => {
                    return input.closest('[x-show]') && !input.closest('[x-show]').style.display === 'none';
                });

                if (currentStepInputs.length > 0) {
                    currentStepInputs[0].focus();
                }
            });
        },

        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        async submitForm(e) {
            e.preventDefault();

            if (!this.canProceed) {
                return;
            }

            this.loading = true;

            const formData = new FormData(e.target);

            try {
                const response = await fetch(e.target.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    }
                });

                const data = await response.json();

                if (data.success) {
                    // Show success message and redirect
                    if (data.redirect) {
                        window.location.href = data.redirect;
                    }
                } else {
                    // Handle validation errors
                    this.handleErrors(data.errors || {});

                    // Go back to the step with errors
                    this.goToStepWithError(data.errors || {});
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('Registration failed. Please try again.');
            } finally {
                this.loading = false;
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
                const input = document.querySelector(`[name="${field}"]`);
                if (input) {
                    input.classList.add('border-red-500');
                    const error = document.createElement('p');
                    error.className = 'text-red-400 text-sm mt-1';
                    error.textContent = errors[field][0];
                    input.parentNode.appendChild(error);
                }
            });
        },

        goToStepWithError(errors) {
            const stepMapping = {
                'full_name': 0,
                'stage_name': 0,
                'email': 1,
                'phone_number': 1,
                'nin_number': 2,
                'password': 3,
                'password_confirmation': 3,
                'terms': 4
            };

            // Find the first step with an error
            for (const field in errors) {
                if (stepMapping.hasOwnProperty(field)) {
                    this.currentStep = stepMapping[field];
                    this.focusFirstInput();
                    break;
                }
            }
        }
    }
}
</script>
@endpush
@endsection