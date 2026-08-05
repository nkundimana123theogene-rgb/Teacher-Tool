const CACHE_NAME = 'nkorera-edu-v5';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

// Install event - Cache static assets robustly
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline essentials');
      const cachePromises = ASSETS_TO_CACHE.map((url) => {
        return cache.add(url).catch((err) => {
          console.warn(`[ServiceWorker] Failed to pre-cache asset ${url}:`, err);
        });
      });
      return Promise.all(cachePromises);
    }).then(() => self.skipWaiting())
  );
});

// Message event - handle manual sync, skipWaiting & clear cache triggers
self.addEventListener('message', (event) => {
  if (event.data) {
    if (event.data.action === 'SKIP_WAITING' || event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
    if (event.data.action === 'CLEAR_CACHE' || event.data.type === 'CLEAR_CACHE') {
      event.waitUntil(
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cache) => caches.delete(cache))
          );
        })
      );
    }
  }
});

// Activate event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Network first with cache fallback for navigation, Cache-first for assets
self.addEventListener('fetch', (event) => {
  // Ignore non-GET or chrome-extension / API proxy requests that need network
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If response is valid, clone and update cache. Supports basic, cors, and opaque requests.
        if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If network fails (offline), return cached version or main index.html for SPA route navigation
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // SPA fallback to offline index.html if navigating HTML page
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
