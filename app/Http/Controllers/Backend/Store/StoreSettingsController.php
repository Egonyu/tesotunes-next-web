<?php

namespace App\Http\Controllers\Backend\Store;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * Store Settings Controller
 *
 * Handles store module configuration and settings for administrators
 */
class StoreSettingsController extends Controller
{
    /**
     * Display store module settings
     */
    public function index()
    {
        $settings = [
            'module_enabled' => config('store.enabled', true),
            'commission_rate' => config('store.fees.free_tier', 7.0),
            'currency' => config('store.currencies.primary.code', 'UGX'),
            'payment_methods' => array_keys(array_filter(config('store.payments.methods', []))),
            'max_file_size' => config('store.limits.max_image_size', 10485760), // 10MB
            'allowed_file_types' => ['jpg', 'jpeg', 'png', 'gif'],
            'auto_approve_stores' => !config('store.stores.require_verification', true),
            'auto_approve_products' => config('store.stores.auto_approve_products', false),
            'auto_approve_promotions' => false,
            'email_notifications' => true,
            'sms_notifications' => false,
            'minimum_payout_amount' => config('store.payments.minimum_payout_ugx', 50000), // UGX
            'payout_schedule' => 'monthly',
        ];

        return view('admin.store.settings.index', compact('settings'));
    }

    /**
     * Update store module settings
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'platform_commission_rate' => 'nullable|numeric|min:0|max:100',
            'allow_credit_payment' => 'nullable|boolean',
            'require_store_approval' => 'nullable|boolean',
            'module_enabled' => 'nullable|boolean',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'currency' => 'nullable|string|in:UGX,USD',
            'payment_methods' => 'nullable|array',
            'payment_methods.*' => 'string|in:mobile_money,bank_transfer,credit_card',
            'max_file_size' => 'nullable|integer|min:1048576|max:52428800', // 1MB to 50MB
            'allowed_file_types' => 'nullable|array',
            'allowed_file_types.*' => 'string|in:jpg,jpeg,png,gif,pdf',
            'auto_approve_stores' => 'nullable|boolean',
            'auto_approve_products' => 'nullable|boolean',
            'auto_approve_promotions' => 'nullable|boolean',
            'email_notifications' => 'nullable|boolean',
            'sms_notifications' => 'nullable|boolean',
            'minimum_payout_amount' => 'nullable|numeric|min:10000', // Minimum UGX 10,000
            'payout_schedule' => 'nullable|string|in:weekly,monthly,quarterly',
        ]);

        // Store settings in database
        foreach ($validated as $key => $value) {
            if ($value !== null) {
                \DB::table('settings')->updateOrInsert(
                    ['key' => "store.{$key}"],
                    ['value' => is_bool($value) ? ($value ? '1' : '0') : (string)$value, 'updated_at' => now()]
                );
                
                // Also update cache
                cache()->put("store.settings.{$key}", $value, now()->addYear());
            }
        }

        return redirect()
            ->route('admin.store.settings')
            ->with('success', 'Store settings updated successfully');
    }

    /**
     * Reset settings to defaults
     */
    public function reset()
    {
        // Clear cached settings to revert to config defaults
        $settingsKeys = [
            'module_enabled',
            'commission_rate',
            'currency',
            'payment_methods',
            'max_file_size',
            'allowed_file_types',
            'auto_approve_stores',
            'auto_approve_products',
            'auto_approve_promotions',
            'email_notifications',
            'sms_notifications',
            'minimum_payout_amount',
            'payout_schedule',
        ];

        foreach ($settingsKeys as $key) {
            cache()->forget("store.settings.{$key}");
        }

        return redirect()
            ->route('admin.store.settings')
            ->with('success', 'Store settings reset to defaults successfully');
    }

