@extends('layouts.admin')

@section('title', $campaign->title)

@section('content')
<div class="p-6 bg-slate-50 dark:bg-navy-900 min-h-screen">
    {{-- Header --}}
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
            <a href="{{ route('admin.ojokotau.campaigns.index') }}" class="inline-flex items-center gap-2 text-slate-600 dark:text-navy-300 hover:text-primary dark:hover:text-accent transition-colors mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                </svg>
                Back to Campaigns
            </a>
            <h1 class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ Str::limit($campaign->title, 60) }}</h1>
        </div>
        <div class="flex gap-2">
            @if($campaign->is_verified)
                <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success dark:text-success-light text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    Verified
                </span>
            @endif
            @if($campaign->is_featured)
                <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-warning/10 text-warning dark:text-warning-light text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Featured
                </span>
            @endif
        </div>
    </div>

    {{-- Flash Messages --}}
    @if(session('success'))
        <div class="mb-6 bg-success/10 dark:bg-success/20 border border-success/50 text-success dark:text-success-light px-4 py-3 rounded-lg flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="font-medium">{{ session('success') }}</span>
        </div>
    @endif

    @if(session('error'))
        <div class="mb-6 bg-error/10 dark:bg-error/20 border border-error/50 text-error dark:text-error-light px-4 py-3 rounded-lg flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span class="font-medium">{{ session('error') }}</span>
        </div>
    @endif

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {{-- Main Content --}}
        <div class="lg:col-span-2 space-y-6">
            {{-- Campaign Details --}}
            <div class="bg-white dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-200 dark:border-navy-700">
                    <h2 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Campaign Details</h2>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <span class="text-sm text-slate-500 dark:text-navy-300">Status:</span>
                            @php
                                $statusColors = [
                                    'draft' => 'bg-slate-100 text-slate-600 dark:bg-navy-600 dark:text-navy-100',
                                    'under_review' => 'bg-warning/10 text-warning dark:text-warning-light',
                                    'approved' => 'bg-info/10 text-info dark:text-info-light',
                                    'active' => 'bg-success/10 text-success dark:text-success-light',
                                    'closed' => 'bg-slate-100 text-slate-600 dark:bg-navy-600 dark:text-navy-100',
                                    'rejected' => 'bg-error/10 text-error dark:text-error-light',
                                    'archived' => 'bg-slate-100 text-slate-600 dark:bg-navy-600 dark:text-navy-100',
                                    'needs_revision' => 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
                                ];
                            @endphp
                            <span class="mt-1 inline-block px-2.5 py-1 rounded-full text-xs font-medium {{ $statusColors[$campaign->status] ?? 'bg-slate-100 text-slate-600' }}">
                                {{ ucfirst(str_replace('_', ' ', $campaign->status)) }}
                            </span>
                        </div>
                        <div>
                            <span class="text-sm text-slate-500 dark:text-navy-300">Category:</span>
                            <p class="font-medium text-slate-800 dark:text-navy-50">{{ $campaign->category_label }}</p>
                        </div>
                        <div>
                            <span class="text-sm text-slate-500 dark:text-navy-300">Urgency:</span>
                            <span class="mt-1 inline-block px-2.5 py-1 rounded-full text-xs font-medium {{ $campaign->urgency === 'critical' ? 'bg-error/10 text-error' : ($campaign->urgency === 'high' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info') }}">
                                {{ ucfirst($campaign->urgency) }}
                            </span>
                        </div>
                    </div>

                    <div class="border-t border-slate-200 dark:border-navy-700 pt-6 mb-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <span class="text-sm text-slate-500 dark:text-navy-300">Creator:</span>
                                <p class="font-medium text-slate-800 dark:text-navy-50">{{ $campaign->user->display_name ?? 'N/A' }}</p>
                                <p class="text-sm text-slate-500 dark:text-navy-300">{{ $campaign->user->email ?? '' }}</p>
                            </div>
                            <div>
                                <span class="text-sm text-slate-500 dark:text-navy-300">Created:</span>
                                <p class="font-medium text-slate-800 dark:text-navy-50">{{ $campaign->created_at->format('M d, Y H:i') }}</p>
                                <p class="text-sm text-slate-500 dark:text-navy-300">{{ $campaign->created_at->diffForHumans() }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="border-t border-slate-200 dark:border-navy-700 pt-6 mb-6">
                        <h3 class="text-sm font-semibold text-slate-800 dark:text-navy-50 mb-3">Beneficiary Information</h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <span class="text-sm text-slate-500 dark:text-navy-300">Name:</span>
                                <p class="font-medium text-slate-800 dark:text-navy-50">{{ $campaign->beneficiary_name }}</p>
                            </div>
                            <div>
                                <span class="text-sm text-slate-500 dark:text-navy-300">Type:</span>
                                <p class="font-medium text-slate-800 dark:text-navy-50">{{ ucfirst($campaign->beneficiary_type) }}</p>
                            </div>
                            <div>
                                <span class="text-sm text-slate-500 dark:text-navy-300">Relationship:</span>
                                <p class="font-medium text-slate-800 dark:text-navy-50">{{ $campaign->beneficiary_relationship ?? 'N/A' }}</p>
                            </div>
                        </div>
                    </div>

                    @if($campaign->contact_name)
                    <div class="border-t border-slate-200 dark:border-navy-700 pt-6 mb-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <span class="text-sm text-slate-500 dark:text-navy-300">Contact Person:</span>
                                <p class="font-medium text-slate-800 dark:text-navy-50">{{ $campaign->contact_name }}</p>
                            </div>
                            <div>
                                <span class="text-sm text-slate-500 dark:text-navy-300">Contact Phone:</span>
                                <p class="font-medium text-slate-800 dark:text-navy-50">{{ $campaign->contact_phone ?? 'N/A' }}</p>
                            </div>
                        </div>
                    </div>
                    @endif

                    <div class="border-t border-slate-200 dark:border-navy-700 pt-6">
                        <h3 class="text-sm font-semibold text-slate-800 dark:text-navy-50 mb-3">Description</h3>
                        <p class="text-slate-600 dark:text-navy-200">{{ $campaign->description }}</p>

                        @if($campaign->story)
                        <h3 class="text-sm font-semibold text-slate-800 dark:text-navy-50 mt-6 mb-3">Full Story</h3>
                        <div class="bg-slate-50 dark:bg-navy-900 p-4 rounded-lg text-slate-600 dark:text-navy-200">
                            {!! nl2br(e($campaign->story)) !!}
                        </div>
                        @endif
                    </div>
                </div>
            </div>

            {{-- Mobile Money Info --}}
            <div class="bg-white dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-200 dark:border-navy-700 bg-success/10">
                    <h2 class="text-lg font-semibold text-success dark:text-success-light flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                            <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
                        </svg>
                        Contribution Info (Mobile Money)
                    </h2>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <span class="text-sm text-slate-500 dark:text-navy-300">Network:</span>
                            <p class="text-xl font-bold text-slate-800 dark:text-navy-50 uppercase">{{ $campaign->momo_network }}</p>
                        </div>
                        <div>
                            <span class="text-sm text-slate-500 dark:text-navy-300">Number:</span>
                            <p class="text-xl font-bold text-slate-800 dark:text-navy-50 font-mono">{{ $campaign->momo_number }}</p>
                        </div>
                        <div>
                            <span class="text-sm text-slate-500 dark:text-navy-300">Registered Name:</span>
                            <p class="text-xl font-bold text-slate-800 dark:text-navy-50">{{ $campaign->momo_name }}</p>
                        </div>
                    </div>
                    @if($campaign->target_amount || $campaign->end_date)
                    <div class="border-t border-slate-200 dark:border-navy-700 mt-6 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        @if($campaign->target_amount)
                        <div>
                            <span class="text-sm text-slate-500 dark:text-navy-300">Target Amount:</span>
                            <p class="font-semibold text-slate-800 dark:text-navy-50">UGX {{ number_format($campaign->target_amount) }}</p>
                        </div>
                        @endif
                        @if($campaign->end_date)
                        <div>
                            <span class="text-sm text-slate-500 dark:text-navy-300">End Date:</span>
                            <p class="font-semibold text-slate-800 dark:text-navy-50">{{ $campaign->end_date->format('M d, Y') }}</p>
                        </div>
                        @endif
                    </div>
                    @endif
                </div>
            </div>

            {{-- Supporting Documents --}}
            <div class="bg-white dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-200 dark:border-navy-700">
                    <h2 class="text-lg font-semibold text-slate-800 dark:text-navy-50 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                        </svg>
                        Supporting Documents ({{ $campaign->documents->count() }})
                    </h2>
                </div>
                <div class="p-6">
                    @forelse($campaign->documents as $doc)
                    <div class="flex justify-between items-center py-3 {{ !$loop->last ? 'border-b border-slate-200 dark:border-navy-700' : '' }}">
                        <div>
                            <a href="{{ $doc->file_path }}" target="_blank" class="font-medium text-primary dark:text-accent hover:underline">
                                {{ $doc->title }}
                            </a>
                            <p class="text-sm text-slate-500 dark:text-navy-300">{{ $doc->type }} • {{ number_format($doc->file_size / 1024, 1) }} KB</p>
                        </div>
                        <div>
                            @if($doc->is_verified)
                                <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium">✓ Verified</span>
                            @else
                                <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-navy-600 dark:text-navy-200 text-xs font-medium">Unverified</span>
                            @endif
                        </div>
                    </div>
                    @empty
                    <p class="text-slate-500 dark:text-navy-300">No documents uploaded.</p>
                    @endforelse
                </div>
            </div>

            {{-- Admin Activity Log --}}
            <div class="bg-white dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-200 dark:border-navy-700">
                    <h2 class="text-lg font-semibold text-slate-800 dark:text-navy-50 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                        </svg>
                        Admin Activity Log
                    </h2>
                </div>
                <div class="p-6">
                    @forelse($campaign->adminLogs as $log)
                    <div class="py-3 {{ !$loop->last ? 'border-b border-slate-200 dark:border-navy-700' : '' }}">
                        <div class="flex justify-between items-start">
                            <span class="font-medium text-slate-800 dark:text-navy-50">{{ $log->admin->display_name ?? 'System' }}</span>
                            <span class="text-sm text-slate-500 dark:text-navy-300">{{ $log->created_at->diffForHumans() }}</span>
                        </div>
                        <span class="inline-block mt-1 px-2 py-0.5 rounded bg-info/10 text-info text-xs font-medium">{{ str_replace('_', ' ', $log->action) }}</span>
                        @if($log->notes)
                        <p class="mt-2 text-sm text-slate-500 dark:text-navy-300">{{ $log->notes }}</p>
                        @endif
                    </div>
                    @empty
                    <p class="text-slate-500 dark:text-navy-300">No admin activity recorded yet.</p>
                    @endforelse
                </div>
            </div>
        </div>

        {{-- Sidebar --}}
        <div class="space-y-6">
            {{-- Actions Card --}}
            <div class="bg-white dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-200 dark:border-navy-700 bg-primary/10">
                    <h2 class="text-lg font-semibold text-primary dark:text-primary-light flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                        </svg>
                        Actions
                    </h2>
                </div>
                <div class="p-6 space-y-4">
                    @if($campaign->status === 'under_review')
                        <form action="{{ route('admin.ojokotau.campaigns.approve', $campaign) }}" method="POST">
                            @csrf
                            <textarea name="notes" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 text-slate-700 dark:text-navy-100 placeholder-slate-400 dark:placeholder-navy-300 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors mb-3" placeholder="Approval notes (optional)..." rows="2"></textarea>
                            <button type="submit" class="w-full px-4 py-2.5 rounded-lg bg-success hover:bg-success-focus text-white font-medium transition-colors flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                </svg>
                                Approve & Activate
                            </button>
                        </form>

                        <form action="{{ route('admin.ojokotau.campaigns.request-revision', $campaign) }}" method="POST">
                            @csrf
                            <textarea name="feedback" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 text-slate-700 dark:text-navy-100 placeholder-slate-400 dark:placeholder-navy-300 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors mb-3" placeholder="What changes are needed? (required)..." rows="2" required></textarea>
                            <button type="submit" class="w-full px-4 py-2.5 rounded-lg bg-warning hover:bg-warning-focus text-white font-medium transition-colors flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                                </svg>
                                Request Revision
                            </button>
                        </form>

                        <form action="{{ route('admin.ojokotau.campaigns.reject', $campaign) }}" method="POST">
                            @csrf
                            <textarea name="reason" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 text-slate-700 dark:text-navy-100 placeholder-slate-400 dark:placeholder-navy-300 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors mb-3" placeholder="Rejection reason (required)..." rows="2" required></textarea>
                            <button type="submit" class="w-full px-4 py-2.5 rounded-lg bg-error hover:bg-error-focus text-white font-medium transition-colors flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                                Reject Campaign
                            </button>
                        </form>
                    @endif

                    @if($campaign->status === 'needs_revision')
                        <div class="bg-warning/10 border border-warning/30 rounded-lg p-4">
                            <p class="font-semibold text-warning dark:text-warning-light flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                                </svg>
                                Revision Requested
                            </p>
                            <p class="text-sm text-slate-600 dark:text-navy-200 mt-1">{{ $campaign->revision_requested_at?->format('M d, Y H:i') }}</p>
                            @if($campaign->revision_feedback)
                                <p class="mt-2 text-sm text-slate-600 dark:text-navy-200">{{ $campaign->revision_feedback }}</p>
                            @endif
                        </div>
                        <p class="text-sm text-slate-500 dark:text-navy-300">Waiting for campaign owner to make changes and resubmit.</p>
                    @endif

                    @if($campaign->status === 'active')
                        @if(!$campaign->is_verified)
                        <form action="{{ route('admin.ojokotau.campaigns.verify', $campaign) }}" method="POST">
                            @csrf
                            <textarea name="notes" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 text-slate-700 dark:text-navy-100 placeholder-slate-400 dark:placeholder-navy-300 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors mb-3" placeholder="Verification notes..." rows="2"></textarea>
                            <button type="submit" class="w-full px-4 py-2.5 rounded-lg bg-info hover:bg-info-focus text-white font-medium transition-colors flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                </svg>
                                Mark as Verified
                            </button>
                        </form>
                        @else
                        <div class="bg-success/10 border border-success/30 rounded-lg p-4">
                            <p class="font-semibold text-success dark:text-success-light flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                </svg>
                                Verified
                            </p>
                            <p class="text-sm text-slate-600 dark:text-navy-200 mt-1">{{ $campaign->verified_at?->format('M d, Y H:i') }}</p>
                        </div>
                        @endif

                        @if(!$campaign->is_featured)
                        <form action="{{ route('admin.ojokotau.campaigns.feature', $campaign) }}" method="POST">
                            @csrf
                            <button type="submit" class="w-full px-4 py-2.5 rounded-lg bg-warning hover:bg-warning-focus text-white font-medium transition-colors flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Feature Campaign
                            </button>
                        </form>
                        @else
                        <form action="{{ route('admin.ojokotau.campaigns.unfeature', $campaign) }}" method="POST">
                            @csrf
                            <button type="submit" class="w-full px-4 py-2.5 rounded-lg border-2 border-warning text-warning hover:bg-warning/10 font-medium transition-colors flex items-center justify-center gap-2">
                                Remove from Featured
                            </button>
                        </form>
                        @endif

                        <div class="border-t border-slate-200 dark:border-navy-700 pt-4">
                            <form action="{{ route('admin.ojokotau.campaigns.close', $campaign) }}" method="POST">
                                @csrf
                                <textarea name="closure_note" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 text-slate-700 dark:text-navy-100 placeholder-slate-400 dark:placeholder-navy-300 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 transition-colors mb-3" placeholder="Closure note..." rows="2"></textarea>
                                <button type="submit" onclick="return confirm('Are you sure you want to close this campaign?')" class="w-full px-4 py-2.5 rounded-lg bg-slate-500 hover:bg-slate-600 text-white font-medium transition-colors">
                                    Close Campaign
                                </button>
                            </form>
                        </div>
                    @endif

                    @if(in_array($campaign->status, ['draft', 'closed', 'rejected', 'archived']))
                        <div class="bg-slate-100 dark:bg-navy-700 rounded-lg p-4">
                            <p class="font-semibold text-slate-700 dark:text-navy-100">Status: {{ ucfirst(str_replace('_', ' ', $campaign->status)) }}</p>
                            <p class="text-sm text-slate-500 dark:text-navy-300 mt-1">No actions available for this status.</p>
                        </div>
                    @endif
                </div>
            </div>

            {{-- Statistics Card --}}
            <div class="bg-white dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-200 dark:border-navy-700">
                    <h2 class="text-lg font-semibold text-slate-800 dark:text-navy-50 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                        Statistics
                    </h2>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-2 gap-4 text-center">
                        <div class="p-4 bg-slate-50 dark:bg-navy-900 rounded-lg">
                            <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ number_format($campaign->view_count) }}</p>
                            <p class="text-sm text-slate-500 dark:text-navy-300">Views</p>
                        </div>
                        <div class="p-4 bg-slate-50 dark:bg-navy-900 rounded-lg">
                            <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ number_format($campaign->share_count) }}</p>
                            <p class="text-sm text-slate-500 dark:text-navy-300">Shares</p>
                        </div>
                        <div class="p-4 bg-slate-50 dark:bg-navy-900 rounded-lg">
                            <p class="text-2xl font-bold text-success dark:text-success-light">{{ $campaign->pledges->count() }}</p>
                            <p class="text-sm text-slate-500 dark:text-navy-300">Pledges</p>
                        </div>
                        <div class="p-4 bg-slate-50 dark:bg-navy-900 rounded-lg">
                            <p class="text-2xl font-bold text-primary dark:text-primary-light">{{ $campaign->endorsements->count() }}</p>
                            <p class="text-sm text-slate-500 dark:text-navy-300">Endorsements</p>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Endorsements Card --}}
            <div class="bg-white dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-200 dark:border-navy-700">
                    <h2 class="text-lg font-semibold text-slate-800 dark:text-navy-50 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        Endorsements ({{ $campaign->endorsements->count() }})
                    </h2>
                </div>
                <div class="p-6 max-h-72 overflow-y-auto">
                    @forelse($campaign->endorsements as $endorsement)
                    <div class="py-3 {{ !$loop->last ? 'border-b border-slate-200 dark:border-navy-700' : '' }}">
                        <div class="flex justify-between items-center">
                            <span class="font-medium text-slate-800 dark:text-navy-50">{{ $endorsement->user->display_name ?? 'Anonymous' }}</span>
                            @if($endorsement->is_verified)
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-success/10 text-success text-xs">✓</span>
                            @endif
                        </div>
                        <p class="text-sm text-slate-500 dark:text-navy-300">{{ ucfirst(str_replace('_', ' ', $endorsement->endorser_type)) }}</p>
                        @if($endorsement->message)
                        <p class="text-sm text-slate-600 dark:text-navy-200 mt-1">{{ Str::limit($endorsement->message, 100) }}</p>
                        @endif
                    </div>
                    @empty
                    <p class="text-slate-500 dark:text-navy-300">No endorsements yet.</p>
                    @endforelse
                </div>
            </div>

            {{-- Recent Pledges Card --}}
            <div class="bg-white dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-200 dark:border-navy-700">
                    <h2 class="text-lg font-semibold text-slate-800 dark:text-navy-50 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                        </svg>
                        Recent Pledges ({{ $campaign->pledges->count() }})
                    </h2>
                </div>
                <div class="p-6 max-h-60 overflow-y-auto">
                    @forelse($campaign->pledges->take(10) as $pledge)
                    <div class="py-3 {{ !$loop->last ? 'border-b border-slate-200 dark:border-navy-700' : '' }}">
                        <span class="font-medium text-slate-800 dark:text-navy-50">{{ $pledge->is_anonymous ? 'Anonymous' : ($pledge->user->display_name ?? 'Unknown') }}</span>
                        <p class="text-sm text-slate-500 dark:text-navy-300">{{ $pledge->created_at->diffForHumans() }}</p>
                        @if($pledge->message)
                        <p class="text-sm text-slate-600 dark:text-navy-200 mt-1">{{ Str::limit($pledge->message, 80) }}</p>
                        @endif
                    </div>
                    @empty
                    <p class="text-slate-500 dark:text-navy-300">No pledges yet.</p>
                    @endforelse
                </div>
            </div>

            {{-- Comments Moderation Card --}}
            <div class="bg-white dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-200 dark:border-navy-700">
                    <h2 class="text-lg font-semibold text-slate-800 dark:text-navy-50 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
                        </svg>
                        Comments ({{ $campaign->comments->count() ?? 0 }})
                    </h2>
                </div>
                <div class="p-6 max-h-96 overflow-y-auto">
                    @forelse($campaign->comments ?? [] as $comment)
                    <div class="py-3 {{ !$loop->last ? 'border-b border-slate-200 dark:border-navy-700' : '' }} {{ $comment->is_hidden ? 'opacity-50' : '' }}">
                        <div class="flex justify-between items-start gap-2">
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <span class="font-medium text-slate-800 dark:text-navy-50">{{ $comment->user->display_name ?? 'Unknown' }}</span>
                                    @if($comment->is_pinned)
                                        <span class="inline-flex items-center px-1.5 py-0.5 rounded bg-warning/10 text-warning text-xs">📌 Pinned</span>
                                    @endif
                                    @if($comment->is_hidden)
                                        <span class="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 dark:bg-navy-600 text-slate-600 dark:text-navy-200 text-xs">Hidden</span>
                                    @endif
                                </div>
                                <p class="text-xs text-slate-500 dark:text-navy-300">{{ $comment->created_at->diffForHumans() }}</p>
                            </div>
                            <div class="flex items-center gap-1">
                                @if(!$comment->is_pinned)
                                <form action="{{ route('admin.ojokotau.comments.pin', $comment) }}" method="POST">
                                    @csrf
                                    <button type="submit" class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-navy-700 text-slate-500 dark:text-navy-300 transition-colors" title="Pin">📌</button>
                                </form>
                                @else
                                <form action="{{ route('admin.ojokotau.comments.unpin', $comment) }}" method="POST">
                                    @csrf
                                    <button type="submit" class="p-1.5 rounded bg-warning/10 text-warning transition-colors" title="Unpin">📌</button>
                                </form>
                                @endif

                                @if(!$comment->is_hidden)
                                <form action="{{ route('admin.ojokotau.comments.hide', $comment) }}" method="POST">
                                    @csrf
                                    <button type="submit" class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-navy-700 text-slate-500 dark:text-navy-300 transition-colors" title="Hide">👁️</button>
                                </form>
                                @else
                                <form action="{{ route('admin.ojokotau.comments.unhide', $comment) }}" method="POST">
                                    @csrf
                                    <button type="submit" class="p-1.5 rounded bg-slate-200 dark:bg-navy-600 text-slate-600 dark:text-navy-200 transition-colors" title="Unhide">👁️</button>
                                </form>
                                @endif

                                <form action="{{ route('admin.ojokotau.comments.delete', $comment) }}" method="POST" onsubmit="return confirm('Delete this comment permanently?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="p-1.5 rounded hover:bg-error/10 text-error transition-colors" title="Delete">🗑️</button>
                                </form>
                            </div>
                        </div>
                        <p class="text-sm text-slate-600 dark:text-navy-200 mt-2">{{ $comment->content }}</p>
                        @if($comment->hidden_reason)
                        <p class="text-xs text-slate-500 dark:text-navy-300 mt-1 italic">Hidden reason: {{ $comment->hidden_reason }}</p>
                        @endif
                    </div>
                    @empty
                    <p class="text-slate-500 dark:text-navy-300">No comments yet.</p>
                    @endforelse
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
