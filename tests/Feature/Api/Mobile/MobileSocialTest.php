<?php

use App\Models\User;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\PostLike;
use App\Models\Song;
use App\Models\Artist;
use App\Models\UserFollow;
use App\Models\Notification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('digitalocean');
});

test('can get social feed', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    
    // Follow other user
    UserFollow::create([
        'follower_id' => $user->id,
        'following_type' => 'App\\Models\\User',
        'following_id' => $otherUser->id,
    ]);
    
    // Create posts
    Post::factory()->count(3)->create(['user_id' => $otherUser->id]);
    Post::factory()->create(['user_id' => $user->id]); // Own post
    Post::factory()->create(['visibility' => 'public']); // Public post
    
    Sanctum::actingAs($user);
    
    $response = $this->getJson('/api/mobile/social/feed');
    
    $response->assertOk()
        ->assertJsonStructure([
            'success',
            'posts' => [
                '*' => [
                    'id',
                    'content',
                    'user' => ['id', 'name', 'avatar'],
                    'likes_count',
                    'comments_count',
                    'is_liked',
                    'created_at',
                ],
            ],
            'pagination',
        ]);
});

test('can get own posts', function () {
    $user = User::factory()->create();
    
    Post::factory()->count(3)->create(['user_id' => $user->id]);
    Post::factory()->create(); // Another user's post
    
    Sanctum::actingAs($user);
    
    $response = $this->getJson('/api/mobile/social/my-posts');
    
    $response->assertOk();
    
    $posts = $response->json('posts');
    
    expect($posts)->toHaveCount(3);
});

test('can create post', function () {
    $user = User::factory()->create();
    $artist = Artist::factory()->create();
    $song = Song::factory()->create(['artist_id' => $artist->id]);
    
    Sanctum::actingAs($user);
    
    $response = $this->postJson('/api/mobile/social/posts', [
        'content' => 'Check out this amazing song!',
        'song_id' => $song->id,
        'visibility' => 'public',
    ]);
    
    $response->assertStatus(201)
        ->assertJson([
            'success' => true,
            'message' => 'Post created successfully',
        ])
        ->assertJsonStructure([
            'post' => ['id', 'content', 'song', 'user'],
        ]);
    
    $this->assertDatabaseHas('posts', [
        'user_id' => $user->id,
        'content' => 'Check out this amazing song!',
        'song_id' => $song->id,
    ]);
});

test('can create post with media', function () {
    $user = User::factory()->create();
    
    Sanctum::actingAs($user);
    
    $image = UploadedFile::fake()->image('photo.jpg');
    
    $response = $this->postJson('/api/mobile/social/posts', [
        'content' => 'Post with image',
        'media' => [$image],
        'visibility' => 'public',
    ]);
    
    $response->assertStatus(201);
    
    // Assert the file exists on the fake disk
    $this->assertTrue(
        Storage::disk('digitalocean')->exists('posts/' . $user->id . '/' . $image->hashName())
    );
});

test('can update own post', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $user->id]);
    
    Sanctum::actingAs($user);
    
    $response = $this->putJson("/api/mobile/social/posts/{$post->id}", [
        'content' => 'Updated content',
        'visibility' => 'followers',
    ]);
    
    $response->assertOk()
        ->assertJson([
            'success' => true,
            'message' => 'Post updated successfully',
        ]);
    
    $this->assertDatabaseHas('posts', [
        'id' => $post->id,
        'content' => 'Updated content',
        'visibility' => 'followers',
    ]);
});

test('cannot update other users post', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $otherUser->id]);
    
    Sanctum::actingAs($user);
    
    $response = $this->putJson("/api/mobile/social/posts/{$post->id}", [
        'content' => 'Trying to update',
    ]);
    
    $response->assertStatus(403);
});

test('can delete own post', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $user->id]);
    
    Sanctum::actingAs($user);
    
    $response = $this->deleteJson("/api/mobile/social/posts/{$post->id}");
    
    $response->assertOk()
        ->assertJson([
            'success' => true,
            'message' => 'Post deleted successfully',
        ]);
    
    $this->assertSoftDeleted('posts', ['id' => $post->id]);
});

test('can like and unlike post', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create();
    
    Sanctum::actingAs($user);
    
    // Like
    $response = $this->postJson("/api/mobile/social/posts/{$post->id}/like");
    
    $response->assertOk()
        ->assertJson([
            'success' => true,
            'action' => 'liked',
        ]);
    
    $this->assertDatabaseHas('post_likes', [
        'user_id' => $user->id,
        'post_id' => $post->id,
    ]);
    
    // Unlike
    $response = $this->postJson("/api/mobile/social/posts/{$post->id}/like");
    
    $response->assertOk()
        ->assertJson([
            'success' => true,
            'action' => 'unliked',
        ]);
    
    $this->assertDatabaseMissing('post_likes', [
        'user_id' => $user->id,
        'post_id' => $post->id,
    ]);
});

