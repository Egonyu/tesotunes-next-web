<?php

namespace App\Modules\Forum\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use App\Models\ModuleSetting;
use App\Modules\Forum\Services\ForumModerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ForumManagementController extends Controller
{
    public function __construct(
        protected ForumModerationService $moderationService
    ) {}

    /**
     * Show forum module settings
     */
    public function settings()
    {
        $this->authorize('manage-modules', \App\Models\User::class);
        
        $forumSettings = ModuleSetting::where('module_name', 'forum')->first();
        $pollsSettings = ModuleSetting::where('module_name', 'polls')->first();
        $stats = $this->moderationService->getStats();
        
        return view('modules.forum.backend.admin.settings', compact(
            'forumSettings',
            'pollsSettings',
            'stats'
        ));
    }

    /**
     * Update forum module settings
     */
    public function updateSettings(Request $request)
    {
        $this->authorize('manage-modules', \App\Models\User::class);
        
        $validated = $request->validate([
            'forum_enabled' => 'nullable|boolean',
            'polls_enabled' => 'nullable|boolean',
            'allow_guest_viewing' => 'nullable|boolean',
            'require_approval' => 'nullable|boolean',
            'min_reputation_to_post' => 'nullable|integer|min:0',
            'max_polls_per_day' => 'nullable|integer|min:0',
            'auto_close_polls_days' => 'nullable|integer|min:0',
        ]);

        // Update Forum Module
        $forumModule = ModuleSetting::updateOrCreate(
            ['module_name' => 'forum'],
            [
                'is_enabled' => $validated['forum_enabled'] ?? false,
                'configuration' => [
                    'allow_guest_viewing' => $validated['allow_guest_viewing'] ?? false,
                    'require_approval' => $validated['require_approval'] ?? false,
                    'min_reputation_to_post' => $validated['min_reputation_to_post'] ?? 0,
                ],
                'last_modified_by' => auth()->id(),
                ($validated['forum_enabled'] ?? false) ? 'enabled_at' : 'disabled_at' => now(),
            ]
        );

        // Update Polls Module
        $pollsModule = ModuleSetting::updateOrCreate(
            ['module_name' => 'polls'],
            [
                'is_enabled' => $validated['polls_enabled'] ?? false,
                'configuration' => [
                    'max_polls_per_day' => $validated['max_polls_per_day'] ?? 5,
                    'auto_close_polls_days' => $validated['auto_close_polls_days'] ?? 30,
                ],
                'last_modified_by' => auth()->id(),
                ($validated['polls_enabled'] ?? false) ? 'enabled_at' : 'disabled_at' => now(),
            ]
        );

        // Sync with main settings table
        \App\Models\Setting::set('forums_enabled', $validated['forum_enabled'] ?? false);
        \App\Models\Setting::set('polls_enabled', $validated['polls_enabled'] ?? false);

        // Clear module cache
        Cache::flush();

        return redirect()->back()->with('success', 'Module settings updated successfully!');
    }

    /**
     * Show module dashboard with stats
     */
    public function dashboard()
    {
        $this->authorize('manage-modules', \App\Models\User::class);
        
        $stats = $this->moderationService->getStats();
        
        $recentTopics = \App\Models\Modules\Forum\ForumTopic::with(['category', 'user'])
            ->latest()
            ->limit(10)
            ->get();

        $recentPolls = \App\Models\Modules\Forum\Poll::with(['user'])
            ->latest()
            ->limit(10)
            ->get();
        
        return view('modules.forum.backend.admin.dashboard', compact(
            'stats',
            'recentTopics',
            'recentPolls'
        ));
    }
}
