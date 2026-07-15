const CACHE_NAME = 'prompt-builder-v4-byok-hotfix-2026-07-15';
const ASSETS = [
  './',
  './index.html',
  './prompt-builder.html',
  './landing-bundle.jsx',
  './tweaks-panel.jsx',
  './manifest.json',
  './favicon.svg',
  './release-package/web-shots/landing-homepage.png',
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
  const req=event.request;
  const isJsx=req.url.includes('landing-bundle.jsx')||req.url.includes('tweaks-panel.jsx')||req.url.includes('index.html');
  if(isJsx){
    event.respondWith(fetch(req).then(r=>{ const c=r.clone(); caches.open(CACHE_NAME).then(cache=>cache.put(req,c)); return r; }).catch(()=>caches.match(req)));
  }else{
    event.respondWith(caches.match(req).then(response=>response||fetch(req)));
  }
});
