<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\User;
use App\Models\Song;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class SocialFeedController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // Get activities for the user's feed (using Activity model)
        $activities = \App\Models\Activity::query()
            ->with(['user', 'subject'])
            ->when($user, function($query) use ($user) {
                // Show activities from followed users + own activities
                $followingIds = $user->following()->pluck('following_id')->toArray();
                $followingIds[] = $user->id;
                return $query->whereIn('user_id', $followingIds);
            })
            ->whereNotNull('subject_type')
            ->latest()
            ->paginate(15);

        // Get trending songs
        $trendingSongs = Song::where('status', 'approved')
            ->where('distribution_status', 'distributed')
            ->with(['artist:id,stage_name,avatar'])
            ->orderBy('play_count', 'desc')
            ->limit(5)
            ->get();

        // Get suggested artists to follow
        $suggestedArtists = User::query()
            ->whereHas('artist')
            ->when($user, function($query) use ($user) {
                return $query->whereNotIn('id', 
                    $user->following()->pluck('following_id')->push($user->id)
                );
            })
            ->withCount('followers')
            ->where('is_active', true)
            ->inRandomOrder()
            ->take(3)
            ->get();

        // Get upcoming events
        $upcomingEvents = Event::where('starts_at', '>=', now())
            ->where('status', 'published')
            ->orderBy('starts_at', 'asc')
            ->limit(3)
            ->get();

        // Handle AJAX requests for infinite scroll
        if ($request->ajax() || $request->wantsJson()) {
            $html = '';
            foreach ($activities as $activity) {
                $cardType = match($activity->subject_type) {
                    'App\\Models\\Song' => 'song',
                    'App\\Models\\Album' => 'album',
                    'App\\Models\\Event' => 'event',
                    'App\\Modules\\Store\\Models\\Product' => 'product',
                    'App\\Models\\Podcast' => 'podcast',
                    'App\\Models\\PodcastEpisode' => 'podcast',
                    'App\\Models\\Poll' => 'poll',
                    'App\\Models\\LiveStream' => 'livestream',
                    'App\\Models\\Post' => 'post',
                    null => 'post',
                    default => 'default'
                };
                
                $cardView = 'frontend.partials.activity-cards.' . $cardType;
                
                if (view()->exists($cardView)) {
                    $html .= view($cardView, ['activity' => $activity])->render();
                } else {
                    $html .= view('frontend.partials.activity-cards.default', ['activity' => $activity])->render();
                }
            }

            return response()->json([
                'html' => $html,
                'hasMore' => $activities->hasMorePages(),
                'latestId' => $activities->first()?->id ?? 0,
                'page' => $activities->currentPage()
            ]);
        }

        return view('frontend.timeline', compact(
            'activities',
            'trendingSongs',
            'suggestedArtists',
            'upcomingEvents'
        ));
    }

    /**
     * Check for new posts since given activity ID
     */
    public function checkNewPosts(Request $request)
    {
        $sinceId = $request->get('since', 0);
        $user = Auth::user();

        $count = \App\Models\Activity::query()
            ->when($user, function($query) use ($user) {
                $followingIds = $user->following()->pluck('following_id')->toArray();
                $followingIds[] = $user->id;
                return $query->whereIn('user_id', $followingIds);
            })
            ->where('id', '>', $sinceId)
            ->whereNotNull('subject_type')
            ->count();

        return response()->json(['count' => $count]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'nullable|string|max:2000',
            'type' => 'required|in:text,music,image,video,poll,event_share',
            'privacy' => 'required|in:public,followers,private',
            'media.*' => 'nullable|file|max:50000',
            'song_id' => 'nullable|exists:songs,id',
            'event_id' => 'nullable|exists:events,id',
            'poll_options' => 'nullable|json',
            'poll_duration' => 'nullable|integer|min:1|max:30'
        ]);

        $user = Auth::user();

        // Create the post
        $post = Post::create([
            'user_id' => $user->id,
            'content' => $request->content,
            'type' => $request->type,
            'privacy' => $request->privacy,
            'published_at' => now()
        ]);

        // Handle media uploads
        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $file) {
                $path = $file->store('posts', 'public');
                $post->media()->create([
                    'path' => $path,
                    'type' => str_starts_with($file->getMimeType(), 'video/') ? 'video' : 'image'
                ]);
            }
        }

        // Handle poll
        if ($request->type === 'poll' && $request->poll_options) {
            $options = json_decode($request->poll_options, true);
            $poll = $post->poll()->create([
                'question' => $request->content,
                'ends_at' => now()->addDays($request->poll_duration ?? 7)
            ]);
            
            foreach ($options as $option) {
                $poll->options()->create(['option' => $option]);
            }
        }

        // Handle different post types
        if ($request->type === 'music' && $request->song_id) {
            $song = Song::find($request->song_id);
            $post->update([
                'metadata' => [
                    'song_id' => $song->id,
                    'song_title' => $song->title,
                    'artist_name' => $song->artist->stage_name ?? $song->artist->name
                ]
            ]);
        }
        
        if ($request->ajax() || $request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Post created successfully!',
                'post' => $post
            ]);
        }

        return redirect()->route('frontend.social.feed')->with('success', 'Post created successfully!');
    }

    public function like(Request $request, Post $post)
    {
        $request->validate([
            'reaction_type' => 'required|in:like,love,laugh,angry,sad'
        ]);

        $user = Auth::user();
        $post->like($user, $request->reaction_type);

        if ($request->ajax()) {
            return response()->json([
                'success' => true,
                'likes_count' => $post->fresh()->likes_count,
                'user_liked' => $post->isLikedBy($user)
            ]);
        }

        return back();
    }

    public function comment(Request $request, Post $post)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:post_comments,id'
        ]);

        $user = Auth::user();
        $comment = $post->addComment($user, $request->content, $request->parent_id);

        if ($request->ajax()) {
            return response()->json([
                'success' => true,
                'comment' => [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'user' => [
                        'name' => $comment->user->name,
                        'avatar_url' => $comment->user->avatar_url
                    ],
                    'time_ago' => $comment->time_ago
                ],
                'comments_count' => $post->fresh()->comments_count
            ]);
        }

        return back();
    }
    
    /**
     * Get comments for an activity
     */
    public function getComments(Request $request, $activityId)
    {
        $page = $request->get('page', 1);
        $perPage = 10;
        
        // Get comments with user and replies
        $comments = \App\Models\Comment::where('activity_id', $activityId)
            ->whereNull('parent_id')
            ->with(['user', 'replies.user'])
            ->withCount('likes')
            ->latest()
            ->paginate($perPage);
        
        $user = Auth::user();
        
        // Format comments for JSON
        $formattedComments = $comments->map(function ($comment) use ($user) {
            return $this->formatComment($comment, $user);
        });
        
        return response()->json([
            'success' => true,
            'comments' => $formattedComments,
            'has_more' => $comments->hasMorePages(),
            'total_count' => $comments->total(),
            'page' => $comments->currentPage()
        ]);
    }
    
    /**
     * Store a new comment
     */
    public function storeComment(Request $request)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
            'activity_id' => 'required|exists:activities,id',
            'parent_id' => 'nullable|exists:comments,id'
        ]);
        
        $user = Auth::user();
        
        $comment = \App\Models\Comment::create([
            'user_id' => $user->id,
            'activity_id' => $request->activity_id,
            'parent_id' => $request->parent_id,
            'content' => $request->content
        ]);
        
        $comment->load('user');
        
        return response()->json([
            'success' => true,
            'message' => 'Comment posted successfully!',
            'comment' => $this->formatComment($comment, $user)
        ]);
    }
    
    /**
     * Like/unlike a comment
     */
    public function likeComment(Request $request, $commentId)
    {
        $user = Auth::user();
        $comment = \App\Models\Comment::findOrFail($commentId);
        
        $like = $comment->likes()->where('user_id', $user->id)->first();
        
        if ($like) {
            $like->delete();
            $isLiked = false;
        } else {
            $comment->likes()->create(['user_id' => $user->id]);
            $isLiked = true;
        }
        
        return response()->json([
            'success' => true,
            'is_liked' => $isLiked,
            'likes_count' => $comment->likes()->count()
        ]);
    }
    
    /**
     * Delete a comment
     */
    public function deleteComment($commentId)
    {
        $user = Auth::user();
        $comment = \App\Models\Comment::findOrFail($commentId);
        
        // Check if user owns the comment
        if ($comment->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $comment->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Comment deleted successfully'
        ]);
    }
    
    /**
     * Format comment for JSON response
     */
    private function formatComment($comment, $user = null)
    {
        return [
            'id' => $comment->id,
            'content' => $comment->content,
            'user' => [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
                'avatar_url' => $comment->user->avatar_url ?? asset('images/default-avatar.svg'),
                'is_verified' => $comment->user->is_verified ?? false
            ],
            'likes_count' => $comment->likes_count ?? $comment->likes()->count(),
            'is_liked' => $user ? $comment->likes()->where('user_id', $user->id)->exists() : false,
            'can_delete' => $user ? $comment->user_id === $user->id : false,
            'time_ago' => $comment->created_at->diffForHumans(),
            'replies' => $comment->replies ? $comment->replies->map(function ($reply) use ($user) {
                return $this->formatComment($reply, $user);
            })->toArray() : [],
            'has_more_replies' => false
        ];
    }

    /**
     * Toggle dashboard preference (compatibility method)
     */
    public function toggleDashboard(Request $request)
    {
        return redirect()->route('frontend.timeline')->with('success',
            'Timeline dashboard updated'
        );
    }

    /**
     * Mark content as not interested
     */
    public function notInterested(Request $request)
    {
        $user = Auth::user();
        $activityId = $request->input('activity_id');
        $reason = $request->input('reason');

        // Record preference
        $activity = \App\Models\Activity::findOrFail($activityId);
        
        // Simple implementation - can be enhanced later
        // For now, just return success
        return response()->json([
            'success' => true,
            'message' => 'Thanks for your feedback! We\'ll show you less content like this.'
        ]);
    }
}
