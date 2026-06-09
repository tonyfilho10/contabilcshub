/* Service Worker — CSHUB Contábil PWA */

self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()))

/* ── Push ──────────────────────────────────────────────── */
self.addEventListener("push", (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { titulo: "Nova notificação", mensagem: event.data.text() }
  }

  event.waitUntil(
    self.registration.showNotification(payload.titulo ?? "CSHUB Contábil", {
      body: payload.mensagem ?? "",
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-72.png",
      tag: payload.referenciaId ?? "cshub",
      data: { url: payload.url ?? "/" },
      vibrate: [200, 100, 200],
    })
  )
})

/* ── Clique na notificação ─────────────────────────────── */
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? "/"
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})
