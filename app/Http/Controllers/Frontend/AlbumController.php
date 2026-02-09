<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Album;
use Illuminate\Http\Request;

class AlbumController extends Controller
{
    public function show(Album $album)
    {
        // Load relationships
        $album->load(['artist', 'songs' => function($query) {
            $query->where('status', 'published')->orderBy('track_number');
        }]);
        
        // Check if current user has liked this album
        $isLiked = false;
        if (auth()->check()) {
            $isLiked = auth()->user()->likes()
                ->where('likeable_type', Album::class)
                ->where('likeable_id', $album->id)
                ->exists();
        }
        
        // Get other albums by the same artist
        $otherAlbums = Album::where('artist_id', $album->artist_id)
            ->where('id', '!=', $album->id)
            ->where('status', 'published')
            ->with(['artist'])
            ->limit(6)
            ->get();
        
        return view('frontend.album.show', compact('album', 'isLiked', 'otherAlbums'));
    }
}
