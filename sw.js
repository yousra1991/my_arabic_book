// Network first, cache as fallback (so the book opens offline on an activated device).
const CACHE = "bustan-protected-v2";
const ASSETS = ["./", "index.html", "config.js", "book.enc", "manifest.json", "fonts/Amiri-Regular.ttf", "fonts/Amiri-Bold.ttf",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;   // never cache the license server
  e.respondWith(fetch(e.request).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res;
  }).catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match("index.html"))));
});
