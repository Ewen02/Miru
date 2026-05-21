/* eslint-disable no-restricted-globals */
// Miru service worker. Currently scoped to Web Push delivery only.
// No precaching or offline support — those would require build-time injection.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: event.data.text(), body: null, url: null, icon: null };
  }

  const title = payload.title || "Miru";
  const options = {
    body: payload.body || undefined,
    icon: payload.icon || "/icon.svg",
    badge: "/icon.svg",
    data: { url: payload.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const win of wins) {
        if (win.url.endsWith(url) && "focus" in win) return win.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
