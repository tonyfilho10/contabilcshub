import { NextResponse } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createClient } from "@/lib/supabase/server"

export async function PATCH() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return jsonRes({ error: "Não autenticado" }, 401)

  const { error } = await supabase
    .from("notificacoes")
    .update({ lida: true })
    .eq("usuarioId", user.id)
    .eq("lida", false)

  if (error) return jsonRes({ error: error.message }, 500)
  return new NextResponse(null, { status: 204 })
}
