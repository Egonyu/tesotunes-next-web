<?php

namespace App\Http\Controllers\Backend\Store;

use App\Http\Controllers\Controller;
use App\Modules\Store\Models\Promotion;
use App\Services\Store\PromotionService;
use Illuminate\Http\Request;

class PromotionManagementController extends Controller
{
    protected $promotionService;

    public function __construct(PromotionService $promotionService)
    {
        $this->promotionService = $promotionService;
    }

    /**
     * Display promotions management
     */
    public function index(Request $request)
    {
        $promotions = Promotion::with('artist', 'product', 'store')
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->when($request->type, function ($query, $type) {
                $query->where('following_type', $type);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(20);

        $stats = [
            'total_promotions' => Promotion::count(),
            'active_promotions' => Promotion::where('status', 'active')
                ->where('starts_at', '<=', now())
                ->where('ends_at', '>=', now())
                ->count(),
            'pending_approval' => Promotion::where('status', 'pending')->count(),
            'total_redemptions' => Promotion::sum('redemptions_count'),
        ];

        return view('admin.store.promotions.index', compact('promotions', 'stats'));
    }

    /**
     * Show create promotion form
     */
    public function create()
    {
        return view('admin.store.promotions.create');
    }

    /**
     * Store new promotion
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:percentage,fixed,bogo,free_shipping',
            'value' => 'required|numeric|min:0',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after:starts_at',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'max_uses_per_user' => 'nullable|integer|min:1',
            'applies_to' => 'nullable|in:all,specific_stores,specific_products,categories',
            'is_active' => 'nullable|boolean',
            'require_approval' => 'nullable|boolean',
        ]);

        // Map form fields to database columns
        $data = [
            'name' => $validated['name'],
            'slug' => \Illuminate\Support\Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'discount_type' => $validated['type'],
            'discount_value' => $validated['value'],
            'starts_at' => $validated['starts_at'],
            'ends_at' => $validated['ends_at'],
            'min_purchase_ugx' => $validated['min_purchase'] ?? null,
            'usage_limit_total' => $validated['max_uses'] ?? null,
            'usage_limit_per_user' => $validated['max_uses_per_user'] ?? null,
            'applies_to' => $validated['applies_to'] ?? 'all',
            'is_active' => $request->boolean('is_active'),
            'status' => $request->boolean('require_approval') ? 'pending' : 'active',
            'created_by_id' => auth()->id(),
        ];

        $promotion = Promotion::create($data);

        return redirect()
            ->route('admin.store.promotions.show', $promotion)
            ->with('success', 'Promotion created successfully');
    }

    /**
     * Show edit promotion form
     */
    public function edit(Promotion $promotion)
    {
        return view('admin.store.promotions.edit', compact('promotion'));
    }

    /**
     * Update promotion
     */
    public function update(Request $request, Promotion $promotion)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:percentage,fixed,bogo,free_shipping',
            'value' => 'required|numeric|min:0',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after:starts_at',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'max_uses_per_user' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
        ]);

        // Map form fields to database columns
        $data = [
            'name' => $validated['name'],
            'slug' => \Illuminate\Support\Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'discount_type' => $validated['type'],
            'discount_value' => $validated['value'],
            'starts_at' => $validated['starts_at'],
            'ends_at' => $validated['ends_at'],
            'min_purchase_ugx' => $validated['min_purchase'] ?? null,
            'usage_limit_total' => $validated['max_uses'] ?? null,
            'usage_limit_per_user' => $validated['max_uses_per_user'] ?? null,
            'is_active' => $request->boolean('is_active'),
        ];

        $promotion->update($data);

        return redirect()
            ->route('admin.store.promotions.show', $promotion)
            ->with('success', 'Promotion updated successfully');
    }

    /**
     * Show promotion details
     */
    public function show(Promotion $promotion)
    {
        $promotion->load('artist', 'product', 'store', 'redemptions.user');

        return view('admin.store.promotions.show', compact('promotion'));
    }

    /**
     * Approve promotion
     */
    public function approve(Promotion $promotion)
    {
        $promotion->update(['status' => 'active']);

        return back()->with('success', 'Promotion approved successfully');
    }

    /**
     * Reject promotion
     */
    public function reject(Request $request, Promotion $promotion)
    {
        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $promotion->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['reason'],
        ]);

        return back()->with('success', 'Promotion rejected');
    }

    /**
     * Deactivate promotion
     */
    public function deactivate(Promotion $promotion)
    {
        $promotion->update(['status' => 'inactive']);

        return back()->with('success', 'Promotion deactivated');
    }

    /**
     * Delete promotion
     */
    public function destroy(Promotion $promotion)
    {
        $promotion->delete();

        return redirect()
            ->route('admin.store.promotions.index')
            ->with('success', 'Promotion deleted successfully');
    }
}
