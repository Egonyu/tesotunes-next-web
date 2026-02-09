<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FrontendSetting;
use Illuminate\Http\Request;

class FrontendDesignController extends Controller
{
    public function index(Request $request)
    {
        // Get mobile settings
        $mobileSettingsData = FrontendSetting::where('type', 'mobile')
            ->orderBy('category')
            ->orderBy('key')
            ->get();

        $mobileSettings = [];
        foreach ($mobileSettingsData as $setting) {
            $mobileSettings[$setting->key] = $setting->value;
        }

        // Get desktop settings
        $desktopSettingsData = FrontendSetting::where('type', 'desktop')
            ->orderBy('category')
            ->orderBy('key')
            ->get();

        $desktopSettings = [];
        foreach ($desktopSettingsData as $setting) {
            $desktopSettings[$setting->key] = $setting->value;
        }

        return view('admin.frontend-design.index', compact('mobileSettings', 'desktopSettings'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'type' => 'required|in:desktop,mobile',
            'settings' => 'required|array'
        ]);

        $type = $request->type;
        $settings = $request->settings;

        foreach ($settings as $key => $value) {
            // Determine data type
            $dataType = 'string';
            if (is_array($value)) {
                $dataType = 'json';
            } elseif (is_bool($value) || $value === 'true' || $value === 'false') {
                $dataType = 'boolean';
            } elseif (is_numeric($value)) {
                $dataType = 'number';
            }

            // Extract category from key (e.g., layout.header_style -> layout)
            $parts = explode('.', $key);
            $category = $parts[0] ?? 'general';

            FrontendSetting::set($key, $value, $type, $dataType, $category);
        }

        FrontendSetting::clearCache();

        return response()->json([
            'success' => true,
            'message' => ucfirst($type) . ' settings updated successfully!'
        ]);
    }

    public function reset(Request $request)
    {
        $request->validate([
            'type' => 'required|in:desktop,mobile',
        ]);

        $type = $request->type;

        // Delete all settings for this type
        FrontendSetting::where('type', $type)->delete();

        // Initialize default settings
        $this->initializeDefaults($type);

        FrontendSetting::clearCache();

        return response()->json([
            'success' => true,
            'message' => ucfirst($type) . ' settings reset to defaults!'
        ]);
    }

    private function initializeDefaults($type)
    {
        if ($type === 'mobile') {
            $defaults = [
                // Layout Settings
                'layout.enable_bottom_nav' => ['value' => true, 'category' => 'layout', 'data_type' => 'boolean'],
                'layout.enable_sticky_player' => ['value' => true, 'category' => 'layout', 'data_type' => 'boolean'],
                'layout.header_style' => ['value' => 'simple', 'category' => 'layout', 'data_type' => 'string'],
                
                // Home Page Sections
                'sections.show_trending_songs' => ['value' => true, 'category' => 'sections', 'data_type' => 'boolean'],
                'sections.show_popular_artists' => ['value' => true, 'category' => 'sections', 'data_type' => 'boolean'],
                'sections.show_popular_albums' => ['value' => true, 'category' => 'sections', 'data_type' => 'boolean'],
                'sections.show_radio_stations' => ['value' => true, 'category' => 'sections', 'data_type' => 'boolean'],
                'sections.show_featured_charts' => ['value' => true, 'category' => 'sections', 'data_type' => 'boolean'],
                
                // Section Order
                'sections.order' => ['value' => json_encode(['trending_songs', 'popular_artists', 'popular_albums', 'radio_stations', 'featured_charts']), 'category' => 'sections', 'data_type' => 'json'],
                
                // Theme Settings
                'theme.primary_color' => ['value' => '#1DB954', 'category' => 'theme', 'data_type' => 'string'],
                'theme.background_color' => ['value' => '#121212', 'category' => 'theme', 'data_type' => 'string'],
                'theme.text_color' => ['value' => '#FFFFFF', 'category' => 'theme', 'data_type' => 'string'],
                
                // Player Settings
                'player.fullscreen_mode' => ['value' => true, 'category' => 'player', 'data_type' => 'boolean'],
                'player.show_artwork' => ['value' => true, 'category' => 'player', 'data_type' => 'boolean'],
                'player.show_lyrics' => ['value' => false, 'category' => 'player', 'data_type' => 'boolean'],
            ];
        } else {
            $defaults = [
                // Layout Settings
                'layout.sidebar_position' => ['value' => 'left', 'category' => 'layout', 'data_type' => 'string'],
                'layout.enable_sticky_header' => ['value' => true, 'category' => 'layout', 'data_type' => 'boolean'],
                'layout.content_width' => ['value' => 'full', 'category' => 'layout', 'data_type' => 'string'],
                
                // Theme Settings
                'theme.primary_color' => ['value' => '#1DB954', 'category' => 'theme', 'data_type' => 'string'],
                'theme.background_color' => ['value' => '#121212', 'category' => 'theme', 'data_type' => 'string'],
                
                // Home Page Sections
                'sections.show_hero_banner' => ['value' => true, 'category' => 'sections', 'data_type' => 'boolean'],
                'sections.show_featured_playlists' => ['value' => true, 'category' => 'sections', 'data_type' => 'boolean'],
            ];
        }

        foreach ($defaults as $key => $config) {
            FrontendSetting::set(
                $key,
                $config['value'],
                $type,
                $config['data_type'],
                $config['category']
            );
        }
    }
}
