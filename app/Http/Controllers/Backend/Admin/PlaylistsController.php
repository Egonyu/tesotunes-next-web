<?php

namespace App\Http\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Playlist;
use App\Models\Genre;
use App\Models\Mood;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class PlaylistsController extends Controller
{
    public function index(Request $request)
    {
        $query = Playlist::with(['owner:id,name,username,email', 'songs']);

        // Advanced Search
        if ($request->has('keyword') && $request->keyword) {
            $query->where('title', 'like', '%' . $request->keyword . '%');
        }

        // Filter by creator/user
        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by genres (assuming genres are stored in a relationship or JSON field)
        if ($request->has('genres') && $request->genres) {
            // This assumes you have a genres relationship or JSON field
            // Adjust based on your actual implementation
            $genres = is_array($request->genres) ? $request->genres : [$request->genres];
            foreach ($genres as $genre) {
                $query->whereHas('songs', function ($q) use ($genre) {
                    $q->where('genre_id', $genre);
                });
            }
        }

        // Filter by moods
        if ($request->has('moods') && $request->moods) {
            $moods = is_array($request->moods) ? $request->moods : [$request->moods];
            foreach ($moods as $mood) {
                $query->whereHas('songs', function ($q) use ($mood) {
                    $q->where('mood_id', $mood);
                });
            }
        }

        // Date range filter
        if ($request->has('date_from') && $request->date_from) {
            $query->where('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->where('created_at', '<=', $request->date_to);
        }

        // Comment count filter
        if ($request->has('comments_min') && $request->comments_min) {
            $query->has('comments', '>=', $request->comments_min);
        }
        if ($request->has('comments_max') && $request->comments_max) {
            $query->has('comments', '<=', $request->comments_max);
        }

        // Boolean filters
        if ($request->has('comments_disabled') && $request->comments_disabled) {
            $query->where('allow_comments', 0);
        }

        if ($request->has('not_approved') && $request->not_approved) {
            $query->where('approved', 0);
        }

        if ($request->has('hidden') && $request->hidden) {
            $query->where('visibility', 'private');
        }

        // Sorting
        if ($request->has('sort_by')) {
            switch ($request->sort_by) {
                case 'loves':
                    $query->orderBy('like_count', 'desc');
                    break;
                case 'plays':
                    $query->orderBy('play_count', 'desc');
                    break;
                case 'title':
                    $query->orderBy('title', 'asc');
                    break;
                case 'created':
                    $query->orderBy('created_at', 'desc');
                    break;
                default:
                    $query->orderBy('created_at', 'desc');
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $request->get('per_page', 20);
        $playlists = $query->paginate($perPage);

        $genres = Genre::where('is_active', 1)->orderBy('name')->get();
        $moods = Mood::where('is_active', 1)->orderBy('name')->get();
        $users = User::select('id', 'name', 'username', 'email')->orderBy('name')->limit(100)->get();

        return view('admin.playlists.index', compact('playlists', 'genres', 'moods', 'users'));
    }

    public function edit($id = null)
    {
        $playlist = $id ? Playlist::findOrFail($id) : new Playlist();
        $genres = Genre::where('active', 1)->orderBy('name')->get();
        $moods = Mood::where('active', 1)->orderBy('name')->get();

        return view('admin.playlists.edit', compact('playlist', 'genres', 'moods'));
    }

    public function savePost(Request $request, $id = null)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'user_id' => 'required|exists:users,id',
            'visibility' => 'required|in:public,private,unlisted',
            'allow_comments' => 'nullable|boolean',
        ]);

        if ($id) {
            $playlist = Playlist::findOrFail($id);
            $playlist->update($validated);
            $message = 'Playlist successfully updated!';
        } else {
            $validated['slug'] = Str::slug($validated['title']);
            $playlist = Playlist::create($validated);
            $message = 'Playlist successfully created!';
        }

        // Clear cache
        Cache::forget('playlists.featured');
        Cache::forget('playlists.trending');

        return redirect()->route('admin.playlists.index')
            ->with('status', 'success')
            ->with('message', $message);
    }

    public function trackList($id)
    {
        $playlist = Playlist::with(['songs.artist', 'owner'])->findOrFail($id);

        return view('admin.playlists.tracklist', compact('playlist'));
    }

    public function trackListMassAction(Request $request, $id)
    {
        $playlist = Playlist::findOrFail($id);
        $action = $request->input('action');
        $songIds = $request->input('song_ids', []);

        if (empty($songIds)) {
            return redirect()->back()
                ->with('status', 'error')
                ->with('message', 'No songs selected!');
        }

        switch ($action) {
            case 'remove':
                $playlist->songs()->detach($songIds);
                $message = 'Songs removed from playlist!';
                break;

            case 'delete':
                // Only delete if admin has permission
                Song::whereIn('id', $songIds)->delete();
                $message = 'Songs deleted!';
                break;

            default:
                return redirect()->back()
                    ->with('status', 'error')
                    ->with('message', 'Invalid action!');
        }

        // Update playlist stats
        $playlist->total_tracks = $playlist->songs()->count();
        $playlist->save();

        return redirect()->back()
            ->with('status', 'success')
            ->with('message', $message);
    }

    public function massAction(Request $request)
    {
        $action = $request->input('action');
        $playlistIds = $request->input('playlist_ids', []);

        if (empty($playlistIds)) {
            return redirect()->back()
                ->with('status', 'error')
                ->with('message', 'No playlists selected!');
        }

        switch ($action) {
            case 'set_public':
                Playlist::whereIn('id', $playlistIds)->update(['visibility' => 'public']);
                $message = 'Playlists set to public!';
                break;

            case 'set_private':
                Playlist::whereIn('id', $playlistIds)->update(['visibility' => 'private']);
                $message = 'Playlists set to private!';
                break;

            case 'enable_comments':
                Playlist::whereIn('id', $playlistIds)->update(['allow_comments' => 1]);
                $message = 'Comments enabled!';
                break;

            case 'disable_comments':
                Playlist::whereIn('id', $playlistIds)->update(['allow_comments' => 0]);
                $message = 'Comments disabled!';
                break;

            case 'delete':
                Playlist::whereIn('id', $playlistIds)->delete();
                $message = 'Playlists deleted!';
                break;

            default:
                return redirect()->back()
                    ->with('status', 'error')
                    ->with('message', 'Invalid action!');
        }

        Cache::forget('playlists.featured');
        Cache::forget('playlists.trending');

        return redirect()->back()
            ->with('status', 'success')
            ->with('message', $message);
    }

    public function delete($id)
    {
        $playlist = Playlist::findOrFail($id);
        $playlist->delete();

        Cache::forget('playlists.featured');
        Cache::forget('playlists.trending');

        return redirect()->route('admin.playlists.index')
            ->with('status', 'success')
            ->with('message', 'Playlist successfully deleted!');
    }

    public function updateTrackOrder(Request $request, $id)
    {
        $playlist = Playlist::findOrFail($id);
        $songIds = $request->input('song_ids', []);

        foreach ($songIds as $index => $songId) {
            DB::table('playlist_songs')
                ->where('playlist_id', $id)
                ->where('song_id', $songId)
                ->update(['position' => $index + 1]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Track order updated!'
        ]);
    }
}
