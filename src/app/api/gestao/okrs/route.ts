import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createServiceClient } from "@/lib/supabase/service"

export async function GET() {
  const sb = createServiceClient()
  const { data, error } = await sb.from("okrs").select("*, keyResults:key_results(*)").order("criadoEm", { ascending: false })
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data ?? [])
}

export async function POST(req: NextRequest) {
  const { titulo, tipo, cluster, responsavelId, ciclo } = await req.json()
  if (!titulo?.trim()) return jsonRes({ error: "Título obrigatório" }, 400)
  if (!tipo)           return jsonRes({ error: "Tipo obrigatório" }, 400)
  if (!responsavelId)  return jsonRes({ error: "Responsável obrigatório" }, 400)
  if (!ciclo?.trim())  return jsonRes({ error: "Ciclo obrigatório" }, 400)
  const sb = createServiceClient()
  const { data, error } = await sb.from("okrs").insert({ titulo: titulo.trim(), tipo, cluster: cluster ?? null, responsavelId, ciclo: ciclo.trim() }).select().single()
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data, 201)
}
