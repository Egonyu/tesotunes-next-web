@extends('layouts.admin')

@section('title', 'Edit User - ' . $user->name)

@section('content')
    <div class="card">
        <div class="border-b border-slate-200 p-4 dark:border-navy-500">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Edit User: {{ $user->name }}</h3>
                <div class="flex space-x-2">
                    <a href="{{ route('admin.users.show', $user) }}" class="btn border border-slate-300 font-medium text-slate-700 hover:bg-slate-150 dark:border-navy-450 dark:text-navy-100 dark:hover:bg-navy-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View User
                    </a>
                    <a href="{{ route('admin.users.index') }}" class="btn border border-slate-300 font-medium text-slate-700 hover:bg-slate-150 dark:border-navy-450 dark:text-navy-100 dark:hover:bg-navy-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Users
                    </a>
                </div>
            </div>
        </div>

        <form method="POST" action="{{ route('admin.users.update', $user) }}" class="p-6">
            @csrf
            @method('PUT')

            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                <!-- Name -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Full Name *</label>
                    <input name="name" type="text" required
                           value="{{ old('name', $user->name) }}"
                           class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                    @error('name')
                        <p class="mt-1 text-xs text-error">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Email -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Email Address *</label>
                    <input name="email" type="email" required
                           value="{{ old('email', $user->email) }}"
                           class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                    @error('email')
                        <p class="mt-1 text-xs text-error">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Phone -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Phone Number</label>
                    <input name="phone" type="tel"
                           value="{{ old('phone', $user->phone) }}"
                           class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                    @error('phone')
                        <p class="mt-1 text-xs text-error">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Country -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Country</label>
                    <input name="country" type="text"
                           value="{{ old('country', $user->country) }}"
                           class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                    @error('country')
                        <p class="mt-1 text-xs text-error">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Role -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Role *</label>
                    <select name="role" required class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">Select Role</option>
                        <option value="user" {{ old('role', $user->role) === 'user' ? 'selected' : '' }}>User</option>
                        <option value="artist" {{ old('role', $user->role) === 'artist' ? 'selected' : '' }}>Artist</option>
                        <option value="moderator" {{ old('role', $user->role) === 'moderator' ? 'selected' : '' }}>Moderator</option>
                        <option value="admin" {{ old('role', $user->role) === 'admin' ? 'selected' : '' }}>Admin</option>
                    </select>
                    @error('role')
                        <p class="mt-1 text-xs text-error">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Status -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Status</label>
                    <select name="is_active" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="1" {{ old('is_active', $user->is_active ? '1' : '0') === '1' ? 'selected' : '' }}>Active</option>
                        <option value="0" {{ old('is_active', $user->is_active ? '1' : '0') === '0' ? 'selected' : '' }}>Inactive</option>
                    </select>
                    @error('is_active')
                        <p class="mt-1 text-xs text-error">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <!-- Account Information -->
            <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <!-- Email Verification Status -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Email Verification</label>
                    <div class="mt-1.5 flex items-center space-x-3">
                        @if($user->email_verified_at)
                            <span class="badge bg-success/10 text-success">Verified {{ $user->email_verified_at->format('M j, Y') }}</span>
                            <label class="inline-flex items-center">
                                <input type="checkbox" name="remove_verification" value="1"
                                       class="form-checkbox is-basic size-4 rounded border-slate-400/70 bg-slate-100 checked:border-error checked:bg-error hover:border-error focus:border-error dark:border-navy-400 dark:bg-navy-700">
                                <span class="ml-2 text-xs text-error">Remove verification</span>
                            </label>
                        @else
                            <span class="badge bg-warning/10 text-warning">Not Verified</span>
                            <label class="inline-flex items-center">
                                <input type="checkbox" name="verify_email" value="1"
                                       class="form-checkbox is-basic size-4 rounded border-slate-400/70 bg-slate-100 checked:border-success checked:bg-success hover:border-success focus:border-success dark:border-navy-400 dark:bg-navy-700">
                                <span class="ml-2 text-xs text-success">Mark as verified</span>
                            </label>
                        @endif
                    </div>
                </div>

                <!-- Account Created -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Account Created</label>
                    <div class="mt-1.5">
                        <span class="text-sm text-slate-600 dark:text-navy-300">{{ $user->created_at->format('F j, Y \a\t g:i A') }}</span>
                        <span class="text-xs text-slate-400 dark:text-navy-400">({{ $user->created_at->diffForHumans() }})</span>
                    </div>
                </div>
            </div>

            <!-- Password Update Section -->
            <div class="mt-6 border-t border-slate-200 pt-6 dark:border-navy-500">
                <h4 class="text-lg font-medium text-slate-700 dark:text-navy-100 mb-4">Update Password (Optional)</h4>
                <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <!-- New Password -->
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">New Password</label>
                        <input name="password" type="password"
                               class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                        <p class="mt-1 text-xs text-slate-400">Leave blank to keep current password</p>
                        @error('password')
                            <p class="mt-1 text-xs text-error">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Confirm New Password -->
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Confirm New Password</label>
                        <input name="password_confirmation" type="password"
                               class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                        @error('password_confirmation')
                            <p class="mt-1 text-xs text-error">{{ $message }}</p>
                        @enderror
                    </div>
                </div>
            </div>

            <!-- Bio/Description -->
            <div class="mt-6">
                <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Bio/Description</label>
                <textarea name="bio" rows="4" placeholder="Optional bio or description..."
                          class="form-textarea mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">{{ old('bio', $user->bio) }}</textarea>
                @error('bio')
                    <p class="mt-1 text-xs text-error">{{ $message }}</p>
                @enderror
            </div>

            <!-- User Statistics (Read-only) -->
            <div class="mt-6 border-t border-slate-200 pt-6 dark:border-navy-500">
                <h4 class="text-lg font-medium text-slate-700 dark:text-navy-100 mb-4">User Statistics</h4>
                <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div class="text-center">
                        <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $user->songs_count ?? 0 }}</p>
                        <p class="text-sm text-slate-400">Songs</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $user->playlists_count ?? 0 }}</p>
                        <p class="text-sm text-slate-400">Playlists</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $user->followers_count ?? 0 }}</p>
                        <p class="text-sm text-slate-400">Followers</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $user->following_count ?? 0 }}</p>
                        <p class="text-sm text-slate-400">Following</p>
                    </div>
                </div>
            </div>

            <!-- Form Actions -->
            <div class="mt-8 flex justify-end space-x-3">
                <a href="{{ route('admin.users.index') }}" class="btn border border-slate-300 font-medium text-slate-700 hover:bg-slate-150 dark:border-navy-450 dark:text-navy-100 dark:hover:bg-navy-500">
                    Cancel
                </a>
                <button type="submit" class="btn bg-primary text-white hover:bg-primary-focus focus:bg-primary-focus active:bg-primary-focus/90">
                    Update User
                </button>
            </div>
        </form>

        <!-- Danger Zone -->
        @if($user->id !== auth()->id())
            <div class="border-t border-slate-200 p-6 dark:border-navy-500">
                <h4 class="text-lg font-medium text-error mb-4">Danger Zone</h4>
                <div class="flex items-center justify-between rounded-lg border border-error/20 bg-error/5 p-4">
                    <div>
                        <h5 class="font-medium text-slate-700 dark:text-navy-100">Delete User Account</h5>
                        <p class="text-sm text-slate-400 dark:text-navy-300">This action cannot be undone. This will permanently delete the user account and all associated data.</p>
                    </div>
                    <form method="POST" action="{{ route('admin.users.destroy', $user) }}" class="inline">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn bg-error text-white hover:bg-error-focus"
                                onclick="return confirm('Are you sure you want to delete this user? This action cannot be undone.')">
                            Delete User
                        </button>
                    </form>
                </div>
            </div>
        @endif
    </div>
@endsection