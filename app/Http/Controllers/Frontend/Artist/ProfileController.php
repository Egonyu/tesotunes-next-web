<?php

namespace App\Http\Controllers\Frontend\Artist;

use App\Http\Controllers\Controller;
use App\Models\Genre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function show()
    {
        $user = Auth::user();
        $genres = Genre::orderBy('name')->get();

        return view('frontend.artist.profile.index', compact('user', 'genres'));
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'stage_name' => ['required', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone_number' => ['required', 'string', 'max:20', Rule::unique('users')->ignore($user->id)],
            'country' => 'nullable|string|max:100',
            'bio' => 'nullable|string|max:500',
            'primary_genre_id' => 'nullable|exists:genres,id',
            'genres' => 'nullable|array',
            'genres.*' => 'exists:genres,id',
            'influences' => 'nullable|string|max:255',
            'career_start_year' => 'nullable|integer|min:1950|max:' . date('Y'),
            'record_label' => 'nullable|string|max:255',
            'payment_method' => 'nullable|in:mobile_money,bank_transfer',
            'mobile_money_number' => 'nullable|string|max:20',
            'instagram' => 'nullable|string|max:50',
            'twitter' => 'nullable|string|max:50',
            'youtube' => 'nullable|url|max:255',
            'tiktok' => 'nullable|string|max:50',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg|max:5120', // 5MB max
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

        // Update user profile
        $user->update([
            'full_name' => $validated['full_name'],
            'stage_name' => $validated['stage_name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'],
            'country' => $validated['country'],
            'bio' => $validated['bio'],
            'primary_genre_id' => $validated['primary_genre_id'],
            'influences' => $validated['influences'],
            'career_start_year' => $validated['career_start_year'],
            'record_label' => $validated['record_label'],
            'payment_method' => $validated['payment_method'],
            'mobile_money_number' => $validated['mobile_money_number'],
            'instagram' => $validated['instagram'],
            'twitter' => $validated['twitter'],
            'youtube' => $validated['youtube'],
            'tiktok' => $validated['tiktok'],
            'avatar' => $validated['avatar'] ?? $user->avatar,
        ]);

        // Sync genres if provided
        if (isset($validated['genres'])) {
            $user->genres()->sync($validated['genres']);
        }

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

        return redirect()->route('frontend.artist.profile')
            ->with('success', 'Profile updated successfully!');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors(['current_password' => 'The current password is incorrect.']);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Password updated successfully!',
            ]);
        }

        return redirect()->route('frontend.artist.profile')
            ->with('success', 'Password updated successfully!');
    }
}