<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CrossModuleNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    protected CrossModuleNotificationService $notificationService;

    public function __construct(CrossModuleNotificationService $notificationService)
    {
        $this->middleware('auth:sanctum');
        $this->notificationService = $notificationService;
    }

    /**
     * Get user's notifications with pagination
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $module = $request->get('module');
        $unreadOnly = $request->boolean('unread_only');

        $query = $user->notifications()
            ->where('following_type', \App\Notifications\CrossModuleNotification::class)
            ->orderBy('created_at', 'desc');

        if ($module) {
            $query->whereJsonContains('data->module', $module);
        }

        if ($unreadOnly) {
            $query->whereNull('read_at');
        }

        $notifications = $query->paginate(20);

        return response()->json([
            'notifications' => $notifications->items(),
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ],
            'unread_counts' => $this->notificationService->getUnreadCountByModule($user),
        ]);
    }

    /**
     * Get unread notification counts by module
     */
    public function unreadCounts()
    {
        $user = Auth::user();
        $counts = $this->notificationService->getUnreadCountByModule($user);

        return response()->json($counts);
    }

    /**
     * Mark specific notification as read
     */
    public function markAsRead(Request $request, string $notificationId)
    {
        $user = Auth::user();

        $notification = $user->notifications()
            ->where('id', $notificationId)
            ->whereNull('read_at')
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->markAsRead();

        return response()->json(['message' => 'Notification marked as read']);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        $user = Auth::user();
        $module = $request->get('module');

        if ($module) {
            $this->notificationService->markModuleNotificationsAsRead($user, $module);
        } else {
            $user->unreadNotifications()
                ->where('following_type', \App\Notifications\CrossModuleNotification::class)
                ->update(['read_at' => now()]);
        }

        return response()->json(['message' => 'Notifications marked as read']);
    }

    /**
     * Delete specific notification
     */
    public function destroy(string $notificationId)
    {
        $user = Auth::user();

        $notification = $user->notifications()
            ->where('id', $notificationId)
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->delete();

        return response()->json(['message' => 'Notification deleted']);
    }

    /**
     * Get notification settings/preferences
     */
    public function settings()
    {
        $user = Auth::user();

        // This would come from a user_preferences table or similar
        $settings = [
            'email_notifications' => [
                'music' => ['song_approved', 'distribution_live', 'royalty_payment'],
                'podcast' => ['episode_published', 'new_subscriber'],
                'store' => ['order_received', 'payment_received'],
                'sacco' => ['loan_approved', 'payment_due'],
            ],
            'push_notifications' => [
                'music' => ['song_approved', 'distribution_live'],
                'podcast' => ['new_subscriber'],
                'store' => ['order_received'],
                'sacco' => ['loan_approved'],
            ],
            'in_app_notifications' => [
                'music' => true,
                'podcast' => true,
                'store' => true,
                'sacco' => true,
            ],
        ];

        return response()->json($settings);
    }

    /**
     * Update notification settings/preferences
     */
    public function updateSettings(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'email_notifications' => 'array',
            'push_notifications' => 'array',
            'in_app_notifications' => 'array',
        ]);

        // This would save to user_preferences table
        // $user->updateNotificationPreferences($request->all());

        return response()->json(['message' => 'Notification settings updated']);
    }

    /**
     * Send test notification (admin only)
     */
    public function sendTest(Request $request)
    {
        $user = Auth::user();

        if (!$user->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'module' => 'required|string',
            'type' => 'required|string',
            'title' => 'required|string',
            'message' => 'required|string',
        ]);

        $targetUser = \App\Models\User::find($request->user_id);

        $this->notificationService->sendToUser(
            $targetUser,
            $request->module,
            $request->type,
            $request->title,
            $request->message,
            ['test' => true]
        );

        return response()->json(['message' => 'Test notification sent']);
    }

    /**
     * Get notification analytics (admin only)
     */
    public function analytics(Request $request)
    {
        $user = Auth::user();

        if (!$user->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $period = $request->get('period', '30'); // days

        // This would calculate analytics from the notifications table
        $analytics = [
            'total_sent' => 0,
            'by_module' => [
                'music' => 0,
                'podcast' => 0,
                'store' => 0,
                'sacco' => 0,
            ],
            'by_type' => [],
            'read_rate' => 0,
            'average_time_to_read' => 0,
        ];

        return response()->json($analytics);
    }

    /**
     * Get recent notifications for dashboard widget
     */
    public function recent(Request $request)
    {
        $user = Auth::user();
        $limit = $request->get('limit', 5);

        $notifications = $user->notifications()
            ->where('following_type', \App\Notifications\CrossModuleNotification::class)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json($notifications);
    }

    /**
     * Preview notification template
     */
    public function preview(Request $request)
    {
        $request->validate([
            'module' => 'required|string',
            'type' => 'required|string',
            'data' => 'array',
        ]);

        // Create a temporary notification to get the content
        $tempNotification = new \App\Notifications\CrossModuleNotification(
            $request->module,
            $request->type,
            'Preview Title',
            'Preview Message',
            $request->get('data', [])
        );

        $preview = $tempNotification->toArray(Auth::user());

        return response()->json([
            'preview' => $preview,
            'channels' => $tempNotification->via(Auth::user()),
        ]);
    }
}