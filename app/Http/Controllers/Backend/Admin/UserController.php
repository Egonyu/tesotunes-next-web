<?php

namespace App\Http\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserSetting;
use App\Models\UserSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        // Exclude artists from users index - they have their own section now
        $query->whereDoesntHave('artist');

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('username', 'LIKE', "%{$search}%")
                  ->orWhere('display_name', 'LIKE', "%{$search}%")
                  ->orWhere('first_name', 'LIKE', "%{$search}%")
                  ->orWhere('last_name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('phone', 'LIKE', "%{$search}%");
            });
        }

        // Filter by role (exclude artist role since they're in separate section)
        if ($request->filled('role')) {
            $query->whereHas('roles', function($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        // Filter by country
        if ($request->filled('country')) {
            $query->where('country', $request->country);
        }

        // Filter by subscription status - temporarily disabled to debug
        // if ($request->filled('subscription_status')) {
        //     $status = $request->subscription_status;
        //     if ($status === 'active') {
        //         $query->whereHas('subscription', function($q) {
        //             $q->where('status', 'active');
        //         });
        //     } elseif ($status === 'inactive') {
        //         $query->whereDoesntHave('subscription', function($q) {
        //             $q->where('status', 'active');
        //         });
        //     }
        // }

        // Filter by verification status
        if ($request->filled('verified')) {
            $query->whereNotNull('email_verified_at');
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date_to);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $users = $query->paginate($request->get('per_page', 25));

        // Get filter options
        $countries = ['US', 'GB', 'CA', 'AU', 'UG', 'KE', 'TZ', 'RW']; // Static list to debug
        $roles = ['admin', 'user', 'moderator']; // Removed 'artist' since they have their own section

        return view('admin.users.index', compact('users', 'countries', 'roles'));
    }

    public function show(User $user)
    {
        $user->load([
            'settings',
            'artist',
            'subscription.subscriptionPlan',
            'playlists' => function($query) {
                $query->latest()->limit(10);
            },
            'playHistory' => function($query) {
                $query->with('song.artist')->latest('played_at')->limit(20);
            },
            'payments' => function($query) {
                $query->latest()->limit(10);
            },
            'activities' => function($query) {
                $query->latest()->limit(15);
            }
        ]);

        // User statistics
        $stats = [
            'total_playlists' => $user->playlists()->count(),
            'total_plays' => $user->playHistory()->count(),
            'total_downloads' => $user->downloads()->count(),
            'total_payments' => $user->payments()->where('status', 'completed')->sum('amount'),
            'listening_time' => $user->playHistory()->sum('duration_played_seconds'),
            'favorite_genre' => $this->getUserFavoriteGenre($user),
            'avg_session_time' => $this->getAverageSessionTime($user),
            'last_activity' => $user->playHistory()->latest('played_at')->first()?->played_at,
            'followers_count' => $user->followers()->count(),
            'following_count' => $user->following()->count(),
        ];

        // Artist-specific data
        $artistData = null;
        if ($user->artist) {
            $artist = $user->artist;

            $artistData = [
                'artist' => $artist,
                'total_songs' => $artist->songs()->count(),
                'published_songs' => $artist->songs()->where('songs.status', 'published')->count(),
                'pending_songs' => $artist->songs()->where('songs.status', 'pending')->count(),
                'total_albums' => $artist->albums()->count(),
                'total_streams' => $artist->songs()->sum('play_count'),
                'unique_listeners' => $artist->monthly_listeners ?? 0, // Use Artist's monthly_listeners attribute
                'total_revenue' => $artist->songs()->sum('revenue_generated'),
                'followers' => \DB::table('user_follows')
                    ->where('following_id', $artist->id)
                    ->where('following_type', 'artist')
                    ->count(),
                'recent_uploads' => $artist->songs()
                    ->with('album', 'genres')
                    ->latest()
                    ->limit(10)
                    ->get(),
                'recent_albums' => $artist->albums()
                    ->withCount('songs')
                    ->latest()
                    ->limit(5)
                    ->get(),
            ];
        }

        // Recent activity with details
        $recentActivity = \App\Models\Activity::where('user_id', $user->id)
            ->with('subject')
            ->latest()
            ->limit(20)
            ->get();

        // Events (created by user or attended)
        $events = \App\Models\Event::where(function($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereHas('attendees', function($q) use ($user) {
                        $q->where('user_id', $user->id);
                    });
            })
            ->latest()
            ->limit(10)
            ->get();

        // Award history (if Award model exists)
        $awards = collect([]);
        if (class_exists('\App\Models\Award')) {
            try {
                $awards = \App\Models\Award::where('user_id', $user->id)
                    ->orWhere(function($query) use ($user) {
                        if ($user->artist) {
                            $query->where('artist_id', $user->artist->id);
                        }
                    })
                    ->latest()
                    ->limit(10)
                    ->get();
            } catch (\Exception $e) {
                \Log::warning('Award query failed: ' . $e->getMessage());
                $awards = collect([]);
            }
        }

        return view('admin.users.show', compact(
            'user',
            'stats',
            'artistData',
            'recentActivity',
            'events',
            'awards'
        ));
    }

    public function create()
    {
        $countries = ['UG', 'KE', 'TZ', 'RW', 'US', 'GB', 'CA', 'AU'];
        $roles = ['admin', 'user', 'artist', 'moderator'];

        return view('admin.users.create', compact('countries', 'roles'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:admin,user,artist,moderator',
            'country' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'email_verified' => 'boolean',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'country' => $request->country ?? 'UG',
            'phone' => $request->phone,
            'bio' => $request->bio,
            'is_active' => $request->boolean('is_active', true),
            'email_verified_at' => $request->boolean('email_verified') ? now() : null,
        ]);

        // Create default user settings
        UserSetting::createDefault($user);

        return redirect()->route('admin.users.show', $user)
            ->with('success', 'User created successfully');
    }

    public function edit(User $user)
    {
        $countries = ['UG', 'KE', 'TZ', 'RW', 'US', 'GB', 'CA', 'AU'];
        $roles = ['admin', 'user', 'artist', 'moderator'];

        return view('admin.users.edit', compact('user', 'countries', 'roles'));
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|in:admin,user,artist,moderator',
            'country' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'avatar' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:5120', // 5MB
            'remove_avatar' => 'boolean',
            'verify_email' => 'boolean',
            'remove_verification' => 'boolean',
        ]);

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'phone' => $request->phone,
            'bio' => $request->bio,
            'is_active' => $request->boolean('is_active'),
        ];

        // Only update country if provided
        if ($request->filled('country')) {
            $updateData['country'] = $request->country;
        }

        // Handle password update
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar && \Storage::exists('public/' . $user->avatar)) {
                \Storage::delete('public/' . $user->avatar);
            }
            
            // Store new avatar
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $updateData['avatar'] = $avatarPath;
        }

        // Handle avatar removal
        if ($request->boolean('remove_avatar') && $user->avatar) {
            if (\Storage::exists('public/' . $user->avatar)) {
                \Storage::delete('public/' . $user->avatar);
            }
            $updateData['avatar'] = null;
        }

        // Handle email verification
        if ($request->boolean('verify_email') && !$user->email_verified_at) {
            $updateData['email_verified_at'] = now();
        } elseif ($request->boolean('remove_verification') && $user->email_verified_at) {
            $updateData['email_verified_at'] = null;
        }

        $user->update($updateData);

        return redirect()->route('admin.users.show', $user)
            ->with('success', 'User updated successfully');
    }

    public function destroy(User $user)
    {
        // Prevent self-deletion
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account');
        }

        // Prevent deletion of users with active subscriptions
        if ($user->subscription && $user->subscription->status === 'active') {
            return back()->with('error', 'Cannot delete user with active subscription');
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted successfully');
    }

    public function toggleStatus(User $user)
    {
        $user->update(['is_active' => !$user->is_active]);

        $status = $user->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "User {$status} successfully");
    }

    public function verifyEmail(User $user)
    {
        $user->update(['email_verified_at' => now()]);

        return back()->with('success', 'User email verified successfully');
    }

    public function impersonate(User $user)
    {
        // Check if user has admin role
        $userHasAdmin = $user->roles()->where('name', 'admin')->exists() || 
                       $user->roles()->where('name', 'super_admin')->exists();
        $currentUserHasAdmin = auth()->user()->roles()->where('name', 'admin')->exists() || 
                              auth()->user()->roles()->where('name', 'super_admin')->exists();
        
        if ($userHasAdmin && !$currentUserHasAdmin) {
            return back()->with('error', 'Cannot impersonate admin users');
        }

        session(['impersonating' => $user->id]);

        return redirect()->route('frontend.home')
            ->with('success', "Now impersonating {$user->name}");
    }

    public function stopImpersonating()
    {
        session()->forget('impersonating');

        return redirect()->route('admin.dashboard')
            ->with('success', 'Stopped impersonating user');
    }

    public function exportData(User $user)
    {
        $userData = [
            'user' => $user->toArray(),
            'settings' => $user->settings?->toArray(),
            'playlists' => $user->playlists()->with('songs')->get()->toArray(),
            'play_history' => $user->playHistory()->with('song.artist')->get()->toArray(),
            'payments' => $user->payments()->get()->toArray(),
            'activities' => $user->activities()->get()->toArray(),
        ];

        $filename = "user_data_{$user->id}_" . now()->format('Y-m-d_H-i-s') . '.json';

        return response()->json($userData)
            ->header('Content-Disposition', "attachment; filename={$filename}");
    }

    private function getUserFavoriteGenre(User $user)
    {
        $mostPlayedGenre = $user->playHistory()
            ->join('songs', 'play_histories.song_id', '=', 'songs.id')
            ->join('song_genres', 'songs.id', '=', 'song_genres.song_id')
            ->join('genres', 'song_genres.genre_id', '=', 'genres.id')
            ->selectRaw('genres.name, COUNT(*) as count')
            ->groupBy('genres.id', 'genres.name')
            ->orderBy('count', 'desc')
            ->first();
        
        return $mostPlayedGenre ? $mostPlayedGenre->name : 'N/A';
    }

    private function getAverageSessionTime(User $user)
    {
        // Calculate average session time by getting daily totals first
        $dailyTotals = $user->playHistory()
            ->selectRaw('DATE(played_at) as date, SUM(duration_played_seconds) as daily_time')
            ->groupBy('date')
            ->pluck('daily_time');

        // Return the average of daily totals, or 0 if no data
        return $dailyTotals->count() > 0 ? $dailyTotals->avg() : 0;
    }

    // Additional methods required by admin.php routes
    public function activate(User $user)
    {
        $user->update(['is_active' => true]);
        return back()->with('success', 'User activated successfully');
    }

    public function deactivate(User $user)
    {
        $user->update(['is_active' => false]);
        return back()->with('success', 'User deactivated successfully');
    }

    public function ban(User $user)
    {
        $user->update(['is_active' => false]);
        return back()->with('success', 'User banned successfully');
    }

    public function unban(User $user)
    {
        $user->update(['is_active' => true]);
        return back()->with('success', 'User unbanned successfully');
    }

    public function toggleTwoFactor(User $user)
    {
        $user->update(['two_factor_enabled' => !$user->two_factor_enabled]);
        $status = $user->two_factor_enabled ? 'enabled' : 'disabled';
        return back()->with('success', "Two-factor authentication {$status} successfully");
    }

    public function assignRole(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|string|exists:roles,name'
        ]);

        $user = User::findOrFail($request->user_id);
        $user->assignRole($request->role, auth()->id());

        return back()->with('success', 'Role assigned successfully');
    }

    public function removeRole(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|string'
        ]);

        $user = User::findOrFail($request->user_id);
        $user->removeRole($request->role);

        return back()->with('success', 'Role removed successfully');
    }
}