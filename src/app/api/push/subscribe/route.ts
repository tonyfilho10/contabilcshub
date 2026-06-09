import { NextRequest, NextResponse } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return jsonRes({ error: "Não autenticado" }, 401)

  const { endpoint, keys } = await req.json()
  if (!endpoint || !keys?.p256dh || !keys?.auth)
    return jsonRes({ error: "Dados de subscription inválidos" }, 400)

  const { error } = await supabaseAdmin()
    .from("push_subscriptions")
    .upsert(
      { usuarioId: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
      { onConflict: "endpoint" }
    )

  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return jsonRes({ error: "Não autenticado" }, 401)

  const { endpoint } = await req.json()
  await supabaseAdmin()
    .from("push_subscriptions")
    .delete()
    .eq("usuarioId", user.id)
    .eq("endpoint", endpoint)

  return new NextResponse(null, { status: 204 })
}
