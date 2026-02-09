@extends('layouts.admin')

@section('title', 'Credit Rates Management')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Credit Rates Management</h1>
                <p class="text-slate-600 dark:text-navy-300">Configure how users earn credits for different activities</p>
            </div>
            <div>
                <a href="{{ route('admin.credits.index') }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Credits
                </a>
            </div>
        </div>
    </div>

    <!-- Rate Configuration -->
    <div class="admin-card">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Activity Rates</h3>
            <button onclick="openAddRateModal()" class="btn bg-primary text-white hover:bg-primary-focus">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Rate
            </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            @forelse($credit_rates ?? [] as $rate)
                <div class="border border-slate-200 dark:border-navy-500 rounded-lg p-6">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h4 class="text-lg font-medium text-slate-800 dark:text-navy-50 mb-1">
                                {{ $rate->display_name ?? ucfirst(str_replace('_', ' ', $rate->activity_type)) }}
                            </h4>
                            <div class="flex items-center gap-2">
                                <span class="text-xs text-slate-500 dark:text-navy-400 font-mono">
                                    {{ $rate->activity_type }}
                                </span>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    {{ $rate->is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }}">
                                    {{ $rate->is_active ? 'Active' : 'Inactive' }}
                                </span>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="editRate({{ $rate->id }})" class="text-blue-600 hover:text-blue-800">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button onclick="toggleRate({{ $rate->id }}, {{ $rate->is_active ? 'false' : 'true' }})"
                                    class="{{ $rate->is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800' }}">
                                @if($rate->is_active)
                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                    </svg>
                                @else
                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                @endif
                            </button>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-slate-600 dark:text-navy-300">Cost:</span>
                            <span class="font-mono text-lg font-semibold text-slate-800 dark:text-navy-50">
                                {{ number_format($rate->cost_credits) }} credits
                            </span>
                        </div>

                        @if($rate->duration_days)
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-slate-600 dark:text-navy-300">Duration:</span>
                                <span class="font-mono text-sm text-slate-800 dark:text-navy-50">
                                    {{ $rate->getDurationDisplay() }}
                                </span>
                            </div>
                        @endif

                        @if($rate->max_uses_per_user)
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-slate-600 dark:text-navy-300">Max Uses Per User:</span>
                                <span class="font-mono text-sm text-slate-800 dark:text-navy-50">
                                    {{ number_format($rate->max_uses_per_user) }} times
                                </span>
                            </div>
                        @endif

                        @if($rate->max_concurrent)
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-slate-600 dark:text-navy-300">Max Concurrent:</span>
                                <span class="font-mono text-sm text-slate-800 dark:text-navy-50">
                                    {{ number_format($rate->max_concurrent) }}
                                </span>
                            </div>
                        @endif

                        @if($rate->description)
                            <div class="pt-2 border-t border-slate-200 dark:border-navy-600">
                                <span class="text-xs text-slate-500 dark:text-navy-400">
                                    {{ $rate->description }}
                                </span>
                            </div>
                        @endif
                    </div>
                </div>
            @empty
                <div class="col-span-2 text-center py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-12 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <h3 class="text-lg font-medium text-slate-800 dark:text-navy-50 mb-2">No rates configured</h3>
                    <p class="text-slate-600 dark:text-navy-300 mb-6">Start by adding credit rates for different user activities</p>
                    <button onclick="openAddRateModal()" class="btn bg-primary text-white hover:bg-primary-focus">
                        Add First Rate
                    </button>
                </div>
            @endforelse
        </div>
    </div>

    <!-- Predefined Rate Templates -->
    <div class="admin-card mt-8">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-6">Quick Setup Templates</h3>
        <p class="text-sm text-slate-600 dark:text-navy-300 mb-6">Click a template to quickly configure common credit rates:</p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button onclick="applyTemplate('feature_homepage')" class="template-btn p-4 border border-slate-200 dark:border-navy-500 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
                <div class="font-medium text-slate-800 dark:text-navy-50 mb-1">Homepage Feature</div>
                <div class="text-sm text-slate-600 dark:text-navy-300 mb-2">100 credits for 7 days</div>
                <div class="text-xs text-slate-500">Feature song on homepage</div>
            </button>

            <button onclick="applyTemplate('upload_song')" class="template-btn p-4 border border-slate-200 dark:border-navy-500 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
                <div class="font-medium text-slate-800 dark:text-navy-50 mb-1">Upload Song</div>
                <div class="text-sm text-slate-600 dark:text-navy-300 mb-2">10 credits per upload</div>
                <div class="text-xs text-slate-500">Upload a single track</div>
            </button>

            <button onclick="applyTemplate('distribute_spotify')" class="template-btn p-4 border border-slate-200 dark:border-navy-500 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
                <div class="font-medium text-slate-800 dark:text-navy-50 mb-1">Distribute to Spotify</div>
                <div class="text-sm text-slate-600 dark:text-navy-300 mb-2">150 credits per submission</div>
                <div class="text-xs text-slate-500">Submit to Spotify</div>
            </button>

            <button onclick="applyTemplate('verified_badge')" class="template-btn p-4 border border-slate-200 dark:border-navy-500 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
                <div class="font-medium text-slate-800 dark:text-navy-50 mb-1">Verified Badge</div>
                <div class="text-sm text-slate-600 dark:text-navy-300 mb-2">500 credits permanent</div>
                <div class="text-xs text-slate-500">Get verified artist badge</div>
            </button>
        </div>
    </div>
