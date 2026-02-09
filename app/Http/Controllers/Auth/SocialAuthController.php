<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\SocialAuthService;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Social Authentication Controller
 * 
 * Handles OAuth authentication with Google and Facebook
 */
class SocialAuthController extends Controller
{
    protected SocialAuthService $socialAuth;

    public function __construct(SocialAuthService $socialAuth)
    {
        $this->socialAuth = $socialAuth;
        $this->middleware('guest')->except(['unlink']);
    }

    /**
     * Redirect to OAuth provider
     * 
     * @param string $provider
     * @return \Illuminate\Http\RedirectResponse
     */
    public function redirect(string $provider)
    {
        $this->validateProvider($provider);

        try {
            return Socialite::driver($provider)->redirect();
        } catch (\Exception $e) {
            return redirect()->route('frontend.login')
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
        $this->validateProvider($provider);

        try {
            // Handle OAuth callback
            $result = $this->socialAuth->handleCallback($provider);
            
            // Login the user
            Auth::login($result['user'], true); // Remember me
            
            // Regenerate session for security
            request()->session()->regenerate();
            
            // Check if we should suggest profile completion
            if ($result['suggest_profile_completion']) {
                session()->flash('suggest_profile_completion', true);
                session()->flash('completion_percentage', $result['user']->profile_completion_percentage);
            }
            
            // Success message
            $message = $result['user']->wasRecentlyCreated 
                ? 'Welcome to LineOne Music! Your account has been created.'
                : 'Welcome back!';
            
            return redirect($result['redirect'])
                ->with('success', $message);
                
        } catch (\Laravel\Socialite\Two\InvalidStateException $e) {
            return redirect()->route('frontend.login')
                ->with('error', 'OAuth session expired. Please try again.');
                
        } catch (\Exception $e) {
            logger()->error('Social auth callback error', [
                'provider' => $provider,
                'error' => $e->getMessage(),
            ]);
            
            return redirect()->route('frontend.login')
                ->with('error', 'Unable to login with ' . ucfirst($provider) . '. Please try again or use email/password.');
        }
    }

    /**
     * Unlink social account
     * 
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function unlink(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('frontend.login');
        }

        try {
            $this->socialAuth->revokeSocialAuth($user);
            
            return back()->with('success', 'Social account unlinked successfully.');
            
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Validate OAuth provider
     * 
     * @param string $provider
     * @return void
     * @throws \Symfony\Component\HttpKernel\Exception\NotFoundHttpException
     */
    protected function validateProvider(string $provider): void
    {
        $allowedProviders = ['google', 'facebook'];
        
        if (!in_array($provider, $allowedProviders)) {
            abort(404, 'Invalid OAuth provider');
        }
    }
}
