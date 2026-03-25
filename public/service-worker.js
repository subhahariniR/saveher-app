/* ═══════════════════════════════════════════════════════════════════
   SaveHer Service Worker — Full Offline Support
   Caches ALL app files so it works without any internet after install
   ═══════════════════════════════════════════════════════════════════ */

const CACHE_NAME = "saveher-v1";
const TILE_CACHE = "saveher-tiles-v1";

/* All app shell files to cache on install */
const APP_SHELL = [
  "/",
  "/index.html",
  "/static/js/main.chunk.js",
  "/static/js/bundle.js",
  "/static/js/vendors~main.chunk.js",
  "/static/css/main.chunk.css",
  "/manifest.json",
  "/logo.png",
  "/favicon.ico",
  "/siren.mp3",
  "/leaflet.js",
  "/leaflet.css",
  "/images/marker-icon.png",
  "/images/marker-icon-2x.png",
  "/images/marker-shadow.png",
];

/* ── Install: cache all app shell files ─────────────────────────── */
self.addEventListener("install", (event) => {
  console.log("[SaveHer SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SaveHer SW] Caching app shell");
      return cache.addAll(APP_SHELL.map(url => new Request(url, { cache: "reload" })));
    }).then(() => self.skipWaiting())
  );
});

/* ── Activate: remove old caches ────────────────────────────────── */
self.addEventListener("activate", (event) => {
  console.log("[SaveHer SW] Activating...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== TILE_CACHE)
          .map((k) => {
            console.log("[SaveHer SW] Removing old cache:", k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: serve from cache, fallback to network ───────────────── */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  /* Strategy 1 — Map tiles: Cache-first with network fallback
     Tiles are cached after first view, then work offline forever */
  if (url.hostname.includes("tile.openstreetmap.org")) {
    event.respondWith(
      caches.open(TILE_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request)
            .then((response) => {
              if (response.ok) cache.put(event.request, response.clone());
              return response;
            })
            .catch(() => {
              /* Return a blank gray tile when fully offline and not cached */
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#1e1220"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#7a5570" font-size="12" font-family="sans-serif">Offline</text></svg>',
                { headers: { "Content-Type": "image/svg+xml" } }
              );
            });
        })
      )
    );
    return;
  }

  /* Strategy 2 — App shell: Cache-first always (offline first) */
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => {
            /* For navigation requests, return the main app */
            if (event.request.mode === "navigate") {
              return caches.match("/index.html");
            }
          });
      })
    );
    return;
  }

  /* Strategy 3 — Everything else: Network with cache fallback */
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});