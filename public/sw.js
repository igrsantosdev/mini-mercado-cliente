// public/sw.js - Service Worker para PWA
const CACHE_NAME = 'orlando-v1.0.0';
const STATIC_CACHE = 'orlando-static-v1.0.0';
const DYNAMIC_CACHE = 'orlando-dynamic-v1.0.0';

// Recursos para cache offline
const urlsToCache = [
  '/',
  '/login',
  '/catalogo',
  '/fiados',
  '/manifest.json',
];

// Install - cachear recursos estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static files');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate - limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name !== STATIC_CACHE && name !== DYNAMIC_CACHE;
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  return self.clients.claim();
});

// Fetch - estratégia Network First com fallback para Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições de extensões do Chrome
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Estratégia para APIs (Network First)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone e cache a resposta
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback para cache se offline
          return caches.match(request);
        })
    );
    return;
  }

  // Estratégia para páginas e assets (Cache First com Network Fallback)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Retorna do cache mas busca atualização em background
        fetch(request)
          .then((response) => {
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, response);
            });
          })
          .catch(() => {});
        return cachedResponse;
      }

      // Não está no cache, busca da rede
      return fetch(request)
        .then((response) => {
          // Cache a resposta para próxima vez
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Offline e sem cache - retorna página offline se tiver
          return caches.match('/');
        });
    })
  );
});

// Background Sync (opcional - para sincronizar dados quando voltar online)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-fiados') {
    event.waitUntil(
      // Lógica de sincronização
      Promise.resolve()
    );
  }
});

// Push Notifications (opcional - para notificar clientes)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Orlando Mercado';
  const options = {
    body: data.body || 'Nova notificação',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
