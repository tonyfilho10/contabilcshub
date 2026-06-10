import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createClient } from "@/lib/supabase/server"

export async function GET(_req: NextRequest) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return jsonRes({ error: "Não autenticado" }, 401)
  const { data, error } = await sb
    .from("pastas_anotacoes").select("*").eq("usuarioId", user.id).order("nome")
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data ?? [])
}

export async function POST(req: NextRequest) {
  const { nome, cor } = await req.json()
  if (!nome?.trim()) return jsonRes({ error: "nome é obrigatório" }, 400)
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return jsonRes({ error: "Não autenticado" }, 401)
  const { data, error } = await sb
    .from("pastas_anotacoes")
    .insert({ id: crypto.randomUUID(), nome: nome.trim(), cor: cor ?? "#f97316", usuarioId: user.id })
    .select()
    .single()
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data, 201)
}
