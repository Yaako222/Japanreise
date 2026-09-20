/* Service Worker für die Handy-Mitteilungen der BOH Japanreise. */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "BOH Japanreise", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "BOH Japanreise";
  // Wichtige Nachrichten vibrieren kräftiger und länger.
  const vibrate = data.urgent
    ? [400, 150, 400, 150, 400, 150, 600]
    : [200, 100, 200];
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: data.tag || undefined,
      renotify: Boolean(data.tag),
      vibrate,
      requireInteraction: Boolean(data.urgent),
      data: { url: data.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
