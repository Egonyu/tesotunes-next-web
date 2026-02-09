/**
 * TesoTunes Music Player UI Component (Alpine.js)
 * Clean UI layer that syncs with the global TesoTunes player core
 */
export default () => ({
    // UI State (synced from core)
    currentTrack: null,
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    volume: 80,
    muted: false,
    shuffle: false,
    repeat: 'off',
    isLiked: false,
    queue: [],
    queueIndex: 0,
    error: null,
    showPlaylistModal: false,
    minimized: false, // Player minimize state
    
    // Computed
    get progress() {
        return this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
    },
    
    get volumePercent() {
        return Math.round(this.volume * 100);
    },
    
    get hasNext() {
        return this.queueIndex < this.queue.length - 1 || this.repeat === 'all';
    },
    
    get hasPrevious() {
        return this.queueIndex > 0 || this.repeat === 'all' || this.currentTime > 3;
    },

    /**
     * Initialize UI component
     */
    init() {
        console.log('[TesoTunes UI] Initializing...');
        
        // Restore minimized state from localStorage
        const savedMinimized = localStorage.getItem('tesotunes_player_minimized');
        if (savedMinimized === '1') {
            this.minimized = true;
        }
        
        // Wait for core player to be ready
        if (window.TesoTunes && window.TesoTunes.initialized) {
            this.connectToCore();
        } else {
            window.addEventListener('tesotunes:ready', () => {
                this.connectToCore();
            }, { once: true });
        }
        
        // Listen for play-track events from song cards
        window.addEventListener('play-track', (e) => {
            const { track, queue } = e.detail;
            this.playTrack(track, queue);
        });
        
        // Listen for add-to-playlist modal trigger
        window.addEventListener('tesotunes:add-to-playlist', (e) => {
            this.showPlaylistModal = true;
        });
        
        console.log('[TesoTunes UI] Ready');
    },

    /**
     * Connect to the global TesoTunes core player
     */
    connectToCore() {
        const player = window.TesoTunes;
        if (!player) return;
        
        // Sync initial state
        this.syncFromCore();
        
        // Subscribe to core events
        player.on('play', () => {
            this.isPlaying = true;
            this.isLoading = false;
        });
        
        player.on('pause', () => {
            this.isPlaying = false;
        });
        
        player.on('timeupdate', (data) => {
            this.currentTime = data.currentTime;
            this.duration = data.duration;
        });
        
        player.on('trackchange', (track) => {
            this.currentTrack = track;
            this.syncFromCore();
        });
        
        player.on('buffering', (isBuffering) => {
            this.isLoading = isBuffering;
        });
        
        player.on('volumechange', (data) => {
            this.volume = data.volume;
            this.muted = data.muted;
        });
        
        player.on('shuffle', (value) => {
            this.shuffle = value;
        });
        
        player.on('repeat', (value) => {
            this.repeat = value;
        });
        
        player.on('likechange', (value) => {
            this.isLiked = value;
        });
        
        player.on('error', (data) => {
            this.error = data.message || 'Playback error';
            this.isLoading = false;
            setTimeout(() => this.error = null, 5000);
        });
        
        player.on('statesync', () => {
            this.syncFromCore();
        });
        
        player.on('restored', () => {
            this.syncFromCore();
        });
    },

    /**
     * Sync UI state from core player
     */
    syncFromCore() {
        const player = window.TesoTunes;
        if (!player) return;
        
        const state = player.getState();
        this.currentTrack = state.currentTrack;
        this.isPlaying = state.isPlaying;
        this.currentTime = state.currentTime;
        this.duration = state.duration;
        this.volume = state.volume;
        this.muted = state.muted;
        this.shuffle = state.shuffle;
        this.repeat = state.repeat;
        this.isLiked = state.isLiked;
        this.queue = state.queue;
        this.queueIndex = state.queueIndex;
    },

    /**
     * Play a track
     */
    async playTrack(track, queue = []) {
        this.isLoading = true;
        this.error = null;
        
        const player = window.TesoTunes;
        if (player) {
            await player.play(track, queue);
        }
    },

    /**
     * Toggle play/pause
     */
    togglePlay() {
        const player = window.TesoTunes;
        if (player) {
            player.toggle();
        }
    },

    /**
     * Play next track
     */
    nextTrack() {
        const player = window.TesoTunes;
        if (player) {
            player.next();
        }
    },

    /**
     * Play previous track
     */
    previousTrack() {
        const player = window.TesoTunes;
        if (player) {
            player.previous();
        }
    },

    /**
     * Seek to percentage
     */
    seekTo(percent) {
        const player = window.TesoTunes;
        if (player) {
            player.seekPercent(percent);
        }
    },

    /**
     * Set volume (0-100)
     */
    setVolume(value) {
        const player = window.TesoTunes;
        if (player) {
            player.setVolume(value / 100);
        }
    },

    /**
     * Toggle mute
     */
    toggleMute() {
        const player = window.TesoTunes;
        if (player) {
            player.toggleMute();
        }
    },

    /**
     * Toggle shuffle
     */
    toggleShuffle() {
        const player = window.TesoTunes;
        if (player) {
            player.toggleShuffle();
        }
    },

    /**
     * Toggle repeat mode
     */
    toggleRepeat() {
        const player = window.TesoTunes;
        if (player) {
            player.toggleRepeat();
        }
    },

    /**
     * Toggle like
     */
    toggleLike() {
        const player = window.TesoTunes;
        if (player) {
            player.toggleLike();
        }
    },

    /**
     * Download track
     */
    downloadTrack() {
        const player = window.TesoTunes;
        if (player) {
            player.download();
        }
    },

    /**
     * Add to playlist
     */
    addToPlaylist() {
        const player = window.TesoTunes;
        if (player) {
            player.addToPlaylist();
        }
    },

    /**
     * Toggle minimize state
     */
    toggleMinimize() {
        this.minimized = !this.minimized;
        // Store preference in localStorage
        localStorage.setItem('tesotunes_player_minimized', this.minimized ? '1' : '0');
    },

    /**
     * Format time
     */
    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
});
