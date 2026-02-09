<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
        then: function () {
            // Load global auth routes FIRST (highest priority)
            // This ensures login/register routes are available globally
            // and not trapped inside frontend.php
            Route::middleware('web')
                ->group(base_path('routes/auth.php'));
            
            // TEST ROUTES - Only in development/local environments
            if (app()->environment('local', 'development', 'testing')) {
                Route::middleware('web')
                    ->group(base_path('routes/test-routes.php'));
                
                // INERTIA TEST ROUTES - For testing SPA functionality
                Route::middleware('web')
                    ->group(base_path('routes/inertia-test.php'));
            }
            
            // MODULE ROUTES - Forum & Polls
            Route::middleware('web')
                ->group(base_path('routes/modules/forum.php'));
            
            // PAYMENT ROUTES - MTN MoMo
            Route::middleware('web')
                ->group(base_path('routes/mtn-momo.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \App\Http\Middleware\LaunchCountdownMiddleware::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'permission' => \App\Http\Middleware\PermissionMiddleware::class,
            'feature' => \App\Http\Middleware\FeatureMiddleware::class,
            'api.rate_limit' => \App\Http\Middleware\ApiRateLimitMiddleware::class,
            'secure.upload' => \App\Http\Middleware\SecureFileUploadMiddleware::class,
            'sacco.member' => \App\Http\Middleware\SaccoMemberMiddleware::class,
            'module.enabled' => \App\Http\Middleware\CheckModuleEnabled::class,
            'check.environment' => \App\Http\Middleware\CheckEnvironment::class,
            'webhook.rate_limit' => \App\Http\Middleware\WebhookRateLimiter::class,
            'loyalty.tier' => \App\Http\Middleware\CheckLoyaltyTierAccess::class,
        ]);

        // Add security headers to all requests
        $middleware->append(\App\Http\Middleware\SecurityHeadersMiddleware::class);
        
        // Add threat detection for all requests (logs to security channel for Wazuh)
        $middleware->append(\App\Http\Middleware\ThreatDetectionMiddleware::class);

        // Add geographic access control (blocks non-East-Africa traffic)
        $middleware->append(\App\Http\Middleware\GeoAccessMiddleware::class);

        // Configure Sanctum stateful domains (for SPA authentication)
        // Note: This is handled by Sanctum configuration in config/sanctum.php

        // Configure authentication redirects - use unprefixed route names
        // Note: Auth routes use global names (login, register) not prefixed (frontend.login)
        $middleware->redirectUsersTo(fn() => route('frontend.dashboard'));
        $middleware->redirectGuestsTo(function ($request) {
            // If accessing admin routes, redirect to admin login
            if ($request->is('admin/*') || $request->is('admin')) {
                return route('admin.login');
            }
            return route('login');
        });
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
