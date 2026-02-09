<?php

namespace App\Http\Controllers\Frontend\Artist;

use App\Models\User;
use App\Models\Role;
use App\Models\Genre;
use App\Models\Artist;
use App\Models\KYCDocument;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Services\ActivityService;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\File;
use App\Services\ProfileCompletionService;
use App\Services\Auth\ArtistVerificationService;

/**
 * Artist Application Controller
 *
 * Handles artist application submission and status viewing
 */
class ArtistApplicationController extends Controller
{
    protected ArtistVerificationService $verificationService;
    protected ProfileCompletionService $profileService;

    public function __construct(
        ArtistVerificationService $verificationService,
        ProfileCompletionService $profileService
    ) {
        $this->verificationService = $verificationService;
        $this->profileService = $profileService;
        $this->middleware('auth');
    }

    /**
     * Show artist application form (SIMPLIFIED - No barriers!)
     *
     * @return \Illuminate\View\View|\Illuminate\Http\RedirectResponse
     */
    public function create()
    {
        $user = Auth::user();

        // Check if user already has an artist profile
        if ($user->artist) {
            return redirect()->route('frontend.artist.dashboard')
                ->with('info', 'You already have an artist account');
        }

        // REMOVED: Profile completion barrier - users can apply immediately!
        // Artists can complete verification docs AFTER account creation

        // Get genres for the form
        $genres = Genre::orderBy('name')->get();

        return view('frontend.artist.application.create', [
            'user' => $user,
            'genres' => $genres,
        ]);
    }

    /**
     * Store artist application (INSTANT - No friction!)
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // SIMPLIFIED validation - Only essentials required
        // KYC documents moved to separate verification workflow
        $validated = $request->validate([
            // Basic Info (REQUIRED - Bare minimum)
            'stage_name' => 'required|string|max:255|unique:artists,stage_name',
            'phone_number' => 'required|string|max:20',

            // Additional Info (OPTIONAL - Can be added later)
            'bio' => 'nullable|string|max:2000',
            'genre_id' => 'nullable|exists:genres,id',
            'email' => 'nullable|email',
            'whatsapp_number' => 'nullable|string|max:20',

            // REMOVED: Identity verification moved to post-signup verification
            // These are now handled in a separate admin-initiated KYC workflow
            // 'national_id' => 'required|string|size:14|regex:/^[A-Z0-9]{14}$/',
            // 'national_id_front' => ['required', File::image()->max(5 * 1024)],
            // 'national_id_back' => ['required', File::image()->max(5 * 1024)],
            // 'selfie_with_id' => ['required', File::image()->max(5 * 1024)],

            // Social Media (OPTIONAL - Can be added to profile later)
            'instagram_url' => 'nullable|url',
            'twitter_url' => 'nullable|url',
            'facebook_url' => 'nullable|url',
            'youtube_url' => 'nullable|url',
            'tiktok_url' => 'nullable|url',
        ]);

        try {
            // CREATE ARTIST PROFILE INSTANTLY (No approval needed for account creation)
            $artist = Artist::create([
                'user_id' => $user->id,
                'stage_name' => $validated['stage_name'],
                'slug' => Str::slug($validated['stage_name']),
                'bio' => $validated['bio'] ?? null,
                'primary_genre_id' => $validated['genre_id'] ?? null,

                // Verification status - starts as pending
                'verification_status' => 'pending',
                'is_verified' => false,
                'can_upload' => false, // Can't upload until verified
                'require_approval' => true, // All uploads need approval
                'status' => 'active',

                // Default limits
                'monthly_upload_limit' => 10,
                'commission_rate' => 0.30, // 30% platform fee

                // Social links
                'social_links' => [
                    'instagram' => $validated['instagram_url'] ?? null,
                    'twitter' => $validated['twitter_url'] ?? null,
                    'facebook' => $validated['facebook_url'] ?? null,
                    'youtube' => $validated['youtube_url'] ?? null,
                    'tiktok' => $validated['tiktok_url'] ?? null,
                ],
            ]);

            // Update user record using database update
            User::where('id', $user->id)->update([
                'stage_name' => $validated['stage_name'],
                'phone_number' => $validated['phone_number'],
            ]);

            // Assign artist role (if not already assigned)
            $artistRole = Role::where('name', 'artist')->first();
            if ($artistRole) {
                // Check if user already has this role
                $hasRole = DB::table('user_roles')
                    ->where('user_id', $user->id)
                    ->where('role_id', $artistRole->id)
                    ->where('is_active', true)
                    ->exists();

                if (!$hasRole) {
                    // Use direct database insert to avoid method resolution issues
                    DB::table('user_roles')->updateOrInsert(
                        [
                            'user_id' => $user->id,
                            'role_id' => $artistRole->id,
                        ],
                        [
                            'assigned_at' => now(),
                            'assigned_by' => Auth::id(),
                            'is_active' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );

                    // Update user's artist status
                    if (!$user->is_artist) {
                        User::where('id', $user->id)->update(['is_artist' => true]);
                        
                        // Assign Artist role if not already assigned
                        if (!$user->roles()->where('name', 'Artist')->exists()) {
                            $artistRole = \App\Models\Role::where('name', 'Artist')->first();
                            if ($artistRole) {
                                $user->roles()->attach($artistRole->id, ['assigned_at' => now()]);
                            }
                        }
                    }
                }
            }

            // Log activity
            ActivityService::log($user, 'became_artist', $artist, [
                'stage_name' => $artist->stage_name,
            ]);

            return redirect()->route('frontend.artist.dashboard')
                ->with('success', 'Welcome! Your artist account has been created. Complete identity verification to start uploading music.');

        } catch (\Exception $e) {
            logger()->error('Artist account creation error', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to create artist account: ' . $e->getMessage());
        }
    }

    /**
     * Show application status
     *
     * @return \Illuminate\View\View|\Illuminate\Http\RedirectResponse
     */
    public function status()
    {
        $user = Auth::user();

        // Check if user has an artist profile
        if (!$user->artist) {
            return redirect()->route('artist.application.create')
                ->with('info', 'You have not submitted an artist application yet');
        }

        $artist = $user->artist;

        // If already verified, redirect to artist dashboard
        if ($artist->is_verified) {
            return redirect()->route('frontend.artist.dashboard')
                ->with('success', 'Your artist account is verified!');
        }

        $kycDocuments = KYCDocument::where('user_id', $user->id)->latest()->get();

        return view('frontend.artist.application.status', [
            'user' => $user,
            'artist' => $artist,
            'kycDocuments' => $kycDocuments,
            'submittedAt' => $artist->application_submitted_at ?? $artist->created_at,
            'applicationNotes' => $artist->application_notes,
        ]);
    }

