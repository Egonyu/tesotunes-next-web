@extends('frontend.layouts.music')

@section('title', 'Contact')

@section('content')
<div class="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
        <h1 class="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
            Contact Us
        </h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto">
            Have a question or need help? We'd love to hear from you.
        </p>
    </div>

    <div class="grid md:grid-cols-2 gap-12">
        <!-- Contact Form -->
        <div class="bg-gray-900/50 rounded-2xl p-8">
            <h2 class="text-2xl font-bold mb-6">Send us a message</h2>
            
            <form action="{{ route('frontend.contact.submit') }}" method="POST" class="space-y-6">
                @csrf
                
                <div>
                    <label for="name" class="block text-sm font-medium mb-2">Name</label>
                    <input type="text" id="name" name="name" required 
                           class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                           value="{{ old('name') }}">
                    @error('name')
                        <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="email" class="block text-sm font-medium mb-2">Email</label>
                    <input type="email" id="email" name="email" required 
                           class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                           value="{{ old('email') }}">
                    @error('email')
                        <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="message" class="block text-sm font-medium mb-2">Message</label>
                    <textarea id="message" name="message" rows="6" required 
                              class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none">{{ old('message') }}</textarea>
                    @error('message')
                        <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <button type="submit" 
                        class="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                    Send Message
                </button>
            </form>
        </div>

        <!-- Contact Info -->
        <div class="space-y-8">
            <div class="bg-gray-900/50 rounded-2xl p-8">
                <h3 class="text-xl font-bold mb-4">Get in Touch</h3>
                <div class="space-y-4">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                            <span class="material-icons-round text-white text-sm">email</span>
                        </div>
                        <div>
                            <p class="font-medium">Email</p>
                            <p class="text-gray-400">support@tesotunes.com</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                            <span class="material-icons-round text-white text-sm">phone</span>
                        </div>
                        <div>
                            <p class="font-medium">Phone</p>
                            <p class="text-gray-400">+1 (555) 123-4567</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-gray-900/50 rounded-2xl p-8">
                <h3 class="text-xl font-bold mb-4">FAQ</h3>
                <div class="space-y-3">
                    <details class="group">
                        <summary class="cursor-pointer font-medium group-open:text-purple-400">How do I upload music?</summary>
                        <p class="text-gray-400 mt-2 text-sm">Register as an artist and use our upload tool to share your music with the world.</p>
                    </details>
                    <details class="group">
                        <summary class="cursor-pointer font-medium group-open:text-purple-400">Can I download music for offline listening?</summary>
                        <p class="text-gray-400 mt-2 text-sm">Yes, with a Premium or Hi-Fi subscription you can download tracks for offline playback.</p>
                    </details>
                    <details class="group">
                        <summary class="cursor-pointer font-medium group-open:text-purple-400">How do music awards work?</summary>
                        <p class="text-gray-400 mt-2 text-sm">Users can vote for their favorite artists and tracks during award seasons. Premium users get enhanced voting privileges.</p>
                    </details>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection