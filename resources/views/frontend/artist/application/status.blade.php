@extends('layouts.auth')

@section('title', 'Artist Application Status')

@section('content')
<div class="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
            <div class="flex justify-center mb-6">
                <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                    <span class="material-icons-round text-white text-2xl">assignment</span>
                </div>
            </div>
            <h2 class="text-3xl font-bold text-white mb-2">
                Artist Application Status
            </h2>
            <p class="text-gray-400">
                Track your verification progress
            </p>
        </div>

        <!-- Status Card -->
        <div class="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-6">
            @if(!$artist)
                <!-- Pending Review -->
                <div class="text-center">
                    <div class="inline-flex items-center gap-2 bg-yellow-900/30 border border-yellow-500/50 text-yellow-400 px-6 py-3 rounded-lg mb-4">
                        <span class="material-icons-round">schedule</span>
                        <span class="font-semibold">Application Under Review</span>
                    </div>
                    
                    <p class="text-gray-300 mb-4">
                        Your application was submitted on <strong>{{ $submittedAt->format('F j, Y') }}</strong>
                    </p>
                    
                    <p class="text-gray-400 text-sm">
                        Our team typically reviews applications within 24-48 hours. 
                        You'll receive an email notification once your application has been reviewed.
                    </p>

                    @if($applicationNotes)
                        <div class="mt-6 bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 text-left">
                            <div class="flex gap-3">
                                <span class="material-icons-round text-blue-400">info</span>
                                <div>
                                    <p class="text-blue-300 font-medium mb-2">Additional Notes:</p>
                                    <p class="text-blue-200 text-sm">{{ $applicationNotes }}</p>
                                </div>
                            </div>
                        </div>
                    @endif
                </div>
            @elseif($artist->verification_status === 'pending')
                <!-- Still Pending -->
                <div class="text-center">
                    <div class="inline-flex items-center gap-2 bg-yellow-900/30 border border-yellow-500/50 text-yellow-400 px-6 py-3 rounded-lg mb-4">
                        <span class="material-icons-round">schedule</span>
                        <span class="font-semibold">Application Under Review</span>
                    </div>
                    
                    <p class="text-gray-300 mb-4">
                        Submitted {{ $artist->created_at->diffForHumans() }}
                    </p>
                    
                    <p class="text-gray-400 text-sm">
                        Our team is reviewing your application. You'll be notified via email once complete.
                    </p>
                </div>
            @elseif($artist->verification_status === 'verified')
                <!-- Approved -->
                <div class="text-center">
                    <div class="inline-flex items-center gap-2 bg-green-900/30 border border-green-500/50 text-green-400 px-6 py-3 rounded-lg mb-4">
                        <span class="material-icons-round">check_circle</span>
                        <span class="font-semibold">Artist Account Verified</span>
                    </div>
                    
                    <p class="text-gray-300 mb-6">
                        Congratulations! You're now a verified artist on Tesotunes.
                    </p>
                    
                    <a href="{{ route('frontend.artist.dashboard') }}" 
                       class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                        <span class="material-icons-round">dashboard</span>
                        Go to Artist Dashboard
                    </a>
                </div>
            @elseif($artist->verification_status === 'rejected')
                <!-- Rejected -->
                <div class="text-center">
                    <div class="inline-flex items-center gap-2 bg-red-900/30 border border-red-500/50 text-red-400 px-6 py-3 rounded-lg mb-4">
                        <span class="material-icons-round">cancel</span>
                        <span class="font-semibold">Application Needs Revision</span>
                    </div>
                    
                    <p class="text-gray-300 mb-4">
                        Your application requires some updates before we can proceed.
                    </p>

                    @if($artist->rejection_reason)
                        <div class="bg-red-900/30 border border-red-500/50 rounded-lg p-4 text-left mb-6">
                            <div class="flex gap-3">
                                <span class="material-icons-round text-red-400">error</span>
                                <div>
                                    <p class="text-red-300 font-medium mb-2">Reason for rejection:</p>
                                    <p class="text-red-200 text-sm">{{ $artist->rejection_reason }}</p>
                                </div>
                            </div>
                        </div>
                    @endif
                    
                    <a href="{{ route('frontend.artist.application.edit') }}" 
                       class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                        <span class="material-icons-round">edit</span>
                        Update Application
                    </a>
                </div>
            @elseif($artist->verification_status === 'more_info_required')
                <!-- More Info Required -->
                <div class="text-center">
                    <div class="inline-flex items-center gap-2 bg-orange-900/30 border border-orange-500/50 text-orange-400 px-6 py-3 rounded-lg mb-4">
                        <span class="material-icons-round">info</span>
                        <span class="font-semibold">Additional Information Required</span>
                    </div>
                    
                    <p class="text-gray-300 mb-4">
                        We need some additional information to complete your verification.
                    </p>

                    @if($artist->rejection_reason)
                        <div class="bg-orange-900/30 border border-orange-500/50 rounded-lg p-4 text-left mb-6">
                            <div class="flex gap-3">
                                <span class="material-icons-round text-orange-400">assignment</span>
                                <div>
                                    <p class="text-orange-300 font-medium mb-2">What we need:</p>
                                    <p class="text-orange-200 text-sm">{{ $artist->rejection_reason }}</p>
                                </div>
                            </div>
                        </div>
                    @endif
                    
                    <a href="{{ route('frontend.artist.application.edit') }}" 
                       class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                        <span class="material-icons-round">upload</span>
                        Upload Additional Documents
                    </a>
                </div>
            @endif
        </div>

        <!-- KYC Documents Status -->
        @if($kycDocuments->count() > 0)
            <div class="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-6">
                <h3 class="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <span class="material-icons-round">verified_user</span>
                    Document Verification Status
                </h3>

                <div class="space-y-4">
                    @foreach($kycDocuments as $doc)
                        <div class="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                                    <span class="material-icons-round text-gray-300">description</span>
                                </div>
                                <div>
                                    <p class="text-white font-medium">{{ $doc->type_label }}</p>
                                    <p class="text-gray-400 text-sm">Uploaded {{ $doc->created_at->diffForHumans() }}</p>
                                </div>
                            </div>
                            
                            <div>
                                @if($doc->status === 'verified')
                                    <span class="inline-flex items-center gap-1 bg-green-900/50 border border-green-500 text-green-400 px-3 py-1 rounded-full text-sm">
                                        <span class="material-icons-round text-xs">check_circle</span>
                                        Verified
                                    </span>
                                @elseif($doc->status === 'pending')
                                    <span class="inline-flex items-center gap-1 bg-yellow-900/50 border border-yellow-500 text-yellow-400 px-3 py-1 rounded-full text-sm">
                                        <span class="material-icons-round text-xs">schedule</span>
                                        Pending
                                    </span>
                                @elseif($doc->status === 'rejected')
                                    <span class="inline-flex items-center gap-1 bg-red-900/50 border border-red-500 text-red-400 px-3 py-1 rounded-full text-sm">
                                        <span class="material-icons-round text-xs">cancel</span>
                                        Rejected
                                    </span>
                                @endif
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        @endif

        <!-- Timeline -->
        @if($artist)
            <div class="bg-gray-800 rounded-lg p-8 border border-gray-700">
                <h3 class="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <span class="material-icons-round">timeline</span>
                    Application Timeline
                </h3>

                <div class="space-y-6">
                    <!-- Submitted -->
                    <div class="flex gap-4">
                        <div class="flex flex-col items-center">
                            <div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                                <span class="material-icons-round text-white text-sm">check</span>
                            </div>
                            <div class="w-0.5 h-full bg-gray-700 mt-2"></div>
                        </div>
                        <div class="pb-8">
                            <p class="text-white font-medium">Application Submitted</p>
                            <p class="text-gray-400 text-sm">{{ $artist->created_at->format('F j, Y g:i A') }}</p>
                        </div>
                    </div>

                    <!-- Under Review -->
                    <div class="flex gap-4">
                        <div class="flex flex-col items-center">
                            <div class="w-10 h-10 rounded-full flex items-center justify-center {{ $artist->verification_status !== 'pending' ? 'bg-green-600' : 'bg-yellow-600' }}">
                                <span class="material-icons-round text-white text-sm">
                                    {{ $artist->verification_status !== 'pending' ? 'check' : 'schedule' }}
                                </span>
                            </div>
                            @if($artist->verification_status !== 'pending')
                                <div class="w-0.5 h-full bg-gray-700 mt-2"></div>
                            @endif
                        </div>
                        <div class="pb-8">
                            <p class="text-white font-medium">Under Review</p>
                            <p class="text-gray-400 text-sm">
                                {{ $artist->verification_status === 'pending' ? 'In progress...' : 'Completed' }}
                            </p>
                        </div>
                    </div>

                    <!-- Decision -->
                    @if($artist->verification_status !== 'pending')
                        <div class="flex gap-4">
                            <div class="flex flex-col items-center">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center 
                                    {{ $artist->verification_status === 'verified' ? 'bg-green-600' : 'bg-red-600' }}">
                                    <span class="material-icons-round text-white text-sm">
                                        {{ $artist->verification_status === 'verified' ? 'check_circle' : 'info' }}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p class="text-white font-medium">
                                    {{ $artist->verification_status === 'verified' ? 'Verified' : 'Action Required' }}
                                </p>
                                <p class="text-gray-400 text-sm">
                                    {{ $artist->updated_at->format('F j, Y g:i A') }}
                                </p>
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        @endif

        <!-- Action Links -->
        <div class="mt-6 text-center">
            <a href="{{ route('frontend.home') }}" class="text-green-500 hover:text-green-400 font-medium">
                ← Back to Home
            </a>
        </div>
    </div>
</div>
@endsection
