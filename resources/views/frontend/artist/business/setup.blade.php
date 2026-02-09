@extends('frontend.layouts.artist')

@section('title', 'Artist Profile Setup')

@section('artist-content')
<div class="max-w-2xl mx-auto">
    <!-- Page Header -->
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Complete Your Artist Profile</h1>
        <p class="text-gray-400">Let's set up your profile so you can start uploading and managing your music</p>
    </div>

    @if(session('success'))
        <div class="bg-green-900/50 border border-green-500 text-green-200 p-4 rounded-lg mb-6">
            {{ session('success') }}
        </div>
    @endif

    @if(session('error'))
        <div class="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            {{ session('error') }}
        </div>
    @endif

    @if($errors->any())
        <div class="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            <ul class="list-disc list-inside">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <!-- Setup Form -->
    <div class="bg-gray-800 rounded-lg shadow-xl p-8">
        <form action="{{ route('frontend.artist.business.setup.save') }}" method="POST">
            @csrf

            <!-- Stage Name -->
            <div class="mb-6">
                <label for="stage_name" class="block text-sm font-medium text-gray-300 mb-2">
                    Stage Name <span class="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    id="stage_name"
                    name="stage_name"
                    value="{{ old('stage_name', $profile->stage_name ?? '') }}"
                    required
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Your artist name"
                >
            </div>

            <!-- Real Name -->
            <div class="mb-6">
                <label for="real_name" class="block text-sm font-medium text-gray-300 mb-2">
                    Real Name <span class="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    id="real_name"
                    name="real_name"
                    value="{{ old('real_name', $profile->real_name ?? '') }}"
                    required
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Your legal name"
                >
            </div>

            <!-- Bio -->
            <div class="mb-6">
                <label for="bio" class="block text-sm font-medium text-gray-300 mb-2">
                    Artist Bio
                </label>
                <textarea
                    id="bio"
                    name="bio"
                    rows="4"
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Tell your fans about yourself and your music..."
                >{{ old('bio', $profile->bio ?? '') }}</textarea>
            </div>

            <!-- Mobile Money Details -->
            <div class="mb-6">
                <h3 class="text-lg font-semibold text-white mb-4">Payment Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Mobile Money Provider -->
                    <div>
                        <label for="mobile_money_provider" class="block text-sm font-medium text-gray-300 mb-2">
                            Mobile Money Provider <span class="text-red-400">*</span>
                        </label>
                        <select
                            id="mobile_money_provider"
                            name="mobile_money_provider"
                            required
                            class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="">Select Provider</option>
                            <option value="MTN" {{ old('mobile_money_provider', $profile->mobile_money_provider ?? '') == 'MTN' ? 'selected' : '' }}>MTN Mobile Money</option>
                            <option value="Airtel" {{ old('mobile_money_provider', $profile->mobile_money_provider ?? '') == 'Airtel' ? 'selected' : '' }}>Airtel Money</option>
                            <option value="Africell" {{ old('mobile_money_provider', $profile->mobile_money_provider ?? '') == 'Africell' ? 'selected' : '' }}>Africell Money</option>
                        </select>
                    </div>

                    <!-- Mobile Money Number -->
                    <div>
                        <label for="mobile_money_number" class="block text-sm font-medium text-gray-300 mb-2">
                            Mobile Money Number <span class="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            id="mobile_money_number"
                            name="mobile_money_number"
                            value="{{ old('mobile_money_number', $profile->mobile_money_number ?? '') }}"
                            required
                            class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="e.g., 0701234567"
                        >
                    </div>
                </div>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end">
                <button
                    type="submit"
                    class="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                    Complete Setup
                </button>
            </div>
        </form>
    </div>

    <!-- Info Card -->
    <div class="mt-8 bg-blue-900/30 border border-blue-500/50 rounded-lg p-6">
        <div class="flex items-start gap-3">
            <div class="flex-shrink-0">
                <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <div>
                <h4 class="font-semibold text-blue-200 mb-2">Why do we need this information?</h4>
                <ul class="text-blue-300 text-sm space-y-1">
                    <li>• Your stage name will be displayed on your music and profile</li>
                    <li>• Real name is required for identity verification and payments</li>
                    <li>• Mobile money details are needed for revenue payouts</li>
                    <li>• All information is kept secure and private</li>
                </ul>
            </div>
        </div>
    </div>
</div>
@endsection