    /**
     * Show application edit form (for resubmission)
     *
     * @return \Illuminate\View\View|\Illuminate\Http\RedirectResponse
     */
    public function edit()
    {
        $user = Auth::user();
        $artist = $user->artist;

        // Only allow edit if application was rejected
        if (!$artist || $artist->verification_status !== 'rejected') {
            return redirect()->route('artist.application.status')
                ->with('error', 'You cannot edit this application');
        }

        $genres = Genre::orderBy('name')->get();

        return view('frontend.artist.application.edit', [
            'user' => $user,
            'artist' => $artist,
            'genres' => $genres,
        ]);
    }

    /**
     * Update application (resubmit after rejection)
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        $artist = $user->artist;

        if (!$artist || $artist->verification_status !== 'rejected') {
            return redirect()->route('artist.application.status');
        }

        // Validate updated data (simplified - documents handled separately)
        $validated = $request->validate([
            'stage_name' => 'required|string|max:255|unique:artists,stage_name,' . $artist->id,
            'bio' => 'nullable|string|max:2000',
            'genre_id' => 'required|exists:genres,id',
            'phone_number' => 'required|string|max:20',
            'email' => 'nullable|email',
            'whatsapp_number' => 'nullable|string|max:20',
            'instagram_url' => 'nullable|url',
            'twitter_url' => 'nullable|url',
            'facebook_url' => 'nullable|url',
            'youtube_url' => 'nullable|url',
            'tiktok_url' => 'nullable|url',
        ]);

        try {
            // Update artist profile
            $artist->update([
                'stage_name' => $validated['stage_name'],
                'slug' => Str::slug($validated['stage_name']),
                'bio' => $validated['bio'] ?? null,
                'primary_genre_id' => $validated['genre_id'],
                'verification_status' => 'pending',
                'rejection_reason' => null,
                'social_links' => [
                    'instagram' => $validated['instagram_url'] ?? null,
                    'twitter' => $validated['twitter_url'] ?? null,
                    'facebook' => $validated['facebook_url'] ?? null,
                    'youtube' => $validated['youtube_url'] ?? null,
                    'tiktok' => $validated['tiktok_url'] ?? null,
                ],
            ]);

            // Update user record
            User::where('id', $user->id)->update([
                'stage_name' => $validated['stage_name'],
                'phone_number' => $validated['phone_number'],
            ]);

            return redirect()->route('artist.application.status')
                ->with('success', 'Your application has been resubmitted for review');

        } catch (\Exception $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }
    }
}
