<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Genre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function show()
    {
        $user = Auth::user();

        // If user is an artist, redirect to artist profile
        if ($user->is_artist) {
            return redirect()->route('frontend.artist.profile');
        }

        // Get user statistics
        $stats = [
            'followers_count' => $user->followers()->count(),
            'following_count' => $user->following()->count(),
            'playlists_count' => $user->playlists()->count(),
            'likes_count' => $user->likedSongs()->count(),
            'downloads_count' => \App\Models\Download::where('user_id', $user->id)->count(),
            'play_count' => \App\Models\PlayHistory::where('user_id', $user->id)->count(),
        ];

        // Get recent playlists
        $recentPlaylists = $user->playlists()
            ->with('songs')
            ->latest()
            ->take(6)
            ->get();

        // Get recently played songs
        $recentlyPlayed = \App\Models\PlayHistory::where('user_id', $user->id)
            ->with('song.artist')
            ->latest('played_at')
            ->take(10)
            ->get()
            ->pluck('song')
            ->unique('id');

        return view('frontend.profile.show', compact('user', 'stats', 'recentPlaylists', 'recentlyPlayed'));
    }

    public function showUser($user)
    {
        // Find user by username or ID
        if (is_numeric($user)) {
            $user = \App\Models\User::findOrFail($user);
        } else {
            $user = \App\Models\User::where('username', $user)->firstOrFail();
        }

        // Get user statistics
        $stats = [
            'followers_count' => $user->followers()->count(),
            'following_count' => $user->following()->count(),
            'playlists_count' => $user->playlists()->where('visibility', 'public')->count(),
            'likes_count' => $user->likedSongs()->count(),
        ];

        // Get public playlists
        $recentPlaylists = $user->playlists()
            ->where('visibility', 'public')
            ->withCount('songs')
            ->latest()
            ->take(6)
            ->get();

        // Get recently liked songs (public likes)
        $recentlyLiked = $user->likedSongs()
            ->with(['artist:id,stage_name,slug,avatar'])
            ->orderByDesc('likes.liked_at')
            ->take(5)
            ->get();

        // Get mutual followers if authenticated
        $mutualFollowers = collect();
        if (Auth::check() && Auth::id() !== $user->id) {
            $authUserFollowing = Auth::user()->following()->pluck('users.id');
            $mutualFollowers = $user->followers()
                ->whereIn('users.id', $authUserFollowing)
                ->take(5)
                ->get();
        }

        return view('frontend.profile.user', compact(
            'user', 
            'stats', 
            'recentPlaylists',
            'recentlyLiked',
            'mutualFollowers'
        ));
    }

    public function edit()
    {
        $user = Auth::user();

        // If user is an artist, redirect to artist profile edit
        if ($user->is_artist) {
            return redirect()->route('frontend.artist.profile');
        }

        return view('frontend.profile.edit', compact('user'));
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'bio' => 'nullable|string|max:1000',
            'country' => 'nullable|string|max:2',
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max
            'settings' => 'nullable|array',
        ]);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = $avatarPath;
        }

        // Prepare update data
        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'bio' => $validated['bio'] ?? null,
            'country' => $validated['country'] ?? null,
            'phone' => $validated['phone'] ?? null,
        ];

        // Add avatar if uploaded
        if (isset($validated['avatar'])) {
            $updateData['avatar'] = $validated['avatar'];
        }

        // Update user profile
        $user->update($updateData);

        // Handle settings if provided
        if (isset($validated['settings'])) {
            $settings = $user->settings ?? [];
            $settings = array_merge($settings, $validated['settings']);
            $user->update(['settings' => $settings]);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully!',
            ]);
        }

        return redirect()->route('frontend.profile.show')
            ->with('success', 'Profile updated successfully!');
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        $user = Auth::user();

        // Delete old avatar if exists
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        $avatarPath = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $avatarPath]);

        return response()->json([
            'success' => true,
            'avatar_url' => Storage::url($avatarPath)
        ]);
    }

    public function settings()
    {
        $user = Auth::user();
        return view('frontend.profile.settings', compact('user'));
    }

    public function updateSettings(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'settings' => 'sometimes|array',
            'notification_preferences' => 'sometimes|array',
        ]);

        // Update general settings
        $settings = $user->settings ?? [];
        if (isset($validated['settings'])) {
            $settings = array_merge($settings, $validated['settings']);
        }
        
        // Handle unchecked checkboxes (convert missing keys to false)
        $settings['public_profile'] = isset($validated['settings']['public_profile']);

        // Update notification preferences
        $notificationPrefs = $user->notification_preferences ?? [];
        if (isset($validated['notification_preferences'])) {
            foreach ($validated['notification_preferences'] as $type => $channels) {
                $notificationPrefs[$type] = [
                    'email' => isset($channels['email']),
                    'push' => isset($channels['push']),
                    'sms' => isset($channels['sms']) ?? false,
                ];
            }
        }

        $user->update([
            'settings' => $settings,
            'notification_preferences' => $notificationPrefs,
        ]);

        return redirect()->route('frontend.profile.settings')
            ->with('success', 'Settings updated successfully!');
    }

    /**
     * Display user's payment history
     */
    public function paymentHistory(Request $request)
    {
        $user = Auth::user();

        $payments = $user->payments()
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->type, fn($q, $type) => $q->where('payment_type', $type))
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        // Payment summary stats
        $stats = [
            'total_spent' => $user->payments()->where('status', 'completed')->sum('amount'),
            'total_payments' => $user->payments()->count(),
            'successful_payments' => $user->payments()->where('status', 'completed')->count(),
            'pending_payments' => $user->payments()->where('status', 'pending')->count(),
            'failed_payments' => $user->payments()->where('status', 'failed')->count(),
        ];

        return view('frontend.profile.payment-history', compact('user', 'payments', 'stats'));
    }

    /**
     * Display individual payment details
     */
    public function paymentDetails(string $uuid)
    {
        $user = Auth::user();
        $payment = $user->payments()->where('uuid', $uuid)->firstOrFail();

        return view('frontend.profile.payment-details', compact('user', 'payment'));
    }
}