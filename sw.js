const C = "swimlens-v1";
const SHELL = ["./", "index.html", "manifest.json", "icon.svg"];
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  const cdn = /jsdelivr\.net|storage\.googleapis\.com/.test(u.host);
  const own = u.origin === location.origin;
  if (!cdn && !own) return;
  const store = r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return r; };
  if (own) { e.respondWith(fetch(e.request).then(store).catch(() => caches.match(e.request))); }
  else { e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(store))); }
});
