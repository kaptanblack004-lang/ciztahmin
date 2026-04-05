const CACHE_NAME = 'ciztahmin-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/game.js',
  '/style.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap'
];

// Kurulum - cache'e al
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Aktivasyon - eski cache'leri temizle
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - önce network, yoksa cache
self.addEventListener('fetch', e => {
  // Socket.io isteklerini bypass et
  if (e.request.url.includes('/socket.io/')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Başarılı ağ isteğini cache'e de kaydet
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
