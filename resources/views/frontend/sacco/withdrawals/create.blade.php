@extends('layouts.app')

@section('title', 'Request Withdrawal - SACCO')

@section('left-sidebar')
    @include('frontend.partials.sacco-left-sidebar')
@endsection

@section('content')
<div class="min-h-screen bg-gray-50 dark:bg-[#0D1117]">
    <main class="p-4 md:p-6 lg:p-8">
        <div class="max-w-3xl mx-auto space-y-6">
            
            {{-- Header --}}
            <div class="flex items-center gap-4">
                <a href="{{ route('sacco.dashboard') }}" class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#21262D] transition-colors">
                    <span class="material-symbols-outlined">arrow_back</span>
                </a>
                <div>
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Request Withdrawal</h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Withdraw funds from your SACCO savings account</p>
                </div>
            </div>

            {{-- Success/Error Messages --}}
            @if(session('success'))
                <div class="bg-brand-green/10 border border-brand-green/30 rounded-xl p-4 flex items-start gap-3">
                    <span class="material-symbols-outlined text-brand-green">check_circle</span>
                    <p class="text-brand-green text-sm">{{ session('success') }}</p>
                </div>
            @endif

            @if(session('error'))
                <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                    <span class="material-symbols-outlined text-red-500">error</span>
                    <p class="text-red-500 text-sm">{{ session('error') }}</p>
                </div>
            @endif

            {{-- Pending Withdrawals Warning --}}
            @if($pendingWithdrawals > 0)
                <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
                    <span class="material-symbols-outlined text-yellow-500">schedule</span>
                    <div>
                        <p class="text-yellow-600 dark:text-yellow-400 text-sm font-medium">You have pending withdrawals</p>
                        <p class="text-yellow-600/80 dark:text-yellow-400/80 text-xs mt-1">
                            Total pending: UGX {{ number_format($pendingWithdrawals) }}. Please wait for approval before making new requests.
                        </p>
                    </div>
                </div>
            @endif

            {{-- Important Info --}}
            <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                <span class="material-symbols-outlined text-blue-500">info</span>
                <div class="text-sm text-blue-600 dark:text-blue-400">
                    <p class="font-medium mb-1">Important Information</p>
                    <ul class="list-disc list-inside space-y-1 text-xs opacity-90">
                        <li>Withdrawal requests require admin approval (24-48 hours)</li>
                        <li>Minimum balance of <strong>UGX {{ number_format($minimumBalance) }}</strong> must be maintained</li>
                        <li>Minimum withdrawal amount: <strong>UGX {{ number_format(config('sacco.minimum_withdrawal', 1000)) }}</strong></li>
                    </ul>
                </div>
            </div>

            {{-- Withdrawal Form --}}
            <div class="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-2xl overflow-hidden shadow-sm">
                <div class="p-5 border-b border-gray-100 dark:border-[#30363D]">
                    <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-green">account_balance_wallet</span>
                        Withdrawal Details
                    </h2>
                </div>

                <form action="{{ route('sacco.withdrawals.store') }}" method="POST" id="withdrawalForm" class="p-5 space-y-6">
                    @csrf

                    {{-- Account Selection --}}
                    <div>
                        <label for="account_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Savings Account <span class="text-red-500">*</span>
                        </label>
                        
                        @if($accounts->isEmpty())
                            <div class="text-center py-8 bg-gray-50 dark:bg-[#21262D]/50 rounded-xl border border-dashed border-gray-200 dark:border-[#30363D]">
                                <span class="material-symbols-outlined text-4xl text-gray-400 mb-2">account_balance_wallet</span>
                                <p class="text-gray-500 dark:text-gray-400 text-sm">No accounts with available balance</p>
                                <a href="{{ route('sacco.deposits.create') }}" class="text-sm text-brand-green hover:text-green-600 mt-2 inline-block">
                                    Make a deposit first →
                                </a>
                            </div>
                        @else
                            <div class="space-y-3">
                                @foreach($accounts as $acc)
                                    @php
                                        $availableBalance = max(0, $acc->balance_ugx - $minimumBalance);
                                    @endphp
                                    <label class="block cursor-pointer">
                                        <input type="radio" name="account_id" value="{{ $acc->id }}" 
                                               data-balance="{{ $acc->balance_ugx }}"
                                               data-available="{{ $availableBalance }}"
                                               {{ old('account_id', request('account')) == $acc->id ? 'checked' : '' }}
                                               class="sr-only peer" required>
                                        <div class="p-4 rounded-xl border-2 border-gray-200 dark:border-[#30363D] peer-checked:border-brand-green peer-checked:bg-brand-green/5 hover:border-gray-300 dark:hover:border-[#40464D] transition-all">
                                            <div class="flex items-center justify-between">
                                                <div class="flex items-center gap-3">
                                                    <div class="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center">
                                                        <span class="material-symbols-outlined text-brand-green">savings</span>
                                                    </div>
                                                    <div>
                                                        <p class="font-medium text-gray-900 dark:text-white">
                                                            {{ ucfirst(str_replace('_', ' ', $acc->account_type)) }} Account
                                                        </p>
                                                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ $acc->account_number }}</p>
                                                    </div>
                                                </div>
                                                <div class="text-right">
                                                    <p class="text-sm text-gray-500 dark:text-gray-400">Balance</p>
                                                    <p class="font-bold text-gray-900 dark:text-white">UGX {{ number_format($acc->balance_ugx) }}</p>
                                                    <p class="text-xs text-brand-green">Available: UGX {{ number_format($availableBalance) }}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                @endforeach
                            </div>
                        @endif
                        @error('account_id')
                            <p class="mt-2 text-sm text-red-500">{{ $message }}</p>
                        @enderror
                    </div>

                    {{-- Selected Account Info --}}
                    <div id="accountInfo" class="hidden p-4 rounded-xl bg-gray-50 dark:bg-[#21262D]/50 border border-gray-200 dark:border-[#30363D]">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Balance</p>
                                <p id="displayBalance" class="text-lg font-bold text-gray-900 dark:text-white">UGX 0</p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Available to Withdraw</p>
                                <p id="displayAvailable" class="text-lg font-bold text-brand-green">UGX 0</p>
                            </div>
                        </div>
                        <p class="text-xs text-gray-400 mt-2">
                            <span class="material-symbols-outlined text-xs align-middle">info</span>
                            Minimum balance of UGX {{ number_format($minimumBalance) }} must be maintained
                        </p>
                    </div>

                    {{-- Amount --}}
                    <div>
                        <label for="amount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Withdrawal Amount (UGX) <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">UGX</span>
                            <input type="number" name="amount" id="amount" required 
                                   min="{{ config('sacco.minimum_withdrawal', 1000) }}" 
                                   step="100" 
                                   value="{{ old('amount') }}"
                                   class="w-full pl-16 pr-4 py-3 bg-white dark:bg-[#21262D] border border-gray-200 dark:border-[#30363D] rounded-xl text-gray-900 dark:text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green @error('amount') border-red-500 @enderror"
                                   placeholder="Enter amount">
                        </div>
                        @error('amount')
                            <p class="mt-2 text-sm text-red-500">{{ $message }}</p>
                        @enderror
                        <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Minimum: UGX {{ number_format(config('sacco.minimum_withdrawal', 1000)) }}
                        </p>
                        <div id="amountWarning" class="hidden mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <p class="text-sm text-red-500 flex items-center gap-2">
                                <span class="material-symbols-outlined text-sm">error</span>
                                <span id="warningText"></span>
                            </p>
                        </div>
                    </div>

                    {{-- Withdrawal Method --}}
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Withdrawal Method <span class="text-red-500">*</span>
                        </label>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {{-- Mobile Money --}}
                            <label class="cursor-pointer">
                                <input type="radio" name="withdrawal_method" value="mobile_money" {{ old('withdrawal_method', 'mobile_money') === 'mobile_money' ? 'checked' : '' }} class="sr-only peer" required>
                                <div class="p-4 rounded-xl border-2 border-gray-200 dark:border-[#30363D] peer-checked:border-brand-green peer-checked:bg-brand-green/5 hover:border-gray-300 dark:hover:border-[#40464D] transition-all text-center">
                                    <div class="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-2">
                                        <span class="material-symbols-outlined text-brand-green">phone_android</span>
                                    </div>
                                    <p class="font-medium text-gray-900 dark:text-white text-sm">Mobile Money</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Instant</p>
                                </div>
                            </label>

                            {{-- Bank Transfer --}}
                            <label class="cursor-pointer">
                                <input type="radio" name="withdrawal_method" value="bank_transfer" {{ old('withdrawal_method') === 'bank_transfer' ? 'checked' : '' }} class="sr-only peer">
                                <div class="p-4 rounded-xl border-2 border-gray-200 dark:border-[#30363D] peer-checked:border-blue-500 peer-checked:bg-blue-500/5 hover:border-gray-300 dark:hover:border-[#40464D] transition-all text-center">
                                    <div class="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
                                        <span class="material-symbols-outlined text-blue-500">account_balance</span>
                                    </div>
                                    <p class="font-medium text-gray-900 dark:text-white text-sm">Bank Transfer</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">2-3 days</p>
                                </div>
                            </label>

                            {{-- Cash Pickup --}}
                            <label class="cursor-pointer">
                                <input type="radio" name="withdrawal_method" value="cash" {{ old('withdrawal_method') === 'cash' ? 'checked' : '' }} class="sr-only peer">
                                <div class="p-4 rounded-xl border-2 border-gray-200 dark:border-[#30363D] peer-checked:border-orange-500 peer-checked:bg-orange-500/5 hover:border-gray-300 dark:hover:border-[#40464D] transition-all text-center">
                                    <div class="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-2">
                                        <span class="material-symbols-outlined text-orange-500">payments</span>
                                    </div>
                                    <p class="font-medium text-gray-900 dark:text-white text-sm">Cash Pickup</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Office</p>
                                </div>
                            </label>
                        </div>
                        @error('withdrawal_method')
                            <p class="mt-2 text-sm text-red-500">{{ $message }}</p>
                        @enderror
                    </div>

                    {{-- Mobile Money Details --}}
                    <div id="mobileMoneyDetails" class="space-y-4">
                        <div>
                            <label for="mobile_number" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mobile Money Number <span class="text-red-500">*</span>
                            </label>
                            <input type="tel" name="mobile_number" id="mobile_number" 
                                   value="{{ old('mobile_number', auth()->user()->phone_number ?? '') }}"
                                   class="w-full px-4 py-3 bg-white dark:bg-[#21262D] border border-gray-200 dark:border-[#30363D] rounded-xl text-gray-900 dark:text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green @error('mobile_number') border-red-500 @enderror"
                                   placeholder="0700000000">
                            @error('mobile_number')
                                <p class="mt-2 text-sm text-red-500">{{ $message }}</p>
                            @enderror
                            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">MTN or Airtel Money number</p>
                        </div>
                    </div>

                    {{-- Bank Transfer Details --}}
                    <div id="bankTransferDetails" class="space-y-4 hidden">
                        <div>
                            <label for="bank_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Bank Name <span class="text-red-500">*</span>
                            </label>
                            <select name="bank_name" id="bank_name" class="w-full px-4 py-3 bg-white dark:bg-[#21262D] border border-gray-200 dark:border-[#30363D] rounded-xl text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                <option value="">Select bank</option>
                                <option value="Stanbic Bank" {{ old('bank_name') === 'Stanbic Bank' ? 'selected' : '' }}>Stanbic Bank</option>
                                <option value="Centenary Bank" {{ old('bank_name') === 'Centenary Bank' ? 'selected' : '' }}>Centenary Bank</option>
                                <option value="Standard Chartered" {{ old('bank_name') === 'Standard Chartered' ? 'selected' : '' }}>Standard Chartered</option>
                                <option value="dfcu Bank" {{ old('bank_name') === 'dfcu Bank' ? 'selected' : '' }}>dfcu Bank</option>
                                <option value="Equity Bank" {{ old('bank_name') === 'Equity Bank' ? 'selected' : '' }}>Equity Bank</option>
                                <option value="Absa Bank" {{ old('bank_name') === 'Absa Bank' ? 'selected' : '' }}>Absa Bank</option>
                            </select>
                        </div>
                        <div>
                            <label for="bank_account_number" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Account Number <span class="text-red-500">*</span>
                            </label>
                            <input type="text" name="bank_account_number" id="bank_account_number" value="{{ old('bank_account_number') }}"
                                   class="w-full px-4 py-3 bg-white dark:bg-[#21262D] border border-gray-200 dark:border-[#30363D] rounded-xl text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                   placeholder="Enter account number">
                        </div>
                        <div>
                            <label for="bank_account_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Account Name <span class="text-red-500">*</span>
                            </label>
                            <input type="text" name="bank_account_name" id="bank_account_name" value="{{ old('bank_account_name', auth()->user()->name) }}"
                                   class="w-full px-4 py-3 bg-white dark:bg-[#21262D] border border-gray-200 dark:border-[#30363D] rounded-xl text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                   placeholder="Name on account">
                        </div>
                    </div>

                    {{-- Cash Pickup Details --}}
                    <div id="cashDetails" class="hidden">
                        <div class="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                            <p class="text-orange-600 dark:text-orange-400 text-sm font-medium mb-2">Cash Pickup Information</p>
                            <div class="text-xs text-orange-600/80 dark:text-orange-400/80 space-y-1">
                                <p><strong>Location:</strong> TesoTunes Office, Kampala</p>
                                <p><strong>Hours:</strong> Mon-Fri 9AM-5PM, Sat 9AM-1PM</p>
                                <p class="mt-2">You'll receive an SMS with pickup code after approval.</p>
                            </div>
                        </div>
                    </div>

                    {{-- Reason --}}
                    <div>
                        <label for="reason" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Reason for Withdrawal
                        </label>
                        <textarea name="reason" id="reason" rows="3"
                                  class="w-full px-4 py-3 bg-white dark:bg-[#21262D] border border-gray-200 dark:border-[#30363D] rounded-xl text-gray-900 dark:text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green @error('reason') border-red-500 @enderror"
                                  placeholder="Optional: Tell us why you need this withdrawal...">{{ old('reason') }}</textarea>
                        @error('reason')
                            <p class="mt-2 text-sm text-red-500">{{ $message }}</p>
                        @enderror
                    </div>

                    {{-- Submit --}}
                    <div class="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-[#30363D]">
                        <button type="submit" id="submitBtn" {{ $accounts->isEmpty() ? 'disabled' : '' }}
                                class="flex-1 inline-flex items-center justify-center gap-2 bg-brand-green hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-colors">
                            <span class="material-symbols-outlined">send</span>
                            Submit Request
                        </button>
                        <a href="{{ route('sacco.dashboard') }}" class="px-6 py-3 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#21262D] transition-colors">
                            Cancel
                        </a>
                    </div>
                </form>
            </div>

            {{-- Withdrawal Limits Info --}}
            <div class="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-2xl p-5 shadow-sm">
                <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-blue-500">info</span>
                    Withdrawal Limits & Fees
                </h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-500 dark:text-gray-400">Minimum Amount</span>
                        <span class="font-medium text-gray-900 dark:text-white">UGX {{ number_format(config('sacco.minimum_withdrawal', 1000)) }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500 dark:text-gray-400">Processing Time</span>
                        <span class="font-medium text-gray-900 dark:text-white">24-48 hours</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500 dark:text-gray-400">Mobile Money Fee</span>
                        <span class="font-medium text-gray-900 dark:text-white">1%</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500 dark:text-gray-400">Bank Transfer Fee</span>
                        <span class="font-medium text-gray-900 dark:text-white">UGX 5,000</span>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    const minWithdrawal = {{ config('sacco.minimum_withdrawal', 1000) }};
    const accountRadios = document.querySelectorAll('input[name="account_id"]');
    const accountInfo = document.getElementById('accountInfo');
    const displayBalance = document.getElementById('displayBalance');
    const displayAvailable = document.getElementById('displayAvailable');
    const amountInput = document.getElementById('amount');
    const amountWarning = document.getElementById('amountWarning');
    const warningText = document.getElementById('warningText');
    const submitBtn = document.getElementById('submitBtn');

    // Payment method elements
    const methodRadios = document.querySelectorAll('input[name="withdrawal_method"]');
    const mobileMoneyDetails = document.getElementById('mobileMoneyDetails');
    const bankTransferDetails = document.getElementById('bankTransferDetails');
    const cashDetails = document.getElementById('cashDetails');
    const mobileNumberInput = document.getElementById('mobile_number');
    const bankNameSelect = document.getElementById('bank_name');
    const bankAccountInput = document.getElementById('bank_account_number');
    const bankAccountNameInput = document.getElementById('bank_account_name');

    let selectedAvailable = 0;

    // Account selection
    accountRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                const balance = parseFloat(this.dataset.balance);
                const available = parseFloat(this.dataset.available);
                selectedAvailable = available;
                
                displayBalance.textContent = 'UGX ' + balance.toLocaleString();
                displayAvailable.textContent = 'UGX ' + available.toLocaleString();
                accountInfo.classList.remove('hidden');
                
                amountInput.max = available;
                validateAmount();
            }
        });

        // Check if already selected
        if (radio.checked) {
            radio.dispatchEvent(new Event('change'));
        }
    });

    // Amount validation
    amountInput.addEventListener('input', validateAmount);

    function validateAmount() {
        const amount = parseFloat(amountInput.value) || 0;
        amountWarning.classList.add('hidden');
        submitBtn.disabled = false;

        if (amount > 0) {
            if (amount > selectedAvailable && selectedAvailable > 0) {
                showWarning('Exceeds available balance. Maximum: UGX ' + selectedAvailable.toLocaleString());
                submitBtn.disabled = true;
            } else if (amount < minWithdrawal) {
                showWarning('Minimum withdrawal is UGX ' + minWithdrawal.toLocaleString());
                submitBtn.disabled = true;
            }
        }
    }

    function showWarning(message) {
        warningText.textContent = message;
        amountWarning.classList.remove('hidden');
    }

    // Payment method toggle
    function togglePaymentMethod() {
        const selected = document.querySelector('input[name="withdrawal_method"]:checked')?.value;
        
        mobileMoneyDetails.classList.add('hidden');
        bankTransferDetails.classList.add('hidden');
        cashDetails.classList.add('hidden');
        
        mobileNumberInput.removeAttribute('required');
        bankNameSelect.removeAttribute('required');
        bankAccountInput.removeAttribute('required');
        bankAccountNameInput.removeAttribute('required');
        
        if (selected === 'mobile_money') {
            mobileMoneyDetails.classList.remove('hidden');
            mobileNumberInput.setAttribute('required', 'required');
        } else if (selected === 'bank_transfer') {
            bankTransferDetails.classList.remove('hidden');
            bankNameSelect.setAttribute('required', 'required');
            bankAccountInput.setAttribute('required', 'required');
            bankAccountNameInput.setAttribute('required', 'required');
        } else if (selected === 'cash') {
            cashDetails.classList.remove('hidden');
        }
    }

    methodRadios.forEach(radio => {
        radio.addEventListener('change', togglePaymentMethod);
    });

    togglePaymentMethod();
});
</script>
@endpush
@endsection
