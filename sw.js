const CACHE_NAME = 'family-tree-v1';
const DATA_CACHE  = 'family-tree-data-v1';
const IMAGE_CACHE = 'family-tree-images-v1';

const CORE_FILES = [
  '/',
  '/index.html',
  '/data.json',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_FILES).catch(e => console.warn('[SW] cache miss:', e)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const valid = [CACHE_NAME, DATA_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !valid.includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.hostname === 'api.github.com') { event.respondWith(fetch(event.request)); return; }
  if (url.pathname.endsWith('data.json')) { event.respondWith(networkFirst(event.request, DATA_CACHE)); return; }
  if (url.pathname.startsWith('/images/')) { event.respondWith(cacheFirst(event.request, IMAGE_CACHE)); return; }
  event.respondWith(cacheFirst(event.request, CACHE_NAME));
});

async function networkFirst(req, cacheName) {
  try {
    const res = await fetch(req);
    if (res.ok) (await caches.open(cacheName)).put(req, res.clone());
    return res;
  } catch {
    return (await caches.match(req)) || new Response('{"error":"offline"}', { headers: { 'Content-Type': 'application/json' } });
  }
}

async function cacheFirst(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) (await caches.open(cacheName)).put(req, res.clone());
    return res;
  } catch { return new Response('', { status: 503 }); }
}

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'CLEAR_DATA_CACHE') caches.delete(DATA_CACHE).then(() => event.source?.postMessage('DATA_CACHE_CLEARED'));
});
