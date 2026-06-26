import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createServiceClient } from "@/lib/supabase/service"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const responsavelId = searchParams.get("responsavelId")

  const sb = createServiceClient()
  let query = sb.from("tarefas").select("*").order("prazo", { ascending: true })
  if (responsavelId) query = query.eq("responsavelId", responsavelId)

  const { data, error } = await query
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data ?? [])
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { descricao, responsavelId, prazo, contexto, decisaoId } = body
  if (!descricao?.trim()) return jsonRes({ error: "Descrição obrigatória" }, 400)
  if (!responsavelId)     return jsonRes({ error: "Responsável obrigatório" }, 400)
  if (!prazo)             return jsonRes({ error: "Prazo obrigatório" }, 400)
  if (!contexto?.trim())  return jsonRes({ error: "Contexto obrigatório" }, 400)

  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()

  const sbs = createServiceClient()
  const { data, error } = await sbs
    .from("tarefas")
    .insert({ descricao: descricao.trim(), responsavelId, prazo, contexto: contexto.trim(), decisaoId: decisaoId ?? null, criadoPor: user?.id ?? "sistema" })
    .select().single()
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data, 201)
}
