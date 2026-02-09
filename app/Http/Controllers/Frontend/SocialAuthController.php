<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\Auth\SocialAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

/**
 * Social Authentication Controller
 * 
 * Handles OAuth authentication via Google, Facebook, and other providers
 * Implements painless signup - users can sign up with just social auth
 */
class SocialAuthController extends Controller
{
    protected SocialAuthService $socialAuthService;

    public function __construct(SocialAuthService $socialAuthService)
    {
        $this->socialAuthService = $socialAuthService;
    }

    /**
     * Redirect to OAuth provider
     * 
     * @param string $provider (google, facebook)
     * @return \Illuminate\Http\RedirectResponse
     */
    public function redirect(string $provider)
    {
        // Validate provider
        if (!in_array($provider, ['google', 'facebook'])) {
            return redirect()->route('login')
                ->with('error', 'Invalid authentication provider');
        }

        try {
            return Socialite::driver($provider)->redirect();
        } catch (\Exception $e) {
            logger()->error('Social auth redirect error', [
                'provider' => $provider,
                'error' => $e->getMessage(),
            ]);

            return redirect()->route('login')
                ->with('error', 'Unable to connect to ' . ucfirst($provider) . '. Please try again.');
        }
    }

    /**
     * Handle OAuth callback from provider
     * 
     * @param string $provider
     * @return \Illuminate\Http\RedirectResponse
     */
    public function callback(string $provider)
    {
        // Validate provider
        if (!in_array($provider, ['google', 'facebook'])) {
            return redirect()->route('login')
                ->with('error', 'Invalid authentication provider');
        }

        try {
            // Get user from provider
            $socialUser = Socialite::driver($provider)->user();

            // Find or create user via service
            $user = $this->socialAuthService->findOrCreateUser($provider, $socialUser);

            // Log the user in
            Auth::login($user, true); // Remember me

            // Log activity
            $user->logActivity('login_via_' . $provider, [
                'provider' => $provider,
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            // Redirect based on profile completion
            if ($user->profile_completion_percentage < 50) {
                return redirect()->route('frontend.profile.edit')
                    ->with('success', 'Welcome! Please complete your profile to get started.')
                    ->with('show_completion_wizard', true);
            }

            return redirect()->intended(route('frontend.dashboard'))
                ->with('success', 'Welcome back, ' . $user->name . '!');

        } catch (\Exception $e) {
            logger()->error('Social auth callback error', [
                'provider' => $provider,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('login')
                ->with('error', 'Authentication failed. Please try again or use email/password.');
        }
    }

    /**
     * Disconnect social account
     * 
     * @param string $provider
     * @return \Illuminate\Http\RedirectResponse
     */
    public function disconnect(string $provider)
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Validate provider
        if (!in_array($provider, ['google', 'facebook'])) {
            return back()->with('error', 'Invalid provider');
        }

        // Check if this is the only auth method
        if (!$user->password && $user->provider === $provider) {
            return back()->with('error', 'Cannot disconnect your only login method. Please set a password first.');
        }

        // Disconnect
        $user->update([
            'provider' => null,
            'provider_id' => null,
            'provider_token' => null,
            'provider_refresh_token' => null,
        ]);

        // Log activity
        $user->logActivity('social_account_disconnected', [
            'provider' => $provider,
        ]);

        return back()->with('success', ucfirst($provider) . ' account disconnected successfully');
    }

    /**
     * Link social account to existing user
     * 
     * @param string $provider
     * @return \Illuminate\Http\RedirectResponse
     */
    public function link(string $provider)
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Validate provider
        if (!in_array($provider, ['google', 'facebook'])) {
            return back()->with('error', 'Invalid provider');
        }

        // Check if already linked
        if ($user->provider === $provider) {
            return back()->with('info', ucfirst($provider) . ' account is already linked');
        }

        // Store intent in session
        session(['social_link_intent' => [
            'provider' => $provider,
            'user_id' => $user->id,
        ]]);

        return Socialite::driver($provider)->redirect();
    }

    /**
     * Handle callback for linking social account
     * 
     * @param string $provider
     * @return \Illuminate\Http\RedirectResponse
     */
    public function linkCallback(string $provider)
    {
        $user = Auth::user();
        $intent = session('social_link_intent');

        if (!$user || !$intent || $intent['provider'] !== $provider) {
            return redirect()->route('frontend.settings')
                ->with('error', 'Link request expired or invalid');
        }

        try {
            $socialUser = Socialite::driver($provider)->user();

            // Check if this social account is already used by another user
            $existingUser = \App\Models\User::where('provider', $provider)
                ->where('provider_id', $socialUser->getId())
                ->where('id', '!=', $user->id)
                ->first();

            if ($existingUser) {
                return redirect()->route('frontend.settings')
                    ->with('error', 'This ' . ucfirst($provider) . ' account is already linked to another user');
            }

            // Link account
            $user->update([
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'provider_token' => $socialUser->token,
                'provider_refresh_token' => $socialUser->refreshToken ?? null,
            ]);

            // Log activity
            $user->logActivity('social_account_linked', [
                'provider' => $provider,
            ]);

            // Clear intent
            session()->forget('social_link_intent');

            return redirect()->route('frontend.settings')
                ->with('success', ucfirst($provider) . ' account linked successfully!');

        } catch (\Exception $e) {
            logger()->error('Social link callback error', [
                'provider' => $provider,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->route('frontend.settings')
                ->with('error', 'Failed to link ' . ucfirst($provider) . ' account. Please try again.');
        }
    }
}
