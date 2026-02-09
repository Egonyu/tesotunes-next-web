@extends('layouts.app')

@section('title', 'Edit Profile')

@section('left-sidebar')
    @include('frontend.partials.user-left-sidebar')
@endsection

@push('styles')
<style>
    /* Light mode glass styles */
    .glass-panel {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .glass-card {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 0, 0, 0.06);
    }
    /* Dark mode glass styles */
    .dark .glass-panel {
        background: rgba(22, 27, 34, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .dark .glass-card {
        background: rgba(30, 35, 45, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
    /* Form input styles */
    .form-input {
        @apply w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all;
    }
    .form-label {
        @apply block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2;
    }
</style>
@endpush

@section('content')
<!-- Main Edit Profile Content -->
<div class="max-w-[1200px] mx-auto space-y-8">
    <!-- Header Section -->
    <div class="glass-panel rounded-2xl p-8 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl"></div>
        <div class="relative z-10">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">Edit Profile</h1>
                    <p class="text-gray-500 dark:text-text-secondary">Update your personal information and preferences</p>
                </div>
                <a href="{{ route('frontend.profile.show') }}" class="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition-all border border-gray-200 dark:border-gray-600">
                    <span class="material-symbols-outlined text-lg">arrow_back</span>
                    Back to Profile
                </a>
            </div>
        </div>
    </div>

    <!-- Success Message -->
    @if(session('success'))
    <div class="glass-card rounded-xl p-4 border-l-4 border-green-500">
        <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-green-500">check_circle</span>
            <p class="text-green-700 dark:text-green-400 font-medium">{{ session('success') }}</p>
        </div>
    </div>
    @endif

    <!-- Error Messages -->
    @if($errors->any())
    <div class="glass-card rounded-xl p-4 border-l-4 border-red-500">
        <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-red-500">error</span>
            <div>
                <p class="text-red-700 dark:text-red-400 font-medium mb-2">Please fix the following errors:</p>
                <ul class="text-red-600 dark:text-red-400 text-sm space-y-1">
                    @foreach($errors->all() as $error)
                    <li class="flex items-center gap-2">
                        <span class="w-1 h-1 bg-red-500 rounded-full"></span>
                        {{ $error }}
                    </li>
                    @endforeach
                </ul>
            </div>
        </div>
    </div>
    @endif

    <!-- Edit Form -->
    <form action="{{ route('frontend.profile.update') }}" method="POST" enctype="multipart/form-data">
        @csrf
        @method('PUT')

        <div class="grid lg:grid-cols-3 gap-8">
            <!-- Left Column - Avatar & Preview -->
            <div class="lg:col-span-1 space-y-6">
                <!-- Avatar Upload Card -->
                <div class="glass-panel rounded-2xl p-6">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-green">photo_camera</span>
                        Profile Picture
                    </h3>

                    <div class="text-center">
                        <div class="relative inline-block mb-4">
                            <div id="avatar-preview" class="w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 ring-4 ring-white dark:ring-gray-700 shadow-xl mx-auto">
                                @if(auth()->user()->avatar)
                                    <img src="{{ Storage::url(auth()->user()->avatar) }}" alt="Profile" class="w-full h-full object-cover">
                                @else
                                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-green/20 to-brand-purple/20">
                                        <span class="material-symbols-outlined text-gray-400 dark:text-gray-500 text-5xl">person</span>
                                    </div>
                                @endif
                            </div>
                            <label for="avatar" class="absolute -bottom-2 -right-2 p-2 bg-brand-green rounded-lg shadow-lg cursor-pointer hover:bg-green-600 transition-colors">
                                <span class="material-symbols-outlined text-white text-sm">edit</span>
                            </label>
                        </div>

                        <input type="file" id="avatar" name="avatar" accept="image/*" class="hidden" onchange="previewImage(this)">
                        
                        <label for="avatar" class="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg cursor-pointer transition-colors">
                            <span class="material-symbols-outlined text-lg">upload</span>
                            Choose Photo
                        </label>
                        <p class="text-gray-400 dark:text-gray-500 text-xs mt-3">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                </div>

                <!-- Quick Tips Card -->
                <div class="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-brand-blue/20 via-brand-purple/20 to-brand-green/20 dark:from-brand-blue/30 dark:via-brand-purple/30 dark:to-brand-green/30 border border-brand-blue/20">
                    <div class="absolute -right-8 -bottom-8 opacity-10">
                        <span class="material-symbols-outlined text-[100px] text-brand-blue">tips_and_updates</span>
                    </div>
                    <div class="relative z-10">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span class="material-symbols-outlined text-brand-blue">lightbulb</span>
                            Profile Tips
                        </h3>
                        <ul class="space-y-3 text-sm">
                            <li class="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                                <span class="material-symbols-outlined text-brand-green text-sm mt-0.5">check_circle</span>
                                Add a profile photo to help friends recognize you
                            </li>
                            <li class="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                                <span class="material-symbols-outlined text-brand-green text-sm mt-0.5">check_circle</span>
                                Write a bio to share your music taste
                            </li>
                            <li class="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                                <span class="material-symbols-outlined text-brand-green text-sm mt-0.5">check_circle</span>
                                Keep your contact info up to date
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Right Column - Form Fields -->
            <div class="lg:col-span-2">
                <div class="glass-panel rounded-2xl p-6 space-y-6">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-purple">person</span>
                        Personal Information
                    </h3>

                    <!-- Full Name -->
                    <div>
                        <label for="name" class="form-label">Full Name</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <span class="material-symbols-outlined text-lg">badge</span>
                            </span>
                            <input type="text" id="name" name="name" value="{{ old('name', $user->name) }}" required
                                   class="form-input pl-12">
                        </div>
                    </div>

                    <!-- Email -->
                    <div>
                        <label for="email" class="form-label">Email Address</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <span class="material-symbols-outlined text-lg">mail</span>
                            </span>
                            <input type="email" id="email" name="email" value="{{ old('email', $user->email) }}" required
                                   class="form-input pl-12">
                        </div>
                    </div>

                    <!-- Bio -->
                    <div>
                        <label for="bio" class="form-label">Bio</label>
                        <textarea id="bio" name="bio" rows="4"
                                  class="form-input resize-none"
                                  placeholder="Tell us about yourself and your music taste...">{{ old('bio', $user->bio) }}</textarea>
                        <p class="text-gray-400 dark:text-gray-500 text-xs mt-2">Brief description for your profile. Max 500 characters.</p>
                    </div>

                    <!-- Divider -->
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span class="material-symbols-outlined text-brand-blue">contact_phone</span>
                            Contact Details
                        </h3>
                    </div>

                    <!-- Phone Number -->
                    <div>
                        <label for="phone" class="form-label">Phone Number</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <span class="material-symbols-outlined text-lg">phone</span>
                            </span>
                            <input type="tel" id="phone" name="phone" value="{{ old('phone', $user->phone) }}"
                                   class="form-input pl-12"
                                   placeholder="+256 7XX XXX XXX">
                        </div>
                    </div>

                    <!-- Country -->
                    <div>
                        <label for="country" class="form-label">Country</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <span class="material-symbols-outlined text-lg">location_on</span>
                            </span>
                            <select id="country" name="country" class="form-input pl-12 appearance-none">
                                <option value="">Select Country</option>
                                <option value="UG" {{ old('country', $user->country) == 'UG' ? 'selected' : '' }}>🇺🇬 Uganda</option>
                                <option value="KE" {{ old('country', $user->country) == 'KE' ? 'selected' : '' }}>🇰🇪 Kenya</option>
                                <option value="TZ" {{ old('country', $user->country) == 'TZ' ? 'selected' : '' }}>🇹🇿 Tanzania</option>
                                <option value="RW" {{ old('country', $user->country) == 'RW' ? 'selected' : '' }}>🇷🇼 Rwanda</option>
                                <option value="BI" {{ old('country', $user->country) == 'BI' ? 'selected' : '' }}>🇧🇮 Burundi</option>
                                <option value="SS" {{ old('country', $user->country) == 'SS' ? 'selected' : '' }}>🇸🇸 South Sudan</option>
                                <option value="US" {{ old('country', $user->country) == 'US' ? 'selected' : '' }}>🇺🇸 United States</option>
                                <option value="GB" {{ old('country', $user->country) == 'GB' ? 'selected' : '' }}>🇬🇧 United Kingdom</option>
                                <option value="CA" {{ old('country', $user->country) == 'CA' ? 'selected' : '' }}>🇨🇦 Canada</option>
                            </select>
                            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <span class="material-symbols-outlined text-lg">expand_more</span>
                            </span>
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <a href="{{ route('frontend.profile.show') }}"
                           class="w-full sm:w-auto px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 transition-colors text-center">
                            Cancel
                        </a>
                        
                        <button type="submit"
                                class="w-full sm:w-auto px-8 py-3 bg-brand-green hover:bg-green-600 rounded-xl font-semibold text-white transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/30 flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined text-lg">save</span>
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </form>
</div>

@push('scripts')
<script>
function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function(e) {
            const avatarPreview = document.getElementById('avatar-preview');
            avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Profile" class="w-full h-full object-cover">`;
        }

        reader.readAsDataURL(input.files[0]);
    }
}
</script>
@endpush
@endsection

@php
use Illuminate\Support\Facades\Storage;
@endphp
