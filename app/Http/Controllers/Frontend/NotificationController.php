<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show all notifications
     */
    public function index()
    {
        $notifications = Auth::user()->notifications()->paginate(20);
        
        return view('frontend.notifications.index', compact('notifications'));
    }

    /**
     * Mark a notification as read
     */
    public function markRead($notificationId)
    {
        $notification = Auth::user()->notifications()->findOrFail($notificationId);
        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllRead()
    {
        Auth::user()->unreadNotifications->markAsRead();

        return redirect()->back()->with('success', 'All notifications marked as read.');
    }

    /**
     * Delete a notification
     */
    public function destroy($notificationId)
    {
        $notification = Auth::user()->notifications()->findOrFail($notificationId);
        $notification->delete();

        return redirect()->back()->with('success', 'Notification deleted.');
    }
}