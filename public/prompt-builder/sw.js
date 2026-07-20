const CACHE_NAME = 'prompt-builder-v5-onesheet-2026-07-20';
const ASSETS = [
  './manifest.json',
  './favicon.svg',
  './release-package/demo.mp4',
  './release-package/web-shots/builder-direct-mode.png',
  './release-package/PICS/showcase-creative-range-what-can-you-build.jpg',
  './release-package/PICS/audience-who-uses-prompt-builder.jpg',
  './release-package/PICS/preset-library-100-plus-catalog-infographic.jpg',
  './release-package/PICS/before-after-blank-box-to-chips.jpg',
  './release-package/PICS/one-scene-four-formats-model-comparison.jpg',
  './release-package/social-cards/post-launch.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isDocument = req.mode === 'navigate' ||
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('/prompt-builder.html');

  if (isDocument) {
    event.respondWith(
      fetch(req).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        }
        return response;
      }).catch(async () => (await caches.match(req)) || caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(response => response || fetch(req).then(networkResponse => {
      if (networkResponse && networkResponse.ok && url.origin === self.location.origin) {
        const copy = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      }
      return networkResponse;
    }))
  );
});
