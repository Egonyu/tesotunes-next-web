<!-- Comments Modal/Drawer -->
<div 
    x-data="commentsModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    @open-comments-modal.window="openModal($event.detail)"
    class="fixed inset-0 z-50 overflow-hidden"
    style="display: none;"
>
    <!-- Backdrop -->
    <div 
        class="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        @click="closeModal()"
        x-show="open"
        x-transition:enter="ease-out duration-300"
        x-transition:enter-start="opacity-0"
        x-transition:enter-end="opacity-100"
        x-transition:leave="ease-in duration-200"
        x-transition:leave-start="opacity-100"
        x-transition:leave-end="opacity-0"
    ></div>
    
    <!-- Drawer (slides from right on desktop, bottom on mobile) -->
    <div class="fixed inset-y-0 right-0 max-w-2xl w-full flex">
        <div 
            class="relative bg-white dark:bg-gray-800 w-full flex flex-col border-l border-gray-200 dark:border-gray-700"
            @click.stop
            x-show="open"
            x-transition:enter="transform transition ease-in-out duration-300"
            x-transition:enter-start="translate-x-full"
            x-transition:enter-end="translate-x-0"
            x-transition:leave="transform transition ease-in-out duration-300"
            x-transition:leave-start="translate-x-0"
            x-transition:leave-end="translate-x-full"
        >
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-icons-round">chat_bubble</span>
                    <span>Comments</span>
                    <span x-show="commentsCount > 0" 
                          x-text="'(' + commentsCount + ')'" 
                          class="text-gray-500 dark:text-gray-400 text-base"></span>
                </h3>
                <button 
                    @click="closeModal()" 
                    class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                    <span class="material-icons-round text-gray-600 dark:text-gray-400">close</span>
                </button>
            </div>
            
            <!-- Comments List -->
            <div class="flex-1 overflow-y-auto p-4 space-y-4" x-ref="commentsList">
                <!-- Loading State -->
                <div x-show="loading" class="flex justify-center py-8">
                    <svg class="animate-spin h-8 w-8 text-brand-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
                
                <!-- Empty State -->
                <div x-show="!loading && comments.length === 0" class="text-center py-12">
                    <span class="material-icons-round text-6xl text-gray-400 dark:text-gray-600 block mb-3">chat_bubble_outline</span>
                    <p class="text-gray-600 dark:text-gray-400 mb-2">No comments yet</p>
                    <p class="text-sm text-gray-500">Be the first to comment!</p>
                </div>
                
                <!-- Comments -->
                <template x-for="comment in comments" :key="comment.id">
                    <div class="space-y-3">
                        <!-- Comment Item -->
                        <div class="flex gap-3 group">
                            <img :src="comment.user.avatar_url" 
                                 :alt="comment.user.name" 
                                 class="w-10 h-10 rounded-full object-cover flex-shrink-0">
                            
                            <div class="flex-1 min-w-0">
                                <div class="bg-gray-100 dark:bg-gray-900 rounded-lg p-3">
                                    <div class="flex items-start justify-between gap-2">
                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-center gap-2 flex-wrap">
                                                <a :href="'/profile/' + comment.user.id" 
                                                   class="font-semibold text-gray-900 dark:text-white hover:underline"
                                                   x-text="comment.user.name"></a>
                                                <span x-show="comment.user.is_verified" 
                                                      class="material-icons-round text-blue-500 text-sm" 
                                                      style="font-variation-settings: 'FILL' 1">verified</span>
                                            </div>
                                            <p class="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap break-words" 
                                               x-text="comment.content"></p>
                                        </div>
                                        
                                        <!-- Comment Menu -->
                                        <div class="relative" x-data="{ menuOpen: false }">
                                            <button 
                                                @click="menuOpen = !menuOpen"
                                                class="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <span class="material-icons-round text-gray-600 dark:text-gray-400 text-sm">more_horiz</span>
                                            </button>
                                            <div 
                                                x-show="menuOpen" 
                                                @click.away="menuOpen = false"
                                                class="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10 py-1"
                                            >
                                                <button 
                                                    @click="deleteComment(comment.id); menuOpen = false"
                                                    x-show="comment.can_delete"
                                                    class="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    Delete Comment
                                                </button>
                                                <button 
                                                    @click="reportComment(comment.id); menuOpen = false"
                                                    class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    Report Comment
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Comment Actions -->
                                    <div class="flex items-center gap-4 mt-2 text-xs">
                                        <button 
                                            @click="toggleCommentLike(comment.id)"
                                            class="flex items-center gap-1 hover:text-red-500 transition-colors"
                                            :class="comment.is_liked ? 'text-red-500' : 'text-gray-400'"
                                        >
                                            <span class="material-icons-round text-sm">
                                                <span x-text="comment.is_liked ? 'favorite' : 'favorite_border'"></span>
                                            </span>
                                            <span x-text="comment.likes_count || 0"></span>
                                        </button>
                                        
                                        <button 
                                            @click="replyToComment(comment)"
                                            class="text-gray-400 hover:text-brand-green transition-colors"
                                        >
                                            Reply
                                        </button>
                                        
                                        <span class="text-gray-500" x-text="comment.time_ago"></span>
                                    </div>
                                </div>
                                
                                <!-- Nested Replies -->
                                <div x-show="comment.replies && comment.replies.length > 0" class="mt-3 ml-4 space-y-3">
                                    <template x-for="reply in comment.replies" :key="reply.id">
                                        <div class="flex gap-3 group">
                                            <img :src="reply.user.avatar_url" 
                                                 :alt="reply.user.name" 
                                                 class="w-8 h-8 rounded-full object-cover flex-shrink-0">
                                            
                                            <div class="flex-1 min-w-0">
                                                <div class="bg-gray-100 dark:bg-gray-900 rounded-lg p-3">
                                                    <div class="flex items-start justify-between gap-2">
                                                        <div class="flex-1 min-w-0">
                                                            <div class="flex items-center gap-2 flex-wrap">
                                                                <a :href="'/profile/' + reply.user.id" 
                                                                   class="font-semibold text-gray-900 dark:text-white text-sm hover:underline"
                                                                   x-text="reply.user.name"></a>
                                                                <span x-show="reply.user.is_verified" 
                                                                      class="material-icons-round text-blue-500 text-xs" 
                                                                      style="font-variation-settings: 'FILL' 1">verified</span>
                                                            </div>
                                                            <p class="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap break-words" 
                                                               x-text="reply.content"></p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div class="flex items-center gap-4 mt-2 text-xs">
                                                        <button 
                                                            @click="toggleCommentLike(reply.id)"
                                                            class="flex items-center gap-1 hover:text-red-500 transition-colors"
                                                            :class="reply.is_liked ? 'text-red-500' : 'text-gray-400'"
                                                        >
                                                            <span class="material-icons-round text-xs">
                                                                <span x-text="reply.is_liked ? 'favorite' : 'favorite_border'"></span>
                                                            </span>
                                                            <span x-text="reply.likes_count || 0"></span>
                                                        </button>
                                                        <span class="text-gray-500" x-text="reply.time_ago"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                                
                                <!-- Load More Replies -->
                                <button 
                                    x-show="comment.has_more_replies"
                                    @click="loadMoreReplies(comment.id)"
                                    class="text-xs text-brand-green hover:underline ml-4 mt-2"
                                >
                                    Load more replies
                                </button>
                            </div>
                        </div>
                    </div>
                </template>
                
                <!-- Load More Comments -->
                <div x-show="hasMore && !loading" class="text-center py-4">
                    <button 
                        @click="loadMore()"
                        class="text-brand-green font-semibold hover:underline"
                    >
                        Load more comments
                    </button>
                </div>
            </div>
            
            <!-- Comment Input (Fixed at bottom) -->
            <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <!-- Reply To Indicator -->
                <div x-show="replyTo" class="mb-2 flex items-center justify-between text-sm bg-gray-100 dark:bg-gray-900 rounded p-2">
                    <span class="text-gray-600 dark:text-gray-400">
                        Replying to <span class="text-gray-900 dark:text-white font-semibold" x-text="replyTo?.user?.name"></span>
                    </span>
                    <button @click="cancelReply()" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        <span class="material-icons-round text-sm">close</span>
                    </button>
                </div>
                
                <form @submit.prevent="submitComment()" class="flex gap-3 items-end">
                    <img src="{{ auth()->user()->avatar_url ?? asset('images/default-avatar.svg') }}" 
                         alt="You" 
                         class="w-10 h-10 rounded-full object-cover flex-shrink-0">
                    
                    <div class="flex-1">
                        <textarea 
                            x-model="newComment"
                            x-ref="commentInput"
                            placeholder="Write a comment..."
                            rows="1"
                            maxlength="1000"
                            @input="autoResize($event.target)"
                            @keydown.enter.prevent="if (!$event.shiftKey) submitComment()"
                            class="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-green focus:border-transparent resize-none"
                            style="min-height: 40px; max-height: 120px;"
                        ></textarea>
                        <div class="text-xs text-gray-500 text-right mt-1">
                            <span x-text="newComment.length"></span>/1000
                        </div>
                    </div>
                    
                    <button 
                        type="submit"
                        :disabled="isSubmitting || newComment.trim().length === 0"
                        class="bg-brand-green text-white p-2 rounded-full hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                        <span x-show="!isSubmitting" class="material-icons-round">send</span>
                        <svg x-show="isSubmitting" class="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </button>
                </form>
                
                <p class="text-xs text-gray-500 mt-2">
                    Press Enter to post • Shift + Enter for new line
                </p>
            </div>
        </div>
    </div>