test('liking post creates notification for owner', function () {
    $user = User::factory()->create();
    $postOwner = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $postOwner->id]);
    
    Sanctum::actingAs($user);
    
    $this->postJson("/api/mobile/social/posts/{$post->id}/like");
    
    $this->assertDatabaseHas('notifications', [
        'user_id' => $postOwner->id,
        'notification_type' => 'post_like',
    ]);
});

test('can get post comments', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create();
    
    PostComment::factory()->count(5)->create(['post_id' => $post->id]);
    
    Sanctum::actingAs($user);
    
    $response = $this->getJson("/api/mobile/social/posts/{$post->id}/comments");
    
    $response->assertOk()
        ->assertJsonStructure([
            'success',
            'comments' => [
                '*' => ['id', 'content', 'user', 'created_at'],
            ],
            'pagination',
        ]);
});

test('can add comment to post', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create();
    
    Sanctum::actingAs($user);
    
    $response = $this->postJson("/api/mobile/social/posts/{$post->id}/comments", [
        'content' => 'Great post!',
    ]);
    
    $response->assertStatus(201)
        ->assertJson([
            'success' => true,
            'message' => 'Comment added successfully',
        ])
        ->assertJsonStructure([
            'comment' => ['id', 'content', 'user', 'created_at'],
        ]);
    
    $this->assertDatabaseHas('post_comments', [
        'post_id' => $post->id,
        'user_id' => $user->id,
        'content' => 'Great post!',
    ]);
});

test('commenting creates notification for post owner', function () {
    $user = User::factory()->create();
    $postOwner = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $postOwner->id]);
    
    Sanctum::actingAs($user);
    
    $this->postJson("/api/mobile/social/posts/{$post->id}/comments", [
        'content' => 'Nice!',
    ]);
    
    $this->assertDatabaseHas('notifications', [
        'user_id' => $postOwner->id,
        'notification_type' => 'post_comment',
    ]);
});

test('can delete own comment', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create();
    $comment = PostComment::factory()->create([
        'post_id' => $post->id,
        'user_id' => $user->id,
    ]);
    
    Sanctum::actingAs($user);
    
    $response = $this->deleteJson("/api/mobile/social/posts/{$post->id}/comments/{$comment->id}");
    
    $response->assertOk()
        ->assertJson([
            'success' => true,
            'message' => 'Comment deleted successfully',
        ]);
    
    $this->assertSoftDeleted('post_comments', ['id' => $comment->id]);
});

test('post owner can delete any comment', function () {
    $postOwner = User::factory()->create();
    $commenter = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $postOwner->id]);
    $comment = PostComment::factory()->create([
        'post_id' => $post->id,
        'user_id' => $commenter->id,
    ]);
    
    Sanctum::actingAs($postOwner);
    
    $response = $this->deleteJson("/api/mobile/social/posts/{$post->id}/comments/{$comment->id}");
    
    $response->assertOk();
});

test('can get notifications', function () {
    $user = User::factory()->create();
    
    Notification::factory()->count(10)->read()->create(['user_id' => $user->id]);
    Notification::factory()->count(3)->create(['user_id' => $user->id]);
    
    Sanctum::actingAs($user);
    
    $response = $this->getJson('/api/mobile/social/notifications');
    
    $response->assertOk()
        ->assertJsonStructure([
            'success',
            'notifications' => [
                '*' => ['id', 'type', 'data', 'read', 'created_at'],
            ],
            'unread_count',
            'pagination',
        ])
        ->assertJson([
            'unread_count' => 3,
        ]);
});

test('can mark notification as read', function () {
    $user = User::factory()->create();
    $notification = Notification::factory()->create([
        'user_id' => $user->id,
        'read_at' => null,
    ]);
    
    Sanctum::actingAs($user);
    
    $response = $this->postJson("/api/mobile/social/notifications/{$notification->id}/read");
    
    $response->assertOk()
        ->assertJson([
            'success' => true,
            'message' => 'Notification marked as read',
        ]);
    
    $this->assertNotNull($notification->fresh()->read_at);
});

test('can mark all notifications as read', function () {
    $user = User::factory()->create();
    
    Notification::factory()->count(5)->create([
        'user_id' => $user->id,
        'read_at' => null,
    ]);
    
    Sanctum::actingAs($user);
    
    $response = $this->postJson('/api/mobile/social/notifications/read-all');
    
    $response->assertOk()
        ->assertJson([
            'success' => true,
            'message' => 'All notifications marked as read',
        ]);
    
    $this->assertEquals(0, Notification::where('user_id', $user->id)->whereNull('read_at')->count());
});

test('unauthenticated user cannot access social features', function () {
    $response = $this->getJson('/api/mobile/social/feed');
    
    $response->assertStatus(401);
});
