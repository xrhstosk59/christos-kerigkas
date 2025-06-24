// public/sw.js - Service Worker for Progressive Web App
const CACHE_NAME = 'christos-kerigkas-v1';
const STATIC_CACHE_NAME = 'static-v1';
const DYNAMIC_CACHE_NAME = 'dynamic-v1';
const IMAGES_CACHE_NAME = 'images-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/cv',
  '/blog',
  '/offline',
  '/manifest.json',
  '/next.svg',
  '/file.svg',
  '/globe.svg',
  '/vercel.svg',
  '/window.svg'
];

// API routes to cache
const API_CACHE_PATTERNS = [
  /^\/api\/blog$/,
  /^\/api\/projects$/,
  /^\/api\/certifications$/
];

// Image file extensions to cache
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|avif|svg|ico)$/i;

// Maximum cache sizes
const MAX_CACHE_SIZE = {
  [STATIC_CACHE_NAME]: 50,
  [DYNAMIC_CACHE_NAME]: 100,
  [IMAGES_CACHE_NAME]: 200
};

// Maximum cache age (in days)
const MAX_CACHE_AGE = {
  [STATIC_CACHE_NAME]: 30,
  [DYNAMIC_CACHE_NAME]: 7,
  [IMAGES_CACHE_NAME]: 30
};

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        const validCacheNames = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, IMAGES_CACHE_NAME];
        
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!validCacheNames.includes(cacheName)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - handle all network requests
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests (except for same-origin API calls)
  if (url.origin !== location.origin) {
    return;
  }
  
  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (IMAGE_EXTENSIONS.test(url.pathname)) {
    event.respondWith(handleImageRequest(request));
  } else if (url.pathname.startsWith('/_next/')) {
    event.respondWith(handleStaticAsset(request));
  } else {
    event.respondWith(handleNavigationRequest(request));
  }
});

/**
 * Handle API requests with cache-first strategy for GET requests
 */
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Check if this API route should be cached
  const shouldCache = API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
  
  if (!shouldCache) {
    return fetch(request);
  }
  
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Check if cache is still valid
      const cacheDate = new Date(cachedResponse.headers.get('date'));
      const now = new Date();
      const cacheAge = (now - cacheDate) / (1000 * 60 * 60 * 24); // days
      
      if (cacheAge < MAX_CACHE_AGE[DYNAMIC_CACHE_NAME]) {
        console.log('[SW] Serving API from cache:', request.url);
        
        // Fetch in background to update cache
        fetch(request)
          .then(response => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
          })
          .catch(() => {}); // Ignore background fetch errors
        
        return cachedResponse;
      }
    }
    
    // Fetch from network
    const response = await fetch(request);
    
    if (response.ok) {
      await cache.put(request, response.clone());
      await limitCacheSize(DYNAMIC_CACHE_NAME, MAX_CACHE_SIZE[DYNAMIC_CACHE_NAME]);
    }
    
    return response;
  } catch (error) {
    console.error('[SW] API request failed:', error);
    
    // Try to serve from cache as fallback
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for failed API calls
    return new Response(
      JSON.stringify({ error: 'Offline - data not available' }), 
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Handle image requests with cache-first strategy
 */
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGES_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Serving image from cache:', request.url);
      return cachedResponse;
    }
    
    const response = await fetch(request);
    
    if (response.ok) {
      await cache.put(request, response.clone());
      await limitCacheSize(IMAGES_CACHE_NAME, MAX_CACHE_SIZE[IMAGES_CACHE_NAME]);
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Image request failed:', error);
    
    // Return a placeholder image for failed image requests
    return new Response(
      '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" fill="#666">Image Unavailable</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

/**
 * Handle static assets (_next/ files) with cache-first strategy
 */
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const response = await fetch(request);
    
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Static asset request failed:', error);
    throw error;
  }
}

/**
 * Handle navigation requests with network-first strategy
 */
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      await cache.put(request, response.clone());
      await limitCacheSize(DYNAMIC_CACHE_NAME, MAX_CACHE_SIZE[DYNAMIC_CACHE_NAME]);
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Navigation request failed:', error);
    
    // Try to serve from cache
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Serve offline page as fallback
    const offlineResponse = await cache.match('/offline');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Last resort: basic offline message
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Offline - Christos Kerigkas</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
            .offline { max-width: 400px; margin: 2rem auto; }
            .icon { font-size: 4rem; margin-bottom: 1rem; }
          </style>
        </head>
        <body>
          <div class="offline">
            <div class="icon">📱</div>
            <h1>You're Offline</h1>
            <p>Sorry, you need an internet connection to view this page. Please check your connection and try again.</p>
            <button onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
      </html>`,
      { 
        headers: { 'Content-Type': 'text/html' },
        status: 503
      }
    );
  }
}

/**
 * Limit cache size by removing oldest entries
 */
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    console.log(`[SW] Cache ${cacheName} exceeds limit, cleaning up...`);
    
    // Get cache dates and sort by oldest first
    const cacheEntries = await Promise.all(
      keys.map(async (key) => {
        const response = await cache.match(key);
        return {
          key,
          date: new Date(response.headers.get('date') || 0)
        };
      })
    );
    
    cacheEntries.sort((a, b) => a.date - b.date);
    
    // Delete oldest entries
    const toDelete = cacheEntries.slice(0, keys.length - maxSize);
    await Promise.all(
      toDelete.map(entry => cache.delete(entry.key))
    );
    
    console.log(`[SW] Cleaned up ${toDelete.length} entries from ${cacheName}`);
  }
}

/**
 * Background sync for failed requests
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic if needed
  console.log('[SW] Performing background sync...');
}

/**
 * Push notification handling
 */
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }
  
  const data = event.data.json();
  console.log('[SW] Push notification received:', data);
  
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    data: data.data,
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/**
 * Notification click handling
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event);
  
  event.notification.close();
  
  if (event.action) {
    // Handle action buttons
    console.log('[SW] Notification action clicked:', event.action);
  } else {
    // Handle notification body click
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
      self.clients.matchAll({ type: 'window' })
        .then((clientList) => {
          // Check if there's already a window open
          for (const client of clientList) {
            if (client.url.includes(urlToOpen) && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Open new window
          if (self.clients.openWindow) {
            return self.clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

/**
 * Message handling from the main thread
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    });
  }
});

console.log('[SW] Service worker script loaded');