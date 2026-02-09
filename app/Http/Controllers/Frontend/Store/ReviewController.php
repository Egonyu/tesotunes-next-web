<?php

namespace App\Http\Controllers\Frontend\Store;

use App\Http\Controllers\Controller;
use App\Modules\Store\Models\Product;
use App\Modules\Store\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Store a review for a product
     */
    public function store(Request $request, Product $product)
    {
        // Check if user has purchased this product
        $hasPurchased = Auth::user()->orders()
            ->whereHas('items', function ($query) use ($product) {
                $query->where('product_id', $product->id);
            })
            ->where('status', 'completed')
            ->exists();

        if (!$hasPurchased) {
            abort(403, 'You must purchase this product before reviewing it.');
        }

        // Check if user already reviewed this product
        $existingReview = Review::where('user_id', Auth::id())
            ->where('product_id', $product->id)
            ->first();

        if ($existingReview) {
            return back()->with('error', 'You have already reviewed this product.');
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'title' => 'nullable|string|max:255',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,jpg,png|max:2048',
        ]);

        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('reviews', 'public');
                $imagePaths[] = $path;
            }
        }

        Review::create([
            'user_id' => Auth::id(),
            'product_id' => $product->id,
            'store_id' => $product->store_id,
            'rating' => $validated['rating'],
            'review' => $validated['comment'] ?? null,
            'title' => $validated['title'] ?? null,
            'images' => !empty($imagePaths) ? $imagePaths : null,
            'is_verified_purchase' => true,
            'status' => 'approved',
        ]);

        // Update product average rating
        $this->updateProductRating($product);

        return redirect()->back()->with('success', 'Review submitted successfully!');
    }

    /**
     * Store owner responds to a review
     */
    public function respond(Request $request, Review $review)
    {
        // Load the store relationship if not already loaded
        if (!$review->relationLoaded('store')) {
            $review->load('store');
        }

        // Check if user owns the store
        if (!$review->store || $review->store->user_id !== Auth::id()) {
            abort(403, 'You are not authorized to respond to this review.');
        }

        $validated = $request->validate([
            'response' => 'required|string|max:1000',
        ]);

        $review->update([
            'seller_response' => $validated['response'],
            'seller_response_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Response posted successfully!');
    }

    /**
     * Mark review as helpful
     */
    public function markHelpful(Request $request, Review $review)
    {
        $review->increment('helpful_count');

        return redirect()->back()->with('success', 'Thank you for your feedback!');
    }

    /**
     * Report inappropriate review
     */
    public function report(Request $request, Review $review)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
            'details' => 'nullable|string|max:1000',
        ]);

        // Create report record
        \DB::table('review_reports')->insert([
            'review_id' => $review->id,
            'user_id' => Auth::id(),
            'reported_by' => Auth::id(), // Both columns for compatibility
            'reason' => $validated['reason'],
            'details' => $validated['details'] ?? null,
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Review reported successfully!');
    }

    /**
     * Update product average rating
     */
    protected function updateProductRating(Product $product)
    {
        $avgRating = Review::where('product_id', $product->id)
            ->where('status', 'approved')
            ->avg('rating');

        $reviewCount = Review::where('product_id', $product->id)
            ->where('status', 'approved')
            ->count();

        $product->update([
            'rating' => $avgRating ? round($avgRating, 1) : null,
            'review_count' => $reviewCount,
        ]);
    }
}
