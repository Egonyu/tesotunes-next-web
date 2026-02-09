<?php

namespace App\Modules\Store\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Store\Models\{Product, Store, StoreReview};
use App\Modules\Store\Services\ReviewService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Review API Controller
 */
class ReviewController extends Controller
{
    public function __construct(
        protected ReviewService $reviewService
    ) {}

    /**
     * Get product reviews
     */
    public function productReviews(Product $product, Request $request): JsonResponse
    {
        $filters = $request->only(['rating', 'verified', 'sort']);
        $reviews = $this->reviewService->getProductReviews($product, $filters);
        $stats = $this->reviewService->getProductReviewStats($product);

        return response()->json([
            'success' => true,
            'data' => [
                'reviews' => $reviews,
                'statistics' => $stats,
            ]
        ]);
    }

    /**
     * Create product review
     */
    public function createProductReview(Request $request, Product $product): JsonResponse
    {
        $this->authorize('create', StoreReview::class);

        // Check if user can review
        $canReview = $this->reviewService->canReviewProduct($request->user(), $product);
        
        if (!$canReview['can_review']) {
            return response()->json([
                'success' => false,
                'message' => $canReview['reason']
            ], 422);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:100',
            'review' => 'required|string|max:1000',
            'order_id' => 'nullable|exists:orders,id',
        ]);

        try {
            $review = $this->reviewService->createProductReview(
                $request->user(),
                $product,
                $validated
            );

            return response()->json([
                'success' => true,
                'message' => 'Review submitted successfully',
                'data' => $review
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update review
     */
    public function update(Request $request, StoreReview $review): JsonResponse
    {
        $this->authorize('update', $review);

        $validated = $request->validate([
            'rating' => 'sometimes|required|integer|min:1|max:5',
            'title' => 'nullable|string|max:100',
            'review' => 'sometimes|required|string|max:1000',
        ]);

        $updated = $this->reviewService->updateReview($review, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Review updated successfully',
            'data' => $updated
        ]);
    }

    /**
     * Delete review
     */
    public function destroy(Request $request, StoreReview $review): JsonResponse
    {
        $this->authorize('delete', $review);

        $this->reviewService->deleteReview($review);

        return response()->json([
            'success' => true,
            'message' => 'Review deleted successfully'
        ]);
    }

    /**
     * Mark review as helpful
     */
    public function markHelpful(Request $request, StoreReview $review): JsonResponse
    {
        $validated = $request->validate([
            'helpful' => 'required|boolean'
        ]);

        $this->reviewService->markHelpful($review, $request->user(), $validated['helpful']);

        return response()->json([
            'success' => true,
            'message' => 'Thank you for your feedback'
        ]);
    }

    /**
     * Add seller response (seller only)
     */
    public function addSellerResponse(Request $request, StoreReview $review): JsonResponse
    {
        $this->authorize('respond', $review);

        $validated = $request->validate([
            'response' => 'required|string|max:500'
        ]);

        $updated = $this->reviewService->addSellerResponse($review, $validated['response']);

        return response()->json([
            'success' => true,
            'message' => 'Response added successfully',
            'data' => $updated
        ]);
    }

    /**
     * Check if user can review product
     */
    public function canReview(Request $request, Product $product): JsonResponse
    {
        $result = $this->reviewService->canReviewProduct($request->user(), $product);

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }
}
