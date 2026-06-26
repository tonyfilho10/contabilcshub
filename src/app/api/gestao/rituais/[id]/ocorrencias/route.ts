import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createServiceClient } from "@/lib/supabase/service"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: ritualId } = await params
  const { data: dataOcorrencia, ata, facilitadorId } = await req.json()
  if (!dataOcorrencia) return jsonRes({ error: "Data obrigatória" }, 400)
  const sb = createServiceClient()
  const { data, error } = await sb.from("ocorrencias").insert({ ritualId, data: dataOcorrencia, ata: ata ?? null, facilitadorId: facilitadorId ?? null }).select().single()
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data, 201)
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ocorrenciaId = searchParams.get("ocorrenciaId")
  if (!ocorrenciaId) return jsonRes({ error: "ocorrenciaId obrigatório" }, 400)
  const { ata } = await req.json()
  const sb = createServiceClient()
  const { data, error } = await sb.from("ocorrencias").update({ ata }).eq("id", ocorrenciaId).select().single()
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data)
}