</div>

<script>
function commentsModal() {
    return {
        open: false,
        activityId: null,
        comments: [],
        newComment: '',
        replyTo: null,
        loading: false,
        isSubmitting: false,
        hasMore: false,
        page: 1,
        commentsCount: 0,
        
        init() {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.open) {
                    this.closeModal();
                }
            });
        },
        
        async openModal(detail) {
            this.activityId = detail.activityId;
            this.open = true;
            this.comments = [];
            this.page = 1;
            
            await this.loadComments();
            
            this.$nextTick(() => {
                if (this.$refs.commentInput) {
                    this.$refs.commentInput.focus();
                }
            });
        },
        
        closeModal() {
            if (this.isSubmitting) return;
            this.open = false;
            this.resetState();
        },
        
        async loadComments() {
            if (this.loading) return;
            
            this.loading = true;
            
            try {
                const response = await fetch(`/social/activity/${this.activityId}/comments?page=${this.page}`, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    if (this.page === 1) {
                        this.comments = data.comments;
                    } else {
                        this.comments = [...this.comments, ...data.comments];
                    }
                    this.hasMore = data.has_more;
                    this.commentsCount = data.total_count || this.comments.length;
                }
            } catch (error) {
                console.error('Error loading comments:', error);
            } finally {
                this.loading = false;
            }
        },
        
        loadMore() {
            this.page++;
            this.loadComments();
        },
        
        async submitComment() {
            if (this.newComment.trim().length === 0 || this.isSubmitting) return;
            
            this.isSubmitting = true;
            
            try {
                const formData = new FormData();
                formData.append('content', this.newComment.trim());
                formData.append('activity_id', this.activityId);
                if (this.replyTo) {
                    formData.append('parent_id', this.replyTo.id);
                }
                
                const response = await fetch('/social/comments/store', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    if (this.replyTo) {
                        // Add reply to parent comment
                        const parentComment = this.comments.find(c => c.id === this.replyTo.id);
                        if (parentComment) {
                            if (!parentComment.replies) {
                                parentComment.replies = [];
                            }
                            parentComment.replies.push(data.comment);
                        }
                    } else {
                        // Add new comment to top
                        this.comments.unshift(data.comment);
                    }
                    
                    this.commentsCount++;
                    this.newComment = '';
                    this.replyTo = null;
                    
                    // Reset textarea height
                    this.$refs.commentInput.style.height = 'auto';
                    
                    // Dispatch event to update comment count on card
                    window.dispatchEvent(new CustomEvent('comment-added', { 
                        detail: { activityId: this.activityId, count: this.commentsCount }
                    }));
                }
            } catch (error) {
                console.error('Error posting comment:', error);
                alert('Failed to post comment. Please try again.');
            } finally {
                this.isSubmitting = false;
            }
        },
        
        async toggleCommentLike(commentId) {
            try {
                const response = await fetch(`/social/comments/${commentId}/like`, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Update comment in list
                    const updateComment = (comments) => {
                        for (let comment of comments) {
                            if (comment.id === commentId) {
                                comment.is_liked = data.is_liked;
                                comment.likes_count = data.likes_count;
                                return true;
                            }
                            if (comment.replies && updateComment(comment.replies)) {
                                return true;
                            }
                        }
                        return false;
                    };
                    
                    updateComment(this.comments);
                }
            } catch (error) {
                console.error('Error liking comment:', error);
            }
        },
        
        replyToComment(comment) {
            this.replyTo = comment;
            this.$refs.commentInput.focus();
        },
        
        cancelReply() {
            this.replyTo = null;
        },
        
        async deleteComment(commentId) {
            if (!confirm('Are you sure you want to delete this comment?')) return;
            
            try {
                const response = await fetch(`/social/comments/${commentId}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Remove from list
                    const removeComment = (comments) => {
                        for (let i = 0; i < comments.length; i++) {
                            if (comments[i].id === commentId) {
                                comments.splice(i, 1);
                                return true;
                            }
                            if (comments[i].replies && removeComment(comments[i].replies)) {
                                return true;
                            }
                        }
                        return false;
                    };
                    
                    removeComment(this.comments);
                    this.commentsCount--;
                }
            } catch (error) {
                console.error('Error deleting comment:', error);
            }
        },
        
        reportComment(commentId) {
            alert('Comment reported. Thank you for helping keep our community safe.');
            // TODO: Implement actual report functionality
        },
        
        autoResize(textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        },
        
        resetState() {
            this.activityId = null;
            this.comments = [];
            this.newComment = '';
            this.replyTo = null;
            this.page = 1;
            this.hasMore = false;
            this.commentsCount = 0;
        }
    }
}
</script>

<style>
[x-cloak] { display: none !important; }

/* Mobile: Slide from bottom */
@media (max-width: 768px) {
    .fixed.inset-y-0.right-0 {
        inset: auto 0 0 0;
        max-height: 90vh;
    }
}
</style>
