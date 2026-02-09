@extends('layouts.admin')

@section('title', 'Review Artist Application - ' . $artist->stage_name)

@section('content')
<div class="flex flex-col space-y-6" x-data="{ showApproveModal: false, showRejectModal: false, showRequestInfoModal: false }">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div>
            <div class="flex items-center gap-3 mb-2">
                <a href="{{ route('admin.artist-verification.index') }}" 
                   class="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    <span class="material-icons-round">arrow_back</span>
                </a>
                <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Review Artist Application</h1>
            </div>
            <p class="text-slate-600 dark:text-slate-400">Submitted {{ $artist->created_at->diffForHumans() }}</p>
        </div>

        <!-- Quick Actions -->
        <div class="flex gap-3">
            <!-- Export PDF Button -->
            <a href="{{ route('admin.artist-verification.export-pdf', $artist->slug) }}" 
               class="btn bg-slate-700 hover:bg-slate-800 text-white flex items-center gap-2"
               target="_blank">
                <span class="material-icons-round text-sm">picture_as_pdf</span>
                Export PDF
            </a>

            @if($artist->verification_status === 'pending' || $artist->verification_status === 'more_info_required')
                <button @click="showApproveModal = true" 
                        class="btn bg-success hover:bg-success-focus text-white flex items-center gap-2">
                    <span class="material-icons-round text-sm">check_circle</span>
                    Approve
                </button>
                <button @click="showRejectModal = true"
                        class="btn bg-error hover:bg-error-focus text-white flex items-center gap-2">
                    <span class="material-icons-round text-sm">cancel</span>
                    Reject
                </button>
                <button @click="showRequestInfoModal = true"
                        class="btn bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2">
                            <span class="material-icons-round text-sm">info</span>
                    Request More Info
                </button>
            @endif
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Artist Details -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Basic Info -->
            <div class="bg-white rounded-lg p-6 shadow-sm dark:bg-navy-800 border border-slate-200 dark:border-navy-600">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-icons-round">person</span>
                    Basic Information
                </h3>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-slate-600 dark:text-slate-400 text-sm mb-1">Stage Name</p>
                        <p class="text-slate-900 dark:text-white font-medium">{{ $artist->stage_name }}</p>
                    </div>
                    <div>
                        <p class="text-slate-600 dark:text-slate-400 text-sm mb-1">Primary Genre</p>
                        <p class="text-slate-900 dark:text-white font-medium">{{ $artist->primaryGenre->name ?? 'N/A' }}</p>
                    </div>
                    <div>
                        <p class="text-slate-600 dark:text-slate-400 text-sm mb-1">Email</p>
                        <p class="text-slate-900 dark:text-white">{{ $user->email }}</p>
                    </div>
                    <div>
                        <p class="text-slate-600 dark:text-slate-400 text-sm mb-1">Phone</p>
                        <p class="text-slate-900 dark:text-white">{{ $user->phone_number ?? 'Not provided' }}</p>
                    </div>
                </div>

                @if($artist->bio)
                    <div class="mt-4 pt-4 border-t border-slate-200 dark:border-navy-600">
                        <p class="text-slate-600 dark:text-slate-400 text-sm mb-2">Artist Bio</p>
                        <p class="text-slate-700 dark:text-slate-300">{{ $artist->bio }}</p>
                    </div>
                @endif

                <!-- Social Links -->
                @if($user->facebook_url || $user->instagram_url || $user->twitter_url || $user->youtube_url)
                    <div class="mt-4 pt-4 border-t border-slate-200 dark:border-navy-600">
                        <p class="text-slate-600 dark:text-slate-400 text-sm mb-3">Social Media</p>
                        <div class="flex flex-wrap gap-2">
                            @if($user->facebook_url)
                                <a href="{{ $user->facebook_url }}" target="_blank" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">Facebook</a>
                            @endif
                            @if($user->instagram_url)
                                <a href="{{ $user->instagram_url }}" target="_blank" class="px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm">Instagram</a>
                            @endif
                            @if($user->twitter_url)
                                <a href="{{ $user->twitter_url }}" target="_blank" class="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-sm">Twitter</a>
                            @endif
                            @if($user->youtube_url)
                                <a href="{{ $user->youtube_url }}" target="_blank" class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">YouTube</a>
                            @endif
                        </div>
                    </div>
                @endif
            </div>

            <!-- KYC Documents -->
            <div class="bg-white rounded-lg p-6 shadow-sm dark:bg-navy-800 border border-slate-200 dark:border-navy-600">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-icons-round">verified_user</span>
                    KYC Documents
                </h3>

                @if($kycDocuments->count() > 0)
                    <div class="space-y-4">
                        @foreach($kycDocuments as $doc)
                            <div class="bg-slate-50 dark:bg-navy-700 rounded-lg p-4 border border-slate-200 dark:border-navy-600">
                                <div class="flex items-start justify-between mb-3">
                                    <div>
                                        <p class="text-slate-900 dark:text-white font-medium mb-1">{{ $doc->type_label }}</p>
                                        <p class="text-slate-600 dark:text-slate-400 text-sm">{{ $doc->document_number ?? 'No number provided' }}</p>
                                    </div>
                                    <div>
                                        @if($doc->status === 'verified')
                                            <span class="inline-flex items-center gap-1 bg-success/10 border border-success text-success px-3 py-1 rounded-full text-xs font-medium">
                                                <span class="material-icons-round text-xs">check_circle</span>
                                                Verified
                                            </span>
                                        @elseif($doc->status === 'pending')
                                            <span class="inline-flex items-center gap-1 bg-warning/10 border border-warning text-warning px-3 py-1 rounded-full text-xs font-medium">
                                                <span class="material-icons-round text-xs">schedule</span>
                                                Pending
                                            </span>
                                        @elseif($doc->status === 'rejected')
                                            <span class="inline-flex items-center gap-1 bg-error/10 border border-error text-error px-3 py-1 rounded-full text-xs font-medium">
                                                <span class="material-icons-round text-xs">cancel</span>
                                                Rejected
                                            </span>
                                        @endif
                                    </div>
                                </div>

                                <!-- Document Preview/Actions -->
                                <div class="flex gap-2">
                                    <a href="{{ route('admin.artist-verification.document.view', [$artist->slug, $doc->id]) }}" 
                                       target="_blank"
                                       class="flex-1 btn bg-primary hover:bg-primary-focus text-white text-sm">
                                        <span class="flex items-center justify-center gap-2">
                                            <span class="material-icons-round text-sm">visibility</span>
                                            View
                                        </span>
                                    </a>
                                    <a href="{{ route('admin.artist-verification.document.download', [$artist->slug, $doc->id]) }}" 
                                       download="{{ $doc->file_name }}"
                                       class="flex-1 btn bg-success hover:bg-success-focus text-white text-sm">
                                        <span class="flex items-center justify-center gap-2">
                                            <span class="material-icons-round text-sm">download</span>
                                            Download
                                        </span>
                                    </a>
                                </div>

                                @if($doc->rejection_reason)
                                    <div class="mt-3 p-3 bg-error/10 border border-error/50 rounded">
                                        <p class="text-error text-sm">{{ $doc->rejection_reason }}</p>
                                    </div>
                                @endif
                            </div>
                        @endforeach
                    </div>
                @else
                    <div class="text-center py-8">
                        <span class="material-icons-round text-4xl text-slate-400 mb-2">description</span>
                        <p class="text-slate-600 dark:text-slate-400">No documents uploaded yet</p>
                    </div>
                @endif
            </div>

            <!-- Payment Info -->
            <div class="bg-white rounded-lg p-6 shadow-sm dark:bg-navy-800 border border-slate-200 dark:border-navy-600">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-icons-round">payments</span>
                    Payment Information
                </h3>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-slate-600 dark:text-slate-400 text-sm mb-1">Mobile Money Provider</p>
                        <p class="text-slate-900 dark:text-white font-medium">{{ strtoupper($user->mobile_money_provider ?? 'Not set') }}</p>
                    </div>
                    <div>
                        <p class="text-slate-600 dark:text-slate-400 text-sm mb-1">Mobile Money Number</p>
                        <p class="text-slate-900 dark:text-white">{{ $user->mobile_money_number ?? 'Not provided' }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Column: Status & Activity -->
        <div class="space-y-6">
            <!-- Current Status -->
            <div class="bg-white rounded-lg p-6 shadow-sm dark:bg-navy-800 border border-slate-200 dark:border-navy-600">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Current Status</h3>

                <div class="text-center py-4">
                    @if($artist->verification_status === 'pending')
                        <div class="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span class="material-icons-round text-warning text-2xl">schedule</span>
                        </div>
                        <p class="text-warning font-semibold mb-1">Pending Review</p>
                    @elseif($artist->verification_status === 'verified')
                        <div class="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span class="material-icons-round text-success text-2xl">check_circle</span>
                        </div>
                        <p class="text-success font-semibold mb-1">Verified</p>
                    @elseif($artist->verification_status === 'rejected')
                        <div class="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span class="material-icons-round text-error text-2xl">cancel</span>
                        </div>
                        <p class="text-error font-semibold mb-1">Rejected</p>
                    @elseif($artist->verification_status === 'more_info_required')
                        <div class="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span class="material-icons-round text-orange-500 text-2xl">info</span>
                        </div>
                        <p class="text-orange-500 font-semibold mb-1">More Info Required</p>
                    @endif
                    <p class="text-slate-600 dark:text-slate-400 text-sm">{{ $artist->updated_at->diffForHumans() }}</p>
                </div>

                @if($artist->rejection_reason)
                    <div class="mt-4 p-3 bg-error/10 border border-error/50 rounded">
                        <p class="text-error text-sm">{{ $artist->rejection_reason }}</p>
                    </div>
                @endif
            </div>

            <!-- Profile Completion -->
            <div class="bg-white rounded-lg p-6 shadow-sm dark:bg-navy-800 border border-slate-200 dark:border-navy-600">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Profile Completion</h3>
                
                <div class="mb-3">
                    <div class="flex justify-between text-sm mb-1">
                        <span class="text-slate-600 dark:text-slate-400">Progress</span>
                        <span class="text-slate-900 dark:text-white font-medium">{{ $user->profile_completion_percentage ?? 0 }}%</span>
                    </div>
                    <div class="w-full bg-slate-200 dark:bg-navy-600 rounded-full h-2">
                        <div class="bg-success h-2 rounded-full" style="width: {{ $user->profile_completion_percentage ?? 0 }}%"></div>
                    </div>
                </div>

                <div class="space-y-2 text-sm">
                    <div class="flex items-center gap-2">
                        <span class="material-icons-round text-xs {{ $user->email ? 'text-success' : 'text-slate-400' }}">{{ $user->email ? 'check_circle' : 'cancel' }}</span>
                        <span class="text-slate-700 dark:text-slate-300">Email {{ $user->email_verified_at ? 'verified' : 'not verified' }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="material-icons-round text-xs {{ $user->phone_verified_at ? 'text-success' : 'text-slate-400' }}">{{ $user->phone_verified_at ? 'check_circle' : 'cancel' }}</span>
                        <span class="text-slate-700 dark:text-slate-300">Phone {{ $user->phone_verified_at ? 'verified' : 'not verified' }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="material-icons-round text-xs {{ $user->avatar ? 'text-success' : 'text-slate-400' }}">{{ $user->avatar ? 'check_circle' : 'cancel' }}</span>
                        <span class="text-slate-700 dark:text-slate-300">Profile photo</span>
                    </div>
                </div>
            </div>

            <!-- Admin Notes (if verified or rejected) -->
            @if($artist->verifiedBy)
                <div class="bg-white rounded-lg p-6 shadow-sm dark:bg-navy-800 border border-slate-200 dark:border-navy-600">
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Review Details</h3>
                    
                    <div class="text-sm">
                        <p class="text-slate-600 dark:text-slate-400 mb-1">Reviewed by</p>
                        <p class="text-slate-900 dark:text-white font-medium mb-3">{{ $artist->verifiedBy->name }}</p>
                        
                        <p class="text-slate-600 dark:text-slate-400 mb-1">Review date</p>
                        <p class="text-slate-900 dark:text-white">{{ $artist->verified_at?->format('M j, Y g:i A') }}</p>
                    </div>
                </div>
            @endif
        </div>
    </div>

    <!-- Approve Modal -->
    <div x-show="showApproveModal" x-cloak class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4">
            <div class="fixed inset-0 bg-black opacity-75" @click="showApproveModal = false"></div>
            
            <div class="relative bg-white dark:bg-navy-800 rounded-lg max-w-md w-full p-6 border border-slate-200 dark:border-navy-600">
                <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Approve Artist Application</h3>
                
                <form method="POST" action="{{ route('admin.artist-verification.approve', $artist) }}">
                    @csrf
                    
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            name="notes"
                            rows="3"
                            class="form-textarea w-full"
                            placeholder="Add any notes for the artist..."
                        ></textarea>
                    </div>

                    <div class="flex gap-3">
                        <button type="button" @click="showApproveModal = false"
                                class="flex-1 btn border-slate-300 dark:border-navy-450 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-navy-500">
                            Cancel
                        </button>
                        <button type="submit"
                                class="flex-1 btn bg-success hover:bg-success-focus text-white">
                            Approve Artist
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Reject Modal -->
    <div x-show="showRejectModal" x-cloak class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4">
            <div class="fixed inset-0 bg-black opacity-75" @click="showRejectModal = false"></div>
            
            <div class="relative bg-white dark:bg-navy-800 rounded-lg max-w-md w-full p-6 border border-slate-200 dark:border-navy-600">
                <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Reject Artist Application</h3>
                
                <form method="POST" action="{{ route('admin.artist-verification.reject', $artist) }}">
                    @csrf
                    
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Reason for Rejection <span class="text-error">*</span>
                        </label>
                        <textarea
                            name="reason"
                            required
                            rows="4"
                            class="form-textarea w-full"
                            placeholder="Explain why this application is being rejected..."
                        ></textarea>
                        <p class="text-slate-600 dark:text-slate-400 text-xs mt-1">This will be sent to the artist via email</p>
                    </div>

                    <div class="flex gap-3">
                        <button type="button" @click="showRejectModal = false"
                                class="flex-1 btn border-slate-300 dark:border-navy-450 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-navy-500">
                            Cancel
                        </button>
                        <button type="submit"
                                class="flex-1 btn bg-error hover:bg-error-focus text-white">
                            Reject Application
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Request More Info Modal -->
    <div x-show="showRequestInfoModal" x-cloak class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4">
            <div class="fixed inset-0 bg-black opacity-75" @click="showRequestInfoModal = false"></div>
            
            <div class="relative bg-white dark:bg-navy-800 rounded-lg max-w-md w-full p-6 border border-slate-200 dark:border-navy-600">
                <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">Request More Information</h3>
                
                <form method="POST" action="{{ route('admin.artist-verification.request-info', $artist) }}">
                    @csrf
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Missing Documents
                        </label>
                        <div class="space-y-2">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" name="missing_documents[]" value="national_id_front" class="form-checkbox rounded text-primary">
                                <span class="text-slate-700 dark:text-slate-300 text-sm">National ID (Front)</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" name="missing_documents[]" value="national_id_back" class="form-checkbox rounded text-primary">
                                <span class="text-slate-700 dark:text-slate-300 text-sm">National ID (Back)</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" name="missing_documents[]" value="selfie_with_id" class="form-checkbox rounded text-primary">
                                <span class="text-slate-700 dark:text-slate-300 text-sm">Selfie with ID</span>
                            </label>
                        </div>
                    </div>

                    <div class="mb-6">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Message to Artist <span class="text-error">*</span>
                        </label>
                        <textarea
                            name="notes"
                            required
                            rows="4"
                            class="form-textarea w-full"
                            placeholder="Explain what additional information is needed..."
                        ></textarea>
                    </div>

                    <div class="flex gap-3">
                        <button type="button" @click="showRequestInfoModal = false"
                                class="flex-1 btn border-slate-300 dark:border-navy-450 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-navy-500">
                            Cancel
                        </button>
                        <button type="submit"
                                class="flex-1 btn bg-orange-600 hover:bg-orange-700 text-white">
                            Send Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

@push('styles')
<style>
[x-cloak] { display: none !important; }
</style>
@endpush
@endsection
