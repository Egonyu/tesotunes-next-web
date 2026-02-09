<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>TesoTunes - 404 Error Page</title>
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    <script src="https://cdn.tailwindcss.com?plugins=forms,typography,container-queries"></script>
    <script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "brand-green": "#10B981",
                        "brand-purple": "#8B5CF6",
                        "brand-blue": "#2E77D0",
                        "brand-orange": "#FFA500",
                        "background-dark": "#000000",
                        "card-dark": "#161B22",
                        "border-dark": "#30363D",
                        "text-primary-dark": "#E6EDF3",
                        "text-secondary-dark": "#8B949E",
                    },
                    fontFamily: {
                        display: ["Sora", "sans-serif"],
                    },
                },
            },
        };
    </script>
    <style type="text/tailwindcss">
        :root {
            --bg-pattern: #111111;
        }
        .bg-pattern-african {
            background-color: #000000;
            background-image: 
                radial-gradient(circle at 2px 2px, rgba(46, 119, 208, 0.05) 1px, transparent 0),
                linear-gradient(45deg, transparent 45%, #111 45%, #111 55%, transparent 55%),
                linear-gradient(-45deg, transparent 45%, #111 45%, #111 55%, transparent 55%);
            background-size: 40px 40px, 80px 80px, 80px 80px;
        }
        .glowing-text {
            text-shadow: 0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(139, 92, 246, 0.4);
        }
    </style>
</head>
<body class="bg-background-dark font-display text-text-primary-dark min-h-screen flex flex-col">
    <header class="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-border-dark px-8 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-gradient-to-tr from-brand-green to-brand-purple rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-white text-xl">graphic_eq</span>
            </div>
            <span class="text-xl font-bold tracking-tight">TesoTunes</span>
        </div>
        <nav class="hidden md:flex items-center space-x-8 text-sm font-semibold">
            <a class="hover:text-brand-green transition-colors" href="/">Music</a>
            <a class="hover:text-brand-green transition-colors" href="/podcasts">Podcasts</a>
            <a class="hover:text-brand-green transition-colors" href="/marketplace">Marketplace</a>
            <a class="hover:text-brand-green transition-colors" href="/artist/dashboard">For Artists</a>
        </nav>
        <div class="flex items-center space-x-4">
            <a href="/login" class="text-sm font-semibold hover:text-brand-green transition-colors">Log In</a>
            <a href="/register" class="bg-brand-green text-black font-bold py-2 px-6 rounded-full text-sm hover:scale-105 transition-transform">Sign Up</a>
        </div>
    </header>

    <main class="flex-grow flex items-center justify-center relative overflow-hidden bg-pattern-african px-6">
        <div class="absolute top-1/4 left-10 w-24 h-24 border-t-2 border-l-2 border-brand-orange/10 rounded-tl-3xl"></div>
        <div class="absolute bottom-1/4 right-10 w-32 h-32 border-b-2 border-r-2 border-brand-blue/10 rounded-br-3xl"></div>
        
        <div class="max-w-3xl w-full text-center relative z-10 py-20">
            <h1 class="text-[120px] md:text-[180px] lg:text-[240px] font-black leading-none bg-gradient-to-r from-brand-green via-brand-purple to-brand-green bg-clip-text text-transparent glowing-text tracking-tighter mb-4">
                404
            </h1>
            
            <div class="space-y-6">
                <h2 class="text-3xl md:text-4xl font-bold">Lost in the rhythm?</h2>
                <p class="text-xl text-text-secondary-dark max-w-lg mx-auto">
                    This page seems to have skipped a beat. Let's get you back to the sound.
                </p>

                <form action="/search" method="GET" class="relative max-w-xl mx-auto mt-12">
                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary-dark">search</span>
                    <input 
                        name="q"
                        class="w-full bg-card-dark border border-border-dark rounded-2xl py-4 pl-12 pr-4 text-text-primary-dark focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all outline-none" 
                        placeholder="Try searching for your favorite artist or song..." 
                        type="text"
                    />
                </form>

                <div class="flex flex-col md:flex-row items-center justify-center gap-4 mt-12">
                    <a class="w-full md:w-auto bg-brand-green text-black font-bold py-4 px-10 rounded-full flex items-center justify-center space-x-2 hover:scale-105 hover:shadow-lg hover:shadow-brand-green/20 transition-all" 
                       href="/">
                        <span class="material-symbols-outlined">home</span>
                        <span>Back to Home</span>
                    </a>
                    <a class="w-full md:w-auto bg-white/10 backdrop-blur-md text-white font-bold py-4 px-8 rounded-full flex items-center justify-center space-x-2 hover:bg-white/20 transition-all" 
                       href="/discover">
                        <span class="material-symbols-outlined">explore</span>
                        <span>Explore Music</span>
                    </a>
                    <a class="w-full md:w-auto bg-transparent border border-border-dark text-white font-bold py-4 px-8 rounded-full flex items-center justify-center space-x-2 hover:border-brand-purple transition-all" 
                       href="/marketplace">
                        <span class="material-symbols-outlined">shopping_bag</span>
                        <span>Visit Marketplace</span>
                    </a>
                </div>
            </div>
        </div>
    </main>

    <footer class="bg-background-dark border-t border-border-dark px-8 py-6">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="flex items-center space-x-6">
                <a class="text-xs text-text-secondary-dark hover:text-white" href="/help">Help Center</a>
                <a class="text-xs text-text-secondary-dark hover:text-white" href="/status">Status</a>
                <a class="text-xs text-text-secondary-dark hover:text-white" href="/legal">Legal</a>
                <a class="text-xs text-text-secondary-dark hover:text-white" href="/privacy">Privacy Policy</a>
            </div>
            <div class="flex items-center space-x-4">
                <span class="text-xs text-text-secondary-dark">© {{ date('Y') }} TesoTunes. All rights reserved.</span>
            </div>
        </div>
    </footer>
</body>
</html>