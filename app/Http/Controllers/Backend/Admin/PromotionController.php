<?php

namespace App\Http\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use App\Models\PromotionOrder;
use App\Models\PromotionPlatform;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function index()
    {
        $promotions = Promotion::with(['user', 'platform', 'orders'])
            ->latest()
            ->paginate(20);

        // Calculate stats
        $stats = [
            'total' => Promotion::count(),
            'pending' => Promotion::where('status', 'pending')->count(),
            'active' => Promotion::active()->count(),
            'revenue' => PromotionOrder::whereMonth('created_at', now()->month)
                ->where('payment_status', 'paid')
                ->sum('price_ugx'),
        ];

        // Format promotions for table
        $formattedPromotions = $promotions->map(function ($promo) {
            $statusClasses = [
                'draft' => 'bg-gray-100 text-gray-800',
                'pending' => 'bg-yellow-100 text-yellow-800',
                'active' => 'bg-green-100 text-green-800',
                'paused' => 'bg-orange-100 text-orange-800',
                'rejected' => 'bg-red-100 text-red-800',
                'archived' => 'bg-gray-100 text-gray-800',
            ];

            return [
                'id' => $promo->id,
                'title' => $promo->title,
                'type' => ucfirst(str_replace('_', ' ', $promo->type)),
                'platform' => $promo->platform?->name ?? 'N/A',
                'status' => $promo->status,
                'status_class' => $statusClasses[$promo->status] ?? 'bg-gray-100 text-gray-800',
                'promoter' => [
                    'name' => $promo->promoter_name ?? $promo->user->name ?? 'Unknown',
                    'email' => $promo->user->email ?? '',
                    'verified' => $promo->promoter_is_verified,
                ],
                'price_ugx' => $promo->price_ugx,
                'price_credits' => $promo->price_credits,
                'rating' => $promo->rating_average,
                'orders' => $promo->total_orders,
                'revenue' => $promo->total_revenue_ugx,
                'reach' => $promo->formatted_reach,
                'featured_image' => $promo->featured_image_url,
                'published_at' => $promo->published_at?->format('M d, Y'),
                'created_at' => $promo->created_at->format('M d, Y'),
            ];
        });

        return view('admin.promotions.index', [
            'stats' => $stats,
            'promotions' => $formattedPromotions,
            'pagination' => $promotions,
        ]);
    }

    public function create()
    {
        $platforms = PromotionPlatform::active()->get();
        $types = Promotion::getTypeOptions();
        
        return view('admin.promotions.create', compact('platforms', 'types'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'short_description' => 'nullable|string|max:500',
            'platform_id' => 'nullable|exists:promotion_platforms,id',
            'type' => 'required|string',
            'price_ugx' => 'required|numeric|min:0',
            'price_credits' => 'required|integer|min:0',
            'estimated_reach' => 'nullable|integer|min:0',
            'delivery_days_min' => 'required|integer|min:1',
            'delivery_days_max' => 'required|integer|min:1',
            'status' => 'required|string',
        ]);

        $promotion = Promotion::create([
            ...$validated,
            'user_id' => auth()->id(),
            'accept_ugx' => $validated['price_ugx'] > 0,
            'accept_credits' => $validated['price_credits'] > 0,
            'published_at' => $validated['status'] === 'active' ? now() : null,
        ]);

        return redirect()->route('admin.promotions.index')
            ->with('success', 'Promotion created successfully');
    }

    public function show($id)
    {
        $promotion = Promotion::with(['user', 'platform', 'orders.buyer', 'reviews.user'])
            ->findOrFail($id);

        return view('admin.promotions.show', compact('promotion'));
    }

    public function edit($id)
    {
        $promotion = Promotion::findOrFail($id);
        $platforms = PromotionPlatform::active()->get();
        $types = Promotion::getTypeOptions();

        return view('admin.promotions.edit', compact('promotion', 'platforms', 'types'));
    }

    public function update(Request $request, $id)
    {
        $promotion = Promotion::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'short_description' => 'nullable|string|max:500',
            'platform_id' => 'nullable|exists:promotion_platforms,id',
            'type' => 'required|string',
            'price_ugx' => 'required|numeric|min:0',
            'price_credits' => 'required|integer|min:0',
            'estimated_reach' => 'nullable|integer|min:0',
            'delivery_days_min' => 'required|integer|min:1',
            'delivery_days_max' => 'required|integer|min:1',
            'status' => 'required|string',
            'is_featured' => 'boolean',
            'is_top_rated' => 'boolean',
        ]);

        $promotion->update([
            ...$validated,
            'accept_ugx' => $validated['price_ugx'] > 0,
            'accept_credits' => $validated['price_credits'] > 0,
            'published_at' => $validated['status'] === 'active' && !$promotion->published_at ? now() : $promotion->published_at,
        ]);

        return redirect()->route('admin.promotions.show', $id)
            ->with('success', 'Promotion updated successfully');
    }

    public function destroy($id)
    {
        $promotion = Promotion::findOrFail($id);
        $promotion->delete();

        return redirect()->route('admin.promotions.index')
            ->with('success', 'Promotion deleted successfully');
    }

    public function approve(Request $request, $id)
    {
        $promotion = Promotion::findOrFail($id);
        $promotion->update([
            'status' => 'active',
            'published_at' => now(),
            'rejection_reason' => null,
        ]);

        return response()->json(['success' => true]);
    }

    public function reject(Request $request, $id)
    {
        $promotion = Promotion::findOrFail($id);
        $promotion->update([
            'status' => 'rejected',
            'rejection_reason' => $request->input('reason'),
        ]);

        return response()->json(['success' => true]);
    }

    public function orders($id)
    {
        $promotion = Promotion::with(['orders.buyer', 'orders.seller'])
            ->findOrFail($id);

        return view('admin.promotions.orders', compact('promotion'));
    }
    
    public function reviews($id)
    {
        $promotion = Promotion::with(['reviews.user', 'reviews.order'])
            ->findOrFail($id);

        return view('admin.promotions.reviews', compact('promotion'));
    }
}
