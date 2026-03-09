const CACHE_NAME = 'chess-clock-v2';
const ASSETS = [
  '/tools/chess-clock-timer/',
  '/tools/chess-clock-timer/index.html',
  '/tools/chess-clock-timer/page.css',
  '/tools/chess-clock-timer/app.js',
  '/tools/chess-clock-timer/manifest.json',
  '/tools/chess-clock-timer/og-image.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then((cached) => cached || fetch(e.request)));
});
