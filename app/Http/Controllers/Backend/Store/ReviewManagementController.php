<?php

namespace App\Http\Controllers\Backend\Store;

use App\Http\Controllers\Controller;
use App\Modules\Store\Models\Review;
use Illuminate\Http\Request;

class ReviewManagementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Approve a review
     */
    public function approve(Review $review)
    {
        $review->update([
            'is_approved' => true,
            'status' => 'approved',
        ]);

        return redirect()->back()->with('success', 'Review approved successfully!');
    }

    /**
     * Reject a review
     */
    public function reject(Review $review)
    {
        $review->update([
            'is_approved' => false,
            'status' => 'rejected',
        ]);

        return redirect()->back()->with('success', 'Review rejected successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Review $review)
    {
        $review->delete();

        return redirect()->back()->with('success', 'Review deleted successfully!');
    }
}
