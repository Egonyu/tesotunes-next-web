@extends('layouts.admin')

@section('title', 'Create User')

@section('content')
    <div class="card">
        <div class="border-b border-slate-200 p-4 dark:border-navy-500">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Create New User</h3>
                <a href="{{ route('admin.users.index') }}" class="btn border border-slate-300 font-medium text-slate-700 hover:bg-slate-150 dark:border-navy-450 dark:text-navy-100 dark:hover:bg-navy-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Users
                </a>
            </div>
        </div>

        <form method="POST" action="{{ route('admin.users.store') }}" class="p-6">
            @csrf

            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                <!-- Name -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Full Name *</label>
                    <input name="name" type="text" required
                           value="{{ old('name') }}"
                           class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                    @error('name')
                        <p class="mt-1 text-xs text-error">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Email -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Email Address *</label>
                    <input name="email" type="email" required
                           value="{{ old('email') }}"
                           class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                    @error('email')
                        <p class="mt-1 text-xs text-error">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Phone -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Phone Number</label>
                    <input name="phone" type="tel"
                           value="{{ old('phone') }}"
                           class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                    @error('phone')
                        <p class="mt-1 text-xs text-error">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Country -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Country</label>
                    <input name="country" type="text"
                           value="{{ old('country') }}"
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
                        <option value="user" {{ old('role') === 'user' ? 'selected' : '' }}>User</option>
                        <option value="artist" {{ old('role') === 'artist' ? 'selected' : '' }}>Artist</option>
                        <option value="moderator" {{ old('role') === 'moderator' ? 'selected' : '' }}>Moderator</option>
                        <option value="admin" {{ old('role') === 'admin' ? 'selected' : '' }}>Admin</option>
                    </select>
                    @error('role')
                        <p class="mt-1 text-xs text-error">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Status -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Status</label>
                    <select name="is_active" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="1" {{ old('is_active', '1') === '1' ? 'selected' : '' }}>Active</option>
                        <option value="0" {{ old('is_active') === '0' ? 'selected' : '' }}>Inactive</option>
                    </select>
                    @error('is_active')
                        <p class="mt-1 text-xs text-error">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <!-- Password Section -->
            <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <!-- Password -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Password *</label>
                    <input name="password" type="password" required
                           class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                    @error('password')
                        <p class="mt-1 text-xs text-error">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Confirm Password -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Confirm Password *</label>
                    <input name="password_confirmation" type="password" required
                           class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                    @error('password_confirmation')
                        <p class="mt-1 text-xs text-error">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <!-- Email Verification -->
            <div class="mt-6">
                <label class="inline-flex items-center">
                    <input type="checkbox" name="email_verified" value="1" {{ old('email_verified') ? 'checked' : '' }}
                           class="form-checkbox is-basic size-5 rounded border-slate-400/70 bg-slate-100 checked:border-primary checked:bg-primary hover:border-primary focus:border-primary dark:border-navy-400 dark:bg-navy-700 dark:checked:border-accent dark:checked:bg-accent dark:hover:border-accent dark:focus:border-accent">
                    <span class="ml-2 text-sm text-slate-600 dark:text-navy-300">Mark email as verified</span>
                </label>
            </div>

            <!-- Bio/Description -->
            <div class="mt-6">
                <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Bio/Description</label>
                <textarea name="bio" rows="4" placeholder="Optional bio or description..."
                          class="form-textarea mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">{{ old('bio') }}</textarea>
                @error('bio')
                    <p class="mt-1 text-xs text-error">{{ $message }}</p>
                @enderror
            </div>

            <!-- Form Actions -->
            <div class="mt-8 flex justify-end space-x-3">
                <a href="{{ route('admin.users.index') }}" class="btn border border-slate-300 font-medium text-slate-700 hover:bg-slate-150 dark:border-navy-450 dark:text-navy-100 dark:hover:bg-navy-500">
                    Cancel
                </a>
                <button type="submit" class="btn bg-primary text-white hover:bg-primary-focus focus:bg-primary-focus active:bg-primary-focus/90">
                    Create User
                </button>
            </div>
        </form>
    </div>
@endsection