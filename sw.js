self.addEventListener('install', (e) => {
  console.log('Service Worker instalado!');
});

self.addEventListener('fetch', (e) => {
  // Isso permite que o app funcione offline
  e.respondWith(fetch(e.request));
});