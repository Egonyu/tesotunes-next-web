<!-- Create Post Modal -->
<div 
    x-data="createPostModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    @open-create-post-modal.window="openModal($event.detail)"
    class="fixed inset-0 z-50 overflow-y-auto"
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
    
    <!-- Modal -->
    <div class="relative min-h-screen flex items-center justify-center p-4">
        <div 
            class="relative bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto"
            @click.stop
            x-show="open"
            x-transition:enter="ease-out duration-300"
            x-transition:enter-start="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            x-transition:enter-end="opacity-100 translate-y-0 sm:scale-100"
            x-transition:leave="ease-in duration-200"
            x-transition:leave-start="opacity-100 translate-y-0 sm:scale-100"
            x-transition:leave-end="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
                <h3 class="text-xl font-bold text-white">Create Post</h3>
                <button 
                    @click="closeModal()" 
                    class="p-2 hover:bg-gray-700 rounded-full transition-colors"
                >
                    <span class="material-icons-round text-gray-400">close</span>
                </button>
            </div>
            
            <!-- Content -->
            <form @submit.prevent="submitPost()" class="p-4">
                <!-- User Info -->
                <div class="flex items-center gap-3 mb-4">
                    <img src="{{ auth()->user()->avatar_url ?? asset('images/default-avatar.svg') }}" 
                         alt="{{ auth()->user()->name ?? 'User' }}" 
                         class="w-10 h-10 rounded-full object-cover">
                    <div class="flex-1">
                        <p class="font-semibold text-white">{{ auth()->user()->name ?? 'User' }}</p>
                        <select 
                            x-model="privacy"
                            class="text-xs bg-gray-700 border-gray-600 rounded px-2 py-1 text-white"
                        >
                            <option value="public">🌍 Public</option>
                            <option value="followers">👥 Followers Only</option>
                            <option value="private">🔒 Private</option>
                        </select>
                    </div>
                </div>
                
                <!-- Post Content -->
                <textarea 
                    x-model="content"
                    x-ref="contentInput"
                    placeholder="What's on your mind?"
                    rows="4"
                    class="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-green focus:border-transparent resize-none"
                    maxlength="2000"
                ></textarea>
                
                <div class="text-xs text-gray-400 text-right mt-1">
                    <span x-text="content.length"></span>/2000
                </div>
                
                <!-- Media Upload Area -->
                <div x-show="postType !== 'text'" class="mt-4">
                    <!-- Image/Video Upload -->
                    <template x-if="postType === 'image' || postType === 'video'">
                        <div>
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*,video/*"
                                class="hidden" 
                                id="media-upload"
                                @change="handleMediaUpload($event)"
                            />
                            <label 
                                for="media-upload" 
                                class="cursor-pointer border-2 border-dashed border-gray-600 rounded-lg p-8 text-center block hover:border-brand-green transition-colors"
                            >
                                <span class="material-icons-round text-5xl text-gray-400 block mb-2">cloud_upload</span>
                                <p class="text-sm text-gray-400">Click to upload or drag and drop</p>
                                <p class="text-xs text-gray-500 mt-1">
                                    <span x-show="postType === 'image'">PNG, JPG, GIF up to 10MB</span>
                                    <span x-show="postType === 'video'">MP4, MOV up to 100MB</span>
                                </p>
                            </label>
                            
                            <!-- Preview uploaded files -->
                            <div x-show="uploadedFiles.length > 0" class="mt-4 grid grid-cols-3 gap-2">
                                <template x-for="(file, index) in uploadedFiles" :key="index">
                                    <div class="relative group">
                                        <img :src="file.preview" class="w-full h-24 object-cover rounded-lg">
                                        <button 
                                            type="button"
                                            @click="removeFile(index)"
                                            class="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <span class="material-icons-round text-white text-sm">close</span>
                                        </button>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </template>
                    
                    <!-- Poll Creator -->
                    <template x-if="postType === 'poll'">
                        <div class="border border-gray-700 rounded-lg p-4">
                            <p class="text-sm text-gray-400 mb-3">Poll Options</p>
                            <template x-for="(option, index) in pollOptions" :key="index">
                                <div class="flex items-center gap-2 mb-2">
                                    <input 
                                        type="text"
                                        x-model="pollOptions[index]"
                                        :placeholder="'Option ' + (index + 1)"
                                        class="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-400"
                                    />
                                    <button 
                                        type="button"
                                        @click="removePollOption(index)"
                                        x-show="pollOptions.length > 2"
                                        class="text-red-500 hover:text-red-400"
                                    >
                                        <span class="material-icons-round">remove_circle</span>
                                    </button>
                                </div>
                            </template>
                            
                            <button 
                                type="button"
                                @click="addPollOption()"
                                x-show="pollOptions.length < 4"
                                class="text-brand-green text-sm font-medium hover:underline mt-2"
                            >
                                + Add Option
                            </button>
                            
                            <!-- Poll Duration -->
                            <div class="mt-4">
                                <label class="text-sm text-gray-400 block mb-2">Poll Duration</label>
                                <select 
                                    x-model="pollDuration"
                                    class="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                                >
                                    <option value="1">1 Day</option>
                                    <option value="3">3 Days</option>
                                    <option value="7">1 Week</option>
                                    <option value="30">1 Month</option>
                                </select>
                            </div>
                        </div>
                    </template>
                </div>
                
                <!-- Post Type Selector & Submit -->
                <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <div class="flex gap-2">
                        <button 
                            type="button"
                            @click="setPostType('image')" 
                            class="p-2 hover:bg-gray-700 rounded-full transition-colors"
                            :class="postType === 'image' ? 'text-brand-green' : 'text-gray-400'"
                            title="Add photos"
                        >
                            <span class="material-icons-round">image</span>
                        </button>
                        <button 
                            type="button"
                            @click="setPostType('video')" 
                            class="p-2 hover:bg-gray-700 rounded-full transition-colors"
                            :class="postType === 'video' ? 'text-brand-green' : 'text-gray-400'"
                            title="Add video"
                        >
                            <span class="material-icons-round">videocam</span>
                        </button>
                        <button 
                            type="button"
                            @click="setPostType('poll')" 
                            class="p-2 hover:bg-gray-700 rounded-full transition-colors"
                            :class="postType === 'poll' ? 'text-brand-green' : 'text-gray-400'"
                            title="Create poll"
                        >
                            <span class="material-icons-round">poll</span>
                        </button>
                    </div>
                    
                    <button 
                        type="submit"
                        :disabled="isSubmitting || !canSubmit()"
                        class="bg-brand-green text-white font-semibold py-2 px-6 rounded-full hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span x-show="!isSubmitting">Post</span>
                        <span x-show="isSubmitting" class="flex items-center gap-2">
                            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Posting...
                        </span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
function createPostModal() {
    return {
        open: false,
        postType: 'text',
        content: '',
        privacy: 'public',
        isSubmitting: false,
        uploadedFiles: [],
        pollOptions: ['', ''],
        pollDuration: '7',
        
        init() {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.open) {
                    this.closeModal();
                }
            });
        },
        
        openModal(detail = {}) {
            this.open = true;
            this.postType = detail.type || 'text';
            this.$nextTick(() => {
                if (this.$refs.contentInput) {
                    this.$refs.contentInput.focus();
                }
            });
        },
        
        closeModal() {
            if (this.isSubmitting) return;
            if (this.content.trim() || this.uploadedFiles.length > 0) {
                if (!confirm('Discard this post?')) return;
            }
            this.open = false;
            this.resetForm();
        },
        
        setPostType(type) {
            this.postType = type;
            if (type !== 'image' && type !== 'video') {
                this.uploadedFiles = [];
            }
            if (type !== 'poll') {
                this.pollOptions = ['', ''];
            }
        },
        
        handleMediaUpload(event) {
            const files = Array.from(event.target.files);
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.uploadedFiles.push({
                        file: file,
                        preview: e.target.result
                    });
                };
                reader.readAsDataURL(file);
            });
        },
        
        removeFile(index) {
            this.uploadedFiles.splice(index, 1);
        },
        
        addPollOption() {
            if (this.pollOptions.length < 4) {
                this.pollOptions.push('');
            }
        },
        
        removePollOption(index) {
            if (this.pollOptions.length > 2) {
                this.pollOptions.splice(index, 1);
            }
        },
        
        canSubmit() {
            if (this.content.trim().length === 0 && this.postType === 'text') {
                return false;
            }
            if (this.postType === 'poll') {
                const validOptions = this.pollOptions.filter(opt => opt.trim().length > 0);
                return validOptions.length >= 2;
            }
            return true;
        },
        
        async submitPost() {
            if (!this.canSubmit() || this.isSubmitting) return;
            this.isSubmitting = true;
            
            try {
                const formData = new FormData();
                formData.append('content', this.content);
                formData.append('type', this.postType);
                formData.append('privacy', this.privacy);
                
                if (this.uploadedFiles.length > 0) {
                    this.uploadedFiles.forEach((item, index) => {
                        formData.append(`media[${index}]`, item.file);
                    });
                }
                
                if (this.postType === 'poll') {
                    const validOptions = this.pollOptions.filter(opt => opt.trim().length > 0);
                    formData.append('poll_options', JSON.stringify(validOptions));
                    formData.append('poll_duration', this.pollDuration);
                }
                
                const response = await fetch('/social/feed/store', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    this.open = false;
                    this.resetForm();
                    window.dispatchEvent(new CustomEvent('activity-updated'));
                    window.location.reload();
                } else {
                    alert(data.message || 'Failed to create post');
                }
            } catch (error) {
                console.error('Error creating post:', error);
                alert('An error occurred while creating your post');
            } finally {
                this.isSubmitting = false;
            }
        },
        
        resetForm() {
            this.postType = 'text';
            this.content = '';
            this.privacy = 'public';
            this.uploadedFiles = [];
            this.pollOptions = ['', ''];
            this.pollDuration = '7';
        }
    }
}
</script>

<style>
[x-cloak] { display: none !important; }
</style>
