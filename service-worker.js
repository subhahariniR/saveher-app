/* SaveHer Service Worker v3 — Complete Offline Support */

const CACHE      = "saveher-v3";
const TILE_CACHE = "saveher-tiles-v3";
const BASE = self.location.pathname.replace(/\/service-worker\.js$/, "") || "";

const SHELL = [
  BASE + "/",
  BASE + "/index.html",
  BASE + "/manifest.json",
  BASE + "/logo.png",
  BASE + "/favicon.ico",
  BASE + "/siren.mp3",
  BASE + "/leaflet.js",
  BASE + "/leaflet.css",
  BASE + "/images/marker-icon.png",
  BASE + "/images/marker-icon-2x.png",
  BASE + "/images/marker-shadow.png",
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL.map(url => new Request(url, { cache: "reload" }))))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== TILE_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  if (url.hostname.includes("tile.openstreetmap.org")) {
    e.respondWith(
      caches.open(TILE_CACHE).then(cache =>
        cache.match(e.request).then(cached => {
          if (cached) return cached;
          return fetch(e.request, { mode: "cors" })
            .then(res => { if (res.ok) cache.put(e.request, res.clone()); return res; })
            .catch(() => new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#1e1220"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#7a5570" font-size="14" font-family="sans-serif">Map offline — view once online</text></svg>',
              { headers: { "Content-Type": "image/svg+xml" } }
            ));
        })
      )
    );
    return;
  }

  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request)
          .then(res => {
            if (res.ok && e.request.method === "GET") {
              caches.open(CACHE).then(c => c.put(e.request, res.clone()));
            }
            return res;
          })
          .catch(() => {
            if (e.request.mode === "navigate") {
              return caches.match(BASE + "/index.html") || caches.match("/index.html");
            }
          });
      })
    );
    return;
  }

  e.respondWith(fetch(e.request).catch(() => new Response("", { status: 503 })));
});

self.addEventListener("message", e => { if (e.data === "skipWaiting") self.skipWaiting(); });