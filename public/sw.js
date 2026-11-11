const CACHE_NAME = 'rext-v5-live';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-First for everything! Never serve stale HTML or JS
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Never intercept API, YouTube, Google fonts, or dev requests
  if (
    url.pathname.startsWith('/api') ||
    url.hostname.includes('youtube') ||
    url.hostname.includes('google') ||
    url.hostname.includes('ytimg') ||
    url.hostname.includes('googlevideo') ||
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1'
  ) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const respClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, respClone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