</div>

<!-- Add/Edit Rate Modal -->
<div id="rateModal" class="fixed inset-0 z-50 hidden overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>
        <div class="relative bg-white dark:bg-navy-700 rounded-lg max-w-lg w-full p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 id="rateModalTitle" class="text-lg font-semibold text-slate-800 dark:text-navy-50">Add Credit Rate</h3>
                <button onclick="closeRateModal()" class="text-slate-400 hover:text-slate-600">
                    <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <form id="rateForm" class="space-y-4">
                @csrf
                <input type="hidden" id="rateId" name="rate_id">

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">Activity Type</label>
                    <input type="text" id="activityType" name="activity_type" required
                           class="form-input w-full" placeholder="e.g., song_play_complete">
                    <p class="text-xs text-slate-500 mt-1">Use snake_case format (e.g., upload_song, feature_homepage)</p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">Display Name</label>
                    <input type="text" id="displayName" name="display_name" required
                           class="form-input w-full" placeholder="e.g., Upload Song">
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">Description (Optional)</label>
                    <textarea id="description" name="description" rows="2"
                              class="form-textarea w-full" placeholder="Brief description of this activity"></textarea>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">Cost (Credits)</label>
                    <input type="number" id="costCredits" name="cost_credits" min="0" required
                           class="form-input w-full" placeholder="e.g., 100">
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">Duration (Days, Optional)</label>
                    <input type="number" id="durationDays" name="duration_days" min="1"
                           class="form-input w-full" placeholder="e.g., 7">
                    <p class="text-xs text-slate-500 mt-1">Leave empty for permanent features</p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">Max Uses Per User (Optional)</label>
                    <input type="number" id="maxUses" name="max_uses_per_user" min="1"
                           class="form-input w-full" placeholder="e.g., 5">
                    <p class="text-xs text-slate-500 mt-1">Maximum times a user can use this feature</p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">Max Concurrent (Optional)</label>
                    <input type="number" id="maxConcurrent" name="max_concurrent" min="1"
                           class="form-input w-full" placeholder="e.g., 3">
                    <p class="text-xs text-slate-500 mt-1">Maximum active instances at once</p>
                </div>

                <div>
                    <label class="flex items-center space-x-3">
                        <input type="checkbox" id="isActive" name="is_active" value="1" checked
                               class="form-checkbox text-primary">
                        <span class="text-sm font-medium text-slate-700 dark:text-navy-300">Active</span>
                    </label>
                </div>

                <div class="flex gap-3 pt-4">
                    <button type="submit" class="btn bg-primary text-white hover:bg-primary-focus flex-1">
                        <span id="submitText">Save Rate</span>
                    </button>
                    <button type="button" onclick="closeRateModal()"
                            class="btn border border-slate-300 text-slate-700 hover:bg-slate-50">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
