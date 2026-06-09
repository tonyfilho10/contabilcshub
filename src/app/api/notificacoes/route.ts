import { NextResponse } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return jsonRes({ error: "Não autenticado" }, 401)

  const { data, error } = await supabase
    .from("notificacoes")
    .select("*")
    .eq("usuarioId", user.id)
    .order("criadoEm", { ascending: false })

  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data ?? [])
}

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return jsonRes({ error: "Não autenticado" }, 401)

  const { error } = await supabase.from("notificacoes").delete().eq("usuarioId", user.id)
  if (error) return jsonRes({ error: error.message }, 500)
  return new NextResponse(null, { status: 204 })
}
