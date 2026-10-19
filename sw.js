/* NetLab web: guarda la propia página para abrirla sin conexión. Nunca intercepta las pruebas de red. */
const CACHE = "netlab-web-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./netlab-web/icons/icon-192.png", "./netlab-web/icons/icon-512.png", "./netlab-web/icons/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== self.location.origin) return; // las pruebas hacia Internet pasan directo
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(r, { ignoreSearch: true });
    const net = fetch(r).then(res => { if (res && res.ok) c.put(r, res.clone()); return res; }).catch(() => null);
    return hit || (await net) || (r.mode === "navigate" ? c.match("./index.html") : Response.error());
  }));
});
