@extends('frontend.layouts.sacco')

@section('title', 'Application Pending - SACCO')

@section('content')
<div class="p-6">
    <div class="max-w-3xl mx-auto space-y-6">
        <!-- Success Message -->
        <div class="bg-gray-800 border border-gray-700 rounded-2xl p-8 md:p-12 text-center">
            <div class="w-20 h-20 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="material-icons-round text-5xl text-yellow-500">schedule</span>
            </div>
            
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-4">Application Submitted!</h1>
            <p class="text-xl text-gray-300 mb-2">Thank you for applying to join LineOne Music SACCO</p>
            <p class="text-gray-400">Your application is currently under review</p>
        </div>

        <!-- Application Status -->
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h5 class="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <span class="material-icons-round text-green-500">timeline</span>
                Application Timeline
            </h5>
            
            <div class="space-y-6">
                <!-- Step 1 - Completed -->
                <div class="flex gap-4">
                    <div class="flex flex-col items-center">
                        <div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="material-icons-round text-white text-sm">check</span>
                        </div>
                        <div class="w-0.5 h-full bg-gray-700"></div>
                    </div>
                    <div class="pb-8">
                        <h6 class="text-white font-semibold mb-1">Application Submitted</h6>
                        <p class="text-sm text-gray-400">{{ now()->format('M d, Y h:i A') }}</p>
                        <p class="text-sm text-gray-500 mt-2">Your application has been successfully received</p>
                    </div>
                </div>

                <!-- Step 2 - In Progress -->
                <div class="flex gap-4">
                    <div class="flex flex-col items-center">
                        <div class="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                            <span class="material-icons-round text-white text-sm">schedule</span>
                        </div>
                        <div class="w-0.5 h-full bg-gray-700"></div>
                    </div>
                    <div class="pb-8">
                        <h6 class="text-white font-semibold mb-1">Under Review</h6>
                        <p class="text-sm text-yellow-400">In Progress</p>
                        <p class="text-sm text-gray-500 mt-2">Our team is reviewing your application and documents</p>
                    </div>
                </div>

                <!-- Step 3 - Pending -->
                <div class="flex gap-4">
                    <div class="flex flex-col items-center">
                        <div class="w-10 h-10 bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="material-icons-round text-gray-500 text-sm">pending</span>
                        </div>
                        <div class="w-0.5 h-full bg-gray-700"></div>
                    </div>
                    <div class="pb-8">
                        <h6 class="text-gray-400 font-semibold mb-1">Approval Decision</h6>
                        <p class="text-sm text-gray-600">Pending</p>
                        <p class="text-sm text-gray-600 mt-2">Final review and approval by admin</p>
                    </div>
                </div>

                <!-- Step 4 - Pending -->
                <div class="flex gap-4">
                    <div class="flex flex-col items-center">
                        <div class="w-10 h-10 bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="material-icons-round text-gray-500 text-sm">check_circle</span>
                        </div>
                    </div>
                    <div>
                        <h6 class="text-gray-400 font-semibold mb-1">Account Activation</h6>
                        <p class="text-sm text-gray-600">Pending</p>
                        <p class="text-sm text-gray-600 mt-2">Your SACCO account will be activated upon approval</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- What Happens Next -->
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h5 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span class="material-icons-round text-blue-500">info</span>
                What Happens Next?
            </h5>
            <div class="space-y-4">
                <div class="flex items-start gap-3">
                    <span class="material-icons-round text-green-500 mt-1 flex-shrink-0">schedule</span>
                    <div>
                        <p class="text-white font-medium mb-1">Review Process</p>
                        <p class="text-gray-400 text-sm">Our team typically reviews applications within 24-48 hours during business days.</p>
                    </div>
                </div>
                
                <div class="flex items-start gap-3">
                    <span class="material-icons-round text-blue-500 mt-1 flex-shrink-0">email</span>
                    <div>
                        <p class="text-white font-medium mb-1">Notification</p>
                        <p class="text-gray-400 text-sm">You'll receive an email and SMS notification once your application is approved or if additional information is needed.</p>
                    </div>
                </div>
                
                <div class="flex items-start gap-3">
                    <span class="material-icons-round text-purple-500 mt-1 flex-shrink-0">account_balance_wallet</span>
                    <div>
                        <p class="text-white font-medium mb-1">Account Setup</p>
                        <p class="text-gray-400 text-sm">Upon approval, your SACCO accounts (Savings, Shares, Fixed Deposit) will be automatically created.</p>
                    </div>
                </div>
                
                <div class="flex items-start gap-3">
                    <span class="material-icons-round text-yellow-500 mt-1 flex-shrink-0">rocket_launch</span>
                    <div>
                        <p class="text-white font-medium mb-1">Get Started</p>
                        <p class="text-gray-400 text-sm">You'll be able to make deposits, apply for loans, and access all SACCO services.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Contact Support -->
        <div class="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 text-center">
            <div class="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span class="material-icons-round text-2xl text-green-500">support_agent</span>
            </div>
            <h5 class="text-lg font-semibold text-white mb-2">Need Assistance?</h5>
            <p class="text-gray-400 mb-4">Our support team is here to help you</p>
            <div class="flex flex-wrap justify-center gap-3">
                <a href="mailto:sacco@lineonemusic.com" class="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    <span class="material-icons-round text-sm">email</span>
                    Email Us
                </a>
                <a href="tel:+256700000000" class="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    <span class="material-icons-round text-sm">phone</span>
                    Call Us
                </a>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap justify-center gap-3">
            <a href="{{ route('frontend.timeline') }}" class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                <span class="material-icons-round">music_note</span>
                Browse Music
            </a>
            <a href="{{ route('frontend.home') }}" class="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                <span class="material-icons-round">home</span>
                Go Home
            </a>
        </div>
    </div>
</div>

@push('styles')
<style>
    @keyframes pulse-ring {
        0% {
            box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.4);
        }
        70% {
            box-shadow: 0 0 0 10px rgba(251, 191, 36, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(251, 191, 36, 0);
        }
    }
    
    .animate-pulse {
        animation: pulse-ring 2s infinite;
    }
</style>
@endpush
@endsection
