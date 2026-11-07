/* Flaredrift service worker.
 * BUILD and PRECACHE are rewritten at build time by site/vite-plugin.mjs.
 * The values below are safe development defaults. */
const BUILD = "dev";
const PRECACHE = ["/offline.html"];

const PREFIX = 'flaredrift';
const PRECACHE_NAME = `${PREFIX}-precache-${BUILD}`;
const RUNTIME_NAME = `${PREFIX}-runtime-v1`;
const FONTS_NAME = `${PREFIX}-fonts-v1`;
const KEEP = [PRECACHE_NAME, RUNTIME_NAME, FONTS_NAME];

const OFFLINE_URL = '/offline.html';
const PAGES = ['/', '/ventures/', '/vision/'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const NAV_TIMEOUT_MS = 6000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE_NAME).then((cache) =>
      Promise.all(
        PRECACHE.map(async (url) => {
          const response = await fetch(new Request(url, { cache: 'reload' }));
          if (!response.ok) throw new Error(`Precache failed: ${url} (${response.status})`);
          await cache.put(url, response);
        })
      )
    )
  );
  // The new worker waits until the page asks for it (see SKIP_WAITING below),
  // so a visitor is never switched to a new version mid-session.
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((n) => n.startsWith(`${PREFIX}-`) && !KEEP.includes(n)).map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || request.headers.has('range')) return;

  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    // Never intercept the worker itself or any API route.
    if (url.pathname === '/sw.js' || url.pathname.startsWith('/api/')) return;
    if (request.mode === 'navigate') {
      event.respondWith(navigate(request, url));
    } else {
      event.respondWith(asset(request, url));
    }
    return;
  }

  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request, FONTS_NAME));
  }
  // Everything else cross-origin (other sites, analytics, APIs) goes straight to the network.
});

function pageKey(url) {
  let path = url.pathname.replace(/index\.html$/, '');
  if (!path.endsWith('/')) path += '/';
  return path;
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); }
    );
  });
}

// Network-first: HTML is always fetched fresh when online. The cache is only a fallback.
async function navigate(request, url) {
  const key = pageKey(url);
  const known = PAGES.includes(key);
  const cache = await caches.open(PRECACHE_NAME);
  const cached = known ? await cache.match(key) : undefined;

  try {
    const network = fetch(request);
    const response = cached ? await withTimeout(network, NAV_TIMEOUT_MS) : await network;
    if (known && response.status === 200 && response.type === 'basic') {
      const type = response.headers.get('content-type') || '';
      if (type.includes('text/html')) cache.put(key, response.clone());
    }
    return response;
  } catch (error) {
    if (cached) return cached;
    const offline = await cache.match(OFFLINE_URL);
    if (offline) return offline;
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

// Hashed or version-stamped files never change: cache-first. Everything else: stale-while-revalidate.
function isImmutable(url) {
  return url.pathname.startsWith('/assets/') || url.searchParams.has('v');
}

async function asset(request, url) {
  if (isImmutable(url)) {
    const precache = await caches.open(PRECACHE_NAME);
    const hit = await precache.match(request);
    if (hit) return hit;
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') precache.put(request, response.clone());
    return response;
  }
  return staleWhileRevalidate(request, RUNTIME_NAME, PRECACHE_NAME);
}

async function staleWhileRevalidate(request, cacheName, lookupFirst) {
  const cache = await caches.open(cacheName);
  let hit;
  let hitCache = cache;
  if (lookupFirst) {
    const first = await caches.open(lookupFirst);
    hit = await first.match(request);
    if (hit) hitCache = first;
  }
  if (!hit) hit = await cache.match(request);

  const refresh = fetch(request)
    .then((response) => {
      // Opaque (cross-origin font) responses are fine to keep; errors are not.
      if (response && (response.ok || response.type === 'opaque')) hitCache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);

  if (hit) return hit;
  const response = await refresh;
  return response || new Response('', { status: 504, statusText: 'Offline' });
}
