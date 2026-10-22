const CACHE_NAME = 'nkorera-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/pwa-icon.png'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Network-first falling back to cache so updates are immediate, but offline works)
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and local scope
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // CRITICAL: Bypass caching completely for development environments to prevent stale code and blank previews
  const isDev = self.location.hostname === 'localhost' || 
                self.location.hostname === '127.0.0.1' || 
                self.location.hostname.includes('-dev-');
  
  // NEVER cache backend API requests or Hot Module Replacement (HMR) websocket paths
  if (url.pathname.startsWith('/api/') || 
      url.pathname.includes('hot-update') || 
      url.pathname.includes('vite') ||
      isDev) {
    return; // Let the browser handle the fetch request directly without Service Worker interception
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache the response if it is valid
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if network is down
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If not in cache and it is a navigation request, return index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
