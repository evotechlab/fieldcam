const CACHE_NAME = 'fieldcam-offline-v3'; 
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './om.html',
  './quality.html',
  './cantieri.js',
  './manifest.json',
  './icon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // Gestiamo solo i file della nostra app (su GitHub) per evitare conflitti con Dropbox/Worker
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    // IL TRUCCO MAGICO: { cache: 'no-store' }
    // Ordina al browser del telefono di ignorare la sua memoria testarda e di scaricare SEMPRE il file reale
    fetch(event.request, { cache: 'no-store' })
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          // Rete presente: aggiorniamo la cassaforte offline con l'ultimo file appena scaricato
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Operatore offline in cantiere: la rete fallisce, peschiamo il file dalla cassaforte!
        console.log('[Service Worker] Connessione assente: caricamento file dalla cache locale.');
        return caches.match(event.request);
      })
  );
});
