<?php

namespace App\Http\Controllers\Frontend\Artist;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use App\Models\PromotionOrder;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Get user's promotions (as creator/promoter)
        $promotions = Promotion::where('user_id', $user->id)
            ->with(['platform', 'orders'])
            ->latest()
            ->get();

        // Calculate stats
        $stats = [
            'active' => $promotions->where('status', 'active')->count(),
            'total_orders' => $promotions->sum('total_orders'),
            'completed_orders' => $promotions->sum('completed_orders'),
            'revenue_ugx' => $promotions->sum('total_revenue_ugx'),
            'revenue_credits' => $promotions->sum('total_revenue_credits'),
        ];

        // Get counts for filters
        $counts = [
            'all' => $promotions->count(),
            'active' => $promotions->where('status', 'active')->count(),
            'pending' => $promotions->where('status', 'pending')->count(),
            'paused' => $promotions->where('status', 'paused')->count(),
            'draft' => $promotions->where('status', 'draft')->count(),
        ];

        // Format promotions for view
        $formattedPromotions = $promotions->map(function ($promo) {
            $statusColors = [
                'active' => 'bg-green-900 text-green-300',
                'pending' => 'bg-yellow-900 text-yellow-300',
                'paused' => 'bg-orange-900 text-orange-300',
                'draft' => 'bg-gray-700 text-gray-300',
                'rejected' => 'bg-red-900 text-red-300',
                'archived' => 'bg-gray-700 text-gray-300',
            ];

            return [
                'id' => $promo->id,
                'title' => $promo->title,
                'description' => $promo->short_description ?? $promo->description,
                'type' => ucfirst(str_replace('_', ' ', $promo->type)),
                'platform' => $promo->platform?->name,
                'status' => $promo->status,
                'status_color' => $statusColors[$promo->status] ?? 'bg-gray-700 text-gray-300',
                'is_featured' => $promo->is_featured,
                'is_top_rated' => $promo->is_top_rated,
                'price_ugx' => $promo->price_ugx,
                'price_credits' => $promo->price_credits,
                'price_display' => $promo->price_display,
                'rating' => $promo->rating_average,
                'reviews' => $promo->rating_count,
                'reach' => $promo->formatted_reach,
                'total_orders' => $promo->total_orders,
                'completed_orders' => $promo->completed_orders,
                'active_orders' => $promo->active_orders,
                'revenue_ugx' => $promo->total_revenue_ugx,
                'revenue_credits' => $promo->total_revenue_credits,
                'delivery' => $promo->delivery_display,
                'published_at' => $promo->published_at?->format('M d, Y'),
                'created_at' => $promo->created_at->format('M d, Y'),
            ];
        });

        return view('frontend.artist.promotions', [
            'stats' => $stats,
            'counts' => $counts,
            'promotions' => $formattedPromotions,
        ]);
    }
    
    /**
     * View orders for my promotions (as seller)
     */
    public function orders()
    {
        $user = auth()->user();
        
        $orders = PromotionOrder::with(['promotion.platform', 'buyer'])
            ->where('seller_id', $user->id)
            ->latest()
            ->paginate(20);
            
        return view('frontend.artist.promotion-orders', compact('orders'));
    }
    
    /**
     * View my purchases (promotions I bought)
     */
    public function purchases()
    {
        $user = auth()->user();
        
        $orders = PromotionOrder::with(['promotion.platform', 'seller'])
            ->where('buyer_id', $user->id)
            ->latest()
            ->paginate(20);
            
        return view('frontend.artist.promotion-purchases', compact('orders'));
    }
}
