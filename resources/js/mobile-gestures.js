/**
 * Mobile Gestures for LineOne Music Platform
 * Implements swipe, pull-to-refresh, and haptic feedback
 */

export class MobileGestures {
    constructor() {
        this.startY = 0;
        this.startX = 0;
        this.currentY = 0;
        this.currentX = 0;
        this.isRefreshing = false;
        this.isSwiping = false;
        
        this.init();
    }

    init() {
        if (this.isMobileDevice()) {
            this.initPullToRefresh();
            this.initSwipeNavigation();
            this.initPlayerGestures();
        }
    }

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Pull to Refresh
     */
    initPullToRefresh() {
        const refreshThreshold = 80;
        let refreshIndicator = null;

        // Create refresh indicator
        const createIndicator = () => {
            refreshIndicator = document.createElement('div');
            refreshIndicator.className = 'pull-to-refresh-indicator';
            refreshIndicator.innerHTML = `
                <div class="flex items-center justify-center gap-2 py-4 text-gray-400 transition-all duration-300">
                    <svg class="refresh-icon w-5 h-5 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span class="refresh-text text-sm">Pull to refresh</span>
                </div>
            `;
            refreshIndicator.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                transform: translateY(-100%);
                transition: transform 0.3s ease;
                z-index: 9999;
            `;
            document.body.prepend(refreshIndicator);
        };

        if (!refreshIndicator) {
            createIndicator();
        }

        const icon = refreshIndicator.querySelector('.refresh-icon');
        const text = refreshIndicator.querySelector('.refresh-text');

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0 && !this.isRefreshing) {
                this.startY = e.touches[0].pageY;
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (!this.isRefreshing && this.startY > 0) {
                this.currentY = e.touches[0].pageY;
                const distance = this.currentY - this.startY;

                if (distance > 0 && distance < 150) {
                    // Prevent default scroll
                    e.preventDefault();
                    
                    // Show and move indicator
                    const progress = Math.min(distance / refreshThreshold, 1);
                    refreshIndicator.style.transform = `translateY(${Math.min(distance - 80, 0)}px)`;
                    icon.style.transform = `rotate(${progress * 360}deg)`;
                    
                    if (distance > refreshThreshold) {
                        text.textContent = 'Release to refresh';
                        icon.style.color = '#10b981';
                        this.vibrate(10);
                    } else {
                        text.textContent = 'Pull to refresh';
                        icon.style.color = '';
                    }
                }
            }
        });

        document.addEventListener('touchend', () => {
            if (!this.isRefreshing && this.startY > 0) {
                const distance = this.currentY - this.startY;

                if (distance > refreshThreshold) {
                    this.isRefreshing = true;
                    
                    // Show refreshing state
                    refreshIndicator.style.transform = 'translateY(0)';
                    text.textContent = 'Refreshing...';
                    icon.classList.add('animate-spin');
                    this.vibrate(20);

                    // Reload page
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                } else {
                    // Hide indicator
                    refreshIndicator.style.transform = 'translateY(-100%)';
                }

                this.startY = 0;
                this.currentY = 0;
            }
        });
    }

    /**
     * Swipe Navigation (between pages)
     */
    initSwipeNavigation() {
        let swipeThreshold = 100;
        let swipeArea = null;

        document.addEventListener('touchstart', (e) => {
            // Only trigger on main content area
            if (e.target.closest('.main-content')) {
                this.startX = e.touches[0].pageX;
                this.startY = e.touches[0].pageY;
                this.isSwiping = true;
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (this.isSwiping) {
                this.currentX = e.touches[0].pageX;
                this.currentY = e.touches[0].pageY;

                const deltaX = this.currentX - this.startX;
                const deltaY = this.currentY - this.startY;

                // Only horizontal swipes
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    e.preventDefault();
                }
            }
        });

        document.addEventListener('touchend', () => {
            if (this.isSwiping) {
                const deltaX = this.currentX - this.startX;
                const deltaY = this.currentY - this.startY;

                // Horizontal swipe detected
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
                    if (deltaX > 0) {
                        // Swipe right - go back
                        if (window.history.length > 1) {
                            this.vibrate(10);
                            window.history.back();
                        }
                    } else {
                        // Swipe left - go forward (if available)
                        this.vibrate(10);
                        // Could implement forward navigation if needed
                    }
                }

                this.isSwiping = false;
            }
        });
    }

    /**
     * Music Player Gestures
     */
    initPlayerGestures() {
        const player = document.querySelector('.music-player, [x-data*="musicPlayer"]');
        
        if (player) {
            let swipeThreshold = 50;

            player.addEventListener('touchstart', (e) => {
                this.startX = e.touches[0].pageX;
            });

            player.addEventListener('touchend', (e) => {
                const endX = e.changedTouches[0].pageX;
                const deltaX = endX - this.startX;

                if (Math.abs(deltaX) > swipeThreshold) {
                    if (deltaX > 0) {
                        // Swipe right - previous track
                        this.previousTrack();
                        this.vibrate(10);
                    } else {
                        // Swipe left - next track
                        this.nextTrack();
                        this.vibrate(10);
                    }
                }
            });
        }
    }

    /**
     * Player Controls
     */
    previousTrack() {
        if (window.musicPlayer) {
            window.musicPlayer.previousTrack();
        }
    }

    nextTrack() {
        if (window.musicPlayer) {
            window.musicPlayer.nextTrack();
        }
    }

    /**
     * Haptic Feedback
     */
    vibrate(duration = 10) {
        if ('vibrate' in navigator) {
            navigator.vibrate(duration);
        }
    }

    vibratePattern(pattern) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    /**
     * Double Tap to Like
     */
    initDoubleTapToLike() {
        let lastTap = 0;
        
        document.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 300 && tapLength > 0) {
                // Double tap detected
                const target = e.target.closest('[data-song-id]');
                
                if (target) {
                    const songId = target.dataset.songId;
                    this.likeSong(songId);
                    this.showLikeAnimation(target);
                    this.vibratePattern([10, 30, 10]);
                }
            }
            
            lastTap = currentTime;
        });
    }

    likeSong(songId) {
        // Call API to like song
        fetch(`/api/songs/${songId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content
            }
        }).then(response => response.json())
          .then(data => {
              console.log('Song liked:', data);
          })
          .catch(error => {
              console.error('Failed to like song:', error);
          });
    }

    showLikeAnimation(element) {
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            font-size: 48px;
            pointer-events: none;
            z-index: 9999;
            animation: heartPop 0.6s ease-out forwards;
        `;
        
        element.style.position = 'relative';
        element.appendChild(heart);
        
        setTimeout(() => heart.remove(), 600);
    }
}

// Initialize gestures when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobileGestures = new MobileGestures();
    });
} else {
    window.mobileGestures = new MobileGestures();
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes heartPop {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.2);
        }
        100% {
            transform: translate(-50%, -50%) scale(1) translateY(-30px);
            opacity: 0;
        }
    }
    
    .pull-to-refresh-indicator {
        -webkit-backdrop-filter: blur(10px);
    }
`;
document.head.appendChild(style);
