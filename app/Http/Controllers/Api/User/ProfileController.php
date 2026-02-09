<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();

            $user->load([
                'settings',
                'subscription',
                'playlists' => function($query) {
                    $query->where('is_public', true)->latest()->limit(5);
                },
                'followers',
                'following'
            ]);

            // Add computed attributes
            $user->stats = [
                'total_listening_time' => $user->getTotalListeningTimeAttribute(),
                'total_downloads' => $user->downloads()->count(),
                'playlists_count' => $user->playlists()->count(),
                'followers_count' => $user->followers()->count(),
                'following_count' => $user->following()->count(),
                'favorite_genres' => $user->getFavoriteGenresAttribute(),
            ];

            return response()->json([
                'success' => true,
                'data' => $user
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'bio' => 'nullable|string|max:500',
                'location' => 'nullable|string|max:255',
                'website' => 'nullable|url|max:255',
                'phone' => 'nullable|string|max:20',
                'date_of_birth' => 'nullable|date|before:today',
                'gender' => 'nullable|in:male,female,other,prefer_not_to_say',
                'avatar' => 'nullable|image|max:2048', // 2MB max
                'cover_image' => 'nullable|image|max:5120', // 5MB max
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updateData = $request->only([
                'name', 'bio', 'location', 'website', 'phone',
                'date_of_birth', 'gender'
            ]);

            // Handle avatar upload
            if ($request->hasFile('avatar')) {
                // Delete old avatar
                if ($user->avatar) {
                    Storage::disk('public')->delete($user->avatar);
                }

                $avatarPath = $request->file('avatar')->store('avatars', 'public');
                $updateData['avatar'] = $avatarPath;
            }

            // Handle cover image upload
            if ($request->hasFile('cover_image')) {
                // Delete old cover image
                if ($user->cover_image) {
                    Storage::disk('public')->delete($user->cover_image);
                }

                $coverPath = $request->file('cover_image')->store('covers', 'public');
                $updateData['cover_image'] = $coverPath;
            }

            $user->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => $user->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getUserProfile(Request $request, User $user): JsonResponse
    {
        try {
            $currentUser = auth()->user();

            // Check privacy settings
            if (!$user->settings?->profile_public && (!$currentUser || $user->id !== $currentUser->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'This profile is private'
                ], 403);
            }

            $user->load([
                'settings',
                'playlists' => function($query) use ($currentUser) {
                    $query->where('is_public', true);
                    if ($currentUser && $user->id === $currentUser->id) {
                        $query->orWhere('user_id', $currentUser->id);
                    }
                    $query->latest()->limit(10);
                }
            ]);

            // Add computed attributes
            $user->stats = [
                'playlists_count' => $user->playlists()->where('is_public', true)->count(),
                'followers_count' => $user->followers()->count(),
                'following_count' => $user->following()->count(),
            ];

            // Add relationship status with current user
            if ($currentUser && $user->id !== $currentUser->id) {
                $user->is_following = $currentUser->following()
                    ->where('followable_type', User::class)
                    ->where('followable_id', $user->id)
                    ->exists();
            }

            return response()->json([
                'success' => true,
                'data' => $user
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}