import webpush from "web-push"
import { supabaseAdmin } from "./supabase-admin"

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

interface PushPayload {
  titulo: string
  mensagem?: string
  referenciaId?: string
  url?: string
}

export async function enviarPushParaUsuarios(
  usuarioIds: string[],
  payload: PushPayload
) {
  if (!usuarioIds.length) return

  const { data: subs } = await supabaseAdmin()
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .in("usuarioId", usuarioIds)

  if (!subs?.length) return

  const body = JSON.stringify(payload)

  await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        body
      ).catch(() => {
        // Subscription expirada — remove silenciosamente
        supabaseAdmin().from("push_subscriptions").delete().eq("endpoint", sub.endpoint)
      })
    )
  )
}
