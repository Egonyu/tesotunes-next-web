@extends('frontend.layouts.music')

@section('title', 'User Reports')

@section('content')
<div class="min-h-screen bg-white dark:bg-black">
    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-white mb-2">User Reports</h1>
                    <p class="text-gray-400">Review and handle user-reported content and behavior</p>
                </div>
                <a href="{{ route('frontend.moderator.dashboard') }}" 
                   class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                    <span class="material-icons-round align-middle">arrow_back</span>
                    Back to Dashboard
                </a>
            </div>
        </div>

        <!-- Filter Tabs -->
        <div class="mb-6">
            <div class="border-b border-gray-700">
                <nav class="-mb-px flex space-x-8">
                    <button class="border-b-2 border-red-500 py-4 px-1 text-sm font-medium text-red-500">
                        Open Reports ({{ $counts['open'] ?? 0 }})
                    </button>
                    <button class="border-transparent text-gray-400 hover:text-white py-4 px-1 text-sm font-medium">
                        Under Review ({{ $counts['under_review'] ?? 0 }})
                    </button>
                    <button class="border-transparent text-gray-400 hover:text-white py-4 px-1 text-sm font-medium">
                        Resolved ({{ $counts['resolved'] ?? 0 }})
                    </button>
                    <button class="border-transparent text-gray-400 hover:text-white py-4 px-1 text-sm font-medium">
                        Dismissed ({{ $counts['dismissed'] ?? 0 }})
                    </button>
                </nav>
            </div>
        </div>

        <!-- Severity Filter -->
        <div class="mb-6 flex items-center space-x-4">
            <span class="text-gray-400 text-sm">Filter by severity:</span>
            <button class="px-3 py-1 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600">All</button>
            <button class="px-3 py-1 bg-gray-800 text-gray-400 text-sm rounded-lg hover:bg-gray-700">
                <span class="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                Critical
            </button>
            <button class="px-3 py-1 bg-gray-800 text-gray-400 text-sm rounded-lg hover:bg-gray-700">
                <span class="inline-block w-2 h-2 bg-orange-500 rounded-full mr-1"></span>
                High
            </button>
            <button class="px-3 py-1 bg-gray-800 text-gray-400 text-sm rounded-lg hover:bg-gray-700">
                <span class="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                Medium
            </button>
            <button class="px-3 py-1 bg-gray-800 text-gray-400 text-sm rounded-lg hover:bg-gray-700">
                <span class="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                Low
            </button>
        </div>

        <!-- Reports List -->
        <div class="space-y-4">
            @forelse($reports ?? [] as $report)
            <div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div class="flex items-start justify-between">
                    <!-- Report Info -->
                    <div class="flex-1">
                        <!-- Report Header -->
                        <div class="flex items-center space-x-3 mb-3">
                            <span class="inline-block w-3 h-3 rounded-full {{ $report['severity_color'] ?? 'bg-gray-500' }}"></span>
                            <span class="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                                {{ ucfirst($report['type'] ?? 'General') }}
                            </span>
                            <span class="text-gray-500 text-sm">•</span>
                            <span class="text-gray-400 text-sm">
                                Reported {{ $report['reported_at'] ?? 'recently' }}
                            </span>
                            @if(isset($report['report_count']) && $report['report_count'] > 1)
                            <span class="px-2 py-1 bg-red-900 text-red-300 text-xs rounded">
                                {{ $report['report_count'] }} reports
                            </span>
                            @endif
                        </div>

                        <!-- Reported Content -->
                        <div class="mb-4">
                            <h3 class="text-lg font-semibold text-white mb-2">
                                {{ $report['reason'] ?? 'Content Violation' }}
                            </h3>
                            <p class="text-gray-400 text-sm mb-3">
                                {{ $report['description'] ?? 'No description provided' }}
                            </p>

                            <!-- Content Preview -->
                            @if(isset($report['content']))
                            <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                                <div class="flex items-start space-x-4">
                                    @if(isset($report['content']['artwork']))
                                    <img src="{{ $report['content']['artwork'] }}" 
                                         alt="Content" 
                                         class="w-16 h-16 rounded object-cover">
                                    @endif
                                    <div class="flex-1">
                                        <p class="text-white font-medium">{{ $report['content']['title'] ?? 'Content' }}</p>
                                        <p class="text-gray-400 text-sm">by {{ $report['content']['author'] ?? 'Unknown' }}</p>
                                        @if(isset($report['content']['excerpt']))
                                        <p class="text-gray-500 text-sm mt-2">
                                            "{{ Str::limit($report['content']['excerpt'], 100) }}"
                                        </p>
                                        @endif
                                    </div>
                                </div>
                            </div>
                            @endif
                        </div>

                        <!-- Reporter Info -->
                        <div class="flex items-center space-x-2 text-sm text-gray-400">
                            <span class="material-icons-round text-xs">person</span>
                            <span>Reported by:</span>
                            <span class="text-white">{{ $report['reporter']['name'] ?? 'Anonymous' }}</span>
                            @if(isset($report['reporter']['verified']) && $report['reporter']['verified'])
                            <span class="material-icons-round text-green-500 text-xs">verified</span>
                            @endif
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-col space-y-2 ml-4">
                        <button class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-colors"
                                onclick="reviewReport('{{ $report['id'] }}')">
                            <span class="material-icons-round text-sm align-middle">visibility</span>
                            Review
                        </button>
                        <button class="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 transition-colors"
                                onclick="resolveReport('{{ $report['id'] }}', 'resolved')">
                            <span class="material-icons-round text-sm align-middle">check_circle</span>
                            Resolve
                        </button>
                        <button class="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-500 transition-colors"
                                onclick="takeAction('{{ $report['id'] }}')">
                            <span class="material-icons-round text-sm align-middle">gavel</span>
                            Take Action
                        </button>
                        <button class="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-500 transition-colors"
                                onclick="resolveReport('{{ $report['id'] }}', 'dismissed')">
                            <span class="material-icons-round text-sm align-middle">block</span>
                            Dismiss
                        </button>
                    </div>
                </div>

                <!-- Previous Actions -->
                @if(isset($report['actions']) && count($report['actions']) > 0)
                <div class="mt-4 pt-4 border-t border-gray-700">
                    <button class="text-sm text-gray-400 hover:text-white" 
                            onclick="toggleActions('{{ $report['id'] }}')">
                        <span class="material-icons-round text-xs align-middle">history</span>
                        View action history ({{ count($report['actions']) }})
                    </button>
                    <div id="actions-{{ $report['id'] }}" class="hidden mt-2 space-y-2">
                        @foreach($report['actions'] as $action)
                        <div class="text-sm text-gray-400 pl-4 border-l-2 border-gray-700">
                            <span class="text-white">{{ $action['moderator'] ?? 'Moderator' }}</span>
                            {{ $action['action'] ?? 'took action' }}
                            <span class="text-gray-500">{{ $action['time'] ?? '' }}</span>
                        </div>
                        @endforeach
                    </div>
                </div>
                @endif
            </div>
            @empty
            <div class="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
                <span class="material-icons-round text-gray-600 text-6xl mb-4">check_circle</span>
                <h3 class="text-xl font-semibold text-white mb-2">All clear!</h3>
                <p class="text-gray-400">No open reports to review at the moment.</p>
            </div>
            @endforelse
        </div>

        <!-- Pagination -->
        @if(isset($reports) && count($reports) > 0)
        <div class="mt-8 flex justify-center">
            <nav class="flex items-center space-x-2">
                <button class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                    Previous
                </button>
                <button class="px-4 py-2 bg-red-600 text-white rounded-lg">1</button>
                <button class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">2</button>
                <button class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">3</button>
                <button class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                    Next
                </button>
            </nav>
        </div>
        @endif
    </div>
</div>

@push('scripts')
<script>
function toggleActions(reportId) {
    const element = document.getElementById(`actions-${reportId}`);
    element.classList.toggle('hidden');
}

function reviewReport(reportId) {
    // Open review modal or navigate to detailed view
    alert('Review functionality to be implemented');
}

function resolveReport(reportId, status) {
    const message = status === 'resolved' 
        ? 'Are you sure you want to mark this report as resolved?' 
        : 'Are you sure you want to dismiss this report?';
    
    if (!confirm(message)) return;
    
    // API call to update report status
    console.log(`Report ${reportId} marked as ${status}`);
    location.reload();
}

function takeAction(reportId) {
    // Open action modal
    const actions = [
        'Remove content',
        'Suspend user (24h)',
        'Suspend user (7 days)',
        'Ban user permanently',
        'Issue warning'
    ];
    
    const action = prompt('Select action:\n' + actions.map((a, i) => `${i + 1}. ${a}`).join('\n'));
    if (action) {
        console.log(`Taking action on report ${reportId}: ${actions[parseInt(action) - 1]}`);
        location.reload();
    }
}
</script>
@endpush
@endsection
