"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"

export function PwaRegister() {
  const asked = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return
    if (asked.current) return
    asked.current = true

    async function setup() {
      try {
        // 1. Registra o service worker
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" })
        await navigator.serviceWorker.ready

        // 2. Pede permissão para notificações (apenas uma vez)
        const permission = await Notification.requestPermission()
        if (permission !== "granted") return

        // 3. Verifica se já tem subscription ativa
        const existing = await reg.pushManager.getSubscription()
        if (existing) {
          await saveSubscription(existing)
          return
        }

        // 4. Cria nova subscription
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ),
        })

        await saveSubscription(sub)
      } catch (err) {
        console.warn("[PWA] Falha ao registrar push:", err)
      }
    }

    setup()
  }, [])

  return null
}

async function saveSubscription(sub: PushSubscription) {
  const json = sub.toJSON()
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: sub.endpoint,
      keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
    }),
  })
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}
