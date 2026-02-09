<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Slide;
use App\Models\Song;
use App\Models\Album;
use App\Models\Artist;
use App\Models\Playlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SlideshowController extends Controller
{
    public function index()
    {
        $slides = Slide::with(['user', 'object'])
            ->orderBy('priority', 'desc')
            ->paginate(20);
        
        return view('admin.slideshow.index', compact('slides'));
    }

    public function create()
    {
        return view('admin.slideshow.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'title_link' => 'nullable|url',
            'description' => 'nullable|string',
            'object_type' => 'required|string|in:song,album,artist,playlist,station,user',
            'object_id' => 'required|integer',
            'priority' => 'nullable|integer',
            'allow_home' => 'boolean',
            'allow_discover' => 'boolean',
            'allow_radio' => 'boolean',
            'allow_community' => 'boolean',
            'allow_trending' => 'boolean',
            'allow_channels' => 'boolean',
            'genre' => 'nullable|string|max:50',
            'mood' => 'nullable|string|max:50',
            'visibility' => 'boolean',
        ]);

        $validated['user_id'] = Auth::id();

        $slide = Slide::create($validated);

        // Handle media upload if provided
        if ($request->hasFile('artwork')) {
            $slide->addMediaFromRequest('artwork')
                ->toMediaCollection('artwork');
        }

        return redirect()->route('admin.slideshow.overview')
            ->with('success', 'Slide created successfully.');
    }

    public function edit(Slide $slide)
    {
        return view('admin.slideshow.edit', compact('slide'));
    }

    public function update(Request $request, Slide $slide)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'title_link' => 'nullable|url',
            'description' => 'nullable|string',
            'object_type' => 'required|string|in:song,album,artist,playlist,station,user',
            'object_id' => 'required|integer',
            'priority' => 'nullable|integer',
            'allow_home' => 'boolean',
            'allow_discover' => 'boolean',
            'allow_radio' => 'boolean',
            'allow_community' => 'boolean',
            'allow_trending' => 'boolean',
            'allow_channels' => 'boolean',
            'genre' => 'nullable|string|max:50',
            'mood' => 'nullable|string|max:50',
            'visibility' => 'boolean',
        ]);

        $slide->update($validated);

        // Handle media upload if provided
        if ($request->hasFile('artwork')) {
            $slide->clearMediaCollection('artwork');
            $slide->addMediaFromRequest('artwork')
                ->toMediaCollection('artwork');
        }

        return redirect()->route('admin.slideshow.overview')
            ->with('success', 'Slide updated successfully.');
    }

    public function destroy(Slide $slide)
    {
        $slide->delete();

        return redirect()->route('admin.slideshow.overview')
            ->with('success', 'Slide deleted successfully.');
    }

    public function toggle(Slide $slide)
    {
        $slide->update(['visibility' => !$slide->visibility]);

        return redirect()->route('admin.slideshow.overview')
            ->with('success', 'Slide visibility updated.');
    }
}
