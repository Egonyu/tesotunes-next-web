<?php

namespace App\Http\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\User;
use App\Services\Settings\EventSettingsService;
use App\Services\Settings\SecuritySettingsService;
use App\Services\Settings\AwardSettingsService;
use App\Services\Settings\ArtistSettingsService;
use App\Services\Settings\StorageSettingsService;
use App\Services\Settings\AuthenticationSettingsService;
use App\Services\Settings\PodcastSettingsService;
use App\Services\EnvironmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SettingsController extends Controller
{
    public function __construct(
        protected EventSettingsService $eventSettingsService,
        protected SecuritySettingsService $securitySettingsService,
        protected AwardSettingsService $awardSettingsService,
        protected ArtistSettingsService $artistSettingsService,
        protected StorageSettingsService $storageSettingsService,
        protected AuthenticationSettingsService $authenticationSettingsService,
        protected PodcastSettingsService $podcastSettingsService
    ) {}

    public function index()
    {
        try {
            // Load mobile verification stats
            $mobileStats = [
                'total_users' => User::count(),
                'verified_users' => User::whereNotNull('phone_verified_at')->count(),
                'pending_verification' => User::whereNull('phone_verified_at')->whereNotNull('phone')->count(),
                'unverified_artists' => User::where('is_artist', true)->whereNull('phone_verified_at')->count(),
                'verification_rate' => User::count() > 0 ? round((User::whereNotNull('phone_verified_at')->count() / User::count()) * 100, 1) : 0
            ];

            // Load pending verification users
            $pendingUsers = User::whereNull('phone_verified_at')
                ->whereNotNull('phone')
                ->orderBy('created_at', 'desc')
                ->limit(20)
                ->get();

            // Load frontend design settings
            $frontendMobileSettings = [];
            $mobileSettingsData = \App\Models\FrontendSetting::where('type', 'mobile')
                ->orderBy('category')
                ->orderBy('key')
                ->get();
            foreach ($mobileSettingsData as $setting) {
                $frontendMobileSettings[$setting->key] = $setting->value;
            }

            $frontendDesktopSettings = [];
            $desktopSettingsData = \App\Models\FrontendSetting::where('type', 'desktop')
                ->orderBy('category')
                ->orderBy('key')
                ->get();
            foreach ($desktopSettingsData as $setting) {
                $frontendDesktopSettings[$setting->key] = $setting->value;
            }

            // Load general settings
            $generalSettings = [
                'site_logo' => Setting::get('site_logo', '/images/app-logo.svg'),
                'platform_name' => Setting::get('platform_name', 'LineOne Music'),
                'platform_url' => Setting::get('platform_url', config('app.url')),
                'platform_description' => Setting::get('platform_description', ''),
                'support_email' => Setting::get('support_email', config('mail.from.address')),
                'admin_contact' => Setting::get('admin_contact', config('mail.from.address')),
                'app_environment' => Setting::get('app_environment', config('app.env')),
                'default_language' => Setting::get('default_language', 'en'),
                'default_currency' => Setting::get('default_currency', 'UGX'),
                'timezone' => Setting::get('timezone', 'Africa/Kampala'),
                // Feature toggles
                'music_streaming_enabled' => Setting::get('music_streaming_enabled', true),
                'music_downloads_enabled' => Setting::get('music_downloads_enabled', true),
                'events_tickets_enabled' => Setting::get('events_tickets_enabled', true),
                'awards_system_enabled' => Setting::get('awards_system_enabled', false),
                'user_comments_enabled' => Setting::get('user_comments_enabled', true),
                'artist_following_enabled' => Setting::get('artist_following_enabled', true),
                'playlists_enabled' => Setting::get('playlists_enabled', true),
                'social_sharing_enabled' => Setting::get('social_sharing_enabled', false),
                'store_enabled' => Setting::get('store_enabled', true),
                'forums_enabled' => Setting::get('forums_enabled', false),
                'polls_enabled' => Setting::get('polls_enabled', false),
                'credits_enabled' => Setting::get('credits_enabled', true),
            ];

            // Load user management settings
            $userSettings = [
                'user_registration_enabled' => Setting::get('user_registration_enabled', true),
                'email_verification_required' => Setting::get('email_verification_required', true),
                'artist_approval_required' => Setting::get('artist_approval_required', false),
                'social_login_enabled' => Setting::get('social_login_enabled', true),
                'default_user_role' => Setting::get('default_user_role', 'user'),
                'registration_limit_per_ip' => Setting::get('registration_limit_per_ip', 5),
                
                // Permissions
                'user_can_upload_music' => Setting::get('user_can_upload_music', true),
                'user_can_create_playlists' => Setting::get('user_can_create_playlists', true),
                'user_can_comment' => Setting::get('user_can_comment', true),
                'user_can_download' => Setting::get('user_can_download', true),
                'artist_can_create_events' => Setting::get('artist_can_create_events', true),
                'artist_can_sell_tickets' => Setting::get('artist_can_sell_tickets', true),
                'artist_can_monetize' => Setting::get('artist_can_monetize', true),
                'artist_has_analytics' => Setting::get('artist_has_analytics', true),
                
                // Restrictions
                'max_upload_size_mb' => Setting::get('max_upload_size_mb', 100),
                'daily_upload_limit' => Setting::get('daily_upload_limit', 10),
                'max_playlists_per_user' => Setting::get('max_playlists_per_user', 50),
                'max_events_per_artist_monthly' => Setting::get('max_events_per_artist_monthly', 5),
                'comment_character_limit' => Setting::get('comment_character_limit', 500),
                'session_timeout_minutes' => Setting::get('session_timeout_minutes', 120),
                'profanity_filter_enabled' => Setting::get('profanity_filter_enabled', false),
                'auto_moderate_comments' => Setting::get('auto_moderate_comments', false),
                
                // Moderation
                'auto_ban_after_violations' => Setting::get('auto_ban_after_violations', 3),
                'warnings_before_ban' => Setting::get('warnings_before_ban', 2),
                'spam_detection_enabled' => Setting::get('spam_detection_enabled', false),
                'rate_limiting_enabled' => Setting::get('rate_limiting_enabled', true),
                'ip_blocking_enabled' => Setting::get('ip_blocking_enabled', false),
                'moderation_email_notifications' => Setting::get('moderation_email_notifications', true),
            ];

            // Load credit system settings
            $creditSettings = [
                'credits_enabled' => Setting::get('credits_enabled', true),
                'credits_per_song_upload' => Setting::get('credits_per_song_upload', 5),
                'credits_per_event_ticket' => Setting::get('credits_per_event_ticket', 10),
                'credit_purchase_enabled' => Setting::get('credit_purchase_enabled', true),
                'credit_to_ugx_rate' => Setting::get('credit_to_ugx_rate', 100),
                // Credit packages
                'package_1_credits' => Setting::get('package_1_credits', 100),
                'package_1_price' => Setting::get('package_1_price', 10000),
                'package_1_active' => Setting::get('package_1_active', true),
                'package_2_credits' => Setting::get('package_2_credits', 500),
                'package_2_price' => Setting::get('package_2_price', 50000),
                'package_2_active' => Setting::get('package_2_active', true),
                'package_3_credits' => Setting::get('package_3_credits', 1000),
                'package_3_price' => Setting::get('package_3_price', 100000),
                'package_3_active' => Setting::get('package_3_active', true),
            ];

            // Load payment settings
            $paymentSettings = [
                'mtn_money_enabled' => Setting::get('payment_mtn_money_enabled', true),
                'airtel_money_enabled' => Setting::get('payment_airtel_money_enabled', true),
                'mtn_api_key' => Setting::get('payment_mtn_api_key', ''),
                'airtel_api_key' => Setting::get('payment_airtel_api_key', ''),
                'minimum_payout' => Setting::get('payment_minimum_payout', 50000),
            ];

            // Load notification settings
            $notificationSettings = [
                'notify_new_registrations' => Setting::get('notifications_new_registrations', true),
                'notify_new_uploads' => Setting::get('notifications_new_uploads', true),
                'notify_payout_requests' => Setting::get('notifications_payout_requests', true),
                'notify_content_reports' => Setting::get('notifications_content_reports', true),
                'smtp_host' => Setting::get('mail_smtp_host', ''),
                'smtp_port' => Setting::get('mail_smtp_port', 587),
            ];

            // Load mobile verification settings
            $mobileSettings = [
                'mobile_verification_enabled' => Setting::get('mobile_verification_enabled', true),
                'mobile_verification_required_for_events' => Setting::get('mobile_verification_required_for_events', false),
                'mobile_verification_required_for_artists' => Setting::get('mobile_verification_required_for_artists', false),
                'sms_provider' => Setting::get('mobile_verification_sms_provider', 'local'),
            ];

            // Load security settings via service
            $securitySettings = $this->securitySettingsService->getSettings();

            // Load awards settings via service
            $awardsSettings = $this->awardSettingsService->getSettings();

            // Load events settings via service
            $eventsSettings = $this->eventSettingsService->getSettings();

            // Load artist settings via service
            $artistSettings = $this->artistSettingsService->getSettings();

            // Load storage settings via service
            $storageSettings = $this->storageSettingsService->getSettings();
            $storageStats = $this->storageSettingsService->getStorageStats();

            // Load authentication settings via service
            $authenticationSettings = $this->authenticationSettingsService->getSettings();

            // Load podcast settings via service
            $podcastSettings = $this->podcastSettingsService->getSettings();

            // Load Google Analytics settings
            $googleAnalyticsSettings = [
                'google_analytics_enabled' => Setting::get('google_analytics_enabled', false),
                'google_analytics_measurement_id' => Setting::get('google_analytics_measurement_id', ''),
                'google_analytics_event_tracking' => Setting::get('google_analytics_event_tracking', true),
                'google_analytics_ecommerce_tracking' => Setting::get('google_analytics_ecommerce_tracking', true),
                'google_analytics_ip_anonymization' => Setting::get('google_analytics_ip_anonymization', true),
                'google_analytics_custom_events' => Setting::get('google_analytics_custom_events', ''),
            ];

            // Load Ads Management settings
            $adsSettings = [
                'google_adsense_enabled' => Setting::get('google_adsense_enabled', false),
                'google_adsense_publisher_id' => Setting::get('google_adsense_publisher_id', ''),
                'google_adsense_auto_ads' => Setting::get('google_adsense_auto_ads', false),
                'adsense_header_slot' => Setting::get('adsense_header_slot', ''),
                'adsense_sidebar_slot' => Setting::get('adsense_sidebar_slot', ''),
                'adsense_footer_slot' => Setting::get('adsense_footer_slot', ''),
                'placement_header' => Setting::get('ads_placement_header', true),
                'placement_sidebar' => Setting::get('ads_placement_sidebar', true),
                'placement_infeed' => Setting::get('ads_placement_infeed', true),
                'placement_footer' => Setting::get('ads_placement_footer', true),
                'placement_mobile_interstitial' => Setting::get('ads_placement_mobile_interstitial', false),
                'mobile_optimized_ads' => Setting::get('mobile_optimized_ads', true),
            ];

            // Load custom ads (you may want to create an Ad model later)
            $customAds = [];

            return view('backend.admin.settings.index', compact(
                'mobileStats',
                'pendingUsers',
                'generalSettings',
                'userSettings',
                'creditSettings',
                'paymentSettings',
                'notificationSettings',
                'mobileSettings',
                'securitySettings',
                'awardsSettings',
                'eventsSettings',
                'artistSettings',
                'storageSettings',
                'storageStats',
                'authenticationSettings',
                'podcastSettings',
                'googleAnalyticsSettings',
                'adsSettings',
                'customAds',
                'frontendMobileSettings',
                'frontendDesktopSettings'
            ));
        } catch (\Exception $e) {
            Log::error('Settings page error: ' . $e->getMessage());
            return response('Error loading settings: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update general settings
     */
    public function update(Request $request)
    {
        try {
            foreach ($request->except(['_token']) as $key => $value) {
                Setting::set($key, $value);
            }

            return redirect()->back()->with('success', 'Settings updated successfully');
        } catch (\Exception $e) {
            Log::error('Settings update error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update settings: ' . $e->getMessage());
        }
    }

    /**
     * Initialize default settings
     */
    public function initializeDefaults()
    {
        try {
            $defaults = [
                'site_name' => 'TesoTunes',
                'site_description' => 'Your music streaming platform',
                'maintenance_mode' => false,
                'user_registration' => true,
                'user_email_verification' => true,
                'user_auto_approve' => false,
                'user_allow_social_login' => true,
                'credits_enabled' => true,
                'credits_per_song_upload' => 5,
                'credits_per_event_ticket' => 10,
                'credit_purchase_enabled' => true,
                'payment_mtn_money_enabled' => true,
                'payment_airtel_money_enabled' => true,
                'payment_minimum_payout' => 50000,
                'notifications_new_registrations' => true,
                'notifications_new_uploads' => true,
                'notifications_payout_requests' => true,
                'notifications_content_reports' => true,
                'mobile_verification_enabled' => true,
            ];

            foreach ($defaults as $key => $value) {
                Setting::set($key, $value);
            }

            return redirect()->back()->with('success', 'Default settings initialized successfully');
        } catch (\Exception $e) {
            Log::error('Initialize defaults error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to initialize defaults: ' . $e->getMessage());
        }
    }

    public function updateGeneral(Request $request)
    {
        $tab = $request->input('tab', 'platform');

        try {
            switch ($tab) {
                case 'platform':
                    $request->validate([
                        'platform_name' => 'nullable|string|max:255',
                        'platform_url' => 'nullable|string',
                        'platform_description' => 'nullable|string|max:1000',
                        'support_email' => 'nullable|email',
                        'admin_contact' => 'nullable|email',
                        'site_logo' => 'nullable|image|mimes:png,jpg,jpeg,svg,webp|max:2048',
                    ]);

                    // Handle environment toggle - it comes as 1/0 or true/false from checkbox
                    $envValue = $request->input('app_environment');
                    $newEnvironment = filter_var($envValue, FILTER_VALIDATE_BOOLEAN) ? 'production' : 'development';
                    
                    $settings = [
                        'platform_name' => $request->input('platform_name'),
                        'platform_url' => $request->input('platform_url'),
                        'platform_description' => $request->input('platform_description'),
                        'support_email' => $request->input('support_email'),
                        'admin_contact' => $request->input('admin_contact'),
                        'app_environment' => $newEnvironment,
                    ];
                    
                    // Handle logo upload
                    if ($request->hasFile('site_logo')) {
                        $file = $request->file('site_logo');
                        $filename = 'site-logo-' . time() . '.' . $file->getClientOriginalExtension();
                        $file->move(public_path('images'), $filename);
                        $settings['site_logo'] = '/images/' . $filename;
                        
                        // Delete old logo if it's not the default
                        $oldLogo = Setting::get('site_logo', '/images/app-logo.svg');
                        if ($oldLogo && $oldLogo !== '/images/app-logo.svg' && file_exists(public_path($oldLogo))) {
                            @unlink(public_path($oldLogo));
                        }
                    } elseif ($request->input('remove_logo') === '1') {
                        // Remove custom logo and reset to default
                        $oldLogo = Setting::get('site_logo', '/images/app-logo.svg');
                        if ($oldLogo && $oldLogo !== '/images/app-logo.svg' && file_exists(public_path($oldLogo))) {
                            @unlink(public_path($oldLogo));
                        }
                        $settings['site_logo'] = '/images/app-logo.svg';
                    }
                    
                    // Switch environment using the service
                    EnvironmentService::switchEnvironment($newEnvironment);
                    break;

                case 'features':
                    $settings = [
                        'music_streaming_enabled' => $request->boolean('music_streaming_enabled'),
                        'music_downloads_enabled' => $request->boolean('music_downloads_enabled'),
                        'events_tickets_enabled' => $request->boolean('events_tickets_enabled'),
                        'awards_system_enabled' => $request->boolean('awards_system_enabled'),
                        'user_comments_enabled' => $request->boolean('user_comments_enabled'),
                        'artist_following_enabled' => $request->boolean('artist_following_enabled'),
                        'playlists_enabled' => $request->boolean('playlists_enabled'),
                        'social_sharing_enabled' => $request->boolean('social_sharing_enabled'),
                        'store_enabled' => $request->boolean('store_enabled'),
                        'forums_enabled' => $request->boolean('forums_enabled'),
                        'polls_enabled' => $request->boolean('polls_enabled'),
                        'credits_enabled' => $request->boolean('credits_enabled'),
                    ];
                    break;

                case 'localization':
                    $request->validate([
                        'default_language' => 'string|in:en,sw,lg,fr',
                        'default_currency' => 'string|in:UGX,USD,EUR,GBP',
                        'default_timezone' => 'string',
                        'date_format' => 'string'
                    ]);

                    $settings = [
                        'default_language' => $request->input('default_language'),
                        'default_currency' => $request->input('default_currency'),
                        'default_timezone' => $request->input('default_timezone'),
                        'date_format' => $request->input('date_format'),
                    ];
                    break;

                case 'maintenance':
                    $settings = [
                        'maintenance_mode' => $request->boolean('maintenance_mode'),
                        'maintenance_message' => $request->input('maintenance_message'),
                        'maintenance_expected_downtime' => $request->input('maintenance_expected_downtime'),
                        'maintenance_contact_email' => $request->input('maintenance_contact_email'),
                    ];
                    break;

                default:
                    return response()->json(['success' => false, 'message' => 'Invalid tab specified'], 400);
            }

            foreach ($settings as $key => $value) {
                if ($value !== null) {
                    $type = is_bool($value) ? Setting::TYPE_BOOLEAN : Setting::TYPE_STRING;
                    Setting::set($key, $value, $type, Setting::GROUP_GENERAL);
                }
            }

            // Module settings are now stored directly in the settings table
            // forums_enabled and polls_enabled are already saved above

            return response()->json(['success' => true, 'message' => ucfirst($tab) . ' settings updated successfully']);
        } catch (\Exception $e) {
            Log::error('General settings update failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to update settings'], 500);
        }
    }

    public function updateCreditSystem(Request $request)
    {
        $request->validate([
            'credit_system_enabled' => 'boolean',
            'stream_rate' => 'numeric|min:0',
            'download_rate' => 'numeric|min:0',
            'daily_bonus' => 'numeric|min:0',
            'registration_bonus' => 'numeric|min:0',
            'allow_credit_transfers' => 'boolean',
            'enable_credit_expiration' => 'boolean',
            // Credit packages validation
            'package_1_credits' => 'numeric|min:1',
            'package_1_price' => 'numeric|min:0',
            'package_2_credits' => 'numeric|min:1',
            'package_2_price' => 'numeric|min:0',
            'package_3_credits' => 'numeric|min:1',
            'package_3_price' => 'numeric|min:0',
            'credit_to_ugx_rate' => 'numeric|min:1',
        ]);

        try {
            $settings = [
                'credit_system_enabled' => $request->boolean('credit_system_enabled'),
                'credit_stream_rate' => $request->input('stream_rate', 1),
                'credit_download_rate' => $request->input('download_rate', 5),
                'credit_daily_bonus' => $request->input('daily_bonus', 10),
                'credit_registration_bonus' => $request->input('registration_bonus', 50),
                'credit_allow_transfers' => $request->boolean('allow_credit_transfers'),
                'credit_expiration_enabled' => $request->boolean('enable_credit_expiration'),
                // Credit packages
                'package_1_credits' => $request->input('package_1_credits', 100),
                'package_1_price' => $request->input('package_1_price', 10000),
                'package_1_active' => $request->boolean('package_1_active', true),
                'package_2_credits' => $request->input('package_2_credits', 500),
                'package_2_price' => $request->input('package_2_price', 50000),
                'package_2_active' => $request->boolean('package_2_active', true),
                'package_3_credits' => $request->input('package_3_credits', 1000),
                'package_3_price' => $request->input('package_3_price', 100000),
                'package_3_active' => $request->boolean('package_3_active', true),
                // Exchange rate
                'credit_to_ugx_rate' => $request->input('credit_to_ugx_rate', 100),
                'credit_purchase_enabled' => $request->boolean('credit_purchase_enabled', true),
            ];

            foreach ($settings as $key => $value) {
                $type = is_bool($value) ? Setting::TYPE_BOOLEAN : Setting::TYPE_NUMBER;
                Setting::set($key, $value, $type, Setting::GROUP_CREDITS);
            }

            return response()->json(['success' => true, 'message' => 'Credit system settings updated successfully']);
        } catch (\Exception $e) {
            Log::error('Credit system settings update failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to update settings'], 500);
        }
    }

    public function updateMobileMoney(Request $request)
    {
        $request->validate([
            'mtn_api_key' => 'string|nullable',
            'airtel_api_key' => 'string|nullable',
            'transaction_fee' => 'numeric|min:0|max:100',
            'minimum_payout' => 'numeric|min:0',
            'enable_mtn' => 'boolean',
            'enable_airtel' => 'boolean',

            'enable_bank_transfers' => 'boolean'
        ]);

        try {
            $settings = [
                'payment_mtn_api_key' => $request->input('mtn_api_key'),
                'payment_airtel_api_key' => $request->input('airtel_api_key'),
                'payment_transaction_fee' => $request->input('transaction_fee', 2.5),
                'payment_minimum_payout' => $request->input('minimum_payout', 10000),
                'payment_mtn_enabled' => $request->boolean('enable_mtn'),
                'payment_airtel_enabled' => $request->boolean('enable_airtel'),

                'payment_bank_transfers_enabled' => $request->boolean('enable_bank_transfers')
            ];

            foreach ($settings as $key => $value) {
                $type = is_bool($value) ? Setting::TYPE_BOOLEAN : (is_numeric($value) ? Setting::TYPE_NUMBER : Setting::TYPE_STRING);
                Setting::set($key, $value, $type, Setting::GROUP_PAYMENT);
            }

            return response()->json(['success' => true, 'message' => 'Payment settings updated successfully']);
        } catch (\Exception $e) {
            Log::error('Payment settings update failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to update settings'], 500);
        }
    }

    public function updateNotifications(Request $request)
    {
        $request->validate([
            'notify_new_registrations' => 'boolean',
            'notify_new_uploads' => 'boolean',
            'notify_payout_requests' => 'boolean',
            'notify_content_reports' => 'boolean',
            'smtp_host' => 'string|nullable',
            'smtp_port' => 'integer|min:1|max:65535',
            'smtp_username' => 'email|nullable',
            'smtp_password' => 'string|nullable'
        ]);

        try {
            $settings = [
                'notifications_new_registrations' => $request->boolean('notify_new_registrations'),
                'notifications_new_uploads' => $request->boolean('notify_new_uploads'),
                'notifications_payout_requests' => $request->boolean('notify_payout_requests'),
                'notifications_content_reports' => $request->boolean('notify_content_reports'),
                'mail_smtp_host' => $request->input('smtp_host'),
                'mail_smtp_port' => $request->input('smtp_port', 587),
                'mail_smtp_username' => $request->input('smtp_username'),
                'mail_smtp_password' => $request->input('smtp_password')
            ];

            foreach ($settings as $key => $value) {
                $type = is_bool($value) ? Setting::TYPE_BOOLEAN : (is_numeric($value) ? Setting::TYPE_NUMBER : Setting::TYPE_STRING);
                Setting::set($key, $value, $type, Setting::GROUP_NOTIFICATIONS);
            }

            return response()->json(['success' => true, 'message' => 'Notification settings updated successfully']);
        } catch (\Exception $e) {
            Log::error('Notification settings update failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to update settings'], 500);
        }
    }

    public function updateMobileVerification(Request $request)
    {
        $request->validate([
            'mobile_verification_enabled' => 'boolean',
            'mobile_verification_required_for_events' => 'boolean',
            'mobile_verification_required_for_artists' => 'boolean',
            'mobile_verification_sms_provider' => 'string|in:local,twilio,africastalking'
        ]);

        try {
            Setting::set('mobile_verification_enabled', $request->boolean('mobile_verification_enabled'), Setting::TYPE_BOOLEAN, Setting::GROUP_VERIFICATION);
            Setting::set('mobile_verification_required_for_events', $request->boolean('mobile_verification_required_for_events'), Setting::TYPE_BOOLEAN, Setting::GROUP_VERIFICATION);
            Setting::set('mobile_verification_required_for_artists', $request->boolean('mobile_verification_required_for_artists'), Setting::TYPE_BOOLEAN, Setting::GROUP_VERIFICATION);
            Setting::set('mobile_verification_sms_provider', $request->input('mobile_verification_sms_provider'), Setting::TYPE_STRING, Setting::GROUP_VERIFICATION);

            return response()->json(['success' => true, 'message' => 'Mobile verification settings updated successfully']);
        } catch (\Exception $e) {
            Log::error('Mobile verification settings update failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to update settings'], 500);
        }
    }

    public function updateSecurity(Request $request)
    {
        $tab = $request->input('tab', 'authentication');

        try {
            $result = match ($tab) {
                'authentication' => $this->securitySettingsService->updateSettings($request->all()),
                'password' => $this->securitySettingsService->updatePasswordPolicy($request->all()),
                'access' => $this->securitySettingsService->updateIpAndRateLimiting($request->all()),
                default => false,
            };

            if ($result) {
                return response()->json([
                    'success' => true,
                    'message' => 'Security settings updated successfully'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings'
            ], 500);
        } catch (\Exception $e) {
            Log::error('Security settings update failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings'
            ], 500);
        }
    }

    public function updateUsers(Request $request)
    {
        try {
            $settings = [
                'user_registration_enabled' => $request->boolean('user_registration_enabled'),
                'email_verification_required' => $request->boolean('email_verification_required'),
                'artist_approval_required' => $request->boolean('artist_approval_required'),
                'social_login_enabled' => $request->boolean('social_login_enabled'),
                'default_user_role' => $request->input('default_user_role', 'user'),
                'registration_limit_per_ip' => $request->input('registration_limit_per_ip', 5),

                // Permissions
                'user_can_upload_music' => $request->boolean('user_can_upload_music'),
                'user_can_create_playlists' => $request->boolean('user_can_create_playlists'),
                'user_can_comment' => $request->boolean('user_can_comment'),
                'user_can_download' => $request->boolean('user_can_download'),
                'artist_can_create_events' => $request->boolean('artist_can_create_events'),
                'artist_can_sell_tickets' => $request->boolean('artist_can_sell_tickets'),
                'artist_can_monetize' => $request->boolean('artist_can_monetize'),
                'artist_has_analytics' => $request->boolean('artist_has_analytics'),

                // Restrictions
                'max_upload_size_mb' => $request->input('max_upload_size_mb', 100),
                'daily_upload_limit' => $request->input('daily_upload_limit', 10),
                'max_playlists_per_user' => $request->input('max_playlists_per_user', 50),
                'max_events_per_artist_monthly' => $request->input('max_events_per_artist_monthly', 5),
                'comment_character_limit' => $request->input('comment_character_limit', 500),
                'session_timeout_minutes' => $request->input('session_timeout_minutes', 120),
                'profanity_filter_enabled' => $request->boolean('profanity_filter_enabled'),
                'auto_moderate_comments' => $request->boolean('auto_moderate_comments'),

                // Moderation
                'auto_ban_after_violations' => $request->input('auto_ban_after_violations', 3),
                'warnings_before_ban' => $request->input('warnings_before_ban', 2),
                'spam_detection_enabled' => $request->boolean('spam_detection_enabled'),
                'rate_limiting_enabled' => $request->boolean('rate_limiting_enabled'),
                'ip_blocking_enabled' => $request->boolean('ip_blocking_enabled'),
                'moderation_email_notifications' => $request->boolean('moderation_email_notifications'),
            ];

            foreach ($settings as $key => $value) {
                $type = is_bool($value) ? Setting::TYPE_BOOLEAN : (is_numeric($value) ? Setting::TYPE_NUMBER : Setting::TYPE_STRING);
                Setting::set($key, $value, $type, Setting::GROUP_USERS);
            }

            return response()->json(['success' => true, 'message' => 'User management settings updated successfully']);
        } catch (\Exception $e) {
            Log::error('User settings update failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to update settings'], 500);
        }
    }

    public function searchUsers(Request $request)
    {
        $query = $request->get('q', '');

        if (strlen($query) < 2) {
            return response()->json([
                'success' => false,
                'message' => 'Search query too short'
            ]);
        }

        $users = User::where(function($q) use ($query) {
                $q->where('display_name', 'LIKE', "%{$query}%")
                  ->orWhere('username', 'LIKE', "%{$query}%")
                  ->orWhere('email', 'LIKE', "%{$query}%")
                  ->orWhere('phone', 'LIKE', "%{$query}%")
                  ->orWhere('first_name', 'LIKE', "%{$query}%")
                  ->orWhere('last_name', 'LIKE', "%{$query}%");
            })
            ->with(['roles'])
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'users' => $users->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->display_name ?? $user->username,
                    'email' => $user->email,
                    'phone_number' => $user->phone,
                    'stage_name' => $user->display_name,
                    'role' => $user->roles->pluck('display_name')->join(', ') ?: 'User',
                    'is_phone_verified' => $user->isPhoneVerified(),
                    'phone_verified_at' => $user->phone_verified_at?->format('M j, Y g:i A'),
                    'created_at' => $user->created_at->format('M j, Y')
                ];
            })
        ]);
    }

    public function verifyUser(Request $request, User $user)
    {
        $request->validate([
            'action' => 'required|in:verify,unverify'
        ]);

        try {
            if ($request->action === 'verify') {
                $user->update([
                    'phone_verified_at' => now(),
                    'phone_verification_code' => null,
                    'phone_verification_expires_at' => null
                ]);

                $message = 'User phone number verified successfully.';
            } else {
                $user->update([
                    'phone_verified_at' => null
                ]);

                $message = 'User phone verification removed.';
            }

            Log::info('Admin phone verification action', [
                'admin_id' => auth()->id(),
                'user_id' => $user->id,
                'action' => $request->action,
                'phone_number' => $user->phone
            ]);

            return response()->json(['success' => true, 'message' => $message]);
        } catch (\Exception $e) {
            Log::error('Admin phone verification failed', [
                'error' => $e->getMessage(),
                'admin_id' => auth()->id(),
                'user_id' => $user->id,
                'action' => $request->action
            ]);

            return response()->json(['success' => false, 'message' => 'Failed to update user verification status'], 500);
        }
    }

    public function updateAwards(Request $request)
    {
        $tab = $request->input('tab', 'general');

        try {
            $result = match ($tab) {
                'general' => $this->awardSettingsService->updateGeneralSettings($request->all()),
                'categories' => $this->awardSettingsService->updateCategorySettings($request->all()),
                'voting' => $this->awardSettingsService->updateVotingSettings($request->all()),
                'prizes' => $this->awardSettingsService->updatePrizesSettings($request->all()),
                default => false,
            };

            if ($result) {
                return response()->json([
                    'success' => true,
                    'message' => ucfirst($tab) . ' awards settings updated successfully'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings'
            ], 500);
        } catch (\Exception $e) {
            Log::error('Awards settings update failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings'
            ], 500);
        }
    }

    public function updateEvents(Request $request)
    {
        $tab = $request->input('tab', 'general');

        try {
            $result = match ($tab) {
                'general' => $this->eventSettingsService->updateGeneralSettings($request->all()),
                'ticketing' => $this->eventSettingsService->updateTicketingSettings($request->all()),
                'fees' => $this->eventSettingsService->updateFeeSettings($request->all()),
                default => false,
            };

            if ($result) {
                return response()->json(['success' => true, 'message' => ucfirst($tab) . ' events settings updated successfully']);
            }

            return response()->json(['success' => false, 'message' => 'Failed to update settings'], 500);
        } catch (\Exception $e) {
            Log::error('Events settings update failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to update settings'], 500);
        }
    }

    public function updateArtists(Request $request)
    {
        $tab = $request->input('tab', 'verification');

        try {
            $result = match ($tab) {
                'verification' => $this->artistSettingsService->updateVerificationSettings($request->all()),
                'monetization' => $this->artistSettingsService->updateMonetizationSettings($request->all()),
                'restrictions' => $this->artistSettingsService->updateRestrictionsSettings($request->all()),
                default => false,
            };

            if ($result) {
                return response()->json(['success' => true, 'message' => ucfirst($tab) . ' artist settings updated successfully']);
            }

            return response()->json(['success' => false, 'message' => 'Failed to update settings'], 500);
        } catch (\Exception $e) {
            Log::error('Artist settings update failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function updateStorage(Request $request)
    {
        $tab = $request->input('tab', 'general');

        try {
            $result = match ($tab) {
                'general' => $this->storageSettingsService->updateGeneralSettings($request->all()),
                'cloud' => $this->storageSettingsService->updateCloudSettings($request->all()),
                'optimization' => $this->storageSettingsService->updateOptimizationSettings($request->all()),
                default => false,
            };

            if ($result) {
                return response()->json(['success' => true, 'message' => ucfirst($tab) . ' storage settings updated successfully']);
            }

            return response()->json(['success' => false, 'message' => 'Failed to update settings'], 500);
        } catch (\Exception $e) {
            Log::error('Storage settings update failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function testStorageConnection()
    {
        try {
            $result = $this->storageSettingsService->testStorageConnection();

            if ($result) {
                return response()->json(['success' => true, 'message' => 'Storage connection successful']);
            }

            return response()->json(['success' => false, 'message' => 'Storage connection failed'], 500);
        } catch (\Exception $e) {
            Log::error('Storage connection test failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function cleanupStorage()
    {
        try {
            $deletedCount = $this->storageSettingsService->cleanupOldFiles();

            return response()->json([
                'success' => true,
                'message' => "Cleanup completed successfully",
                'deleted_count' => $deletedCount
            ]);
        } catch (\Exception $e) {
            Log::error('Storage cleanup failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function getStorageStats()
    {
        try {
            $stats = $this->storageSettingsService->getStorageStats();

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get storage stats: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function updateAuthentication(Request $request)
    {
        $tab = $request->input('tab', 'general');

        try {
            $result = match ($tab) {
                'general' => $this->authenticationSettingsService->updateGeneralSettings($request->all()),
                'user_login' => $this->authenticationSettingsService->updateUserLoginSettings($request->all()),
                'artist_login' => $this->authenticationSettingsService->updateArtistLoginSettings($request->all()),
                'social' => $this->authenticationSettingsService->updateSocialSettings($request->all()),
                default => false,
            };

            if ($result) {
                return response()->json(['success' => true, 'message' => ucfirst($tab) . ' authentication settings updated successfully']);
            }

            return response()->json(['success' => false, 'message' => 'Failed to update settings'], 500);
        } catch (\Exception $e) {
            Log::error('Authentication settings update failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Google Analytics Settings Page
     */
    public function googleAnalytics()
    {
        $settings = [
            'google_analytics_enabled' => Setting::get('google_analytics_enabled', false),
            'google_analytics_tracking_id' => Setting::get('google_analytics_tracking_id', ''),
            'google_analytics_measurement_id' => Setting::get('google_analytics_measurement_id', ''),
            'google_analytics_track_events' => Setting::get('google_analytics_track_events', true),
            'google_analytics_track_ecommerce' => Setting::get('google_analytics_track_ecommerce', true),
            'google_analytics_anonymize_ip' => Setting::get('google_analytics_anonymize_ip', true),
        ];

        return view('admin.settings.google-analytics', compact('settings'));
    }

    /**
     * Update Google Analytics Settings
     */
    public function updateGoogleAnalytics(Request $request)
    {
        try {
            $validated = $request->validate([
                'google_analytics_enabled' => 'nullable|boolean',
                'google_analytics_measurement_id' => 'nullable|string|max:255',
                'google_analytics_event_tracking' => 'nullable|boolean',
                'google_analytics_ecommerce_tracking' => 'nullable|boolean',
                'google_analytics_ip_anonymization' => 'nullable|boolean',
                'google_analytics_custom_events' => 'nullable|string',
            ]);

            foreach ($validated as $key => $value) {
                Setting::set($key, $value ?? false);
            }

            return response()->json([
                'success' => true,
                'message' => 'Google Analytics settings updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Google Analytics settings update failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ads Management Settings Page
     */
    public function adsManagement()
    {
        $settings = [
            // Global Ads Settings
            'ads_enabled' => Setting::get('ads_enabled', false),
            'ads_google_adsense_enabled' => Setting::get('ads_google_adsense_enabled', false),
            'ads_google_adsense_client_id' => Setting::get('ads_google_adsense_client_id', ''),
            'ads_private_ads_enabled' => Setting::get('ads_private_ads_enabled', true),

            // Ad Placement Settings
            'ads_homepage_banner' => Setting::get('ads_homepage_banner', true),
            'ads_player_sidebar' => Setting::get('ads_player_sidebar', true),
            'ads_between_songs' => Setting::get('ads_between_songs', false),
            'ads_discover_page' => Setting::get('ads_discover_page', true),
            'ads_mobile_banner' => Setting::get('ads_mobile_banner', true),

            // Private Ads Configuration
            'private_ads' => json_decode(Setting::get('private_ads_config', '[]'), true),
        ];

        return view('admin.settings.ads-management', compact('settings'));
    }

    /**
     * Update Ads Management Settings
     */
    public function updateAdsManagement(Request $request)
    {
        try {
            // Determine which tab is being saved
            $tab = $request->input('tab', 'adsense');

            if ($tab === 'adsense') {
                $validated = $request->validate([
                    'google_adsense_enabled' => 'nullable|boolean',
                    'google_adsense_publisher_id' => 'nullable|string|max:255',
                    'google_adsense_auto_ads' => 'nullable|boolean',
                    'adsense_header_slot' => 'nullable|string|max:255',
                    'adsense_sidebar_slot' => 'nullable|string|max:255',
                    'adsense_footer_slot' => 'nullable|string|max:255',
                ]);
            } elseif ($tab === 'placements') {
                $validated = $request->validate([
                    'placement_header' => 'nullable|boolean',
                    'placement_sidebar' => 'nullable|boolean',
                    'placement_infeed' => 'nullable|boolean',
                    'placement_footer' => 'nullable|boolean',
                    'placement_mobile_interstitial' => 'nullable|boolean',
                    'mobile_optimized_ads' => 'nullable|boolean',
                ]);
            } else {
                $validated = [];
            }

            // Save settings with proper prefixes
            foreach ($validated as $key => $value) {
                if (strpos($key, 'ads_') !== 0 && strpos($key, 'placement_') !== 0) {
                    Setting::set($key, $value ?? false);
                } else {
                    Setting::set('ads_' . $key, $value ?? false);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Ads management settings updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Ads management settings update failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle individual ad status
     */
    public function toggleAd(Request $request)
    {
        try {
            $adId = $request->input('ad_id');
            $privateAds = json_decode(Setting::get('private_ads_config', '[]'), true);

            foreach ($privateAds as &$ad) {
                if ($ad['id'] === $adId) {
                    $ad['active'] = !($ad['active'] ?? true);
                    break;
                }
            }

            Setting::set('private_ads_config', json_encode($privateAds));

            return response()->json(['success' => true, 'message' => 'Ad status updated']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete individual ad
     */
    public function deleteAd($id)
    {
        try {
            $privateAds = json_decode(Setting::get('private_ads_config', '[]'), true);
            $privateAds = array_filter($privateAds, fn($ad) => $ad['id'] !== $id);

            Setting::set('private_ads_config', json_encode(array_values($privateAds)));

            return response()->json(['success' => true, 'message' => 'Ad deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Update Podcast Settings
     */
    public function updatePodcasts(Request $request)
    {
        $tab = $request->input('tab', 'general');

        try {
            $result = match ($tab) {
                'general' => $this->podcastSettingsService->updateGeneralSettings($request->all()),
                'uploads' => $this->podcastSettingsService->updateUploadSettings($request->all()),
                'monetization' => $this->podcastSettingsService->updateMonetizationSettings($request->all()),
                'features' => $this->podcastSettingsService->updateFeaturesSettings($request->all()),
                default => false,
            };

            if ($result) {
                return response()->json(['success' => true, 'message' => ucfirst($tab) . ' podcast settings updated successfully']);
            }

            return response()->json(['success' => false, 'message' => 'Failed to update settings'], 500);
        } catch (\Exception $e) {
            Log::error('Podcast settings update failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Update Frontend Design Settings
     */
    public function updateFrontendDesign(Request $request)
    {
        try {
            $request->validate([
                'type' => 'required|in:desktop,mobile',
                'settings' => 'required|array'
            ]);

            $type = $request->type;
            $settings = $request->settings;

            foreach ($settings as $key => $value) {
                $dataType = 'string';
                if (is_array($value)) {
                    $dataType = 'json';
                } elseif (is_bool($value) || $value === 'true' || $value === 'false') {
                    $dataType = 'boolean';
                } elseif (is_numeric($value)) {
                    $dataType = 'number';
                }

                $parts = explode('.', $key);
                $category = $parts[0] ?? 'general';

                \App\Models\FrontendSetting::set($key, $value, $type, $dataType, $category);
            }

            \App\Models\FrontendSetting::clearCache();

            return response()->json([
                'success' => true,
                'message' => ucfirst($type) . ' frontend design settings updated successfully!'
            ]);
        } catch (\Exception $e) {
            Log::error('Frontend design settings update failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Reset Frontend Design Settings
     */
    public function resetFrontendDesign(Request $request)
    {
        try {
            $request->validate([
                'type' => 'required|in:desktop,mobile',
            ]);

            $type = $request->type;
            \App\Models\FrontendSetting::where('type', $type)->delete();
            $this->initializeFrontendDefaults($type);
            \App\Models\FrontendSetting::clearCache();

            return response()->json([
                'success' => true,
                'message' => ucfirst($type) . ' settings reset to defaults!'
            ]);
        } catch (\Exception $e) {
            Log::error('Frontend design reset failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    private function initializeFrontendDefaults($type)
    {
        if ($type === 'mobile') {
            $defaults = [
                'layout.enable_bottom_nav' => ['value' => true, 'category' => 'layout', 'data_type' => 'boolean'],
                'layout.enable_sticky_player' => ['value' => true, 'category' => 'layout', 'data_type' => 'boolean'],
                'layout.header_style' => ['value' => 'simple', 'category' => 'layout', 'data_type' => 'string'],
                'sections.show_trending_songs' => ['value' => true, 'category' => 'sections', 'data_type' => 'boolean'],
                'sections.show_popular_artists' => ['value' => true, 'category' => 'sections', 'data_type' => 'boolean'],
                'sections.show_popular_albums' => ['value' => true, 'category' => 'sections', 'data_type' => 'boolean'],
                'sections.show_radio_stations' => ['value' => true, 'category' => 'sections', 'data_type' => 'boolean'],
                'sections.show_featured_charts' => ['value' => true, 'category' => 'sections', 'data_type' => 'boolean'],
                'sections.order' => ['value' => json_encode(['trending_songs', 'popular_artists', 'popular_albums', 'radio_stations', 'featured_charts']), 'category' => 'sections', 'data_type' => 'json'],
                'theme.primary_color' => ['value' => '#1DB954', 'category' => 'theme', 'data_type' => 'string'],
                'theme.background_color' => ['value' => '#121212', 'category' => 'theme', 'data_type' => 'string'],
                'theme.text_color' => ['value' => '#FFFFFF', 'category' => 'theme', 'data_type' => 'string'],
                'player.fullscreen_mode' => ['value' => true, 'category' => 'player', 'data_type' => 'boolean'],
                'player.show_artwork' => ['value' => true, 'category' => 'player', 'data_type' => 'boolean'],
                'player.show_lyrics' => ['value' => false, 'category' => 'player', 'data_type' => 'boolean'],
            ];
        } else {
            $defaults = [
                'layout.sidebar_position' => ['value' => 'left', 'category' => 'layout', 'data_type' => 'string'],
                'layout.enable_sticky_header' => ['value' => true, 'category' => 'layout', 'data_type' => 'boolean'],
                'layout.content_width' => ['value' => 'full', 'category' => 'layout', 'data_type' => 'string'],
                'theme.primary_color' => ['value' => '#1DB954', 'category' => 'theme', 'data_type' => 'string'],
                'theme.background_color' => ['value' => '#121212', 'category' => 'theme', 'data_type' => 'string'],
                'sections.show_hero_banner' => ['value' => true, 'category' => 'sections', 'data_type' => 'boolean'],
                'sections.show_featured_playlists' => ['value' => true, 'category' => 'sections', 'data_type' => 'boolean'],
            ];
        }

        foreach ($defaults as $key => $config) {
            \App\Models\FrontendSetting::set(
                $key,
                $config['value'],
                $type,
                $config['data_type'],
                $config['category']
            );
        }
    }

    /**
     * Update module enable/disable status
     */
    public function updateModules(Request $request)
    {
        $validated = $request->validate([
            'store_enabled' => 'nullable|boolean',
            'podcast_enabled' => 'nullable|boolean',
            'events_enabled' => 'nullable|boolean',
        ]);

        // Store module status in database and config
        foreach ($validated as $key => $value) {
            if ($value !== null) {
                $moduleName = str_replace('_enabled', '', $key);
                
                // Update database settings
                \DB::table('settings')->updateOrInsert(
                    ['key' => "modules.{$moduleName}.enabled"],
                    [
                        'value' => $value ? '1' : '0',
                        'group' => 'modules',
                        'type' => 'boolean',
                        'is_public' => false,
                        'description' => "Enable/disable {$moduleName} module",
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );
                
                // Update runtime config (this persists for the current request and subsequent calls)
                \Config::set("modules.{$moduleName}.enabled", $value);
            }
        }

        return redirect()
            ->back()
            ->with('success', 'Module settings updated successfully');
    }

}
