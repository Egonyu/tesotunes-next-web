<?php

namespace App\View\Composers;

use Illuminate\View\View;
use App\Models\Setting;

class SettingsComposer
{
    /**
     * Bind data to the view.
     */
    public function compose(View $view): void
    {
        $view->with('settings', new SettingsHelper());
    }
}

class SettingsHelper
{
    /**
     * Check if phone verification is enabled
     */
    public function phoneVerificationEnabled(): bool
    {
        return Setting::get('phone_verification_enabled', true);
    }

    /**
     * Check if awards system is enabled
     */
    public function awardsEnabled(): bool
    {
        return Setting::get('awards_system_enabled', true);
    }

    /**
     * Check if events module is enabled
     */
    public function eventsEnabled(): bool
    {
        return Setting::get('events_module_enabled', true);
    }

    /**
     * Check if ticket sales are enabled
     */
    public function ticketsEnabled(): bool
    {
        return Setting::get('ticket_sales_enabled', true);
    }

    /**
     * Check if artist registration is enabled
     */
    public function artistRegistrationEnabled(): bool
    {
        return Setting::get('artist_registration_enabled', true);
    }

    /**
     * Check if music streaming is enabled
     */
    public function musicStreamingEnabled(): bool
    {
        return Setting::get('music_streaming_enabled', true);
    }

    /**
     * Check if music downloads are enabled
     */
    public function musicDownloadsEnabled(): bool
    {
        return Setting::get('music_downloads_enabled', true);
    }

    /**
     * Check if social features are enabled
     */
    public function socialFeaturesEnabled(): bool
    {
        return Setting::get('social_features_enabled', true);
    }

    /**
     * Check if community promotions are enabled
     */
    public function promotionsEnabled(): bool
    {
        return Setting::get('community_promotions_enabled', true);
    }

    /**
     * Check if credit system is enabled
     */
    public function creditsEnabled(): bool
    {
        return Setting::get('credit_system_enabled', true);
    }

    /**
     * Check if subscription system is enabled
     */
    public function subscriptionsEnabled(): bool
    {
        return Setting::get('subscription_system_enabled', true);
    }

    /**
     * Check if playlist creation is enabled
     */
    public function playlistsEnabled(): bool
    {
        return Setting::get('playlist_creation_enabled', true);
    }

    /**
     * Get a specific setting value
     */
    public function get(string $key, $default = null)
    {
        return Setting::get($key, $default);
    }

    /**
     * Check if any setting is enabled
     */
    public function isEnabled(string $key, bool $default = true): bool
    {
        return Setting::get($key, $default);
    }
}