// Service Worker for Smart Translator PWA
const CACHE_NAME = 'smart-translator-v1';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap'
];

// Install event - cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Failed to cache:', error);
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip API requests
    if (event.request.url.includes('openrouter.ai')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // Clone the request
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then(response => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response
                    const responseToCache = response.clone();
                    
                    // Cache the response
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                }).catch(() => {
                    // Offline fallback
                    if (event.request.destination === 'document') {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});

// Background sync for offline translations
self.addEventListener('sync', event => {
    if (event.tag === 'sync-translations') {
        event.waitUntil(syncTranslations());
    }
});

// Sync offline translations when back online
async function syncTranslations() {
    // This would sync any offline translations
    // For now, just log
    console.log('Syncing translations...');
}

// Handle messages from the app
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Push notifications (if needed in future)
self.addEventListener('push', function(event) {
    const options = {
        body: event.data ? event.data.text() : 'پیام جدید از مترجم هوشمند',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'مشاهده',
                icon: '/icon-96x96.png'
            },
            {
                action: 'close',
                title: 'بستن',
                icon: '/icon-96x96.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('مترجم هوشمند', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', function(event) {
    if (event.tag === 'content-sync') {
        event.waitUntil(
            // Sync translation history or other data
            syncTranslationData()
        );
    }
});

function syncTranslationData() {
    return new Promise(function(resolve) {
        console.log('Periodic sync triggered');
        // Implementation for syncing data
        resolve();
    });
} 