#!/bin/bash

# TesoTunes - Inertia.js SPA Setup Script
# This converts the app to SPA for seamless music playback
# Run as: bash scripts/setup-inertia.sh

set -e

echo "🚀 TesoTunes - Inertia.js Setup"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo "❌ Error: Must run from project root"
    exit 1
fi

echo "📦 Step 1: Installing Composer dependencies..."
composer require inertiajs/inertia-laravel --quiet

echo "📦 Step 2: Installing NPM dependencies..."
npm install @inertiajs/vue3 --save

echo "📝 Step 3: Publishing Inertia middleware..."
php artisan inertia:middleware

echo "⚙️  Step 4: Adding middleware to kernel..."

# Add HandleInertiaRequests to web middleware
if ! grep -q "HandleInertiaRequests" app/Http/Kernel.php; then
    echo "   Adding Inertia middleware to Kernel.php..."
    # This needs manual intervention - just show instructions
    echo ""
    echo "   ⚠️  Manual step required:"
    echo "   Add to app/Http/Kernel.php in \$middlewareGroups['web']:"
    echo ""
    echo "   \\App\\Http\\Middleware\\HandleInertiaRequests::class,"
    echo ""
fi

echo "📝 Step 5: Creating Inertia app layout..."

cat > resources/views/app.blade.php << 'EOF'
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title inertia>{{ config('app.name', 'TesoTunes') }}</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
    
    <!-- Scripts -->
    @routes
    @vite(['resources/js/app.js', "resources/js/Pages/{$page['component']}.vue"])
    @inertiaHead
</head>
<body class="font-sans antialiased">
    @inertia
</body>
</html>
EOF

echo "📝 Step 6: Updating app.js..."

cat > resources/js/app.js << 'EOF'
import './bootstrap';
import '../css/app.css';

import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ZiggyVue } from '../../vendor/tightenco/ziggy';

const appName = import.meta.env.VITE_APP_NAME || 'TesoTunes';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**/*.vue')),
    setup({ el, App, props, plugin }) {
        return createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(ZiggyVue)
            .mount(el);
    },
    progress: {
        color: '#4B5563',
    },
});
EOF

echo "📁 Step 7: Creating Pages directory structure..."

mkdir -p resources/js/Pages/Dashboard
mkdir -p resources/js/Pages/Music
mkdir -p resources/js/Pages/Artist
mkdir -p resources/js/Layouts
mkdir -p resources/js/Components

echo "📝 Step 8: Creating sample Music page..."

cat > resources/js/Pages/Music/Index.vue << 'EOF'
<script setup>
import { Head } from '@inertiajs/vue3';
import MainLayout from '@/Layouts/MainLayout.vue';

defineProps({
    songs: Array,
});
</script>

<template>
    <Head title="Music" />
    
    <MainLayout>
        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    Your Music
                </h1>
                
                <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6">
                        <!-- Music content will go here -->
                        <p class="text-gray-600 dark:text-gray-400">
                            Music player with seamless playback coming soon...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </MainLayout>
</template>
EOF

echo "📝 Step 9: Creating main layout..."

cat > resources/js/Layouts/MainLayout.vue << 'EOF'
<script setup>
import { Link } from '@inertiajs/vue3';
</script>

<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
        <!-- Navigation -->
        <nav class="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex">
                        <Link href="/" class="flex items-center">
                            <span class="text-xl font-bold text-gray-900 dark:text-white">
                                TesoTunes
                            </span>
                        </Link>
                        
                        <div class="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                            <Link 
                                href="/discover" 
                                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                Discover
                            </Link>
                            <Link 
                                href="/music" 
                                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                Music
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
        
        <!-- Page Content -->
        <main>
            <slot />
        </main>
        
        <!-- Global Music Player (persistent across navigation) -->
        <div class="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg">
            <div class="max-w-7xl mx-auto">
                <p class="text-sm text-gray-400">🎵 Music Player - Stays visible during navigation</p>
            </div>
        </div>
    </div>
</template>
EOF

echo ""
echo "✅ Inertia.js setup complete!"
echo ""
echo "📋 Manual steps required:"
echo ""
echo "1. Add to app/Http/Kernel.php in \$middlewareGroups['web']:"
echo "   \\App\\Http\\Middleware\\HandleInertiaRequests::class,"
echo ""
echo "2. Update a controller to use Inertia:"
echo "   use Inertia\\Inertia;"
echo "   return Inertia::render('Music/Index', ['songs' => \$songs]);"
echo ""
echo "3. Build assets:"
echo "   npm run dev"
echo ""
echo "4. Test navigation - music player should persist!"
echo ""
echo "📚 Next steps:"
echo "   - Convert existing Blade templates to Vue components"
echo "   - Integrate persistent music player component"
echo "   - Add pre-buffering to player"
echo "   - Test seamless navigation"
echo ""
