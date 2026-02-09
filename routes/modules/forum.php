<?php

use App\Modules\Forum\Controllers\Frontend\ForumController;
use App\Modules\Forum\Controllers\Frontend\TopicController;
use App\Modules\Forum\Controllers\Frontend\ReplyController;
use App\Modules\Forum\Controllers\Frontend\PollController;
use App\Modules\Forum\Controllers\Backend\Admin\ForumManagementController;
use App\Modules\Forum\Controllers\Backend\Admin\CategoryController;
use App\Modules\Forum\Controllers\Backend\Admin\ModerationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Forum & Polls Module Routes
|--------------------------------------------------------------------------
|
| These routes are loaded by the RouteServiceProvider and are gated by
| the CheckModuleEnabled middleware. If the forum or polls module is
| disabled in the admin panel, these routes will return 503.
|
*/

// =============================================================================
// FRONTEND ROUTES - Forum
// =============================================================================

Route::middleware(['web', 'auth', 'module.enabled:forum'])
    ->prefix('forum')
    ->name('forum.')
    ->group(function () {
        
        // Forum browsing (read-only)
        Route::get('/', [ForumController::class, 'index'])->name('index');
        Route::get('/search', [ForumController::class, 'search'])->name('search');
        Route::get('/category/{slug}', [ForumController::class, 'category'])->name('category');
        
        // Topic management
        Route::get('/topic/create', [TopicController::class, 'create'])->name('topic.create');
        Route::post('/topic', [TopicController::class, 'store'])->name('topic.store');
        Route::get('/topic/{slug}', [TopicController::class, 'show'])->name('topic.show');
        Route::get('/topic/{topic}/edit', [TopicController::class, 'edit'])->name('topic.edit');
        Route::patch('/topic/{topic}', [TopicController::class, 'update'])->name('topic.update');
        Route::delete('/topic/{topic}', [TopicController::class, 'destroy'])->name('topic.destroy');
        
        // Topic actions
        Route::post('/topic/{topic}/like', [TopicController::class, 'like'])->name('topic.like');
        Route::post('/topic/{topic}/pin', [TopicController::class, 'togglePin'])->name('topic.pin');
        Route::post('/topic/{topic}/lock', [TopicController::class, 'toggleLock'])->name('topic.lock');
        Route::post('/topic/{topic}/feature', [TopicController::class, 'toggleFeatured'])->name('topic.feature');
        
        // Reply management
        Route::post('/topic/{topic}/reply', [ReplyController::class, 'store'])->name('reply.store');
        Route::get('/reply/{reply}/edit', [ReplyController::class, 'edit'])->name('reply.edit');
        Route::patch('/reply/{reply}', [ReplyController::class, 'update'])->name('reply.update');
        Route::delete('/reply/{reply}', [ReplyController::class, 'destroy'])->name('reply.destroy');
        
        // Reply actions
        Route::post('/reply/{reply}/like', [ReplyController::class, 'like'])->name('reply.like');
        Route::post('/topic/{topic}/reply/{reply}/solution', [ReplyController::class, 'markAsSolution'])->name('reply.solution');

        // Category suggestions (for regular users)
        Route::get('/suggest-category', [ForumController::class, 'suggestCategory'])->name('suggest-category');
        Route::post('/suggest-category', [ForumController::class, 'storeCategorySuggestion'])->name('suggest-category.store');
    });

// =============================================================================
// FRONTEND ROUTES - Polls
// =============================================================================

Route::middleware(['web', 'auth', 'module.enabled:polls'])
    ->prefix('polls')
    ->name('polls.')
    ->group(function () {
        
        // Poll browsing
        Route::get('/', [PollController::class, 'index'])->name('index');
        
        // Poll management
        Route::get('/create', [PollController::class, 'create'])->name('create');
        Route::post('/', [PollController::class, 'store'])->name('store');
        Route::get('/{poll}', [PollController::class, 'show'])->name('show');
        Route::get('/{poll}/edit', [PollController::class, 'edit'])->name('edit');
        Route::patch('/{poll}', [PollController::class, 'update'])->name('update');
        Route::delete('/{poll}', [PollController::class, 'destroy'])->name('destroy');
        
        // Poll actions
        Route::post('/{poll}/vote', [PollController::class, 'vote'])->name('vote');
        Route::get('/{poll}/results', [PollController::class, 'results'])->name('results');
        Route::post('/{poll}/close', [PollController::class, 'close'])->name('close');
    });

// =============================================================================
// ADMIN ROUTES - Forum & Polls Management
// =============================================================================

Route::middleware(['web', 'auth', 'role:admin,super_admin,moderator'])
    ->prefix('admin/modules/forum')
    ->name('admin.modules.forum.')
    ->group(function () {
        
        // Module settings (admin/super_admin only)
        Route::middleware('role:admin,super_admin')->group(function () {
            Route::get('/settings', [ForumManagementController::class, 'settings'])->name('settings');
            Route::post('/settings', [ForumManagementController::class, 'updateSettings'])->name('settings.update');
            Route::get('/dashboard', [ForumManagementController::class, 'dashboard'])->name('dashboard');
        });
        
        // Category management (admin/super_admin only)
        Route::middleware('role:admin,super_admin')->group(function () {
            Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
            Route::get('/categories/create', [CategoryController::class, 'create'])->name('categories.create');
            Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
            Route::get('/categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
            Route::patch('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
            Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
        });
        
        // Moderation (moderator, admin, super_admin)
        Route::get('/moderation', [ModerationController::class, 'index'])->name('moderation.index');
        Route::get('/moderation/pending', [ModerationController::class, 'pending'])->name('moderation.pending');
        Route::post('/moderation/topic/{topic}/approve', [ModerationController::class, 'approveTopic'])->name('moderation.approve');
        Route::post('/moderation/topic/{topic}/reject', [ModerationController::class, 'rejectTopic'])->name('moderation.reject');
        Route::post('/moderation/topic/{topic}/archive', [ModerationController::class, 'archiveTopic'])->name('moderation.archive');
        Route::delete('/moderation/topic/{topic}', [ModerationController::class, 'deleteTopic'])->name('moderation.delete-topic');
        Route::delete('/moderation/reply/{reply}', [ModerationController::class, 'deleteReply'])->name('moderation.delete-reply');
    });

// =============================================================================
// API ROUTES - For Mobile App & AJAX
// =============================================================================

Route::middleware(['api', 'auth:sanctum'])
    ->prefix('api/v1/forum')
    ->name('api.forum.')
    ->group(function () {
        
        // Check if module is enabled
        Route::middleware('module.enabled:forum')->group(function () {
            // Forum API endpoints
            Route::get('/categories', [ForumController::class, 'index']);
            Route::get('/category/{slug}/topics', [ForumController::class, 'category']);
            Route::get('/topic/{slug}', [TopicController::class, 'show']);
            Route::post('/topic', [TopicController::class, 'store']);
            Route::post('/topic/{topic}/reply', [ReplyController::class, 'store']);
            Route::post('/topic/{topic}/like', [TopicController::class, 'like']);
            Route::post('/reply/{reply}/like', [ReplyController::class, 'like']);
        });
        
        // Polls API endpoints
        Route::middleware('module.enabled:polls')->group(function () {
            Route::get('/polls', [PollController::class, 'index']);
            Route::get('/poll/{poll}', [PollController::class, 'show']);
            Route::post('/poll', [PollController::class, 'store']);
            Route::post('/poll/{poll}/vote', [PollController::class, 'vote']);
            Route::get('/poll/{poll}/results', [PollController::class, 'results']);
        });
    });
