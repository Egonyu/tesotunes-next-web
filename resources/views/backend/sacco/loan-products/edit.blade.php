@extends('layouts.admin')

@section('title', 'Edit Loan Product')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
            <a href="{{ route('admin.sacco.loan-products.index') }}" 
               class="inline-flex items-center justify-center size-10 bg-slate-200 dark:bg-navy-600 text-slate-700 dark:text-navy-100 rounded-lg hover:bg-slate-300 transition">
                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </a>
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Edit Loan Product</h1>
                <p class="text-slate-600 dark:text-navy-300 mt-1">{{ $product->name }}</p>
            </div>
        </div>
        <span class="px-3 py-1.5 text-sm font-medium rounded-lg {{ $product->is_active ? 'bg-success/10 text-success' : 'bg-slate-500/10 text-slate-500' }}">
            {{ $product->is_active ? 'Active' : 'Inactive' }}
        </span>
    </div>

    <form action="{{ route('admin.sacco.loan-products.update', $product) }}" method="POST">
        @csrf
        @method('PUT')
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            <!-- Basic Information -->
            <div class="lg:col-span-2 card p-6">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Basic Information</h3>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">
                            Product Name <span class="text-red-500">*</span>
                        </label>
                        <input type="text" name="name" value="{{ old('name', $product->name) }}" required
                               class="w-full px-4 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary">
                        @error('name')
                            <p class="text-xs text-red-500 mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">
                            Description
                        </label>
                        <textarea name="description" rows="3"
                                  class="w-full px-4 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary">{{ old('description', $product->description) }}</textarea>
                        @error('description')
                            <p class="text-xs text-red-500 mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Loan Amount Range -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">
                                Minimum Amount (UGX) <span class="text-red-500">*</span>
                            </label>
                            <input type="number" name="min_amount" value="{{ old('min_amount', $product->min_amount) }}" required min="0" step="1000"
                                   class="w-full px-4 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary">
                            @error('min_amount')
                                <p class="text-xs text-red-500 mt-1">{{ $message }}</p>
                            @enderror
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">
                                Maximum Amount (UGX) <span class="text-red-500">*</span>
                            </label>
                            <input type="number" name="max_amount" value="{{ old('max_amount', $product->max_amount) }}" required min="0" step="1000"
                                   class="w-full px-4 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary">
                            @error('max_amount')
                                <p class="text-xs text-red-500 mt-1">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>

                    <!-- Interest Configuration -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">
                                Interest Rate (%) <span class="text-red-500">*</span>
                            </label>
                            <input type="number" name="interest_rate" value="{{ old('interest_rate', $product->interest_rate) }}" required min="0" max="100" step="0.1"
                                   class="w-full px-4 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary">
                            @error('interest_rate')
                                <p class="text-xs text-red-500 mt-1">{{ $message }}</p>
                            @enderror
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">
                                Interest Type <span class="text-red-500">*</span>
                            </label>
                            <select name="interest_type" required
                                    class="w-full px-4 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary">
                                <option value="monthly" {{ old('interest_type', $product->interest_type) === 'monthly' ? 'selected' : '' }}>Monthly</option>
                                <option value="yearly" {{ old('interest_type', $product->interest_type) === 'yearly' ? 'selected' : '' }}>Yearly</option>
                            </select>
                            @error('interest_type')
                                <p class="text-xs text-red-500 mt-1">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>

                    <!-- Duration Range -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">
                                Minimum Duration (months) <span class="text-red-500">*</span>
                            </label>
                            <input type="number" name="min_duration_months" value="{{ old('min_duration_months', $product->min_duration_months) }}" required min="1" max="120"
                                   class="w-full px-4 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary">
                            @error('min_duration_months')
                                <p class="text-xs text-red-500 mt-1">{{ $message }}</p>
                            @enderror
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">
                                Maximum Duration (months) <span class="text-red-500">*</span>
                            </label>
                            <input type="number" name="max_duration_months" value="{{ old('max_duration_months', $product->max_duration_months) }}" required min="1" max="120"
                                   class="w-full px-4 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary">
                            @error('max_duration_months')
                                <p class="text-xs text-red-500 mt-1">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>
                </div>
            </div>

            <!-- Additional Settings -->
            <div class="space-y-4">
                <!-- Fees & Penalties -->
                <div class="card p-6">
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Fees & Penalties</h3>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">
                                Processing Fee (%)
                            </label>
                            <input type="number" name="processing_fee_percentage" value="{{ old('processing_fee_percentage', $product->processing_fee_percentage) }}" min="0" max="100" step="0.1"
                                   class="w-full px-4 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary">
                            @error('processing_fee_percentage')
                                <p class="text-xs text-red-500 mt-1">{{ $message }}</p>
                            @enderror
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">
                                Penalty Rate (%)
                            </label>
                            <input type="number" name="penalty_rate" value="{{ old('penalty_rate', $product->penalty_rate) }}" min="0" max="100" step="0.1"
                                   class="w-full px-4 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary">
                            @error('penalty_rate')
                                <p class="text-xs text-red-500 mt-1">{{ $message }}</p>
                            @enderror
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">
                                Grace Period (days)
                            </label>
                            <input type="number" name="grace_period_days" value="{{ old('grace_period_days', $product->grace_period_days) }}" min="0" max="30"
                                   class="w-full px-4 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary">
                            @error('grace_period_days')
                                <p class="text-xs text-red-500 mt-1">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>
                </div>

                <!-- Requirements -->
                <div class="card p-6">
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Requirements</h3>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">
                                Minimum Guarantors <span class="text-red-500">*</span>
                            </label>
                            <input type="number" name="min_guarantors" value="{{ old('min_guarantors', $product->min_guarantors) }}" required min="0" max="10"
                                   class="w-full px-4 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary">
                            @error('min_guarantors')
                                <p class="text-xs text-red-500 mt-1">{{ $message }}</p>
                            @enderror
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">
                                Collateral Required <span class="text-red-500">*</span>
                            </label>
                            <select name="collateral_required" required
                                    onchange="document.getElementById('collateralPercentage').style.display = this.value === '1' ? 'block' : 'none'"
                                    class="w-full px-4 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary">
                                <option value="0" {{ old('collateral_required', $product->collateral_required) == 0 ? 'selected' : '' }}>No</option>
                                <option value="1" {{ old('collateral_required', $product->collateral_required) == 1 ? 'selected' : '' }}>Yes</option>
                            </select>
                            @error('collateral_required')
                                <p class="text-xs text-red-500 mt-1">{{ $message }}</p>
                            @enderror
                        </div>

                        <div id="collateralPercentage" style="display: {{ old('collateral_required', $product->collateral_required) == 1 ? 'block' : 'none' }}">
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">
                                Collateral Percentage (%)
                            </label>
                            <input type="number" name="collateral_percentage" value="{{ old('collateral_percentage', $product->collateral_percentage) }}" min="0" max="100" step="1"
                                   class="w-full px-4 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary">
                            @error('collateral_percentage')
                                <p class="text-xs text-red-500 mt-1">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>
                </div>

                <!-- Usage Statistics -->
                <div class="card p-6">
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Usage Statistics</h3>
                    
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-slate-600 dark:text-navy-300">Total Loans Issued</span>
                            <span class="text-sm font-bold text-slate-800 dark:text-navy-50">{{ $product->loans()->count() }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-slate-600 dark:text-navy-300">Active Loans</span>
                            <span class="text-sm font-bold text-slate-800 dark:text-navy-50">{{ $product->loans()->where('status', 'active')->count() }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-slate-600 dark:text-navy-300">Created</span>
                            <span class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $product->created_at->format('M d, Y') }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-slate-600 dark:text-navy-300">Last Updated</span>
                            <span class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $product->updated_at->diffForHumans() }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-end gap-3 mt-6">
            <a href="{{ route('admin.sacco.loan-products.index') }}" 
               class="px-6 py-2 bg-slate-200 dark:bg-navy-600 text-slate-700 dark:text-navy-100 rounded-lg hover:bg-slate-300 transition">
                Cancel
            </a>
            <button type="submit" 
                    class="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Update Loan Product
            </button>
        </div>
    </form>
</div>
@endsection
