import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createServiceClient } from "@/lib/supabase/service"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: reuniaoId } = await params
  const { descricao, responsavelId, prazo, contexto } = await req.json()
  if (!descricao?.trim()) return jsonRes({ error: "Descrição obrigatória" }, 400)
  if (!responsavelId)     return jsonRes({ error: "Responsável obrigatório" }, 400)
  if (!prazo)             return jsonRes({ error: "Prazo obrigatório" }, 400)
  if (!contexto?.trim())  return jsonRes({ error: "Contexto obrigatório" }, 400)

  const sb = createServiceClient()
  const { data, error } = await sb
    .from("decisoes")
    .insert({ reuniaoId, descricao: descricao.trim(), responsavelId, prazo, contexto: contexto.trim() })
    .select().single()
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data, 201)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { searchParams } = new URL(req.url)
  const decisaoId = searchParams.get("decisaoId")
  if (!decisaoId) return jsonRes({ error: "decisaoId obrigatório" }, 400)
  const sb = createServiceClient()
  const { error } = await sb.from("decisoes").delete().eq("id", decisaoId)
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes({ ok: true })
}
