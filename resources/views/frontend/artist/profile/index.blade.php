@extends('layouts.app')

@section('title', 'Artist Profile & Settings')

@section('left-sidebar')
    @include('frontend.partials.artist-left-sidebar')
@endsection

@push('styles')
<style>
    /* Light mode styles */
    .glass-panel {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(0, 0, 0, 0.1);
    }
    /* Dark mode styles */
    .dark .glass-panel {
        background: rgba(22, 27, 34, 0.7);
        border: 1px solid rgba(48, 54, 61, 0.5);
    }
    .toggle-checkbox:checked {
        right: 0;
        border-color: #10B981;
    }
    .toggle-checkbox:checked + .toggle-label {
        background-color: #10B981;
    }
</style>
@endpush

@section('content')
<div class="max-w-5xl mx-auto space-y-8">
    <!-- Page Header -->
    <div class="glass-panel rounded-2xl p-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Profile & Settings</h1>
                <p class="text-gray-600 dark:text-gray-400 mt-1">Manage your artist profile and account settings</p>
            </div>
            <a href="{{ route('frontend.artists.show', auth()->user()->artist) }}" target="_blank"
               class="text-sm font-medium text-brand hover:text-green-400 transition-colors flex items-center gap-1.5">
                View Public Profile 
                <span class="material-symbols-outlined text-base">open_in_new</span>
            </a>
        </div>
    </div>

    <form action="{{ route('frontend.artist.profile.update') }}" method="POST" enctype="multipart/form-data" class="space-y-8">
        @csrf
        @method('PUT')
        
        <!-- Public Profile Section -->
        <div class="glass-panel rounded-2xl p-6 md:p-8 space-y-8">
            <div>
                <h2 class="text-lg font-bold text-gray-900 dark:text-white">Public Profile</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">Manage how you appear to fans and other artists on TesoTunes.</p>
            </div>
            
            <div class="flex flex-col md:flex-row gap-8 items-start">
                <!-- Profile Photo -->
                <div class="flex-shrink-0 flex flex-col items-center gap-4">
                    <div class="relative group cursor-pointer w-32 h-32" id="avatar-upload-zone">
                        <img src="{{ auth()->user()->artist->avatar ? asset('storage/' . auth()->user()->artist->avatar) : auth()->user()->avatar_url }}" 
                             alt="Profile" 
                             id="avatar-preview"
                             class="w-full h-full object-cover rounded-full ring-4 ring-gray-200 dark:ring-gray-800 group-hover:opacity-70 transition-all"/>
                        <div class="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span class="material-symbols-outlined text-gray-900 dark:text-white text-3xl">photo_camera</span>
                            <span class="text-xs font-bold text-gray-900 dark:text-white mt-1">Change</span>
                        </div>
                        <input type="file" name="avatar" id="avatar-input" accept="image/*" class="hidden"/>
                    </div>
                    <p class="text-xs text-gray-600 dark:text-gray-400 text-center max-w-[140px]">Recommended: 500x500px JPG, PNG.</p>
                </div>
                
                <!-- Profile Fields -->
                <div class="flex-1 w-full space-y-5">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div class="space-y-1.5">
                            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Artist Name</label>
                            <input type="text" name="stage_name" required
                                   value="{{ old('stage_name', auth()->user()->artist->stage_name) }}"
                                   class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand transition-all outline-none"
                                   placeholder="Your stage name"/>
                            @error('stage_name')
                                <p class="text-red-500 text-xs">{{ $message }}</p>
                            @enderror
                        </div>
                        <div class="space-y-1.5">
                            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Genres</label>
                            <select name="primary_genre_id"
                                    class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand transition-all outline-none appearance-none cursor-pointer">
                                @foreach(\App\Models\Genre::orderBy('name')->get() as $genre)
                                    <option value="{{ $genre->id }}" {{ auth()->user()->artist->primary_genre_id == $genre->id ? 'selected' : '' }}>
                                        {{ $genre->name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    
                    <div class="space-y-1.5">
                        <label class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Bio</label>
                        <textarea name="bio" rows="4"
                                  class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand transition-all outline-none resize-none"
                                  placeholder="Tell fans about yourself...">{{ old('bio', auth()->user()->artist->bio) }}</textarea>
                        <p class="text-xs text-gray-500 text-right">{{ strlen(auth()->user()->artist->bio ?? '') }}/500</p>
                    </div>
                    
                    <div class="space-y-1.5">
                        <label class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Location</label>
                        <div class="relative">
                            <span class="absolute left-3 top-2.5 material-symbols-outlined text-gray-500">location_on</span>
                            <input type="text" name="location"
                                   value="{{ old('location', auth()->user()->city) }}"
                                   class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand transition-all outline-none"
                                   placeholder="City, Country"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Social Links Section -->
        <div class="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
            <div>
                <h2 class="text-lg font-bold text-gray-900 dark:text-white">Social Links</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">Connect your social media accounts.</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                        Instagram
                    </label>
                    <input type="url" name="instagram_url"
                           value="{{ old('instagram_url', auth()->user()->social_links['instagram'] ?? '') }}"
                           class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand transition-all outline-none"
                           placeholder="https://instagram.com/username"/>
                </div>
                <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                        Twitter / X
                    </label>
                    <input type="url" name="twitter_url"
                           value="{{ old('twitter_url', auth()->user()->social_links['twitter'] ?? '') }}"
                           class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand transition-all outline-none"
                           placeholder="https://twitter.com/username"/>
                </div>
                <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                        YouTube
                    </label>
                    <input type="url" name="youtube_url"
                           value="{{ old('youtube_url', auth()->user()->social_links['youtube'] ?? '') }}"
                           class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand transition-all outline-none"
                           placeholder="https://youtube.com/@channel"/>
                </div>
                <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                        TikTok
                    </label>
                    <input type="url" name="tiktok_url"
                           value="{{ old('tiktok_url', auth()->user()->social_links['tiktok'] ?? '') }}"
                           class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand transition-all outline-none"
                           placeholder="https://tiktok.com/@username"/>
                </div>
            </div>
        </div>

        <!-- Account Settings Section -->
        <div class="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
            <div>
                <h2 class="text-lg font-bold text-gray-900 dark:text-white">Account Settings</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">Manage your account email and password.</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                    <input type="email" name="email" required
                           value="{{ old('email', auth()->user()->email) }}"
                           class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand transition-all outline-none"/>
                    @error('email')
                        <p class="text-red-500 text-xs">{{ $message }}</p>
                    @enderror
                </div>
                <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Phone Number</label>
                    <input type="tel" name="phone"
                           value="{{ old('phone', auth()->user()->phone) }}"
                           class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand transition-all outline-none"
                           placeholder="+256 700 000 000"/>
                </div>
            </div>
            
            <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onclick="document.getElementById('password-modal').classList.remove('hidden')"
                        class="text-brand hover:text-green-400 text-sm font-medium flex items-center gap-2">
                    <span class="material-symbols-outlined text-base">lock</span>
                    Change Password
                </button>
            </div>
        </div>

        <!-- Notification Preferences -->
        <div class="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
            <div>
                <h2 class="text-lg font-bold text-gray-900 dark:text-white">Notification Preferences</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">Control how you receive notifications.</p>
            </div>
            
            <div class="space-y-4">
                <label class="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                    <div>
                        <p class="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Receive updates about your music and earnings</p>
                    </div>
                    <div class="relative">
                        <input type="checkbox" name="email_notifications" 
                               {{ auth()->user()->email_notifications_enabled ? 'checked' : '' }}
                               class="sr-only toggle-checkbox"/>
                        <div class="toggle-label block bg-gray-700 w-14 h-8 rounded-full"></div>
                        <div class="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
                    </div>
                </label>
                
                <label class="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                    <div>
                        <p class="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Get notified about new followers and plays</p>
                    </div>
                    <div class="relative">
                        <input type="checkbox" name="push_notifications"
                               {{ auth()->user()->push_notifications_enabled ? 'checked' : '' }}
                               class="sr-only toggle-checkbox"/>
                        <div class="toggle-label block bg-gray-700 w-14 h-8 rounded-full"></div>
                        <div class="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
                    </div>
                </label>
            </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end pt-4 pb-20">
            <button type="submit" class="px-8 py-3 rounded-xl bg-brand text-white font-bold shadow-lg shadow-brand/25 hover:bg-green-400 transition-all flex items-center gap-2">
                <span class="material-symbols-outlined">save</span>
                Save Changes
            </button>
        </div>
    </form>
</div>

<!-- Password Change Modal -->
<div id="password-modal" class="hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Change Password</h3>
            <button onclick="document.getElementById('password-modal').classList.add('hidden')" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>
        <form action="{{ route('frontend.artist.profile.password') }}" method="POST" class="space-y-4">
            @csrf
            <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Current Password</label>
                <input type="password" name="current_password" required
                       class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand transition-all outline-none"/>
            </div>
            <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">New Password</label>
                <input type="password" name="password" required
                       class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand transition-all outline-none"/>
            </div>
            <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Confirm New Password</label>
                <input type="password" name="password_confirmation" required
                       class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand transition-all outline-none"/>
            </div>
            <div class="flex justify-end gap-3 pt-4">
                <button type="button" onclick="document.getElementById('password-modal').classList.add('hidden')"
                        class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors">
                    Cancel
                </button>
                <button type="submit" class="px-6 py-2 bg-brand text-white font-medium rounded-lg hover:bg-green-400 transition-all">
                    Update Password
                </button>
            </div>
        </form>
    </div>
</div>
@endsection

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Avatar upload handling
    const avatarZone = document.getElementById('avatar-upload-zone');
    const avatarInput = document.getElementById('avatar-input');
    const avatarPreview = document.getElementById('avatar-preview');

    avatarZone.addEventListener('click', () => avatarInput.click());
    
    avatarInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarPreview.src = e.target.result;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // Toggle switches
    const toggles = document.querySelectorAll('.toggle-checkbox');
    toggles.forEach(toggle => {
        const dot = toggle.parentElement.querySelector('.dot');
        updateTogglePosition(toggle, dot);
        
        toggle.addEventListener('change', () => {
            updateTogglePosition(toggle, dot);
        });
    });

    function updateTogglePosition(toggle, dot) {
        if (toggle.checked) {
            dot.style.transform = 'translateX(24px)';
            toggle.nextElementSibling.classList.add('bg-brand');
            toggle.nextElementSibling.classList.remove('bg-gray-700');
        } else {
            dot.style.transform = 'translateX(0)';
            toggle.nextElementSibling.classList.remove('bg-brand');
            toggle.nextElementSibling.classList.add('bg-gray-700');
        }
    }
});
</script>
@endpush