const rateTemplates = {
    feature_homepage: {
        activity_type: 'feature_song_homepage',
        display_name: 'Feature on Homepage',
        description: 'Feature song on homepage for visibility boost',
        cost_credits: 100,
        duration_days: 7,
        max_uses_per_user: null,
        max_concurrent: 1,
        is_active: true
    },
    upload_song: {
        activity_type: 'upload_song',
        display_name: 'Upload Song',
        description: 'Upload a single track to the platform',
        cost_credits: 10,
        duration_days: null,
        max_uses_per_user: null,
        max_concurrent: null,
        is_active: true
    },
    distribute_spotify: {
        activity_type: 'distribute_to_spotify',
        display_name: 'Submit to Spotify',
        description: 'Submit your track to Spotify for distribution',
        cost_credits: 150,
        duration_days: null,
        max_uses_per_user: null,
        max_concurrent: null,
        is_active: true
    },
    verified_badge: {
        activity_type: 'verified_artist_badge',
        display_name: 'Verified Badge',
        description: 'Apply for verified artist badge',
        cost_credits: 500,
        duration_days: null,
        max_uses_per_user: 1,
        max_concurrent: null,
        is_active: true
    }
};

function openAddRateModal() {
    document.getElementById('rateModalTitle').textContent = 'Add Credit Rate';
    document.getElementById('submitText').textContent = 'Save Rate';
    document.getElementById('rateForm').reset();
    document.getElementById('rateId').value = '';
    document.getElementById('isActive').checked = true;
    document.getElementById('rateModal').classList.remove('hidden');
}

function closeRateModal() {
    document.getElementById('rateModal').classList.add('hidden');
    document.getElementById('rateForm').reset();
}

function editRate(rateId) {
    // In a real implementation, you'd fetch the rate data
    document.getElementById('rateModalTitle').textContent = 'Edit Credit Rate';
    document.getElementById('submitText').textContent = 'Update Rate';
    document.getElementById('rateId').value = rateId;
    document.getElementById('rateModal').classList.remove('hidden');
}

function applyTemplate(templateName) {
    if (!rateTemplates[templateName]) return;

    const template = rateTemplates[templateName];

    document.getElementById('activityType').value = template.activity_type;
    document.getElementById('displayName').value = template.display_name;
    document.getElementById('description').value = template.description || '';
    document.getElementById('costCredits').value = template.cost_credits;
    document.getElementById('durationDays').value = template.duration_days || '';
    document.getElementById('maxUses').value = template.max_uses_per_user || '';
    document.getElementById('maxConcurrent').value = template.max_concurrent || '';
    document.getElementById('isActive').checked = template.is_active;

    openAddRateModal();
}

async function toggleRate(rateId, isActive) {
    try {
        const response = await fetch(`/admin/credits/rates/${rateId}/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({ is_active: isActive })
        });

        const result = await response.json();
        if (result.success) {
            location.reload();
        } else {
            alert(result.message || 'Error updating rate status');
        }
    } catch (error) {
        alert('Error updating rate status');
    }
}

// Rate form submission
document.getElementById('rateForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const rateId = document.getElementById('rateId').value;

    const url = rateId ? `/admin/credits/rates/${rateId}` : '/admin/credits/rates';
    const method = rateId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            body: formData,
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            }
        });

        const result = await response.json();
        if (result.success) {
            closeRateModal();
            location.reload();
        } else {
            alert(result.message || 'Error saving rate');
        }
    } catch (error) {
        alert('Error saving rate');
    }
});
</script>

@endsection