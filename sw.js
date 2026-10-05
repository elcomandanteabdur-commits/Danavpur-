const VERSION = "dnv-v1";
const SHELL = ["./","index.html","realms.html","pantheon.html","danavs.html","artifacts.html","history.html","conflicts.html","map.html","cosmology.html","membership.html","about.html","offline.html","main.css","main.js","ui.js","membership.js","firebase.js","manifest.json","logo.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return; // Firebase/Firestore + fonts: never cached here (no stale counts)
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(VERSION).then(c => c.put(r, cp)); return res; }).catch(() => caches.match(r).then(m => m || caches.match("offline.html"))));
    return;
  }
  e.respondWith(caches.match(r).then(m => { const n = fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(VERSION).then(c => c.put(r, cp)); } return res; }).catch(() => m); return m || n; }));
});
