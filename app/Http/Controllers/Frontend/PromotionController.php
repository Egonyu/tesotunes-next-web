<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function index()
    {
        return view('frontend.promotions.index');
    }

    public function create()
    {
        return view('frontend.promotions.create');
    }

    public function store(Request $request)
    {
        // Store promotion logic
        return redirect()->route('frontend.promotions.index');
    }

    public function show($promotion)
    {
        return view('frontend.promotions.show', compact('promotion'));
    }

    public function participate(Request $request, $promotion)
    {
        // Participate in promotion logic
        return response()->json(['success' => true]);
    }

    public function myCreated()
    {
        return view('frontend.promotions.my-created');
    }

    public function myParticipated()
    {
        return view('frontend.promotions.my-participated');
    }
}