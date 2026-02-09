@extends('layouts.app')

@section('title', 'Playlists Hub')

@push('styles')
<link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
<style>
    .glass {
        background: rgba(31, 34, 41, 0.7);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .playlist-card:hover .play-button {
        opacity: 1;
        transform: translateY(0);
    }
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
@endpush

@section('content')
<div class="font-[Epilogue] text-white">
    <!-- Sticky Header -->
    <header class="sticky top-0 z-20 glass h-16 flex items-center justify-between px-8 border-b-0 rounded-xl mb-6">
        <div class="flex items-center gap-4">
            <div class="flex gap-2 mr-4">
                <button onclick="history.back()" class="size-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60"><span class="material-symbols-outlined text-sm">chevron_left</span></button>
                <button onclick="history.forward()" class="size-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60"><span class="material-symbols-outlined text-sm">chevron_right</span></button>
            </div>
            <div class="flex gap-2 overflow-x-auto hide-scrollbar">
                <button class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-brand-green text-black px-4 text-xs font-bold">Recent</button>
                <button class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white/10 text-white px-4 text-xs font-bold hover:bg-white/20">Popular</button>
                <button class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white/10 text-white px-4 text-xs font-bold hover:bg-white/20">Artist-curated</button>
                <button class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white/10 text-white px-4 text-xs font-bold hover:bg-white/20">Moods</button>
            </div>
        </div>
        @auth
        <div class="flex items-center gap-4">
            <a href="{{ route('playlists.create') }}" class="flex h-8 items-center gap-2 rounded-full bg-brand-green text-black px-4 text-xs font-bold hover:brightness-110">
                <span class="material-symbols-outlined text-sm">add</span> Create Playlist
            </a>
        </div>
        @endauth
    </header>

    <!-- Hero Section -->
    <section class="relative">
        <div class="group relative h-96 w-full rounded-2xl overflow-hidden flex flex-col justify-end p-10 bg-cover bg-center" style="background-image: linear-gradient(to top, rgba(17,19,23,1) 0%, rgba(17,19,23,0.4) 50%, rgba(17,19,23,0) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuC6UNDJdZucYdIkrA5qLt1eXNsbuLQE9MO6C3Kjk0bHGWZVqpJePW8Tfcc6MH7XQvFhRHMKwCPYF3w19M15pUMJP9FLYg8ZgY8QOvXpWbBdeJlawh4UZ48ig-iUZW8g04-XsehtHO7SQTtS2vhHnzPMlzLEJgQ7LElMAlKHKLockFLiXUHT39f04dx8PZl3TXgYcxCJISGT-gaXE_nli7ZmAyShQIHGlRZuSvz8EnWZdMY3SjktIU3QG0pxpneIWuT_iJlbdCe5zBdy');">
            <div class="flex flex-col gap-4 max-w-2xl">
                <span class="text-brand-green font-bold tracking-widest text-xs uppercase">Playlist of the Day</span>
                <h2 class="text-6xl font-black tracking-tighter leading-none">Afrobeats Essentials</h2>
                <p class="text-white/70 text-lg line-clamp-2">The ultimate collection of the hottest Afrobeats tracks. Join 250,000 listeners across the globe with this curated journey through rhythm.</p>
                <div class="flex items-center gap-4 mt-2">
                    <button class="h-14 px-10 bg-brand-green text-black rounded-full font-black text-lg hover:scale-105 transition-transform flex items-center gap-2">
                        <span class="material-symbols-outlined text-2xl">play_arrow</span> Play
                    </button>
                    <button class="size-14 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                        <span class="material-symbols-outlined">favorite</span>
                    </button>
                    <div class="text-white/40 text-sm font-medium ml-2">
                        50 songs • 2 hr 45 min
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Personalized Carousel -->
    <section class="mt-12">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold tracking-tight">Made For You</h3>
            <a class="text-xs font-bold text-white/50 hover:text-brand-green transition-colors" href="#">SEE ALL</a>
        </div>
        <div class="flex gap-6 overflow-x-auto hide-scrollbar pb-4 -mx-1 px-1">
            <!-- Daily Mix 1 -->
            <div class="playlist-card group min-w-[200px] glass p-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                <div class="relative aspect-square rounded-lg overflow-hidden mb-4 shadow-2xl">
                    <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBQrFEaMAUv1ojKa2Ynsh_QASp7Cn6F0w2t6L0OIYACUOFxdFeQH_MSR_DjbftKL9E53nVUvSThNDfPS84mM5cZmqO_kmEhft6_QNC-XLYO9sgzQUeyBHSOnGVPRsxxy60YVnrW_2SiqUwOsXBg2JDJxUlEY6MDnNJXVup2an_mWzg4z547Ujx6q7Ks5Ru4AdIm8hVriAVllTJuh_47XtazVPLjj7rg_3nTYFNDr84wR_PIRkTh4hZv1K7SWRCYRVTtFC65zNMRxFge');"></div>
                    <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                    <div class="play-button absolute bottom-2 right-2 size-12 bg-brand-green rounded-full flex items-center justify-center shadow-xl opacity-0 translate-y-4 transition-all duration-300">
                        <span class="material-symbols-outlined text-black">play_arrow</span>
                    </div>
                </div>
                <h4 class="font-bold mb-1 truncate">Daily Mix 1</h4>
                <p class="text-xs text-white/50 line-clamp-2">Burna Boy, Wizkid, Tems and more</p>
            </div>
            <!-- Discover Weekly -->
            <div class="playlist-card group min-w-[200px] glass p-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                <div class="relative aspect-square rounded-lg overflow-hidden mb-4 shadow-2xl">
                    <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAIbPax0qV12KJqsdhuxILvy85lycu_Ishlku8epLoScA99Nznh244Gc3wCbwgZbqim3N26mnyUfK0cKeD2uYHayTTIS4voTfnhrqJTABcxGG72_0N1oYimOwMnKlsuFwtQO85n8BmsuzhXG3-NsGFmTW3E2F36sQOLHfwWHWTQUotuJaS5Bw8oHpoq5uiwYkwJnMGAeZ3Irrx_EyBYFYX9Ga3G3Jak5yl8RABCXgYH6aE6Fz2mQ6bd-o3xrKQoSZGyrPUvn9kIhIZj');"></div>
                    <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                    <div class="play-button absolute bottom-2 right-2 size-12 bg-brand-green rounded-full flex items-center justify-center shadow-xl opacity-0 translate-y-4 transition-all duration-300">
                        <span class="material-symbols-outlined text-black">play_arrow</span>
                    </div>
                </div>
                <h4 class="font-bold mb-1 truncate">Discover Weekly</h4>
                <p class="text-xs text-white/50 line-clamp-2">Your weekly mixtape of fresh music</p>
            </div>
            <!-- Release Radar -->
            <div class="playlist-card group min-w-[200px] glass p-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                <div class="relative aspect-square rounded-lg overflow-hidden mb-4 shadow-2xl">
                    <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCP-RL8EUBwTqiNtWMx_03I7e4LkHCpbl6jwd8KF2ynIuO0t-Q_kJOOLok9Mh_H5AdrZ_DVcXIvNslBabwdUEceeyH0xPQaFQThFdsj0k_OOcbvuKOkLQU-Fe9xOjCloZNbquFVFU0zbWn7WBKYpPmw7uHtQiexL0_8_oY8_bOjsj1kCmhs0QL40aLheQqgLHzyLDj-jqnN1Jz59eSARcUfU5THFSLY-tK00GNX8tB-UUGdS5M7JyJwCa-wG4sMglCyUJ7_bZbDAU-x');"></div>
                    <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                    <div class="play-button absolute bottom-2 right-2 size-12 bg-brand-green rounded-full flex items-center justify-center shadow-xl opacity-0 translate-y-4 transition-all duration-300">
                        <span class="material-symbols-outlined text-black">play_arrow</span>
                    </div>
                </div>
                <h4 class="font-bold mb-1 truncate">Release Radar</h4>
                <p class="text-xs text-white/50 line-clamp-2">Catch up on the latest from artists you follow</p>
            </div>
            <!-- On Repeat -->
            <div class="playlist-card group min-w-[200px] glass p-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                <div class="relative aspect-square rounded-lg overflow-hidden mb-4 shadow-2xl">
                    <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAanvvZmOjSJSfvK_RxXLOQcP0H0bH0MveoKfAlvepvGzSPx8JU4BcB5ARdrIHGXaoVYPfNQpXr4lQlpWsrZiRwJn8Y_HZZLd76z4vnIOi5zW9Mtyaer6cLiTIJSJNYACgg4Sja_IyGLwSHneFbEyKEZw8UU5kESk0J0APpiTIxDMf_HGqln-gTiotvR7VglYbHecpclBbG7Gq76XpEJrsEfWjSiNU474N8kkfdjKz7TIbEYsnW3J7QOcmk13a0OxEw_hRkCb7pI1pD');"></div>
                    <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                    <div class="play-button absolute bottom-2 right-2 size-12 bg-brand-green rounded-full flex items-center justify-center shadow-xl opacity-0 translate-y-4 transition-all duration-300">
                        <span class="material-symbols-outlined text-black">play_arrow</span>
                    </div>
                </div>
                <h4 class="font-bold mb-1 truncate">On Repeat</h4>
                <p class="text-xs text-white/50 line-clamp-2">Songs you have been loving lately</p>
            </div>
        </div>
    </section>

    <!-- Genre & Mood Grid -->
    <section class="mt-12">
        <h3 class="text-2xl font-bold tracking-tight mb-6">Explore Genres & Moods</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div class="relative h-48 rounded-xl overflow-hidden group cursor-pointer bg-gradient-to-br from-purple-600 to-indigo-900">
                <div class="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCQy2c4xamkJGHuwxgw0T4FSxDIvAzGLbZ6leABiZcR60eo3hr684TWpAOAUP6q3UWYfqIpVkWL4QbGHdCPfsO5otExLlxL-P_EhZtnWtZ8yIWd0J7hnjcbN3e-CwKtTFie7SioPgZixloqdP1Z_cY1dlGQWmnkeSKaMaCSLzZCfcXyBMJ3ITTLx8MSz1NAJs7IK_S_Qm4D9jDMGq50fI3PCC1C8w8y4m7_ckxAUNNmBsVYzVry9PwEBOuZTPjiLaVtt4815LSXbJI5');"></div>
                <div class="absolute inset-0 p-6 flex flex-col justify-between">
                    <h4 class="text-2xl font-black italic tracking-tighter">CHILL RHYTHMS</h4>
                    <span class="material-symbols-outlined self-end text-3xl">filter_vintage</span>
                </div>
            </div>
            <div class="relative h-48 rounded-xl overflow-hidden group cursor-pointer bg-gradient-to-br from-orange-500 to-red-800">
                <div class="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuABZMNrb1v4fos5LUzWQjjLKMr44ru3FaeiFDrSVFyipXzoRqF5irMyieP8cJiuMPF7rj426HUzPQxbqczlIsaBij1ILuOon5ziMXB-q65SY0mSet7GJ0SyOAPOzWFDxfiFpZ6uAyIifXuLglzLBGcxyyV5JIvlLoDLe14eK7mGnbodbZazzsq7FLHCkzeYRWfJyPWzmf-G12T_P_ZE_Vbi7_Z70fMX0vXJrVMVhPpmmQKPq2J7whyy52Zc6QEu39XCCJtbdZIToFPy');"></div>
                <div class="absolute inset-0 p-6 flex flex-col justify-between">
                    <h4 class="text-2xl font-black italic tracking-tighter">GOSPEL SOUL</h4>
                    <span class="material-symbols-outlined self-end text-3xl">auto_awesome</span>
                </div>
            </div>
            <div class="relative h-48 rounded-xl overflow-hidden group cursor-pointer bg-gradient-to-br from-cyan-500 to-blue-900">
                <div class="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBk-6WzMKMCjIT7oaAmlQ8fA4jhGH-7A2dLyGmg6FRzAskmWHzAhP6_1vG8QXr4bEUT4DivVoo598uLnY8UJ06r07oYf3CeGXMoJtGx3g6KEgYYhVLDciV4SUV7PvLAIZyki-8Le8x-vEVMhc89ub1MSpVs0pU9SNTYGRDsdZTFyAkdxCZqGuS8jGSqq7Z3VJeacLGXuKKdSX_bLpRALgBvGwY524UpdpmrzD2n0Hlm8h94SpVwdnA1YgmFOaAi3aMGTlIh6Nh8Dg8X');"></div>
                <div class="absolute inset-0 p-6 flex flex-col justify-between">
                    <h4 class="text-2xl font-black italic tracking-tighter">ENERGY BOOST</h4>
                    <span class="material-symbols-outlined self-end text-3xl">bolt</span>
                </div>
            </div>
            <div class="relative h-48 rounded-xl overflow-hidden group cursor-pointer bg-gradient-to-br from-emerald-500 to-teal-900">
                <div class="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAxiYWOdd2aTEK5OHDNcXpwda47Q-sOgnQQmOnbwpu0N4X8eGm4HVXNUqBK9FXVIFXCG1erGnDtJPLPgg40KY-lO1Oqj3gMksU6WDnbhWQuhJe_Nk-wftLZrSnZq1mqxVTkL11Fqoc85E9JVeeI-KcT9dJshw-eyRLQcKf82omcqFM8utt6IlwzcGA9U97TePCSzPVHLdUoczxsoIcMzDPd1zMyVHbfpgmRR0r6e0PhUjadslD7QSugr96XEgUsyGNQ_-r_J2Fald6T');"></div>
                <div class="absolute inset-0 p-6 flex flex-col justify-between">
                    <h4 class="text-2xl font-black italic tracking-tighter">TESO JAZZ</h4>
                    <span class="material-symbols-outlined self-end text-3xl">fax</span>
                </div>
            </div>
        </div>
    </section>

    <!-- Trending & Editor's Picks -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-16">
        <!-- Trending Section -->
        <div class="lg:col-span-2">
            <h3 class="text-2xl font-bold tracking-tight mb-6">Trending in Teso</h3>
            <div class="space-y-2">
                <div class="group flex items-center gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <span class="w-8 text-center text-white/40 font-bold group-hover:text-brand-green">01</span>
                    <div class="size-12 rounded bg-cover" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCDehrDZoK93kAboZDdBZyZkYkmwL-XfA77vgJW1da_HLj7XNM2MdGqDu5kBre8CDluPucNy7kVAI2Gzkb8vlzIVyaSWx2RoumyTipVFRUGCLndBsNugSqBTEsAVz_DifQVC32Y_ccrhO8L4OJNHtmwWfmxUUAaY0GCyCHlQRqJkUD8CsXugmDnp27cM60SKjPRpj5mQT_k4_WjQkfcXuyZQSiwSBu79IiSrBrlv08Ogxkx35VO4M4rtH4o-GI_d_dv-9oko8LhyCky')"></div>
                    <div class="flex-1">
                        <h5 class="font-bold text-sm">Sunlit Soroti</h5>
                        <p class="text-xs text-white/50">Lakeside Collective</p>
                    </div>
                    <div class="text-xs text-white/40 group-hover:text-white transition-colors">4:20</div>
                    <button class="material-symbols-outlined text-white/40 hover:text-brand-green">more_horiz</button>
                </div>
                <div class="group flex items-center gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <span class="w-8 text-center text-white/40 font-bold group-hover:text-brand-green">02</span>
                    <div class="size-12 rounded bg-cover" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuA5LqibPEMZyH6_LkNhyx4K3XiYa0w8gxWcebd56g7cROvWUbjXIFbtfZRZ8bj71LexpyDXNfULdxCYq9ZJeCiTXsa7fSwVvp1Ly-vssSITTN3RjFO-mW1bPznOESvQRoHD_GqmIqvP3kdAeOmQEOL3C5tF9KaGgdixIU20kJ7w936ovTuyV9gT55p-sgEgtwIAlzLmWH_uHoeAwKYnfSZItDoG_aHEszPIZwX69o6j5haFkGreskYChWJum0hEqXV_sWG_3_ywtaEE')"></div>
                    <div class="flex-1">
                        <h5 class="font-bold text-sm">Night Market Beats</h5>
                        <p class="text-xs text-white/50">DJ Amref</p>
                    </div>
                    <div class="text-xs text-white/40 group-hover:text-white transition-colors">3:45</div>
                    <button class="material-symbols-outlined text-white/40 hover:text-brand-green">more_horiz</button>
                </div>
                <div class="group flex items-center gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <span class="w-8 text-center text-white/40 font-bold group-hover:text-brand-green">03</span>
                    <div class="size-12 rounded bg-cover" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDfEtrVq6lyOZgKhsBbKyk_yCIn_yjtcy5acrhh7OfNJROJDkqnwdFt23Q71-i-srfDhd7gztJrTWPAHx7EIH9PHoVoY9hX_KUrd2t2RiD5A2XDlasVhrE1bqjz3W2UGBTtSCY0YuiLUJbGeeamqw10XcMno5b_JxHO0kAVuoDk8CnpmAH0i7cAIISdJaDYv4gWD6ZzTISYpGBCMqti6En5cUG1dog3e2vnFYoyykBe50P9kqElQLmI99apqfdvEiCsAO3JqfFFU_wY')"></div>
                    <div class="flex-1">
                        <h5 class="font-bold text-sm">Cotton Plains</h5>
                        <p class="text-xs text-white/50">Ekaru Spirit</p>
                    </div>
                    <div class="text-xs text-white/40 group-hover:text-white transition-colors">5:12</div>
                    <button class="material-symbols-outlined text-white/40 hover:text-brand-green">more_horiz</button>
                </div>
            </div>
        </div>
        <!-- Editor's Picks -->
        <div>
            <h3 class="text-2xl font-bold tracking-tight mb-6">Editor's Picks</h3>
            <div class="space-y-4">
                <div class="flex gap-4 items-center">
                    <div class="size-20 rounded-xl bg-cover flex-shrink-0" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuA2fNJiS4Z7hcL4HgGuZFgnO8JjzLjnJ8BrmWY6vFm9KMxpx8O8UtPVLENsQ92pBnmTb4I190XmkVQLBzUCNtWIOKLp8E1cqQRGonV_2-o_85kZqewFTf79ZjDBBhHl21ak2hknXnifnuHc5D6vRdmzvNgFyFH8QlWvoAV9GAnGjDYhkWNmH2F75ye4QA-FVgflXmSO4A_DLwg6fBVQBy61rest6Sf9acTu1eC5WNmbo_Qf4RCPHLzy13vYf7PjcbhNmMmn8aUIuNcm')"></div>
                    <div>
                        <h6 class="font-bold leading-tight mb-1">Modern Folklore</h6>
                        <p class="text-xs text-white/40 mb-2">Updated 2 days ago</p>
                        <button class="text-xs font-bold text-brand-green hover:underline">EXPLORE</button>
                    </div>
                </div>
                <div class="flex gap-4 items-center">
                    <div class="size-20 rounded-xl bg-cover flex-shrink-0" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDcp4W9lpPgXgkT8TzONTuvvrU5Vuqm9T1_L3jOR1a3WY-846MSry8K76NbKNE2fWQupYR5Jl3EU_Vl0qZM7AFar_fD9RKkN8Bx6hqEwkPQKGvnFm4yY2WcPPynxMkHc1G6aWgLimro8KXCHnQLCbbPWFB2r3GTDuUr5hSwbsKyDLpaVyn_N65sb1CEYYuz-oU7MkjTNRG62LNlMjcBXnurv0-_sXAVuiV8_5isA1J1g45dYXuh9EEwH2khBZ-rm3ohkZuknfepsmI2')"></div>
                    <div>
                        <h6 class="font-bold leading-tight mb-1">Urban Afrobeat</h6>
                        <p class="text-xs text-white/40 mb-2">Curated by Teso Editorial</p>
                        <button class="text-xs font-bold text-brand-green hover:underline">EXPLORE</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bottom Music Player -->
    <footer class="fixed bottom-0 left-0 w-full h-24 glass border-t border-white/5 flex items-center justify-between px-6 z-30">
        <!-- Track Info -->
        <div class="flex items-center gap-4 w-1/3">
            <div class="size-14 rounded-lg bg-cover shadow-lg" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAa09z-GS6PMV_RnBhxi4SZ5P5WT3dLue8arCHmHW64oNkaKMZ728V1TKOTdGzGqG_skfjseo8o1C1q_vnsrAM10MZ0oOR2Xoz_OENZW9iitOexYE0KFPwVukmM_whutuSqb95p-q1drRPWDpMtkq-zUKqzCJ-s-QxDheZXPRAx1LeHb-RkgR49dZVQsG4siHbRbgPjHB_TUkQ-bKpTJs994YzX11e6Guo4gjBc3s0hzq7icBejJARqp_lyNT4ZRlg5u_7UA_-RLdRR')"></div>
            <div>
                <h5 class="text-sm font-bold">Midnight Fever</h5>
                <p class="text-xs text-white/60">Teso All-Stars</p>
            </div>
            <button class="material-symbols-outlined text-brand-green ml-2">favorite</button>
        </div>
        <!-- Controls -->
        <div class="flex flex-col items-center gap-2 w-1/3">
            <div class="flex items-center gap-6">
                <button class="material-symbols-outlined text-white/60 hover:text-white transition-colors">shuffle</button>
                <button class="material-symbols-outlined text-white/80 hover:text-white transition-colors">skip_previous</button>
                <button class="size-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform">
                    <span class="material-symbols-outlined text-2xl">pause</span>
                </button>
                <button class="material-symbols-outlined text-white/80 hover:text-white transition-colors">skip_next</button>
                <button class="material-symbols-outlined text-white/60 hover:text-white transition-colors">repeat</button>
            </div>
            <div class="w-full flex items-center gap-3">
                <span class="text-[10px] text-white/40 font-mono">1:42</span>
                <div class="flex-1 h-1 bg-white/10 rounded-full overflow-hidden relative group cursor-pointer">
                    <div class="absolute inset-0 bg-brand-green w-[40%] rounded-full group-hover:brightness-110"></div>
                </div>
                <span class="text-[10px] text-white/40 font-mono">3:55</span>
            </div>
        </div>
        <!-- Volume/Settings -->
        <div class="flex items-center justify-end gap-4 w-1/3">
            <button class="material-symbols-outlined text-white/60 hover:text-white">lyrics</button>
            <button class="material-symbols-outlined text-white/60 hover:text-white">queue_music</button>
            <button class="material-symbols-outlined text-white/60 hover:text-white">devices</button>
            <div class="flex items-center gap-2 group">
                <button class="material-symbols-outlined text-white/60 group-hover:text-white">volume_up</button>
                <div class="w-24 h-1 bg-white/10 rounded-full overflow-hidden relative">
                    <div class="absolute inset-0 bg-white/60 w-[70%] rounded-full"></div>
                </div>
            </div>
            <button class="material-symbols-outlined text-white/60 hover:text-white">open_in_full</button>
        </div>
    </footer>

    <!-- Spacer for fixed player -->
    <div class="h-32"></div>
</div>
@endsection
