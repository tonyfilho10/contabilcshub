import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { createClient } from "@/lib/supabase/server"

/** PATCH /api/notificacoes/[id] — marca como lida */
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return jsonRes({ error: "Não autenticado" }, 401)

  const { data, error } = await supabaseAdmin()
    .from("notificacoes")
    .update({ lida: true })
    .eq("id", id)
    .eq("usuarioId", user.id)
    .select()
    .single()

  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data)
}

/** DELETE /api/notificacoes/[id] — apaga uma notificação */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return jsonRes({ error: "Não autenticado" }, 401)

  const { error } = await supabaseAdmin()
    .from("notificacoes")
    .delete()
    .eq("id", id)
    .eq("usuarioId", user.id)

  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes({ ok: true })
}
