// Service Worker para Bucare Suite (Manejo de Notificaciones Push)

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Notificación push recibida (evento)', event);

  let data = {
    title: 'Bucare Suite',
    body: 'Nueva actualización en tu panel de control.',
    url: '/dashboard'
  };

  if (event.data) {
    try {
      data = event.data.json();
      console.log('[Service Worker] Datos JSON decodificados:', data);
    } catch (e) {
      data.body = event.data.text();
      console.log('[Service Worker] Payload no-JSON decodificado como texto:', data.body);
    }
  }

  const options = {
    body: data.body,
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard'
    }
  };

  console.log('[Service Worker] Lanzando showNotification con opciones:', options);

  event.waitUntil(
    self.registration.showNotification(data.title, options)
      .then(() => {
        console.log('[Service Worker] showNotification resuelto con éxito');
      })
      .catch((err) => {
        console.error('[Service Worker] Error en showNotification:', err);
      })
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notificación clickeada', event);
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      const targetUrl = event.notification.data?.url || '/dashboard';
      
      // Buscar si ya hay una pestaña abierta con esa URL y enfocarla
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Si no hay pestañas abiertas, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
