import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const usuarioId = searchParams.get("usuarioId")
  const sb = supabaseAdmin()
  let q = sb.from("pastas_anotacoes").select("*").order("nome")
  if (usuarioId) q = q.eq("usuarioId", usuarioId)
  const { data, error } = await q
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data ?? [])
}

export async function POST(req: NextRequest) {
  const { nome, cor, usuarioId } = await req.json()
  if (!nome?.trim() || !usuarioId) return jsonRes({ error: "nome e usuarioId são obrigatórios" }, 400)
  const { data, error } = await supabaseAdmin()
    .from("pastas_anotacoes")
    .insert({ id: crypto.randomUUID(), nome: nome.trim(), cor: cor ?? "#f97316", usuarioId })
    .select()
    .single()
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data, 201)
}