    /**
     * Export store configuration
     */
    public function export()
    {
        $settings = [
            'module_enabled' => config('store.enabled', true),
            'commission_rate' => config('store.fees.free_tier', 7.0),
            'currency' => config('store.currencies.primary.code', 'UGX'),
            'payment_methods' => array_keys(array_filter(config('store.payments.methods', []))),
            'max_file_size' => config('store.limits.max_image_size', 10485760),
            'allowed_file_types' => ['jpg', 'jpeg', 'png', 'gif'],
            'auto_approve_stores' => !config('store.stores.require_verification', true),
            'auto_approve_products' => config('store.stores.auto_approve_products', false),
            'auto_approve_promotions' => false,
            'email_notifications' => true,
            'sms_notifications' => false,
            'minimum_payout_amount' => config('store.payments.minimum_payout_ugx', 50000),
            'payout_schedule' => 'monthly',
            'exported_at' => now()->toIso8601String(),
        ];

        $filename = 'store-settings-' . now()->format('Y-m-d-H-i-s') . '.json';

        return response()->json($settings)
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"")
            ->header('Content-Type', 'application/json');
    }

    /**
     * API: Get store settings (for AJAX)
     */
    public function apiIndex()
    {
        $settings = [
            'module_enabled' => config('store.enabled', true),
            'commission_rate' => config('store.fees.free_tier', 7.0),
            'currency' => config('store.currencies.primary.code', 'UGX'),
            'payment_methods' => array_keys(array_filter(config('store.payments.methods', []))),
            'max_file_size' => config('store.limits.max_image_size', 10485760),
            'allowed_file_types' => ['jpg', 'jpeg', 'png', 'gif'],
            'auto_approve_stores' => !config('store.stores.require_verification', true),
            'auto_approve_products' => config('store.stores.auto_approve_products', false),
            'auto_approve_promotions' => false,
            'email_notifications' => true,
            'sms_notifications' => false,
            'minimum_payout_amount' => config('store.payments.minimum_payout_ugx', 50000),
            'payout_schedule' => 'monthly',
            'escrow_hold_days' => config('store.payments.escrow_hold_days', 7),
            'auto_release_days' => config('store.payments.auto_release_days', 7),
            'expected_delivery_days' => 7,
            'allow_order_cancellation' => true,
        ];

        return response()->json($settings);
    }

    /**
     * API: Update store settings (for AJAX)
     */
    public function apiUpdate(Request $request)
    {
        $validated = $request->validate([
            'module_enabled' => 'boolean',
            'commission_rate' => 'numeric|min:0|max:100',
            'currency' => 'string|in:UGX,USD',
            'payment_methods' => 'array',
            'payment_methods.*' => 'string|in:mobile_money,bank_transfer,credit_card',
            'max_file_size' => 'integer|min:1048576|max:52428800',
            'allowed_file_types' => 'array',
            'allowed_file_types.*' => 'string|in:jpg,jpeg,png,gif,pdf',
            'auto_approve_stores' => 'boolean',
            'auto_approve_products' => 'boolean',
            'auto_approve_promotions' => 'boolean',
            'email_notifications' => 'boolean',
            'sms_notifications' => 'boolean',
            'minimum_payout_amount' => 'numeric|min:10000',
            'payout_schedule' => 'string|in:weekly,monthly,quarterly',
            'escrow_hold_days' => 'integer|min:1|max:30',
            'auto_release_days' => 'integer|min:1|max:30',
            'expected_delivery_days' => 'integer|min:1|max:90',
            'allow_order_cancellation' => 'boolean',
        ]);

        // Update configuration (cache for demo, database in production)
        foreach ($validated as $key => $value) {
            cache()->put("store.settings.{$key}", $value, now()->addYear());
        }

        return response()->json([
            'success' => true,
            'message' => 'Store settings updated successfully',
            'settings' => $validated
        ]);
    }

    /**
     * Show the existing Alpine.js settings view with proper data injection
     */
    public function showExistingView()
    {
        // This method renders the existing backend/store/settings.blade.php view
        // The view expects server-side data injection for Alpine.js initialization
        return view('admin.store.settings');
    }
}