@extends('layouts.app')

@section('title', 'Make Deposit - SACCO')

@section('left-sidebar')
    @include('frontend.partials.sacco-left-sidebar')
@endsection

@section('content')
<div class="min-h-screen bg-gray-50 dark:bg-[#0D1117]">
    <main class="p-4 md:p-6">
        <!-- Header with Back Button -->
        <div class="flex items-center gap-4 mb-6">
            <a href="{{ route('sacco.dashboard') }}" class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-[#161B22] hover:bg-gray-100 dark:hover:bg-[#21262D] border border-gray-200 dark:border-[#30363D] text-gray-700 dark:text-white transition-colors">
                <span class="material-symbols-outlined">arrow_back</span>
            </a>
            <div>
                <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Make Deposit</h2>
                <p class="text-gray-500 dark:text-[#7D8590]">Add funds to your SACCO savings account</p>
            </div>
        </div>

        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <!-- Main Content - Left Column -->
            <div class="xl:col-span-2 space-y-6">
                <!-- Success/Error Messages -->
                @if(session('success'))
                    <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3">
                        <span class="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                        <div>
                            <p class="text-green-800 dark:text-green-200 text-sm font-medium">{{ session('success') }}</p>
                        </div>
                    </div>
                @endif

                @if(session('error'))
                    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                        <span class="material-symbols-outlined text-red-600 dark:text-red-400">error</span>
                        <div>
                            <p class="text-red-800 dark:text-red-200 text-sm font-medium">{{ session('error') }}</p>
                        </div>
                    </div>
                @endif

                <!-- Deposit Form Card -->
                <div class="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-2xl overflow-hidden shadow-sm">
                    <div class="p-6 border-b border-gray-200 dark:border-[#30363D]">
                        <h5 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <span class="material-symbols-outlined text-brand-green">savings</span>
                            Deposit Information
                        </h5>
                    </div>

                    <form action="{{ route('sacco.deposits.store') }}" method="POST" id="depositForm" class="p-6 space-y-6">
                        @csrf

                        <!-- Account Selection -->
                        <div>
                            <label for="account_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Account <span class="text-red-500">*</span>
                            </label>
                            <select name="account_id" id="account_id" required 
                                    class="w-full px-4 py-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] rounded-lg text-gray-900 dark:text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green @error('account_id') border-red-500 @enderror">
                                <option value="">Choose an account</option>
                                @forelse($accounts as $acc)
                                    @php
                                        // Extract account type code from account number prefix
                                        $accountCode = strtoupper(substr($acc->account_number ?? '', 0, 3));
                                        
                                        // Get account type from admin-configured account types
                                        $accountType = isset($accountTypes) && isset($accountTypes[$accountCode]) ? $accountTypes[$accountCode] : null;
                                        
                                        // Determine account name from account type or fallback sources
                                        $accountName = $acc->account_name;
                                        if (empty($accountName) && $accountType) {
                                            $accountName = $accountType->name;
                                        }
                                        if (empty($accountName)) {
                                            $accountName = $acc->account_type ? ucfirst($acc->account_type) . ' Account' : 'Account';
                                        }
                                        
                                        // Get interest rate from account type configuration
                                        $interestRate = $accountType ? $accountType->interest_rate : ($acc->interest_rate ?? 0);
                                        
                                        // Check if this account type allows deposits
                                        $allowsDeposits = $accountType ? $accountType->allow_deposits : true;
                                        
                                        $balance = $acc->balance_ugx ?? 0;
                                    @endphp
                                    @if($allowsDeposits)
                                    <option value="{{ $acc->id }}" 
                                            data-interest-rate="{{ $interestRate }}"
                                            data-account-code="{{ $accountCode }}"
                                            {{ old('account_id', request('account')) == $acc->id ? 'selected' : '' }}>
                                        {{ $accountName }} - {{ $acc->account_number }} (Balance: UGX {{ number_format($balance) }}) @if($interestRate > 0)• {{ number_format($interestRate, 1) }}% p.a.@endif
                                    </option>
                                    @endif
                                @empty
                                    <option value="" disabled>No accounts available</option>
                                @endforelse
                            </select>
                            @error('account_id')
                                <p class="mt-1 text-sm text-red-500">{{ $message }}</p>
                            @enderror
                            <p class="mt-1 text-xs text-gray-500 dark:text-[#7D8590]">Your accounts were automatically created when you joined SACCO</p>
                        </div>

                        <!-- Amount -->
                        <div>
                            <label for="amount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Deposit Amount (UGX) <span class="text-red-500">*</span>
                            </label>
                            <div class="relative">
                                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#7D8590] font-medium">UGX</span>
                                <input type="number" name="amount" id="amount" required 
                                       min="{{ config('sacco.transactions.min_deposit', 5000) }}" 
                                       step="100" 
                                       value="{{ old('amount') }}" 
                                       class="w-full pl-16 pr-4 py-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] rounded-lg text-gray-900 dark:text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green text-lg font-semibold @error('amount') border-red-500 @enderror"
                                       placeholder="10,000">
                            </div>
                            @error('amount')
                                <p class="mt-1 text-sm text-red-500">{{ $message }}</p>
                            @enderror
                            <p class="mt-1 text-xs text-gray-500 dark:text-[#7D8590]">Minimum deposit: UGX {{ number_format(config('sacco.transactions.min_deposit', 5000)) }}</p>
                            
                            <!-- Quick Amount Buttons -->
                            <div class="mt-3 flex flex-wrap gap-2">
                                @foreach([10000, 50000, 100000, 500000, 1000000] as $quickAmount)
                                    <button type="button" onclick="setAmount({{ $quickAmount }})" 
                                            class="px-4 py-2 bg-gray-100 dark:bg-[#21262D] hover:bg-gray-200 dark:hover:bg-[#30363D] text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors border border-gray-200 dark:border-[#30363D]">
                                        {{ number_format($quickAmount) }}
                                    </button>
                                @endforeach
                            </div>
                        </div>

                        <!-- Payment Method - ZengaPay Only -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Payment Method <span class="text-red-500">*</span>
                            </label>
                            <input type="hidden" name="payment_method" value="mobile_money">
                            
                            <div class="p-4 bg-brand-green/10 border-2 border-brand-green rounded-xl">
                                <div class="flex items-center gap-4">
                                    <div class="w-14 h-14 bg-brand-green/20 rounded-xl flex items-center justify-center">
                                        <span class="material-symbols-outlined text-3xl text-brand-green">phone_android</span>
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-gray-900 dark:text-white font-semibold text-lg">Mobile Money via ZengaPay</p>
                                        <p class="text-gray-500 dark:text-[#7D8590] text-sm">MTN Mobile Money • Airtel Money</p>
                                    </div>
                                    <div class="flex items-center gap-1 text-brand-green text-xs font-bold">
                                        <span class="material-symbols-outlined text-sm">bolt</span>
                                        Instant
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Mobile Money Number -->
                        <div>
                            <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mobile Money Number <span class="text-red-500">*</span>
                            </label>
                            <div class="relative">
                                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#7D8590]">
                                    <span class="material-symbols-outlined text-xl">phone_android</span>
                                </span>
                                <input type="tel" name="phone" id="phone" required
                                       value="{{ old('phone', auth()->user()->phone) }}" 
                                       pattern="^(\+256|0)[0-9]{9}$"
                                       class="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] rounded-lg text-gray-900 dark:text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green @error('phone') border-red-500 @enderror"
                                       placeholder="0700000000 or +256700000000">
                            </div>
                            @error('phone')
                                <p class="mt-1 text-sm text-red-500">{{ $message }}</p>
                            @enderror
                            <p class="mt-1 text-xs text-gray-500 dark:text-[#7D8590]">Enter your MTN or Airtel Money number</p>
                        </div>

                        <!-- Description (Optional) -->
                        <div>
                            <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description (Optional)
                            </label>
                            <input type="text" name="description" id="description" value="{{ old('description', 'SACCO Savings Deposit') }}"
                                   class="w-full px-4 py-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] rounded-lg text-gray-900 dark:text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green @error('description') border-red-500 @enderror"
                                   placeholder="e.g., Monthly savings contribution">
                            @error('description')
                                <p class="mt-1 text-sm text-red-500">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Transaction Summary -->
                        <div id="transactionSummary" class="hidden bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-[#30363D] rounded-xl p-5">
                            <h6 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                <span class="material-symbols-outlined text-lg">receipt</span>
                                Transaction Summary
                            </h6>
                            <div class="space-y-3">
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-500 dark:text-[#7D8590]">Deposit Amount</span>
                                    <span class="text-gray-900 dark:text-white font-medium" id="summaryAmount">UGX 0</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-500 dark:text-[#7D8590]">Processing Fee</span>
                                    <span class="text-brand-green font-medium">FREE</span>
                                </div>
                                <div class="border-t border-gray-200 dark:border-[#30363D] my-2"></div>
                                <div class="flex justify-between text-base font-bold">
                                    <span class="text-gray-900 dark:text-white">Total to Pay</span>
                                    <span class="text-brand-green" id="summaryTotal">UGX 0</span>
                                </div>
                            </div>
                        </div>

                        <!-- Submit Buttons -->
                        <div class="flex flex-col sm:flex-row items-center gap-4 pt-4">
                            <button type="submit" id="submitBtn" 
                                    class="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-brand-green hover:bg-green-600 text-white px-6 py-4 rounded-xl font-semibold transition-colors shadow-lg shadow-brand-green/20">
                                <span class="material-symbols-outlined">check_circle</span>
                                <span id="submitText">Initiate Deposit</span>
                                <span id="loadingSpinner" class="hidden">
                                    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </span>
                            </button>
                            <a href="{{ route('sacco.dashboard') }}" 
                               class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 dark:bg-[#21262D] hover:bg-gray-200 dark:hover:bg-[#30363D] text-gray-700 dark:text-white px-6 py-4 rounded-xl font-medium transition-colors border border-gray-200 dark:border-[#30363D]">
                                Cancel
                            </a>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Right Sidebar - Informative Cards -->
            <div class="space-y-6">
                <!-- About Your Accounts Card -->
                <div class="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-2xl p-6 shadow-sm">
                    <h5 class="text-gray-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-green">account_balance_wallet</span>
                        Available Account Types
                    </h5>
                    <div class="space-y-3 text-sm">
                        @if(isset($accountTypes) && $accountTypes->count() > 0)
                            @foreach($accountTypes as $type)
                                @php
                                    // Determine color scheme based on account type code
                                    $colorScheme = match($type->code) {
                                        'SAV' => ['bg' => 'bg-green-50 dark:bg-green-900/10', 'border' => 'border-green-200 dark:border-green-800/30', 'title' => 'text-green-800 dark:text-green-300', 'text' => 'text-green-700 dark:text-green-400'],
                                        'SHR' => ['bg' => 'bg-blue-50 dark:bg-blue-900/10', 'border' => 'border-blue-200 dark:border-blue-800/30', 'title' => 'text-blue-800 dark:text-blue-300', 'text' => 'text-blue-700 dark:text-blue-400'],
                                        'FIX' => ['bg' => 'bg-purple-50 dark:bg-purple-900/10', 'border' => 'border-purple-200 dark:border-purple-800/30', 'title' => 'text-purple-800 dark:text-purple-300', 'text' => 'text-purple-700 dark:text-purple-400'],
                                        'TGT' => ['bg' => 'bg-amber-50 dark:bg-amber-900/10', 'border' => 'border-amber-200 dark:border-amber-800/30', 'title' => 'text-amber-800 dark:text-amber-300', 'text' => 'text-amber-700 dark:text-amber-400'],
                                        default => ['bg' => 'bg-gray-50 dark:bg-gray-900/10', 'border' => 'border-gray-200 dark:border-gray-800/30', 'title' => 'text-gray-800 dark:text-gray-300', 'text' => 'text-gray-700 dark:text-gray-400'],
                                    };
                                @endphp
                                <div class="p-3 {{ $colorScheme['bg'] }} rounded-lg border {{ $colorScheme['border'] }}">
                                    <div class="flex items-center justify-between mb-1">
                                        <p class="font-semibold {{ $colorScheme['title'] }}">{{ $type->name }}</p>
                                        <span class="text-xs font-mono {{ $colorScheme['text'] }}">{{ $type->code }}</span>
                                    </div>
                                    <p class="{{ $colorScheme['text'] }} text-xs">{{ $type->description ?? 'No description available.' }}</p>
                                    <div class="flex items-center gap-3 mt-2 text-xs">
                                        <span class="{{ $colorScheme['title'] }} font-medium">{{ number_format($type->interest_rate, 1) }}% p.a.</span>
                                        @if($type->minimum_balance_ugx > 0)
                                            <span class="{{ $colorScheme['text'] }}">Min: UGX {{ number_format($type->minimum_balance_ugx) }}</span>
                                        @endif
                                        @if(!$type->allow_withdrawals)
                                            <span class="text-red-500 dark:text-red-400">No withdrawals</span>
                                        @endif
                                    </div>
                                </div>
                            @endforeach
                        @else
                            <div class="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800/30">
                                <p class="font-semibold text-green-800 dark:text-green-300 mb-1">Savings Account</p>
                                <p class="text-green-700 dark:text-green-400 text-xs">Your primary savings account earns <strong>5% annual interest</strong>. Perfect for regular deposits and withdrawals.</p>
                            </div>
                            <div class="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800/30">
                                <p class="font-semibold text-blue-800 dark:text-blue-300 mb-1">Share Capital Account</p>
                                <p class="text-blue-700 dark:text-blue-400 text-xs">Your ownership stake in the SACCO. Earns <strong>8% dividend</strong> and determines your loan eligibility.</p>
                            </div>
                        @endif
                        <p class="text-gray-500 dark:text-[#7D8590] text-xs">
                            <span class="material-symbols-outlined text-xs align-middle">info</span>
                            Account types and interest rates are configured by the SACCO administrator.
                        </p>
                    </div>
                </div>

                <!-- How Deposits Work -->
                <div class="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-2xl p-6 shadow-sm">
                    <h5 class="text-gray-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-blue-500">help</span>
                        How Deposits Work
                    </h5>
                    <ol class="space-y-3 text-sm">
                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center text-xs font-bold">1</span>
                            <span class="text-gray-600 dark:text-[#7D8590]">Enter amount & phone number</span>
                        </li>
                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center text-xs font-bold">2</span>
                            <span class="text-gray-600 dark:text-[#7D8590]">Click "Initiate Deposit"</span>
                        </li>
                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center text-xs font-bold">3</span>
                            <span class="text-gray-600 dark:text-[#7D8590]">Approve payment on your phone</span>
                        </li>
                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center text-xs font-bold">4</span>
                            <span class="text-gray-600 dark:text-[#7D8590]">Account credited instantly!</span>
                        </li>
                    </ol>
                </div>

                <!-- Interest Calculator -->
                <div class="bg-gradient-to-br from-brand-green/10 to-emerald-500/10 dark:from-brand-green/20 dark:to-emerald-500/20 border border-brand-green/30 rounded-2xl p-6">
                    <h5 class="text-gray-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-green">calculate</span>
                        Earnings Preview
                    </h5>
                    <div id="earningsPreview" class="space-y-2 text-sm">
                        <p class="text-gray-500 dark:text-[#7D8590]">Select an account and enter amount to see potential earnings</p>
                    </div>
                    <div id="earningsCalculation" class="hidden space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600 dark:text-[#7D8590]" id="monthlyLabel">Monthly</span>
                            <span class="text-brand-green font-semibold" id="monthlyEarnings">+UGX 0</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600 dark:text-[#7D8590]" id="yearlyLabel">Yearly</span>
                            <span class="text-brand-green font-semibold" id="yearlyEarnings">+UGX 0</span>
                        </div>
                    </div>
                </div>

                <!-- Savings Goals Tip -->
                <div class="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-2xl p-6 shadow-sm">
                    <h5 class="text-gray-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                        <span class="material-symbols-outlined text-amber-500">lightbulb</span>
                        Savings Tips
                    </h5>
                    <ul class="space-y-2 text-sm text-gray-600 dark:text-[#7D8590]">
                        <li class="flex gap-2">
                            <span class="material-symbols-outlined text-brand-green text-sm">check_circle</span>
                            Set up weekly or monthly deposits
                        </li>
                        <li class="flex gap-2">
                            <span class="material-symbols-outlined text-brand-green text-sm">check_circle</span>
                            Start small and increase gradually
                        </li>
                        <li class="flex gap-2">
                            <span class="material-symbols-outlined text-brand-green text-sm">check_circle</span>
                            Build shares for higher loan limits
                        </li>
                    </ul>
                </div>

                <!-- Security Badge -->
                <div class="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-2xl p-6 shadow-sm">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                            <span class="material-symbols-outlined text-xl text-blue-500">verified_user</span>
                        </div>
                        <div>
                            <h5 class="text-gray-900 dark:text-white font-semibold text-sm">Secured by ZengaPay</h5>
                            <p class="text-gray-500 dark:text-[#7D8590] text-xs">Bank of Uganda licensed</p>
                        </div>
                    </div>
                </div>

                <!-- Support Card -->
                <div class="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-2xl p-6 shadow-sm">
                    <h5 class="text-gray-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                        <span class="material-symbols-outlined text-purple-500">support_agent</span>
                        Need Help?
                    </h5>
                    <div class="space-y-2 text-sm">
                        <a href="tel:+256700000000" class="flex items-center gap-2 text-gray-600 dark:text-[#7D8590] hover:text-brand-green transition-colors">
                            <span class="material-symbols-outlined text-sm">call</span>
                            +256 700 000 000
                        </a>
                        <a href="mailto:sacco@tesotunes.com" class="flex items-center gap-2 text-gray-600 dark:text-[#7D8590] hover:text-brand-green transition-colors">
                            <span class="material-symbols-outlined text-sm">mail</span>
                            sacco@tesotunes.com
                        </a>
                        <a href="https://wa.me/256700000000" target="_blank" class="flex items-center gap-2 text-gray-600 dark:text-[#7D8590] hover:text-brand-green transition-colors">
                            <span class="material-symbols-outlined text-sm">chat</span>
                            WhatsApp Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>

@push('scripts')
<script>
    // Quick amount buttons
    function setAmount(amount) {
        document.getElementById('amount').value = amount;
        updateSummary();
    }

    // Get interest rate from selected account
    function getSelectedInterestRate() {
        const accountSelect = document.getElementById('account_id');
        const selectedOption = accountSelect.options[accountSelect.selectedIndex];
        if (selectedOption && selectedOption.dataset.interestRate) {
            return parseFloat(selectedOption.dataset.interestRate) / 100;
        }
        return 0.05; // Default 5%
    }

    // Update transaction summary and earnings preview
    function updateSummary() {
        const amount = parseFloat(document.getElementById('amount').value) || 0;
        const summaryDiv = document.getElementById('transactionSummary');
        const earningsPreview = document.getElementById('earningsPreview');
        const earningsCalc = document.getElementById('earningsCalculation');
        const interestRate = getSelectedInterestRate();
        const interestPercent = (interestRate * 100).toFixed(1);
        
        if (amount > 0) {
            summaryDiv.classList.remove('hidden');
            document.getElementById('summaryAmount').textContent = 'UGX ' + amount.toLocaleString();
            document.getElementById('summaryTotal').textContent = 'UGX ' + amount.toLocaleString();
            
            // Calculate earnings based on selected account's interest rate
            const monthlyInterest = Math.round(amount * interestRate / 12);
            const yearlyInterest = Math.round(amount * interestRate);
            
            earningsPreview.classList.add('hidden');
            earningsCalc.classList.remove('hidden');
            document.getElementById('monthlyLabel').textContent = `Monthly (${interestPercent}% p.a.)`;
            document.getElementById('yearlyLabel').textContent = `Yearly (${interestPercent}% p.a.)`;
            document.getElementById('monthlyEarnings').textContent = '+UGX ' + monthlyInterest.toLocaleString();
            document.getElementById('yearlyEarnings').textContent = '+UGX ' + yearlyInterest.toLocaleString();
        } else {
            summaryDiv.classList.add('hidden');
            earningsPreview.classList.remove('hidden');
            earningsCalc.classList.add('hidden');
        }
    }

    // Amount input listener
    document.getElementById('amount').addEventListener('input', updateSummary);
    document.getElementById('amount').addEventListener('change', updateSummary);
    
    // Account selection listener
    document.getElementById('account_id').addEventListener('change', updateSummary);

    // Initialize summary on page load
    updateSummary();

    // Form submission handling
    const depositForm = document.getElementById('depositForm');
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const loadingSpinner = document.getElementById('loadingSpinner');

    depositForm.addEventListener('submit', function(e) {
        // Validate amount
        const amount = parseFloat(document.getElementById('amount').value);
        const minAmount = {{ config('sacco.transactions.min_deposit', 5000) }};
        
        if (amount < minAmount) {
            e.preventDefault();
            alert('Minimum deposit amount is UGX ' + minAmount.toLocaleString());
            return;
        }

        // Validate phone
        const phone = document.getElementById('phone').value;
        const phonePattern = /^(\+256|0)[0-9]{9}$/;
        if (!phonePattern.test(phone)) {
            e.preventDefault();
            alert('Please enter a valid Ugandan phone number (e.g., 0700000000 or +256700000000)');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitText.textContent = 'Processing...';
        loadingSpinner.classList.remove('hidden');
        
        // Re-enable after 30 seconds in case of slow response
        setTimeout(() => {
            submitBtn.disabled = false;
            submitText.textContent = 'Initiate Deposit';
            loadingSpinner.classList.add('hidden');
        }, 30000);
    });

    // Format phone number on input
    document.getElementById('phone').addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^\d+]/g, '');
        
        // Handle various formats
        if (value.startsWith('256') && !value.startsWith('+256')) {
            value = '+' + value;
        }
        
        e.target.value = value;
    });
</script>
@endpush
@endsection
