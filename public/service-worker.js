const CACHE_NAME = 'tesotunes-v1.0.0';
const RUNTIME_CACHE = 'tesotunes-runtime';

// Assets to cache on install
const urlsToCache = [
    '/',
    '/css/app.css',
    '/js/app.js',
    '/offline.html'
];

// Install event - cache core assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME, RUNTIME_CACHE];
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }
    
    // Handle API requests - network first
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Clone response for caching
                    const responseToCache = response.clone();
                    
                    caches.open(RUNTIME_CACHE).then(cache => {
                        cache.put(request, responseToCache);
                    });
                    
                    return response;
                })
                .catch(() => {
                    // Fallback to cache if network fails
                    return caches.match(request);
                })
        );
        return;
    }
    
    // Handle static assets - cache first
    if (request.destination === 'style' || 
        request.destination === 'script' || 
        request.destination === 'image' ||
        request.destination === 'font') {
        
        event.respondWith(
            caches.match(request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                return fetch(request).then(response => {
                    // Don't cache if not successful
                    if (!response || response.status !== 200) {
                        return response;
                    }
                    
                    const responseToCache = response.clone();
                    caches.open(RUNTIME_CACHE).then(cache => {
                        cache.put(request, responseToCache);
                    });
                    
                    return response;
                });
            })
        );
        return;
    }
    
    // Handle navigation requests - network first, fallback to offline page
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .catch(() => {
                    return caches.match('/offline.html');
                })
        );
        return;
    }
    
    // Default: try network, fallback to cache
    event.respondWith(
        fetch(request)
            .then(response => {
                const responseToCache = response.clone();
                caches.open(RUNTIME_CACHE).then(cache => {
                    cache.put(request, responseToCache);
                });
                return response;
            })
            .catch(() => {
                return caches.match(request);
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'sync-plays') {
        event.waitUntil(syncPlayHistory());
    }
});

// Sync play history when back online
async function syncPlayHistory() {
    try {
        // Get pending plays from IndexedDB
        const db = await openDatabase();
        const plays = await getPendingPlays(db);
        
        if (plays.length > 0) {
            await fetch('/api/sync-plays', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ plays })
            });
            
            // Clear synced plays
            await clearPendingPlays(db);
        }
    } catch (error) {
        console.error('Sync failed:', error);
        throw error; // Retry later
    }
}

// Helper functions for IndexedDB
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TesotunesDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('pendingPlays')) {
                db.createObjectStore('pendingPlays', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

function getPendingPlays(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['pendingPlays'], 'readonly');
        const store = transaction.objectStore('pendingPlays');
        const request = store.getAll();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

function clearPendingPlays(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['pendingPlays'], 'readwrite');
        const store = transaction.objectStore('pendingPlays');
        const request = store.clear();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}
