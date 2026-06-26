import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createServiceClient } from "@/lib/supabase/service"

export async function GET() {
  const sb = createServiceClient()
  const { data, error } = await sb.from("indicadores").select("*, medicoes(*)")
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data ?? [])
}

export async function POST(req: NextRequest) {
  const { nome, cluster, responsavelId, meta, unidade } = await req.json()
  if (!nome?.trim())   return jsonRes({ error: "Nome obrigatório" }, 400)
  if (!cluster)        return jsonRes({ error: "Cluster obrigatório" }, 400)
  if (!responsavelId)  return jsonRes({ error: "Responsável obrigatório" }, 400)
  const sb = createServiceClient()
  const { data, error } = await sb.from("indicadores").insert({ nome: nome.trim(), cluster, responsavelId, meta: Number(meta) || 0, unidade: unidade ?? "" }).select().single()
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data, 201)
}
