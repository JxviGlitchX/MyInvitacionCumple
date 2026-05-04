const CACHE_NAME = "invitacion-javier-v1";
const URLS_A_CACHAR = ["/", "/index.html"];

/* Instalar */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_A_CACHAR))
  );
  self.skipWaiting();
});

/* Activar */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* Fetch: servir desde cache primero */
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        /* Cachear respuestas exitosas */
        if (response.status === 200 && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    }).catch(() => {
      return caches.match("/");
    })
  );
});

/* Recibir notificaciones push (futuro, si agregas backend push) */
self.addEventListener("push", (event) => {
  const data = event.data?.json() || { title: "Fiesta de Javier", body: "Nueva actividad" };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [200, 100, 200],
    })
  );
});

/* Al tocar la notificación, abrir la app */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      if (clients.length > 0) {
        clients[0].focus();
        return;
      }
      return self.clients.openWindow("/");
    })
  );
});