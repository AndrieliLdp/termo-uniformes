// Service worker do app Showroom: guarda só a "casca" do app. Os dados sempre vêm da planilha.
const CACHE = 'showroom-v1';
const CASCA = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', '../logo.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CASCA)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request))
  );
});
// Toque no aviso → abre/foca o app na lista de visitas
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    const c = cs.find(x => x.url.includes('/showroom/'));
    if (c) { c.postMessage({ abrir: true }); return c.focus(); }
    return self.clients.openWindow('./');
  }));
});
