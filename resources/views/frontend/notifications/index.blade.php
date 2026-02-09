@extends('layouts.app')

@section('title', 'Notifications')

@section('left-sidebar')
    @include('frontend.partials.modern-left-sidebar')
@endsection

@section('content')
<div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
                {{ auth()->user()->unreadNotifications->count() }} unread
                {{ Str::plural('notification', auth()->user()->unreadNotifications->count()) }}
            </p>
        </div>
        @if(auth()->user()->unreadNotifications->count() > 0)
            <form action="{{ route('frontend.notifications.mark-all-read') }}" method="POST">
                @csrf
                <button type="submit" class="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium">
                    <span class="material-icons-round text-sm">done_all</span>
                    Mark all as read
                </button>
            </form>
        @endif
    </div>

    <!-- Content Grid -->
    <div class="grid lg:grid-cols-4 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-3">
            @if($notifications->count() > 0)
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    @foreach($notifications as $notification)
                        @php
                            $data = $notification->data ?? [];
                            $isUnread = is_null($notification->read_at);
                            $color = $data['color'] ?? 'blue';
                            $type = $data['type'] ?? 'general';
                            $message = $data['message'] ?? 'New notification';
                            $title = $data['title'] ?? null;
                            $excerpt = $data['excerpt'] ?? $data['description'] ?? null;
                            
                            // Determine icon and colors based on type/color
                            $iconConfig = match($color) {
                                'green' => ['icon' => 'check_circle', 'bg' => 'bg-green-100 dark:bg-green-600/20', 'text' => 'text-green-600 dark:text-green-400'],
                                'red' => ['icon' => 'cancel', 'bg' => 'bg-red-100 dark:bg-red-600/20', 'text' => 'text-red-600 dark:text-red-400'],
                                'orange', 'yellow' => ['icon' => 'warning', 'bg' => 'bg-orange-100 dark:bg-orange-600/20', 'text' => 'text-orange-600 dark:text-orange-400'],
                                'purple' => ['icon' => 'auto_awesome', 'bg' => 'bg-purple-100 dark:bg-purple-600/20', 'text' => 'text-purple-600 dark:text-purple-400'],
                                default => ['icon' => 'info', 'bg' => 'bg-blue-100 dark:bg-blue-600/20', 'text' => 'text-blue-600 dark:text-blue-400'],
                            };
                            
                            // Override icon for specific types
                            if ($type === 'song_approved' || $type === 'song_approval') {
                                $iconConfig['icon'] = 'music_note';
                            } elseif ($type === 'song_rejected') {
                                $iconConfig['icon'] = 'music_off';
                            } elseif ($type === 'payment') {
                                $iconConfig['icon'] = 'payments';
                            } elseif ($type === 'follow') {
                                $iconConfig['icon'] = 'person_add';
                            } elseif ($type === 'comment') {
                                $iconConfig['icon'] = 'comment';
                            } elseif ($type === 'like') {
                                $iconConfig['icon'] = 'favorite';
                            }
                        @endphp
                        
                        <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-0 {{ $isUnread ? 'bg-green-50/50 dark:bg-green-900/10 border-l-4 border-l-green-500' : '' }}">
                            <div class="flex items-start gap-4">
                                <!-- Icon -->
                                <div class="flex-shrink-0">
                                    <div class="w-10 h-10 rounded-full {{ $iconConfig['bg'] }} flex items-center justify-center">
                                        <span class="material-icons-round {{ $iconConfig['text'] }} text-xl">{{ $iconConfig['icon'] }}</span>
                                    </div>
                                </div>

                                <!-- Content -->
                                <div class="flex-1 min-w-0">
                                    @if($title)
                                        <p class="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
                                            {{ $title }}
                                        </p>
                                    @endif
                                    <p class="text-sm {{ $isUnread ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300' }}">
                                        {{ $message }}
                                    </p>
                                    @if($excerpt)
                                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                            {{ Str::limit($excerpt, 150) }}
                                        </p>
                                    @endif
                                    <div class="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        <span class="material-icons-round text-xs">schedule</span>
                                        {{ $notification->created_at->diffForHumans() }}
                                    </div>

                                    <!-- Action Buttons -->
                                    <div class="flex items-center gap-3 mt-3">
                                        @if(isset($data['action_url']))
                                            <a href="{{ $data['action_url'] }}" 
                                               class="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                                               onclick="markAsRead('{{ $notification->id }}')">
                                                View Details
                                                <span class="material-icons-round text-xs">arrow_forward</span>
                                            </a>
                                        @endif

                                        @if($isUnread)
                                            <button onclick="markAsRead('{{ $notification->id }}')" 
                                                    class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                                                Mark as read
                                            </button>
                                        @endif

                                        <form action="{{ route('frontend.notifications.destroy', $notification->id) }}" 
                                              method="POST" 
                                              class="inline"
                                              onsubmit="return confirm('Delete this notification?');">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors">
                                                Delete
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                <!-- Unread Indicator -->
                                @if($isUnread)
                                    <div class="flex-shrink-0">
                                        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                                    </div>
                                @endif
                            </div>
                        </div>
                    @endforeach
                </div>

                <!-- Pagination -->
                @if($notifications->hasPages())
                    <div class="mt-6">
                        {{ $notifications->links() }}
                    </div>
                @endif
            @else
                <!-- Empty State -->
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center py-16 px-6 shadow-sm">
                    <div class="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <span class="material-icons-round text-gray-400 dark:text-gray-500 text-4xl">notifications_none</span>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No notifications</h3>
                    <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                        You're all caught up! You'll be notified here when something important happens.
                    </p>
                </div>
            @endif
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
            <!-- Quick Actions -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Notification Types</h3>
                <div class="space-y-3">
                    <div class="flex items-center gap-3 p-2">
                        <div class="w-8 h-8 bg-green-100 dark:bg-green-600/20 rounded-lg flex items-center justify-center">
                            <span class="material-icons-round text-green-600 dark:text-green-400 text-sm">check_circle</span>
                        </div>
                        <div>
                            <p class="text-gray-900 dark:text-white text-sm font-medium">Approvals</p>
                            <p class="text-gray-500 dark:text-gray-400 text-xs">Song & content approvals</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 p-2">
                        <div class="w-8 h-8 bg-blue-100 dark:bg-blue-600/20 rounded-lg flex items-center justify-center">
                            <span class="material-icons-round text-blue-600 dark:text-blue-400 text-sm">payments</span>
                        </div>
                        <div>
                            <p class="text-gray-900 dark:text-white text-sm font-medium">Payments</p>
                            <p class="text-gray-500 dark:text-gray-400 text-xs">Transaction updates</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 p-2">
                        <div class="w-8 h-8 bg-purple-100 dark:bg-purple-600/20 rounded-lg flex items-center justify-center">
                            <span class="material-icons-round text-purple-600 dark:text-purple-400 text-sm">person_add</span>
                        </div>
                        <div>
                            <p class="text-gray-900 dark:text-white text-sm font-medium">Social</p>
                            <p class="text-gray-500 dark:text-gray-400 text-xs">Follows, likes, comments</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Settings -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Settings</h3>
                <a href="{{ route('frontend.profile.settings') }}" 
                   class="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                    <span class="material-icons-round text-gray-700 dark:text-gray-300">tune</span>
                    <span class="text-gray-700 dark:text-gray-300 font-medium text-sm">Notification Preferences</span>
                </a>
            </div>

            <!-- Stats -->
            <div class="bg-gradient-to-br from-green-100 dark:from-green-900/30 to-blue-100 dark:to-blue-900/30 rounded-xl p-6 border border-green-200 dark:border-green-700/50 shadow-sm">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3">Stats</h3>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-gray-600 dark:text-gray-300 text-sm">Total</span>
                        <span class="text-gray-900 dark:text-white font-bold">{{ $notifications->total() }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600 dark:text-gray-300 text-sm">Unread</span>
                        <span class="text-green-600 dark:text-green-400 font-bold">{{ auth()->user()->unreadNotifications->count() }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function markAsRead(notificationId) {
    fetch(`/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        }
    }).then(() => location.reload());
}
</script>
@endsection
