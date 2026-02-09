<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Services\AdService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdController extends Controller
{
    protected AdService $adService;

    public function __construct(AdService $adService)
    {
        $this->adService = $adService;
        $this->middleware(['auth', 'role:admin,super_admin,finance']);
    }

    /**
     * Display a listing of ads
     */
    public function index()
    {
        $ads = Ad::withCount('impressions')
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $stats = [
            'total_ads' => Ad::count(),
            'active_ads' => Ad::active()->count(),
            'total_impressions' => Ad::sum('impressions'),
            'total_clicks' => Ad::sum('clicks'),
            'total_revenue' => Ad::sum('revenue'),
        ];

        return view('backend.ads.index', compact('ads', 'stats'));
    }

    /**
     * Show the form for creating a new ad
     */
    public function create()
    {
        return view('backend.ads.create');
    }

    /**
     * Store a newly created ad
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:google_adsense,direct,affiliate',
            'placement' => 'required|in:header,sidebar,inline,footer,between_content,popup',
            'format' => 'required|in:banner,square,rectangle,native,video,horizontal',
            
            // AdSense fields
            'adsense_slot_id' => 'required_if:type,google_adsense|nullable|string',
            'adsense_format' => 'nullable|string|in:auto,rectangle,horizontal,vertical',
            
            // Direct ad fields
            'html_code' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'link_url' => 'nullable|url',
            'advertiser_name' => 'nullable|string|max:255',
            
            // Targeting
            'pages' => 'nullable|array',
            'pages.*' => 'string|in:home,discover,artist,genres,playlists,events',
            'user_tiers' => 'nullable|array',
            'user_tiers.*' => 'string|in:free,premium',
            'mobile_only' => 'boolean',
            'desktop_only' => 'boolean',
            
            // Scheduling
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            
            // Settings
            'priority' => 'integer|min:0|max:100',
            'is_active' => 'boolean',
        ]);

        // Handle image upload for direct ads
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('ads', 'public');
            $validated['image_url'] = Storage::url($path);
        }

        $ad = Ad::create($validated);

        return redirect()
            ->route('backend.ads.index')
            ->with('success', 'Ad created successfully');
    }

    /**
     * Display the specified ad
     */
    public function show(Ad $ad)
    {
        $stats = $this->adService->getAdStats($ad, 30);
        
        return view('backend.ads.show', compact('ad', 'stats'));
    }

    /**
     * Show the form for editing the specified ad
     */
    public function edit(Ad $ad)
    {
        return view('backend.ads.edit', compact('ad'));
    }

    /**
     * Update the specified ad
     */
    public function update(Request $request, Ad $ad)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:google_adsense,direct,affiliate',
            'placement' => 'required|in:header,sidebar,inline,footer,between_content,popup',
            'format' => 'required|in:banner,square,rectangle,native,video,horizontal',
            
            'adsense_slot_id' => 'required_if:type,google_adsense|nullable|string',
            'adsense_format' => 'nullable|string|in:auto,rectangle,horizontal,vertical',
            
            'html_code' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'link_url' => 'nullable|url',
            'advertiser_name' => 'nullable|string|max:255',
            
            'pages' => 'nullable|array',
            'pages.*' => 'string|in:home,discover,artist,genres,playlists,events',
            'user_tiers' => 'nullable|array',
            'user_tiers.*' => 'string|in:free,premium',
            'mobile_only' => 'boolean',
            'desktop_only' => 'boolean',
            
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            
            'priority' => 'integer|min:0|max:100',
            'is_active' => 'boolean',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($ad->image_url) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $ad->image_url));
            }
            
            $path = $request->file('image')->store('ads', 'public');
            $validated['image_url'] = Storage::url($path);
        }

        $ad->update($validated);

        return redirect()
            ->route('backend.ads.index')
            ->with('success', 'Ad updated successfully');
    }

    /**
     * Remove the specified ad
     */
    public function destroy(Ad $ad)
    {
        // Delete image if exists
        if ($ad->image_url) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $ad->image_url));
        }

        $ad->delete();

        return redirect()
            ->route('backend.ads.index')
            ->with('success', 'Ad deleted successfully');
    }

    /**
     * Toggle ad active status
     */
    public function toggle(Ad $ad)
    {
        $ad->update(['is_active' => !$ad->is_active]);

        return back()->with('success', 'Ad status updated');
    }

    /**
     * Analytics dashboard
     */
    public function analytics()
    {
        $ads = Ad::withCount('impressions')
            ->orderBy('impressions', 'desc')
            ->limit(10)
            ->get();

        $totalRevenue = Ad::sum('revenue');
        $totalImpressions = Ad::sum('impressions');
        $totalClicks = Ad::sum('clicks');
        $avgCTR = $totalImpressions > 0 ? ($totalClicks / $totalImpressions) * 100 : 0;

        // Revenue by day (last 30 days)
        $revenueByDay = Ad::selectRaw('DATE(created_at) as date, SUM(revenue) as total')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Performance by device
        $deviceStats = \DB::table('ad_impressions')
            ->select('device_type', \DB::raw('COUNT(*) as impressions'), \DB::raw('SUM(CASE WHEN clicked = 1 THEN 1 ELSE 0 END) as clicks'))
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('device_type')
            ->get();

        return view('backend.ads.analytics', compact(
            'ads',
            'totalRevenue',
            'totalImpressions',
            'totalClicks',
            'avgCTR',
            'revenueByDay',
            'deviceStats'
        ));
    }
}
