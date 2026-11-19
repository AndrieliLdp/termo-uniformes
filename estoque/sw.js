// Service worker do app Uniformes: guarda só a "casca" do app (página, ícones, logo).
// Os dados sempre vêm da planilha, nunca do cache.
const CACHE = 'uniformes-v1';
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
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // API do Google: direto na rede
  // rede primeiro (pega sempre a versão nova); sem internet, usa o cache
  e.respondWith(
    fetch(e.request).then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request))
  );
});
