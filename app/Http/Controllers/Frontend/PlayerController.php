<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    public function index()
    {
        return view('frontend.player.index');
    }

    public function library()
    {
        return view('frontend.player.library');
    }

    public function queue()
    {
        return view('frontend.player.queue');
    }

    public function history()
    {
        return view('frontend.player.history');
    }

    public function downloads()
    {
        return view('frontend.player.downloads');
    }
}