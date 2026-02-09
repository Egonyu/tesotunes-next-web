<div class="settings-card" x-data="{ activeTab: 'general', settings: @js($settings ?? []) }">
    <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-100 mb-4">Storage Configuration</h3>

    <!-- Card Navigation Tabs -->
    <div class="card-nav-tabs flex space-x-4">
        <button @click="activeTab = 'general'" :class="activeTab === 'general' ? 'active' : ''" class="nav-tab">
            General
        </button>
        <button @click="activeTab = 'cloud'" :class="activeTab === 'cloud' ? 'active' : ''" class="nav-tab">
            Cloud Storage
        </button>
        <button @click="activeTab = 'optimization'" :class="activeTab === 'optimization' ? 'active' : ''" class="nav-tab">
            Optimization
        </button>
        <button @click="activeTab = 'stats'" :class="activeTab === 'stats' ? 'active' : ''" class="nav-tab">
            Statistics
        </button>
    </div>

    <!-- General Tab -->
    <div x-show="activeTab === 'general'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
        <form @submit.prevent="saveTabSettings('storage', 'general')">
            <div class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Storage Driver</label>
                    <select name="storage_driver" class="form-select w-full" x-model="settings.general.storage_driver">
                        <option value="local">Local Storage</option>
                        <option value="s3">Amazon S3</option>
                        <option value="digitalocean">DigitalOcean Spaces</option>
                        <option value="gcs">Google Cloud Storage</option>
                        <option value="azure">Azure Blob Storage</option>
                    </select>
                    <p class="mt-1 text-xs text-slate-500 dark:text-navy-400">Select the primary storage driver for file uploads</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">User Storage Quota (GB)</label>
                        <input type="number" name="user_storage_quota" class="form-input w-full" x-model="settings.general.user_storage_quota" placeholder="Storage quota" min="1" max="1000">
                        <p class="mt-1 text-xs text-slate-500 dark:text-navy-400">Maximum storage per user</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Max Upload Size (MB)</label>
                        <input type="number" name="max_upload_size" class="form-input w-full" x-model="settings.general.max_upload_size" placeholder="Max upload size" min="1" max="500">
                        <p class="mt-1 text-xs text-slate-500 dark:text-navy-400">Maximum file upload size</p>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Allowed File Types</label>
                    <input type="text" name="allowed_file_types" class="form-input w-full" x-model="settings.general.allowed_file_types" placeholder="mp3,wav,flac,aac">
                    <p class="mt-1 text-xs text-slate-500 dark:text-navy-400">Comma-separated list of allowed file extensions</p>
                </div>

                <div class="border-t border-slate-200 dark:border-navy-600 pt-6">
                    <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-100 mb-4">Automatic Cleanup</h4>
                    
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg mb-4">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">Enable Auto Cleanup</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Automatically delete old temporary files</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="auto_cleanup_enabled" value="1" x-model="settings.general.auto_cleanup_enabled">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div x-show="settings.general.auto_cleanup_enabled">
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Cleanup After (Days)</label>
                        <input type="number" name="cleanup_days" class="form-input w-full" x-model="settings.general.cleanup_days" placeholder="30" min="1" max="365">
                        <p class="mt-1 text-xs text-slate-500 dark:text-navy-400">Delete temporary files older than this many days</p>
                    </div>
                </div>
            </div>

            <div class="flex justify-end mt-6 pt-4 border-t border-slate-200 dark:border-navy-600">
                <button type="submit" class="btn bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
                    Save Storage Settings
                </button>
            </div>
        </form>
    </div>

    <!-- Cloud Storage Tab -->
    <div x-show="activeTab === 'cloud'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
        <form @submit.prevent="saveTabSettings('storage', 'cloud')">
            <div class="space-y-6">
                <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                    <div>
                        <p class="font-medium text-slate-700 dark:text-navy-100">Enable Cloud Storage</p>
                        <p class="text-sm text-slate-500 dark:text-navy-400">Use cloud storage for file hosting</p>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" name="cloud_enabled" value="1" x-model="settings.cloud.cloud_enabled">
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div x-show="settings.cloud.cloud_enabled">
                    <!-- CDN Configuration -->
                    <div class="border-t border-slate-200 dark:border-navy-600 pt-6">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-100 mb-4">CDN Configuration</h4>
                        
                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg mb-4">
                            <div>
                                <p class="font-medium text-slate-700 dark:text-navy-100">Enable CDN</p>
                                <p class="text-sm text-slate-500 dark:text-navy-400">Serve files through CDN for faster delivery</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" name="cdn_enabled" value="1" x-model="settings.cloud.cdn_enabled">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div x-show="settings.cloud.cdn_enabled">
                            <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">CDN URL</label>
                            <input type="url" name="cdn_url" class="form-input w-full" x-model="settings.cloud.cdn_url" placeholder="https://cdn.example.com">
                            <p class="mt-1 text-xs text-slate-500 dark:text-navy-400">Full CDN endpoint URL</p>
                        </div>
                    </div>

                    <!-- Amazon S3 Configuration -->
                    <div class="border-t border-slate-200 dark:border-navy-600 pt-6" x-show="settings.general.storage_driver === 's3'">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-100 mb-4">Amazon S3 Configuration</h4>
                        
                        <div class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">S3 Bucket Name</label>
                                    <input type="text" name="s3_bucket" class="form-input w-full" x-model="settings.cloud.s3_bucket" placeholder="my-bucket">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">S3 Region</label>
                                    <input type="text" name="s3_region" class="form-input w-full" x-model="settings.cloud.s3_region" placeholder="us-east-1">
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Access Key ID</label>
                                    <input type="text" name="s3_key" class="form-input w-full" placeholder="Your AWS Access Key">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Secret Access Key</label>
                                    <input type="password" name="s3_secret" class="form-input w-full" placeholder="Your AWS Secret Key">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- DigitalOcean Spaces Configuration -->
                    <div class="border-t border-slate-200 dark:border-navy-600 pt-6" x-show="settings.general.storage_driver === 'digitalocean'">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-100 mb-4">DigitalOcean Spaces Configuration</h4>
                        
                        <div class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Spaces Endpoint</label>
                                    <input type="text" name="do_spaces_endpoint" class="form-input w-full" x-model="settings.cloud.do_spaces_endpoint" placeholder="https://nyc3.digitaloceanspaces.com">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Spaces Bucket</label>
                                    <input type="text" name="do_spaces_bucket" class="form-input w-full" x-model="settings.cloud.do_spaces_bucket" placeholder="my-space">
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Spaces Region</label>
                                <select name="do_spaces_region" class="form-select w-full" x-model="settings.cloud.do_spaces_region">
                                    <option value="nyc3">New York 3</option>
                                    <option value="sfo3">San Francisco 3</option>
                                    <option value="sgp1">Singapore 1</option>
                                    <option value="fra1">Frankfurt 1</option>
                                    <option value="ams3">Amsterdam 3</option>
                                </select>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Access Key</label>
                                    <input type="text" name="do_spaces_key" class="form-input w-full" placeholder="Your DO Access Key">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Secret Key</label>
                                    <input type="password" name="do_spaces_secret" class="form-input w-full" placeholder="Your DO Secret Key">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Test Connection Button -->
                    <div class="border-t border-slate-200 dark:border-navy-600 pt-6">
                        <button type="button" @click="testStorageConnection" class="btn bg-slate-600 text-white px-6 py-2 rounded-lg hover:bg-slate-700">
                            <i class="fas fa-plug mr-2"></i> Test Connection
                        </button>
                        <p class="mt-2 text-xs text-slate-500 dark:text-navy-400">Verify your cloud storage credentials</p>
                    </div>
                </div>
            </div>

            <div class="flex justify-end mt-6 pt-4 border-t border-slate-200 dark:border-navy-600">
                <button type="submit" class="btn bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
                    Save Cloud Settings
                </button>
            </div>
        </form>
    </div>

    <!-- Optimization Tab -->
    <div x-show="activeTab === 'optimization'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
        <form @submit.prevent="saveTabSettings('storage', 'optimization')">
            <div class="space-y-6">
                <!-- Image Optimization -->
                <div>
                    <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-100 mb-4">Image Optimization</h4>
                    
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg mb-4">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">Enable Image Compression</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Automatically compress uploaded images</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="image_compression" value="1" x-model="settings.optimization.image_compression">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div x-show="settings.optimization.image_compression">
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Compression Quality (%)</label>
                        <input type="range" name="compression_quality" min="1" max="100" class="w-full" x-model="settings.optimization.compression_quality">
                        <div class="flex justify-between text-xs text-slate-500 dark:text-navy-400">
                            <span>Lower Quality (Smaller Size)</span>
                            <span x-text="settings.optimization.compression_quality + '%'"></span>
                            <span>Higher Quality (Larger Size)</span>
                        </div>
                    </div>
                </div>

                <!-- Audio Transcoding -->
                <div class="border-t border-slate-200 dark:border-navy-600 pt-6">
                    <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-100 mb-4">Audio Transcoding</h4>
                    
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg mb-4">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">Enable Auto Transcoding</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Automatically transcode audio files to multiple formats</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="auto_transcode" value="1" x-model="settings.optimization.auto_transcode">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div x-show="settings.optimization.auto_transcode">
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Transcode Formats</label>
                        <input type="text" name="transcode_formats" class="form-input w-full" x-model="settings.optimization.transcode_formats" placeholder="128kbps,320kbps">
                        <p class="mt-1 text-xs text-slate-500 dark:text-navy-400">Comma-separated list of bitrates to generate</p>
                    </div>
                </div>

                <!-- Thumbnail Generation -->
                <div class="border-t border-slate-200 dark:border-navy-600 pt-6">
                    <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-100 mb-4">Thumbnail Generation</h4>
                    
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 rounded-lg mb-4">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">Generate Thumbnails</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">Automatically create image thumbnails</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" name="generate_thumbnails" value="1" x-model="settings.optimization.generate_thumbnails">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div x-show="settings.optimization.generate_thumbnails">
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-2">Thumbnail Sizes</label>
                        <input type="text" name="thumbnail_sizes" class="form-input w-full" x-model="settings.optimization.thumbnail_sizes" placeholder="150x150,300x300,600x600">
                        <p class="mt-1 text-xs text-slate-500 dark:text-navy-400">Comma-separated list of thumbnail dimensions</p>
                    </div>
                </div>
            </div>

            <div class="flex justify-end mt-6 pt-4 border-t border-slate-200 dark:border-navy-600">
                <button type="submit" class="btn bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
                    Save Optimization Settings
                </button>
            </div>
        </form>
    </div>

    <!-- Statistics Tab -->
    <div x-show="activeTab === 'stats'" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
        <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Total Files -->
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100 text-sm">Total Files</p>
                            <p class="text-2xl font-bold" x-text="(stats?.total_files || 0).toLocaleString()">0</p>
                        </div>
                        <i class="fas fa-file-alt text-3xl text-blue-200"></i>
                    </div>
                </div>

                <!-- Total Size -->
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100 text-sm">Total Size</p>
                            <p class="text-2xl font-bold" x-text="formatBytes(stats?.total_size || 0)">0 B</p>
                        </div>
                        <i class="fas fa-hdd text-3xl text-purple-200"></i>
                    </div>
                </div>

                <!-- Music Files -->
                <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100 text-sm">Music Files</p>
                            <p class="text-2xl font-bold" x-text="(stats?.music_files || 0).toLocaleString()">0</p>
                        </div>
                        <i class="fas fa-music text-3xl text-green-200"></i>
                    </div>
                </div>

                <!-- Image Files -->
                <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-orange-100 text-sm">Image Files</p>
                            <p class="text-2xl font-bold" x-text="(stats?.image_files || 0).toLocaleString()">0</p>
                        </div>
                        <i class="fas fa-image text-3xl text-orange-200"></i>
                    </div>
                </div>
            </div>

            <!-- Storage Driver Info -->
            <div class="bg-white dark:bg-navy-800 rounded-lg p-6 border border-slate-200 dark:border-navy-600">
                <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-100 mb-4">Current Configuration</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p class="text-xs text-slate-500 dark:text-navy-400">Storage Driver</p>
                        <p class="text-sm font-medium text-slate-700 dark:text-navy-100" x-text="stats?.disk_driver || 'N/A'">-</p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500 dark:text-navy-400">Last Updated</p>
                        <p class="text-sm font-medium text-slate-700 dark:text-navy-100" x-text="new Date().toLocaleString()">-</p>
                    </div>
                </div>
            </div>

            <!-- Cleanup Actions -->
            <div class="bg-white dark:bg-navy-800 rounded-lg p-6 border border-slate-200 dark:border-navy-600">
                <h4 class="text-sm font-semibold text-slate-700 dark:text-navy-100 mb-4">Maintenance Actions</h4>
                <div class="space-y-3">
                    <button type="button" @click="cleanupOldFiles" class="btn bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 w-full md:w-auto">
                        <i class="fas fa-trash-alt mr-2"></i> Cleanup Old Files
                    </button>
                    <button type="button" @click="refreshStats" class="btn bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full md:w-auto ml-0 md:ml-3">
                        <i class="fas fa-sync-alt mr-2"></i> Refresh Statistics
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('alpine:init', () => {
    Alpine.data('storageSettings', () => ({
        stats: @json($stats ?? []),
        
        formatBytes(bytes, decimals = 2) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        },
        
        async testStorageConnection() {
            try {
                const response = await fetch('{{ route('admin.settings.storage.test-connection') }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✓ Storage connection successful!');
                } else {
                    alert('✗ Storage connection failed: ' + result.message);
                }
            } catch (error) {
                alert('✗ Connection test failed: ' + error.message);
            }
        },
        
        async cleanupOldFiles() {
            if (!confirm('Are you sure you want to cleanup old files? This action cannot be undone.')) {
                return;
            }
            
            try {
                const response = await fetch('{{ route('admin.settings.storage.cleanup') }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert(`✓ Cleanup completed! Deleted ${result.deleted_count} files.`);
                    this.refreshStats();
                } else {
                    alert('✗ Cleanup failed: ' + result.message);
                }
            } catch (error) {
                alert('✗ Cleanup failed: ' + error.message);
            }
        },
        
        async refreshStats() {
            try {
                const response = await fetch('{{ route('admin.settings.storage.stats') }}');
                const result = await response.json();
                
                if (result.success) {
                    this.stats = result.data;
                }
            } catch (error) {
                console.error('Failed to refresh stats:', error);
            }
        }
    }));
});
</script>
