import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createServiceClient } from "@/lib/supabase/service"

export async function GET() {
  const sb = createServiceClient()
  const { data, error } = await sb.from("rituais").select("*, ocorrencias(*)").order("nome")
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data ?? [])
}

export async function POST(req: NextRequest) {
  const { nome, frequencia, duracaoMin, facilitadorId, participantesIds } = await req.json()
  if (!nome?.trim())     return jsonRes({ error: "Nome obrigatório" }, 400)
  if (!frequencia)       return jsonRes({ error: "Frequência obrigatória" }, 400)
  if (!facilitadorId)    return jsonRes({ error: "Facilitador obrigatório" }, 400)
  const sb = createServiceClient()
  const { data, error } = await sb.from("rituais").insert({ nome: nome.trim(), frequencia, duracaoMin: Number(duracaoMin) || 60, facilitadorId, participantesIds: participantesIds ?? [] }).select().single()
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data, 201)
}
