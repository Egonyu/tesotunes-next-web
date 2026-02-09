@extends('frontend.layouts.sacco')

@section('title', 'Convert Credits to Cash - SACCO')

@section('content')
<div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-3xl font-bold text-white">Convert Credits to Cash</h2>
            <p class="text-gray-400">Exchange your platform credits for SACCO savings</p>
        </div>
        <div class="flex gap-3">
            <a href="{{ route('sacco.dashboard') }}" class="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <span class="material-icons-round text-sm">arrow_back</span>
                Dashboard
            </a>
        </div>
    </div>

    <!-- Exchange Rate Info -->
    <div class="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
        <div class="flex items-start gap-4">
            <span class="material-icons-round text-5xl opacity-75">paid</span>
            <div class="flex-1">
                <h3 class="text-2xl font-bold mb-2">Exchange Rate</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p class="text-sm opacity-90">Current Rate</p>
                        <p class="text-3xl font-bold">{{ number_format($exchangeRate) }} Credits = UGX 1</p>
                    </div>
                    <div>
                        <p class="text-sm opacity-90">Your Credits Balance</p>
                        <p class="text-3xl font-bold">{{ number_format($userCredits) }}</p>
                    </div>
                    <div>
                        <p class="text-sm opacity-90">Cash Equivalent</p>
                        <p class="text-3xl font-bold">UGX {{ number_format($userCredits / $exchangeRate) }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Conversion Limits -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-gray-800 rounded-xl p-4">
            <div class="flex items-center gap-3 mb-2">
                <span class="material-icons-round text-blue-500">info</span>
                <h4 class="font-semibold text-white">Minimum Conversion</h4>
            </div>
            <p class="text-2xl font-bold text-white">{{ number_format($minConversion) }} credits</p>
            <p class="text-sm text-gray-400">= UGX {{ number_format($minConversion / $exchangeRate) }}</p>
        </div>

        <div class="bg-gray-800 rounded-xl p-4">
            <div class="flex items-center gap-3 mb-2">
                <span class="material-icons-round text-yellow-500">schedule</span>
                <h4 class="font-semibold text-white">Daily Limit</h4>
            </div>
            <p class="text-2xl font-bold text-white">{{ number_format($maxDaily) }} credits</p>
            <p class="text-sm text-gray-400">= UGX {{ number_format($maxDaily / $exchangeRate) }}</p>
        </div>

        <div class="bg-gray-800 rounded-xl p-4">
            <div class="flex items-center gap-3 mb-2">
                <span class="material-icons-round text-green-500">check_circle</span>
                <h4 class="font-semibold text-white">Remaining Today</h4>
            </div>
            <p class="text-2xl font-bold text-white">{{ number_format($remainingDaily) }} credits</p>
            <p class="text-sm text-gray-400">{{ $todayConversions > 0 ? 'Already converted today: ' . number_format($todayConversions * $exchangeRate) . ' credits' : 'No conversions today' }}</p>
        </div>
    </div>

    <!-- Conversion Form -->
    <div class="bg-gray-800 rounded-xl p-6">
        <h3 class="text-xl font-bold text-white mb-6">Convert Your Credits</h3>

        <form action="{{ route('sacco.credits.deposit') }}" method="POST" class="space-y-6">
            @csrf

            <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Credits Amount</label>
                <div class="relative">
                    <input 
                        type="number" 
                        name="credits_amount" 
                        id="creditsInput"
                        required 
                        min="{{ $minConversion }}" 
                        max="{{ min($remainingDaily, $userCredits) }}"
                        value="{{ $minConversion }}"
                        class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-600"
                        placeholder="Enter credits amount"
                        oninput="updateConversion()">
                    <span class="absolute right-4 top-3 text-gray-400">credits</span>
                </div>
                <div class="flex justify-between text-sm text-gray-400 mt-1">
                    <span>Min: {{ number_format($minConversion) }}</span>
                    <span>Max: {{ number_format(min($remainingDaily, $userCredits)) }}</span>
                </div>
            </div>

            <!-- Quick Amount Buttons -->
            <div class="grid grid-cols-4 gap-3">
                @php
                    $quickAmounts = [1000, 5000, 10000, 25000];
                @endphp
                @foreach($quickAmounts as $amount)
                    @if($amount <= min($remainingDaily, $userCredits))
                    <button type="button" 
                            onclick="document.getElementById('creditsInput').value = {{ $amount }}; updateConversion();"
                            class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        {{ number_format($amount) }}
                    </button>
                    @endif
                @endforeach
            </div>

            <!-- Conversion Preview -->
            <div class="bg-gray-700 rounded-lg p-6 space-y-3">
                <h4 class="font-semibold text-white mb-4">Conversion Summary</h4>
                
                <div class="flex justify-between items-center">
                    <span class="text-gray-400">Credits to Convert:</span>
                    <span class="text-xl font-bold text-white"><span id="creditsDisplay">{{ number_format($minConversion) }}</span> credits</span>
                </div>

                <div class="flex justify-between items-center">
                    <span class="text-gray-400">Exchange Rate:</span>
                    <span class="text-white">{{ number_format($exchangeRate) }}:1</span>
                </div>

                <div class="h-px bg-gray-600"></div>

                <div class="flex justify-between items-center">
                    <span class="text-gray-400">You Will Receive:</span>
                    <span class="text-2xl font-bold text-green-500">UGX <span id="cashDisplay">{{ number_format($minConversion / $exchangeRate) }}</span></span>
                </div>

                <div class="text-sm text-gray-400 mt-4">
                    <p>✓ Instant deposit to SACCO savings account</p>
                    <p>✓ No transaction fees</p>
                    <p>✓ Earns interest immediately</p>
                </div>
            </div>

            <!-- Terms -->
            <div class="bg-gray-700 rounded-lg p-4">
                <label class="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" name="terms_accepted" required class="mt-1 rounded">
                    <span class="text-sm text-gray-300">
                        I understand that this conversion is <strong>irreversible</strong>. Credits will be deducted from my account and deposited to my SACCO savings account.
                    </span>
                </label>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3">
                <a href="{{ route('sacco.dashboard') }}" 
                   class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Cancel
                </a>
                <button type="submit" 
                        class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <span class="material-icons-round text-sm">swap_horiz</span>
                    Convert Credits
                </button>
            </div>
        </form>
    </div>

    <!-- Info Box -->
    <div class="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-xl p-6">
        <div class="flex gap-4">
            <span class="material-icons-round text-blue-400 text-3xl">lightbulb</span>
            <div>
                <h4 class="font-semibold text-white mb-2">How to Earn More Credits</h4>
                <ul class="text-sm text-gray-300 space-y-1">
                    <li>• Daily login bonus: 10 credits</li>
                    <li>• Complete profile: 100 credits</li>
                    <li>• Listen to music: 1 credit per song</li>
                    <li>• Share songs: 5 credits per share</li>
                    <li>• Invite friends: 50 credits per referral</li>
                </ul>
            </div>
        </div>
    </div>
</div>

<script>
function updateConversion() {
    const credits = parseInt(document.getElementById('creditsInput').value) || 0;
    const rate = {{ $exchangeRate }};
    const cash = credits / rate;
    
    document.getElementById('creditsDisplay').textContent = credits.toLocaleString();
    document.getElementById('cashDisplay').textContent = cash.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0});
}
</script>
@endsection
