// Cambia il versioning nei futuri aggiornamenti
const CACHE_NAME = 'fieldcam-offline-v9';

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './om.html',          
    './quality.html',     
    './manifest.json',
    './cantieri.js,
    './icon.png'
    
];

self.addEventListener('install', (event) => {
    // skipWaiting forza l'attivazione immediata del nuovo Service Worker
    self.skipWaiting(); 
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            console.log('[Service Worker] Salvataggio asset locali...');
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
                        console.log('[Service Worker] Eliminazione vecchia cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Prende il controllo immediato della pagina
    );
});

self.addEventListener('fetch', (event) => {
    // Ignora le richieste POST (come l'invio foto) o chiamate esterne
    if (event.request.method !== 'GET') return;
    if (event.request.url.includes('workers.dev')) return;

    event.respondWith(
        // STRATEGIA: NETWORK-FIRST
        // 1. Prova prima a scaricare il file aggiornato da internet
        fetch(event.request).then((networkResponse) => {
            
            // Se la rete risponde correttamente (200), aggiorniamo la cache 
            if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
            }
            // Mostra all'utente la versione appena scaricata
            return networkResponse;
            
        }).catch(() => {
            // 2. FALLBACK OFFLINE
            // Se la rete fallisce (niente segnale nel cantiere), pesca il file dalla memoria
            console.log('[Service Worker] Rete assente, carico dalla cache:', event.request.url);
            return caches.match(event.request);
        })
    );
});
